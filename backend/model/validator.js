const mongoose = require('mongoose')

// schema validator
const validatorSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
  },
  token: String,
  voter: {
    status: {
      type: String,
      enum: ['-', 'valid', 'invalid'],
      default: '-',
    },
    reason: {
      type: String,
      default: '-',
    },
    solve: {
      type: String,
      enum: ['-', 'solved', 'unsolved', 'reject', 'accept'],
      default: '-',
    },
  },
  candidate: {
    status: {
      type: String,
      enum: ['-', 'valid', 'invalid'],
      default: '-',
    },
    reason: {
      type: String,
      default: '-',
    },
    solve: {
      type: String,
      enum: ['-', 'solved', 'unsolved', 'reject', 'accept'],
      default: '-',
    },
  },
})

// model validator dengan menggunakan schema diatas
const Validator = mongoose.model('Validator', validatorSchema)

module.exports = Validator
