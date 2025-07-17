const { v4: uuidv4 } = require("uuid");

const HttpError = require("../models/http.error");

const DUMMY_USERS = [
  {
    id: "u1",
    name: "Max Schwarz",
    email: "test@test.com",
    password: "tester",
  },
];

const getUsers = (req, res, nxt) => {
  res.json({ users: DUMMY_USERS });
};

const signup = (req, res, nxt) => {
  const { name, email, password } = req.body;

  const hasUser = DUMMY_USERS.find((u) => u.email === email);
  if (hasUser) {
    throw new HttpError("Could not create user, email already exists!", 422);
  }

  const createdUser = {
    id: uuidv4(),
    name,
    email,
    password,
  };

  DUMMY_USERS.push(createdUser);
  res.status(201).json({ message: "user has been added" });
};
const login = (req, res, nxt) => {
  const { email, password } = req.body;
  const identifiedUser = DUMMY_USERS.find((u) => u.email === email);

  if (!identifiedUser || identifiedUser.password !== password) {
    throw new HttpError(
      "Couldn't identify user, credentials seem to be wrong!",
      401
    );
  }

  res.json({ message: "Logged in..." });
};

module.exports = { getUsers, signup, login };
