import mongoose from 'mongoose';
import async from 'async';
import Collection from '../models/collection.js';
import add_objects from '../models/additionalModels.js';

function postTaxonRecordName(req, res) {
	var collection  = req.body;
	collection._id = mongoose.Types.ObjectId();
	collection.created=Date();

	if(collection.created.records.lenghth != 0){
		async.waterfall([
				function(){
					async.eachSeries(taxon_records, function(taxon_record, callback){
						add_objects.RecordVersion.findById(id_rc , function (err, data){
            				if(err){
              				callback(new Error("The Record (Ficha) with id: "+id_rc+" doesn't exist.:" + err.message));
           			 		}
          				});
					},function(err){
						if(err){
							console.error("Error finding a Record: "+err.message);
						}else{
							console.log("All Records in the dataBase");
							callback(null, 'done');
						}
					});
				},
				function(){

				}
				],
        		function(err, result) {
          			if (err) {
            			console.log("Error: "+err);
            			//res.status(406);
            			res.status(400);
            			res.json({ ErrorResponse: {message: ""+err }});
          			}else{
            			res.json({ message: 'Save TaxonRecordNameVersion', element: 'taxonRecordName', version : ver, _id: id_v, id_record : id_rc });
         			 }			
        		}
	}else{
		//res.status(406);
    	res.status(400);
    	res.json({message: "The array of the id's od Records is empty"});
	}
}