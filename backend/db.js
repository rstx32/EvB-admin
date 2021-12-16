require('dotenv').config({ path: './backend/.env' })
const uri = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASS}@evb.5juvj.mongodb.net/${process.env.MONGODB_DB}?retryWrites=true&w=majority`
const mongoose = require('mongoose')
const { Voter } = require('./model/voter')
const CryptoJS = require('crypto-js')
const { ObjectId } = require('mongodb')
mongoose.connect(uri)

// add voter
const addVoter = (newVoter) => {
  new Voter({
    username: newVoter.username,
    email: newVoter.email,
    fullname: newVoter.fullname,
    password: CryptoJS.SHA256(newVoter.password),
  }).save()
}

// delete voter
const deleteVoter = async (id) => {
  await Voter.deleteOne({
    _id: ObjectId(id),
  })
}

// edit voter
const editVoter = (id) => {}

// const voter1 = new Voter({
//   username: 'rstx',
//   fullname: 'restu indera',
//   password: '0060ef32e6559dd496b32d950f229695a3994d3c28fa09b0ecfc2c5a48180ae9'
// })
// voter1.save().then((voter) => console.log(voter))

// client.connect((error, client) => {
//   if (error) return console.log(`koneksi gagal`)

//   // get all voters, project username & password only
//   const getAllVoters = db
//     .find()
//     .project({
//       username: 1,
//       password: 1,
//     })
//     .toArray((error, result) => {
//       if (error) return console.log(error)
//       console.log(result)
//     })

// find a voters
//   db.findOne(
//     { username: 'xtsr' },
//     {
//       projection: {
//         username: 1,
//         password: 1,
//       },
//     },
//     (error, result) => {
//       console.log(result)
//     }
//   )

// insert a voter
// db.insertOne(
//   {
//     username: 'sania',
//     fullname: 'sania nastasya viora',
//     password:
//       '643f67ca0cce632c8ddf6359f4abf2cc51a8f6cbb0197b633ebfc06646ad0241',
//     voting: false,
//   }
// ).then((result) => {
//     console.log(result)
// }).catch((error) => {
//     if(error.code===11000)
//         console.log(`data sudah ada!`);
// })

// edit a voters
//   db.updateOne(
//     {
//       username: 'rstx',
//     },
//     {
//       $set: {
//         fullname: 'restu indera dwihandoko',
//       },
//     },
//     (error, result) => {
//       if (error) return console.log('gagal mengubah data')
//       else return console.log('data berhasil diubah')
//     }
//   )

// delete a voters
//   db.deleteOne({
//     username: 'sania',
//   })
//     .then((result) => {
//       if (result.deletedCount === 0) console.log('data tidak dihapus!')
//       console.log(`berhasil menghapus data!`)
//     })
//     .catch((error) => {
//       console.log(error)
//     })
// })

module.exports = {
  addVoter,
  deleteVoter,
}
