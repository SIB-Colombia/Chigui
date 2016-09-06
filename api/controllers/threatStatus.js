import mongoose from 'mongoose';
import async from 'async';
import ThreatStatusVersion from '../models/threatStatus.js';
import add_objects from '../models/additionalModels.js';


function postThreatStatus(req, res) {
  var threat_status_version  = req.body; 
    threat_status_version._id = mongoose.Types.ObjectId();
    threat_status_version.created=Date();
    threat_status_version.element="threatStatus";
    var elementValue = threat_status_version.threatStatus;
    threat_status_version = new ThreatStatusVersion(threat_status_version);
    var id_v = threat_status_version._id;
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
                var lenthreatStatus = data.threatStatusVersion.length;
                if( lenthreatStatus !=0 ){
                  var idLast = data.threatStatusVersion[lenthreatStatus-1];
                  ThreatStatusVersion.findById(idLast , function (err, doc){
                    if(err){
                            callback(new Error("failed getting the last version of threatStatusVersion:" + err.message));
                        }else{
                          var prev = doc.threatStatus;
                            var next = threat_status_version.threatStatus;
                            //if(!compare.isEqual(prev,next)){ //TODO
                            if(true){
                              threat_status_version.id_record=id_rc;
                              threat_status_version.version=lenthreatStatus+1;
                              callback(null, threat_status_version);
                            }else{
                              callback(new Error("The data in threatStatus is equal to last version of this element in the database"));
                            }
                        }
                  });
                }else{
                  threat_status_version.id_record=id_rc;
                      threat_status_version.version=1;
                      callback(null, threat_status_version);
                }
              }else{
                  callback(new Error("The Record (Ficha) with id: "+id_rc+" doesn't exist."));
              }
            },
            function(threat_status_version, callback){ 
                ver = threat_status_version.version;
                threat_status_version.save(function(err){
                  if(err){
                      callback(new Error("failed saving the element version:" + err.message));
                  }else{
                      callback(null, threat_status_version);
                  }
                });
            },
            function(threat_status_version, callback){ 
                add_objects.RecordVersion.findByIdAndUpdate( id_rc, { $push: { "threatStatusVersion": id_v } },{ safe: true, upsert: true }).exec(function (err, record) {
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
                  res.json({ message: 'Save ThreatStatusVersion', element: 'threatStatus', version : ver, _id: id_v, id_record : id_rc });
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

function getThreatStatus(req, res) {
    var id_rc = req.swagger.params.id.value;
    var version = req.swagger.params.version.value;

    ThreatStatusVersion.findOne({ id_record : id_rc, version: version }).exec(function (err, elementVer) {
            if(err){
              res.status(400);
              res.send(err);
            }else{
              if(elementVer){
                res.json(elementVer);
              }else{
                res.status(400);
                res.json({message: "Doesn't exist a ThreatStatusVersion with id_record: "+id_rc+" and version: "+version});
              }
            }
    });

}


module.exports = {
  postThreatStatus,
  getThreatStatus
};