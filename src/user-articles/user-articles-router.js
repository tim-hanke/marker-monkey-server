const express = require("express");
const path = require("path");
const UserArticlesService = require("./user-articles-service");
const { requireAuth } = require("../middleware/jwt-auth");

const userArticlesRouter = express.Router();
const jsonBodyParser = express.json();

userArticlesRouter
  .route("/")
  .all(requireAuth)
  .delete(jsonBodyParser, async (req, res, next) => {
    // look for an entry in user_articles table containing
    // the logged-in user and the the article_id passed in
    // the body. If found, delete that row from the db
    // and return the deleted id as confirmation.
    const { article_id: articleId } = req.body;
    if (!articleId) {
      return res
        .status(400)
        .json({ error: "Missing article_id in request body" });
    }

    const userId = req.user.id;

    const exists = await UserArticlesService.getByUserAndArticleId(
      req.app.get("db"),
      userId,
      articleId
    );
    if (!exists) {
      return res.sendStatus(404);
    }

    try {
      const deletedId = await UserArticlesService.deleteUserArticle(
        req.app.get("db"),
        userId,
        articleId
      );
      return res.status(200).json({ id: deletedId });
    } catch (err) {
      next(err);
    }
  });

module.exports = userArticlesRouter;
