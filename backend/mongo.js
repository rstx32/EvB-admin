const { MongoClient } = require('mongodb')
require('dotenv').config({path: './backend/.env'})

const uri = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASS}@evb.5juvj.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`
const client = new MongoClient(uri)
const db = client.db('data-list').collection('voters')

client.connect((error, client) => {
  if (error) return console.log(`koneksi gagal`)

  // get all voters, project username & password only
  //   db.find()
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
})
