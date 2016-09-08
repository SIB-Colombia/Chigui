import mongoose from 'mongoose';
import async from 'async';
import MoreInformation from '../models/moreInformation.js';
import add_objects from '../models/additionalModels.js';


function postMoreInformation(req, res) {
  var more_information_version  = req.body; 
    more_information_version._id = mongoose.Types.ObjectId();
    more_information_version.created=Date();
    more_information_version.element="moreInformation";
    var elementValue = more_information_version.moreInformation;
    more_information_version = new MoreInformation(more_information_version);
    var id_v = more_information_version._id;
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
                var lenmoreInformation= data.moreInformation.length;
                if( lenmoreInformation!=0 ){
                  var idLast = data.moreInformation[lenmoreInformation-1];
                  MoreInformation.findById(idLast , function (err, doc){
                    if(err){
                            callback(new Error("failed getting the last version of moreInformation:" + err.message));
                        }else{
                          var prev = doc.moreInformation;
                            var next = more_information_version.moreInformation;
                            //if(!compare.isEqual(prev,next)){ //TODO
                            if(true){
                              more_information_version.id_record=id_rc;
                              more_information_version.version=lenmoreInformation+1;
                              callback(null, more_information_version);
                            }else{
                              callback(new Error("The data in moreInformation is equal to last version of this element in the database"));
                            }
                        }
                  });
                }else{
                  more_information_version.id_record=id_rc;
                      more_information_version.version=1;
                      callback(null, more_information_version);
                }
              }else{
                  callback(new Error("The Record (Ficha) with id: "+id_rc+" doesn't exist."));
              }
            },
            function(more_information_version, callback){ 
                ver = more_information_version.version;
                more_information_version.save(function(err){
                  if(err){
                      callback(new Error("failed saving the element version:" + err.message));
                  }else{
                      callback(null, more_information_version);
                  }
                });
            },
            function(more_information_version, callback){ 
                add_objects.RecordVersion.findByIdAndUpdate( id_rc, { $push: { "moreInformation": id_v } },{ safe: true, upsert: true }).exec(function (err, record) {
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
                  res.json({ message: 'Save MoreInformation', element: 'moreInformation', version : ver, _id: id_v, id_record : id_rc });
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

function getMoreInformation(req, res) {
    var id_rc = req.swagger.params.id.value;
    var version = req.swagger.params.version.value;

    MoreInformation.findOne({ id_record : id_rc, version: version }).exec(function (err, elementVer) {
            if(err){
              res.status(400);
              res.send(err);
            }else{
              if(elementVer){
                res.json(elementVer);
              }else{
                res.status(400);
                res.json({message: "Doesn't exist a MoreInformation with id_record: "+id_rc+" and version: "+version});
              }
            }
    });

}


module.exports = {
  postMoreInformation,
  getMoreInformation
};