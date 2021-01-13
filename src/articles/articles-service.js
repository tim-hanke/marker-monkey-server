const xss = require("xss");
const Treeize = require("treeize");

const ArticlesService = {
  getAllArticles(db) {
    return db
      .from("articles AS art")
      .select("art.id", "art.url", "art.image", "art.title", "art.description");
    // .leftJoin("user_articles AS sav", "art.id", "sav.article_id")
    // .leftJoin("users AS usr", "art.user_id", "usr.id")
    // .groupBy("art.id", "usr.id");
  },

  getById(db, id) {
    return this.getAllArticles(db).where("art.id", id).first();
  },

  getByUrl(db, url) {
    return this.getAllArticles(db).where("art.url", url).first();
  },

  getByUserId(id) {
    return this.getAllArticles(db).where("usr.id", id);
  },

  insertArticle(db, newArticle) {
    return db
      .insert(newArticle)
      .into("articles")
      .returning("*")
      .then(([article]) => article)
      .then((article) => this.getById(db, article.id));
  },

  getReviewsForThing(db, article_id) {
    return db
      .from("user_articles AS rev")
      .select("rev.id", "rev.rating", "rev.text", "rev.date_created")
      .where("rev.article_id", article_id)
      .leftJoin("users AS usr", "rev.user_id", "usr.id")
      .groupBy("rev.id", "usr.id");
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

  serializeThingReviews(reviews) {
    return reviews.map(this.serializeThingReview);
  },

  serializeThingReview(review) {
    const reviewTree = new Treeize();

    // Some light hackiness to allow for the fact that `treeize`
    // only accepts arrays of objects, and we want to use a single
    // object.
    const reviewData = reviewTree.grow([review]).getData()[0];

    return {
      id: reviewData.id,
      rating: reviewData.rating,
      article_id: reviewData.article_id,
      text: xss(reviewData.text),
      user: reviewData.user || {},
      date_created: reviewData.date_created,
    };
  },
};

const userFields = [
  "usr.id AS user:id",
  "usr.user_name AS user:user_name",
  "usr.full_name AS user:full_name",
  "usr.date_created AS user:date_created",
  "usr.date_modified AS user:date_modified",
];

module.exports = ArticlesService;
