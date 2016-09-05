import mongoose from 'mongoose';
import async from 'async';
import BehaviorVersion from '../models/behavior.js';
import add_objects from '../models/additionalModels.js';


function postBehavior(req, res) {
  var behavior_version  = req.body; 
    behavior_version._id = mongoose.Types.ObjectId();
    behavior_version.created=Date();
    behavior_version.element="behavior";
    var elementValue = behavior_version.behavior;
    behavior_version = new BehaviorVersion(behavior_version);
    var id_v = behavior_version._id;
    var id_rc = req.swagger.params.id.value;

    var ob_ids= new Array();
    ob_ids.push(id_v);

    var ver = "";

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
                var lenbehavior = data.behaviorVersion.length;
                if( lenbehavior !=0 ){
                  var idLast = data.behaviorVersion[lenbehavior-1];
                  BehaviorVersion.findById(idLast , function (err, doc){
                    if(err){
                            callback(new Error("failed getting the last version of behaviorVersion:" + err.message));
                        }else{
                          var prev = doc.behavior;
                            var next = behavior_version.behavior;
                            //if(!compare.isEqual(prev,next)){ //TODO
                            if(true){
                              behavior_version.id_record=id_rc;
                              behavior_version.version=lenbehavior+1;
                              callback(null, behavior_version);
                            }else{
                              callback(new Error("The data in behavior is equal to last version of this element in the database"));
                            }
                        }
                  });
                }else{
                  behavior_version.id_record=id_rc;
                      behavior_version.version=1;
                      callback(null, behavior_version);
                }
              }else{
                  callback(new Error("The Record (Ficha) with id: "+id_rc+" doesn't exist."));
              }
            },
            function(behavior_version, callback){ 
                ver = behavior_version.version;
                behavior_version.save(function(err){
                  if(err){
                      callback(new Error("failed saving the element version:" + err.message));
                  }else{
                      callback(null, behavior_version);
                  }
                });
            },
            function(behavior_version, callback){ 
                add_objects.RecordVersion.findByIdAndUpdate( id_rc, { $push: { "behaviorVersion": id_v } },{ safe: true, upsert: true }).exec(function (err, record) {
                  if(err){
                      callback(new Error("failed added id to RecordVersion:" + err.message));
                  }else{
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
                  res.json({ message: 'Save BehaviorVersion', element: 'behavior', version : ver, _id: id_v, id_record : id_rc });
               }      
            });

      }else{
        //res.status(406);
        res.status(400);
        res.json({message: "Empty data in version of the element"});
      }
    }else{
      //res.status(406);
      res.status(400);
      res.json({message: "The url doesn't have the id for the Record (Ficha)"});
    }

}

function getBehavior(req, res) {
    var id_rc = req.swagger.params.id.value;
    var version = req.swagger.params.version.value;

    BehaviorVersion.findOne({ id_record : id_rc, version: version }).exec(function (err, elementVer) {
            if(err){
              res.status(400);
              res.send(err);
            }else{
              if(elementVer){
                res.json(elementVer);
              }else{
                res.status(400);
                res.json({message: "Doesn't exist a BehaviorVersion with id_record: "+id_rc+" and version: "+version});
              }
            }
    });

}


module.exports = {
  postBehavior,
  getBehavior
};