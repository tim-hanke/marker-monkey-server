const UserArticlesService = {
  getById(db, id) {
    return db
      .from("user_articles AS ua")
      .select("ua.id", "ua.user_id", "ua.article_id")
      .where("ua.id", id)
      .first();
  },

  getByUserAndArticleId(db, user_id, article_id) {
    return db
      .from("user_articles AS ua")
      .select("ua.id", "ua.user_id", "ua.article_id")
      .where({
        "ua.user_id": user_id,
        "ua.article_id": article_id,
      })
      .first();
  },

  insertUserArticle(db, newUserArticle) {
    return db
      .insert(newUserArticle)
      .into("user_articles")
      .returning("*")
      .then(([userArticle]) => userArticle)
      .then((userArticle) => this.getById(db, userArticle.id));
  },
};

module.exports = UserArticlesService;
