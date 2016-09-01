import mongoose from 'mongoose';
import async from 'async';
import IdentificationKeysVersion from '../models/identificationKeys.js';
import add_objects from '../models/additionalModels.js';


function postIdentificationKeys(req, res) {
  var identification_keys_version  = req.body; 
    identification_keys_version._id = mongoose.Types.ObjectId();
    identification_keys_version.created=Date();
    identification_keys_version.element="identificationKeys";
    var elementValue = identification_keys_version.identificationKeys;
    identification_keys_version = new IdentificationKeysVersion(identification_keys_version);
    var id_v = identification_keys_version._id;
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
                var lenidentificationKeys = data.identificationKeysVersion.length;
                if( lenidentificationKeys !=0 ){
                  var idLast = data.identificationKeysVersion[lenidentificationKeys-1];
                  IdentificationKeysVersion.findById(idLast , function (err, doc){
                    if(err){
                            callback(new Error("failed getting the last version of identificationKeysVersion:" + err.message));
                        }else{
                          var prev = doc.identificationKeys;
                            var next = identification_keys_version.identificationKeys;
                            //if(!compare.isEqual(prev,next)){ //TODO
                            if(true){
                              identification_keys_version.id_record=id_rc;
                              identification_keys_version.version=lenidentificationKeys+1;
                              callback(null, identification_keys_version);
                            }else{
                              callback(new Error("The data in identificationKeys is equal to last version of this element in the database"));
                            }
                        }
                  });
                }else{
                  identification_keys_version.id_record=id_rc;
                      identification_keys_version.version=1;
                      callback(null, identification_keys_version);
                }
              }else{
                  callback(new Error("The Record (Ficha) with id: "+id_rc+" doesn't exist."));
              }
            },
            function(identification_keys_version, callback){ 
                ver = identification_keys_version.version;
                identification_keys_version.save(function(err){
                  if(err){
                      callback(new Error("failed saving the element version:" + err.message));
                  }else{
                      callback(null, identification_keys_version);
                  }
                });
            },
            function(identification_keys_version, callback){ 
                add_objects.RecordVersion.findByIdAndUpdate( id_rc, { $push: { "identificationKeysVersion": id_v } },{ safe: true, upsert: true }).exec(function (err, record) {
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
                  res.json({ message: 'Save IdentificationKeysVersion', element: 'identificationKeys', version : ver, _id: id_v, id_record : id_rc });
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

function getIdentificationKeys(req, res) {
    var id_rc = req.swagger.params.id.value;
    var version = req.swagger.params.version.value;

    IdentificationKeysVersion.findOne({ id_record : id_rc, version: version }).exec(function (err, elementVer) {
            if(err){
              res.status(400);
              res.send(err);
            }else{
              if(elementVer){
                res.json(elementVer);
              }else{
                res.status(400);
                res.json({message: "Doesn't exist a IdentificationKeysVersion with id_record: "+id_rc+" and version: "+version});
              }
            }
    });

}


module.exports = {
  postIdentificationKeys,
  getIdentificationKeys
};