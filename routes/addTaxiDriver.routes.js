const Router = require('express')
const router =  new Router()
const TaxiDriver = require('../models/TaxiDriver')
const DepartureDate = require('../models/DepartureDate')
const User = require('../models/User')
const Date = require('../models/Date')

router.post('/add',
  async (req, res) => {
    try {
      const {name, carMake} = req.body
      const taxiDriver = new TaxiDriver({name, carMake})
      await taxiDriver.save()
      res.json({message: `Taxi driver ${name} was created`})
    } catch (e) {
      console.log(e)
    }
  }
)
router.post('/update',
  async (req, res) => {
    try {
      const {name, userPhone, update} = req.body
      const userId = await User.findOne({email: userPhone})
      const ress = await TaxiDriver.findOneAndUpdate({name}, {$push: {Users: userId._id}})
      //res.json({message: `Taxi driver ${name} was updated ${ress.carMake}`})
      res.json({message: `Taxi driver ${name} was updated and add User ${userId.userName}`})
    } catch (e) {
      console.log(e)
    }
  }
)

router.post('/taxiuser', async (req, res) => {
  try {
    const {name} = req.body
    const ress = await TaxiDriver.findOne({name}).populate('Users')
    //const users = await User.find({_id: {$in: ress.Users}})
    console.log(ress.Users)
    res.json({message: `Found Users ${ress.Users.map(el => el.userName)}`})
  } catch (e) {
    console.log(e)
  }
})


router.post('/adddate', async (req, res) => {
  try {
    const {date, taxiDriver, time, month , from} = req.body
    const dateDay = new Date({numberDay: date, taxiDriver, time, month, from})
    await dateDay.save()
    //const d = await Date.findOne({numberDay: date})
    // const departureDate = new DepartureDate({departureDate: dateDay._id})
    // await departureDate.save()
    res.json({message: "Date added success"})
  } catch (e) {
    console.log(e)
  }
})
router.post('/addpassengers', async (req, res) => {
  try {
    const {passenger, time, date} = req.body

    const result = await Date.findOneAndUpdate({time, numberDay: date},{$push: {passengers: [...passenger]}})
    const driver = await TaxiDriver.findOne({_id: result.taxiDriver})
    if (!driver) {
      return res.status(400).json({message: 'Driver not found'})
    }
    const userFind = await User.updateOne({_id: passenger}, {
      currentOrder: {
        numberDay: result.numberDay,
        time: result.time,
        taxiDriver: driver
      }})
    if (!userFind) {
      return res.status(400).json({message: 'User not update'})
    }
    console.log(result)
    if (!result) {
      return res.status(500).json({message: 'Date not found'})
    }
    res.json({message: `Passenger added at ${time}`})
  } catch (e) {
    console.log(e)
  }
})

router.post('/finduserdate', async (req, res) => {
  try {
    const {time, date} = req.body
    const result = await Date.findOne({time, numberDay: date})
    if (!result) {
      return res.status(500).json({message: 'User not found'})
    }
    // console.log(result.)
    const ress = await Promise.all(result.passengers.map(async user => {
      const b = await User.findOne({_id: user})
      console.log(b)
      return b.email
    }))
    console.log(ress)
    return res.json(ress)

  } catch (e) {
    console.log(e)
  }
}
)

router.post('/findtaxidriver', async (req, res) => {
  try {
    const {date, month, from} = req.body
    const result = await Date.find({numberDay: date, month, from})
    if (!result) {
      res.status(400).json({message: `Date ${date} not found`})
    }
    const newArr = await Promise.all(result.map( async collect => {
      const taxiMan = await TaxiDriver.findOne({_id: collect.taxiDriver})
      return {
        numPass: collect.passengers.length,
        time: collect.time,
        taxiDriver: taxiMan
      }
    }))
    // console.log(result.passengers)
    // res.json({
    //   numPass: result[0].passengers.length
    // })
    res.json(newArr)
  } catch (e) {
    console.log(e)
  }
})


router.post('/pdriver',async (req, res) => {
  try {
    const {driver} = req.body
    // const result = await Date.findOne({_id: "60dcb816695468366c25a5e3"})
    // console.log(result)
    const result = await Date.find({taxiDriver: driver})
    if(!result) {
      return res.status(400).json({message: "Driver not found"})
    }
    const arr = await Promise.all(result.map(async (item) => {
      return {
        passengers: await findUser(item.passengers),
        time: item.time,
        date: item.numberDay
      }
    }))
    async function findUser(user) {
      let arr = []
      arr =  await Promise.all(user.map(async item => {
        const b = await User.findOne({_id: item})
        return b.email
      }))
      return arr
    }
    res.json(arr)

  } catch (e) {
    console.log(e)
  }
})

router


module.exports = router