CREATE TABLE articles (
  id SERIAL PRIMARY KEY,
  url TEXT NOT NULL,
  image TEXT,
  title TEXT NOT NULL,
  description TEXT
);
