var express = require('express');
var router = express.Router();
var mongoDB = require('../config/server');
var mongoose = require('mongoose');
var CommonNamesAtomizedVersion = require('../app/models/commonNamesAtomized.js');
var add_objects = require('../app/models/additionalModels.js');
var cors = require;

router.post('/post', function(req, res) {
  var common_names_atomized_version  = req.body; 
  common_names_atomized_version._id = mongoose.Types.ObjectId();
  console.log(req.body); 

  //Verify if the Json have  a RecordId(ID de la Ficha). If the Json don't have a id for record this will be created
  if(typeof  common_names_atomized_version.id_record==="undefined" || common_names_atomized_version.id_record==""){
    common_names_atomized_version.id_record=mongoose.Types.ObjectId();
  } 

  common_names_atomized_version._id=mongoose.Types.ObjectId();
  common_names_atomized_version = new CommonNamesAtomizedVersion(common_names_atomized_version);

  var id_v = common_names_atomized_version._id;
  var id_rc = common_names_atomized_version.id_record; 

  var ob_ids= new Array();
  ob_ids.push(id_v);

  add_objects.RecordVersion.count({ _id : id_rc }, function (err, count){ 
    if(count==0){
        add_objects.RecordVersion.create({ _id : id_rc, commonNamesAtomizedVersion: ob_ids },function(err, doc){
  		if(err){
  			res.send(err);
  		}
  		common_names_atomized_version.version=1;
  		common_names_atomized_version.save(function(err) {
  			if(err){
  				res.send(err);
  			}
  			res.json({ message: 'Created a new Record and Save CommonNamesAtomizedVersion!' });
  			console.log("Created a new Record and Save CommonNamesAtomizedVersion!!");
  			});
  		});
    }else{
    	add_objects.RecordVersion.findByIdAndUpdate( id_rc, { $push: { "commonNamesAtomizedVersion": id_v } },{safe: true, upsert: true},function(err, doc) {
        if (err){
            res.send(err);
        }
        common_names_atomized_version.version=doc.commonNamesAtomizedVersion.length+1;
        common_names_atomized_version.save(function(err) {
  			if(err){
  				res.send(err);
  			}
  			res.json({ message: 'Save CommonNamesAtomizedVersion!' });
        	console.log("Save CommonNamesAtomizedVersion!");
  		});
        });
    }
  }); 
});

router.get('/get/:element_id', function(req, res) {
    CommonNamesAtomizedVersion.findOne({ '_id' : req.params.element_id }).exec(function (err, doc){
		if(err)
  			res.send(err);
  		res.json(doc);
	});
});

module.exports = router;