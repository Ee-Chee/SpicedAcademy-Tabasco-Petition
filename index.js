//I love expresso :D
const express = require("express");
const app = express();
//handlebars
var hb = require("express-handlebars");
app.engine("handlebars", hb());
app.set("view engine", "handlebars");
var dB = require("./utilities/db");
var bct = require("./utilities/bcrypt");
const csurf = require("csurf");
const cookieSession = require("cookie-session");
//use cookie-session to prevent from user tampering cookies on browser
//////////////////////////////////////////////////////////////
app.use(express.static("./public"));
app.use(
    cookieSession({
        secret: `I'm wondering...`,
        maxAge: 1000 * 60 * 60 * 24 * 14 //expired in 2 weeks
    })
);
//atob("session");
app.use(
    //post!
    require("body-parser").urlencoded({
        extended: false
    })
);

app.use(csurf()); //prevent crsf attack. Prevent using postman to post rather than our website itself

app.use(function(req, res, next) {
    //using token/key-like to open up the functionality of post
    //locals store the properties and values so that it renders to every template made when executing res.render()
    res.locals.csrfToken = req.csrfToken();
    res.setHeader("X-Frame-Options", "deny"); //prevent clickhijacking
    next();
});

app.get("/register", (req, res) => {
    if (req.session.registered) {
        res.redirect("/petition");
    } else {
        res.render("register", { layout: "main" });
    }
});

app.post("/register", (req, res) => {
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

app.get("/petition", (req, res) => {
    if (req.session.registered) {
        if (req.session.signed) {
            //signed users cant return back to this page
            res.redirect("/thanks");
        } else {
            res.render("petition", { layout: "main" });
        }
    } else {
        res.redirect("/register");
    }
});

app.post("/petition", (req, res) => {
    dB.addSign(req.body.signature, req.session.currID)
        .then(data => {
            req.session.signID = data.rows[0].id;
            req.session.signed = true;
            res.redirect("/thanks");
        })
        .catch(err => {
            console.log("Error caught:", err);
            res.render("petition", {
                errormsg: "Invalid signature, please try again!",
                layout: "main"
            });
        });
});

app.get("/thanks", (req, res) => {
    if (req.session.signed) {
        dB.getSign(req.session.signID)
            .then(data => {
                res.render("thankyou", {
                    signature: data.rows[0].signature,
                    layout: "main"
                });
            })
            .catch(err => {
                console.log(err);
            });
    } else {
        res.redirect("/register");
    }
});

app.get("/signers", (req, res) => {
    if (req.session.signed) {
        dB.getSigners()
            .then(data => {
                // console.log("hi: ", data);
                let signedUserArr = [];
                for (let i = 0; i < data.rows.length; i++) {
                    signedUserArr.push(data.rows[i]);
                }
                res.render("signerpage", {
                    signedusers: signedUserArr,
                    layout: "main"
                });
            })
            .catch(err => {
                console.log(err);
            });
    } else {
        res.redirect("/register");
    }
});

app.get("/signers/:city", (req, res) => {
    if (req.session.signed) {
        dB.getCitySigners(req.params.city)
            .then(data => {
                // console.log("hehe: ", data);
                let signedCityUserArr = [];
                for (let i = 0; i < data.rows.length; i++) {
                    signedCityUserArr.push(data.rows[i]);
                }
                res.render("citysignerpage", {
                    signedCityUsers: signedCityUserArr,
                    layout: "main"
                });
            })
            .catch(err => {
                console.log(err);
            });
    } else {
        res.redirect("/register");
    }
});

app.get("/log", (req, res) => {
    //clear all cookies except crsf
    req.session.signed = req.session.registered = req.session.signID = req.session.currID = null;
    //OR app.get("/logout")
    //req.session = null;
    //res.redirect("/login") //not res.render
    //you cant use redirect here because only one path available /log. Redirect to same path will make infinite request loop.
    res.render("log", {
        layout: "main"
    });
});

app.post("/log", (req, res) => {
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
                            console.log(data.rows[0].id);
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

app.get("/profile", (req, res) => {
    if (req.session.registered) {
        if (req.session.signed) {
            res.redirect("/thanks");
        } else {
            res.render("profile", {
                layout: "main"
            });
        }
    } else {
        res.redirect("/register");
    }
});

app.post("/profile", (req, res) => {
    if (!req.body.age && !req.body.city && !req.body.homepage) {
        //null, undefined, NaN, "" and 0 by default are falsy.
        return res.redirect("/petition"); //to handle empty string. age must be an integer not ""
    } else if (!req.body.age || req.body.age < 1) {
        req.body.age = null; //to handle empty string and negative int for age but data exists in city and homepage
    } else if (
        //prevent users from inserting executable js command on url, e.g. javascript:alert("hi");
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
        });
});

app.get("/profile/edit", (req, res) => {
    if (req.session.signed) {
        res.render("editprofile", {
            layout: "main"
        });
    } else {
        res.redirect("/register");
    }
});

app.post("/profile/edit", (req, res) => {
    if (!req.body.age || req.body.age < 1) {
        req.body.age = null;
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

app.post("/sign-removed", (req, res) => {
    if (req.body.deleted == "granted") {
        dB.removeSignature(req.session.currID)
            .then(() => {
                req.session.signed = false;
                req.session.signID = null;
                res.render("signatureRemoved", {
                    layout: "main"
                });
            })
            .catch(err => {
                console.log("Error caught:", err);
            });
    } else {
        res.redirect("/register");
    }
});

app.get("*", (req, res) => {
    res.redirect("/register");
});

app.listen(process.env.PORT || 8081, () =>
    console.log("I'm Bot serving for petition project!")
);
