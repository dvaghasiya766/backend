const { v4: uuidv4 } = require("uuid");

const { validationResult } = require("express-validator");
const HttpError = require("../models/http.error");
const User = require("../models/user");

const DUMMY_USERS = [
  {
    id: "u1",
    name: "Max Schwarz",
    email: "test@test.com",
    password: "tester",
  },
];

const getUsers = async (req, res, nxt) => {
  let users;

  try {
    users = await User.find({}, "-password");
  } catch (err) {
    return nxt(
      new HttpError("Fetching Users Failed! Please try again leter...", 500)
    );
  }

  res.json({
    users: users.map((user) => user.toObject({ getters: true })),
  });
};

const signup = async (req, res, nxt) => {
  const errs = validationResult(req);

  if (!errs.isEmpty()) {
    console.log("Error: ", errs);
    return nxt(
      new HttpError("Invalid data has beed passed! pleased check you data", 422)
    );
  }

  const { name, email, password } = req.body;
  let exsitingUser;

  try {
    exsitingUser = await User.findOne({ email: email });
  } catch (err) {
    return nxt(new HttpError("Signing up Failed, please try again..."), 500);
  }
  if (exsitingUser) {
    return nxt(
      new HttpError("User exists already! Kindly Login instend...", 422)
    );
  }

  const createdUser = new User({
    name,
    email,
    image:
      "https://images.pexels.com/photos/414612/pexels-photo-414612.jpeg?cs=srgb&dl=pexels-souvenirpixels-414612.jpg&fm=jpg",
    password,
    places:[],
  });

  try {
    const result = await createdUser.save();
    res.status(201).json({ user: createdUser.toObject({ getters: true }) });
  } catch (err) {
    const error = new HttpError("Signing up Failed! Please Try Again...", 500);
    return nxt(error);
  }
};

const login = async (req, res, nxt) => {
  const { email, password } = req.body;
  let exsitingUser;

  try {
    exsitingUser = await User.findOne({ email: email });
  } catch (err) {
    return nxt(new HttpError("Login in Failed, please try again..."), 500);
  }

  if (!exsitingUser || exsitingUser.password !== password) {
    return nxt(new HttpError("Invalid Credentials! Could not Login...", 401));
  }

  res.json({ message: "Logged in..." });
};

module.exports = { getUsers, signup, login };
