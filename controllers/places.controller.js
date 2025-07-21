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

const getPlacesByUserId = async (req, res, nxt) => {
  const userId = req.params.uid;
  let places;

  try {
    places = await Place.find({ creator: userId });
  } catch (err) {
    const error = new HttpError(
      "Somthing was wrong, could not find Place",
      500
    );
    return nxt(error);
  }

  if (places.length === 0) {
    const err = new HttpError(
      "Could not find a places for the provide user id!",
      404
    );
    return nxt(err);
  }

  res.json({
    places: places.map((place) => place.toObject({ getters: true })),
  });
};

const createPlace = async (req, res, nxt) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log("Validation Errors: ", errors);
    return nxt(
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

const updatePlace = async (req, res, nxt) => {
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

  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError(
      "Somthing gone wrong! could not update Place...",
      500
    );
    return nxt(error);
  }

  place.title = title;
  place.description = description;

  try {
    await place.save();
  } catch (err) {
    const error = new HttpError(
      "Somthing gone wrong! could not save Place...",
      500
    );
    return nxt(error);
  }

  res.status(200).json({ place: place.toObject({ getters: true }) });
};

const deletePlace = async (req, res, nxt) => {
  const placeId = req.params.pid;
  let place;

  try {
    place = await Place.findById(placeId);
    if (!place) {
      return nxt(new HttpError("Place not found", 404));
    }
  } catch (err) {
    console.error("Find failed:", err.message);
    return nxt(
      new HttpError("Something went wrong while finding the place", 500)
    );
  }

  try {
    await place.deleteOne();
  } catch (err) {
    const error = new HttpError(
      "Somthing Gone Wrong! Could Not Delete...",
      500
    );
    return nxt(err);
  }
  res.status(200).json({ message: "Deletion Completed!" });
};

module.exports = {
  getPlaceById,
  getPlacesByUserId,
  createPlace,
  updatePlace,
  deletePlace,
};
