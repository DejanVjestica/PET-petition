// express
const express = require("express");
const app = express();
// handlebars
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
    res.render("register", {
        layout: "main",
        message: "Please register new acount",
        isLogedIn: req.session.userId
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
                    let userId = body.rows[0].id;
                    let first = req.body.first;
                    let last = req.body.last;
                    let email = req.body.email;
                    // setting cookie session
                    req.session.userId = userId;
                    req.session.last = last;
                    req.session.first = first;
                    req.session.email = email;
                    res.redirect("/profile");
                })
                .catch(function(e) {
                    console.log("register user: ", e);
                    res.render("register", {
                        layout: "main",
                        message: "Please register new acount",
                        error: "email already exist, please use diferent one",
                        isLogedIn: req.session.userId
                    });
                });
        })
        .catch(function(e) {
            console.log("/register: ", e);
        });
    // ------------------------
});
// profile route ---------------------------------------
app.get("/profile", (req, res) => {
    res.render("profile", {
        layout: "main",
        message: req.session.first + " please tell us more about you self",
        error: "email already exist, please use diferent one",
        isLogedIn: req.session.userId
    });
});
app.post("/profile", requireNoUserId, (req, res) => {
    let age, city, homepage;
    db
        .profile(
            req.body.age,
            req.body.city,
            req.body.homepage,
            req.session.userId
        )
        .then(function() {
            age = req.body.age;
            city = req.body.city;
            homepage = req.body.homepage;
            req.session.age = age;
            req.session.city = city;
            req.session.homepage = homepage;
            res.redirect("/petition");
        })
        .catch(function(e) {
            console.log("route /profile: ", e);
        });
});
// editing profile
app.get("/profile/edit", (req, res) => {
    db
        .getProfile(req.session.userId)
        .then(function(result) {
            res.render("profile_edit", {
                layout: "main",
                signer: result.rows[0],
                message: "You can edit your personal data",
                isLogedIn: req.session.userId
            });
        })
        .catch(function(err) {
            console.log("profile edit error  ", err);
        });
});
app.post("/profile/edit", (req, res) => {
    const { first, last, email, age, city, homepage, password } = req.body;
    const { userId } = req.session;
    if (password) {
        db
            .hashPassword(password)
            .then(function(hashedPassword) {
                Promise.all([
                    db.updateUser(first, last, email, hashedPassword, userId),
                    db.updateUserProfile(age, city, homepage, userId)
                ]).catch(err => {
                    console.log(err);
                });
            })
            .then(function() {
                req.session.first = first;
                req.session.last = last;
                return res.redirect("/thanks");
            })
            .catch(function(err) {
                console.log(err);
            });
    } else {
        Promise.all([
            db.updateUserOutPassword(first, last, email, userId),
            db.updateUserProfile(age, city, homepage, userId)
        ])
            .then(function() {
                req.session.first = first;
                req.session.last = last;
                return res.redirect("/thanks");
            })
            .catch(function(err) {
                console.log("catch error else: ", err);
            });
    }
});
// ====================================================
// login route ---------------------------------------
app.get("/login", requireLoggedOut, (req, res) => {
    //
    res.render("login", {
        layout: "main",
        message: "Login to your account",
        isLogedIn: req.session.userId
    });
});

app.post("/login", requireLoggedOut, (req, res) => {
    let first, last, userId, sigId, email;
    db
        .getUserByEmail(req.body.email)
        .then(function(result) {
            first = result.rows[0].first;
            last = result.rows[0].last;
            sigId = result.rows[0].sig_id;
            userId = result.rows[0].user_id;
            email = req.body.email;
            return db
                .checkPassword(req.body.password, result.rows[0].hash_password)
                .then(function(doesMatch) {
                    if (!doesMatch) {
                        throw new Error();
                    } else {
                        req.session.first = first;
                        req.session.last = last;
                        req.session.userId = userId;
                        req.session.sigId = sigId;
                        req.session.email = email;
                        return res.redirect("/petition");
                    }
                });
        })
        .catch(function() {
            // console.log("login route get hashPassword", e);
            res.render("login", {
                layout: "main",
                message: "Login to your account",
                error: " error",
                isLogedIn: req.session.userId
            });
        });
});
// logout raute -------------------------
app.get("/logout", function(req, res) {
    req.session = null;
    res.redirect("/");
});
// Petition route ------------------------------------
app.get("/petition", requireNoSignature, (req, res) => {
    res.render("petition", {
        layout: "main",
        message: "Sign our petition to help us give animals human",
        error: " error",
        isLogedIn: req.session.userId,
        userName: req.session.first + " " + req.session.last
    });
});
app.post("/petition", requireNoSignature, (req, res) => {
    db
        .signPetition(req.session.userId, req.body.sig)
        .then(function(result) {
            let sigId = result.rows[0].id;
            req.session.sigId = sigId;
            res.redirect("/thanks");
        })
        .catch(function(e) {
            console.log("/petition: ", e);
        });
});
// thanks route ----------------------------------------
app.get("/thanks", requireSignature, (req, res) => {
    db
        .getSignatureById(req.session.sigId)
        .then(function(result) {
            res.render("thanks", {
                layout: "main",
                message:
                    "Dear " +
                    req.session.first +
                    " " +
                    req.session.last +
                    " thank you for signing our petition",

                signature: result,
                error: " error",
                isLogedIn: req.session.userId
            });
        })
        .catch(function(e) {
            console.log("there is a error in get thanks", e);
        });
});
// signers route --------------------------------------------
app.get("/signers", requireUserId, requireSignature, (req, res) => {
    db
        .getSigners()
        .then(function(result) {
            res.render("signers", {
                layout: "main",
                signers: result.rows,
                message: "List of all partisipants.",
                error: " error",
                isLogedIn: req.session.userId
            });
        })
        .catch(function(err) {
            console.log(err);
        });
});
app.get("/signers/:city", (req, res) => {
    db.getSignersByCity(req.params.city).then(function(result) {
        res.render("signers", {
            layout: "main",
            signers: result.rows,
            error: " error",
            isLogedIn: req.session.userId
        });
    });
});

// this rout adress all request and return 404 if file doesent exist
app.get("*", (req, res) => {
    res.redirect("/");
});

// =================================================
// ===============  End of server ==================
app.listen(process.env.PORT || 8080, () => console.log("Listening"));
// =================================================
// =================================================

// it check if user has sigh petition
function requireNoSignature(req, res, next) {
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
        res.redirect("/petition");
    } else {
        next();
    }
}
function requireNoUserId(req, res, next) {
    if (!req.session.userId) {
        res.redirect("/petition");
    } else {
        next();
    }
}
