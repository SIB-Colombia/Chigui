var express = require('express');
var router = express.Router();
var mongoDB = require('../config/server');
var mongoose = require('mongoose');
var SynonymsAtomizedVersion = require('../app/models/synonymsAtomized.js');
var add_objects = require('../app/models/additionalModels.js');
var cors = require;

router.post('/post', function(req, res) {
  var synonyms_atomized_version  = req.body; 
  synonyms_atomized_version._id = mongoose.Types.ObjectId();
  console.log(req.body); 

  //Verify if the Json have  a RecordId(ID de la Ficha). If the Json don't have a id for record this will be created
  if(typeof  synonyms_atomized_version.id_record==="undefined" || synonyms_atomized_version.id_record==""){
    synonyms_atomized_version.id_record=mongoose.Types.ObjectId();
  }

  
  test=add_objects.RecordVersion.count({ _id : synonyms_atomized_version.id_record }, function (err, count){ 
    count_record=count;
    if(count==0){
        console.log("No exist record with id: "+synonyms_atomized_version.id_record);
    }
  }); 

  console.log(Object.keys(test));
  console.log(test.count);
  
  /*
  if(count_record==1){

    add_objects.RecordVersion.findById(synonyms_atomized_version._id, function(err, doc){
      if (err)
        res.send(err); //to do: throw error or message
      if(!doc){
        res.send("Document not found");
      }
      console.log("La ficha: "+RecordVersion);
      count_version=doc.synonymsAtomizedVersion.length;
    });
  };
  */

  synonyms_atomized_version._id=mongoose.Types.ObjectId();
  synonyms_atomized_version = new SynonymsAtomizedVersion(synonyms_atomized_version);

  var id_v = synonyms_atomized_version._id;
  var id_rc = synonyms_atomized_version.id_record; 

  var ob_ids= new Array();
  ob_ids.push(synonyms_atomized_version._id);
  console.log("ID de la ficha a crear: "+id_rc );

  add_objects.RecordVersion.count({ _id : id_rc }, function (err, count){ 
    if(count==0){
        add_objects.RecordVersion.create({ _id:id_rc, synonymsAtomizedVersion: ob_ids },function(err, doc){
  		if(err){
  			res.send(err);
  		}
  		synonyms_atomized_version.version=1;
  		synonyms_atomized_version.save(function(err) {
  			if(err){
  				res.send(err);
  			}
  			res.json({ message: 'Created a new Record and Save SynonymsAtomizedVersion!' });
  			console.log("Created a new Record and Save SynonymsAtomizedVersion!!");
  			});
  		});
    }else{
    	add_objects.RecordVersion.findByIdAndUpdate( synonyms_atomized_version.id_record, { $push: { "synonymsAtomizedVersion": synonyms_atomized_version._id } },{safe: true, upsert: true},function(err, doc) {
        if (err){
            res.send(err);
        }
        //console.log("Numero de SynonymsAtomizedVersion: "+doc.synonymsAtomizedVersion.length);
        synonyms_atomized_version.version=doc.synonymsAtomizedVersion.length+1;
        synonyms_atomized_version.save(function(err) {
  			if(err){
  				res.send(err);
  			}
  			res.json({ message: 'Save SynonymsAtomizedVersion!' });
        	console.log("Save SynonymsAtomizedVersion!");
  		});
        });
    }
  }); 
});

router.get('/get/:element_id', function(req, res) {
    SynonymsAtomizedVersion.findOne({ '_id' : req.params.element_id }).exec(function (err, doc){
		if(err)
  			res.send(err);
  		res.json(doc);
	});
});

module.exports = router;