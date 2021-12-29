const {Schema, model, ObjectId} = require('mongoose')


const taxiDriver = new Schema({
  name: {type: String},
  surname: {type: String},
  carMake: {type: String},
  email: {type: String, required: true, unique: true},
  password: {type: String, required: true},
  haveWifi: {type: Boolean},
  v220: {type: Boolean},
  tv: {type: Boolean},
  avatar: {type: String},
  carPhoto: {type: Array, of: String},
  infoFilled: {type: Boolean},
  transporter: {type: String},
  number: {type: String},
  carColor: {type: String}
})


module.exports = model ('TaxiDriver', taxiDriver)
