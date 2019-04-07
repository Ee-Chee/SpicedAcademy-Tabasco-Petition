//I love expresso :D
const express = require("express");
const app = express();
//handlebars
var hb = require("express-handlebars");
app.engine("handlebars", hb());
app.set("view engine", "handlebars");
//for post!
app.use(
    require("body-parser").urlencoded({
        extended: false
    })
);
var signaturesDB = require("./utilities/db");
var currID;
//////////////////////////////////////////////////////////////
app.use(express.static("./public"));
app.get("/petition", (req, res) => {
    res.render("petition", { layout: "main" });
});

app.post("/petition", (req, res) => {
    signaturesDB
        .addSign(req.body.firstName, req.body.lastName, req.body.signature)
        .then(data => {
            currID = data.rows[0].id;
            res.redirect("/thanks");
        })
        .catch(err => {
            console.log("Error caught:", err);
            res.render("petition", {
                errormsg: "Invalid inputs detected, please insert again!",
                layout: "main"
            });
        });
});

app.get("/thanks", (req, res) => {
    signaturesDB
        .getSign(currID)
        .then(data => {
            // console.log(data);
            res.render("thankyou", {
                signature: data.rows[0].signature,
                layout: "main"
            });
        })
        .catch(err => {
            console.log(err);
        });
});
app.listen(8081, () => console.log("I'm Bot serving for petition project!"));
