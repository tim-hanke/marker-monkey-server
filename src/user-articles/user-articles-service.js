const UserArticlesService = {
  getById(db, id) {
    return db
      .from("user_articles AS ua")
      .select("ua.id", "ua.user_id", "ua.article_id")
      .where("ua.id", id)
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
