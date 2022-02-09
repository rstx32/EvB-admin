const multer = require('multer')
const sha256 = require('crypto-js/sha256')

// define storage
// set destination path & filename
// filename : name are mixed username & timestamp with SHA256 encryption
const multerStorage = multer.diskStorage({
  destination: 'public/photo/voters',
  filename: (req, file, cb) => {
    const name = sha256(req.body.username + Date.now())
    const extension = file.mimetype.split('/')[1]
    cb(null, 'voter-' + name + '.' + extension)
  },
})

// define filter
// extenstion must be JPG / JPEG
const multerFilter = (req, file, cb) => {
  if (
    file.mimetype.split('/')[1] === 'jpg' ||
    file.mimetype.split('/')[1] === 'jpeg'
  ) {
    cb(null, true)
  } else {
    cb(new Error('Not a JPG File!'), false)
  }
}

// use both above strorage & filter configuration
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: { fileSize: 1000000 }, // max 1MB per photo
})

module.exports = { upload }
