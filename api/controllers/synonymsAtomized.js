import mongoose from 'mongoose';
import async from 'async';
import SynonymsAtomizedVersion from '../models/synonymsAtomized.js';
import add_objects from '../models/additionalModels.js';


function postSynonymsAtomized(req, res) {
  var synonyms_atomized  = req.body; 
    synonyms_atomized._id = mongoose.Types.ObjectId();
    synonyms_atomized.created=Date();
    synonyms_atomized.element="synonymsAtomized";
    var elementValue = synonyms_atomized.synonymsAtomized;
    synonyms_atomized = new SynonymsAtomizedVersion(synonyms_atomized);
    var id_v = synonyms_atomized._id;
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
                var lensynonymsAtomized = data.synonymsAtomizedVersion.length;
                if( lensynonymsAtomized !=0 ){
                  var idLast = data.synonymsAtomizedVersion[lensynonymsAtomized-1];
                  SynonymsAtomizedVersion.findById(idLast , function (err, doc){
                    if(err){
                            callback(new Error("failed getting the last version of synonymsAtomizedVersion:" + err.message));
                        }else{
                          var prev = doc.synonymsAtomized;
                            var next = synonyms_atomized.synonymsAtomized;
                            //if(!compare.isEqual(prev,next)){ //TODO
                            if(true){
                              synonyms_atomized.id_record=id_rc;
                              synonyms_atomized.version=lensynonymsAtomized+1;
                              callback(null, synonyms_atomized);
                            }else{
                              callback(new Error("The data in synonymsAtomized is equal to last version of this element in the database"));
                            }
                        }
                  });
                }else{
                  synonyms_atomized.id_record=id_rc;
                      synonyms_atomized.version=1;
                      callback(null, synonyms_atomized);
                }
              }else{
                  callback(new Error("The Record (Ficha) with id: "+id_rc+" doesn't exist."));
              }
            },
            function(synonyms_atomized, callback){ 
                ver = synonyms_atomized.version;
                synonyms_atomized.save(function(err){
                  if(err){
                      callback(new Error("failed saving the element version:" + err.message));
                  }else{
                      callback(null, synonyms_atomized);
                  }
                });
            },
            function(synonyms_atomized, callback){ 
                add_objects.RecordVersion.findByIdAndUpdate( id_rc, { $push: { "synonymsAtomizedVersion": id_v } },{ safe: true, upsert: true }).exec(function (err, record) {
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
                  res.json({ message: 'Save SynonymsAtomizedVersion', element: 'synonymsAtomized', version : ver, _id: id_v, id_record : id_rc });
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

function getSynonymsAtomized(req, res) {
    var id_rc = req.swagger.params.id.value;
    var version = req.swagger.params.version.value;

    SynonymsAtomizedVersion.findOne({ id_record : id_rc, version: version }).exec(function (err, elementVer) {
            if(err){
              res.status(400);
              res.send(err);
            }else{
              if(elementVer){
                res.json(elementVer);
              }else{
                res.status(400);
                res.json({message: "Doesn't exist a SynonymsAtomizedVersion with id_record: "+id_rc+" and version: "+version});
              }
            }
    });

}


module.exports = {
  postSynonymsAtomized,
  getSynonymsAtomized
};