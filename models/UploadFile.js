const {Schema, model, ObjectId} = require('mongoose')


const UploadFile = new Schema({
  filename: String,
  size: Number,
  ext: String,
  url: String
  },
  {
    timestamps: true,
  }
)

module.exports = model('UploadFile', UploadFile)