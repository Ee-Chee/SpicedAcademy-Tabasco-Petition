const express = require("express");
const router = express.Router();
const { notRegistered, signed, notSigned } = require("./middleware");
const dB = require("../utilities/db");

router.get("/petition", notRegistered, signed, (req, res) => {
    res.render("petition", { layout: "main" });
});

router.post("/petition", (req, res) => {
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

router.get("/thanks", notSigned, (req, res) => {
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
});

router.post("/sign-removed", (req, res) => {
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
module.exports = router;
