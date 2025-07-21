const express = require("express");
const bodyParser = require("body-parser");

require("dotenv").config();

const placesRoutes = require("./routes/places.routes");
const usersRoutes = require("./routes/users.routes");
const HttpError = require("./models/http.error");
const httpError = require("./models/http.error");

const app = express();

app.use(bodyParser.json());

app.use("/api/places", placesRoutes);
app.use("/api/users", usersRoutes);

app.use((req, res, nxt) => {
  const err = new HttpError("Could not find this Route.", 404);
  throw err;
});

app.use((err, req, res, nxt) => {
  if (res.headerSent) {
    return next(error);
  }

  res
    .status(err.code || 500)
    .json({ message: err.message || "An unknown error occurred!!" });
});

app.listen(5000);
