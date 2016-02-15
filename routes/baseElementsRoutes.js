var express = require('express');
var router = express.Router();
var mongoDB = require('../config/server');
var mongoose = require('mongoose');
var base_elements_models = require('../app/models/baseElements.js');
var add_objects = require('../app/models/additionalModels.js');
var cors = require;

router.post('/post', function(req, res) {
  var base_elements_version = req.body; 
  console.log(req.body);
  var base_elements_element= req.body.baseElements; 
  delete base_elements_version.baseElements;
  base_elements_version._id=mongoose.Types.ObjectId();
  base_elements_version= new base_elements_models.BaseElementsVersion(base_elements_version);
  base_elements_element._id=mongoose.Types.ObjectId();
  base_elements_element.id_version=base_elements_version._id;
  base_elements_element = new base_elements_models.BaseElements(base_elements_element);


  base_elements_version.save(function(err) {
            if (err)
                res.send(err);
            base_elements_element.save(function(err) {
            	if (err)
                	res.send(err);
            	add_objects.RecordVersion.findByIdAndUpdate( base_elements_version.id_record, { $push: { "BaseElementsVersion": base_elements_version._id} },{safe: true, upsert: true},function(err, model) {
                  	if (err)
                    	res.send(err);
                  	res.json({ message: 'Save BaseElementsVersion!' });
                  	console.log("Save BaseElementsVersion!");
                });
            });  
        });
});

router.get('/get/:element_id', function(req, res) {

    base_elements_models.BaseElements.findOne({ 'id_version' : req.params.element_id }).exec(function (err, doc){
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