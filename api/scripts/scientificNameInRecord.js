var mongoose = require('mongoose');
var async = require('async');
var TaxonRecordNameVersion = require('../models/taxonRecordName.js');
var add_objects = require('../models/additionalModels.js');

var value={};
var response=[];
var dataObject ={};

//query = add_objects.RecordVersion.find({}).select('taxonRecordNameVersion associatedPartyVersion').populate('taxonRecordNameVersion associatedPartyVersion').sort({ _id: -1}).limit(1);
query = add_objects.RecordVersion.find({}).select('_id').sort({ _id: -1});

var catalogoDb = mongoose.createConnection('mongodb://localhost:27017/catalogoDb', function(err) {
	if(err) {
    	console.log('connection error', err);
    }else{
    	console.log('connection successful');
    	//var RecordVersion = mongoose.model('RecordVersion').schema;

    	var RecordSchema = add_objects.RecordVersion.schema;
        var RecordModel = catalogoDb.model('RecordVersion', RecordSchema );

        var taxonSchema = TaxonRecordNameVersion.schema;
        TaxonRecordNameVersion = catalogoDb.model('TaxonRecordNameVersion', taxonSchema );

    	async.waterfall([
    		function(callback){
    			console.log("***Execution of the query***");
    			query = RecordModel.find({}).select('_id').sort({ _id: -1});
    			query.exec(function (err, data) {
        			if(err){
          				callback(new Error("Error getting the total of Records:" + err.message));
        			}else{
          				callback(null, data);
        			}
      			});
    		},
    		function(data,callback){
    			//console.log(data.length);
    			async.eachSeries(data, function(record_data, callback){
    				//console.log(record_data._id);
    				TaxonRecordNameVersion.findOne({ id_record : record_data._id, state: "accepted" }).sort({created: -1}).exec(function (err, elementVer) {
    					if(err){
    						callback(new Error("Error to get TaxonRecordName element for the record with id: "+id_rc+" : " + err.message));
    					}else{
    						if(elementVer){
    							if(typeof elementVer.taxonRecordName.scientificName.simple != 'undefined' && elementVer.taxonRecordName.scientificName.simple != ''){
    								//console.log(elementVer.taxonRecordName.scientificName.simple);
    								record_data.scientificName = elementVer.taxonRecordName.scientificName.simple;
    							}
    							//console.log(record_data.scientificName);
    							callback();
    						}else{
    							record_data.scientificName = "";
    							callback();
    						}

    					}
    				});
    				//callback();
    			},function(err){
    				if(err){
          				callback(new Error("Error"));
        			}else{
        				console.log("a");
          				callback(null, data);
        			}
    			});
    		},
    		function(data,callback){
    			console.log(data.length);
    			//async.eachSeries(data, function(record_data, callback){});

    		}
    	],
    	function(err, result) {
      		if(err){
        		res.status(400);
        		res.json({ ErrorResponse: {message: ""+err }});
      		}else{
        		console.log("ok");
        		//logger.info('Creation a new AncillaryDataVersion sucess', JSON.stringify({id_record: id_rc, version: ver, _id: id_v, id_user: user}));
        		res.json("Ok");
      		}
    	});
    }

});