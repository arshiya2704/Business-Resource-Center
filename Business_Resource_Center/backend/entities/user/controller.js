 const _ = require('lodash');
const asyncEach = require('async/each');

// controllers
const getAllOpinions = require('../opinion/controller').getAllOpinions;

// models
const User = require('./model');
const Discussion = require('../discussion/model');
const Opinion = require('../opinion/model');

/**
 * get user doc by user id
 * @param  {ObjectId} user_id
 * @return {promise}
 */
const getUser = (user_id) => {
  return new Promise((resolve, reject) => {
    User.findOne({ _id: user_id }, (error, user) => {
      if (error) { console.log(error); reject(error); }
      else if (!user) reject(null);
      else resolve(user);
    });
  });
};

/**
 * sign in/up user via github provided info
 * this will signin the user if user existed
 * or will create a new user using git infos
 * @param  {Object} gitProfile    profile information provided by github
 * @return {promise}              user doc
 */
const signInViaGithub = (gitProfile) => {
  return new Promise((resolve, reject) => {

    // find if user exist on db
    User.findOne({ username: gitProfile.displayName }, (error, user) => {
      if (error) { console.log(error); reject(error); }
      else {
        // get the email from emails array of gitProfile
        console.log(JSON.stringify(gitProfile));
        const email = gitProfile.displayName;

        // user existed on db
        if (user) {
          // update the user with latest git profile info
          user.name = gitProfile.displayName,
          user.username = gitProfile.id,
          user.avatarUrl = gitProfile._json.picture.data.url,
          user.email = gitProfile.displayName,
          user.github.id = gitProfile.id,
          user.github.url = gitProfile.profileUrl,
          //user.github.company = gitProfile._json.company,
          //user.github.location = gitProfile._json.location,
          //user.github.hireable = gitProfile._json.hireable,
          //user.github.bio = gitProfile._json.bio,
          //user.github.followers = gitProfile._json.followers,
          //user.github.following = gitProfile._json.following,

          // save the info and resolve the user doc
          user.save((error) => {
            if (error) { console.log(error); reject(error); }
            else { resolve(user); }
          });
        }

        // user doesn't exists on db
        else {
          // check if it is the first user (adam/eve) :-p
          // assign him/her as the admin
          User.count({}, (err, count) => {
            console.log('usercount: ' + count);

            let assignAdmin = true;
            if (count === 0) assignAdmin = true;

            // create a new user
            const newUser = new User({
              name: gitProfile.displayName,
              username: gitProfile.id,
              avatarUrl: gitProfile._json.picture.data.url,
              email: gitProfile.displayName,
              role: assignAdmin ? 'admin' : 'user',
              github: {
                id: gitProfile.id,
                url: gitProfile.profileUrl,
                //company: gitProfile._json.company,
                //location: gitProfile._json.location,
                //hireable: gitProfile._json.hireable,
                //bio: gitProfile._json.bio,
                //followers: gitProfile._json.followers,
                //following: gitProfile._json.following,
              },
            });

            // save the user and resolve the user doc
            newUser.save((error) => {
              if (error) { console.log(error); reject(error); }
              else { resolve(newUser); }
            });

          });
        }
      }
    });

  });
};

/**
 * get the full profile of a user
 * @param  {String} username
 * @return {Promise}
 */
const getFullProfile = (username) => {
  return new Promise((resolve, reject) => {
    User
    .findOne({ username })
    .lean()
    .exec((error, result) => {
      if (error) { console.log(error); reject(error); }
      else if (!result) reject('not_found');
      else {
        // we got the user, now we need all discussions by the user
        Discussion
        .find({ user_id: result._id })
        .populate('forum')
        .lean()
        .exec((error, discussions) => {
          if (error) { console.log(error); reject(error); }
          else {
            // we got the discussions by the user
            // we need to add opinion count to each discussion
            asyncEach(discussions, (eachDiscussion, callback) => {
              getAllOpinions(eachDiscussion._id).then(
                (opinions) => {
                  // add opinion count to discussion doc
                  eachDiscussion.opinion_count = opinions ? opinions.length : 0;
                  callback();
                },
                (error) => { console.error(error); callback(error); }
              );
            }, (error) => {
              if (error) { console.log(error); reject(error); }
              else {
                result.discussions = discussions;
                resolve(result);
              }
            });
          }
        });
      }
    });
  });
};

module.exports = {
  signInViaGithub,
  getUser,
  getFullProfile,
};
