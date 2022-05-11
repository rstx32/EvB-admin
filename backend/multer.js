const multer = require('multer')
const sha256 = require('crypto-js/sha256')

// define storage
// set destination path & filename
// filename : name are mixed email & timestamp with SHA256 encryption
const voterMulterStorage = multer.diskStorage({
  destination: 'public/photo/voters',
  filename: (req, file, cb) => {
    const name = sha256(req.body.email + Date.now())
    const extension = file.mimetype.split('/')[1]
    cb(null, 'voter-' + name + '.' + extension)
  },
})

const voterFileMulterStorage = multer.diskStorage({
  destination: 'backend',
  filename: (req, file, cb) => {
    cb(null, 'voterFile.xlsx')
  },
})

const candidateMulterStorage = multer.diskStorage({
  destination: 'public/photo/candidates',
  filename: (req, file, cb) => {
    const name = sha256(req.body.candidate + Date.now())
    const extension = file.mimetype.split('/')[1]
    cb(null, 'candidate-' + name + '.' + extension)
  },
})

// define filter
// extenstion must be JPG / JPEG
const multerFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
    cb(null, true)
  } else {
    cb(new Error('Not a JPG File!'), false)
  }
}

// use both above strorage & filter configuration
const voterUpload = multer({
  storage: voterMulterStorage,
  fileFilter: multerFilter,
  limits: { fileSize: 1000000 }, // max 1MB per photo
})

// voter file upload
const voterFileUpload = multer({
  storage: voterFileMulterStorage
})

// use both above strorage & filter configuration
const candidateUpload = multer({
  storage: candidateMulterStorage,
  fileFilter: multerFilter,
  limits: { fileSize: 1000000 }, // max 1MB per photo
})


module.exports = { voterUpload, voterFileUpload, candidateUpload }
