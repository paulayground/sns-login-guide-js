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
    `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.CLIENT_ID}&redirect_uri=${process.env.REDIRECT_URL}&response_type=code&scope=email profile`
  );
});

app.get("/callback", async (req, res, next) => {
  console.log("query --- > ", req.query);
  // {
  //   code: '4/0AbUvdso;vew...YuKLXnOnosZZeDw',
  //   scope: 'email profile https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile openid',
  //   authuser: '0',
  //   prompt: 'consent'
  // }
  console.log("body --- > ", req.body);

  const response = await axios({
    method: "post",
    url: "https://oauth2.googleapis.com/token",
    data: {
      code: req.query.code,
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      redirect_uri: process.env.REDIRECT_URL,
      grant_type: "authorization_code",
    },
  });

  console.log("response ---> ", response.data);
  // {
  //   access_token: 'ya29.a0AsfdvrwvwevArCF...Bi0wulEpPexpxIc9ocw0163',
  //   expires_in: 3599,
  //   scope: 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile openid',
  //   token_type: 'Bearer',
  //   id_token: 'eyJhbGciOiJSUzI...a5xpAAQ'
  // }

  const response2 = await axios({
    method: "get",
    url: "https://www.googleapis.com/oauth2/v2/userinfo",
    headers: {
      Authorization: `Bearer ${response.data.access_token}`,
    },
  });
  console.log("response2 ---> ", response2.data);
  // {
  //   id: '1013...2345',
  //   email: 'test@gmail.com',
  //   verified_email: true,
  //   name: 'hello',
  //   given_name: 'world',
  //   picture: 'https://lh3.googleusercontent.com/a/AAcHasdasdvejA...iviske',
  //   locale: 'ko'
  // }

  res.json(true);
});

app.listen(3000, () => {
  console.log("start server");
});
