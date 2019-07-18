var express = require('express');
var path = require('path');
var app = express();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

// connect database
mongoose.connect(process.env.MONGO_DB2, {useNewUrlParser: true});
var db = mongoose.connection;
db.once("open", function(){
    console.log("Database successfully connected!")
});
db.on("error", function(err){
    console.log("DB ERROR :", err);
});


// model setting
var postSchema = mongoose.Schema({
    title: {type:String, required:true}, 
    body: {type:String, required:true},
    createdAt: {type:Date, default:Date.now},
    updatedAt: Date
    //required:true의 뜻은 데이터 생성, 변경 시 반드시 값을 넣어야 한다는 뜻
});
var Aaa = mongoose.model('bbb', postSchema);

// view setting
app.set("view engine", 'ejs');

// set middlewares
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json()); // 모든 서버에 도착하는 신호들의 body를 JSON으로 분석할 것

// set routes
app.get('/posts', function(req, res){
    Aaa.find({}, function(err, posts){
        if(err) return res.json({success:false, message:err});
        res.json({success:true, kiki:posts});
    });
}); // index

app.post('/posts', function(req, res){
    Aaa.create(req.body.post, function(err, post){
        if(err) return res.json({success:false, message:err});
        res.json({success:true, kki:post});
    });
}); // create

app.get('/posts/:id', function(req, res){
    Aaa.findById(req.params.id, function(err, post){
        if(err) return res.json({success:false, message:err});
        res.json({success:true, data:post})
    })
}) // show

app.put('/posts/:id', function(req, res){
    req.body.post.updatedAt=Date.now();
    Aaa.findByIdAndUpdate(req.params.id, req.body.post, function(err, post){
        if(err) return req.json({success:false, message:err});
        res.json({success:true, message:post._id+" updated"});
    });
}); // update
// :id -> /posts/1234로 주소가 입력되면 :id 부분 즉 1234가 req.params.id에 저장됨


app.delete('/posts/:id', function(req, res){
    Aaa.findByIdAndRemove(req.params.id, function(err, post){
        if(err) return req.json({success:false, message:err});
        res.json({success:true, message:post._id+" deleted"});
    });
}); // destroy

// start server
app.listen(3000, function(){
    console.log('My app listening on port 3000!');
});