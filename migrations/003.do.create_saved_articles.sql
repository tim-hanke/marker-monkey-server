CREATE TABLE saved_articles (
    id SERIAL PRIMARY KEY,
    article_id INTEGER
        REFERENCES articles(id) ON DELETE CASCADE NOT NULL,
    user_id INTEGER
        REFERENCES users(id) ON DELETE CASCADE NOT NULL
);
