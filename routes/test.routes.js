const express = require('express')
const cloudinary = require('../core/cloudinary')
const multer = require('multer')
const router = new express()
const User = require('../models/User')
const UploadFile = require('../models/UploadFile')


const storage = multer.memoryStorage();
const uploader = multer({ storage })


router.post("/avatar", async (req, res) => {
  try {
    // console.log(req.body.name)
    // res.json({message: `User name is ${req.body.name}`})
    // const user = await User.updateOne({email: "tet5@mail.ru"}, {avatar: 'TESJJKDSAKJDHKJASD'})
    const user = await User.findOne({email: "tet5@mail.ru"})
    if (user?.n === 0 || !user) {
      res.status(500).json({message: "User not update"})

    }
    res.json({user})
  } catch (e) {
    console.log(e)
  }
})

router.post("/upload",  uploader.single("file"), (async (req, res) => {
  const userId = req.query.id;
  const file = req.file;

  console.log(userId)
  const findUser = await User.findOne({_id: userId})
  if (!findUser) {
    return res.status(500).json({
      message: "User with id not found"
    })
  }

  cloudinary.v2.uploader
    .upload_stream(
      { resource_type: "auto" },
      (
        error,
        result
      ) => {
        if (error || !result) {
          return res.status(500).json({
            status: "error",
            message: error || "upload error",
          });
        }

        const fileData = {
          filename: result.original_filename,
          size: result.bytes,
          ext: result.format,
          url: result.url,
        };

        const uploadFile = new UploadFile(fileData);

        uploadFile
          .save()
          .then( async(fileObj) => {
            try {
              console.log(fileObj)
              console.log("TESTSTSTSTST")
              console.log( typeof fileObj.url)
              const updateUser = await User.updateOne({_id: userId}, {avatar: fileObj.url})
              console.log(updateUser)
              res.json({
                status: "success",
                file: fileObj,
              });
            } catch (e) {
              console.log(e)
            }
          })
          .catch((err) => {
            res.json({
              status: "error",
              message: err,
            });
          });
      }
    )
    .end(file.buffer);
}))
module.exports = router