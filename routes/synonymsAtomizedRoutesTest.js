var express = require('express');
var router = express.Router();
var mongoDB = require('../config/server');
var mongoose = require('mongoose');
var synonym_objects = require('../app/models/synonymsAtomized.js');
var add_objects = require('../app/models/additionalModels.js');
var cors = require;


/* POST */

router.post('/post', function(req, res) {
  //En esta variable se guarda la versión del elemento, con los datos relacionados, como fecha de creación
  var synonyms_atomized_version = req.body; 
  //En esta variable se guarda el elemento, que puede ser de un único valor o un arreglo
  var synonyms_atomized= req.body.synonymsAtomized;

  //variable para guardar los ancillary data del elemento
  var ancd_element = [];
  //variable para guardar los ancillary  de los nombres científicos
  var ancd_scientificName = [];

  //variable para guardar las referencias

  var temp_ancd=[];

  var temp_ref = [];

  var references = [];

  //for para pasar los ancillary Data de cada elemento
  for ( i = 0; i <synonyms_atomized.length ; i++) {
    synonyms_atomized[i]._id=mongoose.Types.ObjectId();
    for (j = 0; j < synonyms_atomized[i].ancillaryData.length; j++) {
      temp_ref.concat(synonyms_atomized[i].ancillaryData[j].reference);
      //reemplazamos la referencia por el listado de id's de referencias
      synonyms_atomized[i].ancillaryData[j].reference=[];
      for(k = 0 ; k<temp_ref.length; k++){
        temp_ref[k]._id=mongoose.Types.ObjectId();
        temp_ref[k].element=synonyms_atomized[i]._id;
        synonyms_atomized[i].ancillaryData[j].reference.push(temp_ref[k]._id);
      }
      references.concat(temp_ref);
    };
    for(l = 0; l < synonyms_atomized[i].scientificName.length; l++){
      synonyms_atomized[i].scientificName[l]._id=mongoose.Types.ObjectId();
      temp_ref=[];
      for(j = 0; j < synonyms_atomized[i].scientificName[l].ancillaryData.length; j++){
        temp_ref.concat(synonyms_atomized[i].scientificName[l].ancillaryData[j].reference);
        synonyms_atomized[i].scientificName[l].ancillaryData[j].reference=[];
        for(k = 0 ; k<temp_ref.length; k++){
          temp_ref[k]._id=mongoose.Types.ObjectId();
          temp_ref[k].element=synonyms_atomized[i].scientificName[l]._id;
          synonyms_atomized[i].scientificName[l].ancillaryData[j].reference.push(temp_ref[k]._id);
        }
        references.concat(temp_ref);
      }
    }
  };
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