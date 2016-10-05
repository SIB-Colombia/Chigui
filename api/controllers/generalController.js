import mongoose from 'mongoose';
import async from 'async';
import winston from 'winston';
import add_objects from '../models/additionalModels.js';

function postElementVersion(element_model, element_version, id_rc) {
	element_version._id = mongoose.Types.ObjectId();
	element_version.created=Date();
	element_version.state="to_review";
	var elementName = element_version.element;
	console.log(elementName);
	//var elementValue = taxon_record_name_version.taxonRecordName;
	var elementValue = element_version[elementName];

	//taxon_record_name_version = new TaxonRecordNameVersion(taxon_record_name_version);
	element_version = new element_model(element_version);

	//var id_v = taxon_record_name_version._id;
    //var id_rc = req.swagger.params.id.value;

    var id_v = element_version._id;
}

module.exports = {
	postElementVersion
}