const express = require('express')
const config = require('config')
const authRoute = require('./routes/auth.routes')
const mongoose = require('mongoose')
const PORT = config.get('serverPort')
const cors = require('./middleware/cors.middleware')
const testRoute = require('./routes/test.routes')

const taxiRoute = require('./routes/addTaxiDriver.routes')
const app = express()
app.use(express.json())
app.use(cors)
// первй парам, путь по которому ройт будет обрабатываться
app.use('/api/auth', authRoute)
app.use('/api/test', testRoute)
app.use('/api/taxi', taxiRoute)

const start = async () => {
  try {
    await mongoose.connect(config.get('databaseUrl'))
    app.listen(PORT, () => console.log('Server started on port', PORT))
  } catch (e) {
    console.log(e)
  }
}

start()