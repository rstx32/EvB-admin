const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate-v2')

// schema voter
const voterSchema = new mongoose.Schema({
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
    default: "has not set yet",
  },
  public_key: {
    type: String,
    default: null,
  },
  photo: String,
})

voterSchema.plugin(mongoosePaginate)

// model voter dengan menggunakan schema diatas
const Voter = mongoose.model('Voter', voterSchema)

module.exports = Voter
