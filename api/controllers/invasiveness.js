import mongoose from 'mongoose';
import async from 'async';
import InvasivenessVersion from '../models/invasiveness.js';
import add_objects from '../models/additionalModels.js';


function postInvasiveness(req, res) {
  var invasiveness_version  = req.body; 
    invasiveness_version._id = mongoose.Types.ObjectId();
    invasiveness_version.created=Date();
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
                var leninvasiveness= data.invasivenessVersion.length;
                if( leninvasiveness!=0 ){
                  var idLast = data.invasivenessVersion[leninvasiveness-1];
                  InvasivenessVersion.findById(idLast , function (err, doc){
                    if(err){
                            callback(new Error("failed getting the last version of invasivenessVersion:" + err.message));
                        }else{
                          var prev = doc.invasiveness;
                            var next = invasiveness_version.invasiveness;
                            //if(!compare.isEqual(prev,next)){ //TODO
                            if(true){
                              invasiveness_version.id_record=id_rc;
                              invasiveness_version.version=leninvasiveness+1;
                              callback(null, invasiveness_version);
                            }else{
                              callback(new Error("The data in invasiveness is equal to last version of this element in the database"));
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
                  //res.status(406);
                  res.status(400);
                  res.json({ ErrorResponse: {message: ""+err }});
                }else{
                  res.json({ message: 'Save InvasivenessVersion', element: 'invasiveness', version : ver, _id: id_v, id_record : id_rc });
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

function getInvasiveness(req, res) {
    var id_rc = req.swagger.params.id.value;
    var version = req.swagger.params.version.value;

    InvasivenessVersion.findOne({ id_record : id_rc, version: version }).exec(function (err, elementVer) {
            if(err){
              res.status(400);
              res.send(err);
            }else{
              if(elementVer){
                res.json(elementVer);
              }else{
                res.status(400);
                res.json({message: "Doesn't exist a InvasivenessVersion with id_record: "+id_rc+" and version: "+version});
              }
            }
    });

}


module.exports = {
  postInvasiveness,
  getInvasiveness
};