const {Schema, model, ObjectId} = require('mongoose')


const User = new Schema({
  email: {type: String, required: true, unique: true},
  password: {type: String, required: true},
  avatar: {type: String},
  userName: {type: String},
  currentOrder: {type: Map, of: Object},
  role: {type: Number},
  ban: {type: Boolean}
})

module.exports = model('User', User)