import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import morgan from "morgan";
import createHttpError from "http-errors";
import session from "express-session";
import connectFlash from "connect-flash";
// store section
import MongoStore from "connect-mongo";
// redirect back to previous page and check auth
import connectEnsureLogin from "connect-ensure-login";
import methodOverride from "method-override";
import indexRouter from "./routes/index.router.js";
import authRouter from "./routes/auth.router.js";
import userRouter from "./routes/user.router.js";
import adminRouter from "./routes/admin.router.js";
import passport from "./utils/passport.auth.js";
import { ensureAdmin } from "./middlewares/auth.middle.js";


  dotenv.config();


const app = express();
const PORT = process.env.PORT || 3006;
const MONGO_URI = process.env.MONGO_URI;
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("mongodb connected");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

app.set("view engine", "ejs");

app.use(morgan("dev"));
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
    },
    // storing dection
    store: MongoStore.create({ mongoUrl: MONGO_URI }),
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  res.locals.user = req.user;
  res.locals.isAdmin = req.user && req.user.role === "ADMIN";
  next();
});

app.use((req, res, next) => {
  console.log("Original Method:", req.method);
  console.log("Overridden Method:", req.query._method);
  next();
});

app.use((req, res, next) => {
  console.log("Incoming Request:", req.method, req.url);
  console.log("Query Parameters:", req.query);
  next();
});

app.use(connectFlash());
app.use((req, res, next) => {
  res.locals.messages = req.flash();
  next();
});

app.use("/", indexRouter);
app.use("/auth", authRouter);
app.use(
  "/user",
  connectEnsureLogin.ensureLoggedIn({ redirectTo: "/auth/login" }),
  userRouter
);
app.use(
  "/admin",
  connectEnsureLogin.ensureLoggedIn({ redirectTo: "/auth/login" }),
  ensureAdmin,
  adminRouter
);

app.use((req, res, next) => {
  next(createHttpError.NotFound());
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }
  error.status = error.status || 500;
  res.status(error.status);
  res.render("error", { error });
});

// app.listen(PORT, () => {
//   console.log(`http://localhost:${PORT}`);
// });
export default app;

