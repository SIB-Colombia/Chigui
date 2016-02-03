var express = require('express');
var router = express.Router();
var mongoDB = require('../config/server');
var mongoose = require('mongoose');
var synonym_objects = require('../app/models/synonymsAtomized.js');
var add_objects = require('../app/models/additionalModels.js');
var cors = require;


/* POST */

router.post('/post', function(req, res) {
  //var temp= req.body.taxonRecordName;
  var synonyms_atomized_version = req.body; 
  var synonyms_atomized= req.body.synonymsAtomized; 
  for(k=0;k<synonyms_atomized.length;k++){
    var ancd_element = [];
    var ancd_scientificName = [];
    ancd_element.concat(synonyms_atomized[k].ancillaryData);
    //ancd_scientificName.concat(synonyms_atomized[k].scientificName.ancillaryData);
  }
  var ancd =sya.ancillaryData; //anc_temp
  var ancd_scientificName =sya.scientificName.ancillaryData; //anc_temp
  delete synonyms_atomized_version.synonymsAtomized;
  delete sya.ancillaryData;
  delete sya.scientificName.ancillaryData
  synonyms_atomized_version._id=mongoose.Types.ObjectId();
  console.log(synonyms_atomized_version._id);
  synonyms_atomized_version= new synonym_objects.SynonymsAtomizedVersion(synonyms_atomized_version);
  sya._id=mongoose.Types.ObjectId();
  sya.trn_ver=sya._id;
  sya = new synonym_objects.SynonymsAtomized(sya);

  var references = [];

  //References for the element
  for(i=0;i<ancd_element.length;i++){
  	ancd[i]._id=mongoose.Types.ObjectId();
  	ancd[i].element=sya._id;
    references.concat(ancd[i].reference);
  }

  for(j=0;j<ancd_scientificName.length;j++){
    ancd_scientificName[i].id=mongoose.Types.ObjectId();
    ancd_scientificName[i].element=sya.scientificName_id;
    references.concat(ancd_scientificName[i].reference);
  }


  synonyms_atomized_version.save(function(err) {
            if (err)
                res.send(err);
            sya.save(function(err) {
            	if (err)
                	res.send(err);
            	add_objects.AncillaryData.create(ancd, function(err) {
            		if (err)
                  res.send(err);
                add_objects.RecordVersion.findByIdAndUpdate( syav.record, { $push: { "synonymsAtomizedVersion": syav._id} },{safe: true, upsert: true},function(err, model) {
                  if (err)
                    res.send(err);
                  res.json({ message: 'Record created!' });
                  console.log("Record created!");
                });
            	});
            });  
        });
});

router.get('/get/:element_id', function(req, res) {

    synonym_objects.SynonymsAtomized.findOne({ 'sya_ver' : req.params.element_id }).exec(function (err, doc){
		if(err)
  			res.send(err);
  		synonym_objects.SynonymsAtomizedVersion.findOne({ '_id' : req.params.element_id }).populate('synonymsAtomized').exec(function (err, docver){
			if(err)
  				res.send(err);
  			docver.synonymsAtomized=doc;
  			res.json(docver);
		});
	});
});



module.exports = router;