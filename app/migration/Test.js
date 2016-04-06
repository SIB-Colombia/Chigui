var mongo = require('mongodb'),
    Server = mongo.Server,
    Db = mongo.Db,
    ObjectID = require('mongodb').ObjectID;
var MongoClient = require('mongodb').MongoClient

//let id = your _id, smth like '6dg27sh2sdhsdhs72hsdfs2sfs'...
var obj_id = new ObjectID('5660ac2417017f85167c6f6c');
var justId = '5660ac2417017f85167c6f6c'; // <== This will not work



MongoClient.connect('mongodb://localhost:27017/editorDb', function(err, db) {
    if (err) {
        throw err;
    } else {
        console.log('Successfully connected to the database');
    }
    var contentCollection = db.collection('Records');
    console.log(db.listCollections());
    contentCollection.find({}).toArray(function(err, result) {
        if (err) {
            throw err;
        } else {
            console.log(result);
            db.close();
        }
    });        
});