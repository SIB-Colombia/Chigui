import mongoose from 'mongoose';
import async from 'async';
import MigratoryVersion from '../models/migratory.js';
import add_objects from '../models/additionalModels.js';


function postMigratory(req, res) {
  var migratory_version  = req.body; 
    migratory_version._id = mongoose.Types.ObjectId();
    migratory_version.created=Date();
    migratory_version.element="migratory";
    var elementValue = migratory_version.migratory;
    migratory_version = new MigratoryVersion(migratory_version);
    var id_v = migratory_version._id;
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
                var lenmigratory = data.migratoryVersion.length;
                if( lenmigratory !=0 ){
                  var idLast = data.migratoryVersion[lenmigratory-1];
                  MigratoryVersion.findById(idLast , function (err, doc){
                    if(err){
                            callback(new Error("failed getting the last version of migratoryVersion:" + err.message));
                        }else{
                          var prev = doc.migratory;
                            var next = migratory_version.migratory;
                            //if(!compare.isEqual(prev,next)){ //TODO
                            if(true){
                              migratory_version.id_record=id_rc;
                              migratory_version.version=lenmigratory+1;
                              callback(null, migratory_version);
                            }else{
                              callback(new Error("The data in migratory is equal to last version of this element in the database"));
                            }
                        }
                  });
                }else{
                  migratory_version.id_record=id_rc;
                      migratory_version.version=1;
                      callback(null, migratory_version);
                }
              }else{
                  callback(new Error("The Record (Ficha) with id: "+id_rc+" doesn't exist."));
              }
            },
            function(migratory_version, callback){ 
                ver = migratory_version.version;
                migratory_version.save(function(err){
                  if(err){
                      callback(new Error("failed saving the element version:" + err.message));
                  }else{
                      callback(null, migratory_version);
                  }
                });
            },
            function(migratory_version, callback){ 
                add_objects.RecordVersion.findByIdAndUpdate( id_rc, { $push: { "migratoryVersion": id_v } },{ safe: true, upsert: true }).exec(function (err, record) {
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
                  res.json({ message: 'Save MigratoryVersion', element: 'migratory', version : ver, _id: id_v, id_record : id_rc });
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

function getMigratory(req, res) {
    var id_rc = req.swagger.params.id.value;
    var version = req.swagger.params.version.value;

    MigratoryVersion.findOne({ id_record : id_rc, version: version }).exec(function (err, elementVer) {
            if(err){
              res.status(400);
              res.send(err);
            }else{
              if(elementVer){
                res.json(elementVer);
              }else{
                res.status(400);
                res.json({message: "Doesn't exist a MigratoryVersion with id_record: "+id_rc+" and version: "+version});
              }
            }
    });

}


module.exports = {
  postMigratory,
  getMigratory
};