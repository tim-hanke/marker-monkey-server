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

function makeArticlesArray() {
  return [
    {
      id: 1,
      url: "https://www.test1.com",
      title: "First test article!",
      image: "http://placehold.it/500x500",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?",
    },
    {
      id: 2,
      url: "https://www.test2.com",
      title: "Second test article!",
      image: "http://placehold.it/500x500",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?",
    },
    {
      id: 3,
      url: "https://www.test3.com",
      title: "Third test article!",
      image: "http://placehold.it/500x500",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?",
    },
    {
      id: 4,
      url: "https://www.test4.com",
      title: "Fourth test article!",
      image: "http://placehold.it/500x500",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?",
    },
  ];
}

function makeUserArticlesArray(users, articles) {
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
      article_id: articles[articles.length - 2].id,
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

function makeExpectedArticle(user, article, userArticles = []) {
  const filteredUserArticles = userArticles.filter(
    (ua) => ua.user_id === user.id
  );

  return filteredUserArticles.find((a) => a.article_id === article.id);
}

function makeMaliciousArticle() {
  const maliciousArticle = {
    id: 911,
    url: "http://www.test.com",
    image: "http://placehold.it/500x500",
    title: 'Naughty naughty very naughty <script>alert("xss");</script>',
    description: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
  };
  const expectedArticle = {
    ...maliciousArticle,
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
  const testArticles = makeArticlesArray();
  const testUserArticles = makeUserArticlesArray(testUsers, testArticles);
  return { testUsers, testArticles, testUserArticles };
}

function cleanTables(db) {
  return db.raw(
    `TRUNCATE
      articles,
      users,
      user_articles
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

function seedArticlesTables(db, users, articles, userArticles = []) {
  // use a transaction to group the queries and auto rollback on any failure
  return db.transaction(async (trx) => {
    await seedUsers(trx, users);
    await trx.into("articles").insert(articles);
    // update the auto sequence to match the forced id values
    await trx.raw(`SELECT setval('articles_id_seq', ?)`, [
      articles[articles.length - 1].id,
    ]);
    // only insert userArticles if there are some, also update the sequence counter
    if (userArticles.length) {
      await trx.into("user_articles").insert(userArticles);
      await trx.raw(`SELECT setval('user_articles_id_seq', ?)`, [
        userArticles[userArticles.length - 1].id,
      ]);
    }
  });
}

function seedMaliciousArticle(db, user, article) {
  return seedUsers(db, [user]).then(() => {
    db.into("articles").insert([article]);
    db.into("user_articles").insert({
      user_id: user.id,
      article_id: article.id,
    });
  });
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
  makeMaliciousArticle,
  makeUserArticlesArray,
  makeArticlesFixtures,
  cleanTables,
  seedArticlesTables,
  seedMaliciousArticle,
  makeAuthHeader,
  seedUsers,
};
