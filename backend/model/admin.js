const mongoose = require('mongoose')
const passportLocalMongoose = require('passport-local-mongoose')
require('dotenv').config({ path: './backend/config/.env' })

// Connecting Mongoose
mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

// schema user admin
const adminSchema = new mongoose.Schema({
  username: String,
  password: String,
  email: String,
  key: String,
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

adminSchema.plugin(passportLocalMongoose)

module.exports = mongoose.model('Admin', adminSchema)
