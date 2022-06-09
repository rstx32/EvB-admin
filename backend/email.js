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
    user: process.env.USERNAME_MAILTRAP,
    pass: process.env.PASSWORD_MAILTRAP,
  },
})

module.exports = { gmail, mailtrap }
