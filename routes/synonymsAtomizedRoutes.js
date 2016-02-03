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
  var syav = req.body; 
  var sya= req.body.synonymsAtomized; 
  var ancd =sya.ancillaryData; //anc_temp
  var ancd_scientificName =sya.scientificName.ancillaryData; //anc_temp
  delete syav.synonymsAtomized;
  delete sya.ancillaryData;
  delete sya.scientificName.ancillaryData
  syav._id=mongoose.Types.ObjectId();
  console.log(syav._id);
  syav= new synonym_objects.SynonymsAtomizedVersion(syav);
  sya._id=mongoose.Types.ObjectId();
  sya.trn_ver=sya._id;
  sya = new synonym_objects.SynonymsAtomized(sya);

  var references = [];

  //References for the element
  for(i=0;i<ancd.length;i++){
  	ancd[i]._id=mongoose.Types.ObjectId();
  	ancd[i].element=sya._id;
    references.concat(ancd[i].reference);
  }

  for(j=0;j<ancd_scientificName.length;j++){
    ancd_scientificName[i].id=mongoose.Types.ObjectId();
    ancd_scientificName[i].element=sya.scientificName_id;
    references.concat(ancd_scientificName[i].reference);
  }


  syav.save(function(err) {
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