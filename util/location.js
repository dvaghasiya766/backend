// const API_KEY = "";
const HttpError = require("../models/http.error");
// const axios = require("axios");

const coords = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve({
      lat: 40.7484405,
      lng: -73.9878584,
    });
  }, 5000);
});

function getCoordsForAddress(address) {
  return coords
    .then((response) => {
      return response;
    })
    .catch((error) => {
      console.error("Error getting coordinates:", error);
      throw error;
    });
}

module.exports = getCoordsForAddress();
