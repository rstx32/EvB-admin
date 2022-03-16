const mongoose = require('mongoose')

// schema voter
const voterSchema = mongoose.Schema({
  email: {
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
  public_key: String,
  photo: String,
})

// model voter dengan menggunakan schema diatas
const Voter = mongoose.model('Voter', voterSchema)

module.exports = Voter
