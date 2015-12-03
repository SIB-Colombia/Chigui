var express = require('express');
var router = express.Router();
var mongoDB = require('../config/server');
var mongoose = require('mongoose');
var Record = require('../app/models/record.js');

router.get('/', function(req, res) {
  //var response={};
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