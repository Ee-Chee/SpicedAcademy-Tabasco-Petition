function registered(req, res, next) {
    if (req.session.registered) {
        return res.redirect("/petition");
    }
    next();
}

function notRegistered(req, res, next) {
    if (!req.session.registered) {
        return res.redirect("/register");
    }
    next();
}

function notSigned(req, res, next) {
    if (!req.session.signed) {
        return res.redirect("/register");
    }
    next();
}

function signed(req, res, next) {
    if (req.session.signed) {
        return res.redirect("/thanks");
    }
    next();
}

module.exports = {
    registered,
    notRegistered,
    notSigned,
    signed
};
