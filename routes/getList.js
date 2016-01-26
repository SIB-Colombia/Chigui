var express = require('express');
var router = express.Router();
var mongoDB = require('../config/server');
var mongoose = require('mongoose');
var Record = require('../app/models/record.js');

router.get('/', function(req, res) {
  //var response={};
  var response=[];
  var query = Record.find({}).select('taxonRecordName associatedParty');
  var numpage = req.query.page;
  var per_page = req.query.per_page ;
  console.log("query: "+req.query)
  console.log("page: "+numpage);
  console.log("per_page: "+per_page);
  if(typeof numpage ==="undefined" || typeof per_page ==="per_page" || numpage.length==0 || per_page.length==0){
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
  }else{
    Record.paginate({}, { select : 'taxonRecordName associatedParty', page: numpage, limit: per_page }, function(err, data) {
    if(err){
        response = {"error" : true,"message" : "Error fetching data"};
      }else{
        console.log(data.length);
        response = data;
      }
      res.json(response);
    });
  }
  
});

/*
router.get('/pagination/:page/:limit',function(req, res){
  var response={};
  var queryp={};
  //var options ={select : 'taxonRecordName associatedParty'};
  Record.paginate({}, { select : 'taxonRecordName associatedParty', page: req.params.page, limit: req.params.limit }, function(err, data) {
    if(err){
        response = {"error" : true,"message" : "Error fetching data"};
      }else{
        console.log(data.length);
        response = data;
      }
      res.json(response);
  });
});
*/

module.exports = router;