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
// .env에 있는 키=값으로 지정되어 있는 데이터를 환경변수에 주입해주는 라이브러리

// https://www.npmjs.com/package/express
// https://github.com/expressjs/express
// https://expressjs.com/ko/
const express = require("express");

// npmjs.com/package/@google/genai
// npm i @google/genai
const { GoogleGenAI } = require("@google/genai");

const app = express();
const PORT = 3001; // node 3xxx. 5xxx (python). java 8xxx
// 겹치면 기존 실행 포트가 이김 (충돌 시 신규가 실행 X)

//SDK
const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

//POSTMAN -> localhost:3001
app.listen(PORT, () => {
  console.log(`${PORT}(으)로 작동중`);
});
