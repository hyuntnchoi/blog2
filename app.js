const express = require('express')
const app = express()

app.get('/', function(req, res){
    res.send('hello world is boring');
});

app.listen(3000, function(){
    console.log('My app listening on port 3000!');
});