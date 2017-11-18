var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var cors = require('cors');
require('./routes/passport')(passport);
var mongo = require("./routes/mongo");
var mongoURL = "mongodb://localhost:27017/272";
var routes = require('./routes/index');
var users = require('./routes/users');
var mongoSessionURL = "mongodb://localhost:27017/sessions";
var expressSessions = require("express-session");
var mongoStore = require("connect-mongo/es5")(expressSessions);
var Qid=1;
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));

var corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true,
}
app.use(cors(corsOptions))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(expressSessions({
    secret: "CMPE273_passport",
    resave: false,
    //Forces the session to be saved back to the session store, even if the session was never modified during the request
    saveUninitialized: false, //force to save uninitialized session to db.
    //A session is uninitialized when it is new but not modified.
    duration: 30 * 60 * 1000,
    activeDuration: 5 * 6 * 1000,
    store: new mongoStore({
        url: mongoSessionURL,
        ttl:2*60*60
    })
}));
app.use(passport.initialize());

app.use('/', routes);
app.use('/users', users);

app.post('/logout', function(req,res) {
    console.log(req.session.user);
    req.session.destroy();
    console.log('Session Destroyed');
    res.status(200).send();
});

app.post('/login', function(req, res) {
    passport.authenticate('login', function(err, user) {
        if(err) {
            res.status(500).send();
        }

        if(!user) {
            res.status(401).send();
        }
        else {
            req.session.user = user.username;
            console.log(req.session.user);
            console.log("session initilized");
            return res.status(201).send({username: "test"});
        }
    })(req, res);
});


app.post('/dosignup', function(req, res) {
    passport.authenticate('signup', function(err, user) {
        if(err) {
            res.status(401).send();
        }

        if(user){
            return res.status(201).send();
        }
        else {
            return res.status(401).send();
        }
    })(req, res);
});


app.post('/requestservice', function (req, res) {

    var _id=Qid;   //posts the questions and projects submitted by company
    Qid=Qid+1;
    console.log(_id);
    var question=req.body.question;
    var description=req.body.description;
    var criteria=req.body.criteria;
    try {
        mongo.connect(mongoURL, function(){
            console.log('Connected to mongo at: ' + mongoURL);
            var coll = mongo.collection('Services');
            coll.save({

                Username:req.session.user,
                Question: question,
                Description:description,
                Criteria:criteria
            })

            return res.status(201).send();
        });
    }
    catch (e){
        return res.status(401).send();
    }
});

app.post('/addcomment', function (req, res) {

    var quesId=parseInt(request.body.quesid);            // students,faculty or compaies can submit comments and this will store comments for perticular question
    var comment=request.body.comment;
    try {
        MongoClient.connect(mongoURL, function(err, db) {
            var commentid=getNextSequence(quesId);
            db.collection("questions").find({"_id":quesId},{"comments":1}).toArray(function(err,result){
                assert.equal(err, null);
                var legend=result[0].comments;
                var resp=legend.length+1;
                db.collection("questions").update({"_id":quesId},{$push:{"comments":{"commentid":resp,"username":req.session.user,"comment":comment}}},function(err,result){
                    assert.equal(err, null);
                    return res.status(401).send();
                });
            });
        });
    }
    catch (e){
        return res.status(401).send();
    }
});


app.get('/getusertype', function (req, res) {
    try {
        mongo.connect(mongoURL, function(){
            console.log('Connected to mongo at: ' + mongoURL);
            var coll = mongo.collection('Users');
            coll.findOne({'username': req.session.user},(function(err, files){
                if (err) {
                    res.status(401).send();
                }
                else {
                    console.log(files)
                        var TypeJSON = {};
                        TypeJSON.type=files.type;
                        return res.status(200).send(TypeJSON);
                }
            })
            )
        });
    }
    catch (e){
        res.status(401).send();
    }
});


app.get('/getOpenServices', function (req, res) {
    var i=0;
    try {
        mongo.connect(mongoURL, function(){
            console.log('Connected to mongo at: ' + mongoURL);
            var coll = mongo.collection('questions');
            coll.find({'status': 0},(function(err, files){
                    if (err) {
                        res.status(401).send();
                    }
                    else {
                        var resArr = [];
                        resArr = files.map(function (file) {
                            var filesJSON = {};
                            filesJSON.id = files[i]._id;
                            filesJSON.question = files[i].question;
                            filesJSON.description = files[i].description;
                            filesJSON.criteria = files[i].criteria;
                            filesJSON.username = files[i].username;
                            filesJSON.status = files[i].status;
                            filesJSON.solution = files[i].solution;
                            filesJSON.comments = files[i].comments;
                            i = i + 1;
                            return filesJSON;
                        });
                        return res.status(200).send(resArr);
                    }
                })
            )
        });
    }
    catch (e){
        res.status(401).send();
    }
});


app.get('/getAnsweredServices', function (req, res) {
    var i=0;
    try {
        mongo.connect(mongoURL, function(){
            console.log('Connected to mongo at: ' + mongoURL);
            var coll = mongo.collection('questions');
            coll.find({'status': 1},(function(err, files){
                    if (err) {
                        res.status(401).send();
                    }
                    else {
                        var resArr = [];
                        resArr = files.map(function (file) {
                            var filesJSON = {};
                            filesJSON.id = files[i]._id;
                            filesJSON.question = files[i].question;
                            filesJSON.description = files[i].description;
                            filesJSON.criteria = files[i].criteria;
                            filesJSON.username = files[i].username;
                            filesJSON.status = files[i].status;
                            filesJSON.solution = files[i].solution;
                            filesJSON.comments = files[i].comments;
                            i = i + 1;
                            return filesJSON;
                        });
                        return res.status(200).send(resArr);
                    }
                })
            )
        });
    }
    catch (e){
        res.status(401).send();
    }
});

app.get('/getUserAnswered', function (req, res) {
    var i=0;
    try {
        mongo.connect(mongoURL, function(){
            console.log('Connected to mongo at: ' + mongoURL);
            var coll = mongo.collection('questions');
            coll.find({'username':req.session.user,'status': 1},(function(err, files){ /// correct this later
                    if (err) {
                        res.status(401).send();
                    }
                    else {
                        var resArr = [];
                        resArr = files.map(function (file) {
                            var filesJSON = {};
                            filesJSON.id = files[i]._id;
                            filesJSON.question = files[i].question;
                            filesJSON.description = files[i].description;
                            filesJSON.criteria = files[i].criteria;
                            filesJSON.username = files[i].username;
                            filesJSON.status = files[i].status;
                            filesJSON.solution = files[i].solution;
                            filesJSON.comments = files[i].comments;
                            i = i + 1;
                            return filesJSON;
                        });
                        return res.status(200).send(resArr);
                    }
                })
            )
        });
    }
    catch (e){
        res.status(401).send();
    }
});

app.get('/getPreviousrequests', function (req, res) {
    var i=0;
    try {
        mongo.connect(mongoURL, function(){
            console.log('Connected to mongo at: ' + mongoURL);
            var coll = mongo.collection('questions');
            coll.find({'username':req.session.user,'status': 1},(function(err, files){ /// correct this later
                    if (err) {
                        res.status(401).send();
                    }
                    else {
                        var resArr = [];
                        resArr = files.map(function (file) {
                            var filesJSON = {};
                            filesJSON.id = files[i]._id;
                            filesJSON.question = files[i].question;
                            filesJSON.description = files[i].description;
                            filesJSON.criteria = files[i].criteria;
                            filesJSON.username = files[i].username;
                            filesJSON.status = files[i].status;
                            filesJSON.solution = files[i].solution;
                            filesJSON.comments = files[i].comments;
                            i = i + 1;
                            return filesJSON;
                        });
                        return res.status(200).send(resArr);
                    }
                })
            )
        });
    }
    catch (e){
        res.status(401).send();
    }
});
module.exports = app;
