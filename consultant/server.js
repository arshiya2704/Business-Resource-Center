

var MongoClient = require('mongodb').MongoClient
			, assert = require('assert');
var murl = "mongodb://localhost:27017/userdata";
var http = require("http");
var url = require('url');
var express=require("express");
var app=express();
var ip=require('ip');
var bodyParser = require('body-parser');
var bcrypt = require('bcrypt');
var Qid=1;
const saltRounds = 10;
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.use(function(req, res, next) {
 res.header("Access-Control-Allow-Origin", "*");
 res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
 next();
});
//--------------

function getNextSequence(name){
	MongoClient.connect(murl, function(err, db) {  //get famous item for home page
  	assert.equal(null, err);
	db.collection("questions").find({"_id":name},{"comments":1}).toArray(function(err,result){
		assert.equal(err, null);
		var legend=result[0].comments;
		var resp=legend.length+1;
		console.log(resp);
		return resp;
		db.close();
	});
	});
}


app.post('/signup', function (request, response, next) {
			var username=request.body.username;
			var pass=request.body.password;
			var name=request.body.name;
			var type=request.body.type;
			var instName=request.body.instName;
			var password;
			bcrypt.hash(pass, saltRounds, function(err, hash) {
  			var password=hash;
  			MongoClient.connect(murl, function(err, db) {  //get famous item for home page
  			assert.equal(null, err);


  			db.collection("userdata").find({"username":username}).toArray(function(err, res) {
    		if (err) throw err;
    		if(res.length==0)
    		{
  			db.collection("userdata").insert({"username":username,"password":password,"name":name,"Acctype":type,"institute":instName},function(err, result) {
    		assert.equal(err, null);
    		response.send(result);
    		response.end();
			db.close()
  			});
  			}
  			else
  			{
  			response.json({"code":409,"message":"email already exists"});
    		response.end();
			db.close()
  			}
  			});	
		});
  	});  	
});

app.post('/login',function(request,response,next){
			var username=request.body.username;
			var password=request.body.password;
  			MongoClient.connect(murl, function(err, db) {  //get famous item for home page
  			assert.equal(null, err);
			db.collection("userdata").find({"username":username}).toArray(function(err, res) {
    		if (err) throw err;
    		if(res.length==0){
    			response.send({"code":404,"msg":"Username or Password is wrong"});
    			response.end();
				db.close();
    		}
    		else{
    			bcrypt.compare(password, res[0].password, function(err, res) {
    			// res == true
    			if(res==true){
    				response.json({"code":200,"msg":"login successful"});
    				response.end();
					db.close();
    			}
    			else{
    				response.json({"code":404,"msg":"Username or Password is wrong"});
    				response.end();
					db.close();
    			}

				});
    		}	

    	});
	});
});

app.post('/askquestion',function(request,response,next){
			var _id=Qid;
			Qid=Qid+1;
			console.log(_id);
			var question=request.body.question;
			var description=request.body.description;
			var criteria=request.body.criteria;
			var clientid=request.body.clientid;
			MongoClient.connect(murl, function(err, db) {  //get famous item for home page
  			assert.equal(null, err);
  			db.collection("questions").insert({"_id":getNextSequence("_id"),"question":question,"description":description,"criteria":criteria,"clientid":clientid,"status":0,"solution":"","comments":[]},function(err,result){
  			assert.equal(err, null);
  			if(result.result.ok==1)
  			{
  			response.json({"code":200,"msg":"question posted"});
  			response.end();
  			db.close();
  			}
  			else{
  			response.json({"code":404,"msg":"failed"});
  			response.end();
  			db.close();	
  			}
  			});
  		});
});

app.post('/addcomments',function(request,response,next){
	var quesId=parseInt(request.body.quesid);
	var username=request.body.username;
	var comment=request.body.comment;
	MongoClient.connect(murl, function(err, db) {  //get famous item for home page
  	assert.equal(null, err);
  	var commentid=getNextSequence(quesId);
  	console.log(commentid);
  	db.collection("questions").find({"_id":quesId},{"comments":1}).toArray(function(err,result){
		assert.equal(err, null);
		var legend=result[0].comments;
		var resp=legend.length+1;
  	db.collection("questions").update({"_id":quesId},{$push:{"comments":{"commentid":resp,"username":username,"comment":comment}}},function(err,result){
			response.json(result);
  			response.end();
  			db.close();

  		});
  });
  	});
});

app.listen(3000)




/*{
	"_id":"1",
	"question":"what is the goal of your organization",
	"description":"Can you please tell us what is the goal of your organization and this protal",
	"criteria":"documentation",
	"clientid":1,
	"status":0,
	"solutionlink":"commentid",
	"comments":[{
		"commentid":""
		"username":"",
		"comment":""
	},
	{
		"username":"",
		"comment":""
	},
	{
		"username":"",
		"comment":""
	}]
}*/