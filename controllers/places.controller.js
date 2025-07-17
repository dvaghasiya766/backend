const { v4: uuidv4 } = require("uuid");

const { validationResult } = require("express-validator");
const HttpError = require("../models/http.error");

let DUMMY_PLACES = [
  {
    id: "p1",
    title: "Empire State Building",
    description: "One of the most famous sky scrapers in the world!",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/NYC_Empire_State_Building.jpg/640px-NYC_Empire_State_Building.jpg",
    address: "20 W 34th St, New York, NY 10001",
    location: {
      lat: 40.7484405,
      lng: -73.9878584,
    },
    creator: "u1",
  },
  {
    id: "p2",
    title: "Emp. State Building",
    description: "One of the most famous sky scrapers in the world!",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/NYC_Empire_State_Building.jpg/640px-NYC_Empire_State_Building.jpg",
    address: "20 W 34th St, New York, NY 10001",
    location: {
      lat: 40.7484405,
      lng: -73.9878584,
    },
    creator: "u1",
  },
  {
    id: "p3",
    title: "Emp. State Building",
    description: "One of the most famous sky scrapers in the world!",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/NYC_Empire_State_Building.jpg/640px-NYC_Empire_State_Building.jpg",
    address: "20 W 34th St, New York, NY 10001",
    location: {
      lat: 40.7484405,
      lng: -73.9878584,
    },
    creator: "u2",
  },
];

const getPlaceById = (req, res, nxt) => {
  const placesId = req.params.pid;
  const place = DUMMY_PLACES.find((p) => {
    return p.id === placesId;
  });

  if (!place) {
    // return res.status(404).json({ message: "Resoures Not Found!" });
    // const error = new Error("Resourse Not Found!");
    // error.code = 404;
    const err = new HttpError("Resourse Not Founde!", 404);
    throw err;
  }

  res.json({ place });
};

const getPlacesByUserId = (req, res, nxt) => {
  const userId = req.params.uid;
  const places = DUMMY_PLACES.filter((p) => {
    return p.creator === userId;
  });

  if (places.length === 0) {
    // const error = new Error("Could not find a places for the provide user id.");
    // error.code = 404;
    const err = new HttpError(
      "Could not find a places for the provide user id!",
      404
    );
    return nxt(err);
  }

  res.json({ places });
};

const createPlace = (req, res, nxt) => {
  const errs = validationResult(req);
  console.log(errs);

  if (!errs.isEmpty) {
    throw new HttpError(
      "Invalid data has beed passed! pleased check you data",
      422
    );
  }

  const { title, description, location, address, creator } = req.body;
  const createPlace = {
    id: uuidv4(),
    title,
    description,
    location,
    address,
    creator,
  };

  DUMMY_PLACES.push(createPlace); // use unshift() to add at first index ([0])
  res.status(201).json({ place: createPlace });
};

const updatePlace = (req, res, nxt) => {
  const { title, description } = req.body;
  const placeId = req.params.pid;

  const updatedPlace = { ...DUMMY_PLACES.find((p) => p.id === placeId) };
  const placeIndex = DUMMY_PLACES.findIndex((p) => p.id === placeId);

  updatedPlace.title = title;
  updatedPlace.description = deletePlace;

  DUMMY_PLACES[placeIndex] = updatedPlace;
  res.status(200).json({ place: updatedPlace });
};

const deletePlace = (req, res, nxt) => {
  const placeId = req.params.pid;
  DUMMY_PLACES = DUMMY_PLACES.filter((p) => p.id !== placeId);
  res.status(200).json({ message: "Place deleted." });
};

module.exports = {
  getPlaceById,
  getPlacesByUserId,
  createPlace,
  updatePlace,
  deletePlace,
};
