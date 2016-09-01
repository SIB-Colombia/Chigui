import mongoose from 'mongoose';
import async from 'async';
import FullDescriptionVersion from '../models/fullDescription.js';
import add_objects from '../models/additionalModels.js';


function postFullDescription(req, res) {
  var full_description_version  = req.body; 
    full_description_version._id = mongoose.Types.ObjectId();
    full_description_version.created=Date();
    full_description_version.element="fullDescription";
    var elementValue = full_description_version.fullDescription;
    full_description_version = new FullDescriptionVersion(full_description_version);
    var id_v = full_description_version._id;
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
                var lenfullDescription = data.fullDescriptionVersion.length;
                if( lenfullDescription !=0 ){
                  var idLast = data.fullDescriptionVersion[lenfullDescription-1];
                  FullDescriptionVersion.findById(idLast , function (err, doc){
                    if(err){
                            callback(new Error("failed getting the last version of fullDescriptionVersion:" + err.message));
                        }else{
                          var prev = doc.fullDescription;
                            var next = full_description_version.fullDescription;
                            //if(!compare.isEqual(prev,next)){ //TODO
                            if(true){
                              full_description_version.id_record=id_rc;
                              full_description_version.version=lenfullDescription+1;
                              callback(null, full_description_version);
                            }else{
                              callback(new Error("The data in fullDescription is equal to last version of this element in the database"));
                            }
                        }
                  });
                }else{
                  full_description_version.id_record=id_rc;
                      full_description_version.version=1;
                      callback(null, full_description_version);
                }
              }else{
                  callback(new Error("The Record (Ficha) with id: "+id_rc+" doesn't exist."));
              }
            },
            function(full_description_version, callback){ 
                ver = full_description_version.version;
                full_description_version.save(function(err){
                  if(err){
                      callback(new Error("failed saving the element version:" + err.message));
                  }else{
                      callback(null, full_description_version);
                  }
                });
            },
            function(full_description_version, callback){ 
                add_objects.RecordVersion.findByIdAndUpdate( id_rc, { $push: { "fullDescriptionVersion": id_v } },{ safe: true, upsert: true }).exec(function (err, record) {
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
                  res.json({ message: 'Save FullDescriptionVersion', element: 'fullDescription', version : ver, _id: id_v, id_record : id_rc });
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

function getFullDescription(req, res) {
    var id_rc = req.swagger.params.id.value;
    var version = req.swagger.params.version.value;

    FullDescriptionVersion.findOne({ id_record : id_rc, version: version }).exec(function (err, elementVer) {
            if(err){
              res.status(400);
              res.send(err);
            }else{
              if(elementVer){
                res.json(elementVer);
              }else{
                res.status(400);
                res.json({message: "Doesn't exist a FullDescriptionVersion with id_record: "+id_rc+" and version: "+version});
              }
            }
    });

}


module.exports = {
  postFullDescription,
  getFullDescription
};