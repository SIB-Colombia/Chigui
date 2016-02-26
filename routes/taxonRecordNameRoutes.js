var express = require('express');
var router = express.Router();
var mongoDB = require('../config/server');
var mongoose = require('mongoose');
var TaxonRecordNameVersion = require('../app/models/taxonRecordName.js');
var add_objects = require('../app/models/additionalModels.js');
var cors = require;

router.post('/post', function(req, res) {
  var taxon_record_name_version  = req.body; 
  //console.log(taxon_record_name_version);
  taxon_record_name_version._id = mongoose.Types.ObjectId();

  //Verify if the Json have  a RecordId(ID de la Ficha). If the Json don't have a id for record this will be created
  if(typeof  taxon_record_name_version.id_record==="undefined" || taxon_record_name_version.id_record==""){
    taxon_record_name_version.id_record=mongoose.Types.ObjectId();
  }
  taxon_record_name_version.created=Date();
  taxon_record_name_version = new TaxonRecordNameVersion(taxon_record_name_version);

  var id_v = taxon_record_name_version._id;
  var id_rc = taxon_record_name_version.id_record;


  var ob_ids= new Array();
  ob_ids.push(id_v);

  add_objects.RecordVersion.count({ _id : id_rc }, function (err, count){ 
    console.log("El conteo: "+count);
    if(count==0){
      add_objects.RecordVersion.create({ _id:id_rc, taxonRecordNameVersion: ob_ids },function(err, doc){
        if(err){
          res.send(err);
        }
        taxon_record_name_version.version=1;
        taxon_record_name_version.save(function(err){
          if(err){
          res.send(err);
          }
          res.json({ message: 'Created a new Record and Save TaxonRecordNameVersion!' });
          console.log("Created a new Record and Save TaxonRecordNameVersion!!");
        });
      });
    }else{
      add_objects.RecordVersion.findByIdAndUpdate( taxon_record_name_version.id_record, { $push: { "taxonRecordNameVersion": taxon_record_name_version._id } },{safe: true, upsert: true},function(err, doc) {
        if (err){
            res.send(err);
        }
        taxon_record_name_version.version=doc.taxonRecordNameVersion.length+1;
        taxon_record_name_version.save(function(err){
          if(err){
          res.send(err);
          }
          res.json({ message: 'Save TaxonRecordNameVersion!' });
          console.log("Save TaxonRecordNameVersion!!");
        });
      });
    }
  });
      /*
  

  

  console.log("Con el modelo: "+taxon_record_name_version);

  
  */
  
});

router.get('/get/:element_id', function(req, res) {
    TaxonRecordNameVersion.findOne({ '_id' : req.params.element_id }).exec(function (err, doc){
		if(err)
  			res.send(err);
  		res.json(doc);
	});
});

module.exports = router;