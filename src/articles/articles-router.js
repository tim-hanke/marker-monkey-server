const express = require("express");
const ArticlesService = require("./articles-service");
const { requireAuth } = require("../middleware/jwt-auth");

const router = express.Router();
const jsonBodyParser = express.json();

router
  .route("/")
  .all(requireAuth)
  .get(async (req, res, next) => {
    try {
      const articles = await ArticlesService.getAllArticles(req.app.get("db"));

      res.json(ArticlesService.serializeArticles(articles));
    } catch (err) {
      next(err);
    }
  })
  .post(jsonBodyParser, async (req, res, next) => {
    // find an existing article based on the URL
    // if no, create new articles
    // 1. fetch site metadata
    // 2. insert new article into articles table
    // insert new row into user_articles with article_id and user_id
    try {
      const article = await ArticlesService.getByUrl(
        req.app.get("db"),
        req.body.url
      );
      console.log(article);
      res.sendStatus(200);
    } catch (err) {
      next(err);
    }
  });

router
  .route("/:article_id")
  .all(requireAuth)
  .all(checkArticleExists)
  .get((_req, res, _next) => {
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
