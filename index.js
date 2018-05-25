// express
const express = require("express");
const app = express();
//
const hb = require("express-handlebars");
const csurf = require("csurf");
const cookieSession = require("cookie-session");
// custom modules
const db = require("./db");
const urlPublic = __dirname + "/public";
// =====================================================
// ==================== Midleware  =====================
// =====================================================
// handlebars ------------------------------------------
app.engine("handlebars", hb());
app.set("view engine", "handlebars");
// body parser -----------------------------------------
app.use(
    require("body-parser").urlencoded({
        extended: false
    })
);
// cookie parser ---------------------------------------
app.use(require("cookie-parser")());
// public files ----------------------------------------
app.use(express.static(urlPublic));
// cookie session ---------------------------------------
app.use(
    cookieSession({
        secret: `I'm always angry.`,
        maxAge: 1000 * 60 * 60 * 24 * 14
    })
);
// csurf creates a session ----------------------------
app.use(csurf());
app.use(function(req, res, next) {
    res.locals.csrfToken = req.csrfToken();
    res.setHeader("X-Frame", "DENY");
    next();
});
// =====================================================
// ==================== Routes  ========================
// =====================================================
// Home page route, ------------------------------------
app.get("/", (req, res) => {
    res.redirect("/register");
});
// register route ---------------------------------------
app.get("/register", requireLoggedOut, (req, res) => {
    // console.log("get register in");
    res.render("register", {
        layout: "main",
        message: "Please register new acount"
    });
});
app.post("/register", (req, res) => {
    //
    db
        .hashPassword(req.body.password)
        .then(function(hashedPassword) {
            //
            db
                .registerUser(
                    req.body.first,
                    req.body.last,
                    req.body.email,
                    hashedPassword
                )
                .then(function(body) {
                    // console.log(body);
                    let userId = body.rows[0].id;
                    let first = body.rows[0].first;
                    let last = body.rows[0].last;
                    req.session.userId = userId;
                    req.session.last = last;
                    req.session.first = first;
                    res.redirect("/petition");
                })
                .catch(function(e) {
                    console.log("register user: ", e);
                    res.render("register", {
                        layout: "main",
                        message: "Please register new acount",
                        error: "email already exist, please use diferent one"
                    });
                });
        })
        .catch(function(e) {
            console.log("/register: ", e);
        });

    // ------------------------
});
// login route ---------------------------------------
app.get("/login", requireLoggedOut, (req, res) => {
    //
    res.render("login", {
        layout: "main",
        message: "Login to your account"
    });
});
app.post("/login", requireLoggedOut, (req, res) => {
    //
    // let first, last, id, signature;
    db
        .getUserByEmail(req.body.email)
        .then(function(result) {
            // first = result.rows[0].first;
            // last = result.rows[0].last;
            // id = result.rows[0].id;
            // signature = result.rows[0].signature;
            return db
                .checkPassword(req.body.password, result.rows[0].hash_password)
                .then(function(doesMatch) {
                    if (!doesMatch) {
                        throw new Error(
                            console.log("login route after check password")
                        );
                    } else {
                        // console.log("correct");
                        // req.session.first = first;
                        // req.session.last = last;
                        // req.session.userId = id;
                        // req.session.sigId = signature;
                        req.session.first = result.rows[0].first;
                        req.session.last = result.rows[0].last;
                        req.session.userId = result.rows[0].id;
                        // req.session.sigId = result.rows[0].signature;
                        return res.redirect("/petition");
                    }
                });
        })
        .catch(function(e) {
            console.log("login route get hashPassword", e);
            res.render("login", {
                layout: "main",
                message: "Login to your account",
                error: " error"
            });
        });
});
// Petition route ------------------------------------
app.get("/petition", requireNoSignature, (req, res) => {
    res.render("petition", {
        layout: "main",
        message: "Sign our petition to help us give animals human"
    });
});
app.post("/petition", requireNoSignature, (req, res) => {
    db
        .signPetition(
            req.session.userId,
            req.body.first,
            req.body.last,
            req.body.sig
        )
        .then(function(result) {
            console.log("result: ", result);
            let sigId = result.rows[0].id;
            console.log("sig: ", sigId);
            req.session.sigId = sigId;
            console.log("session: ", req.session);
            res.redirect("/thanks");
        })
        .catch(function(e) {
            console.log("/petition: ", e);
        });
});
// thanks route ----------------------------------------
app.get("/thanks", requireUserId, requireSignature, (req, res) => {
    // console.log("sigid", req.session.sigId);
    db
        .getSignatureById(req.session.sigId)
        .then(function(result) {
            res.render("thanks", {
                layout: "main",
                message:
                    "xDear " +
                    req.session.first +
                    " " +
                    req.session.last +
                    " Thank you for signing our petition",

                signature: result
            });
        })
        .catch(function(e) {
            console.log("there is a error in get thanks", e);
        });
});
// signers route --------------------------------------------
app.get("/signers", requireUserId, requireSignature, (req, res) => {});
// logout raute
app.get("/logout", function(req, res) {
    req.session = null;
    res.redirect("/");
});
// this rout adress all request and return 404 if file doesent exist
app.get("*", (req, res) => {
    res.redirect("/");
    // res.render("404", {
    //     layout: "main",
    //     message: "File you are loocking for does not exist on this server"
    // });
});
// =================================================
// ===============  End of server ==================
app.listen(8080, () => console.log("Listening on port 8080"));
// =================================================
// =================================================

// it check if user has sigh petition
function requireNoSignature(req, res, next) {
    console.log("reqNoSig: ", req.session);
    if (req.session.sigId) {
        res.redirect("/thanks");
    } else {
        next();
    }
}
function requireSignature(req, res, next) {
    if (!req.session.sigId) {
        res.redirect("/thanks");
    } else {
        next();
    }
}
// functions that checks if there is a cookie setHeader
// it check if user is registerd
function requireUserId(req, res, next) {
    if (!req.session.userId) {
        res.redirect("/register");
    } else {
        next();
    }
}
function requireLoggedOut(req, res, next) {
    if (req.session.userId) {
        // console.log("requireLoggedOut");
        res.redirect("/petition");
    } else {
        next();
    }
}
