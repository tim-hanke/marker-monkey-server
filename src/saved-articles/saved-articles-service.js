const xss = require("xss");

const SavedArticleService = {
  getById(db, id) {
    return db
      .from("saved_articles AS rev")
      .select(
        "rev.id",
        "rev.rating",
        "rev.text",
        "rev.date_created",
        "rev.article_id",
        db.raw(
          `row_to_json(
            (SELECT tmp FROM (
              SELECT
                usr.id,
                usr.user_name,
                usr.full_name,
                usr.date_created,
                usr.date_modified
            ) tmp)
          ) AS "user"`
        )
      )
      .leftJoin("users AS usr", "rev.user_id", "usr.id")
      .where("rev.id", id)
      .first();
  },

  insertSavedArticle(db, newSavedArticle) {
    return db
      .insert(newSavedArticle)
      .into("saved_articles")
      .returning("*")
      .then(([savedArticle]) => savedArticle)
      .then((savedArticle) => SavedArticleService.getById(db, savedArticle.id));
  },

  serializeReview(review) {
    return {
      id: review.id,
      rating: review.rating,
      text: xss(review.text),
      article_id: review.article_id,
      date_created: review.date_created,
      user: review.user || {},
    };
  },
};

module.exports = SavedArticleService;
