const {Schema, model, ObjectId} = require('mongoose')


const taxiDriver = new Schema({
  name: {type: String, required: true, },
  carMake: {type: String, required: true},
  email: {type: String, required: true, unique: true},
  password: {type: String, required: true},
})


module.exports = model ('TaxiDriver', taxiDriver)
