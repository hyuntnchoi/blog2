var express = require('express');
var path = require('path');
var app = express();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var passport = require('passport');
var session = require('express-session');
var flash = require('connect-flash');
var async = require('async');


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

var userSchehma = mongoose.Schema({
    email: {type:String, required:true, unique:true},
    nickname: {type:String, required:true, unique:true},
    password: {type:String, required:true},
    createdAt: {type:Date, default:Date.now}
});
var Ccc = mongoose.model('ddd', userSchema);

// view setting
app.set("view engine", 'ejs');

// set middlewares
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json()); // 모든 서버에 도착하는 신호들의 body를 JSON으로 분석할 것
app.use(bodyParser.urlencoded({extended:true})); // 위는 다른 프로그램이 json으로 데이터 전송을 할 경우 받는 body parser이고, 이건 웹사이트가 json으로 데이터를 전송할 경우 받는 body parser.
app.use(methodOverride("_method"));
app.use(flash());

app.use(session({secret:'MySecret'}));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(ddd, done){
    done(null, ddd.id);
});
passport.deserializeUser(function(id, done){
    Ccc.findById(id, function(err, user){
        done(err, user);
    });
});

var LocalStrategy = require('passport-local').Strategy;
passport.use('local-login',
  new LocalStrategy({
    usernameField : 'email',
    passwordField : 'password', //email,password가 user스키마 안의 이름과 같아야함
    passReqToCallback : true
    },
    function(req, email, password, done){
        Ccc.findOne({ 'email' : email }, function(err, ddd){
            if(err) return done(err);

            if(!ddd){
                req.flash("email", req.body.email);
                return done(null, false, req.flash('loginError', 'No user found.'));
            }
            if(ddd.password != password){
                req.flash("email", req.body.email);
                return done(null, false, req.flash('loginError', 'Password does not Match'));
            }
            return done(null, user);
        });
    }
  )
);

// set home routes
app.get('/', function(req,res){
    res.redirect('/posts');
});
app.get('/login', function(req, res){
    res.render('login/login', {email:req.flash("email")[0], loginError:req.flash('loginError')});
});
app.post('/login',
    function(req, res, next){
        req.flash("email"); // flush email data
        if(req.body.email.length === 0 || req.body.password.length === 0){
            req.flash("email", req.body.email);
            req.flash("loginError", "Please enter both email and password");
            res.redirect('/login');
        } else {
            next();
        }
    }, passport.authenticate('local-login', {
        successRedirect : '/posts',
        failureRedirect : '/login',
        failureFlash : true
    })
);
app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
});

app.get('/posts', function(req, res){
    Aaa.find({}).sort('-createdAt').exec(function(err, posts){
        if(err) return res.json({success:false, message:err});
        res.render("posts/index", {kiki:posts});
    });
}); // index

app.get('/posts/new', function(req, res){
    res.render("posts/new");
}); // new

app.post('/posts', function(req, res){
    Aaa.create(req.body.post, function(err, post){
        if(err) return res.json({success:false, message:err});
        res.redirect('/posts');
    });
}); 
// create

app.get('/posts/:id', function(req, res){
    Aaa.findById(req.params.id, function(err, post){
        if(err) return res.json({success:false, message:err});
        res.render("posts/show", {kiki:post});
    });
}); // show

app.get('/posts/:id/edit', function(req, res){
    Aaa.findById(req.params.id, function(err, post){
        if(err) return res.json({success:false, message:err});
        res.render("posts/edit", {kiki:post});
    });
}); // edit

app.put('/posts/:id', function(req, res){
    console.log(req.params.id);
    console.log(req.body.post);
    req.body.post.updatedAt=Date.now();
    Aaa.findByIdAndUpdate(req.params.id, req.body.post, function(err, post){
        if(err) return req.json({success:false, message:err});
        res.redirect('/posts/'+req.params.id);
    });
}); // update
// :id -> /posts/1234로 주소가 입력되면 :id 부분 즉 1234가 req.params.id에 저장됨

app.delete('/posts/:id', function(req, res){
    Aaa.findByIdAndRemove(req.params.id, function(err, post){
        if(err) return req.json({success:false, message:err});
        res.redirect('/posts');
    });
}); // destroy

// start server
app.listen(3000, function(){
    console.log('My app listening on port 3000!');
});