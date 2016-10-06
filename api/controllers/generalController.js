import mongoose from 'mongoose';
import async from 'async';
import winston from 'winston';
import add_objects from '../models/additionalModels.js';

function postElementVersion(Element_model, element_version, id_rc) {
	element_version._id = mongoose.Types.ObjectId();
	element_version.created=Date();
	element_version.state="to_review";
	var elementName = element_version.element;
	console.log("Element: "+element_version);
	console.log("Element: "+Object.keys(element_version));
	console.log(elementName);
	//var elementValue = taxon_record_name_version.taxonRecordName;
	var elementValue = element_version[elementName];

	//taxon_record_name_version = new TaxonRecordNameVersion(taxon_record_name_version);
	element_version = new Element_model(element_version);

	console.log("Element!: "+Object.keys(element_version));
	console.log("Element!: "+Object.keys(element_version._doc));

	//var id_v = taxon_record_name_version._id;
    //var id_rc = req.swagger.params.id.value;

    var id_v = element_version._id;
    var ob_ids= new Array();
  	ob_ids.push(id_v);

  	var ver = "";
  	var element_text_version = elementName + 'Version';
  	var element_text_up = element_text_version.charAt(0).toUpperCase() + element_text_version.slice(1);

  	console.log(element_text_version);
  	console.log(element_text_up);

  	var resr = {};

  	if(typeof  id_rc!=="undefined" && id_rc!=""){
  		if(typeof  elementValue!=="undefined" && elementValue!=""){
  			async.waterfall([
  					function(callback){ 
          				add_objects.RecordVersion.findById(id_rc , function (err, data){
            				if(err){
              					callback(new Error("The Record (Ficha) with id: "+id_rc+" doesn't exist.:" + err.message));
           			 		}else{
              					callback(null, data);
            				}
          				});
        			},
        			function(data,callback){
              			if(data){
              				console.log(data[element_text_version]);
                			if(data[element_text_version] && data[element_text_version].length !=0){
                  				var lenElement = data[element_text_version].length;
                  				var idLast = data[element_text_version][lenElement-1];
                  				Element_model.findById(idLast , function (err, doc){
                    				if(err){
                      					callback(new Error("failed getting the last version of"+ element_text_up +":" + err.message));
                    				}else{
                    					/*
                      					var prev = doc[element_text_version];
                      					var next = element_version[element_text_version];
                      					//if(!compare.isEqual(prev,next)){ //TODO
                      					if(true){
                        					element_version.id_record = id_rc;
                        					element_version.version = lenElement+1;
                        					callback(null, element_version);
                      					}else{
                        					callback(new Error("The data in "+ element_text_version +" is equal to last version of this element in the database"));
                      					}
                      					*/
                      					var next = element_version[element_text_version];
                      					callback(null, element_version);
                    				}
                  				});
                			}else{
                  				element_version.id_record=id_rc;
                  				element_version.version=1;
                  				callback(null, element_version);
                			}
              			}else{
                			callback(new Error("The Record (Ficha) with id: "+id_rc+" doesn't exist."));
              			}
            		},
            		function(element_version, callback){ 
          				ver = element_version.version;
          				element_version.save(function(err){
            				if(err){
              					callback(new Error("failed saving the element version:" + err.message));
            				}else{
              					callback(null, element_version);
           					}
          				});
      				},
      				function(taxon_record_name_version, callback){ 
          				add_objects.RecordVersion.findByIdAndUpdate( id_rc, { $push: { ""+element_text_version: id_v } },{ safe: true, upsert: true }).exec(function (err, record) {
            				if(err){
              					callback(new Error("failed added _id to RecordVersion:" + err.message));
            				}else{
              					callback();
            				}
          				});
      				}
  				],
        		function(err, result) {
          			if (err) {
          				/*
            			console.log("Error: "+err);
                  		winston.error("message: " + err );
            			res.status(400);
            			res.json({ ErrorResponse: {message: ""+err }});
            			*/
            			console.log("Error: "+err);
                  		winston.error("message: " + err );
            			resr.status = 400;
            			resr.message = "Error" + err;
          			}else{
                  		winston.info('info', 'Saved '+ element_text_up +' version: ' + ver + " for the Record: " + id_rc);
                  		resr.message = 'Save ' + element_text_up;
                  		resr.element = element_text_version;
                  		resr.version = ver;
                  		resr._id = id_v;
                  		resr.id_record = id_rc;
            			//res.json({ message: 'Save ' + element_text_up, element: element_text_version, version : ver, _id: id_v, id_record : id_rc });
            			return result;
         			 }			
        		}
  			);
  		}else{
        winston.error("message: " + "Empty data in version of the element" );
    	res.status(400);
    	res.json({message: "Empty data in version of the element"});
   		}
  	}else{
      winston.error("message: " + "The url doesn't have the id for the Record (Ficha)" );
  	  res.status(400);
      res.json({message: "The url doesn't have the id for the Record (Ficha)"});
  	}
}

module.exports = {
	postElementVersion
}