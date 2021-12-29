const Router = require('express')
const router =  new Router()
const TaxiDriver = require('../models/TaxiDriver')
const DepartureDate = require('../models/DepartureDate')
const User = require('../models/User')
const Date = require('../models/Date')
const uploader = require('../core/multer')
const cloudinary = require("../core/cloudinary");
const bcrypt = require("bcryptjs");


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

router.post('/create',
  async (req, res) => {
    try {
      const {phone, password} = req.body
      const hashPass = bcrypt.hashSync(password, 7)

      const taxiDriver = new TaxiDriver({email: phone, password: hashPass})
      await taxiDriver.save()
      res.json({message: `Taxi driver ${phone} was created`})
    } catch (e) {
      console.log(e)
    }
  }
)

router.post('/infofill', async (req, res) => {
  try {
    const {id, name, surname, carMake, v220, haveWifi, tv, carColor, transporter, number} = req.body
    const taxiDriver = await TaxiDriver.findByIdAndUpdate(id, { name, surname, carMake, v220, haveWifi, tv, carColor, transporter, number})

    if (taxiDriver?.n === 0 || !taxiDriver) {
        return res.status(500).json({message: "Driver info didn't update", successes: false})
    }
    res.json({successes: true})

  } catch (e) {
    console.log(e)
  }
})

router.post("/addavatar", uploader.single("avatar"), async (req, res) => {
  try {
    const {id} = req.query
    console.log(id)
    if (!id) {
      return res.status(400).json({message: "Id not defined"})
    }
    try {
      const user = await TaxiDriver.findOne({_id: id})
      if (!user) return res.status(400).json({message: "User not found"})
    } catch (e) {
      return res.status(500).json({message: "Not valid id"})
    }

    const avatar = req.file
    const resp = await cloudinary.v2.uploader.upload(avatar.path, { resource_type: "auto" })
    if(!resp) {
      return res.status(400)
    }
    await TaxiDriver.updateOne({_id: id}, {avatar: resp.url})
    res.json({resp})
  } catch (e) {
    res.status(500).json({message: e})
    console.log(e)
  }
})

router.post('/addcarphoto', uploader.array("file", 10), async (req, res) => {
  try {
    const {id} = req.query
    const files = req.files;
    // res.json({files})

      const ArrayUploader = files.map(file => {
        return cloudinary.v2.uploader.upload(file.path, { resource_type: "auto" })
      })
      const resp = await Promise.all(ArrayUploader)
      const images = resp.map(image => image.url)
      // const images = ['111111', '312dsfsdfwe']
      await TaxiDriver.updateOne({_id: id}, {$push: {carPhoto: {$each: images}}})
      await TaxiDriver.updateOne({_id: id}, {carPhoto: images, infoFilled: true})
      return res.status(200).json({images: resp.map(image => image.url)})

  } catch (e) {
    res.status(400).json({message: "error"})
    console.log(e)
  }
})




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
    console.log(req.body)
    const dateDay = new Date({numberDay: date, taxiDriver, time, month, from})
    if(!dateDay) {
      console.log('error')
    }
    await dateDay.save()
    //const d = await Date.findOne({numberDay: date})
    // const departureDate = new DepartureDate({departureDate: dateDay._id})
    // await departureDate.save()
    res.json({message: "Date added success"})
  } catch (e) {
    res.status(400).json({message: e})
    console.log(e)
  }
})
router.post('/addpassengers', async (req, res) => {
  try {
    const {passenger, time, date} = req.body
    console.log(req.body)

    // const result = await Date.findOneAndUpdate({time, numberDay: date.date},{$push: {passengers: [...passenger]}})
    const result = await Date.findOneAndUpdate({time, numberDay: date.date},{$push: {passengers: passenger}})
    console.log(result)
    // if(!result) {
    //   return res.status(400).json({message: 'Date not found'})
    // }
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
    if (!date || !month || !from) {
      res.status(400).json({message: `Invalid params: date: ${date}, month: ${month}, from: ${from} `})
    }
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
    console.log('error')
    const arr = await Promise.all(result.map(async (item) => {

      return {
        ...item._doc,
        passengers: await findUser(item.passengers),
        time: item.time,
        date: item.numberDay
      }
    }))
    // console.log(arr)
    async function findUser(user) {
      let arr = []
      arr =  await Promise.all(user.map(async item => {
        const b = await User.findOne({_id: item})
        if (!b) return res.status(500).json({message: "ERROR"})
        return b.email
      }))
      return arr
    }
    // res.status(400).json({message: result})
    res.json(arr)

  } catch (e) {
    console.log(e)
  }
})

router


module.exports = router