//I love expresso :D
const express = require("express");
const app = express();
//handlebars
const hb = require("express-handlebars");
app.engine("handlebars", hb());
app.set("view engine", "handlebars");
//other utilities
const dB = require("./utilities/db");
const bct = require("./utilities/bcrypt");
const csurf = require("csurf");
const cookieSession = require("cookie-session");
//use cookie-session to prevent from user tampering cookies on browser
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
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.use(express.static("./public"));

app.use(require("./routers/getStarted"));
app.use(require("./routers/petition"));
app.use(require("./routers/profile"));
app.use(require("./routers/signers"));

app.get("*", (req, res) => {
    res.redirect("/register");
});

module.exports = app;
if (require.main == module) {
    app.listen(process.env.PORT || 8081, () => console.log("Bot me"));
}
