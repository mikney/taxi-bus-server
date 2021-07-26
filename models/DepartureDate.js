const {Schema, model, ObjectId} = require('mongoose')


const DepartureDate = new Schema({
  departureDate : {type: ObjectId, ref: 'Date', required: true}
})

module.exports = model("DepartureDate", DepartureDate)