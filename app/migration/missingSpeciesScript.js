var mongoose = require('mongoose');
var async = require('async');
var fs = require('fs');
var TaxonRecordNameVersion = require('../models/taxonRecordName.js');
var SynonymsAtomizedVersion = require('../models/synonymsAtomized.js');
var CommonNamesAtomizedVersion = require('../models/commonNamesAtomized.js');
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
	if(err) {
      console.log('connection error', err);
    }else{
    	console.log('connection successful to the CatalogoDb');
    	async.waterfall([
    		function(callback){ 
    			console.log("!!Starting script");
        		//RecordModel.find({}).exec(callback);
        		//Leer el archivo, Read the file
        		var data = [];
        		var input = fs.createReadStream("/home/inaturalist/Desktop/TAX.csv");
        		var parser = parse({delimiter: ','});
        		parser.on('readable', function(){
  					while(record = parser.read()){
    					data.push(record);
  					}
				});
				parser.on('finish', function(){
					callback(null, data);
				});
				input.pipe(parser);
        		//var stream = fs.createReadStream(inputFile).pipe(parser);
        		
        	},
        	function(data,callback){
        		console.log("Number of scientific names to search: "+data.length);
        		console.log("***Saving RecordVersion and taxonRecordName***");
        		var newRecordSchema = add_objects.RecordVersion.schema;
          		var newRecordModel = CatalogoDb.model('RecordVersion', newRecordSchema );

          		var texSchema = TaxonRecordNameVersion.schema;
          		var TaxonRecordNameVersionModel = CatalogoDb.model('TaxonRecordNameVersion', texSchema );
          		var ob_ids= new Array();
          		//data=data.shift();
          		sData=data.slice(1, data.length);
          		async.eachSeries(sData, function(line, callback) {
          			/*
          			console.log(sData.length);
          			console.log(sData[sData.length-1]);
          			*/
          			var name=line[2].trim().replace(/ /g,"%20");
          			var id_record = '';


          			async.waterfall([function(callback){
          				console.log("Scientific Name to search: "+name);
          				rest.get('http://api.gbif.org/v1/species?name='+name+'&limit=1').on('complete', function(data) {
  							console.log(data); // auto convert to object
  							if(data.results.length > 0){
  								var taxonRecordName = {};
          						taxonRecordName.scientificName = {};
          						taxonRecordName.scientificName.canonicalName = {};
          						taxonRecordName.scientificName.canonicalAuthorship = {};
          						taxonRecordName.scientificName.publishedln = {};
  								taxonRecordName.scientificName.simple = (data.results[0].scientificName !== undefined) ? data.results[0].scientificName : '';
								taxonRecordName.scientificName.rank = (data.results[0].rank !== undefined) ? data.results[0].rank : '';
								taxonRecordName.scientificName.canonicalName.simple = (data.results[0].canonicalName !== undefined) ? data.results[0].canonicalName : '';
								taxonRecordName.scientificName.canonicalAuthorship.simple = (data.results[0].authorship !== undefined) ? data.results[0].authorship : '';
								taxonRecordName.scientificName.publishedln.simple = (data.results[0].publishedIn !== undefined) ? data.results[0].publishedIn : '';
								callback(null, data, name, taxonRecordName);
							}else{
								console.log("No results for the name!: " + name);
								throw new ScriptException("No results for the name: " + name);
							}
							});
          				},
          				function(data, name, taxonRecordName, callback){
          				//taxonRecordName.scientificName.simple ='';
          				if(taxonRecordName.scientificName.simple!==undefined && taxonRecordName.scientificName.simple!==''){
          					var taxon_record_name_version = {};
          					id_record = mongoose.Types.ObjectId();
          					taxon_record_name_version._id = mongoose.Types.ObjectId();
          					taxon_record_name_version.id_record = id_record;
          					taxon_record_name_version.created=Date(); //***
            				taxon_record_name_version.id_user="sib+ac@humboldt.org.co";
            				taxon_record_name_version.state="to review";
            				taxon_record_name_version.element="taxonRecordName";
            				taxon_record_name_version = new TaxonRecordNameVersionModel(taxon_record_name_version);
            				var id_v = taxon_record_name_version._id;
            				var id_rc = taxon_record_name_version.id_record;
            				var ver = 1; //**
            				ob_ids.push(id_v);
            				taxon_record_name_version.taxonRecordName = taxonRecordName;
            				if(typeof  taxon_record_name_version.taxonRecordName!=="undefined" && taxon_record_name_version.taxonRecordName!=""){
            				newRecordModel.create({ _id:id_rc, taxonRecordNameVersion: ob_ids },function(err, doc){
            					if(err){
            						console.log("Saving taxonRecordName Error!: "+err+" id_record: "+id_rc);
            						callback(null, data, name);
            					}else{
            						taxon_record_name_version.version=1;
                					taxon_record_name_version.save(function(err){
                  						if(err){
                    						console.log("Saving taxonRecordName Error!: "+err+" id_record: "+id_rc);
                    						callback(null, data, name);
                  						}else{
                    						console.log({ message: 'Created a new Record and Save TaxonRecordNameVersion', element: 'TaxonRecordName', version : ver, _id: id_v, id_record : id_rc });
                    						callback(null, data, name);
                  						}
                					});	
            					}
            				});
            				}else{
            				console.log({message: "Empty data in version of the element taxonRecordName, id_record: "+id_rc});
              				callback();
            				}
            			}else{
            				console.log("No exist simple!: " + name);
							throw new ScriptException("No exist simple: " + name);
            			}
          			},
          			function(data, name, callback){
          				console.log("Saving Hierarchy!: "+name);
          				var hierarchy = [];
          				var hier = {};
          				if(data.results[0].kingdom !== undefined){
          					hier.kingdom=data.results[0].kingdom;
          					hier.phylum = (data.results[0].phylum !== undefined) ? data.results[0].phylum : '';
							hier.classHierarchy = (data.results[0].class !== undefined) ? data.results[0].class : '';
							hier.order = (data.results[0].order !== undefined) ? data.results[0].order : '';
							hier.family = (data.results[0].family !== undefined) ? data.results[0].family : '';
							hier.genus = (data.results[0].genus !== undefined) ? data.results[0].genus : '';
							hier.taxonRank = (data.results[0].rank !== undefined) ? data.results[0].rank : '',
							hier.parentTaxon = (data.results[0].parent !== undefined) ? data.results[0].parent : '';
							var ancillaryData = [];
							var anc = {};
							anc.source = (data.results[0].accordingTo !== undefined) ? data.results[0].accordingTo : '';
							ancillaryData.push(anc);
							hier.ancillaryData = ancillaryData;
							hierarchy.push(hier);
							callback(null, data, name, hierarchy);
						}else{
							console.log("No get information about kingdom: " + name);
							throw new ScriptException("No get information about kingdom: " + name);
						}
          			},
          			function(data, name, hierarchy, callback){
          				console.log("Id Record: "+id_record);
          				var hierarchySchema = HierarchyVersion.schema;
          				var HierarchyVersionModel = CatalogoDb.model('HierarchyVersion', hierarchySchema );
          				var hierarchy_version = {}; 
            			var ob_ids= new Array();
            			hierarchy_version.hierarchy = hierarchy;
            			hierarchy_version._id = mongoose.Types.ObjectId();
            			hierarchy_version.id_record=id_record;
            			hierarchy_version.created=Date(); 
            			hierarchy_version.id_user="sib+ac@humboldt.org.co";
            			hierarchy_version.state="to review";
            			hierarchy_version.element="hierarchy";
            			hierarchy_version = new HierarchyVersionModel(hierarchy_version);
            			var id_v = hierarchy_version._id;
            			ob_ids.push(id_v);
            			if(typeof  hierarchy_version.hierarchy!=="undefined" && hierarchy_version.hierarchy!=""){
            				newRecordModel.count({ _id : id_record }, function (err, count){
            					if(typeof count!=="undefined"){
            						if(count==0){
            							console.log({message: "The Record (Ficha) with id: "+id_rc+" doesn't exist."});
            						}else{
            							newRecordModel.findByIdAndUpdate( id_record, { $push: { "hierarchyVersion": id_v } },{safe: true, upsert: true},function(err, doc) {
                      						if (err){
                        						console.log("Saving hierarchy Error!: "+err+" id_record: "+id_rc);
                        						callback(null, data, name);
                      						}else{
                        						//hierarchy_version.id_record=id_record;
                        						hierarchy_version.version=doc.hierarchyVersion.length+1;
                       							var ver = hierarchy_version.version;
                        						hierarchy_version.save(function(err){
                          							if(err){
                            							console.log("Saving hierarchy Error!: "+err+" id_record: "+id_rc);
                           								callback(null, data, name);
                          							}else{
                            							console.log({ message: 'Save HierarchyVersion', element: 'hierarchy', version : ver, _id: id_v, id_record : id_record });
                            							callback(null, data, name);
                          							}		
                        						});
                      						}
                    					});
            						}
            					}

            				});
            			}else{
            				console.log({message: "Empty data in version of the element hierarchy, id_record: "+id_rc});
              				callback(null, data, name);
            			}
          			},
          			function(data, name, callback){
          				var keyValue ='';
          				switch (data.results[0].rank.toLowerCase()) {
							case 'kingdom':
								keyValue = data.results[0].kingdomKey;
								break;
							case 'phylum':
								keyValue = data.results[0].phylumKey;
								break;
							case 'class':
								keyValue = data.results[0].classKey;
								break;
							case 'order':
								keyValue = data.results[0].orderKey;
								break;
							case 'family':
								keyValue = data.results[0].familyKey;
								break;
							case 'genus':
								keyValue = data.results[0].genusKey;
								break;
							case 'species':
								keyValue = data.results[0].speciesKey;
								break;
							default:
								keyValue = '';
						}
						if(keyValue !== ''){
							console.log(keyValue);
							rest.get('http://api.gbif.org/v1/species/' + keyValue + '/synonyms').on('complete', function(result) {
							//rest.get('http://api.gbif.org/v1/species/' + 'asdsad' + '/synonyms').on('complete', function(result) {
								var synonymsAtomized = [];
								if (result.results !== undefined && result.results.length > 0) {
									for(var i = 0; i < result.results.length; i++){
										var syno = {};
										var canonicalName = {};
										var canonicalAuthorship = {};
										var publishedIn = {};
										syno.simple = (result.results[i].scientificName !== undefined) ? result.results[i].scientificName : '';
										syno.rank = (result.results[i].rank !== undefined) ? result.results[i].rank : '';
										canonicalName.simple = (result.results[i].canonicalName !== undefined) ? result.results[i].canonicalName : '';
										canonicalAuthorship.simple = (result.results[i].authorship !== undefined) ? result.results[i].authorship : '';
										publishedIn.source = (result.results[i].publishedIn !== undefined) ? result.results[i].publishedIn : '';
										syno.synonymStatus = (result.results[i].nomenclaturalStatus !== undefined && result.results[i].nomenclaturalStatus[0] !== undefined) ? data_1.results[i].nomenclaturalStatus : '';
										syno.canonicalName = canonicalName;
										syno.canonicalAuthorship = canonicalAuthorship;
										syno.publishedIn = publishedIn;
										synonymsAtomized.push(syno);
									}
									callback(null, data, name, synonymsAtomized, keyValue);
								}else{
									console.log("No get information about synonymsAtomized: " + name);
									throw new ScriptException("No get information about synonymsAtomized: " + name); //****
								}
							});
						}else{
							console.log("No get information about synonyms and commonNames: " + name);
							throw new ScriptException("No get information about synonyms and commonNames: " + name);
						}
          			},
          			function(data, name, synonymsAtomized, keyValue, callback){
          				rest.get('http://api.speciesplus.net/api/v1/taxon_concepts.json?name='+taxonName, { headers : {'X-Authentication-Token' : 'xl3tUZ6wEEzQmqMSXra5Awtt'}}).on('complete', function(data) {
          					if(data.taxon_concepts[0].synonyms !== undefined){
          						for(var i = 0; i < data.taxon_concepts[0].synonyms.length; i++){
									var syno = {};
									var canonicalName = {};
									var canonicalAuthorship = {};
									var publishedIn = {};
									syno.simple = data.taxon_concepts[0].synonyms[i].full_name;
									syno.rank = data.taxon_concepts[0].synonyms[i].rank;
									canonicalName.simple = data.taxon_concepts[0].synonyms[i].full_name;
									canonicalAuthorship.simple = data.taxon_concepts[0].synonyms[i].author_year;
									publishedIn.source = 'CITES';
									syno.synonymStatus = '';
									syno.canonicalName = canonicalName;
									syno.canonicalAuthorship = canonicalAuthorship;
									syno.publishedIn = publishedIn;
									synonymsAtomized.push(syno);
								}
								callback(null, data, name, synonymsAtomized, keyValue);
          					}else{
          						callback(null, data, name, synonymsAtomized, keyValue);
          					}
          				});
          			},
          			function(data, name, synonymsAtomized, keyValue, callback){
          				if(synonymsAtomized.length !== 0){ 
          					var synonyms_atomized_version = {}; 
          					var synonymsAtomizedSchema = SynonymsAtomizedVersion.schema;
          					var SynonymsAtomizedVersionModel = catalogoDb.model('SynonymsAtomizedVersion', synonymsAtomizedSchema );
            				ob_ids= new Array();
            				synonyms_atomized_version.synonymsAtomized = synonymsAtomized;
            				synonyms_atomized_version._id = mongoose.Types.ObjectId();
            				synonyms_atomized_version.id_record=record._id;
            				synonyms_atomized_version.created=record._id.getTimestamp(); //***
            				synonyms_atomized_version.id_user="sib+ac@humboldt.org.co";
            				synonyms_atomized_version.state="to review";
            				synonyms_atomized_version.element="synonymsAtomized";
            				synonyms_atomized_version = new SynonymsAtomizedVersionModel(synonyms_atomized_version);
            				var id_v = synonyms_atomized_version._id;
            				var id_rc = synonyms_atomized_version.id_record;
            				ob_ids.push(id_v);
            				if(typeof  synonyms_atomized_version.synonymsAtomized!=="undefined" && synonyms_atomized_version.synonymsAtomized!=""){
              					newRecordModel.count({ _id : id_rc }, function (err, count){
                					if(typeof count!=="undefined"){
                  						if(count==0){
                    						console.log({message: "The Record (Ficha) with id: "+id_rc+" doesn't exist."});
                  						}else{
                    						newRecordModel.findByIdAndUpdate( id_rc, { $push: { "synonymsAtomizedVersion": id_v } },{safe: true, upsert: true},function(err, doc) {
                      							if (err){
                        							console.log("Saving synonymsAtomized Error!: "+err+" id_record: "+id_rc);
                        							callback();
                      							}else{
                        							synonyms_atomized_version.id_record=id_rc;
                        							synonyms_atomized_version.version=doc.synonymsAtomizedVersion.length+1;
                        							var ver = synonyms_atomized_version.version;
                        							synonyms_atomized_version.save(function(err){
                          								if(err){
                           									console.log("Saving synonymsAtomized Error!: "+err+" id_record: "+id_rc);
                           									callback();
                          								}else{
                           									console.log({ message: 'Save SynonymsAtomizedVersion', element: 'synonymsAtomized', version : ver, _id: id_v, id_record : id_rc });
                           									callback();
                          								}
                        							});
                      							}
                    						});
                  						}
                					}
              					});
            				}else{
              					console.log({message: "Empty data in version of the element synonymsAtomized, id_record: "+id_rc});
              					callback();
            					}
          				}else{
          					console.log({message: "Empty data in version of the element synonymsAtomized, id_record: "+id_rc});
          					callback(null, data, name, keyValue);
          				}
          			},
          			function(data, name, synonymsAtomized, keyValue, callback){
          				rest.get('http://api.gbif.org/v1/species/' + keyValue + '/vernacularNames').on('complete', function(result) {
							//rest.get('http://api.gbif.org/v1/species/' + 'asdsad' + '/synonyms').on('complete', function(result) {
								var commonNamesAtomized = [];

								if (result.results !== undefined && result.results.length > 0) {
									for(var i = 0; i < result.results.length; i++){
										var comm = {};
										var usedIn = {};
										comm.name = (data_1.results[i].vernacularName !== undefined) ? data_1.results[i].vernacularName : '';
										comm.language =(data_1.results[i].language !== undefined) ? $scope.findLanguageName(data_1.results[i].language) : '';
										usedIn.distributionUnstructured =(data_1.results[i].area !== undefined) ? data_1.results[i].area : '';
          								comm.usedIn = usedIn;
										commonNamesAtomized.push(comm);
									}
									callback(null, data, name, synonymsAtomized, commonNamesAtomized);
								}else{
									console.log("No get information about synonymsAtomized: " + name);
									throw new ScriptException("No get information about synonymsAtomized: " + name); //****
								}
						});
          			},
          			function(data, name, synonymsAtomized, commonNamesAtomized, callback ){
          				rest.get('http://api.speciesplus.net/api/v1/taxon_concepts.json?name='+taxonName, { headers : {'X-Authentication-Token' : 'xl3tUZ6wEEzQmqMSXra5Awtt'}}).on('complete', function(result) {
          					var cites = [];
          					if(result.taxon_concepts[0].cites_listings!== undefined && result.taxon_concepts[0].cites_listings.length>0){
          						for (var i = 0; i < data.taxon_concepts[0].cites_listings.length; i++) {
          							var appendix = data.taxon_concepts[0].cites_listings[i].appendix;
										if(appendix==='I'){
											cites.push("Apéndice I");
										}else if(appendix==='II'){
											cites.push("Apéndice II");
										}else{
											cites.push("Apéndice III");
										}
          						}
          						var threatStatus = [];
          						var theat = {};
          						var threatStatusAtomized = {};
          						threatStatusAtomized.apendiceCITES = cites;
          						theat.threatStatusAtomized = threatStatusAtomized;
          						threatStatus.push(theat);
          						callback(null, data,  result);
          					}else{
          						callback(null, data, name, synonymsAtomized, commonNamesAtomized, threatStatus);
          					}
          				});
          			}, 
          			function(callback){
          				console.log("Next element");
          			}
          			function(callback){
          				console.log("Next element");
          			},
          			function(err, result) {
          				if (err) {
            				console.log("Error: "+err);
          				}else{
            				console.log('done!');
          				}
        			}
          			]);
          			
          			
          			
            		/*
            		
            		*/
          		}, function(err){
              		// if any of the file processing produced an error, err would equal that error
              		if( err ) {
                		// One of the iterations produced an error.
                		// All processing will now stop.
                		console.log('A file failed to process');
              		} else {
                		console.log('All files have been processed successfully');
                		callback(null, dataN, catalogoDb);
              		}
          		});
        	},
        	function(data, catalogoDb,callback){ 
          		CatalogoDb=mongoose.disconnect();
        	},
        	function(err, result) {
          		if (err) {
            		console.log("Error: "+err);
          		}else{
            		console.log('done!');
          		}
        	}
        ]);
    }
});