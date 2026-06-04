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

// https://www.npmjs.com/package/express
// https://github.com/expressjs/express
// https://expressjs.com/ko/
const express = require("express");
const app = express();
const PORT = 3001; // node 3xxx. 5xxx (python). java 8xxx
// 겹치면 기존 실행 포트가 이김 (충돌 시 신규가 실행 X)

// npmjs.com/package/@google/genai
// 

app.listen(PORT, () => {
  console.log(`${PORT}(으)로 작동중`);
});
