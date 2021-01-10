const express = require("express");
const path = require("path");
const SavedArticlesService = require("./saved-articles-service");
const { requireAuth } = require("../middleware/jwt-auth");

const savedArticlesRouter = express.Router();
const jsonBodyParser = express.json();

savedArticlesRouter
  .route("/")
  .post(requireAuth, jsonBodyParser, (req, res, next) => {
    const { article_id } = req.body;
    if (!article_id) {
      return res
        .status(400)
        .json({ error: "Missing article_id in request body" });
    }
    const newReview = { article_id };

    // for (const [key, value] of Object.entries(newReview))
    //   if (value == null)
    //     return res.status(400).json({
    //       error: `Missing '${key}' in request body`,
    //     });

    newReview.user_id = req.user.id;

    SavedArticlesService.insertReview(req.app.get("db"), newReview)
      .then((review) => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${review.id}`))
          .json(SavedArticlesService.serializeReview(review));
      })
      .catch(next);
  });

module.exports = savedArticlesRouter;
