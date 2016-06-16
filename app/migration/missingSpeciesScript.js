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
        		var newRecordSchema = add_objects.RecordVersion.schema;
          		var newRecordModel = CatalogoDb.model('RecordVersion', newRecordSchema );
          		//data=data.shift();
          		sData=data.slice(1, data.length);
          		async.eachSeries(sData, function(line, callback) {
          			/*
          			console.log(sData.length);
          			console.log(sData[sData.length-1]);
          			*/
          			//var name=line[2].trim().replace(/ /g,"%20");
          			//var name = line[2];
          			var name ="Panthera onca";
          			var id_record = '';

          			console.log("*** Taxon to search: " + name + " ***");

          			async.waterfall([
          			function(callback){
          				/*
          				TaxonRecordNameVersion.find({'taxonRecordName.canonicalName.simple': name }, ,function(err,records){

          				});
          				*/
          				console.log("Search in the database for : " + name);
          				var texSchema = TaxonRecordNameVersion.schema;
          				var TaxonRecordNameVersionModel = CatalogoDb.model('TaxonRecordNameVersion', texSchema );
          				TaxonRecordNameVersionModel.find({'taxonRecordName.scientificName.canonicalName.simple': name }, function(err, records){
          					if(err){
          						console.log("Error finding scientific Name in the database!: " + name);
								throw new ScriptException("Error finding scientific Name in the database!: " + name);
          					}else{
          						console.log(records.length);
          						//if(records.length > 0){
          						if(false){
          							console.log("The scientific name exist in the database!");
          							//new ScriptException("The scientific name exist!: " + name);
          							//callback(new Error("failed getting something:" + "The scientific name exist in the database"));
          							try{
          								throw new ScriptException("No results for the name: " + name);
          							}catch (e){
          								callback(new Error("failed getting something:" + e.message));
          							}
          						}else{
          							callback();
          						}
          					}
          				});
          			},
          			function(callback){
          				name = name.trim().replace(/ /g,"%20");
          				console.log("Scientific Name to search in the GBIF API: "+name);
          				rest.get('http://api.gbif.org/v1/species?name='+name+'&limit=1').on('complete', function(data) {
  							console.log("gbif api for "+ name +JSON.stringify(data)); // auto convert to object
  							if(data.results.length > 0){ //*************************
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
								callback(null, data, taxonRecordName);
							}else{
								console.log("No results for the name!: " + name);
								try{
          							throw new ScriptException("No results for the name: " + name);
          						}catch (e){
          							callback(new Error("failed getting something:" + e.message));
          						}
							}
							});
          			},
          			function(data, taxonRecordName, callback){
          				//taxonRecordName.scientificName.simple ='';
          				if(taxonRecordName.scientificName.simple!==undefined && taxonRecordName.scientificName.simple!==''){
          					var texSchema = TaxonRecordNameVersion.schema;
          					var TaxonRecordNameVersionModel = CatalogoDb.model('TaxonRecordNameVersion', texSchema );
          					var ob_ids= new Array();
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
            						callback(null, data);
            					}else{
            						taxon_record_name_version.version=1;
                					taxon_record_name_version.save(function(err){
                  						if(err){
                    						console.log("Saving taxonRecordName Error!: "+err+" id_record: "+id_rc);
                    						callback(null, data);
                  						}else{
                    						console.log({ message: 'Created a new Record and Save TaxonRecordNameVersion', element: 'TaxonRecordName', version : ver, _id: id_v, id_record : id_rc });
                    						callback(null, data);
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
          			function(data, callback){
          				console.log("Saving Hierarchy!: " + name);
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
							callback(null, data, hierarchy);
						}else{
							console.log("No get information about kingdom: " + name);
							throw new ScriptException("No get information about kingdom: " + name);
						}
          			},
          			function(data, hierarchy, callback){
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
                        						callback(null, data);
                      						}else{
                        						//hierarchy_version.id_record=id_record;
                        						hierarchy_version.version=doc.hierarchyVersion.length+1;
                       							var ver = hierarchy_version.version;
                        						hierarchy_version.save(function(err){
                          							if(err){
                            							console.log("Saving hierarchy Error!: "+err+" id_record: "+id_rc);
                           								callback(null, data);
                          							}else{
                            							console.log({ message: 'Save HierarchyVersion', element: 'hierarchy', version : ver, _id: id_v, id_record : id_record });
                            							callback(null, data);
                          							}		
                        						});
                      						}
                    					});
            						}
            					}

            				});
            			}else{
            				console.log({message: "Empty data in version of the element hierarchy, id_record: "+id_rc});
              				callback(null, data);
            			}
          			},
          			function(data, callback){
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
							console.log("KeyValue: "+keyValue);
							rest.get('http://api.gbif.org/v1/species/' + keyValue + '/synonyms').on('complete', function(result) {
								console.log("gbif SPECIES (synonymsAtomized) api for "+ keyValue +JSON.stringify(result));
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
									callback(null, data, synonymsAtomized, keyValue);
								}else{
									console.log("No get information about synonymsAtomized: " + name);
									//throw new ScriptException("No get information about synonymsAtomized: " + name); //****
									callback(null, data, synonymsAtomized, keyValue);
								}
							});
						}else{
							console.log("No get information about synonyms and commonNames: " + name);
							throw new ScriptException("No get information about synonyms and commonNames: " + name);
						}
          			},
          			function(data, synonymsAtomized, keyValue, callback){
          				console.log("Name to synonymsAtomized: " + name);
          				rest.get('http://api.speciesplus.net/api/v1/taxon_concepts.json?name=' + name, { headers : {'X-Authentication-Token' : 'xl3tUZ6wEEzQmqMSXra5Awtt'}}).on('complete', function(data) {
          					console.log("speciesplus SPECIES (synonymsAtomized) api for "+ name +JSON.stringify(data));
          					console.log("DATA: " + data);
          					console.log("DATA: " + JSON.stringify(data));
          					console.log("Keys: " + Object.keys(data));
          					console.log("Keys: " + data.taxon_concepts);
          					console.log("pag: " + data.pagination);
          					console.log("pagkeys: " + Object.keys(data.pagination));
          					//if(data.taxon_concepts[0].synonyms !== undefined){
          					if(data.taxon_concepts[0] !== undefined){
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
								callback(null, data, synonymsAtomized, keyValue);
          					}else{
          						callback(null, data, synonymsAtomized, keyValue);
          					}
          				});
          			},
          			function(data, synonymsAtomized, keyValue, callback){
          				if(synonymsAtomized.length !== 0){ 
          					var synonyms_atomized_version = {}; 
          					var synonymsAtomizedSchema = SynonymsAtomizedVersion.schema;
          					var SynonymsAtomizedVersionModel = CatalogoDb.model('SynonymsAtomizedVersion', synonymsAtomizedSchema );
            				ob_ids= new Array();
            				synonyms_atomized_version.synonymsAtomized = synonymsAtomized;
            				synonyms_atomized_version._id = mongoose.Types.ObjectId();
            				synonyms_atomized_version.id_record = id_record;
            				synonyms_atomized_version.created = Date(); //***
            				synonyms_atomized_version.id_user="sib+ac@humboldt.org.co";
            				synonyms_atomized_version.state="to review";
            				synonyms_atomized_version.element="synonymsAtomized";
            				synonyms_atomized_version = new SynonymsAtomizedVersionModel(synonyms_atomized_version);
            				var id_v = synonyms_atomized_version._id;
            				ob_ids.push(id_v);
            				if(typeof  synonyms_atomized_version.synonymsAtomized!=="undefined" && synonyms_atomized_version.synonymsAtomized!=""){
              					newRecordModel.count({ _id : id_record }, function (err, count){
                					if(typeof count!=="undefined"){
                  						if(count==0){
                    						console.log({message: "The Record (Ficha) with id: " + id_record + " doesn't exist."});
                  						}else{
                    						newRecordModel.findByIdAndUpdate( id_record, { $push: { "synonymsAtomizedVersion": id_v } },{safe: true, upsert: true},function(err, doc) {
                      							if (err){
                        							console.log("Saving synonymsAtomized Error!: "+err+" id_record: "+id_rc);
                        							callback(null, data, keyValue);
                      							}else{
                        							synonyms_atomized_version.id_record=id_record;
                        							synonyms_atomized_version.version=doc.synonymsAtomizedVersion.length+1;
                        							var ver = synonyms_atomized_version.version;
                        							synonyms_atomized_version.save(function(err){
                          								if(err){
                           									console.log("Saving synonymsAtomized Error!: "+err+" id_record: "+id_rc);
                           									callback(null, data, keyValue);
                          								}else{
                           									console.log({ message: 'Save SynonymsAtomizedVersion', element: 'synonymsAtomized', version : ver, _id: id_v, id_record : id_record });
                           									callback(null, data, keyValue);
                          								}
                        							});
                      							}
                    						});
                  						}
                					}
              					});
            				}else{
              					console.log({message: "Empty data in version of the element synonymsAtomized, id_record: "+id_record});
              					callback(null, data, keyValue);
            					}
          				}else{
          					console.log({message: "Empty data in version of the element synonymsAtomized, id_record: "+id_record});
          					callback(null, data, keyValue);
          				}
          			},
          			function(data, keyValue, callback){
          				rest.get('http://api.gbif.org/v1/species/' + keyValue + '/vernacularNames').on('complete', function(result) {
							//rest.get('http://api.gbif.org/v1/species/' + 'asdsad' + '/synonyms').on('complete', function(result) {
							console.log("gbif SPECIES (commoNames) api for "+ keyValue +JSON.stringify(result));
								var commonNamesAtomized = [];
								if (result.results !== undefined && result.results.length > 0) {
									for(var i = 0; i < result.results.length; i++){
										var comm = {};
										var usedIn = {};
										comm.name = (result.results[i].vernacularName !== undefined) ? result.results[i].vernacularName : '';
										comm.language =(result.results[i].language !== undefined) ? result.results[i].language : '';
										usedIn.distributionUnstructured =(result.results[i].area !== undefined) ? result.results[i].area : '';
          								comm.usedIn = usedIn;
										commonNamesAtomized.push(comm);
									}
									callback(null, commonNamesAtomized, keyValue);
								} else{
									console.log("No get information about synonymsAtomized: " + name);
									//throw new ScriptException("No get information about synonymsAtomized: " + name); //****
									callback(null, commonNamesAtomized, keyValue);
								}
						});
          			},
          			function(commonNamesAtomized, keyValue, callback){
          				console.log("Name to commonNamesAtomized: " + name);
          				rest.get('http://api.speciesplus.net/api/v1/taxon_concepts.json?name='+ name, { headers : {'X-Authentication-Token' : 'xl3tUZ6wEEzQmqMSXra5Awtt'}}).on('complete', function(result) {
          				rest.get('http://api.speciesplus.net/api/v1/taxon_concepts.json?name='+ name, { headers : {'X-Authentication-Token' : 'xl3tUZ6wEEzQmqMSXra5Awtt'}}).on('complete', function(data) {
          					console.log("speciesplus SPECIES (commonNames) api for "+ name +JSON.stringify(data));
          					 //if(data.taxon_concepts[0].common_names!==undefined){
          					 if(data.taxon_concepts[0]!==undefined){ //***
          					 	for(var i = 0; i < data.taxon_concepts[0].common_names.length; i++){
										var comm = {};
										var usedIn = {};
										comm.name = data.taxon_concepts[0].common_names[i].name;
										comm.language = data.taxon_concepts[0].common_names[i].language;
										usedIn.distributionUnstructured = '';
          								comm.usedIn = usedIn;
										commonNamesAtomized.push(comm);
								}
								callback(null, commonNamesAtomized, keyValue);
          					 }else{
          					 	console.log("No get information  for commonNames: " + name);
								//throw new ScriptException("No get information about synonyms and commonNames: " + name);
								callback(null, commonNamesAtomized, keyValue);
          					 }
          				});
          			},
          			function(commonNamesAtomized, keyValue, callback){
          				if(commonNamesAtomized.length !== 0){
          					var commonNamesAtomizedSchema = CommonNamesAtomizedVersion.schema;
         					var CommonNamesAtomizedVersionModel = CatalogoDb.model('CommonNamesAtomizedVersion', commonNamesAtomizedSchema );
          					var common_names_atomized = {}; 
          					var ob_ids= new Array();
          					common_names_atomized.commonNamesAtomized=commonNamesAtomized;
            				common_names_atomized._id = mongoose.Types.ObjectId();
            				common_names_atomized.id_record = id_record;
            				common_names_atomized.created = Date();
            				common_names_atomized.id_user="sib+ac@humboldt.org.co";
            				common_names_atomized.state="to review";
            				common_names_atomized.element="commonNamesAtomized";
            				common_names_atomized = new CommonNamesAtomizedVersionModel(common_names_atomized);
            				var id_v = common_names_atomized._id;
            				ob_ids.push(id_v);
            				if(typeof  common_names_atomized.commonNamesAtomized!=="undefined" && common_names_atomized.commonNamesAtomized!=""){
              					newRecordModel.count({ _id : id_record }, function (err, count){
                					if(typeof count!=="undefined"){
                  						if(count==0){
                    						console.log({message: "The Record (Ficha) with id: "+id_rc+" doesn't exist."});
                  						}else{
                    						newRecordModel.findByIdAndUpdate( id_record, { $push: { "commonNamesAtomizedVersion": id_v } },{safe: true, upsert: true},function(err, doc) {
                      							if (err){
                        							console.log("Saving commonNamesAtomized Error!: "+err+" id_record: "+id_rc);
                        							callback();
                    							}else{
                        							common_names_atomized.id_record=id_record;
                        							common_names_atomized.version=doc.commonNamesAtomizedVersion.length+1;
                        							var ver = common_names_atomized.version;
                        							common_names_atomized.save(function(err){
                          								if(err){
                            								console.log("Saving commonNamesAtomized Error!: "+err+" id_record: "+id_rc);
                            								callback();
                          								}else{
                            								console.log({ message: 'Save CommonNamesAtomizedVersion', element: 'commonNamesAtomized', version : ver, _id: id_v, id_record : id_record });
                            								callback();
                          								}
                        							});
                    							}
                    						});
                  						}		
                					}
              					});
            				}else{
              					console.log({message: "Empty data in version of the element commonNamesAtomized, id_record: "+id_record});
              					callback();
            				}
          				}else{
          					console.log({message: "Empty data in version to save of the element commonNamesAtomized, id_record: "+id_record});
          					callback();
          				}
          			},
          			
          			function(callback){
          				rest.get('http://api.speciesplus.net/api/v1/taxon_concepts.json?name='+ name, { headers : {'X-Authentication-Token' : 'xl3tUZ6wEEzQmqMSXra5Awtt'}}).on('complete', function(result) {
          					console.log("speciesplus SPECIES (threatStatus) api for "+ name +JSON.stringify(result));
          					var cites = [];
          					var threatStatus = [];
          					console.log(JSON.stringify(result));
          					if(result.taxon_concepts.length > 0){
          						if(result.taxon_concepts[0].cites_listings!== undefined && result.taxon_concepts[0].cites_listings.length>0){
          							for (var i = 0; i < result.taxon_concepts[0].cites_listings.length; i++) {
          								var appendix = result.taxon_concepts[0].cites_listings[i].appendix;
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
          							callback(null, threatStatus);
          						}else{
          							console.log("No for taxon_concepts: " + name);
          							callback(null, threatStatus);
          						}
          					}else{
          						console.log("No informatio for threatStatus");
          						callback(null, threatStatus);
          					}
          				});
          			}, 
          			
          			function(threatStatus, callback){
          				if(threatStatus.length !== 0){
          					var threatStatusSchema = ThreatStatusVersion.schema;
          					var ThreatStatusVersionModel = CatalogoDb.model('ThreatStatusVersion', threatStatusSchema );
          					var threat_status_version = {}; 
          					var ob_ids= new Array();
            				threat_status_version.threatStatus = threatStatus;
            				threat_status_version._id = mongoose.Types.ObjectId();
            				threat_status_version.id_record=id_record;
            				threat_status_version.created=Date(); //***
            				threat_status_version.id_user="sib+ac@humboldt.org.co";
            				threat_status_version.state="to review";
            				threat_status_version.element="threatStatus";
            				threat_status_version = new ThreatStatusVersionModel(threat_status_version);
            				var id_v = threat_status_version._id;
            				ob_ids.push(id_v);
            				if(typeof  threat_status_version.threatStatus!=="undefined" && threat_status_version.threatStatus!=""){
              					newRecordModel.count({ _id : id_record }, function (err, count){
                					if(typeof count!=="undefined"){
                  						if(count==0){
                    						console.log({message: "The Record (Ficha) with id: "+id_rc+" doesn't exist."});
                  						}else{
                    						newRecordModel.findByIdAndUpdate( id_record, { $push: { "threatStatusVersion": id_v } },{safe: true, upsert: true},function(err, doc) {
                      							if (err){
                        							console.log("Saving threatStatus Error!: "+err+" id_record: "+id_rc);
                        							//callback();
                      							}else{
                        							threat_status_version.id_record=id_record;
                        							threat_status_version.version=doc.threatStatusVersion.length+1;
                        							var ver = threat_status_version.version;
                        							threat_status_version.save(function(err){
                          								if(err){
                            								console.log("Saving threatStatus Error!: "+err+" id_record: "+id_record);
                            								//callback();
                          								}else{
                            								console.log({ message: 'Save ThreatStatusVersion', element: 'threatStatus', version : ver, _id: id_v, id_record : id_record });
                            								//callback();
                          								}
                        							});
                      							}
                    						});
                  						}
                					}
              					});
            				}else{
              					console.log({message: "Empty data in version of the element threatStatus, id_record: "+id_rc});
              					//callback();
            				}
          				}else{
          					console.log("No data to save in the element threatStatus!!");
          					//callback();
          				}
          			},
          			function(callback){

          				console.log("Next element");
          				//callback(null, 'done');
          			}
          			],function(err, result) {
          				if (err) {
            				console.log("Error: "+err);
            				//callback();
          				}else{
            				console.log('done!');
            				//callback();
          				}
        			});
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