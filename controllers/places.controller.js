const { v4: uuidv4 } = require("uuid");

const { validationResult } = require("express-validator");
const HttpError = require("../models/http.error");
const getCoordsForAddress = require("../util/location");
const Place = require("../models/place");

let DUMMY_PLACES = [];

const getPlaceById = async (req, res, nxt) => {
  const placesId = req.params.pid;
  let place;

  try {
    place = await Place.findById(placesId);
  } catch (err) {
    const error = new HttpError(
      "Somthing was wrong, could not find Place",
      500
    );
    return nxt(error);
  }
  if (!place) {
    const err = new HttpError("Resourse Not Founde!", 404);
    return nxt(err);
  }

  res.json({ place: place.toObject({ getters: true }) });
};

const getPlacesByUserId = (req, res, nxt) => {
  const userId = req.params.uid;
  const places = Place.findById();

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

const createPlace = async (req, res, next) => {
  // Changed `nxt` to `next`
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log("Validation Errors: ", errors);
    return next(
      // Changed `nxt` to `next`
      new HttpError(
        "Invalid data has been passed! Please check your input.",
        422
      )
    );
  }

  const { title, description, address, creator } = req.body;

  let location;
  try {
    location = await getCoordsForAddress(address);
  } catch (error) {
    return next(error); // Changed `nxt` to `next`
  }

  const createdPlace = new Place({
    title,
    description,
    image:
      "https://images.pexels.com/photos/414612/pexels-photo-414612.jpeg?cs=srgb&dl=pexels-souvenirpixels-414612.jpg&fm=jpg",
    location,
    address,
    creator,
  });

  try {
    const result = await createdPlace.save();
  } catch (err) {
    const error = new HttpError(
      "Creating Place Failed! Please Try Again...",
      500
    );
    return next(error);
  }

  res.status(201).json({ place: createdPlace });
};

const updatePlace = (req, res, nxt) => {
  const errs = validationResult(req);

  if (!errs.isEmpty()) {
    console.log("Error: ", errs);
    throw new HttpError(
      "Invalid data has beed passed! pleased check you data",
      422
    );
  }

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

  if (!DUMMY_PLACES.find((p) => p.id === placeId)) {
    throw new HttpError("Could not find place", 404);
  }

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
