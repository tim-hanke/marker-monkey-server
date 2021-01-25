const xss = require("xss");
const Treeize = require("treeize");

// methods for retrieving and inserting into articles table
const ArticlesService = {
  getAllArticles(db) {
    return db
      .from("articles AS art")
      .select("art.id", "art.url", "art.image", "art.title", "art.description");
  },

  getById(db, id) {
    return this.getAllArticles(db).where("art.id", id).first();
  },

  getByUrl(db, url) {
    return this.getAllArticles(db).where("art.url", url).first();
  },

  getArticlesByUserId(db, userId) {
    return this.getAllArticles(db)
      .join("user_articles AS ua", "art.id", "ua.article_id")
      .where("ua.user_id", userId);
  },

  insertArticle(db, newArticle) {
    return db
      .insert(newArticle)
      .into("articles")
      .returning("*")
      .then(([article]) => article)
      .then((article) => this.getById(db, article.id));
  },

  serializeArticles(articles) {
    return articles.map(this.serializeArticle);
  },

  serializeArticle(article) {
    const articleTree = new Treeize();

    // Some light hackiness to allow for the fact that `treeize`
    // only accepts arrays of objects, and we want to use a single
    // object.
    const articleData = articleTree.grow([article]).getData()[0];

    return {
      id: articleData.id,
      url: xss(articleData.url),
      image: xss(articleData.image),
      title: xss(articleData.title),
      description: xss(articleData.description),
    };
  },
};

module.exports = ArticlesService;
