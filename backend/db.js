require('dotenv').config({ path: './backend/.env' })
const uri = `${process.env.MONGODB_URL}`
const mongoose = require('mongoose')
const CryptoJS = require('crypto-js')
const { Voter } = require('./model/voter')
const { ObjectId } = require('mongodb')
mongoose.connect(uri)

// get all voter
const getVoter = async () => {
  return await Voter.find()
}

// add voter
const addVoter = (newVoter) => {
  new Voter({
    username: newVoter.username,
    email: newVoter.email,
    fullname: newVoter.fullname,
    password: CryptoJS.SHA256(newVoter.password).toString(),
  }).save()
}

// delete voter
const deleteVoter = async (id) => {
  await Voter.deleteOne({
    _id: ObjectId(id),
  })
}

// edit voter
const editVoter = async (newVoter) => {
  await Voter.updateOne(
    {
      _id: ObjectId(newVoter.id),
    },
    {
      $set: {
        username: newVoter.username,
        email: newVoter.email,
        fullname: newVoter.fullname,
        password: CryptoJS.SHA256(newVoter.password).toString(),
      },
    }
  )
}

module.exports = {
  getVoter,
  addVoter,
  deleteVoter,
  editVoter,
}
