// methods for retrieving and inserting rows into user_articles table
const UserArticlesService = {
  getById(db, id) {
    return db
      .from("user_articles AS ua")
      .select("ua.id", "ua.user_id", "ua.article_id")
      .where("ua.id", id)
      .first();
  },

  getByUserAndArticleId(db, userId, articleId) {
    return db
      .from("user_articles AS ua")
      .select("ua.id", "ua.user_id", "ua.article_id")
      .where({
        "ua.user_id": userId,
        "ua.article_id": articleId,
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

  deleteUserArticle(db, userId, articleId) {
    return db
      .from("user_articles")
      .where({
        user_id: userId,
        article_id: articleId,
      })
      .returning("id")
      .del()
      .then(([userArticle]) => userArticle);
  },
};

module.exports = UserArticlesService;
