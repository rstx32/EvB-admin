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
  voterStatus: {
    type: String,
    enum: ['-', 'valid', 'invalid'],
    default: '-'
  },
  candidateStatus: {
    type: String,
    enum: ['-', 'valid', 'invalid'],
    default: '-'
  },
  voterReason: {
    type: String,
    default: '-'
  },
  candidateReason: {
    type: String,
    default: '-'
  },
  voterSolve: {
    type: String,
    enum: ['-', 'solved', 'unsolved', 'reject', 'accept'],
    default: '-'
  },
  candidateSolve: {
    type: String,
    enum: ['-', 'solved', 'unsolved', 'reject', 'accept'],
    default: '-'
  },
})

// model validator dengan menggunakan schema diatas
const Validator = mongoose.model('Validator', validatorSchema)

module.exports = Validator
