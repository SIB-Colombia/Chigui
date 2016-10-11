import mongoose from 'mongoose';
import async from 'async';
import winston from 'winston';
import InteractionsVersion from '../models/interactions.js';
import add_objects from '../models/additionalModels.js';


function postInteractions(req, res) {
  var interactions_version  = req.body; 
    interactions_version._id = mongoose.Types.ObjectId();
    interactions_version.created=Date();
    interactions_version.state="to_review";
    interactions_version.element="interactions";
    var elementValue = interactions_version.interactions;
    interactions_version = new InteractionsVersion(interactions_version);
    var id_v = interactions_version._id;
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
                if(data.interactionsVersion && data.interactionsVersion.length !=0){
                  var lenInteractions = data.interactionsVersion.length;
                  var idLast = data.interactionsVersion[lenInteractions-1];
                  InteractionsVersion.findById(idLast , function (err, doc){
                    if(err){
                      callback(new Error("failed getting the last version of InteractionsVersion:" + err.message));
                    }else{
                      var prev = doc.interactionsVersion;
                      var next = interactions_version.interactionsVersion;
                      //if(!compare.isEqual(prev,next)){ //TODO
                      if(true){
                        interactions_version.id_record=id_rc;
                        interactions_version.version=lenInteractions+1;
                        callback(null, interactions_version);
                      }else{
                        callback(new Error("The data in InteractionsVersion is equal to last version of this element in the database"));
                      }
                    }
                  });
                }else{
                  interactions_version.id_record=id_rc;
                  interactions_version.version=1;
                  callback(null, interactions_version);
                }
              }else{
                callback(new Error("The Record (Ficha) with id: "+id_rc+" doesn't exist."));
              }
            },
            function(interactions_version, callback){ 
                ver = interactions_version.version;
                interactions_version.save(function(err){
                  if(err){
                      callback(new Error("failed saving the element version:" + err.message));
                  }else{
                      callback(null, interactions_version);
                  }
                });
            },
            function(interactions_version, callback){ 
                add_objects.RecordVersion.findByIdAndUpdate( id_rc, { $push: { "interactionsVersion": id_v } },{ safe: true, upsert: true }).exec(function (err, record) {
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
                  winston.error("message: " + err );
                  res.status(400);
                  res.json({ ErrorResponse: {message: ""+err }});
                }else{
                  winston.info('info', 'Save InteractionsVersion, version: ' + ver + " for the Record: " + id_rc);
                  res.json({ message: 'Save InteractionsVersion', element: 'interactions', version : ver, _id: id_v, id_record : id_rc });
               }      
            });

      }else{
        winston.error("message: " + "Empty data in version of the element" );
        res.status(400);
        res.json({message: "Empty data in version of the element"});
      }
    }else{
      winston.error("message: " + "The url doesn't have the id for the Record" );
      res.status(400);
      res.json({message: "The url doesn't have the id for the Record (Ficha)"});
    }

}

function getInteractions(req, res) {
    var id_rc = req.swagger.params.id.value;
    var version = req.swagger.params.version.value;

    InteractionsVersion.findOne({ id_record : id_rc, version: version }).exec(function (err, elementVer) {
            if(err){
              winston.error("message: " + err );
              res.status(400);
              res.send(err);
            }else{
              if(elementVer){
                res.json(elementVer);
              }else{
                winston.error("message: Doesn't exist a InteractionsVersion with id_record " + id_rc+" and version: "+version );
                res.status(400);
                res.json({message: "Doesn't exist a InteractionsVersion with id_record: "+id_rc+" and version: "+version});
              }
            }
    });

}


function setAcceptedInteractions(req, res) {
  var id_rc = req.swagger.params.id.value;
  var version = req.swagger.params.version.value;
  var id_rc = req.swagger.params.id.value;

  if(typeof  id_rc!=="undefined" && id_rc!=""){
    async.waterfall([
      function(callback){ 
        InteractionsVersion.findOne({ id_record : id_rc, state: "to_review", version : version }).exec(function (err, elementVer) {
          if(err){
            callback(new Error(err.message));
          }else if(elementVer == null){
            callback(new Error("Doesn't exist a InteractionsVersion with the properties sent."));
          }else{
            callback();
          }
        });
      },
      function(callback){ 
        InteractionsVersion.update({ id_record : id_rc, state: "accepted" },{ state: "deprecated" }, { multi: true },function (err, raw){
          if(err){
            callback(new Error(err.message));
          }else{
            console.log("response: "+raw);
            callback();
          }
        });
        
      },
      function(callback){ 
        InteractionsVersion.update({ id_record : id_rc, state: "to_review", version : version }, { state: "accepted" }, function (err, elementVer) {
          if(err){
            callback(new Error(err.message));
          }else{
            callback();
          }
        });
      }
    ],
    function(err, result) {
      if (err) {
        console.log("Error: "+err);
        winston.error("message: " + err );
        res.status(400);
        res.json({ ErrorResponse: {message: ""+err }});
      }else{
        winston.info('info', 'Updated InteractionsVersion to accepted, version: ' + version + " for the Record: " + id_rc);
        res.json({ message: 'Updated InteractionsVersion to accepted', element: 'interactions', version : version, id_record : id_rc });
      }      
    });
  }else{
    //res.status(406);
      winston.error("message: " + "The url doesn't have the id for the Record (Ficha)" );
      res.status(400);
      res.json({message: "The url doesn't have the id for the Record (Ficha)"});
  }
}

function getToReviewInteractions(req, res) {
  var id_rc = req.swagger.params.id.value;
  InteractionsVersion.find({ id_record : id_rc, state: "to_review" }).exec(function (err, elementList) {
    if(err){
      winston.error("message: " + err );
      res.status(400);
      res.send(err);
    }else{
      if(elementList){
        //var len = elementVer.length;
        winston.info('info', 'Get list of InteractionsVersion with state to_review, function getToReviewInteractions');
        res.json(elementList);
      }else{
        winston.error("message: " + err );
        res.status(406);
        res.json({message: "Doesn't exist a InteractionsVersion with id_record: "+id_rc});
      }
    }
  });
}

function getLastAcceptedInteractions(req, res) {
  var id_rc = req.swagger.params.id.value;
  InteractionsVersion.find({ id_record : id_rc, state: "accepted" }).exec(function (err, elementVer) {
    if(err){
    winston.error("message: " + err );
      res.status(400);
      res.send(err);
    }else{
      if(elementVer.length !== 0){
        var len = elementVer.length;
        res.json(elementVer[len-1]);
      }else{
        res.status(400);
        res.json({message: "Doesn't exist a InteractionsVersion with id_record: "+id_rc});
      }
    }
  });
}

module.exports = {
  postInteractions,
  getInteractions,
  setAcceptedInteractions,
  getToReviewInteractions,
  getLastAcceptedInteractions
};