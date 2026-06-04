// 환경변수 불러오기
require("dotenv").config();
// .env -> 환경변수에 주입
// npm run 03
// injected env (2) from .env

// 의존성
const express = require("express");
const { GoogleGenAI } = require("@google/genai");
const Groq = require("groq-sdk");

// 전역변수
const PORT = 3434;
const app = express();
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const groqAI = new Groq({ apiKey: process.env.GROQ_API_KEY });

// 미들웨어
app.use(express.json()); // body의 json 해석

// 대화
app.post("/chat/gen", async (req, res) => {
  // const { body } = req;
  const { ask = "질문 없음", model = "gemma-4-26b-a4b-it" } = req.body; // default를 준 상황
  //   console.log("body", body);
  console.log("ask", ask);
  const response = await genAI.models.generateContent({
    model,
    contents: ask,
  });
  //   res.json({ msg: "GoogleGenAI" });
  res.json({ answer: response.text });
});

app.post("/chat/groq", async (req, res) => {
  const { ask = "질문 없음", model = "openai/gpt-oss-120b" } = req.body; // default를 준 상황
  //   console.log("body", body);
  console.log("ask", ask);
  const response = await groqAI.chat.completions.create({
    messages: [{ role: "user", content: ask }],
    model,
  });
  //   res.json({ msg: "GroqAI" });
  res.json({ msg: response.choices[0].message.content });
});

// 서버 활성화 (연결할 포트 지정)
app.listen(PORT, () => {
  console.log(`${PORT}로 연결됨`);
});
