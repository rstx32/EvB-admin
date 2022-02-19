const mongoose = require('mongoose')
const passportLocalMongoose = require('passport-local-mongoose')
require('dotenv').config({ path: './backend/.env' })

// Connecting Mongoose
mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

// schema user admin
const User = new mongoose.Schema({
  username: String,
  password: String,
})

User.plugin(passportLocalMongoose)

module.exports = mongoose.model('User', User)
