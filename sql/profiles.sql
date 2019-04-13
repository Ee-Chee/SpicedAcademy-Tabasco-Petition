DROP TABLE IF EXISTS user_profiles;
CREATE TABLE user_profiles(
    id SERIAL PRIMARY KEY,
    age INTEGER,
    city VARCHAR(200),
    homepage VARCHAR(500),
    user_id INTEGER REFERENCES registered(id) NOT NULL UNIQUE--foreign key comes with REFERENCES
);
