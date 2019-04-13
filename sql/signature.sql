DROP TABLE IF EXISTS signatures;
CREATE TABLE signatures(
    id SERIAL PRIMARY KEY,
    signature TEXT NOT NULL CHECK (signature!=''),
    signed_id INTEGER REFERENCES registered(id) NOT NULL UNIQUE
);
