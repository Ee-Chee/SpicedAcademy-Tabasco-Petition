const express = require("express");
const router = express.Router();
const { notSigned } = require("./middleware");
const dB = require("../utilities/db");

router.get("/signers", notSigned, (req, res) => {
    let count;
    dB.countSignature()
        .then(num => {
            // console.log("num: ", num);
            count = num.rows[0].count;
        })
        .catch(err => {
            console.log(err);
        });
    dB.getSigners()
        .then(data => {
            // console.log("hi: ", data);
            let signedUserArr = [];
            for (let i = 0; i < data.rows.length; i++) {
                signedUserArr.push(data.rows[i]);
            }
            res.render("signerpage", {
                numOfSigned: count,
                signedusers: signedUserArr,
                layout: "main"
            });
        })
        .catch(err => {
            console.log(err);
        });
});

router.get("/signers/:city", notSigned, (req, res) => {
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
});
module.exports = router;
