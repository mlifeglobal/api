const lodash = require('lodash')
const bcrypt = require('bcryptjs')
const JWT = require('jsonwebtoken')
const request = require('request-promise')
const scheduler = require('node-schedule')
const Twilio = require('twilio')
const AfricasTalking = require('africastalking')
const asyncBusboy = require('async-busboy')
var csv = require('csvtojson')
var fs = require('fs')

const twilio = new Twilio(process.env.twilioSID, process.env.twilioToken)
const africasTalking = AfricasTalking({
  apiKey: process.env.africasTalkingToken,
  username: process.env.africasTalkingUsername
})

module.exports = {
  lodash,
  bcrypt,
  JWT,
  request,
  scheduler,
  twilio,
  africasTalking,
  asyncBusboy,
  csv,
  fs
}
