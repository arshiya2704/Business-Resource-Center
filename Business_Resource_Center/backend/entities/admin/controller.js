const waterfall = require('async/waterfall');

const Discussion = require('../discussion/model');
const Opinion = require('../opinion/model');
const Forum = require('../forum/model');
const User = require('../user/model');


const getAdminDashInfo = () => {
  return new Promise((resolve, reject) => {
    waterfall([
      (callback) => {
        Discussion.count().exec((error, count) => {
          callback(null, { discussionCount: count });
        });
      },
      (lastResult, callback) => {
        Opinion.count().exec((error, count) => {
          callback(null, Object.assign(lastResult, { opinionCount: count }));
        });
      },
      (lastResult, callback) => {
        Forum.count().exec((error, count) => {
          callback(null, Object.assign(lastResult, { forumCount: count }));
        });
      },
      (lastResult, callback) => {
        User.count().exec((error, count) => {
          callback(null, Object.assign(lastResult, { userCount: count }));
        });
      },
      (lastResult, callback) => {
        Forum
        .find({})
        .sort({ date: -1 })
        .lean()
        .exec((error, forums) => {
          callback(null, Object.assign(lastResult, { forums }));
        });
      },
    ], (error, result) => {
      if (error) {  reject(error); }
      else resolve(result);
    });
  });
};


const createForum = ({ forum_name, forum_slug }) => {
  return new Promise((resolve, reject) => {
  
    Forum
    .findOne({ forum_slug })
    .exec((error, forum) => {
      if (error) { reject({ serverError: true }); }
      else if (forum) { reject({ alreadyExists: true }); }
      else {
      
        const newForum = new Forum({
          forum_slug,
          forum_name,
        });

        newForum.save((error) => {
          if (error) { ; reject({ created: false }); }
          else { resolve(Object.assign({}, newForum, { created: true })); }
        });
      }
    });
  });
};


const deleteForum = ({ forum_id }) => {
  return new Promise((resolve, reject) => {
   
    Discussion.remove({ forum_id }).exec((error) => {
      if (error) { reject({ deleted: false }); }
      else {
       
        Opinion.remove({ forum_id }).exec((error) => {
          if (error) {  reject({ deleted: false }); }
          else {
            
            Forum.remove({ _id: forum_id }).exec((error) => {
              if (error) {  reject({ deleted: false }); }
              else { resolve({ deleted: true }); }
            });
          }
        });
      }
    });
  });
};


const deleteUser = ({ user_id }) => {
  return new Promise((resolve, reject) => {
    
    Discussion.remove({ user_id }).exec((error) => {
      if (error) {  reject({ deleted: false }); }
      else {
        
        Opinion.remove({ user_id }).exec((error) => {
          if (error) { reject({ deleted: false }); }
          else {
            
            User.remove({ _id: user_id }).exec((error) => {
              if (error) { reject({ deleted: false }); }
              else { resolve({ deleted: true }); }
            });
          }
        });
      }
    });
  });
};


const deleteDiscussion = ({ discussion_id }) => {
  return new Promise((resolve, reject) => {
    
    Opinion.remove({ discussion_id }).exec((error) => {
      if (error) { reject({ deleted: false }); }
      else {
      
        Discussion.remove({ _id: discussion_id }).exec((error) => {
          if (error) {  reject({ deleted: false }); }
          else { resolve({ deleted: true }); }
        });
      }
    });
  });
};

module.exports = {
  getAdminDashInfo,
  createForum,
  deleteForum,
  deleteUser,
  deleteDiscussion,
};
