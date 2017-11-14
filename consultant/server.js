

var MongoClient = require('mongodb').MongoClient
			, assert = require('assert');
var murl = "mongodb://localhost:27017/userdata";
var http = require("http");
var url = require('url');
var express=require("express");
var app=express();
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
                                  console.log(res[0].Acctype);
    			                        bcrypt.compare(password, res[0].password, function(err, resp) {
    			// res == true
    			                        if(resp==true){
    				                              response.json({"code":200,"msg":"login successful","type":res[0].Acctype});
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
		var _id=Qid;   //posts the questions and projects submitted by company
		Qid=Qid+1;
		console.log(_id);
		var question=request.body.question;
		var description=request.body.description;
		var criteria=request.body.criteria;
		var clientusername=request.body.clientusername;
			    MongoClient.connect(murl, function(err, db) {  //get famous item for home page
  			  assert.equal(null, err);
  			          db.collection("questions").insert({"_id":_id,"question":question,"description":description,"criteria":criteria,"clientusername":clientusername,"status":0,"solution":0,"comments":[]},function(err,result){
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
	  var quesId=parseInt(request.body.quesid);            // students,faculty or compaies can submit comments and this will store comments for perticular question
	  var username=request.body.username;
	  var comment=request.body.comment;
	        MongoClient.connect(murl, function(err, db) {  
  	      assert.equal(null, err);
  	      var commentid=getNextSequence(quesId);
  	              db.collection("questions").find({"_id":quesId},{"comments":1}).toArray(function(err,result){
		                        assert.equal(err, null);
		                        var legend=result[0].comments;
		                        var resp=legend.length+1;
  	                              db.collection("questions").update({"_id":quesId},{$push:{"comments":{"commentid":resp,"username":username,"comment":comment}}},function(err,result){
			                                    assert.equal(err, null);
                                          response.json(result);
  			                                  response.end();
  			                                  db.close();
  		                            });
                  });
          });
});


app.get("/student/availablequestion",function(request,response,next){
          MongoClient.connect(murl,function(err,db){
          assert.equal(null,err);             //all the questions for showing to students that are unanswered
                db.collection("questions").find({"status":0}).toArray(function(err,result){
                            assert.equal(err, null);
                            response.json(result);
                            response.end();
                            db.close();
                });
          });
});

app.get("/company/postedquestionans/:clientusername",function(request,response,next){
    var clientUN=request.params.clientusername;
        MongoClient.connect(murl,function(err,db){
        assert.equal(null,err);           //get all the questions posted by a company and already answered
                db.collection("questions").find({"clientusername":clientUN,"status":1}).toArray(function(err,result){
                            assert.equal(err, null);
                            response.json(result);
                            response.end();
                            db.close();
                });
        });
});

app.get("/company/postedquestionunans/:clientusername",function(request,response,next){
    var clientUN=request.params.clientusername;
        MongoClient.connect(murl,function(err,db){
        assert.equal(null,err);           //get all the questions posted by a company and unanswered
                db.collection("questions").find({"clientusername":clientUN,"status":0}).toArray(function(err,result){
                            assert.equal(err, null);
                            response.json(result);
                            response.end();
                            db.close();
                });
        });
});
//--------questions based on answered or not answered
app.get("/student/answeredquestions/:studentusername",function(request,response,next){
    var studentUN=request.params.studentusername;
        MongoClient.connect(murl,function(err,db){
        assert.equal(null,err);           //get all the questions answerd by a student
                db.collection("questions").find({"comments.username":studentUN}).toArray(function(err,result){
                            assert.equal(err, null);
                            response.json(result);
                            response.end();
                            db.close();
                });
        });
});

app.post("/setanswer",function(request,response,next){
    var commentid=parseInt(request.body.commentid);
    var questionid=parseInt(request.body.questionid);
        MongoClient.connect(murl,function(err,db){
        assert.equal(null,err); //set answer
                db.collection("questions").update({"_id":questionid},{$set:{"status":1,"solution":commentid}},function(err,result){
                assert.equal(err, null);
                        if(result.result.nModified==1){
                            response.json({"code":200,"msg":"answer set"});
                            response.end();
                            db.close();
                        }
                        else{
                            response.json({"code":404,"msg":"answer not set"});
                            response.end();
                            db.close();       
                        }
                });
        });
});

app.get("/getcomments/:id",function(request,response,next){
    var questionid=parseInt(request.params.id);
        MongoClient.connect(murl,function(err,db){
        assert.equal(null,err); //get comments
                db.collection("questions").find({"_id":questionid},{"comments":1,"_id":0}).toArray(function(err,result){
                            assert.equal(err, null);
                            response.json(result[0]);
                            response.end();
                            db.close();
                });

        });
});


app.listen(3000)




/*{
	"_id":"1",
	"question":"what is the goal of your organization",
	"description":"Can you please tell us what is the goal of your organization and this protal",
	"criteria":"documentation",
	"clientusername":1,
	"status":0,
	"solution":commentid,
	"comments":[{
		"commentid":
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
