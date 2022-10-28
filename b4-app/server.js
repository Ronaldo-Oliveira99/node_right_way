/***
 * Excerpted from "Node.js 8 the Right Way",
 * published by The Pragmatic Bookshelf.
 * Copyrights apply to this code. It may not be used to create training material,
 * courses, books, articles, and the like. Contact us if you are in doubt.
 * We make no guarantees that this code is fit for any purpose.
 * Visit http://www.pragmaticprogrammer.com/titles/jwnode2 for more book information.
 ***/
"use strict";
const pkg = require("./package.json");
const { URL } = require("url");
const path = require("path");

// nconf configuration.
const nconf = require("nconf");
nconf.argv().env("__").defaults({ NODE_ENV: "development" });

const NODE_ENV = nconf.get("NODE_ENV");

const isDev = NODE_ENV === "development";

nconf
  .defaults({ conf: path.join(__dirname, `${NODE_ENV}.config.json`) })
  .file(nconf.get("conf"));

const serviceUrl = new URL(nconf.get("serviceUrl"));

const servicePort =
  serviceUrl.port || (serviceUrl.protocol === "https:" ? 443 : 80);

// Express and middleware.
const express = require("express");
const morgan = require("morgan");

const app = express();

app.use(morgan("dev"));

app.get("/api/version", (req, res) => res.status(200).json(pkg.version));

// Serve webpack assets.
console.log('isdev', isDev)
if (isDev) {
  const webpack = require("webpack");
  const webpackMiddleware = require("webpack-dev-middleware");
  const webpackConfig = require("./webpack.config.js");
  app.use(
    webpackMiddleware(webpack(webpackConfig), {
      publicPath: "/",
      stats: { colors: true },
    })
  );
} else {
  app.use(express.static("dist"));
}

// configuração de Express sessions.
const expressSession = require("express-session");
if (isDev) {
  // Use FileStore in development mode.
  const FileStore = require("session-file-store")(expressSession);
  app.use(
    expressSession({
      resave: false,
      saveUninitialized: true,
      secret: "unguessable",
      store: new FileStore(),
    })
  );
} else {
    const RedisStore = require('connect-redis')(expressSession);
    app.use(expressSession({
      resave: false,
      saveUninitialized: false,
      secret: nconf.get('redis:secret'),
      store: new RedisStore({
        host: nconf.get('redis:host'),
        port: nconf.get('redis:port'),
      }),
    }));

}

// Passport Authentication.
const passport = require("passport");
passport.serializeUser((profile, done) =>
  done(null, {
    id: profile.id,
    provider: profile.provider,
  })
);

passport.deserializeUser((user, done) => done(null, user));
app.use(passport.initialize());
// sempre apos expressSession()
app.use(passport.session());

// strategy facebook
const FacebookStrategy = require("passport-facebook").Strategy;
passport.use(
  // 2 paramentros
  new FacebookStrategy(
    {
      // id e o secret do app facebook
      clientID: nconf.get("auth:facebook:appID"),
      clientSecret: nconf.get("auth:facebook:appSecret"),
      // URL que aponta  para a rota
      // classe URL para contruir a string usando o serviceUrl
      callbackURL: new URL("/auth/facebook/callback", serviceUrl).href,
    },

    //parametro 2: retorno de chamada de resolicao de usuario
    (accessToken, refreshToken, profile, done) => done(null, profile)
  )
);

app.get("/auth/facebook", passport.authenticate("facebook"));

app.get(
  "/auth/facebook/callback",
  passport.authenticate("facebook", {
    successRedirect: "/",
    failureRedirect: "/",
  })
);

// strategy twitter
const TwitterStrategy = require("passport-twitter").Strategy;
passport.use(
  new TwitterStrategy(
    {
      consumerKey: nconf.get("auth:twitter:consumerKey"),
      consumerSecret: nconf.get("auth:twitter:consumerSecret"),
      callbackURL: new URL("/auth/twitter/callback", serviceUrl).href,
    },
    (accessToken, tokenSecret, profile, done) => done(null, profile)
  )
);

app.get("/auth/twitter", passport.authenticate("twitter"));

app.get(
  "/auth/twitter/callback",
  passport.authenticate("twitter", {
    successRedirect: "/",
    failureRedirect: "/",
  })
);

// strategy goolgle
const GoogleStrategy = require("passport-google-oauth20").Strategy;
passport.use(
  new GoogleStrategy(
    {
      clientID: nconf.get("auth:google:clientID"),
      clientSecret: nconf.get("auth:google:clientSecret"),
      callbackURL: new URL("/auth/google/callback", serviceUrl).href,
      scope: "https://www.googleapis.com/auth/plus.login",
    },
    (accessToken, refreshToken, profile, done) => done(null, profile)
  )
);

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);
app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    successRedirect: "/",
    failureRedirect: "/",
  })
);


// rotas
app.get("/api/session", (req, res) => {
  const session = { auth: req.isAuthenticated() };
  res.status(200).json(session);
});

app.get("/auth/signout", (req, res) => {
  req.logout();
  res.redirect("/");
});

console.log("service_port ", servicePort);
console.log("service_url ", serviceUrl);

// servidor https
const fs = require("fs");
const https = require("https") 

// const key = fs.readFileSync("./https/localhost-key.pem", "utf-8");
// const cert = fs.readFileSync("./https/localhost.pem", "utf-8");

const key = fs.readFileSync("./https/b4-exemplo.com-key.pem", "utf-8");
const cert = fs.readFileSync("./https/b4-exemplo.com.pem", "utf-8");

// express.router
app.use('/api', require('./lib/bundle.js')(nconf.get('es')));


https
  .createServer({ key, cert }, app)
  .listen(servicePort, () => console.log("Secure Server Ready."));


//app.listen(servicePort, () => console.log("Ready."));
// ./b4.example.com.pem" and the key at "./b4.example.com-key.pem" ✅
//localhost.pem  -- localhost-key.pem
