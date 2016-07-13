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
				
				async.eachSeries(taxon_records, function(taxon_record, callback){
					var taxName = taxon_record.taxonRecordName.scientificName.canonicalName.simple;
					//var taxName = "Ursus maritimus";
					var taxRecId = taxon_record.id_record;
					taxName = taxName.trim().replace(/ /g,"%20");
					console.log("Scientific name: " + taxName);
					if(taxName != ''){
						async.waterfall([
							function(callback){
								var ids_to_search = [];
								console.log("Scientific name to search images: " + taxName);
								console.log("URL to consult: "+'http://eol.org/api/search/1.0.json?q='+taxName+'&page=1&exact=true&filter_by_taxon_concept_id=&filter_by_hierarchy_entry_id=&filter_by_string=&cache_ttl=');
								rest.get('http://eol.org/api/search/1.0.json?q='+taxName+'&page=1&exact=true&filter_by_taxon_concept_id=&filter_by_hierarchy_entry_id=&filter_by_string=&cache_ttl=').on('complete',function(data, response) {
									console.log("API Response Status code: "+ response.statusCode);
									if (!(data instanceof Error) && (response.statusCode == 200)) {
										var value={};
										//console.log(data);
										for(var i=0; i < data.results.length; i++){
											value.taxName = taxName;
											value.taxRecId = taxRecId;
											value.resultId = data.results[i].id;
											ids_to_search.push(value);
										}
										callback(null, ids_to_search);
									}else{
										console.log('Error:', data.message);
										callback("Error");
									}
								});
							},
							function(ids_to_search,callback){
								console.log(ids_to_search);
								var image_search = [];
								async.eachSeries(ids_to_search, function(id_image, callback){
									console.log("id_image: " + id_image);
									console.log("id: " + id_image.resultId);
									console.log("taxon: " + id_image.taxName);
									console.log('URL to consult: '+'http://eol.org/api/pages/1.0/'+id_image.resultId+'.json?images=10&videos=0&sounds=0&maps=0&text=0&iucn=false&subjects=overview&licenses=all&details=true&common_names=false&synonyms=false&references=false&vetted=0&cache_ttl='); 
									rest.get('http://eol.org/api/pages/1.0/'+id_image.resultId+'.json?images=10&videos=0&sounds=0&maps=0&text=0&iucn=false&subjects=overview&licenses=all&details=true&common_names=false&synonyms=false&references=false&vetted=0&cache_ttl=').on('complete',function(data_id, response_id) {
										console.log("API Response Status code: "+ response_id.statusCode);
										if (!(data_id instanceof Error) && (response_id.statusCode == 200)) {
											var image_value={};
											var source = '';
											var url = '';
											for(var i=0; i<data_id.dataObjects.length; i++){
												image_value={};
												if(typeof  data_id.dataObjects[i].eolMediaURL != 'undefined'){
                            						image_value.url =(data_id.dataObjects[i].eolMediaURL).replace(/'/g, "\''");
                            					}
                            					if(typeof  data_id.dataObjects[i].source != 'undefined'){
                            						image_value.source =(data_id.dataObjects[i].source).replace(/'/g, "\''");
                            					}
                            					if(typeof  data_id.dataObjects[i].rights != 'undefined'){
                            						image_value.imageRights =(data_id.dataObjects[i].rights).replace(/'/g, "\''");
                            					}
                            					if(typeof  data_id.dataObjects[i].rightsHolder != 'undefined'){
                            						image_value.rightsHolder =(data_id.dataObjects[i].rightsHolder).replace(/'/g, "\''");
                            					}
												image_value.taxName = id_image.taxName;
												image_value.taxRecId = id_image.taxRecId;
												image_value.resultId = id_image.resultId;
												image_value.imageLicense = data_id.dataObjects[i].license;
												image_search.push(image_value);

											}
											console.log(image_search);
											callback();
										}else{
											console.log('Error:', data_id.message);
											callback(err);
										}
									});
								},function(err){
									if(err){
										console.error("Error finding a taxonRecordName"+err.message);
									}else{
										console.log("All records processed");
										callback(null, image_search);
									}
								});
							},
							function(image_search, callback){
								Flickr.tokenOnly(flickrOptions, function(err, flickr) {
									if(err){
										console.log("Error calling Flickr API");
										callback(err);
									}else{
										flickr.photos.search({
											{
              									group_id: "2287605@N22",
              									json: true,
              									text: taxName
            								},function(err,body){
            									if(!err && body.stat == "ok"){
            										if(body.photos.total > 0) {
            											var photos = body.photos.total;
            											callback(null, image_search, flickr, photos);
            										}else{

            										}
            									}else{

            									}
										});
									}
								});
							},
							function(image_search, photos, flickr, callback){
								flickr.photos.getInfo({
                              		json: true,
                              		photo_id: id
                            	},function(err, body) {
                            		if (!err && body.stat == "ok") {
                            			var license;
                                    	if(body.photo.id!=null) {
                                    		switch(body.photo.license){
                                    			case "0":
                                                	license = "All Rights Reserved";
                                                break;
                                            	case "1":
                                                	license = "http://creativecommons.org/licenses/by-nc-sa/2.0/";
                                                break;
                                            	case "2":
                                                	license = "http://creativecommons.org/licenses/by-nc/2.0/";
                                                break;
                                            	case "3":
                                                	license = "http://creativecommons.org/licenses/by-nc-nd/2.0/";
                                                break;
                                            	case "4":
                                                	license = "http://creativecommons.org/licenses/by/2.0/";
                                                break;
                                            	case "5":
                                                	license = "http://creativecommons.org/licenses/by-sa/2.0/";
                                                break;
                                            	case "6":
                                                	license = "http://creativecommons.org/licenses/by-nd/2.0/";
                                                break;
                                            	case "7":
                                                	license = "http://flickr.com/commons/usage/";
                                                break;
                                            	case "8":
                                                	license = "http://www.usa.gov/copyright.shtml";
                                                break;
                                    		}

                                    		callback(null, image_search, flickr, photos, license);
                                    	}
                            		}else{
                            			console.log("Error calling Flickr API!");
										callback(err);
                            		}
                            	});
							}
							],function(err, result){
								if (err) {
									console.log("Error in the script!!: " + err);
								}else{
									console.log('done!');
									callback(); //****
								}
							});
					}else{
						console.log('Error:', "No exist a taxon to search in the Record");
						callback();
					}
				},function(err){
					if(err){
						console.error("Error finding a taxonRecordName"+err.message);
					}else{
						console.log("All records processed");
						console.log("!!");
						callback(null, 'done');
					}
				});
			}
			],function(err, result){
				if (err) {
					console.log("Error in the script!!: " + err);
				}else{
					console.log('done!!');
					//TODO: End connection with the db
				}
		});
	}
});