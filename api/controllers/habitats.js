import mongoose from 'mongoose';
import async from 'async';
import HabitatsVersion from '../models/habitats.js';
import add_objects from '../models/additionalModels.js';


function postHabitats(req, res) {
  var habitats_version  = req.body; 
    habitats_version._id = mongoose.Types.ObjectId();
    habitats_version.created=Date();
    habitats_version.element="habitats";
    var elementValue = habitats_version.habitats;
    habitats_version = new HabitatsVersion(habitats_version);
    var id_v = habitats_version._id;
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
                var lenhabitats = data.habitatsVersion.length;
                if( lenhabitats !=0 ){
                  var idLast = data.habitatsVersion[lenhabitats-1];
                  HabitatsVersion.findById(idLast , function (err, doc){
                    if(err){
                            callback(new Error("failed getting the last version of habitatsVersion:" + err.message));
                        }else{
                          var prev = doc.habitats;
                            var next = habitats_version.habitats;
                            //if(!compare.isEqual(prev,next)){ //TODO
                            if(true){
                              habitats_version.id_record=id_rc;
                              habitats_version.version=lenhabitats+1;
                              callback(null, habitats_version);
                            }else{
                              callback(new Error("The data in habitats is equal to last version of this element in the database"));
                            }
                        }
                  });
                }else{
                  habitats_version.id_record=id_rc;
                      habitats_version.version=1;
                      callback(null, habitats_version);
                }
              }else{
                  callback(new Error("The Record (Ficha) with id: "+id_rc+" doesn't exist."));
              }
            },
            function(habitats_version, callback){ 
                ver = habitats_version.version;
                habitats_version.save(function(err){
                  if(err){
                      callback(new Error("failed saving the element version:" + err.message));
                  }else{
                      callback(null, habitats_version);
                  }
                });
            },
            function(habitats_version, callback){ 
                add_objects.RecordVersion.findByIdAndUpdate( id_rc, { $push: { "habitatsVersion": id_v } },{ safe: true, upsert: true }).exec(function (err, record) {
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
                  res.json({ message: 'Save HabitatsVersion', element: 'habitats', version : ver, _id: id_v, id_record : id_rc });
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

function getHabitats(req, res) {
    var id_rc = req.swagger.params.id.value;
    var version = req.swagger.params.version.value;

    HabitatsVersion.findOne({ id_record : id_rc, version: version }).exec(function (err, elementVer) {
            if(err){
              res.status(400);
              res.send(err);
            }else{
              if(elementVer){
                res.json(elementVer);
              }else{
                res.status(400);
                res.json({message: "Doesn't exist a HabitatsVersion with id_record: "+id_rc+" and version: "+version});
              }
            }
    });

}


module.exports = {
  postHabitats,
  getHabitats
};