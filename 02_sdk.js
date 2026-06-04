// npx nodemon 02_sdk.js
// package.json -> script
/*
{
  "scripts": {
    "01": "nodemon 01_express.js",
    "02": "nodemon 02_sdk.js"
  }
}
*/
// npm run 02

// npm i dotenv
require("dotenv").config();
// .env 파일에 있는 키=값 으로 지정되어 있는 데이터를
// 환경변수에 주입해주는 라이브러리.

// https://www.npmjs.com/package/express
// https://github.com/expressjs/express
// https://expressjs.com/ko/
const express = require("express");
// https://www.npmjs.com/package/@google/genai
// npm i @google/genai
const { GoogleGenAI } = require("@google/genai");
// npm i groq-sdk
// https://www.npmjs.com/package/groq-sdk
const Groq = require("groq-sdk");

const app = express();
const PORT = 3001; // node 3xxx. 5xxx (python). java 8xxx
// 겹치면 기존 실행 포트가 이김 (충돌 시 신규가 실행 X)

// SDK
// API key should be set when using the Gemini API.
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.get("/", async (req, res) => {
  const modelName = "gemma-4-31b-it";
  const result = await genAI.models.generateContent({
    model: modelName,
    contents: "점심 메뉴 추천해줘",
  });
  res.json({
    answer: result.text,
  });
});

app.get("/groq", async (req, res) => {
  const modelName = "openai/gpt-oss-120b";
  const result = await groq.chat.completions.create({
    messages: [{ role: "user", content: "점심 메뉴 추천해줘" }],
    model: modelName,
  });
  console.log(JSON.stringify(result));
  res.json({
    answer: result.choices[0].message.content,
    // 이렇게 응답이 복잡한 건 -> langchainjs 쓰면 간결하게 볼 수 있음
  });
});

// POSTMAN -> localhost:3001
app.listen(PORT, () => {
  console.log(`${PORT}(으)로 작동중`);
});
