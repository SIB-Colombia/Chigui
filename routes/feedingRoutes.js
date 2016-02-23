var express = require('express');
var router = express.Router();
var mongoDB = require('../config/server');
var mongoose = require('mongoose');
var FeedingVersion = require('../app/models/feeding.js');
var add_objects = require('../app/models/additionalModels.js');
var cors = require;