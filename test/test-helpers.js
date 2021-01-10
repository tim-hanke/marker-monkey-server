const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

function makeUsersArray() {
  return [
    {
      id: 1,
      user_name: "test-user-1",
      full_name: "Test user 1",
      password: "password",
    },
    {
      id: 2,
      user_name: "test-user-2",
      full_name: "Test user 2",
      password: "password",
    },
    {
      id: 3,
      user_name: "test-user-3",
      full_name: "Test user 3",
      password: "password",
    },
    {
      id: 4,
      user_name: "test-user-4",
      full_name: "Test user 4",
      password: "password",
    },
  ];
}

function makeArticlesArray(users) {
  return [
    {
      id: 1,
      url: "https://www.test.com",
      title: "First test article!",
      image: "http://placehold.it/500x500",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?",
    },
    {
      id: 2,
      url: "https://www.test.com",
      title: "Second test article!",
      image: "http://placehold.it/500x500",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?",
    },
    {
      id: 3,
      url: "https://www.test.com",
      title: "Third test article!",
      image: "http://placehold.it/500x500",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?",
    },
    {
      id: 4,
      url: "https://www.test.com",
      title: "Fourth test article!",
      image: "http://placehold.it/500x500",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?",
    },
  ];
}

function makeSavedArticlesArray(users, articles) {
  return [
    {
      id: 1,
      article_id: articles[0].id,
      user_id: users[0].id,
    },
    {
      id: 2,
      article_id: articles[0].id,
      user_id: users[1].id,
    },
    {
      id: 3,
      article_id: articles[0].id,
      user_id: users[2].id,
    },
    {
      id: 4,
      article_id: articles[0].id,
      user_id: users[3].id,
    },
    {
      id: 5,
      article_id: articles[articles.length - 1].id,
      user_id: users[0].id,
    },
    {
      id: 6,
      article_id: articles[articles.length - 1].id,
      user_id: users[2].id,
    },
    {
      id: 7,
      article_id: articles[3].id,
      user_id: users[0].id,
    },
  ];
}

function makeExpectedArticle(users, article, reviews = []) {
  const user = users.find((user) => user.id === article.user_id);

  const thingReviews = reviews.filter(
    (review) => review.article_id === article.id
  );

  const number_of_reviews = thingReviews.length;
  const average_review_rating = calculateAverageReviewRating(thingReviews);

  return {
    id: article.id,
    image: article.image,
    title: article.title,
    description: article.description,
    date_created: article.date_created,
    number_of_reviews,
    average_review_rating,
    user: {
      id: user.id,
      user_name: user.user_name,
      full_name: user.full_name,
      date_created: user.date_created,
    },
  };
}

function calculateAverageReviewRating(reviews) {
  if (!reviews.length) return 0;

  const sum = reviews.map((review) => review.rating).reduce((a, b) => a + b);

  return Math.round(sum / reviews.length);
}

function makeExpectedArticleReviews(users, thingId, reviews) {
  const expectedReviews = reviews.filter(
    (review) => review.article_id === thingId
  );

  return expectedReviews.map((review) => {
    const reviewUser = users.find((user) => user.id === review.user_id);
    return {
      id: review.id,
      text: review.text,
      rating: review.rating,
      date_created: review.date_created,
      user: {
        id: reviewUser.id,
        user_name: reviewUser.user_name,
        full_name: reviewUser.full_name,
        date_created: reviewUser.date_created,
      },
    };
  });
}

function makeMaliciousArticle(user) {
  const maliciousArticle = {
    id: 911,
    image: "http://placehold.it/500x500",
    date_created: new Date().toISOString(),
    title: 'Naughty naughty very naughty <script>alert("xss");</script>',
    user_id: user.id,
    description: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
  };
  const expectedArticle = {
    ...makeExpectedArticle([user], maliciousArticle),
    title:
      'Naughty naughty very naughty &lt;script&gt;alert("xss");&lt;/script&gt;',
    description: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`,
  };
  return {
    maliciousArticle,
    expectedArticle,
  };
}

function makeArticlesFixtures() {
  const testUsers = makeUsersArray();
  const testArticles = makeArticlesArray(testUsers);
  const testReviews = makeSavedArticlesArray(testUsers, testArticles);
  return { testUsers, testArticles, testReviews };
}

function cleanTables(db) {
  return db.raw(
    `TRUNCATE
      articles,
      users,
      saved_articles
      RESTART IDENTITY CASCADE`
  );
}

function seedUsers(db, users) {
  const preppedUsers = users.map((user) => ({
    ...user,
    password: bcrypt.hashSync(user.password, 1),
  }));
  return db
    .into("users")
    .insert(preppedUsers)
    .then(() =>
      db.raw(`SELECT setval('users_id_seq',?)`, [users[users.length - 1].id])
    );
}

function seedArticlesTables(db, users, articles, reviews = []) {
  // use a transaction to group the queries and auto rollback on any failure
  return db.transaction(async (trx) => {
    await seedUsers(trx, users);
    await trx.into("articles").insert(articles);
    // update the auto sequence to match the forced id values
    await trx.raw(`SELECT setval('articles_id_seq', ?)`, [
      articles[articles.length - 1].id,
    ]); // only insert reviews if there are some, also update the sequence counter
    if (reviews.length) {
      await trx.into("saved_articles").insert(reviews);
      await trx.raw(`SELECT setval('saved_articles_id_seq', ?)`, [
        reviews[reviews.length - 1].id,
      ]);
    }
  });
}

function seedMaliciousArticle(db, user, article) {
  return seedUsers(db, [user]).then(() =>
    db.into("articles").insert([article])
  );
}

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
  const token = jwt.sign({ user_id: user.id }, secret, {
    subject: user.user_name,
    algorithm: "HS256",
  });
  return `Bearer ${token}`;
}

module.exports = {
  makeUsersArray,
  makeArticlesArray,
  makeExpectedArticle,
  makeExpectedArticleReviews,
  makeMaliciousArticle,
  makeReviewsArray: makeSavedArticlesArray,

  makeArticlesFixtures,
  cleanTables,
  seedArticlesTables,
  seedMaliciousArticle,
  makeAuthHeader,
  seedUsers,
};
