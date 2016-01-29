var express = require('express');
var router = express.Router();
var mongoDB = require('../config/server');
var mongoose = require('mongoose');
var taxon_objects = require('../app/models/taxonRecordName.js');
var add_objects = require('../app/models/additionalModels.js');
var cors = require;


/* POST */

router.post('/post', function(req, res) {
  var trnv = req.body; 
  console.log(req.body);
  var trn= req.body.taxonRecordName; 
  var anc_temp =trn.ancillaryData;
  delete trnv.taxonRecordName;
  delete trn.ancillaryData;
  trnv._id=mongoose.Types.ObjectId();
  console.log(trnv._id);
  trnv= new taxon_objects.TaxonRecordNameVersion(trnv);
  trn._id=mongoose.Types.ObjectId();
  trn.trn_ver=trnv._id;
  trn = new taxon_objects.TaxonRecordName(trn);

  for(i=0;i<anc_temp.length;i++){
  	anc_temp[i]._id=mongoose.Types.ObjectId();
  	anc_temp[i].element=trn._id;
  }

  trnv.save(function(err) {
            if (err)
                res.send(err);
            trn.save(function(err) {
            	if (err)
                	res.send(err);
            	add_objects.AncillaryData.create(anc_temp, function(err) {
            		if (err)
                		res.send(err);
                	res.json({ message: 'Record created!' });
            		console.log("Record created!");
            	});
            });  
        });
});

router.get('/get/:ficha_id', function(req, res) {
    taxon_objects.TaxonRecordName.findOne({ 'trn_ver' : req.params.ficha_id }).exec(function (err, doc){
		if(err)
  			res.send(err);
  		taxon_objects.TaxonRecordNameVersion.findOne({ '_id' : req.params.ficha_id }).populate('taxonRecordName').exec(function (err, docver){
			console.log("algo");
			if(err)
  				res.send(err);
  			docver.taxonRecordName=doc;
  			res.json(docver);
		});
	});


	

	
});

router.get('/getrn/:ficha_id', function(req, res) {
	taxon_objects.TaxonRecordName.find({ '_id' : req.params.ficha_id }).populate('trn_ver').exec(function (err, docs){
		console.log("algo");
		if(err)
  			res.send(err);
  		res.json(docs);
	});
});


module.exports = router;