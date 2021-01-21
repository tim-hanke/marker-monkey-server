require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const { NODE_ENV } = require("./config");
const articlesRouter = require("./articles/articles-router");
const userArticlesRouter = require("./user-articles/user-articles-router");
const authRouter = require("./auth/auth-router");
const usersRouter = require("./users/users-router");

const app = express();

app.use(
  morgan(NODE_ENV === "production" ? "tiny" : "common", {
    skip: () => NODE_ENV === "test",
  })
);

// TODO: decide if I need to make the client origin configurable,
// like so:
// const {CLIENT_ORIGIN} = require('./config');
// app.use(
//     cors({
//         origin: CLIENT_ORIGIN
//     })
// );
app.use(cors());
app.use(helmet());

app.use("/api/articles", articlesRouter);
app.use("/api/user_articles", userArticlesRouter);
app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);

app.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === "production") {
    response = { error: "Server error" };
  } else {
    console.error(error);
    response = { error: error.message, object: error };
  }
  res.status(500).json(response);
});

module.exports = app;
