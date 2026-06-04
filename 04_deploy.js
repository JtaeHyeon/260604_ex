// 의존성
require("dotenv").config();
const express = require("express");
const path = require("path");
const { GoogleGenAI } = require("@google/genai");
const GroqAI = require("groq-sdk");

// 전역변수
const app = express();
const { GEMINI_API_KEY, GROQ_API_KEY, PORT } = process.env;
const google = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
const groq = new GroqAI({ apiKey: GROQ_API_KEY });

app.use(express.json());

// 파일들에 대한 접근을 /public에 대해서 열어두겠다 (/public은 제외한 뒤에 경로들)
app.use(express.static(path.join(__dirname, "public")));

app.post("/chat", async (req, res) => {
  const { provider, model, messages } = req.body;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    if (provider === "google") {
      console.log("google 제공자 요청");
      await streamGoogle(model, messages, res);
    } else if (provider === "groq") {
      console.log("groq 제공자 요청");
      await streamGroq(model, messages, res);
    } else {
      console.log("잘못된 Provider");
      res.write(`data: ${JSON.stringify({ error: "존재하지 않는 Provider" })}\n\n`);
    }
  } catch (err) {
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
  }

  res.write("data: [DONE]\n\n");
  res.end();
});

async function streamGoogle(model, messages, res) {
  // Google은 role이 "user"/"model", OpenAI 호환은 "user"/"assistant"
  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));
  const stream = await google.models.generateContentStream({ model, contents });
  for await (const chunk of stream) {
    if (chunk.text) {
      res.write(`data: ${JSON.stringify({ chunk: chunk.text })}\n\n`);
    }
  }
}

async function streamGroq(model, messages, res) {
  const stream = await groq.chat.completions.create({ model, messages, stream: true });
  for await (const chunk of stream) {
    const text = chunk.choices[0]?.delta?.content || "";
    if (text) {
      res.write(`data: ${JSON.stringify({ chunk: text })}\n\n`);
    }
  }
}

app.listen(PORT, () => {
  console.log(`${PORT}에서 실행`);
});



