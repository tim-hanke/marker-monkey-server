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
    // returns all articles saved by the current user, using
    // the user object that is placed on the req by requireAuth
    // middleware
    try {
      const articles = await ArticlesService.getArticlesByUserId(
        req.app.get("db"),
        req.user.id
      );

      res.json(ArticlesService.serializeArticles(articles));
    } catch (err) {
      next(err);
    }
  })
  .post(jsonBodyParser, async (req, res, next) => {
    // find an existing article based on the URL
    // if not found, create new article
    // 1. fetch site metadata
    // 2. insert new article into articles table
    // insert new row into user_articles with article_id and user_id
    try {
      const { target_url } = req.body;
      const { id: user_id } = req.user;
      let article = await ArticlesService.getByUrl(
        req.app.get("db"),
        target_url
      );
      // if article exists, check if user article exists
      // if both already exist, return success code
      if (article) {
        const userArticle = await UserArticlesService.getByUserAndArticleId(
          req.app.get("db"),
          user_id,
          article.id
        );
        if (userArticle) {
          return res.status(200).json(userArticle);
        }
      }
      if (!article) {
        // if article/URL isn't in articles table,
        // get the page metadata using metascraper and
        // insert it into the article table
        let html, url;
        try {
          ({ body: html, url } = await got(target_url));
        } catch (err) {
          return res.status(400).json({
            error: "We couldn't access this URL. Please make sure it is valid.",
          });
        }
        const articleData = await metascraper({ html, url });
        article = await ArticlesService.insertArticle(
          req.app.get("db"),
          articleData
        );
      }
      // create a new entry in user_articles table to link
      // the article with the current user
      const newUserArticle = {
        article_id: article.id,
        user_id: user_id,
      };
      const insertedUserArticle = await UserArticlesService.insertUserArticle(
        req.app.get("db"),
        newUserArticle
      );
      res.status(201).json(insertedUserArticle);
    } catch (err) {
      next(err);
    }
  });

module.exports = router;
