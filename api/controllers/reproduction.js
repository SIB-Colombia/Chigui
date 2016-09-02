import mongoose from 'mongoose';
import async from 'async';
import ReproductionVersion from '../models/reproduction.js';
import add_objects from '../models/additionalModels.js';


function postReproduction(req, res) {
  var reproduction_version  = req.body; 
    reproduction_version._id = mongoose.Types.ObjectId();
    reproduction_version.created=Date();
    reproduction_version.element="reproduction";
    var elementValue = reproduction_version.reproduction;
    reproduction_version = new ReproductionVersion(reproduction_version);
    var id_v = reproduction_version._id;
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
                var lenreproduction = data.reproductionVersion.length;
                if( lenreproduction !=0 ){
                  var idLast = data.reproductionVersion[lenreproduction-1];
                  ReproductionVersion.findById(idLast , function (err, doc){
                    if(err){
                            callback(new Error("failed getting the last version of reproductionVersion:" + err.message));
                        }else{
                          var prev = doc.reproduction;
                            var next = reproduction_version.reproduction;
                            //if(!compare.isEqual(prev,next)){ //TODO
                            if(true){
                              reproduction_version.id_record=id_rc;
                              reproduction_version.version=lenreproduction+1;
                              callback(null, reproduction_version);
                            }else{
                              callback(new Error("The data in reproduction is equal to last version of this element in the database"));
                            }
                        }
                  });
                }else{
                  reproduction_version.id_record=id_rc;
                      reproduction_version.version=1;
                      callback(null, reproduction_version);
                }
              }else{
                  callback(new Error("The Record (Ficha) with id: "+id_rc+" doesn't exist."));
              }
            },
            function(reproduction_version, callback){ 
                ver = reproduction_version.version;
                reproduction_version.save(function(err){
                  if(err){
                      callback(new Error("failed saving the element version:" + err.message));
                  }else{
                      callback(null, reproduction_version);
                  }
                });
            },
            function(reproduction_version, callback){ 
                add_objects.RecordVersion.findByIdAndUpdate( id_rc, { $push: { "reproductionVersion": id_v } },{ safe: true, upsert: true }).exec(function (err, record) {
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
                  res.json({ message: 'Save ReproductionVersion', element: 'reproduction', version : ver, _id: id_v, id_record : id_rc });
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

function getReproduction(req, res) {
    var id_rc = req.swagger.params.id.value;
    var version = req.swagger.params.version.value;

    ReproductionVersion.findOne({ id_record : id_rc, version: version }).exec(function (err, elementVer) {
            if(err){
              res.status(400);
              res.send(err);
            }else{
              if(elementVer){
                res.json(elementVer);
              }else{
                res.status(400);
                res.json({message: "Doesn't exist a ReproductionVersion with id_record: "+id_rc+" and version: "+version});
              }
            }
    });

}


module.exports = {
  postReproduction,
  getReproduction
};