// express
const express = require("express");
const app = express();

// const fs = require("fs");
const hb = require("express-handlebars");

// Authenticate
// const basicAuth = require("basic-auth");
const urlPublic = __dirname + "/public";

// =====================================================
// ==================== Midleware  =====================
// =====================================================

// handlebars
app.engine("handlebars", hb());
app.set("view engine", "handlebars");
// body parser
app.use(
    require("body-parser").urlencoded({
        extended: false
    })
);
// cookie parser
app.use(require("cookie-parser")());

app.use(express.static(urlPublic));
// =====================================================
// ==================== Routes  ========================
// =====================================================

// const projects = fs.readdirSync(urlPublic + "/projects");
// Home page route -----------------------
app.get("/", (req, res) => {
    res.redirect("/petition");
});
app.get("/petition", (req, res) => {
    res.render("petition", {
        layout: "main",
        message:
            "Sign our petition and help us bring lows that gives human right to all animals",
        img: "/images/animalRights.jpg"
    });
    console.log(res.img);
});
app.post("/petition", (req, res) => {});
app.get("/thanks", (req, res) => {});
app.get("/signers", (req, res) => {});

// app.get("*", (req, res) => {
//     // res.redirect("/");
//     res.render("404", {
//         layout: "main",
//         message: "File you are loocking for does not exist on this server"
//     });
// });
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
