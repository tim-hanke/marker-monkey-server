BEGIN;

TRUNCATE
  user_articles,
  articles,
  users
  RESTART IDENTITY CASCADE;

INSERT INTO users (user_name, full_name, password)
VALUES
  ('demo', 'Demo Person', '$2b$12$SOLYAZIStiolsJYy/mcYjecV5wb0A1SR0vONV2AB6nNUErwI5gn8O'),
  ('timhanke', 'Tim Hanke',  '$2a$12$TSYFYTSjkBwrMekMgS9g9.wuvpAbCrpBbeMGeLiw0HL.1BcC0UfKy');

INSERT INTO articles (id, url, title, description, image)
VALUES
  ('1', 'https://www.dataschool.io/how-to-contribute-on-github/', 'Step-by-step guide to contributing on GitHub', 'Learn the exact process I use when contributing to an open source project on GitHub. Follow this detailed visual guide to make your first contribution TODAY!', 'https://www.dataschool.io/content/images/2020/06/diagram-02-1.png'),
  ('2', 'https://www.guru99.com/oltp-vs-olap.html', 'OLTP vs OLAP: Difference Between OLTP and OLAP', 'What is OLAP? Online Analytical Processing, a category of software tools which provide analysis of data for business decisions. OLAP systems allow users to analyze database information from multiple d', null),
  ('3', 'https://www.youtube.com/watch?v=WBPrJSw7yQA', 'Learn TypeScript in 50 Minutes - Tutorial for Beginners', '📘 Courses - https://learn.codevolution.dev/💖 Support - https://www.paypal.me/Codevolution💾 Github - https://github.com/gopinav📱 Follow Codevolution+ Twit...', 'https://i.ytimg.com/vi/WBPrJSw7yQA/maxresdefault.jpg'),
  ('4', 'https://github.com/airbnb/javascript', 'airbnb/javascript', 'JavaScript Style Guide. Contribute to airbnb/javascript development by creating an account on GitHub.', 'https://avatars0.githubusercontent.com/u/698437?s=400&amp;v=4'),
  ('5', 'https://catalins.tech/top-5-mistakes-i-made-as-a-junior-developer', 'Top 5 Mistakes I Made As A Junior Developer', 'In this article, I want to talk about the top five mistakes I made as a junior developer. They are not specific to my case, and many other developers have made the same mistakes. As a result, I want to put them in writing so that others can see and ...', 'https://hashnode.com/utility/r?url=https%3A%2F%2Fcdn.hashnode.com%2Fres%2Fhashnode%2Fimage%2Fupload%2Fv1608619713193%2F4C0_uyFry.jpeg%3Fw%3D1200%26h%3D630%26fit%3Dcrop%26crop%3Dentropy%26auto%3Dcompress');

INSERT INTO user_articles (article_id, user_id)
VALUES
  (1, 1),
  (2, 1),
  (2, 2),
  (1, 2),
  (3, 1),
  (4, 1),
  (5, 1);

COMMIT;
