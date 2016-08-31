import mongoose from 'mongoose';
import async from 'async';
import CommonNamesAtomizedVersion from '../models/commonNamesAtomized.js';
import add_objects from '../models/additionalModels.js';


function postCommonNamesAtomized(req, res) {
  var common_names_atomized  = req.body; 
    common_names_atomized._id = mongoose.Types.ObjectId();
    common_names_atomized.created=Date();
    common_names_atomized.element="commonNamesAtomized";
    var elementValue = common_names_atomized.commonNamesAtomized;
    common_names_atomized = new CommonNamesAtomizedVersion(common_names_atomized);
    var id_v = common_names_atomized._id;
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
                var lencommonNamesAtomized = data.commonNamesAtomizedVersion.length;
                if( lencommonNamesAtomized !=0 ){
                  var idLast = data.commonNamesAtomizedVersion[lencommonNamesAtomized-1];
                  CommonNamesAtomizedVersion.findById(idLast , function (err, doc){
                    if(err){
                            callback(new Error("failed getting the last version of commonNamesAtomizedVersion:" + err.message));
                        }else{
                          var prev = doc.commonNamesAtomized;
                            var next = common_names_atomized.commonNamesAtomized;
                            //if(!compare.isEqual(prev,next)){ //TODO
                            if(true){
                              common_names_atomized.id_record=id_rc;
                              common_names_atomized.version=lencommonNamesAtomized+1;
                              callback(null, common_names_atomized);
                            }else{
                              callback(new Error("The data in commonNamesAtomized is equal to last version of this element in the database"));
                            }
                        }
                  });
                }else{
                  common_names_atomized.id_record=id_rc;
                      common_names_atomized.version=1;
                      callback(null, common_names_atomized);
                }
              }else{
                  callback(new Error("The Record (Ficha) with id: "+id_rc+" doesn't exist."));
              }
            },
            function(common_names_atomized, callback){ 
                ver = common_names_atomized.version;
                common_names_atomized.save(function(err){
                  if(err){
                      callback(new Error("failed saving the element version:" + err.message));
                  }else{
                      callback(null, common_names_atomized);
                  }
                });
            },
            function(common_names_atomized, callback){ 
                add_objects.RecordVersion.findByIdAndUpdate( id_rc, { $push: { "commonNamesAtomizedVersion": id_v } },{ safe: true, upsert: true }).exec(function (err, record) {
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
                  res.json({ message: 'Save CommonNamesAtomizedVersion', element: 'commonNamesAtomized', version : ver, _id: id_v, id_record : id_rc });
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

function getCommonNamesAtomized(req, res) {
    var id_rc = req.swagger.params.id.value;
    var version = req.swagger.params.version.value;

    CommonNamesAtomizedVersion.findOne({ id_record : id_rc, version: version }).exec(function (err, elementVer) {
            if(err){
              res.status(400);
              res.send(err);
            }else{
              if(elementVer){
                res.json(elementVer);
              }else{
                res.status(400);
                res.json({message: "Doesn't exist a CommonNamesAtomizedVersion with id_record: "+id_rc+" and version: "+version});
              }
            }
    });

}


module.exports = {
  postCommonNamesAtomized,
  getCommonNamesAtomized
};