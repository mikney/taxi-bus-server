const Router = require('express')
const router = new Router()
const User = require('../models/User')




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


module.exports = router