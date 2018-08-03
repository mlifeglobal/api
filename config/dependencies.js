const lodash = require('lodash')
const bcrypt = require('bcryptjs')
const JWT = require('jsonwebtoken')
const request = require('request-promise')
const scheduler = require('node-schedule')

module.exports = { lodash, bcrypt, JWT, request, scheduler }
