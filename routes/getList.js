var express = require('express');
var router = express.Router();
var mongoDB = require('../config/server');
var mongoose = require('mongoose');
var Record = require('../app/models/record.js');

router.get('/', function(req, res) {
  //var response={};
  console.log("Algo");
  console.log(req.baseUrl);
  console.log(req.hostname);
  console.log(req.ip);
  console.log(req.originalUrl);
  console.log(req.path);
  console.log(req.protocol);
  var response=[];
  var query = Record.find({}).select('taxonRecordName associatedParty');
  query.exec(function (err, data) {
        if (err) 
        	res.send(err);
        console.log(data.length);
        if(data.length==0){
        	res.json({"message" : "No data in the database"});
        }else{
        	res.json(data);
    	}
  });
});

module.exports = router;