const Router = require('express')
const router = new Router()
const User = require('../models/User')
const TaxiDriver = require('../models/TaxiDriver')
const {route} = require("express/lib/router");



router.get("/users", (async (req, res) => {
  const resp = await User.find()
  return res.json({resp})
}))

router.get("/drivers", async (req, res) => {
  const resp = await TaxiDriver.find()
  return res.json({resp})
})


router.post("/deleteuser", async (req, res) => {
  const {id} = req.body

  if (!id) return res.status(400).json({})

  const resp = await User.deleteOne({_id: id})
  return res.json({resp})
})

router.post("/ban", async (req, res) => {
  const {id} = req.body
  // const id = ""
  console.log(id)
  if (!id) return res.status(400).json({})
    try {
    const resp = await User.findOneAndUpdate({_id: id}, {ban: true}, {
      upsert: true,rawResult: true, useFindAndModify: false
    })
    console.log(resp)
    if (resp.lastErrorObject.updatedExisting) {
      return res.json({resp})
    } else {
      throw new Error('PIZDa')
    }

  } catch (e) {
    console.log(e)
    return res.status(400)
  }


})



module.exports = router