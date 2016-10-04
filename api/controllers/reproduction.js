import mongoose from 'mongoose';
import async from 'async';
import winston from 'winston';
import ReproductionVersion from '../models/reproduction.js';
import add_objects from '../models/additionalModels.js';


function postReproduction(req, res) {
  var reproduction_version  = req.body; 
    reproduction_version._id = mongoose.Types.ObjectId();
    reproduction_version.created=Date();
    reproduction_version.state="to_review";
    reproduction_version.element="reproduction";
    var elementValue = reproduction_version.reproduction;
    reproduction_version = new ReproductionVersion(reproduction_version);
    var id_v = reproduction_version._id;
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
                if(data.reproductionVersion && data.reproductionVersion.length !=0){
                  var lenreproduction = data.reproductionVersion.length;
                  var idLast = data.reproductionVersion[lenreproduction-1];
                  ReproductionVersion.findById(idLast , function (err, doc){
                    if(err){
                      callback(new Error("failed getting the last version of reproductionVersion:" + err.message));
                    }else{
                      var prev = doc.reproductionVersion;
                      var next = reproduction_version.reproductionVersion;
                      //if(!compare.isEqual(prev,next)){ //TODO
                      if(true){
                        reproduction_version.id_record=id_rc;
                        reproduction_version.version=lenreproduction+1;
                        callback(null, reproduction_version);
                      }else{
                        callback(new Error("The data in reproductionVersion is equal to last version of this element in the database"));
                      }
                    }
                  });
                }else{
                  reproduction_version.id_record=id_rc;
                  reproduction_version.version=1;
                  callback(null, reproduction_version);
                }
              }else{
                callback(new Error("The Record (Ficha) with id: "+id_rc+" doesn't exist."));
              }
            },
            function(reproduction_version, callback){ 
                ver = reproduction_version.version;
                reproduction_version.save(function(err){
                  if(err){
                      callback(new Error("failed saving the element version:" + err.message));
                  }else{
                      callback(null, reproduction_version);
                  }
                });
            },
            function(reproduction_version, callback){ 
                add_objects.RecordVersion.findByIdAndUpdate( id_rc, { $push: { "reproductionVersion": id_v } },{ safe: true, upsert: true }).exec(function (err, record) {
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
                  winston.info('info', 'Save ReproductionVersion, version: ' + ver + " for the Record: " + id_rc);
                  res.json({ message: 'Save ReproductionVersion', element: 'reproduction', version : ver, _id: id_v, id_record : id_rc });
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

function getReproduction(req, res) {
    var id_rc = req.swagger.params.id.value;
    var version = req.swagger.params.version.value;

    ReproductionVersion.findOne({ id_record : id_rc, version: version }).exec(function (err, elementVer) {
            if(err){
              winston.error("message: " + err );
              res.status(400);
              res.send(err);
            }else{
              if(elementVer){
                res.json(elementVer);
              }else{
                winston.error("message: Doesn't exist a ReproductionVersion with id_record " + id_rc+" and version: "+version );
                res.status(400);
                res.json({message: "Doesn't exist a ReproductionVersion with id_record: "+id_rc+" and version: "+version});
              }
            }
    });

}


function setAcceptedReproduction(req, res) {
  var id_rc = req.swagger.params.id.value;
  var version = req.swagger.params.version.value;
  var id_rc = req.swagger.params.id.value;

  if(typeof  id_rc!=="undefined" && id_rc!=""){
    async.waterfall([
      function(callback){ 
        ReproductionVersion.findOne({ id_record : id_rc, state: "to_review", version : version }).exec(function (err, elementVer) {
          if(err){
            callback(new Error(err.message));
          }else if(elementVer == null){
            callback(new Error("Doesn't exist a ReproductionVersion with the properties sent."));
          }else{
            callback();
          }
        });
      },
      function(callback){ 
        ReproductionVersion.update({ id_record : id_rc, state: "accepted" },{ state: "deprecated" }, { multi: true },function (err, raw){
          if(err){
            callback(new Error(err.message));
          }else{
            console.log("response: "+raw);
            callback();
          }
        });
        
      },
      function(callback){ 
        ReproductionVersion.update({ id_record : id_rc, state: "to_review", version : version }, { state: "accepted" }, function (err, elementVer) {
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
        winston.info('info', 'Updated ReproductionVersion to accepted, version: ' + version + " for the Record: " + id_rc);
        res.json({ message: 'Updated ReproductionVersion to accepted', element: 'reproduction', version : version, id_record : id_rc });
      }      
    });
  }else{
    //res.status(406);
      winston.error("message: " + "The url doesn't have the id for the Record (Ficha)" );
      res.status(400);
      res.json({message: "The url doesn't have the id for the Record (Ficha)"});
  }
}

function getToReviewReproduction(req, res) {
  var id_rc = req.swagger.params.id.value;
  ReproductionVersion.find({ id_record : id_rc, state: "to_review" }).exec(function (err, elementList) {
    if(err){
      winston.error("message: " + err );
      res.status(400);
      res.send(err);
    }else{
      if(elementList){
        //var len = elementVer.length;
        winston.info('info', 'Get list of ReproductionVersion with state to_review, function getToReviewReproduction');
        res.json(elementList);
      }else{
        winston.error("message: " + err );
        res.status(406);
        res.json({message: "Doesn't exist a ReproductionVersion with id_record: "+id_rc});
      }
    }
  });
}

function getLastAcceptedReproduction(req, res) {
  var id_rc = req.swagger.params.id.value;
  ReproductionVersion.find({ id_record : id_rc, state: "accepted" }).exec(function (err, elementVer) {
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
        res.json({message: "Doesn't exist a ReproductionVersion with id_record: "+id_rc});
      }
    }
  });
}

module.exports = {
  postReproduction,
  getReproduction,
  setAcceptedReproduction,
  getToReviewReproduction,
  getLastAcceptedReproduction
};