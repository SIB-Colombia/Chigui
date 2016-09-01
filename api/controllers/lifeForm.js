import mongoose from 'mongoose';
import async from 'async';
import LifeFormVersion from '../models/lifeForm.js';
import add_objects from '../models/additionalModels.js';


function postLifeForm(req, res) {
  var life_form  = req.body; 
    life_form._id = mongoose.Types.ObjectId();
    life_form.created=Date();
    life_form.element="lifeForm";
    var elementValue = life_form.lifeForm;
    life_form = new LifeFormVersion(life_form);
    var id_v = life_form._id;
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
                var lenlifeForm = data.lifeFormVersion.length;
                if( lenlifeForm !=0 ){
                  var idLast = data.lifeFormVersion[lenlifeForm-1];
                  LifeFormVersion.findById(idLast , function (err, doc){
                    if(err){
                            callback(new Error("failed getting the last version of lifeFormVersion:" + err.message));
                        }else{
                          var prev = doc.lifeForm;
                            var next = life_form.lifeForm;
                            //if(!compare.isEqual(prev,next)){ //TODO
                            if(true){
                              life_form.id_record=id_rc;
                              life_form.version=lenlifeForm+1;
                              callback(null, life_form);
                            }else{
                              callback(new Error("The data in lifeForm is equal to last version of this element in the database"));
                            }
                        }
                  });
                }else{
                  life_form.id_record=id_rc;
                      life_form.version=1;
                      callback(null, life_form);
                }
              }else{
                  callback(new Error("The Record (Ficha) with id: "+id_rc+" doesn't exist."));
              }
            },
            function(life_form, callback){ 
                ver = life_form.version;
                life_form.save(function(err){
                  if(err){
                      callback(new Error("failed saving the element version:" + err.message));
                  }else{
                      callback(null, life_form);
                  }
                });
            },
            function(life_form, callback){ 
                add_objects.RecordVersion.findByIdAndUpdate( id_rc, { $push: { "lifeFormVersion": id_v } },{ safe: true, upsert: true }).exec(function (err, record) {
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
                  res.json({ message: 'Save LifeFormVersion', element: 'lifeForm', version : ver, _id: id_v, id_record : id_rc });
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

function getLifeForm(req, res) {
    var id_rc = req.swagger.params.id.value;
    var version = req.swagger.params.version.value;

    LifeFormVersion.findOne({ id_record : id_rc, version: version }).exec(function (err, elementVer) {
            if(err){
              res.status(400);
              res.send(err);
            }else{
              if(elementVer){
                res.json(elementVer);
              }else{
                res.status(400);
                res.json({message: "Doesn't exist a LifeFormVersion with id_record: "+id_rc+" and version: "+version});
              }
            }
    });

}


module.exports = {
  postLifeForm,
  getLifeForm
};