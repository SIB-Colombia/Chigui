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
			function(callback) {
				var texSchema = TaxonRecordNameVersion.schema;
				var TaxonRecordNameVersionModel = CatalogoDb.model('TaxonRecordNameVersion', texSchema );
				//find all records
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
          						callback(new Error("The scientificName already exists in the database:" + e.message));
          					}
						}
					}
				});
			},
			function(taxon_records, callback){
				async.eachSeries(taxon_records, function(taxon_record, callback){
					var taxName = taxon_record.taxonRecordName.scientificName.canonicalName.simple;
					taxName = taxName.trim().replace(/ /g,"%20");
					console.log("Scientific name to search images: "+taxName);
					console.log("URL to consult: "+'http://eol.org/api/search/1.0.json?q='+taxName+'&page=1&exact=true&filter_by_taxon_concept_id=&filter_by_hierarchy_entry_id=&filter_by_string=&cache_ttl=');
					rest.get('http://eol.org/api/search/1.0.json?q='+taxName+'&page=1&exact=true&filter_by_taxon_concept_id=&filter_by_hierarchy_entry_id=&filter_by_string=&cache_ttl=').on('complete',function(data, response) {
						console.log("API Response Status code: "+ response.statusCode);
						if (!(data instanceof Error) && (response.statusCode == 200)) {
    						console.log(data.results);
    						async.eachSeries(data.results, function(result, callback){
    							rest.get('http://eol.org/api/pages/1.0/'+result.id+'.json?images=10&videos=0&sounds=0&maps=0&text=0&iucn=false&subjects=overview&licenses=all&details=true&common_names=false&synonyms=false&references=false&vetted=0&cache_ttl=').on('complete',function(data_id, response_id) {
    								console.log("API Response Status code: "+ response_id.statusCode);
    								if (!(data_id instanceof Error) && (response_id.statusCode == 200)) { 
            							//references.postVersion();
    								}else{

    								}
    							});
    						},function(err){
    							if(err){
    								console.error("Error finding a taxonRecordName"+err.message);
    							}else{
    								console.log("All records processed");
									callback();
    							}
    						});
  						} else {
    						console.log('Error:', data.message);
  						}
					});
					//callback();
				},function(err){
					if(err){
						console.error("Error finding a taxonRecordName"+err.message);
					}else{
						console.log("All records processed");
						callback(null, taxon_records);
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

//ID de la ficha
function postVersion(reference, id_rc) {
	//primero buscar la la ultima version de ReferenceVersion
	//RecordVersion.References
	//último elemento de ese arreglo, sacar ID
	//ReferencesVersion.findID()

	add_objects.RecordVersion.findOne({ _id : id_rc }).exec(function (err, record) {
		var len = record.referencesVersion.length;
		var last_ref=record.referencesVersion[len-1];
		var referencesSchema = ReferencesVersion.schema;
        var ReferencesVersionModel = catalogoDb.model('ReferencesVersion', referencesSchema );
        ReferencesVersionModel.findOne({ _id : id_rc }).exec(function (err, reference) {
        	var new_reference = reference;
        });
	});
	
	var references_version = {};
	references_version.references = record._doc.references;
    references_version._id = mongoose.Types.ObjectId();
            references_version.id_record=record._id;
            references_version.created=record._id.getTimestamp(); //***
            references_version.id_user="sib+ac@humboldt.org.co";
            references_version.state="accepted";
            references_version.element="references";
            references_version = new ReferencesVersionModel(references_version);





  var references_version  = req.body; 
  references_version._id = mongoose.Types.ObjectId();
  references_version.created=Date();
  references_version.element="references";
  var eleValue = references_version.references;
  references_version = new ReferencesVersion(references_version);

  var id_v = references_version._id;
  var id_rc = req.params.id_record;

  var ob_ids= new Array();
  ob_ids.push(id_v);

  var ver = "";

  if(typeof  id_rc!=="undefined" && id_rc!=""){
    if(typeof  eleValue!=="undefined" && eleValue!=""){
      async.waterfall([
        function(callback){ 
          add_objects.RecordVersion.findById(id_rc , function (err, data){
            if(err){
              //callback(new Error("failed getting something!:" + err.message));
              callback(new Error("The Record (Ficha) with id: "+id_rc+" doesn't exist.:" + err.message));
            }else{
              callback(null, data);
            }
          });
        },
        function(data,callback){ 
          if(data){
            var lenreferences = data.referencesVersion.length;
            if( lenreferences !=0 ){
              var idLast = data.referencesVersion[lenreferences-1];
              ReferencesVersion.findById(idLast , function (err, doc){
                if(err){
                  callback(new Error("failed getting the last version of referencesVersion:" + err.message));
                }else{
                  var prev = doc.references;
                  var next = references_version.references;
                  //if(!compare.isEqual(prev,next)){ //TODO
                  if(true){
                    references_version.id_record=id_rc;
                    references_version.version=lenreferences+1;
                    callback(null, references_version);
                  }else{
                    callback(new Error("The data in references is equal to last version of this element in the database"));
                  }
                }
              }); 
            }else{
              references_version.id_record=id_rc;
              references_version.version=1;
              callback(null, references_version);
            }
        }else{
          callback(new Error("The Record (Ficha) with id: "+id_rc+" doesn't exist."));
        }
      },
      function(references_version, callback){ 
          ver = references_version.version;
          references_version.save(function(err){
            if(err){
              callback(new Error("failed saving the element version:" + err));
            }else{
              callback(null, references_version);
            }
          });
      },
      function(references_version, callback){ 
          add_objects.RecordVersion.findByIdAndUpdate( id_rc, { $push: { "referencesVersion": id_v } },{ safe: true, upsert: true }).exec(function (err, record) {
            if(err){
              callback(new Error("failed added id to RecordVersion:" + err.message));
            }else{
              callback();
            }
          });
      }
      ],function(err, result) {
          if (err) {
            console.log("Error: "+err);
            res.status(406);
            res.json({ message: ""+err });
          }else{
            res.json({ message: 'Save ReferencesVersion', element: 'references', version : ver, _id: id_v, id_record : id_rc });
          }
        }
      );
   }else{
    res.status(406);
    res.json({message: "Empty data in version of the element"});
   } 
  }else{
    res.status(406);
    res.json({message: "The url doesn't have the id for the Record (Ficha)"});
  }
}