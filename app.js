var express = require('express')
var app = express()
var MongoClient = require('mongodb').MongoClient;

MongoClient.connect(process.env.MONGO_DB, {useNewUrlParser: true}, function(err, db){
    if(err) throw err;
    console.log("Database successfully connected!");
    db.close();
});

app.get('/', function(req, res){
    res.send('hello world is boring');
});

app.listen(3000, function(){
    console.log('My app listening on port 3000!');
});