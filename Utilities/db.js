//create connection pooling, to handle sudden burst of traffic
var spicedPg = require("spiced-pg");
//postges:username:password@port/database
var db = spicedPg("postgres:postgres:postgres@localhost:5432/tabasco-petition");

exports.addSign = function addSign(firstName, lastName, signature) {
    //using dollar sign to tell sql it is a parameter not command.
    let q = `INSERT INTO signatures (firstN, lastN, signature) VALUES ($1, $2, $3) RETURNING id ;`;
    let params = [firstName, lastName, signature];
    return db.query(q, params);
};

exports.getSign = function(currID) {
    let q = `SELECT signature FROM signatures WHERE id = $1;`;
    let params = [currID];
    return db.query(q, params);
};
