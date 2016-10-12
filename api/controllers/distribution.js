import mongoose from 'mongoose';
import async from 'async';
import winston from 'winston';
import DistributionVersion from '../models/distribution.js';
import add_objects from '../models/additionalModels.js';


function postDistribution(req, res) {
  var distribution_version  = req.body; 
    distribution_version._id = mongoose.Types.ObjectId();
    distribution_version.created=Date();
    distribution_version.state="to_review";
    distribution_version.element="distribution";
    var elementValue = distribution_version.distribution;
    distribution_version = new DistributionVersion(distribution_version);
    var id_v = distribution_version._id;
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
                if(data.distributionVersion && data.distributionVersion.length !=0){
                  var lenDistribution = data.distributionVersion.length;
                  var idLast = data.distributionVersion[lenDistribution-1];
                  DistributionVersion.findById(idLast , function (err, doc){
                    if(err){
                      callback(new Error("failed getting the last version of DistributionVersion:" + err.message));
                    }else{
                      var prev = doc.distributionVersion;
                      var next = distribution_version.distributionVersion;
                      //if(!compare.isEqual(prev,next)){ //TODO
                      if(true){
                        distribution_version.id_record=id_rc;
                        distribution_version.version=lenDistribution+1;
                        callback(null, distribution_version);
                      }else{
                        callback(new Error("The data in DistributionVersion is equal to last version of this element in the database"));
                      }
                    }
                  });
                }else{
                  distribution_version.id_record=id_rc;
                  distribution_version.version=1;
                  callback(null, distribution_version);
                }
              }else{
                callback(new Error("The Record (Ficha) with id: "+id_rc+" doesn't exist."));
              }
            },
            function(distribution_version, callback){ 
                ver = distribution_version.version;
                distribution_version.save(function(err){
                  if(err){
                      callback(new Error("failed saving the element version:" + err.message));
                  }else{
                      callback(null, distribution_version);
                  }
                });
            },
            function(distribution_version, callback){ 
                add_objects.RecordVersion.findByIdAndUpdate( id_rc, { $push: { "distributionVersion": id_v } },{ safe: true, upsert: true }).exec(function (err, record) {
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
                  winston.info('info', 'Save DistributionVersion, version: ' + ver + " for the Record: " + id_rc);
                  res.json({ message: 'Save DistributionVersion', element: 'distribution', version : ver, _id: id_v, id_record : id_rc });
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

function getDistribution(req, res) {
    var id_rc = req.swagger.params.id.value;
    var version = req.swagger.params.version.value;

    DistributionVersion.findOne({ id_record : id_rc, version: version }).exec(function (err, elementVer) {
            if(err){
              winston.error("message: " + err );
              res.status(400);
              res.send(err);
            }else{
              if(elementVer){
                res.json(elementVer);
              }else{
                winston.error("message: Doesn't exist a DistributionVersion with id_record " + id_rc+" and version: "+version );
                res.status(400);
                res.json({message: "Doesn't exist a DistributionVersion with id_record: "+id_rc+" and version: "+version});
              }
            }
    });

}


function setAcceptedDistribution(req, res) {
  var id_rc = req.swagger.params.id.value;
  var version = req.swagger.params.version.value;
  var id_rc = req.swagger.params.id.value;

  if(typeof  id_rc!=="undefined" && id_rc!=""){
    async.waterfall([
      function(callback){ 
        DistributionVersion.findOne({ id_record : id_rc, state: "to_review", version : version }).exec(function (err, elementVer) {
          if(err){
            callback(new Error(err.message));
          }else if(elementVer == null){
            callback(new Error("Doesn't exist a DistributionVersion with the properties sent."));
          }else{
            callback();
          }
        });
      },
      function(callback){ 
        DistributionVersion.update({ id_record : id_rc, state: "accepted" },{ state: "deprecated" }, { multi: true },function (err, raw){
          if(err){
            callback(new Error(err.message));
          }else{
            console.log("response: "+raw);
            callback();
          }
        });
        
      },
      function(callback){ 
        DistributionVersion.update({ id_record : id_rc, state: "to_review", version : version }, { state: "accepted" }, function (err, elementVer) {
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
        winston.info('info', 'Updated DistributionVersion to accepted, version: ' + version + " for the Record: " + id_rc);
        res.json({ message: 'Updated DistributionVersion to accepted', element: 'distribution', version : version, id_record : id_rc });
      }      
    });
  }else{
    //res.status(406);
      winston.error("message: " + "The url doesn't have the id for the Record (Ficha)" );
      res.status(400);
      res.json({message: "The url doesn't have the id for the Record (Ficha)"});
  }
}

function getToReviewDistribution(req, res) {
  var id_rc = req.swagger.params.id.value;
  DistributionVersion.find({ id_record : id_rc, state: "to_review" }).exec(function (err, elementList) {
    if(err){
      winston.error("message: " + err );
      res.status(400);
      res.send(err);
    }else{
      if(elementList){
        //var len = elementVer.length;
        winston.info('info', 'Get list of DistributionVersion with state to_review, function getToReviewDistribution');
        res.json(elementList);
      }else{
        winston.error("message: " + err );
        res.status(406);
        res.json({message: "Doesn't exist a DistributionVersion with id_record: "+id_rc});
      }
    }
  });
}

function getLastAcceptedDistribution(req, res) {
  var id_rc = req.swagger.params.id.value;
  DistributionVersion.find({ id_record : id_rc, state: "accepted" }).exec(function (err, elementVer) {
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
        res.json({message: "Doesn't exist a DistributionVersion with id_record: "+id_rc});
      }
    }
  });
}

module.exports = {
  postDistribution,
  getDistribution,
  setAcceptedDistribution,
  getToReviewDistribution,
  getLastAcceptedDistribution
};