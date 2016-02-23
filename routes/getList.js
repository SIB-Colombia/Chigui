var express = require('express');
var router = express.Router();
var mongoDB = require('../config/server');
var mongoose = require('mongoose');
var Record = require('../app/models/record.js');
var TimeStamp = require('unix-timestamp');

router.get('/', function(req, res) {
  //var response={};
  var response=[];
  var query = Record.find({}).select('taxonRecordName associatedParty creation_date').sort({ _id: -1});
  var numpage = req.query.page;
  var per_page = req.query.per_page ;
  if(typeof numpage ==="undefined" || typeof per_page ==="undefined" || numpage.length==0 || per_page.length==0){
    query.exec(function (err, data) {
        if (err) 
          res.send(err);
        if(data.length==0){
          res.json({"message" : "No data in the database"});
        }else{
          var creation_date="";
          for(i=0;i<data.length;i++){
            if(typeof  data[i]._doc.creation_date==="undefined"){
              creation_date=data[i]._id.getTimestamp();
              data[i]._doc.creation_date =creation_date.toString();
            }
          }
          res.json(data);
      }
    });
  }else{
    Record.paginate({}, { select : 'taxonRecordName associatedParty creation_date', sort : { _id: -1 }, page: numpage, limit: per_page }, function(err, data) {
    if(err){
        response = {"error" : true,"message" : "Error fetching data"};
      }else{
        var creation_date="";
        for(i=0;i<data.docs.length;i++){
          if(typeof  data.docs[i]._doc.creation_date==="undefined"){
            creation_date=data.docs[i]._id.getTimestamp();
            data.docs[i]._doc.creation_date =creation_date.toString();
          }
        }
        response = data;
      }
      res.json(response);
    });
  }
  
});



module.exports = router;