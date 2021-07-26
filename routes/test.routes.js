const express = require('express')
const router = new express()
const User = require('../models/User')


router.post("/nameUser", async (req, res) => {
  try {
    console.log(req.body.name)
    res.json({message: `User name is ${req.body.name}`})
    await User.updateOne({email: "test5@mail.ru"}, {userName: 'Alex'})
  } catch (e) {
    console.log(e)
  }
})

module.exports = router