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
    const newSavedArticle = { article_id };

    // for (const [key, value] of Object.entries(newReview))
    //   if (value == null)
    //     return res.status(400).json({
    //       error: `Missing '${key}' in request body`,
    //     });

    newSavedArticle.user_id = req.user.id;

    UserArticlesService.insertSavedArticle(req.app.get("db"), newSavedArticle)
      .then((savedArticle) => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${savedArticle.id}`))
          .json(UserArticlesService.serializeReview(savedArticle));
      })
      .catch(next);
  });

module.exports = userArticlesRouter;
