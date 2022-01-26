const mongoose = require('mongoose')

// schema voter
const voterSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  fullname: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: String,
  photo: String,
})

// model voter dengan menggunakan schema diatas
const Voter = mongoose.model('Voter', voterSchema)

module.exports = Voter
