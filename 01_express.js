// commonjs es-module

const express = require("express");
//자동으로 안잡히면 터미널에서 'npm i express' 안한 것

const app = express(); //호출
const PORT = 3333;

//body -> post json parser.
//post, put, patch -> body가 있는 형태로 구현한다
//get, delete는 body가 없는 형태로 구현한다
app.use(express.json());

//뒤집힌 axios로 보면 편하다
app.get("/", (req, res) => {
  //(요청패러미터, 응답패러미터)
  res.send(`hello. It's first time to response GET.. in port ${PORT}`);
});

app.post("/", (req, res) => {
  res.json({
    msg: "oh you can POST now!",
  });
});
app.post("/chat", (req, res) => {
  const {} = req.body;
  res.json({
    reply: `${msg}라고 말하셨네요!`,
  });
});

// node 01_express.js -> listen까지만 구현한 코드를 기반으로 실행 중
// 코드 변동사항을 감지(watch) 해주는 실행 방법 필요
// 1. node 내장 --watch (22+ LTS)
// 2. nodemon 설치해서 사용 -> npm i -D nodemon
//npx nodemon 01_express.js
// "scripts": {
//   "01": "nodemon 01_express.js"
// },
// # npm run {script 이름}
// num run 01

app.listen(PORT, () => {
  console.log(`servering in ${PORT}`);
});
// 터미널에
// node 01_express.js
