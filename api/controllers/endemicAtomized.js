import mongoose from 'mongoose';
import async from 'async';
import EndemicAtomizedVersion from '../models/endemicAtomized.js';
import add_objects from '../models/additionalModels.js';


function postEndemicAtomized(req, res) {
  var endemic_atomized_version  = req.body; 
    endemic_atomized_version._id = mongoose.Types.ObjectId();
    endemic_atomized_version.created=Date();
    endemic_atomized_version.element="endemicAtomized";
    var elementValue = endemic_atomized_version.endemicAtomized;
    endemic_atomized_version = new EndemicAtomizedVersion(endemic_atomized_version);
    var id_v = endemic_atomized_version._id;
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
                var lenendemicAtomized = data.endemicAtomizedVersion.length;
                if( lenendemicAtomized !=0 ){
                  var idLast = data.endemicAtomizedVersion[lenendemicAtomized-1];
                  EndemicAtomizedVersion.findById(idLast , function (err, doc){
                    if(err){
                            callback(new Error("failed getting the last version of endemicAtomizedVersion:" + err.message));
                        }else{
                          var prev = doc.endemicAtomized;
                            var next = endemic_atomized_version.endemicAtomized;
                            //if(!compare.isEqual(prev,next)){ //TODO
                            if(true){
                              endemic_atomized_version.id_record=id_rc;
                              endemic_atomized_version.version=lenendemicAtomized+1;
                              callback(null, endemic_atomized_version);
                            }else{
                              callback(new Error("The data in endemicAtomized is equal to last version of this element in the database"));
                            }
                        }
                  });
                }else{
                  endemic_atomized_version.id_record=id_rc;
                      endemic_atomized_version.version=1;
                      callback(null, endemic_atomized_version);
                }
              }else{
                  callback(new Error("The Record (Ficha) with id: "+id_rc+" doesn't exist."));
              }
            },
            function(endemic_atomized_version, callback){ 
                ver = endemic_atomized_version.version;
                endemic_atomized_version.save(function(err){
                  if(err){
                      callback(new Error("failed saving the element version:" + err.message));
                  }else{
                      callback(null, endemic_atomized_version);
                  }
                });
            },
            function(endemic_atomized_version, callback){ 
                add_objects.RecordVersion.findByIdAndUpdate( id_rc, { $push: { "endemicAtomizedVersion": id_v } },{ safe: true, upsert: true }).exec(function (err, record) {
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
                  res.json({ message: 'Save EndemicAtomizedVersion', element: 'endemicAtomized', version : ver, _id: id_v, id_record : id_rc });
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

function getEndemicAtomized(req, res) {
    var id_rc = req.swagger.params.id.value;
    var version = req.swagger.params.version.value;

    EndemicAtomizedVersion.findOne({ id_record : id_rc, version: version }).exec(function (err, elementVer) {
            if(err){
              res.status(400);
              res.send(err);
            }else{
              if(elementVer){
                res.json(elementVer);
              }else{
                res.status(400);
                res.json({message: "Doesn't exist a EndemicAtomizedVersion with id_record: "+id_rc+" and version: "+version});
              }
            }
    });

}


module.exports = {
  postEndemicAtomized,
  getEndemicAtomized
};