const express = require("express");
const axios = require("axios");
require("dotenv").config();
const cors = require("cors");

const app = express();

app.set("view engine", "ejs");
app.use(cors());
app.use(express.static("public"));

app.get("/", (req, res, next) => {
  res.render("index");
});

app.get("/login", (req, res, next) => {
  // 클라이언트 사이드에서 해도 될 듯
  res.redirect(
    `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${process.env.CLIENT_ID}&state=${process.env.STATE}&redirect_uri=${process.env.REDIRECT_URL}`
  );
});

// https://developers.naver.com/docs/login/devguide/devguide.md#3-4-3-네이버-로그인-연동-결과-callback-정보
app.get("/callback", async (req, res, next) => {
  console.log("query --- > ", req.query);
  /*
   success: { code: 'vTrfIS...bMbQe', state: 'h..o' }
   
   fail: { state: 'h..o', error: "xxxx", error_description: "xxxx" }
  */

  if (process.env.STATE !== req.query.state) {
    throw new Error("state 값 불일치");
  }
  if (req.query.error) {
    throw new Error(`${req.query.error} - ${req.query.error_description}`);
  }

  // 토큰 발급
  const response = await axios({
    method: "get",
    url: `https://nid.naver.com/oauth2.0/token?grant_type=authorization_code&client_id=${process.env.CLIENT_ID}&client_secret=${process.env.CLIENT_SECRET}&code=${req.query.code}&state=${process.env.STATE}`,
  });

  console.log("response ---> ", response.data);
  // {
  //   access_token: 'AAAAORMa ... IejSrAJwt45E',
  //   refresh_token: 'xc2FJwmGf85z ... 75Bv5fn8',
  //   token_type: 'bearer',
  //   expires_in: '3600'
  // }

  const response2 = await axios({
    method: "get",
    url: "https://openapi.naver.com/v1/nid/me",
    headers: {
      Authorization: `Bearer ${response.data.access_token}`,
    },
  });
  console.log("response2 ---> ", response2.data);
  // response2 --->  {
  //   resultcode: '00',
  //   message: 'success',
  //   response: { id: 'AoqDn7 ... vKQ93LjQkLQ' }
  // }

  res.json(true);
});

app.listen(3000, () => {
  console.log("start server");
});
