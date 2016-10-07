import mongoose from 'mongoose';
import async from 'async';
import winston from 'winston';
import EnvironmentalEnvelopeVersion from '../models/environmentalEnvelope.js';
import add_objects from '../models/additionalModels.js';


function postEnvironmentalEnvelope(req, res) {
  var environmental_envelope_version  = req.body; 
    environmental_envelope_version._id = mongoose.Types.ObjectId();
    environmental_envelope_version.created=Date();
    environmental_envelope_version.state="to_review";
    environmental_envelope_version.element="environmentalEnvelope";
    var elementValue = environmental_envelope_version.environmentalEnvelope;
    environmental_envelope_version = new EnvironmentalEnvelopeVersion(environmental_envelope_version);
    var id_v = environmental_envelope_version._id;
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
                if(data.environmentalEnvelopeVersion && data.environmentalEnvelopeVersion.length !=0){
                  var lenEnvironmentalEnvelope = data.environmentalEnvelopeVersion.length;
                  var idLast = data.environmentalEnvelopeVersion[lenEnvironmentalEnvelope-1];
                  EnvironmentalEnvelopeVersion.findById(idLast , function (err, doc){
                    if(err){
                      callback(new Error("failed getting the last version of EnvironmentalEnvelopeVersion:" + err.message));
                    }else{
                      var prev = doc.environmentalEnvelopeVersion;
                      var next = environmental_envelope_version.environmentalEnvelopeVersion;
                      //if(!compare.isEqual(prev,next)){ //TODO
                      if(true){
                        environmental_envelope_version.id_record=id_rc;
                        environmental_envelope_version.version=lenEnvironmentalEnvelope+1;
                        callback(null, environmental_envelope_version);
                      }else{
                        callback(new Error("The data in EnvironmentalEnvelopeVersion is equal to last version of this element in the database"));
                      }
                    }
                  });
                }else{
                  environmental_envelope_version.id_record=id_rc;
                  environmental_envelope_version.version=1;
                  callback(null, environmental_envelope_version);
                }
              }else{
                callback(new Error("The Record (Ficha) with id: "+id_rc+" doesn't exist."));
              }
            },
            function(environmental_envelope_version, callback){ 
                ver = environmental_envelope_version.version;
                environmental_envelope_version.save(function(err){
                  if(err){
                      callback(new Error("failed saving the element version:" + err.message));
                  }else{
                      callback(null, environmental_envelope_version);
                  }
                });
            },
            function(environmental_envelope_version, callback){ 
                add_objects.RecordVersion.findByIdAndUpdate( id_rc, { $push: { "environmentalEnvelopeVersion": id_v } },{ safe: true, upsert: true }).exec(function (err, record) {
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
                  winston.info('info', 'Save EnvironmentalEnvelopeVersion, version: ' + ver + " for the Record: " + id_rc);
                  res.json({ message: 'Save EnvironmentalEnvelopeVersion', element: 'environmentalEnvelope', version : ver, _id: id_v, id_record : id_rc });
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

function getEnvironmentalEnvelope(req, res) {
    var id_rc = req.swagger.params.id.value;
    var version = req.swagger.params.version.value;

    EnvironmentalEnvelopeVersion.findOne({ id_record : id_rc, version: version }).exec(function (err, elementVer) {
            if(err){
              res.status(400);
              res.send(err);
            }else{
              if(elementVer){
                res.json(elementVer);
              }else{
                winston.error("message: Doesn't exist a EnvironmentalEnvelopeVersion with id_record " + id_rc+" and version: "+version );
                res.status(400);
                res.json({message: "Doesn't exist a EnvironmentalEnvelopeVersion with id_record: "+id_rc+" and version: "+version});
              }
            }
    });

}


function setAcceptedEnvironmentalEnvelope(req, res) {
  var id_rc = req.swagger.params.id.value;
  var version = req.swagger.params.version.value;
  var id_rc = req.swagger.params.id.value;

  if(typeof  id_rc!=="undefined" && id_rc!=""){
    async.waterfall([
      function(callback){ 
        EnvironmentalEnvelopeVersion.findOne({ id_record : id_rc, state: "to_review", version : version }).exec(function (err, elementVer) {
          if(err){
            callback(new Error(err.message));
          }else if(elementVer == null){
            callback(new Error("Doesn't exist a EnvironmentalEnvelopeVersion with the properties sent."));
          }else{
            callback();
          }
        });
      },
      function(callback){ 
        EnvironmentalEnvelopeVersion.update({ id_record : id_rc, state: "accepted" },{ state: "deprecated" }, { multi: true },function (err, raw){
          if(err){
            callback(new Error(err.message));
          }else{
            console.log("response: "+raw);
            callback();
          }
        });
        
      },
      function(callback){ 
        EnvironmentalEnvelopeVersion.update({ id_record : id_rc, state: "to_review", version : version }, { state: "accepted" }, function (err, elementVer) {
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
        winston.info('info', 'Updated EnvironmentalEnvelopeVersion to accepted, version: ' + version + " for the Record: " + id_rc);
        res.json({ message: 'Updated EnvironmentalEnvelopeVersion to accepted', element: 'environmentalEnvelope', version : version, id_record : id_rc });
      }      
    });
  }else{
    //res.status(406);
      winston.error("message: " + "The url doesn't have the id for the Record (Ficha)" );
      res.status(400);
      res.json({message: "The url doesn't have the id for the Record (Ficha)"});
  }
}

function getToReviewEnvironmentalEnvelope(req, res) {
  var id_rc = req.swagger.params.id.value;
  EnvironmentalEnvelopeVersion.find({ id_record : id_rc, state: "to_review" }).exec(function (err, elementList) {
    if(err){
      winston.error("message: " + err );
      res.status(400);
      res.send(err);
    }else{
      if(elementList){
        //var len = elementVer.length;
        winston.info('info', 'Get list of EnvironmentalEnvelopeVersion with state to_review, function getToReviewEnvironmentalEnvelope');
        res.json(elementList);
      }else{
        winston.error("message: " + err );
        res.status(406);
        res.json({message: "Doesn't exist a EnvironmentalEnvelopeVersion with id_record: "+id_rc});
      }
    }
  });
}

function getLastAcceptedEnvironmentalEnvelope(req, res) {
  var id_rc = req.swagger.params.id.value;
  EnvironmentalEnvelopeVersion.find({ id_record : id_rc, state: "accepted" }).exec(function (err, elementVer) {
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
        res.json({message: "Doesn't exist a EnvironmentalEnvelopeVersion with id_record: "+id_rc});
      }
    }
  });
}

module.exports = {
  postEnvironmentalEnvelope,
  getEnvironmentalEnvelope,
  setAcceptedEnvironmentalEnvelope,
  getToReviewEnvironmentalEnvelope,
  getLastAcceptedEnvironmentalEnvelope
};