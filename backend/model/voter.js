const mongoose = require('mongoose')

// schema voter
const Voter = mongoose.model('Voter', {
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
})

module.exports = {
  Voter,
}
