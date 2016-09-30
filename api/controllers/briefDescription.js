import mongoose from 'mongoose';
import async from 'async';
import winston from 'winston';
import BriefDescription from '../models/briefDescription.js';
import add_objects from '../models/additionalModels.js';


function postBriefDescription(req, res) {
  var brief_description_version  = req.body; 
    brief_description_version._id = mongoose.Types.ObjectId();
    brief_description_version.created=Date();
    brief_description_version.element="briefDescription";
    var elementValue = brief_description_version.briefDescription;
    brief_description_version = new BriefDescription(brief_description_version);
    var id_v = brief_description_version._id;
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
                if(data.briefDescriptionVersion && data.briefDescriptionVersion.length !=0){
                  var lenbriefDescription = data.briefDescriptionVersion.length;
                  var idLast = data.briefDescriptionVersion[lenbriefDescription-1];
                  BriefDescriptionVersion.findById(idLast , function (err, doc){
                    if(err){
                      callback(new Error("failed getting the last version of briefDescriptionVersion:" + err.message));
                    }else{
                      var prev = doc.briefDescriptionVersion;
                      var next = brief_description_version.briefDescriptionVersion;
                      //if(!compare.isEqual(prev,next)){ //TODO
                      if(true){
                        brief_description_version.id_record=id_rc;
                        brief_description_version.version=lenbriefDescription+1;
                        callback(null, brief_description_version);
                      }else{
                        callback(new Error("The data in briefDescriptionVersion is equal to last version of this element in the database"));
                      }
                    }
                  });
                }else{
                  brief_description_version.id_record=id_rc;
                  brief_description_version.version=1;
                  callback(null, brief_description_version);
                }
              }else{
                callback(new Error("The Record (Ficha) with id: "+id_rc+" doesn't exist."));
              }
            },
            function(brief_description_version, callback){ 
                ver = brief_description_version.version;
                brief_description_version.save(function(err){
                  if(err){
                      callback(new Error("failed saving the element version:" + err.message));
                  }else{
                      callback(null, brief_description_version);
                  }
                });
            },
            function(brief_description_version, callback){ 
                add_objects.RecordVersion.findByIdAndUpdate( id_rc, { $push: { "briefDescription": id_v } },{ safe: true, upsert: true }).exec(function (err, record) {
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
                  winston.info('info', 'Save BriefDescription, version: ' + ver + " for the Record: " + id_rc);
                  res.json({ message: 'Save BriefDescription', element: 'briefDescription', version : ver, _id: id_v, id_record : id_rc });
               }      
            });

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

function getBriefDescription(req, res) {
    var id_rc = req.swagger.params.id.value;
    var version = req.swagger.params.version.value;

    BriefDescription.findOne({ id_record : id_rc, version: version }).exec(function (err, elementVer) {
            if(err){
              winston.error("message: " + err );
              res.status(400);
              res.send(err);
            }else{
              if(elementVer){
                res.json(elementVer);
              }else{
                res.status(400);
                winston.error("message: Doesn't exist a BriefDescriptionVersion with id_record " + id_rc+" and version: "+version );
                res.json({message: "Doesn't exist a BriefDescription with id_record: "+id_rc+" and version: "+version});
              }
            }
    });

}


function setAcceptedBriefDescription(req, res) {
  var id_rc = req.swagger.params.id.value;
  var version = req.swagger.params.version.value;
  var id_rc = req.swagger.params.id.value;

  if(typeof  id_rc!=="undefined" && id_rc!=""){
    async.waterfall([
      function(callback){ 
        BriefDescriptionVersion.findOne({ id_record : id_rc, state: "to_review", version : version }).exec(function (err, elementVer) {
          if(err){
            callback(new Error(err.message));
          }else if(elementVer == null){
            callback(new Error("Doesn't exist a BriefDescriptionVersion with the properties sent."));
          }else{
            callback();
          }
        });
      },
      function(callback){ 
        BriefDescriptionVersion.update({ id_record : id_rc, state: "accepted" },{ state: "deprecated" }, { multi: true },function (err, raw){
          if(err){
            callback(new Error(err.message));
          }else{
            console.log("response: "+raw);
            callback();
          }
        });
        
      },
      function(callback){ 
        BriefDescriptionVersion.update({ id_record : id_rc, state: "to_review", version : version }, { state: "accepted" }, function (err, elementVer) {
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
        winston.info('info', 'Updated BriefDescriptionVersion to accepted, version: ' + version + " for the Record: " + id_rc);
        res.json({ message: 'Updated BriefDescriptionVersion to accepted', element: 'briefDescription', version : version, id_record : id_rc });
      }      
    });
  }else{
    //res.status(406);
      winston.error("message: " + "The url doesn't have the id for the Record (Ficha)" );
      res.status(400);
      res.json({message: "The url doesn't have the id for the Record (Ficha)"});
  }
}

function getToReviewBriefDescription(req, res) {
  var id_rc = req.swagger.params.id.value;
  BriefDescriptionVersion.find({ id_record : id_rc, state: "to_review" }).exec(function (err, elementList) {
    if(err){
      winston.error("message: " + err );
      res.status(400);
      res.send(err);
    }else{
      if(elementList){
        //var len = elementVer.length;
        winston.info('info', 'Get list of BriefDescriptionVersion with state to_review, function getToReviewBriefDescription');
        res.json(elementList);
      }else{
        winston.error("message: " + err );
        res.status(406);
        res.json({message: "Doesn't exist a BriefDescriptionVersion with id_record: "+id_rc});
      }
    }
  });
}

function getLastAcceptedBriefDescription(req, res) {
  var id_rc = req.swagger.params.id.value;
  BriefDescriptionVersion.find({ id_record : id_rc, state: "accepted" }).exec(function (err, elementVer) {
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
        res.json({message: "Doesn't exist a BriefDescriptionVersion with id_record: "+id_rc});
      }
    }
  });
}

module.exports = {
  postBriefDescription,
  getBriefDescription,
  setAcceptedBriefDescription,
  getToReviewBriefDescription,
  getLastAcceptedBriefDescription
};