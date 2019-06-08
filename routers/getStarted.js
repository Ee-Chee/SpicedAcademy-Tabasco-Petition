const express = require("express");
const router = express.Router();
const { registered } = require("./middleware");
const dB = require("../utilities/db");
const bct = require("../utilities/bcrypt");

router.get("/register", registered, (req, res) => {
    res.render("register", { layout: "main" });
});

router.post("/register", (req, res) => {
    if (!req.body.pw) {
        return res.render("register", {
            errormsg: "Invalid inputs detected, please insert again!",
            layout: "main"
        });
    }
    //To handle empty pw before hashing
    bct.hashPassword(req.body.pw)
        .then(hashedPW => {
            //promise inside promise? yes for handling async
            return dB
                .addRegister(
                    req.body.firstName,
                    req.body.lastName,
                    req.body.email,
                    hashedPW
                )
                .then(data => {
                    req.session.currID = data.rows[0].id; //rows[0] the only element in the array after query WHERE filtering
                    req.session.registered = true;
                    res.redirect("/profile");
                }); //in order to omit the catch function, return is added to then
        })
        .catch(err => {
            console.log("Error caught: ", err);
            res.render("register", {
                errormsg: "Invalid inputs detected, please insert again!",
                layout: "main"
            });
        });
});

router.get("/log", (req, res) => {
    req.session.destroy(function() {
        res.render("log", {
            layout: "main"
        });
    });
});

router.post("/log", (req, res) => {
    dB.getLogged(req.body.email)
        .then(data => {
            // console.log("hey: ", data); //noted that registereduser_id, U is in small letter!
            return bct
                .checkPassword(req.body.pw, data.rows[0].pw)
                .then(correctPW => {
                    if (correctPW) {
                        //restoring all cookies
                        req.session.registered = true;
                        req.session.currID = data.rows[0].registereduser_id; //registered user id
                        //even though registeredUser_id is named (capital U for "user")in db.js, pls follow the exact object name given by data here.
                        if (data.rows[0].id == null) {
                            // console.log(data.rows[0].id);
                            //even if NOT NULL is set, it doesnt still violate the rules as left join happening.
                            req.session.signed = false;
                            req.session.signID = data.rows[0].id; //which is null;
                        } else {
                            req.session.signed = true;
                            req.session.signID = data.rows[0].id; // registered and signed user ID
                        }
                        res.redirect("/register");
                    } else {
                        res.render("log", {
                            errormsg:
                                "Invalid email address or password, please try again!",
                            layout: "main"
                        });
                    }
                });
        })
        .catch(err => {
            console.log("Error caught: ", err);
            res.render("log", {
                errormsg:
                    "Invalid email address or password, please try again!",
                layout: "main"
            });
        });
});
module.exports = router;
