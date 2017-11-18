var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var mongo = require("./mongo");
var mongoURL = "mongodb://localhost:27017/272";
var bcrypt = require('bcrypt');

module.exports = function(passport) {
    passport.use('login', new LocalStrategy(function(username   , password, done) {
        try {
            mongo.connect(mongoURL, function(){
                console.log('Connected to mongo at: ' + mongoURL);
                var coll = mongo.collection('Users');



                coll.findOne({username: username}, function(err, user){
                    if (user) {
                        var comp=bcrypt.compareSync(password,user.password);
                        if(comp) {
                            console.log(comp)
                            done(null, {username: username, password: password});
                        }
                        else
                        {
                            done(null, false);
                        }

                    } else {
                        console.log(err)
                        done(null, false);
                    }
                });
            });
        }
        catch (e){
            done(e,{});
        }
    }));

    passport.use('signup', new LocalStrategy({
            passReqToCallback : true
        },
        function(req, username, password, done) {
            findOrCreateUser = function(){
                // find a user in Mongo with provided username
                mongo.connect(mongoURL, function() {
                    console.log('Connected to mongo at: ' + mongoURL);
                    var coll = mongo.collection('Users');

                    coll.findOne({'username': username}, function (err, user) {
                        // In case of any error return
                        if (err) {
                            console.log('Error in Signup: ' + err);
                            return done(err);
                        }
                        // already exists
                        if (user) {
                            console.log('User already exists');
                            return done(null, false,
                                req.flash('message', 'User Already Exists'));
                        } else {
                            // save the user
                            coll.save({
                                firstname: req.body.firstname,
                                lastname: req.body.lastname,
                                username: username,
                                password: bcrypt.hashSync(password, 10),
                                type:req.body.type
                            })
                            return done(null, {username: username, password: password});
                        }
                    });
                });
            };

            process.nextTick(findOrCreateUser);
        })
    );

};