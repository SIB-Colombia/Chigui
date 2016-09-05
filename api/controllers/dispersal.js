import mongoose from 'mongoose';
import async from 'async';
import DispersalVersion from '../models/dispersal.js';
import add_objects from '../models/additionalModels.js';


function postDispersal(req, res) {
  var dispersal_version  = req.body; 
    dispersal_version._id = mongoose.Types.ObjectId();
    dispersal_version.created=Date();
    dispersal_version.element="dispersal";
    var elementValue = dispersal_version.dispersal;
    dispersal_version = new DispersalVersion(dispersal_version);
    var id_v = dispersal_version._id;
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
                var lendispersal = data.dispersalVersion.length;
                if( lendispersal !=0 ){
                  var idLast = data.dispersalVersion[lendispersal-1];
                  DispersalVersion.findById(idLast , function (err, doc){
                    if(err){
                            callback(new Error("failed getting the last version of dispersalVersion:" + err.message));
                        }else{
                          var prev = doc.dispersal;
                            var next = dispersal_version.dispersal;
                            //if(!compare.isEqual(prev,next)){ //TODO
                            if(true){
                              dispersal_version.id_record=id_rc;
                              dispersal_version.version=lendispersal+1;
                              callback(null, dispersal_version);
                            }else{
                              callback(new Error("The data in dispersal is equal to last version of this element in the database"));
                            }
                        }
                  });
                }else{
                  dispersal_version.id_record=id_rc;
                      dispersal_version.version=1;
                      callback(null, dispersal_version);
                }
              }else{
                  callback(new Error("The Record (Ficha) with id: "+id_rc+" doesn't exist."));
              }
            },
            function(dispersal_version, callback){ 
                ver = dispersal_version.version;
                dispersal_version.save(function(err){
                  if(err){
                      callback(new Error("failed saving the element version:" + err.message));
                  }else{
                      callback(null, dispersal_version);
                  }
                });
            },
            function(dispersal_version, callback){ 
                add_objects.RecordVersion.findByIdAndUpdate( id_rc, { $push: { "dispersalVersion": id_v } },{ safe: true, upsert: true }).exec(function (err, record) {
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
                  res.json({ message: 'Save DispersalVersion', element: 'dispersal', version : ver, _id: id_v, id_record : id_rc });
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

function getDispersal(req, res) {
    var id_rc = req.swagger.params.id.value;
    var version = req.swagger.params.version.value;

    DispersalVersion.findOne({ id_record : id_rc, version: version }).exec(function (err, elementVer) {
            if(err){
              res.status(400);
              res.send(err);
            }else{
              if(elementVer){
                res.json(elementVer);
              }else{
                res.status(400);
                res.json({message: "Doesn't exist a DispersalVersion with id_record: "+id_rc+" and version: "+version});
              }
            }
    });

}


module.exports = {
  postDispersal,
  getDispersal
};