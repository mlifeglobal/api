const lodash = require('lodash')
const bcrypt = require('bcryptjs')
const JWT = require('jsonwebtoken')
const request = require('request-promise')
const scheduler = require('node-schedule')
const Twilio = require('twilio')
const qs = require('querystring')
const axios = require('axios')

const twilio = new Twilio(process.env.twilioSID, process.env.twilioToken)

module.exports = { lodash, bcrypt, JWT, request, scheduler, twilio, qs, axios }
