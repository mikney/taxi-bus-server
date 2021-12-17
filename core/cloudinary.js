const cloudinary = require('cloudinary')

cloudinary.config({
  cloud_name: "ddqaostix",
  api_key: "412316368864238",
  api_secret: "_72AfeyIUArfH5ozqHAjUM57sH4",
});

module.exports = cloudinary;
