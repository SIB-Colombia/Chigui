import mongoose from 'mongoose';
import async from 'async';
import winston from 'winston';
import SynonymsAtomizedVersion from '../models/synonymsAtomized.js';
import add_objects from '../models/additionalModels.js';

winston.add(winston.transports.File, { filename: 'chigui.log' });

function postSynonymsAtomized(req, res) {
  var synonyms_atomized  = req.body; 
    synonyms_atomized._id = mongoose.Types.ObjectId();
    synonyms_atomized.created=Date();
    synonyms_atomized.element="synonymsAtomized";
    var elementValue = synonyms_atomized.synonymsAtomized;
    synonyms_atomized = new SynonymsAtomizedVersion(synonyms_atomized);
    var id_v = synonyms_atomized._id;
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
                var lensynonymsAtomized = data.synonymsAtomizedVersion.length;
                if( lensynonymsAtomized !=0 ){
                  var idLast = data.synonymsAtomizedVersion[lensynonymsAtomized-1];
                  SynonymsAtomizedVersion.findById(idLast , function (err, doc){
                    if(err){
                            callback(new Error("failed getting the last version of synonymsAtomizedVersion:" + err.message));
                        }else{
                          var prev = doc.synonymsAtomized;
                            var next = synonyms_atomized.synonymsAtomized;
                            //if(!compare.isEqual(prev,next)){ //TODO
                            if(true){
                              synonyms_atomized.id_record=id_rc;
                              synonyms_atomized.version=lensynonymsAtomized+1;
                              callback(null, synonyms_atomized);
                            }else{
                              callback(new Error("The data in synonymsAtomized is equal to last version of this element in the database"));
                            }
                        }
                  });
                }else{
                  synonyms_atomized.id_record=id_rc;
                      synonyms_atomized.version=1;
                      callback(null, synonyms_atomized);
                }
              }else{
                  callback(new Error("The Record (Ficha) with id: "+id_rc+" doesn't exist."));
              }
            },
            function(synonyms_atomized, callback){ 
                ver = synonyms_atomized.version;
                synonyms_atomized.save(function(err){
                  if(err){
                      callback(new Error("failed saving the element version:" + err.message));
                  }else{
                      callback(null, synonyms_atomized);
                  }
                });
            },
            function(synonyms_atomized, callback){ 
                add_objects.RecordVersion.findByIdAndUpdate( id_rc, { $push: { "synonymsAtomizedVersion": id_v } },{ safe: true, upsert: true }).exec(function (err, record) {
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
                  winston.info('info', 'Save SynonymsAtomizedVersion, version: ' + ver + " for the Record: " + id_rc);
                  res.json({ message: 'Save SynonymsAtomizedVersion', element: 'synonymsAtomized', version : ver, _id: id_v, id_record : id_rc });
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

function getSynonymsAtomized(req, res) {
    var id_rc = req.swagger.params.id.value;
    var version = req.swagger.params.version.value;

    SynonymsAtomizedVersion.findOne({ id_record : id_rc, version: version }).exec(function (err, elementVer) {
            if(err){
              winston.error("message: " + err );
              res.status(400);
              res.send(err);
            }else{
              if(elementVer){
                res.json(elementVer);
              }else{
                res.status(400);
                winston.error("message: Doesn't exist a SynonymsAtomizedVersion with id_record " + id_rc+" and version: "+version );
                res.json({message: "Doesn't exist a SynonymsAtomizedVersion with id_record: "+id_rc+" and version: "+version});
              }
            }
    });

}


function setAcceptedSynonymsAtomized(req, res) {
  var id_rc = req.swagger.params.id.value;
  var version = req.swagger.params.version.value;
  var id_rc = req.swagger.params.id.value;

  if(typeof  id_rc!=="undefined" && id_rc!=""){
    async.waterfall([
      function(callback){ 
        SynonymsAtomizedVersion.findOne({ id_record : id_rc, state: "to_review", version : version }).exec(function (err, elementVer) {
          if(err){
            callback(new Error(err.message));
          }else if(elementVer == null){
            callback(new Error("Doesn't exist a SynonymsAtomizedVersion with the properties sent."));
          }else{
            callback();
          }
        });
      },
      function(callback){ 
        SynonymsAtomizedVersion.update({ id_record : id_rc, state: "accepted" },{ state: "deprecated" }, { multi: true },function (err, raw){
          if(err){
            callback(new Error(err.message));
          }else{
            console.log("response: "+raw);
            callback();
          }
        });
        
      },
      function(callback){ 
        SynonymsAtomizedVersion.update({ id_record : id_rc, state: "to_review", version : version }, { state: "accepted" }, function (err, elementVer) {
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
        winston.info('info', 'Updated SynonymsAtomizedVersion to accepted, version: ' + version + " for the Record: " + id_rc);
        res.json({ message: 'Updated SynonymsAtomizedVersion to accepted', element: 'synonymsAtomized', version : version, id_record : id_rc });
      }      
    });
  }else{
    //res.status(406);
      winston.error("message: " + "The url doesn't have the id for the Record (Ficha)" );
      res.status(400);
      res.json({message: "The url doesn't have the id for the Record (Ficha)"});
  }
}

function getToReviewSynonymsAtomized(req, res) {
  var id_rc = req.swagger.params.id.value;
  SynonymsAtomizedVersion.find({ id_record : id_rc, state: "to_review" }).exec(function (err, elementList) {
    if(err){
      winston.error("message: " + err );
      res.status(400);
      res.send(err);
    }else{
      if(elementList){
        //var len = elementVer.length;
        winston.info('info', 'Get list of SynonymsAtomizedVersion with state to_review, function getToReviewSynonymsAtomized');
        res.json(elementList);
      }else{
        winston.error("message: " + err );
        res.status(406);
        res.json({message: "Doesn't exist a SynonymsAtomizedVersion with id_record: "+id_rc});
      }
    }
  });
}

function getLastAcceptedSynonymsAtomized(req, res) {
  var id_rc = req.swagger.params.id.value;
  SynonymsAtomizedVersion.find({ id_record : id_rc, state: "accepted" }).exec(function (err, elementVer) {
    if(err){
      winston.error("message: " + err );
      res.status(400);
      res.send(err);
    }else{
      if(elementVer){
        var len = elementVer.length;
        res.json(elementVer[len-1]);
      }else{
        res.status(400);
        res.json({message: "Doesn't exist a SynonymsAtomizedVersion with id_record: "+id_rc});
      }
    }
  });
}

module.exports = {
  postSynonymsAtomized,
  getSynonymsAtomized,
  setAcceptedSynonymsAtomized,
  getToReviewSynonymsAtomized,
  getLastAcceptedSynonymsAtomized
};