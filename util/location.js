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

module.exports = getCoordsForAddress;
// const axios = require('axios');

// const HttpError = require('../models/http-error');

// const API_KEY = 'AIzaSyDgLmMpKCzveJf1_yuA0fUzzhy0WRChvZA';

// async function getCoordsForAddress(address) {
//   // return {
//   //   lat: 40.7484474,
//   //   lng: -73.9871516
//   // };
//   const response = await axios.get(
//     `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
//       address
//     )}&key=${API_KEY}`
//   );

//   const data = response.data;

//   if (!data || data.status === 'ZERO_RESULTS') {
//     const error = new HttpError(
//       'Could not find location for the specified address.',
//       422
//     );
//     throw error;
//   }

//   const coordinates = data.results[0].geometry.location;

//   return coordinates;
// }

// module.exports = getCoordsForAddress;
