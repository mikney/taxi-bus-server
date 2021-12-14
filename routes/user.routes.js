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
    numberDay: item.numberDay,
    time: item.time,
    month: item.month,
    from: item.from,
    amount: item.passengers.filter((idDb) => idDb === id).length,
    taxiDriver: {
      phone: taxiDriver.email,
      name: taxiDriver.name,
      car: taxiDriver.carMake
    }
  }}))
  console.log(orderArray)
  res.status(200).json({orderTransform})
}))


module.exports = router