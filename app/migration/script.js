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
        		var input = fs.createReadStream("/home/inaturalist/Desktop/TAX.csv");
        		console.log("Read the csv file");
        		parser.on('readable', function(){
  					while(record = parser.read()){
    					scNames.push(record);
  					}
				});
				parser.on('finish', function(){
					callback(null, scNames);
				});
				input.pipe(parser);
    		}
    		function(scNames,callback){
    			console.log("Number of scientific names to search: "+scNames.length);
    			var newRecordSchema = add_objects.RecordVersion.schema;
          		var newRecordModel = CatalogoDb.model('RecordVersion', newRecordSchema );

          		sData=scNames.slice(1, scNames.length);
          		async.eachSeries(sData, function(line, callback) {
          				var taxName = line[2];
          				//var taxName ="Panthera onca";
          				var id_record = '';
          				console.log("Scientific name to search: "+taxName);
          				async.waterfall([
          					function(callback){
          						console.log("Search in the database for : " + taxName);
          						var texSchema = TaxonRecordNameVersion.schema;
          						var TaxonRecordNameVersionModel = CatalogoDb.model('TaxonRecordNameVersion', texSchema );
          						TaxonRecordNameVersionModel.find({'taxonRecordName.scientificName.canonicalName.simple': name }, function(err, records){
          							if(err){
          								console.log("Error finding scientificName in the database!: " + taxName);
										throw new ScriptException("Error finding scientific Name in the database!: " + taxName);
          							}else{	
          								console.log("Number of Records finded: " + records.length);
          								if(records.length > 0){
          									//throw error to end the the function
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
          						taxName = taxName.trim().replace(/ /g,"%20");
          						console.log("***ScientificName to search in the GBIF API: " + taxName +" ***");
          						rest.get('http://api.gbif.org/v1/species?name='+name+'&limit=1').on('complete', function(data) {
          							//console.log("gbif api for "+ name +JSON.stringify(data));
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
          								console.log("No results for the name: " + name + "In the GBIF API");
          								try{
          									throw new ScriptException("No results for the name: " + name);
          								}catch (e){
          									callback(new Error("Failed getting result fron the API:" + e.message));
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
            						if(typeof  taxon_record_name_version.taxonRecordName!=="undefined" && taxon_record_name_version.taxonRecordName!=""){
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
          							console.log("No results for the name: " + name + "In the field taxonRecordName.scientificName.simple");
          							try{
          								throw new ScriptException("No results for the name: " + name + "In the field taxonRecordName.scientificName.simple");
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
          							console.log("No get information about kingdom: " + name);
									callback(null, data, hierarchy);
          						}
          					},
          					function(data, hierarchy, callback){
          						console.log("***Saving the element hierarchy in the database***");
          						if(synonymsAtomized.length !== 0){ 
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
          							callback(null, data, keyValue);
          						}
          					},
          					function(data, callback){
          						console.log("Next element");
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
									console.log("The KeyValue for the taxon: "+keyValue);
									rest.get('http://api.gbif.org/v1/species/' + keyValue + '/synonyms').on('complete', function(result) {
										//TO DO
									});

								}else{
									console.log("No get information about synonyms and commonNames: " + name);
									//TO DO
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

    	});

    }
});

