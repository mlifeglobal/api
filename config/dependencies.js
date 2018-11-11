const lodash = require("lodash");
const bcrypt = require("bcryptjs");
const JWT = require("jsonwebtoken");
const request = require("request-promise");
const scheduler = require("node-schedule");
const Twilio = require("twilio");
const AfricasTalking = require("africastalking");
const asyncBusboy = require("async-busboy");
const csv = require("csvtojson");
const fs = require("fs");
const csvWriter = require("csv-writer").createObjectCsvWriter;
const shortid = require("shortid");
const AWS = require("aws-sdk");

AWS.config.update({
  accessKeyId: process.env.awsAccessKeyID,
  secretAccessKey: process.env.awsSecretKey
});

const twilio = new Twilio(process.env.twilioSID, process.env.twilioToken);
const africasTalking = AfricasTalking({
  apiKey: process.env.africasTalkingToken,
  username: process.env.africasTalkingUsername
});
const s3 = new AWS.S3();

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
  fs,
  csvWriter,
  shortid,
  s3
};
