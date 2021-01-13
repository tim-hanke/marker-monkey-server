const express = require("express");
const metascraper = require("metascraper")([
  require("metascraper-url")(),
  require("metascraper-image")(),
  require("metascraper-title")(),
  require("metascraper-description")(),
]);
const got = require("got");
const ArticlesService = require("./articles-service");
const UserArticlesService = require("../user-articles/user-articles-service");
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
      const { target_url, user_id } = req.body;
      let article = await ArticlesService.getByUrl(
        req.app.get("db"),
        target_url
      );
      if (!article) {
        // if article/URL isn't in articles table
        // 1. article = await getArticleData(url)
        // 2. ArticlesService.insertArticle(article) (TODO: make this function)
        const { body: html, url } = await got(target_url);
        const metadata = await metascraper({ html, url });
        const articleData = {
          url: metadata.url,
          title: metadata.title,
          description: metadata.description,
          image: metadata.image,
        };
        article = await ArticlesService.insertArticle(
          req.app.get("db"),
          articleData
        );
        console.log("inserted article", article);
      }
      const newUserArticle = {
        article_id: article.id,
        user_id: user_id,
      };
      const inserted = await UserArticlesService.insertUserArticle(
        req.app.get("db"),
        newUserArticle
      );
      console.log("inserted user_article", inserted);
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
