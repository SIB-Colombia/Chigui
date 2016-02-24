var express = require('express');
var router = express.Router();
var mongoDB = require('../config/server');
var mongoose = require('mongoose');
var SynonymsAtomizedVersion = require('../app/models/synonymsAtomized.js');
var add_objects = require('../app/models/additionalModels.js');
var cors = require;

router.post('/post', function(req, res) {
  var synonyms_atomized_version  = req.body; 
  console.log(req.body); 
  var count_version= 0;
  add_objects.RecordVersion.count({type: 'synonymsAtomizedVersion'}, function (err, count) {
  	if (err)
  		res.send(err);
  	count_version=count;
  });

  add_objects.RecordVersion.count({ _id : synonyms_atomized_version._id }, function (err, count){ 
    if(count>0){
        //document exists });
    }
  }); 

  console.log("Numero de versiones: "+ count_version);
  synonyms_atomized_version._id=mongoose.Types.ObjectId();
  synonyms_atomized_version.version=count_version+1;
  synonyms_atomized_version = new SynonymsAtomizedVersion(synonyms_atomized_version);


  synonyms_atomized_version.save(function(err) {
            if (err)
                res.send(err);
            add_objects.RecordVersion.findByIdAndUpdate( synonyms_atomized_version.id_record, { $push: { "synonymsAtomizedVersion": synonyms_atomized_version._id } },{safe: true, upsert: true},function(err, model) {
                  	if (err)
                    	res.send(err);
                  	res.json({ message: 'Save SynonymsAtomizedVersion!' });
                  	console.log("Save SynonymsAtomizedVersion!");
            }); 
        });
});

router.get('/get/:element_id', function(req, res) {
    SynonymsAtomizedVersion.findOne({ '_id' : req.params.element_id }).exec(function (err, doc){
		if(err)
  			res.send(err);
  		res.json(docver);
	});
});

module.exports = router;