const {Schema, model, ObjectId} = require('mongoose')


const Date = new Schema ({
  numberDay: {type: Number, required: true},
  taxiDriver: {type: ObjectId, required: true, ref: 'TaxiDriver'},
  time: {type: String, required: true },
  passengers: {type: Array},
  month: {type: String, required: true},
  from: {type: String, required: true}
})

module.exports = model('Date', Date)
