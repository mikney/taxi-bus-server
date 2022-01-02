const Router = require('express')
const router = new Router()
const User = require('../models/User')
const Date = require('../models/Date')
const TaxiDriver = require('../models/TaxiDriver')
const mongoose = require("mongoose");




router.put('/changename', (( async (req, res) => {
  const {userName, id} = req.body

  if(!userName || !id) {
    res.status(400).json({message: "not valid params"})
  }



  const result = await User.findOneAndUpdate({_id: id}, {userName: userName})

  if(!result) {
    res.status(500).json({message: "User not found with id"})
  }
  return res.status(200).json(userName)

})))

router.get('/getorder', (async (req, res) => {
  const {id} = req.query
  console.log(id)
  const orderArray = await Date.find({passengers: id})
  const orderTransform = await Promise.all(orderArray.map(async (item) => {
    const taxiDriver = await TaxiDriver.findOne({_id: item.taxiDriver})
   return  {
    id: item.id,
    numberDay: item.numberDay,
    time: item.time,
    month: item.month,
    from: item.from,
    amount: item.passengers.filter((idDb) => idDb === id).length,
    taxiDriver: {
      ...taxiDriver._doc
    }
  }}))
  console.log(orderArray)
  res.status(200).json({orderTransform})
}))

router.get('/getuser', ( async (req, res) => {
  const {id} = req.query

  if (!id) return res.status(404).json({message: "bad params"})

  const user = await User.findOne({_id: id})
  if (!user) {
    const taxiDriver = await TaxiDriver.findOne({_id: id})
    if(taxiDriver) return res.json({taxiDriver})
    return res.status(500).json({message: "User not found"})
  }
  return res.json({user})

}))



router.delete("/order", async (req, res) => {
  const {id}  = req.query
  console.log(id)
  if (!id) return res.status(400).json({message: "id not found"})
  try {
    const resp = await Date.deleteOne({_id: id})
    return res.json(resp)
  } catch (e) {
    console.log(e)
    return res.status(400).json({message: "something wrong"})
  }

})




module.exports = router