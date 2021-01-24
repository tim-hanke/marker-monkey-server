const knex = require("knex");
const app = require("../src/app");
const helpers = require("./test-helpers");

describe("Articles Endpoints", function () {
  let db;

  const {
    testUsers,
    testArticles,
    testUserArticles,
  } = helpers.makeArticlesFixtures();

  before("make knex instance", () => {
    db = knex({
      client: "pg",
      connection: process.env.TEST_DATABASE_URL,
    });
    app.set("db", db);
  });

  after("disconnect from db", () => db.destroy());

  before("cleanup", () => helpers.cleanTables(db));

  afterEach("cleanup", () => helpers.cleanTables(db));

  describe(`GET /api/articles`, () => {
    context(`Given no articles`, () => {
      before("insert users", () => helpers.seedUsers(db, testUsers));
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get("/api/articles")
          .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
          .expect(200, []);
      });
    });

    context("Given there are articles in the database", () => {
      before("insert users, articles, user_articles", () =>
        helpers.seedArticlesTables(
          db,
          testUsers,
          testArticles,
          testUserArticles
        )
      );

      it("responds with 200 and all of the articles for a user", () => {
        const expectedArticles = testArticles.filter((article) =>
          helpers.makeExpectedArticle(testUsers[0], article, testUserArticles)
        );
        return supertest(app)
          .get("/api/articles")
          .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
          .expect(200, expectedArticles);
      });
    });
  });

  describe(`POST /api/articles`, () => {
    context("Article does not exist in database", () => {
      before("insert users, articles, user_articles", () =>
        helpers.seedArticlesTables(
          db,
          testUsers,
          testArticles,
          testUserArticles
        )
      );

      it("responds with 201 and user_articles object, and inserts into db", () => {
        return supertest(app)
          .post("/api/articles")
          .send({ target_url: "https://www.howstuffworks.com/" })
          .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
          .expect(201)
          .expect((res) => {
            expect(res.body).to.have.property("id");
            expect(res.body.user_id).to.eql(testUsers[0].id);
          })
          .expect((res) =>
            db
              .from("user_articles")
              .select("*")
              .where({ id: res.body.id })
              .first()
              .then((row) => {
                expect(row.article_id).to.eql(res.body.article_id);
                expect(row.user_id).to.eql(testUsers[0].id);
              })
          );
      });
    });

    context("Article exists, but user_article doesn't", () => {
      before("insert users, articles, user_articles", () =>
        helpers.seedArticlesTables(
          db,
          testUsers,
          testArticles,
          testUserArticles
        )
      );

      it("responds with 201 and user_articles object, and inserts into db", () => {
        const expectedUserArticle = {
          article_id: testArticles[1].id,
          user_id: testUsers[0].id,
        };

        return supertest(app)
          .post("/api/articles")
          .send({ target_url: testArticles[1].url })
          .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
          .expect(201)
          .expect((res) => {
            expect(res.body).to.have.property("id");
            expect(res.body.article_id).to.eql(expectedUserArticle.article_id);
            expect(res.body.user_id).to.eql(expectedUserArticle.user_id);
          })
          .expect((res) =>
            db
              .from("user_articles")
              .select("*")
              .where({ id: res.body.id })
              .first()
              .then((row) => {
                expect(row.article_id).to.eql(expectedUserArticle.article_id);
                expect(row.user_id).to.eql(expectedUserArticle.user_id);
              })
          );
      });
    });

    context("Article and user_article already exist", () => {
      before("insert users, articles, user_articles", () =>
        helpers.seedArticlesTables(
          db,
          testUsers,
          testArticles,
          testUserArticles
        )
      );

      it("responds with 200 and user_articles object", () => {
        const expectedUserArticle = testUserArticles[0];

        return supertest(app)
          .post("/api/articles")
          .send({ target_url: testArticles[0].url })
          .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
          .expect(200, expectedUserArticle);
      });
    });
  });
});
