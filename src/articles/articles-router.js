const express = require("express");
const ArticlesService = require("./articles-service");
const { requireAuth } = require("../middleware/jwt-auth");

const router = express.Router();

router
  .route("/")
  .all(requireAuth)
  .get((req, res, next) => {
    ArticlesService.getAllArticles(req.app.get("db"))
      .then((things) => {
        res.json(ArticlesService.serializeArticles(things));
      })
      .catch(next);
  });

router
  .route("/:article_id")
  .all(requireAuth)
  .all(checkArticleExists)
  .get((req, res) => {
    res.json(ArticlesService.serializeArticle(res.article));
  });

// router
//   .route("/:article_id/reviews/")
//   .all(requireAuth)
//   .all(checkArticleExists)
//   .get((req, res, next) => {
//     ArticlesService.getReviewsForThing(req.app.get("db"), req.params.article_id)
//       .then((reviews) => {
//         res.json(ArticlesService.serializeThingReviews(reviews));
//       })
//       .catch(next);
//   });

/* async/await syntax for promises */
async function checkArticleExists(req, res, next) {
  try {
    const article = await ArticlesService.getById(
      req.app.get("db"),
      req.params.article_id
    );

    if (!article)
      return res.status(404).json({
        error: `Article doesn't exist`,
      });

    res.article = article;
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = router;
