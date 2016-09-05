import mongoose from 'mongoose';
import async from 'async';
import FeedingVersion from '../models/feeding.js';
import add_objects from '../models/additionalModels.js';


function postFeeding(req, res) {
  var feeding_version  = req.body; 
    feeding_version._id = mongoose.Types.ObjectId();
    feeding_version.created=Date();
    feeding_version.element="feeding";
    var elementValue = feeding_version.feeding;
    feeding_version = new FeedingVersion(feeding_version);
    var id_v = feeding_version._id;
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
                var lenfeeding = data.feedingVersion.length;
                if( lenfeeding !=0 ){
                  var idLast = data.feedingVersion[lenfeeding-1];
                  FeedingVersion.findById(idLast , function (err, doc){
                    if(err){
                            callback(new Error("failed getting the last version of feedingVersion:" + err.message));
                        }else{
                          var prev = doc.feeding;
                            var next = feeding_version.feeding;
                            //if(!compare.isEqual(prev,next)){ //TODO
                            if(true){
                              feeding_version.id_record=id_rc;
                              feeding_version.version=lenfeeding+1;
                              callback(null, feeding_version);
                            }else{
                              callback(new Error("The data in feeding is equal to last version of this element in the database"));
                            }
                        }
                  });
                }else{
                  feeding_version.id_record=id_rc;
                      feeding_version.version=1;
                      callback(null, feeding_version);
                }
              }else{
                  callback(new Error("The Record (Ficha) with id: "+id_rc+" doesn't exist."));
              }
            },
            function(feeding_version, callback){ 
                ver = feeding_version.version;
                feeding_version.save(function(err){
                  if(err){
                      callback(new Error("failed saving the element version:" + err.message));
                  }else{
                      callback(null, feeding_version);
                  }
                });
            },
            function(feeding_version, callback){ 
                add_objects.RecordVersion.findByIdAndUpdate( id_rc, { $push: { "feedingVersion": id_v } },{ safe: true, upsert: true }).exec(function (err, record) {
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
                  res.json({ message: 'Save FeedingVersion', element: 'feeding', version : ver, _id: id_v, id_record : id_rc });
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

function getFeeding(req, res) {
    var id_rc = req.swagger.params.id.value;
    var version = req.swagger.params.version.value;

    FeedingVersion.findOne({ id_record : id_rc, version: version }).exec(function (err, elementVer) {
            if(err){
              res.status(400);
              res.send(err);
            }else{
              if(elementVer){
                res.json(elementVer);
              }else{
                res.status(400);
                res.json({message: "Doesn't exist a FeedingVersion with id_record: "+id_rc+" and version: "+version});
              }
            }
    });

}


module.exports = {
  postFeeding,
  getFeeding
};