var mongoose = require('mongoose');
var async = require('async');
var fs = require('fs');
var TaxonRecordNameVersion = require('../models/taxonRecordName.js');
var SynonymsAtomizedVersion = require('../models/synonymsAtomized.js');
var CommonNamesAtomizedVersion = require('../models/commonNamesAtomized.js');
var ReferencesVersionVersion = require('../models/references.js');
var AncillaryDataVersion = require('../models/ancillaryData.js');
var HierarchyVersion = require('../models/hierarchy.js');
var ThreatStatusVersion = require('../models/threatStatus.js');
var add_objects = require('../models/additionalModels.js');
var parse = require('csv-parse');
var rest = require('restler');
var Schema = mongoose.Schema;

function ScriptException(message) {
   this.message = message;
   this.name = "ScriptException";
}

var CatalogoDb = mongoose.createConnection('mongodb://localhost:27017/catalogoDb', function(err) {
	if(err){
		console.log('connection error', err);
	}else{
		console.log('connection successful to the CatalogoDb');
		async.waterfall([
			function(callback){
				var texSchema = TaxonRecordNameVersion.schema;
				var TaxonRecordNameVersionModel = CatalogoDb.model('TaxonRecordNameVersion', texSchema );
				TaxonRecordNameVersionModel.find({}, function(err, records){
					if(err){
						console.log("Error finding the records in the database!: " + taxName);
						callback(new Error("failed getting something:" + err.message));
					}else{
						console.log("Number of Records found: " + records.length);
						if(records.length > 0){
							callback(null, records);
						}else{
							try{
          						throw new ScriptException("ScriptException for: " + taxName);
          					}catch (e){
          						callback(new Error("Zero records:" + e.message));
          					}
						}
					}
				});
			},
			function(taxon_records, callback){
				var id_search = [];
				async.eachSeries(taxon_records, function(taxon_record, callback){
					var taxName = taxon_record.taxonRecordName.scientificName.canonicalName.simple;
					var taxRecId = taxon_record.id_record;
					
					taxName = taxName.trim().replace(/ /g,"%20");
					console.log("Scientific name to search images: "+taxName);
					console.log("URL to consult: "+'http://eol.org/api/search/1.0.json?q='+taxName+'&page=1&exact=true&filter_by_taxon_concept_id=&filter_by_hierarchy_entry_id=&filter_by_string=&cache_ttl=');
					rest.get('http://eol.org/api/search/1.0.json?q='+taxName+'&page=1&exact=true&filter_by_taxon_concept_id=&filter_by_hierarchy_entry_id=&filter_by_string=&cache_ttl=').on('complete',function(data, response) {
						console.log("API Response Status code: "+ response.statusCode);
						if (!(data instanceof Error) && (response.statusCode == 200)) {
							console.log(data.results.length);
							//
							var value={};
							for(var i=0; i<data.results.length; i++){
								value.taxName = taxName;
								value.taxRecId = taxRecId;
								value.resultId = data.results[i].id;
								id_search.push(value);
							}
						}else{
							console.log('Error:', data.message);
						}
						callback();
					});
				},function(err){
					if(err){
						console.error("Error finding a taxonRecordName"+err.message);
					}else{
						console.log("All records processed");
						//callback(null, id_search);
					}
				});
			}, 
			function(id_search, callback){
				console.log(id_search.length);
				console.log(id_search);
				var image_search = [];
				async.eachSeries(id_search, function(id_image, callback){
					console.log("TaxName: "+id_image.taxName);
					rest.get('http://eol.org/api/pages/1.0/'+id_image.resultId+'.json?images=10&videos=0&sounds=0&maps=0&text=0&iucn=false&subjects=overview&licenses=all&details=true&common_names=false&synonyms=false&references=false&vetted=0&cache_ttl=').on('complete',function(data_id, response_id) {
						console.log("API Response Status code: "+ response_id.statusCode);
						console.log();
						if (!(data_id instanceof Error) && (response_id.statusCode == 200)) {
							var image_value={};
							var source = '';
							var url = '';
							console.log("Object length: "+data_id.dataObjects.length);
							for(var i=0; i<data_id.dataObjects.length; i++){
								if(typeof  data_id.dataObjects[i].eolMediaURL != 'undefined'){
                            		url =(data_id.dataObjects[i].eolMediaURL).replace(/'/g, "\''");
                            	}
                            	if(typeof  data_id.dataObjects[i].source != 'undefined'){
                            		source =(data_id.dataObjects[i].source).replace(/'/g, "\''");
                            	}
								image_value.taxName = id_image.taxName;
								image_value.taxRecId = id_image.taxRecId;
								image_value.resultId = id_image.resultId;
								image_value.imageLicense = data_id.dataObjects[i].license;
								image_value.imageRights = data_id.dataObjects[i].rights;
								image_value.rightsHolder = data_id.dataObjects[i].rightsHolder;
								image_value.source = source;
								image_value.url = url;
								image_search.push(image_value);
							}
						}else{
							console.log('Error:', data.message);
						}
						callback();
					});
				},function(err){
					if(err){
						console.error("Error finding a taxonRecordName"+err.message);
					}else{
						console.log("All records processed");
						//callback(null, image_search);
					}
				});
			},
			function(id_search, callback){
				console.log(id_search);
			}
		],function(err, result){
			if (err) {
				console.log("Error in the script!!: " + err);
			}else{
				console.log('done!');
			}
		});
	}
});