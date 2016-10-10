import mongoose from 'mongoose';
import async from 'async';
import winston from 'winston';
import InvasivenessVersion from '../models/invasiveness.js';
import add_objects from '../models/additionalModels.js';


function postInvasiveness(req, res) {
  var invasiveness_version  = req.body; 
    invasiveness_version._id = mongoose.Types.ObjectId();
    invasiveness_version.created=Date();
    invasiveness_version.state="to_review";
    invasiveness_version.element="invasiveness";
    var elementValue = invasiveness_version.invasiveness;
    invasiveness_version = new InvasivenessVersion(invasiveness_version);
    var id_v = invasiveness_version._id;
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
                if(data.invasivenessVersion && data.invasivenessVersion.length !=0){
                  var lenInvasiveness = data.invasivenessVersion.length;
                  var idLast = data.invasivenessVersion[lenInvasiveness-1];
                  InvasivenessVersion.findById(idLast , function (err, doc){
                    if(err){
                      callback(new Error("failed getting the last version of InvasivenessVersion:" + err.message));
                    }else{
                      var prev = doc.invasivenessVersion;
                      var next = invasiveness_version.invasivenessVersion;
                      //if(!compare.isEqual(prev,next)){ //TODO
                      if(true){
                        invasiveness_version.id_record=id_rc;
                        invasiveness_version.version=lenInvasiveness+1;
                        callback(null, invasiveness_version);
                      }else{
                        callback(new Error("The data in InvasivenessVersion is equal to last version of this element in the database"));
                      }
                    }
                  });
                }else{
                  invasiveness_version.id_record=id_rc;
                  invasiveness_version.version=1;
                  callback(null, invasiveness_version);
                }
              }else{
                callback(new Error("The Record (Ficha) with id: "+id_rc+" doesn't exist."));
              }
            },
            function(invasiveness_version, callback){ 
                ver = invasiveness_version.version;
                invasiveness_version.save(function(err){
                  if(err){
                      callback(new Error("failed saving the element version:" + err.message));
                  }else{
                      callback(null, invasiveness_version);
                  }
                });
            },
            function(invasiveness_version, callback){ 
                add_objects.RecordVersion.findByIdAndUpdate( id_rc, { $push: { "invasivenessVersion": id_v } },{ safe: true, upsert: true }).exec(function (err, record) {
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
                  winston.info('info', 'Save InvasivenessVersion, version: ' + ver + " for the Record: " + id_rc);
                  res.json({ message: 'Save InvasivenessVersion', element: 'invasiveness', version : ver, _id: id_v, id_record : id_rc });
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

function getInvasiveness(req, res) {
    var id_rc = req.swagger.params.id.value;
    var version = req.swagger.params.version.value;

    InvasivenessVersion.findOne({ id_record : id_rc, version: version }).exec(function (err, elementVer) {
            if(err){
              winston.error("message: " + err );
              res.status(400);
              res.send(err);
            }else{
              if(elementVer){
                res.json(elementVer);
              }else{
                winston.error("message: Doesn't exist a EnvironmentalEnvelopeVersion with id_record " + id_rc+" and version: "+version );
                res.status(400);
                res.json({message: "Doesn't exist a InvasivenessVersion with id_record: "+id_rc+" and version: "+version});
              }
            }
    });

}


function setAcceptedInvasiveness(req, res) {
  var id_rc = req.swagger.params.id.value;
  var version = req.swagger.params.version.value;
  var id_rc = req.swagger.params.id.value;

  if(typeof  id_rc!=="undefined" && id_rc!=""){
    async.waterfall([
      function(callback){ 
        InvasivenessVersion.findOne({ id_record : id_rc, state: "to_review", version : version }).exec(function (err, elementVer) {
          if(err){
            callback(new Error(err.message));
          }else if(elementVer == null){
            callback(new Error("Doesn't exist a InvasivenessVersion with the properties sent."));
          }else{
            callback();
          }
        });
      },
      function(callback){ 
        InvasivenessVersion.update({ id_record : id_rc, state: "accepted" },{ state: "deprecated" }, { multi: true },function (err, raw){
          if(err){
            callback(new Error(err.message));
          }else{
            console.log("response: "+raw);
            callback();
          }
        });
        
      },
      function(callback){ 
        InvasivenessVersion.update({ id_record : id_rc, state: "to_review", version : version }, { state: "accepted" }, function (err, elementVer) {
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
        winston.info('info', 'Updated InvasivenessVersion to accepted, version: ' + version + " for the Record: " + id_rc);
        res.json({ message: 'Updated InvasivenessVersion to accepted', element: 'invasiveness', version : version, id_record : id_rc });
      }      
    });
  }else{
    //res.status(406);
      winston.error("message: " + "The url doesn't have the id for the Record (Ficha)" );
      res.status(400);
      res.json({message: "The url doesn't have the id for the Record (Ficha)"});
  }
}

function getToReviewInvasiveness(req, res) {
  var id_rc = req.swagger.params.id.value;
  InvasivenessVersion.find({ id_record : id_rc, state: "to_review" }).exec(function (err, elementList) {
    if(err){
      winston.error("message: " + err );
      res.status(400);
      res.send(err);
    }else{
      if(elementList){
        //var len = elementVer.length;
        winston.info('info', 'Get list of InvasivenessVersion with state to_review, function getToReviewInvasiveness');
        res.json(elementList);
      }else{
        winston.error("message: " + err );
        res.status(406);
        res.json({message: "Doesn't exist a InvasivenessVersion with id_record: "+id_rc});
      }
    }
  });
}

function getLastAcceptedInvasiveness(req, res) {
  var id_rc = req.swagger.params.id.value;
  InvasivenessVersion.find({ id_record : id_rc, state: "accepted" }).exec(function (err, elementVer) {
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
        res.json({message: "Doesn't exist a InvasivenessVersion with id_record: "+id_rc});
      }
    }
  });
}

module.exports = {
  postInvasiveness,
  getInvasiveness,
  setAcceptedInvasiveness,
  getToReviewInvasiveness,
  getLastAcceptedInvasiveness
};