const knex = require("knex");
const supertest = require("supertest");
const app = require("../src/app");
const helpers = require("./test-helpers");

describe.only("User Article Endpoints", function () {
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

  describe("DELETE /api/user_articles", () => {
    context("Given no article_id is passed", () => {
      before("insert users", () => helpers.seedUsers(db, testUsers));
      it("responds with 400 and error message", () => {
        return supertest(app)
          .del("/api/user_articles")
          .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
          .expect(400, { error: "Missing article_id in request body" });
      });
    });

    context("Given user_article doesn't exist", () => {
      before("insert users", () => helpers.seedUsers(db, testUsers));
      it("responds with 404", () => {
        return supertest(app)
          .del("/api/user_articles")
          .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
          .send({ article_id: 1 })
          .expect(404);
      });
    });

    context("Given user_article does exist", () => {
      before("insert users, articles, user_articles", () =>
        helpers.seedArticlesTables(
          db,
          testUsers,
          testArticles,
          testUserArticles
        )
      );
      const expectedId = testUserArticles[0].id;

      it("responds with 200 and id of the deleted user_article", () => {
        return supertest(app)
          .del("/api/user_articles")
          .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
          .send({ article_id: testUserArticles[0].article_id })
          .expect(200, { id: expectedId });
      });
    });
  });
});
