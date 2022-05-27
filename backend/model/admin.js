const mongoose = require('mongoose')
const passportLocalMongoose = require('passport-local-mongoose')
require('dotenv').config({ path: './backend/.env' })

// Connecting Mongoose
mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

// schema user admin
const Admin = new mongoose.Schema({
  username: String,
  password: String,
  voterAccess: {
    type: String,
    enum: ['allow', 'deny'],
    default: 'allow',
  },
  candidateAccess: {
    type: String,
    enum: ['allow', 'deny'],
    default: 'allow',
  },
})

Admin.plugin(passportLocalMongoose)

module.exports = mongoose.model('Admin', Admin)
