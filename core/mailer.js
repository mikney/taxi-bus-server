const nodemailer = require ('nodemailer')

const options = {
  host: "smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "d3d4175069d207",
    pass: "962a25f5fc4668"
  }
};
// const options = {
//   service: "Gmail",
//   auth: {
//     user: "genadii.bukin23@gmail.com",
//     pass: "Fgtkmcby1"
//   }
// }

module.exports = nodemailer.createTransport(options);
