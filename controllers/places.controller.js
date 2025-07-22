const { v4: uuidv4 } = require("uuid");
const mongoose = require("mongoose");

const { validationResult } = require("express-validator");
const HttpError = require("../models/http.error");
const Place = require("../models/place");
const User = require("../models/user");
const getCoordsForAddress = require("../util/location");

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
  // let places;
  let userWithPlaces;

  try {
    userWithPlaces = await User.findById(userId).populate("places");
  } catch (err) {
    const error = new HttpError(
      "Somthing was wrong, could not find Place",
      500
    );
    return nxt(error);
  }

  if (!userWithPlaces || userWithPlaces.length === 0) {
    return nxt(
      new HttpError("Could not find a places for the provide user id!", 404)
    );
  }
  console.log(userWithPlaces);
  res.json({
    places: userWithPlaces.places.map((place) => place.toObject({ getters: true })),
  });
};

const createPlace = async (req, res, nxt) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log("Validation Errors: ", errors);
    return nxt(
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
    return nxt(error);
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

  let user;
  try {
    user = await User.findById(creator);
  } catch (err) {
    return nxt(
      new HttpError("Creating Place Failed! Please try again later...", 500)
    );
  }

  if (!user) {
    return nxt(new HttpError("User not Found...", 404));
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdPlace.save({ session: sess });
    user.places.push(createdPlace);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    return nxt(
      new HttpError("Creating Place Failed! Please Try Again...", 500)
    );
  }

  res.status(201).json({ place: createdPlace });
};

const updatePlace = async (req, res, nxt) => {
  const errs = validationResult(req);

  if (!errs.isEmpty()) {
    console.log("Error: ", errs);
    return nxt(
      new HttpError("Invalid data has beed passed! pleased check you data", 422)
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
    place = await Place.findById(placeId).populate("creator");
  } catch (err) {
    console.error("Find failed:", err.message);
    return nxt(
      new HttpError("Something went wrong while finding the place", 500)
    );
  }

  if (!place) {
    return nxt(new HttpError("Place not found", 404));
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await place.deleteOne({ session: sess });
    // await place.remove({ session: sess });
    place.creator.places.pull(place);
    await place.creator.save({ session: sess });
    await sess.commitTransaction();
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
