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
                var lenbriefDescription= data.briefDescription.length;
                if( lenbriefDescription!=0 ){
                  var idLast = data.briefDescription[lenbriefDescription-1];
                  BriefDescription.findById(idLast , function (err, doc){
                    if(err){
                            callback(new Error("failed getting the last version of briefDescription:" + err.message));
                        }else{
                          var prev = doc.briefDescription;
                            var next = brief_description_version.briefDescription;
                            //if(!compare.isEqual(prev,next)){ //TODO
                            if(true){
                              brief_description_version.id_record=id_rc;
                              brief_description_version.version=lenbriefDescription+1;
                              callback(null, brief_description_version);
                            }else{
                              callback(new Error("The data in briefDescription is equal to last version of this element in the database"));
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
                  //res.status(406);
                  res.status(400);
                  res.json({ ErrorResponse: {message: ""+err }});
                }else{
                  res.json({ message: 'Save BriefDescription', element: 'briefDescription', version : ver, _id: id_v, id_record : id_rc });
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

function getBriefDescription(req, res) {
    var id_rc = req.swagger.params.id.value;
    var version = req.swagger.params.version.value;

    BriefDescription.findOne({ id_record : id_rc, version: version }).exec(function (err, elementVer) {
            if(err){
              res.status(400);
              res.send(err);
            }else{
              if(elementVer){
                res.json(elementVer);
              }else{
                res.status(400);
                res.json({message: "Doesn't exist a BriefDescription with id_record: "+id_rc+" and version: "+version});
              }
            }
    });

}


module.exports = {
  postBriefDescription,
  getBriefDescription
};