var express = require("express"),
    mongoose = require("mongoose"),
    passport = require("passport"),
    bodyParser = require("body-parser"),
    User = require("./models/user"),
    LocalStrategy = require("passport-local"),
    passportLocalMongoose = require("passport-local-mongoose");
var fs = require("fs"),
    util = require("util");
mongoose.connect("mongodb://localhost/auth_demo_app", {useMongoClient: true});

var app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(require("express-session")({
    secret: "vrs@#()asS3cR3t",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

  //================//
 // Routes        //
//===============//
app.get("/", function(req, res) {
    res.render("home");
});

app.get("/secret", function(req, res) {
    res.render("secret", {username: req.user.username});/*
    fs.writeFile("./log.json", util.inspect(req), function(err) {
        if(!err) {
            console.log("file succse");
        }
        else {
            console.log(err);
        }
    });*/
});
app.get("/register", function(req, res) {
    res.render("register");
});
app.post("/register", function(req, res) {
    User.register(new User({username: req.body.username}), req.body.password, function(err, user) {
        if(err) {
            console.log(err);
            return res.render("register");
        }
        passport.authenticate("local")(req, res, function() {
            console.log(req);
            res.redirect("/secret");
        });
    })
});

// API like route **Testing**
/*app.get("/showDetails/:id", function(req, res) {
    var id = req.params.id ? req.params.id == 'vrs123' : undefined;
    console.log(id);
    if(id) {
        res.json({
            "id": id,
            "data": [{
                "firstname": "Vignesh",
                "lastname": "Sharma",
                "username": "vigneshr",
                "dob": "23.11.1992",
                "currentLoc": "SBC",
                "active": false
            }]
        });
    }
    else {
        res.send({"id": "N/A", "result": "404: INVALID_REQUEST"});
    }
});*/

app.get("/login", function(req, res) {
    res.render("login");
    console.log(req.isAuthenticated());
});
app.post("/login", passport.authenticate("local", {
    successRedirect: "/secret", failureRedirect: "/register"
}), function(req, res) {
    console.log("Post login route");
});

app.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/");
    console.log(req);
});

function isLoggedin(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}

app.listen(3000, function () {
    console.log("app started..");
});