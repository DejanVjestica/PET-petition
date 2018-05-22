// express
const express = require("express");
const app = express();

// const fs = require("fs");
const hb = require("express-handlebars");
const db = require("./db");
const csurf = require("csurf");
const cookieSession = require("cookie-session");
// Authenticate
// const basicAuth = require("basic-auth");
const urlPublic = __dirname + "/public";

// const projects = fs.readdirSync(urlPublic + "/projects");

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

app.use(express.static(urlPublic));

//
app.use(
    cookieSession({
        secret: `I'm always angry.`,
        maxAge: 1000 * 60 * 60 * 24 * 14
    })
);
app.use(csurf());
app.use(function(req, res, next) {
    res.locals.csrfToken = req.csrfToken();
    res.setHeader("X-Frame", "DENY");
    next();
});
// =====================================================
// ==================== Routes  ========================
// =====================================================

// Home page route, it redirect to petition url get request-----------------------
app.get("/", (req, res) => {
    res.redirect("/petition");
});
// Petition route ------------------------------------
app.get("/petition", (req, res) => {
    // console.log(db);
    if (req.session.sigId) {
        res.redirect("/thanks");
        return;
    }
    res.render("petition", {
        layout: "main",
        message: "Sign our petition to help us give animals human",
        img: "/images/animalRights.jpg"
    });
});
app.post("/petition", (req, res) => {
    if (req.session.sigId) {
        res.redirect("/thanks");
        return;
    }
    // //
    // console.log(req.body.first, req.body.last, req.body.sig);
    db
        .signPetition(req.body.first, req.body.last, req.body.sig)
        .then(function(result) {
            const sigId = result.rows[0];
            req.session.sigId = sigId;
            // console.log(req.session);
            res.redirect("/thanks");
        })
        .catch(function(e) {
            console.log(e);
        });
});
// thanks route
app.get("/thanks", (req, res) => {
    if (!req.session.sigId) {
        res.redirect("/petition");
        return;
    }
    //
    res.render("thanks", {
        layout: "main",
        message: "Thank you for signing our petition",
        img: "/images/animalRights.jpg"
    });
});
// signers route
app.get("/signers", (req, res) => {
    if (!req.session.sigId) {
        res.redirect("/petition");
        return;
    }
    //
});
// this rout adress all request and return 404 if file doesent exist
app.get("*", (req, res) => {
    // res.redirect("/");
    res.render("404", {
        layout: "main",
        message: "File you are loocking for does not exist on this server"
    });
});
// =================================================
// ===============  End of server ==================
app.listen(8080, () => console.log("Listening on port 8080"));
// =================================================
// =================================================

// app.use((req, res, next) => {
//     // console.log("inside middleware", req.cookies);
//     if (req.url !== "/cookie") {
//         if (req.cookies.isLogedIn !== "yes") {
//             res.cookie("url", req.url);
//             // console.log("inside middleware. isLogedin did not pass, redirecting");
//             res.redirect("/cookie");
//         } else {
//             next();
//         }
//     } else {
//         next();
//     }
// });

// Projects page route -----------------------
// app.get("/projects/:name/description/", (req, res) => {
//     let requestUrl = req.params.name;
//     let jsonDescriptions = fs.readFileSync(
//         __dirname + "/public/projects/" + requestUrl + "/description.json"
//     );
//     let parsedObject = JSON.parse(jsonDescriptions);
//     // let parsedObject = JSON.parse(jsonDescriptions);
//     res.render("description", {
//         layout: "main",
//         message: "Project " + requestUrl + " description!",
//         name: requestUrl,
//         description: parsedObject["description:"],
//         myArray: projects
//     });
// });
// About page route -----------------------
// app.get("/about", (req, res) => {
//     res.render("about", {
//         layout: "main",
//         message: "About me!"
//     });
// });
// day one -------------------------------
// Cookies route -------------------------------
// app.get("/cookie", (req, res) => {
//     // console.log("inside get /cookie", req.cookies);
//     if (req.cookies.isLogedIn == "yes") {
//         res.redirect("/");
//     } else {
//         res.send(`
// 			<h1>You need to accept cookies</h1>
// 			<form method = 'POST'>
// 			<input name = "checkbox" type="checkbox">
// 			<button>send</button>
// 			</form>
// 			`);
//     }
// });
// app.post("/cookie", (req, res) => {
//     // console.log("inside post /cookie");
//     const box = req.body.checkbox;
//     if (box) {
//         // console.log("we are here", req.cookies.url);
//         res.cookie("isLogedIn", "yes");
//         // res.redirect("/");
//         // console.log(req.cookie.url);
//         res.redirect(req.cookies.url);
//         // res.redirect("'" + req.cookies.url + "'");
//     } else {
//         // console.log("box not found redirecting");
//         // res.send("you are not autorised");
//         res.redirect("/cookie");
//     }
// });
// In case of un existing route it rerender 404 page  -------------------------------
// In case of un existing route -------------------------------

// =========================
// Autorisation package
// =========================
