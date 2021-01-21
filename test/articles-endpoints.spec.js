const knex = require("knex");
const supertest = require("supertest");
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
      before(() => helpers.seedUsers(db, testUsers));
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get("/api/articles")
          .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
          .expect(200, []);
      });
    });

    context("Given there are articles in the database", () => {
      before("insert articles", () =>
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

    context.skip(`Given an XSS attack thing`, () => {
      // // const testUser = helpers.makeUsersArray()[0];
      // const {
      //   maliciousArticle,
      //   expectedArticle,
      // } = helpers.makeMaliciousArticle();
      // // const malicousTestArticles = testArticles;
      // // malicousTestArticles[0] = maliciousArticle;
      // before("insert articles", () =>
      //   helpers.seedArticlesTables(
      //     db,
      //     testUsers,
      //     malicousTestArticles,
      //     testUserArticles
      //   )
      // );
      // // beforeEach("insert malicious article", () => {
      // //   return helpers.seedMaliciousArticle(db, testUser, maliciousArticle);
      // // });
      // it("removes XSS attack content", () => {
      //   return supertest(app)
      //     .get(`/api/articles`)
      //     .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
      //     .expect(200)
      //     .expect((res) => {
      //       console.table(res);
      //       expect(res.body[0].title).to.eql(expectedArticle.title);
      //       expect(res.body[0].description).to.eql(expectedArticle.description);
      //     });
      // });
    });
  });
});
