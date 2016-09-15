import mongoose from 'mongoose';
import async from 'async';
import Group from '../models/group.js';
import User from '../models/user.js';
import add_objects from '../models/additionalModels.js';

function postGroup(req, res) {
	var group  = req.body;
	var object_id = mongoose.Types.ObjectId();
	group._id = mongoose.Types.ObjectId();
	group.created=Date();
	//console.log(collection);
	//console.log("*** "+collection.records.length);
	
	/*
	var isValidArr = true; 
	var reg_id = new RegExp("^[0-9a-fA-F]{24}$");
	var ref_email = new RegExp("^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$");
	*/
	/*
	for(var i =0; i < group.records.length; i++){
		console.log(reg_id.test(listRecords.records[i]));
		if (!reg_id.test(listRecords.records[i])){
			isValidArr = false;
			break;
		}else{
			listRecords.records[i] = mongoose.Types.ObjectId(listRecords.records[i]); 
		}
	}
	*/

	group = new Group(group);
	if(group.users.length > 0){
		async.waterfall([
				function(callback){
					async.eachSeries(group.users, function(id_user, callback){
						console.log(id_user);
						User.count({ id_user : id_user }, function (err, count){
            				if(err){
              					callback(new Error("The User with id: " + id_user + " doesn't exist.:" + err.message));
           			 		}else if(count === 0){
           			 			callback(new Error("The User with id: " + id_user + " doesn't exist"));
           			 		}else{
           			 			callback();
           			 		}
          				});
					},function(err){
						if(err){
							//console.error("Error finding a Record: "+err.message);
							callback(new Error("Error finding a User: "+err.message));
						}else{
							console.log("All Users are in the Data Base");
							callback();
						}
					});
				},
				function(callback){
					var existUser = false; 
					var admins = group.admins;
					var users = group.users;
					for(var i=0; i < admins.length; i++){
						for(var j=0; j < users.length; j++ ){
							if(admins[i]==users[j]){
								existUser = true;
								break
							} 
						}
					}
					if(!existUser){
						callback(new Error("One of the admins's id isn't in the list of users"));
					}else{
						callback();
					}
				},
				function(callback){
					group.save(function(err){
                  		if(err){
                      		callback(new Error("failed saving the group:" + err.message));
                  		}else{
                      		callback(null);
                  		}
                	});
				}
				],
				function(err, result) {
          			if (err) {
            			console.log(err.message);
            			//res.status(406);
            			res.status(400);
            			res.json({ ErrorResponse: {message: ""+err }});
          			}else{
            			res.json({ message: 'Save list of records', listRecords_id: listRecords._id  });
         			}
				}
		);
	}else{
		//res.status(406);
    	res.status(400);
    	res.json({message: "The array of the id's of Users is empty"});
	}
	
}

function getGroup(req, res) {
  	var group_id = req.swagger.params.id.value;

  	Group.findOne({ _id : group_id }).exec(function (err, group) {
            if(err){
              res.status(400);
              res.send(err);
            }else{
              if(group){
                res.json(listrecords);
              }else{
              	res.status(400);
              	res.json({message: "Doesn't exist a Group with id " + group_id });
              }
            }
    });

}


module.exports = {
  postGroup,
  getGroup
};