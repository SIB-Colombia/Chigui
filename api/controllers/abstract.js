import mongoose from 'mongoose';
import async from 'async';
import AbstractVersion from '../models/abstract.js';
import add_objects from '../models/additionalModels.js';


function postAbstract(req, res) {
  var abstract_version  = req.body; 
    abstract_version._id = mongoose.Types.ObjectId();
    abstract_version.created=Date();
    abstract_version.element="abstract";
    var elementValue = abstract_version.abstract;
    abstract_version = new AbstractVersion(abstract_version);
    var id_v = abstract_version._id;
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
                var lenabstract = data.abstractVersion.length;
                if( lenabstract !=0 ){
                  var idLast = data.abstractVersion[lenabstract-1];
                  AbstractVersion.findById(idLast , function (err, doc){
                    if(err){
                            callback(new Error("failed getting the last version of abstractVersion:" + err.message));
                        }else{
                          var prev = doc.abstract;
                            var next = abstract_version.abstract;
                            //if(!compare.isEqual(prev,next)){ //TODO
                            if(true){
                              abstract_version.id_record=id_rc;
                              abstract_version.version=lenabstract+1;
                              callback(null, abstract_version);
                            }else{
                              callback(new Error("The data in abstract is equal to last version of this element in the database"));
                            }
                        }
                  });
                }else{
                  abstract_version.id_record=id_rc;
                      abstract_version.version=1;
                      callback(null, abstract_version);
                }
              }else{
                  callback(new Error("The Record (Ficha) with id: "+id_rc+" doesn't exist."));
              }
            },
            function(abstract_version, callback){ 
                ver = abstract_version.version;
                abstract_version.save(function(err){
                  if(err){
                      callback(new Error("failed saving the element version:" + err.message));
                  }else{
                      callback(null, abstract_version);
                  }
                });
            },
            function(abstract_version, callback){ 
                add_objects.RecordVersion.findByIdAndUpdate( id_rc, { $push: { "abstractVersion": id_v } },{ safe: true, upsert: true }).exec(function (err, record) {
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
                  res.json({ message: 'Save AbstractVersion', element: 'abstract', version : ver, _id: id_v, id_record : id_rc });
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

function getAbstract(req, res) {
    var id_rc = req.swagger.params.id.value;
    var version = req.swagger.params.version.value;

    AbstractVersion.findOne({ id_record : id_rc, version: version }).exec(function (err, elementVer) {
            if(err){
              res.status(400);
              res.send(err);
            }else{
              if(elementVer){
                res.json(elementVer);
              }else{
                res.status(400);
                res.json({message: "Doesn't exist a AbstractVersion with id_record: "+id_rc+" and version: "+version});
              }
            }
    });

}


module.exports = {
  postAbstract,
  getAbstract
};