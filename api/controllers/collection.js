import mongoose from 'mongoose';
import async from 'async';
import Collection from '../models/collection.js';
import add_objects from '../models/additionalModels.js';

function postCollection(req, res) {
	var collection  = req.body;
	var object_id = mongoose.Types.ObjectId();
	collection._id = mongoose.Types.ObjectId();
	collection.created=Date();
	console.log(collection);
	console.log("*** "+collection.records.length);
	
	for(var i =0; i < collection.records.length; i++){
		console.log(object_id.isValid(records[i]));
		//collection.records[i] = mongoose.Types.ObjectId(collection.records[i]);
	}
	collection = new Collection(collection);

	console.log(collection);

	console.log(collection.records.length);

	if(collection.records.length > 0){
		console.log(collection.records.length);
		async.waterfall([
				function(callback){
					async.eachSeries(collection.records, function(id_record, callback){
						add_objects.RecordVersion.count({ _id : id_record }, function (err, count){
            				if(err){
              					callback(new Error("The Record (Ficha) with id: "+id_record+" doesn't exist.:" + err.message));
           			 		}else if(count > 1){
           			 			callback(new Error("The Record (Ficha) with id: "+id_record+" doesn't exist"));
           			 		}
          				});
					},function(err){
						if(err){
							console.error("Error finding a Record: "+err.message);
						}else{
							console.log("All Records are in the dataBase");
							callback();
						}
					});
				}
			],
			function(err, result) {
          		if (err) {
            		console.log("Error: "+err);
            		//res.status(406);
            		res.status(400);
            		res.json({ ErrorResponse: {message: ""+err }});
          		}else{
            		res.json({ message: 'Save Collection', collection_id: collection._id  });
         		}
			}
		);
	}else{
		//res.status(406);
    	res.status(400);
    	res.json({message: "The array of the id's of Records is empty"});
	}
}

function getCollection(req, res) {
  	var id_collection = req.swagger.params.id.value;

  	Collection.findOne({ _id : id_collection }).exec(function (err, collection) {
            if(err){
              res.status(400);
              res.send(err);
            }else{
              if(collection){
                res.json(collection);
              }else{
              	res.status(400);
              	res.json({message: "Doesn't exist a Collection with id_record: " + id_rc });
              }
            }
    });

}


module.exports = {
  postCollection,
  getCollection
};