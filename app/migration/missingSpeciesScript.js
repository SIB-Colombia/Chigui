var mongoose = require('mongoose');
var async = require('async');
var fs = require('fs');
var TaxonRecordNameVersion = require('../models/taxonRecordName.js');
var SynonymsAtomizedVersion = require('../models/synonymsAtomized.js');
var CommonNamesAtomizedVersion = require('../models/commonNamesAtomized.js');
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
          			name=line[2].trim().replace(/ /g,"%20");


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
								callback(null, sData);
							}else{
								console.log("No results for the name!: " + name);
								throw new ScriptException("No results for the name: " + name);
							}
						});
          			},
          			function(sData, callback){
          				//taxonRecordName.scientificName.simple ='';
          				if(taxonRecordName.scientificName.simple!==undefined && taxonRecordName.scientificName.simple!==''){
          					var taxon_record_name_version = {};
          					taxon_record_name_version._id = mongoose.Types.ObjectId();
          					taxon_record_name_version.id_record = mongoose.Types.ObjectId();
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
            						callback(null, sData);
            					}else{
            						taxon_record_name_version.version=1;
                					taxon_record_name_version.save(function(err){
                  						if(err){
                    						console.log("Saving taxonRecordName Error!: "+err+" id_record: "+id_rc);
                    						callback(null, sData);
                  						}else{
                    						console.log({ message: 'Created a new Record and Save TaxonRecordNameVersion', element: 'TaxonRecordName', version : ver, _id: id_v, id_record : id_rc });
                    						callback(null, sData);
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
          			function(callback){
          				console.log("Saving Hierarchy!: "+name);
          				var hierarchy = {};
          			},
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