//create connection pooling, to handle sudden burst of traffic
var spicedPg = require("spiced-pg");
//postges:username:password@port/database
var db = spicedPg(
    process.env.DATABASE_URL ||
        "postgres:postgres:postgres@localhost:5432/tabasco-petition"
);

exports.addSign = function addSign(signature, userID) {
    //using dollar sign to tell sql it is a parameter not command.
    let q = `INSERT INTO signatures (signature, signed_id) VALUES ($1, $2) RETURNING id ;`;
    //returning to store id in data.rows[0].id
    let params = [signature, userID];
    return db.query(q, params);
};

exports.getSign = function(currID) {
    let q = `SELECT signature FROM signatures WHERE id = $1;`;
    let params = [currID];
    return db.query(q, params);
};

exports.addRegister = function(firstName, lastName, email, passW) {
    let q = `INSERT INTO registered (firstN, lastN, email, pw) VALUES ($1, $2, $3, $4) RETURNING id ;`;
    let params = [firstName, lastName, email, passW];
    return db.query(q, params);
};

exports.getLogged = function(email) {
    let q = `SELECT email, pw, registered.id AS registeredUser_id, signed_id, signatures.id FROM registered
    LEFT JOIN signatures ON registered.id = signatures.signed_id
    WHERE email = $1;`;
    let params = [email];
    return db.query(q, params);
};

exports.addProfile = function(age, city, homepage, userID) {
    let q = `INSERT INTO user_profiles (age, city, homepage, user_id) VALUES ($1, $2, $3, $4) RETURNING *;`;
    let params = [age, city, homepage, userID];
    return db.query(q, params);
};

exports.getSigners = function() {
    //inner join first then left join. Left join includes all on the left, null data for the right if there is any.
    let q = `SELECT firstN, lastN, age, city, homepage
       FROM signatures
       JOIN registered ON signatures.signed_id = registered.id
       LEFT JOIN user_profiles ON user_profiles.user_id = registered.id
       WHERE signatures.id >= 1;`;
    return db.query(q);
};

exports.getCitySigners = function(city) {
    let q = `SELECT firstN, lastN, age, homepage
       FROM signatures
       JOIN registered ON signatures.signed_id = registered.id
       LEFT JOIN user_profiles ON user_profiles.user_id = registered.id
       WHERE LOWER(city)=LOWER($1);`;
    //database isnt smart enough to handle capital difference. Case sensitive!
    let params = [city];
    return db.query(q, params);
};

exports.updateRegistered = function(currID, firstName, lastName, email, pw) {
    let q = `UPDATE registered SET firstN = $2, lastN = $3, email = $4, pw = $5 where id = $1;`;
    let params = [currID, firstName, lastName, email, pw];
    return db.query(q, params);
};

exports.updateRegisteredNoPW = function(currID, firstName, lastName, email) {
    let q = `UPDATE registered SET firstN = $2, lastN = $3, email = $4 where id = $1;`;
    let params = [currID, firstName, lastName, email];
    return db.query(q, params);
};

exports.updateProfile = function(age, city, homepage, userID) {
    let q = `INSERT INTO user_profiles (age, city, homepage, user_id)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (user_id)
            DO UPDATE SET age = $1, city = $2, homepage = $3;`;
    let params = [age, city, homepage, userID];
    return db.query(q, params);
};

exports.removeSignature = function(currID) {
    let q = `Delete FROM signatures WHERE signed_id = $1;`;
    let params = [currID];
    return db.query(q, params);
};
