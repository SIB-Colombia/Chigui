var express = require('express');
var router = express.Router();
var mongoDB = require('../config/server');
var mongoose = require('mongoose');
var HierarchyVersion = require('../app/models/hierarchy.js');
var add_objects = require('../app/models/additionalModels.js');
var cors = require;

router.post('/post', function(req, res) {
  var hierarchy_version = req.body; 
  console.log(req.body); 
  var count_version= 0;
  add_objects.RecordVersion.count({type: 'hierarchyVersion'}, function (err, count) {
  	if (err)
  		res.send(err);
  	count_version=count;
  });
  console.log();
  hierarchy_version._id=mongoose.Types.ObjectId();
  hierarchy_version.version=count_version+1;
  hierarchy_version= new HierarchyVersion(hierarchy_version);



  hierarchy_version.save(function(err) {
            if (err)
                res.send(err);
            add_objects.RecordVersion.findByIdAndUpdate( hierarchy_version.id_record, { $push: { "HierarchyVersion": hierarchy_version._id} },{safe: true, upsert: true},function(err, model) {
                  	if (err)
                    	res.send(err);
                  	res.json({ message: 'Save HierarchyVersion!' });
                  	console.log("Save HierarchyVersion!");
            }); 
        });
});

router.get('/get/:element_id', function(req, res) {

    HierarchyVersion.findOne({ '_id' : req.params.element_id }).exec(function (err, doc){
		if(err)
  			res.send(err);
  		base_elements_models.BaseElementsVersion.findOne({ '_id' : req.params.element_id }).populate('baseElements').exec(function (err, docver){
			if(err)
  				res.send(err);
  			docver.baseElements=doc;
  			res.json(docver);
		});
	});
});

module.exports = router;