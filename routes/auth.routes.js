const Router = require('express')
const User = require('../models/User')
const Taxi = require('../models/TaxiDriver')
const router = new Router()
const bcrypt = require('bcryptjs')
const config = require('config')
const jwt = require('jsonwebtoken')
const {check, validationResult} = require('express-validator')
const authMiddleware = require("../middleware/auth.middleware")
const mailer = require( "../core/mailer")


//создаем роут,
router.post(
  '/login',
  //первый парам поле которое надо валидировать
  [
    check('email',"Incorrect email").isLength({min: 4, max:20}),
    check('password', 'Password must be longer than 3 and shorter than 12').isLength({min: 3, max:12})
  ],
  async (req, res) => {
  try {
    const error = validationResult(req)
    if (!error.isEmpty()) {
      return res.status(401).json({message: 'Incorrect request ', error})
    }
    const {email, password, isLongExpire} = req.body
    // проверяем есть ли пользователь в нашей базе данных
    const candidate = await User.findOne({email})
    // если есть выдаем ошибку
    if (candidate) {
      //return res.status(401).json({message: `User with email ${email} already exists`})
      const isPassValid = bcrypt.compareSync(password, candidate.password)
      if (!isPassValid) {
        return res.status(404).json({message: 'Invalid password'})
      }
      const token = jwt.sign({id: candidate.id}, config.get('secretKey') , {expiresIn: isLongExpire ? "1y" : "1h"})
      return res.json({
        token,
        user: {
          id: candidate.id,
          email: candidate.email,
          userName: candidate.userName,
          avatar: candidate?.avatar,
        }
      })
    }
    const taxiDriver = await Taxi.findOne({email})
    if (taxiDriver) {
      const isPassValid = bcrypt.compareSync(password, taxiDriver.password)
      if (!isPassValid) {
        return res.status(404).json({message: 'Invalid password'})
      }
      const token = jwt.sign({id: taxiDriver.id}, config.get('secretKey'), {expiresIn: isLongExpire ? "1y" : "1h"})
      return res.json({
        token,
        user: {
          id: taxiDriver.id,
          email: taxiDriver.email,
          userName: taxiDriver.name,
          avatar: taxiDriver?.avatar,
          role: 'taxi'
        }
      })
    }
    if (!candidate) {
      return res.json({
        needCreate: true
      })
    }
    // хешируем пароль
    const hashPass = bcrypt.hashSync(password, 7)
    // создаем нового пользователя
    const user = new User({email, password: hashPass})
    // сохраним пользователя в базе данных
    await user.save()
    return res.json({message: "User was created"})
  } catch (e) {
    console.log(e)
    res.send("Server error ", e)
  }
  }
)

router.post("")

let verificationNumber = 533521

router.post('/verification', ((req, res) => {
  const {email} = req.body
  if (!email) {
    return res.status(300).json({message: "Email is not valid"})
  }
  verificationNumber = Math.round(Math.random() * 100000)
  mailer.sendMail(
    {
      from: "test@gmail.com",
      to: email,
      subject: "Подтверждение почты BOOK TAXI",
      html: `<h3>Для того, чтобы зарегистироваться введите код в форму подтверждения</h3><h1>Код подтверждения: ${verificationNumber}</h1>`,
    },
    function (err , info) {
      if (err) {
        console.log(err);
      } else {
        console.log(info);
        res.json({message: "Success"})

      }
    }
  )
}))

router.post("/create", (async (req, res) => {
  try {
    const {phone, password, email, checkCode} = req.body

    console.log(typeof checkCode)
    if (checkCode == verificationNumber) {
      const hashPass = bcrypt.hashSync(password, 7)
      // создаем нового пользователя
      const user = new User({email: phone, password: hashPass})
      // сохраним пользователя в базе данных
      await user.save()
      return res.json({message: "Пользователь был создан", confirmCreate: true})
    } else {
      res.status(200).json({message: "Не верный код"})
    }
  }
  catch (e) {
    console.log(e)
    res.status(400).json({message: "Server error"})
  }
}))



router.get("/auth", authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({_id: req.user.id})
    const longExpire = req?.query?.longExpire

    if (user) {
      const token = jwt.sign({id: user.id}, config.get('secretKey'), {expiresIn: longExpire ? "1y" : "1h"})
      return res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          userName: user.userName,
          currentOrder: user.currentOrder,
          avatar: user.avatar
        }
      })
    }
    const taxiDriver = await Taxi.findOne({_id: req.user.id})
    if (taxiDriver) {
      const token = jwt.sign({id: taxiDriver.id}, config.get('secretKey'), {expiresIn: longExpire ? "1y" : "1h"})
      return res.json({
        token,
        user: {
          id: taxiDriver.id,
          email: taxiDriver.email,
          userName: taxiDriver.name,
          role: 'taxi',
          avatar: taxiDriver?.avatar
        }
      })
    }
    res.status(400).json({message: 'User not found'})
  } catch (e) {
    console.log(e)
  }
})

router.post('/taxisign', async (req, res) => {
  const {email, password, name, carMake} = req.body
  const hashPassword = bcrypt.hashSync(password,7)

  const driver = new Taxi({email, password: hashPassword, name, carMake})
  await driver.save()
  return res.json({message: 'Driver taxi created'})
})

router.get('/test', (req, res) => {
  mailer.sendMail(
    {
      from: "test@gmail.com",
      to: "zherkovpasha@gmail.com",
      subject: "Подтверждение почты React Chat Tutorial",
      html: `Для того, чтобы подтвердить почту, перейдите по этой ссылке</a>`,
    },
    function (err , info) {
      if (err) {
        console.log(err);
      } else {
        console.log(info);
        res.json({message: "Success"})

      }
    }
  )
})



module.exports = router
