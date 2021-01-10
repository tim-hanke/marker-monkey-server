const knex = require("knex");
const supertest = require("supertest");
const app = require("../src/app");
const helpers = require("./test-helpers");

describe.only("Protected endpoints", function () {
  let db;

  const {
    testUsers,
    testArticles,
    testReviews,
  } = helpers.makeArticlesFixtures();

  before("make knex instance", () => {
    db = knex({
      client: "pg",
      connection: process.env.TEST_DB_URL,
    });
    app.set("db", db);
  });

  after("disconnect from db", () => db.destroy());

  before("cleanup", () => helpers.cleanTables(db));

  afterEach("cleanup", () => helpers.cleanTables(db));

  beforeEach("insert articles", () =>
    helpers.seedArticlesTables(db, testUsers, testArticles, testReviews)
  );

  const protectedEndpoints = [
    {
      name: "GET /api/articles/:article_id",
      path: "/api/articles/1",
      method: supertest(app).get,
    },
    {
      name: "GET /api/articles/:article_id/reviews",
      path: "/api/articles/1/reviews",
      method: supertest(app).get,
    },
    {
      name: "POST /api/savedarticles",
      path: "/api/savedarticles",
      method: supertest(app).post,
    },
  ];

  protectedEndpoints.forEach((endpoint) => {
    describe(endpoint.name, () => {
      it(`responds with 401 'Missing bearer token' when no bearer token`, () => {
        return endpoint
          .method(endpoint.path)
          .expect(401, { error: "Missing bearer token" });
      });

      it(`responds 401 'Unauthorized request' when invalid JWT secret`, () => {
        const validUser = testUsers[0];
        const invalidSecret = "bad-secret";
        return endpoint
          .method(endpoint.path)
          .set(
            "Authorization",
            helpers.makeAuthHeader(validUser, invalidSecret)
          )
          .expect(401, { error: `Unauthorized request` });
      });

      it(`responds 401 'Unauthorized request' when invalid sub in payload`, () => {
        const invalidUser = {
          user_name: "user-not-exiting",
          id: 1,
        };
        return endpoint
          .method(endpoint.path)
          .set("Authorization", helpers.makeAuthHeader(invalidUser))
          .expect(401, { error: "Unauthorized request" });
      });
    });
  });
});
