DROP TABLE IF EXISTS signatures; 
CREATE TABLE signatures(
    id SERIAL PRIMARY KEY,
    firstN VARCHAR(100) NOT NULL CHECK (firstN!=''),
    lastN VARCHAR(100) NOT NULL CHECK (lastN!=''),
    signature TEXT NOT NULL CHECK (signature!='')
    -- single quote
);
