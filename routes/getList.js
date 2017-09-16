var express = require('express');
var mongoosePaginate = require('mongoose-paginate');
var router = express.Router();
var mongoDB = require('../config/server');
var mongoose = require('mongoose');
var TaxonRecordNameVersion = require('../app/models/taxonRecordName.js');
var AssociatedPartyVersion = require('../app/models/associatedParty.js');
var add_objects = require('../app/models/additionalModels.js');
var RecordVersion = require('mongoose').model('RecordVersion').schema;
var cors = require;

var exports = module.exports = {};

exports.getList = function(req, res) {
  var ver=req.params.version;
  add_objects.RecordVersion.find({ _id : id_rc }).populate('associatedPartyVersion taxonRecordNameVersion').exec(function (err, records) {
    if(records){
      console.log(records.length);
    }else{
      res.status(406);
      res.json({message: "Error getting the list"});
    }
  });
};

router.get('/', function(req, res) {
  //var response={};
  var response=[];
  var query = Record.find({}).select('taxonRecordName AssociatedPartyVersion');
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