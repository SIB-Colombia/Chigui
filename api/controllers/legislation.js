import mongoose from 'mongoose';
import async from 'async';
import LegislationVersion from '../models/legislation.js';
import add_objects from '../models/additionalModels.js';


function postLegislation(req, res) {
  var legislation_version  = req.body; 
    legislation_version._id = mongoose.Types.ObjectId();
    legislation_version.created=Date();
    legislation_version.element="legislation";
    var elementValue = legislation_version.legislation;
    legislation_version = new LegislationVersion(legislation_version);
    var id_v = legislation_version._id;
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
                var lenlegislation = data.legislationVersion.length;
                if( lenlegislation !=0 ){
                  var idLast = data.legislationVersion[lenlegislation-1];
                  LegislationVersion.findById(idLast , function (err, doc){
                    if(err){
                            callback(new Error("failed getting the last version of legislationVersion:" + err.message));
                        }else{
                          var prev = doc.legislation;
                            var next = legislation_version.legislation;
                            //if(!compare.isEqual(prev,next)){ //TODO
                            if(true){
                              legislation_version.id_record=id_rc;
                              legislation_version.version=lenlegislation+1;
                              callback(null, legislation_version);
                            }else{
                              callback(new Error("The data in legislation is equal to last version of this element in the database"));
                            }
                        }
                  });
                }else{
                  legislation_version.id_record=id_rc;
                      legislation_version.version=1;
                      callback(null, legislation_version);
                }
              }else{
                  callback(new Error("The Record (Ficha) with id: "+id_rc+" doesn't exist."));
              }
            },
            function(legislation_version, callback){ 
                ver = legislation_version.version;
                legislation_version.save(function(err){
                  if(err){
                      callback(new Error("failed saving the element version:" + err.message));
                  }else{
                      callback(null, legislation_version);
                  }
                });
            },
            function(legislation_version, callback){ 
                add_objects.RecordVersion.findByIdAndUpdate( id_rc, { $push: { "legislationVersion": id_v } },{ safe: true, upsert: true }).exec(function (err, record) {
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
                  res.json({ message: 'Save LegislationVersion', element: 'legislation', version : ver, _id: id_v, id_record : id_rc });
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

function getLegislation(req, res) {
    var id_rc = req.swagger.params.id.value;
    var version = req.swagger.params.version.value;

    LegislationVersion.findOne({ id_record : id_rc, version: version }).exec(function (err, elementVer) {
            if(err){
              res.status(400);
              res.send(err);
            }else{
              if(elementVer){
                res.json(elementVer);
              }else{
                res.status(400);
                res.json({message: "Doesn't exist a LegislationVersion with id_record: "+id_rc+" and version: "+version});
              }
            }
    });

}


module.exports = {
  postLegislation,
  getLegislation
};