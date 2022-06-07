const nodemailer = require('nodemailer')

const gmail = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: '',
    pass: '',
  },
})

const mailtrap = nodemailer.createTransport({
  host: 'smtp.mailtrap.io',
  port: 2525,
  auth: {
    user: '4e56d2a27d9572',
    pass: '81878f80487ec9',
  },
})

module.exports = { gmail, mailtrap }
