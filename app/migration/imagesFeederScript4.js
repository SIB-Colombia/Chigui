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
				var ids_to_search = [];
				async.eachSeries(taxon_records, function(taxon_record, callback){
					var taxName = taxon_record.taxonRecordName.scientificName.canonicalName.simple;
					var taxRecId = taxon_record.id_record;
					taxName = taxName.trim().replace(/ /g,"%20");
					console.log("Scientific name: " + taxName);
					if(taxName != ''){
						async.waterfall([
							function(callback){
								console.log("Scientific name to search images: " + taxName);
								console.log("URL to consult: "+'http://eol.org/api/search/1.0.json?q='+taxName+'&page=1&exact=true&filter_by_taxon_concept_id=&filter_by_hierarchy_entry_id=&filter_by_string=&cache_ttl=');
								rest.get('http://eol.org/api/search/1.0.json?q='+taxName+'&page=1&exact=true&filter_by_taxon_concept_id=&filter_by_hierarchy_entry_id=&filter_by_string=&cache_ttl=').on('complete',function(data, response) {
									console.log("API Response Status code: "+ response.statusCode);
									if (!(data instanceof Error) && (response.statusCode == 200)) {
										var value={};
										console.log(data);
										for(var i=0; i < data.results.length; i++){
											value.taxName = taxName;
											value.taxRecId = taxRecId;
											value.resultId = data.results[i].id;
											ids_to_search.push(value);
										}
										callback(null, ids_to_search);
									}else{
										console.log('Error:', data.message);
										//callback("Error");
									}
								});
							},
							function(ids_to_search,callback){
								console.log(ids_to_search);
								async.eachSeries(ids_to_search, function(id_image, callback){
									console.log(id_image);
								},function(err){
									if(err){
										console.error("Error finding a taxonRecordName"+err.message);
									}else{
										console.log("All records processed");
										callback(null, image_search, taxon_records);
									}
								});
							}
							],function(err, result){
								if (err) {
									console.log("Error in the script!!: " + err);
								}else{
									console.log('done!');
								}
							});
					}else{
						console.log('Error:', "No exist a taxon to search in the Record");
						callback();
					}
					/*
					
					
					
					if(taxName != ''){
						console.log("Scientific name to search images: "+taxName);
						console.log("URL to consult: "+'http://eol.org/api/search/1.0.json?q='+taxName+'&page=1&exact=true&filter_by_taxon_concept_id=&filter_by_hierarchy_entry_id=&filter_by_string=&cache_ttl=');
						rest.get('http://eol.org/api/search/1.0.json?q='+taxName+'&page=1&exact=true&filter_by_taxon_concept_id=&filter_by_hierarchy_entry_id=&filter_by_string=&cache_ttl=').on('complete',function(data, response) {
							console.log("API Response Status code: "+ response.statusCode);
							if (!(data instanceof Error) && (response.statusCode == 200)) {
								//console.log(data.results.length);
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
					}else{
						console.log('Error:', "No exist a taxon to search in the Record");
						callback();
					}
					*/
				},function(err){
					if(err){
						console.error("Error finding a taxonRecordName"+err.message);
					}else{
						console.log("All records processed");
					}
				});
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