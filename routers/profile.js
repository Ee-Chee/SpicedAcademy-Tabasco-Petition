const express = require("express");
const router = express.Router();
const { notRegistered, signed, notSigned } = require("./middleware");
const dB = require("../utilities/db");
const bct = require("../utilities/bcrypt");

router.get("/profile", notRegistered, signed, (req, res) => {
    res.render("profile", {
        layout: "main"
    });
});

router.post("/profile", (req, res) => {
    if (!req.body.age && !req.body.city && !req.body.homepage) {
        //null, undefined, NaN, "" and 0 by default are falsy.
        return res.redirect("/petition"); //to handle empty string. age must be an integer not ""
    }
    if (!req.body.age || req.body.age < 1) {
        req.body.age = null; //to handle empty string and negative int for age but data exists in city and homepage
    }
    if (
        //prevent users from inserting executable js command on url, e.g. javascript:alert("hi");
        req.body.homepage != "" &&
        //to handle only homepage is set empty string. Otherwise, href for empty info would be http://
        !req.body.homepage.startsWith("http://") &&
        !req.body.homepage.startsWith("https://") &&
        !req.body.homepage.startsWith("//")
    ) {
        req.body.homepage = "http://" + req.body.homepage;
    }

    dB.addProfile(
        req.body.age,
        req.body.city,
        req.body.homepage,
        req.session.currID
    )
        .then(data => {
            // console.log("hehe: ", data, "currID: ", req.session.currID);
            res.redirect("/petition");
        })
        .catch(err => {
            console.log("Error caught: ", err);
            res.render("profile", {
                errormsg: "Invalid inputs detected, please insert again!",
                layout: "main"
            });
        });
});

router.get("/profile/edit", notSigned, (req, res) => {
    res.render("editprofile", {
        layout: "main"
    });
});

router.post("/profile/edit", (req, res) => {
    if (!req.body.age || req.body.age < 1) {
        req.body.age = null;
    }
    if (
        req.body.homepage != "" &&
        !req.body.homepage.startsWith("http://") &&
        !req.body.homepage.startsWith("https://") &&
        !req.body.homepage.startsWith("//")
    ) {
        req.body.homepage = "http://" + req.body.homepage;
    }
    if (!req.body.pw) {
        Promise.all([
            dB.updateRegisteredNoPW(
                req.session.currID,
                req.body.firstName,
                req.body.lastName,
                req.body.email
            ),
            dB.updateProfile(
                req.body.age,
                req.body.city,
                req.body.homepage,
                req.session.currID
            )
        ])
            .then(() => {
                res.redirect("/petition");
            })
            .catch(err => {
                console.log("Error caught: ", err);
                res.render("editprofile", {
                    errormsg:
                        "Invalid inputs detected! Firstname, lastname and email address are mandatory fields, please insert again!",
                    layout: "main"
                });
            });
    } else {
        bct.hashPassword(req.body.pw)
            .then(hashedPW => {
                return Promise.all([
                    dB.updateRegistered(
                        req.session.currID,
                        req.body.firstName,
                        req.body.lastName,
                        req.body.email,
                        hashedPW
                    ),
                    dB.updateProfile(
                        req.body.age,
                        req.body.city,
                        req.body.homepage,
                        req.session.currID
                    )
                ]).then(() => {
                    res.redirect("/petition");
                });
            })
            .catch(err => {
                console.log("Error caught: ", err);
                res.render("editprofile", {
                    errormsg:
                        "Invalid inputs detected! Firstname, lastname and email address are mandatory fields, please insert again!",
                    layout: "main"
                });
            });
    }
});
module.exports = router;
