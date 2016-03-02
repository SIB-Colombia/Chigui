var express = require('express');
var router = express.Router();
var mongoDB = require('../config/server');
var mongoose = require('mongoose');
var IdentificationKeysVersion = require('../app/models/identificationKeys.js');
var add_objects = require('../app/models/additionalModels.js');
var cors = require;

router.post('/post', function(req, res) {
  var identification_keys_version  = req.body; 
  //console.log(identification_keys_version);
  identification_keys_version._id = mongoose.Types.ObjectId();


  identification_keys_version.created=Date();
  identification_keys_version = new IdentificationKeysVersion(identification_keys_version);

  var id_v = identification_keys_version._id;
  var id_rc = identification_keys_version.id_record;


  var ob_ids= new Array();
  ob_ids.push(id_v);

  console.log("El id de la ficha: "+id_rc);

  if(typeof  id_rc!=="undefined" && id_rc!=""){
  	add_objects.RecordVersion.count({ _id : id_rc }, function (err, count){ 
    	//console.log("El conteo: "+count);
    	console.log(id_rc);
    	if(count==0){
    		res.json({message: "The Record (Ficha) with id: "+id_rc+" doesn't exist."});
   	 }else{
    	  add_objects.RecordVersion.findByIdAndUpdate( identification_keys_version.id_record, { $push: { "identificationKeysVersion": id_v } },{safe: true, upsert: true},function(err, doc) {
    	    if (err){
    	        res.send(err);
    	    }
    	    console.log(doc.identificationKeysVersion.length);
    	    identification_keys_version.version=doc.identificationKeysVersion.length+1;
    	    identification_keys_version.save(function(err){
    	      if(err){
    	      	res.send(err);
    	      }
    	      res.json({ message: 'Save IdentificationKeysVersion!', elemnt: 'IdentificationKeys' });
    	      console.log("Save IdentificationKeysVersion!!");
    	    });
    	  });
    	}
  	});
  }else{
  	res.json({message: "The information doesn't have the id for the Record (Ficha)"});
  }
});

router.get('/get/:element_id/', function(req, res) {
	/*
    IdentificationKeysVersion.findOne({ '_id' : req.params.element_id }).exec(function (err, doc){
		if(err)
  			res.send(err);
  		res.json(doc);
	});
	*/
	add_objects.RecordVersion.findOne({ _id : id_rc }).populate('identificationKeysVersion').exec(function (err, record) {
  	if (err){
  		return handleError(err);
  	};
  	res.json(record.identificationKeysVersion.length);
	});
});

router.get('/getversions/:element_id', function(req, res) {
    IdentificationKeysVersion.findOne({ '_id' : req.params.element_id }).exec(function (err, doc){
		if(err)
  			res.send(err);
  		res.json(doc);
	});
});

module.exports = router;