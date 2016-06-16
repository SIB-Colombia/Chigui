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
    			var scNames = [];
    			console.log("Read the csv file");
        		var input = fs.createReadStream("/home/inaturalist/Desktop/TAX.csv");
        		var parser = parse({delimiter: ','});
        		parser.on('readable', function(){
  					while(record == parser.read()){
    					scNames.push(record);
  					}
				});
				parser.on('finish', function(){
					callback(null, scNames);
				});
				input.pipe(parser);
    		},
    		function(scNames,callback){
    			console.log("Number of scientific names to search: "+scNames.length);
    			var newRecordSchema = add_objects.RecordVersion.schema;
          		var newRecordModel = CatalogoDb.model('RecordVersion', newRecordSchema );

          		sData=scNames.slice(1, scNames.length);
          		async.eachSeries(sData, function(line, callback) {
          				var taxName = line[2].trim();
          				//var taxName ="Priocnessus flavidulus";
          				var id_record = '';
          				console.log("Scientific name to search: "+taxName);
          				async.waterfall([
          					function(callback){
          						console.log("Search in the database for : " + taxName);
          						var texSchema = TaxonRecordNameVersion.schema;
          						var TaxonRecordNameVersionModel = CatalogoDb.model('TaxonRecordNameVersion', texSchema );
          						TaxonRecordNameVersionModel.find({'taxonRecordName.scientificName.canonicalName.simple': taxName }, function(err, records){
          							if(err){
          								console.log("Error finding scientificName in the database!: " + taxName);
										throw new ScriptException("Error finding scientific Name in the database!: " + taxName);
          							}else{	
          								console.log("Number of Records finded: " + records.length);
          								if(records.length > 0){
          								//if(false){
          									//throw error to end the the function
          									try{
          										throw new ScriptException("ScriptException for: " + taxName);
          									}catch (e){
          										callback(new Error("The scientificName already exists in the database:" + e.message));
          									}
          								}else{
          									callback();
          								}
          							}
          						});
          					},
          					function(callback){
          						taxName = taxName.trim().replace(/ /g,"%20");
          						console.log("***ScientificName to search in the GBIF API: " + taxName +" ***");
          						rest.get('http://api.gbif.org/v1/species?name='+ taxName +'&limit=1').on('complete', function(data, response) {
          							//console.log("gbif api for "+ name +JSON.stringify(data));
          							if(response !== null){
          								console.log("Status code: "+response.statusCode);
          								if(data.results !== undefined ){
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
												callback(null, data, taxonRecordName);
          									}else{
          										console.log("No results for the name: " + taxName + "In the GBIF API");
          										try{
          											throw new ScriptException("No results for the name: " + taxName);
          										}catch (e){
          											callback(new Error("Failed getting result fron the API:" + e.message));
          										}
          									}
          								}else{
          									console.log("Something failed; No results for the name: " + taxName + "In the GBIF API");
          									try{
          										throw new ScriptException("No results for the name: " + taxName);
          									}catch (e){
          										callback(new Error("Failed getting result fron the API:" + e.message));
          									}
          								}
          							}else{
          								console.log("Something failed; No response for the API: " + taxName + "In the GBIF API");
          								try{
          										throw new ScriptException("No response for the API: " + taxName);
          								}catch (e){
          										callback(new Error("No response for the API:" + e.message));
          								}
          							}
          						});
          					},
          					function(data, taxonRecordName, callback){
          						console.log("***Saving the RecordVersion and TaxonRecordNameVersion in the database***");
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
            						var ver = 1;
            						ob_ids.push(id_v);
            						taxon_record_name_version.taxonRecordName = taxonRecordName;
            						if(typeof  taxon_record_name_version.taxonRecordName!="undefined" && taxon_record_name_version.taxonRecordName!=""){
            							newRecordModel.create({ _id:id_rc, taxonRecordNameVersion: ob_ids },function(err, doc){
            								if(err){
            									console.log("Saving taxonRecordName Error!: "+err+" id_record: "+id_rc);
            									try{
          											throw new ScriptException("Saving taxonRecordName Error!: "+err+" id_record: "+id_rc);
          										}catch (e){
          											callback(new Error("Error!: " + e.message));
          										}
            								}else{
            									taxon_record_name_version.version=1;
            									taxon_record_name_version.save(function(err){
            										if(err){
            											console.log("Saving taxonRecordName Error!: "+err+" id_record: "+id_rc);
            											try{
          													throw new ScriptException("Saving taxonRecordName Error!: "+err+" id_record: "+id_rc);
          												}catch (e){
          													callback(new Error("Error!: " + e.message));
          												}
            										}else{
            											console.log({ message: 'Created a new Record and Save TaxonRecordNameVersion', element: 'TaxonRecordName', version : ver, _id: id_v, id_record : id_rc });
                    									callback(null, data);
            										}
            									});
            								}
            							});
            						}else{
            							console.log({message: "Empty data in version of the element taxonRecordName"});
            							try{
          									throw new ScriptException("Empty data in version of the element taxonRecordName");
          								}catch (e){
          									callback(new Error("Error!: " + e.message));
          								}
            						}
          						}else{
          							console.log("No results for the name: " + taxName + "In the field taxonRecordName.scientificName.simple");
          							try{
          								throw new ScriptException("No results for the name: " + taxName + "In the field taxonRecordName.scientificName.simple");
          							}catch (e){
          								callback(new Error("Error:" + e.message));
          							}
          						};
          					},
          					function(data, callback){
          						console.log("***Creating the element hierarchy for: " + taxName +"***");
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
          							console.log("No get information about kingdom: " + taxName);
									callback(null, data, hierarchy);
          						}
          					},
          					function(data, hierarchy, callback){
          						console.log("***Saving the element hierarchy in the database***");
          						if(hierarchy.length !== 0){ 
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
            										console.log({message: "The Record (Ficha) with id: "+id_record+" doesn't exist."});
            									}else{
            										newRecordModel.findByIdAndUpdate( id_record, { $push: { "hierarchyVersion": id_v } },{safe: true, upsert: true},function(err, doc) {
            											if (err){
            												console.log("Saving hierarchy Error!: "+err+" id_record: "+id_rc);
                        									callback(null, data);
            											}else{
            												hierarchy_version.version=doc.hierarchyVersion.length+1;
                       										var ver = hierarchy_version.version;
                       										hierarchy_version.save(function(err){
                       											if(err){
                       												console.log("Saving hierarchy Error!: "+err+" id_record: "+id_record);
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
          						}else{
          							console.log({message: "Empty data for the element hierarchy for the RecordVersion with id "+id_record});
          							callback(null, data);
          						}
          					},
          					function(data, callback){
          						console.log("Getting the keyValue");
          						var keyValue ='';
          						if(data.results[0].rank !== undefined){
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
								}
								if(keyValue !== ''){
									callback(null, data, keyValue);
								}else{
									console.log("No get information about synonyms and commonNames: " + taxName);
									callback(null, data, keyValue);
								}
          					},
          					function(data, keyValue, callback){
          						console.log("***Calling speciesplus for: "+ taxName + " ***");
          						var resultPlus = '';
          						rest.get('http://api.speciesplus.net/api/v1/taxon_concepts.json?name=' + taxName, { headers : {'X-Authentication-Token' : 'xl3tUZ6wEEzQmqMSXra5Awtt'}}).on('complete', function(result) {
          							if(result instanceof Error){
          								callback(new Error("Error!: " + result.message));
          							}else{
          								resultPlus = result;
          								callback(null, resultPlus, data, keyValue);
          							}
          						});
          					},
          					function(resultPlus, data, keyValue, callback){
          						console.log("***Calling GBIF API for the key: "+ keyValue + " for synonyms ***");
          						var resultSyn = '';
          						if(keyValue !== ''){
          							rest.get('http://api.gbif.org/v1/species/' + keyValue + '/synonyms').on('complete', function(result) {
          								if(result instanceof Error){
          									callback(new Error("Error!: " + result.message));
          								}else{
          									resultSyn = result;
          									callback(null, resultSyn, resultPlus, data, keyValue);
          								}
          							});	
          						}else{
          							console.log("keyValue is Empty");
          							callback(null, resultSyn, resultPlus, data, keyValue);
          						}
          					},
          					function(resultSyn, resultPlus, data, keyValue, callback){
          						console.log("***Calling GBIF API for the key: "+ keyValue + " for vernacularNames ***");
          						var resultCom = '';
          						if(keyValue !== ''){
          							rest.get('http://api.gbif.org/v1/species/' + keyValue + '/vernacularNames').on('complete', function(result) {
          								if(result instanceof Error){
          									callback(new Error("Error!: " + result.message));
          								}else{
          									resultCom = result;
          									callback(null, resultCom, resultSyn, resultPlus, data);
          								}
          							});
          						}else{
          							console.log("keyValue is Empty");
          							callback(null, resultCom, resultSyn, resultPlus, data);
          						}
          					},
          					function(resultCom, resultSyn, resultPlus, data, callback){
          						console.log("***Creating the element synonymsAtomized for: " + taxName +"***");
          						var synonymsAtomized = [];
          						if(resultSyn !== ''){
          							if (resultSyn.results !== undefined && resultSyn.results.length > 0) {
          								for(var i = 0; i < resultSyn.results.length; i++){
          									 var syno = {};
                             var synonymName = {};
                             var canonicalName = {};
                             var canonicalAuthorship = {};
                             var publishedln = {};
											       synonymName.simple = (resultSyn.results[i].scientificName !== undefined) ? resultSyn.results[i].scientificName : '';
                             synonymName.rank = (resultSyn.results[i].rank !== undefined) ? resultSyn.results[i].rank : '';
                             canonicalName.simple = (resultSyn.results[i].canonicalName !== undefined) ? resultSyn.results[i].canonicalName : '' ;
                             canonicalAuthorship.simple = (resultSyn.results[i].authorship !== undefined) ? resultSyn.results[i].authorship : '' ;
                             publishedln.source = (resultSyn.results[i].publishedIn !== undefined) ? resultSyn.results[i].publishedIn : '' ;
                             synonymName.canonicalName = canonicalName;
                             synonymName.canonicalAuthorship = canonicalAuthorship;
                             synonymName.publishedln = publishedln;
                             syno.synonymStatus = (resultSyn.results[i].nomenclaturalStatus !== undefined && resultSyn.results[i].nomenclaturalStatus[0] !== undefined) ? resultSyn.results[i].nomenclaturalStatus : '' ;
											       syno.synonymName = synonymName;
											       synonymsAtomized.push(syno);
          								}
          							}else{
          								console.log("No information for synonyms from GBIF API");
          							}
          						}
          						if(resultPlus !== ''){
          							if(resultPlus.taxon_concepts[0] !== undefined){
                          if(resultPlus.taxon_concepts[0].synonyms !== undefined ){
          									for(var i = 0; i < resultPlus.taxon_concepts[0].synonyms.length; i++){
          										var syno = {};
                              var synonymName = {};
                              var canonicalName = {};
                              var canonicalAuthorship = {};
                              var publishedln = {};

                              synonymName.simple = resultPlus.taxon_concepts[0].synonyms[i].full_name;
                              synonymName.rank = resultPlus.taxon_concepts[0].synonyms[i].rank;
  												    canonicalName.simple = resultPlus.taxon_concepts[0].synonyms[i].full_name;
  												    canonicalAuthorship.simple = resultPlus.taxon_concepts[0].synonyms[i].author_year;
  												    publishedln.source = 'CITES';
                              synonymName.canonicalName = canonicalName;
                              synonymName.canonicalAuthorship = canonicalAuthorship;
                              synonymName.publishedln = publishedln;
                              syno.synonymStatus = '';
                              syno.synonymName = synonymName;
                              synonymsAtomized.push(syno);
          									}
                          	}else{
                            	console.log("No information for synonyms from speciesplus API");
                          	}
          							}else{
          									console.log("No information for synonyms from speciesplus API");
          							}
          						}
          						callback(null, resultCom, synonymsAtomized, resultPlus, data);
          					},
          					function(resultCom, synonymsAtomized, resultPlus, data, callback){
          						console.log("***Creating the element commonNamesAtomized for: " + taxName +"***");
          						var commonNamesAtomized = [];
          						if(resultCom !== ''){
          							if (resultCom.results !== undefined && resultCom.results.length > 0) {
          								for(var i = 0; i < resultCom.results.length; i++){
          									var comm = {};
											var usedIn = {};
											comm.name = (resultCom.results[i].vernacularName !== undefined) ? resultCom.results[i].vernacularName : '';
											comm.language =(resultCom.results[i].language !== undefined) ? resultCom.results[i].language : '';
											usedIn.distributionUnstructured =(resultCom.results[i].area !== undefined) ? resultCom.results[i].area : '';
          									comm.usedIn = usedIn;
											commonNamesAtomized.push(comm);
          								}
          							}else{
          								console.log("No information for commonNamesAtomized from GBIF API");
          							}
          						}
          						if(resultPlus !== ''){
          							if(resultPlus.taxon_concepts[0]!==undefined){
          								if(resultPlus.taxon_concepts[0].common_names !==undefined ){
          									for(var i = 0; i < resultPlus.taxon_concepts[0].common_names.length; i++){
          										var comm = {};
												var usedIn = {};
												comm.name = resultPlus.taxon_concepts[0].common_names[i].name;
												comm.language = resultPlus.taxon_concepts[0].common_names[i].language;
												usedIn.distributionUnstructured = '';
          										comm.usedIn = usedIn;
												commonNamesAtomized.push(comm);
          									}
          								}else{
          									console.log("No information for commonNamesAtomized from speciesplus API");	
          								}
          							}else{
          								console.log("No information for commonNamesAtomized from speciesplus API");
          							}
          						}
          						callback(null, commonNamesAtomized, synonymsAtomized, resultPlus, data);
          					},
          					function(commonNamesAtomized, synonymsAtomized, resultPlus, data, callback){
          						console.log("***Creating the element threatStatus for: " + taxName +"***");
          						var cites = [];
          						var threatStatus = [];
          						if(resultPlus !== ''){
          							if(resultPlus.taxon_concepts.length > 0){
          								if(resultPlus.taxon_concepts[0].cites_listings!== undefined && resultPlus.taxon_concepts[0].cites_listings.length>0){
          									for (var i = 0; i < resultPlus.taxon_concepts[0].cites_listings.length; i++) {
          										var appendix = resultPlus.taxon_concepts[0].cites_listings[i].appendix;
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
          									callback(null, commonNamesAtomized, synonymsAtomized, threatStatus, data);
          								}else{
          									console.log("No for taxon_concepts: " + taxName);
          									callback(null, commonNamesAtomized, synonymsAtomized, threatStatus, data);
          								}
          							}else{
          								console.log("No informatio for threatStatus");
          								callback(null, commonNamesAtomized, synonymsAtomized, threatStatus, data);
          							}
          						}
          					},
          					function(commonNamesAtomized, synonymsAtomized, threatStatus, data, callback){
          						console.log("***Saving the element synonymsAtomized in the database***");
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
                        									callback(null, commonNamesAtomized, threatStatus, data);
                      									}else{
                        									synonyms_atomized_version.id_record=id_record;
                        									synonyms_atomized_version.version=doc.synonymsAtomizedVersion.length+1;
                        									var ver = synonyms_atomized_version.version;
                        									synonyms_atomized_version.save(function(err){
                          										if(err){
                           											console.log("Saving synonymsAtomized Error!: "+err+" id_record: "+id_rc);
                           											callback(null, commonNamesAtomized, threatStatus, data);
                          										}else{
                           											console.log({ message: 'Save SynonymsAtomizedVersion', element: 'synonymsAtomized', version : ver, _id: id_v, id_record : id_record });
                           											callback(null, commonNamesAtomized, threatStatus, data);
                          										}
                        									});
                      									}
                    								});
            									}
            								}
            							});
            						}
          						}else{
          							console.log({message: "Empty data in version of the element synonymsAtomized, id_record: "+id_record});
          							callback(null, commonNamesAtomized, threatStatus, data);
          						}
          					},
          					function(commonNamesAtomized, threatStatus, data, callback){
          						console.log("***Saving the element commonNamesAtomized in the database***");
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
                        									callback(null, threatStatus, data);
            											}else{
            												common_names_atomized.id_record=id_record;
                        									common_names_atomized.version=doc.commonNamesAtomizedVersion.length+1;
                        									var ver = common_names_atomized.version;
                        									common_names_atomized.save(function(err){
                          										if(err){
                            										console.log("Saving commonNamesAtomized Error!: "+err+" id_record: "+id_rc);
                            										callback(null, threatStatus, data);
                          										}else{
                            										console.log({ message: 'Save CommonNamesAtomizedVersion', element: 'commonNamesAtomized', version : ver, _id: id_v, id_record : id_record });
                            										callback(null, threatStatus, data);
                          										}
                        									});
            											}
            										});
            									}
            								}
            							});
            						}else{
            							console.log({message: "Empty data in version of the element commonNamesAtomized, id_record: "+id_record});
              							callback(null, threatStatus, data);
            						}
          						}else{
          							console.log({message: "Empty data in version to save of the element commonNamesAtomized, id_record: "+id_record});
          							callback(null, threatStatus, data);
          						}
          					},
          					function(threatStatus, data, callback){
          						console.log("***Saving the element threatStatusAtomized in the database***");
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
            										console.log({message: "The Record (Ficha) with id: "+id_record+" doesn't exist."});
            										callback();
            									}else{
            										newRecordModel.findByIdAndUpdate( id_record, { $push: { "threatStatusVersion": id_v } },{safe: true, upsert: true},function(err, doc) {
            											if (err){
            												console.log("Saving threatStatus Error!: "+err+" id_record: "+id_rc);
                        									callback();
            											}else{
            												threat_status_version.id_record=id_record;
                        									threat_status_version.version=doc.threatStatusVersion.length+1;
                        									var ver = threat_status_version.version;
                        									threat_status_version.save(function(err){
                        										if(err){
                            										console.log("Saving threatStatus Error!: "+err+" id_record: "+id_record);
                            										callback();
                          										}else{
                            										console.log({ message: 'Save ThreatStatusVersion', element: 'threatStatus', version : ver, _id: id_v, id_record : id_record });
                            										callback();
                          										}
                        									});
            											}
            										});
            									}
            								}
            							});
            						}else{
            							console.log({message: "Empty data in version of the element threatStatus, id_record: "+id_record});
              							callback();
            						}
          						}else{
          							console.log("No data to save in the element threatStatus!!");
          							callback();
          						}
          					}
          				],function(err, result) {
          					if (err) {
            					console.log("Error!!: " + err);
            					callback();
          					}else{
            					console.log('done!');
            					callback();
          					}
        				});

          			},
          			function(err){
              			if( err ) {
                			console.log('A scientificName failed to process');
              			} else {
                			console.log('All scientificNames have been processed successfully');
                			callback(null, catalogoDb);
              			}
          			}
          		);
    		},
    		function(catalogoDb, callback){ 
          		CatalogoDb=mongoose.disconnect();
        	},
        	function(err, result) {
          		if (err) {
            		console.log("Error: "+err);
          		}else{
            		console.log('done!');
          		}
        	}
    		],function (err, result){
          		if (err) {
                      console.log("Error in the script!!: " + err);
                      callback();
                    }else{
                      console.log('done!');
                      callback();
                }
    	});

    }
});

