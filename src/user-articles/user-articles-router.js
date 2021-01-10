const express = require("express");
const path = require("path");
const UserArticlesService = require("./user-articles-service");
const { requireAuth } = require("../middleware/jwt-auth");

const userArticlesRouter = express.Router();
const jsonBodyParser = express.json();

userArticlesRouter
  .route("/")
  .post(requireAuth, jsonBodyParser, (req, res, next) => {
    const { article_id } = req.body;
    if (!article_id) {
      return res
        .status(400)
        .json({ error: "Missing article_id in request body" });
    }
    const newUserArticle = { article_id };

    // for (const [key, value] of Object.entries(newReview))
    //   if (value == null)
    //     return res.status(400).json({
    //       error: `Missing '${key}' in request body`,
    //     });

    newUserArticle.user_id = req.user.id;

    UserArticlesService.insertUserArticle(req.app.get("db"), newUserArticle)
      .then((userArticle) => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${userArticle.id}`))
          .json(UserArticlesService.serializeReview(userArticle));
      })
      .catch(next);
  });

module.exports = userArticlesRouter;
