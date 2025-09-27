const User = require('../models/user') ;
const FriendRequest = require('../models/friend-request') ;

exports.getFriends = (req , res , next) => {
  const userId = req.userId ;
  User.findById(userId)
    .populate('friends' , 'name email _id')
    .then(user => {
      if(!user){
        const error = new Error('User not found') ;
        error.statusCode = 404 ;
        throw error ;
      };
      res.status(200).json({message : 'Friends fetched successfully' , friends : user.friends}) ;
    }).catch(err => {
      if(!err.statusCode){
        err.statusCode = 500 ;
      }
      next(err) ;
    });
};

exports.deleteFriend = (req , res , next) => {
  const friendId = req.params.friendId ;
  const userId = req.userId ;
  User.findById(userId)
    .then(user => {
      if(!user){
        const error = new Error('user not found') ;
        error.statusCode = 404 ;
        throw error ;
      };
      if(!user.friends.some(id => id.toString() === friendId)){
        const error = new Error('This user is not in your friends') ;
        error.statusCode = 400 ;
        throw error ;
      };
      return Promise.all([
        User.findByIdAndUpdate(userId , {$pull : {friends : friendId}} , {new : true}).select('_id name') ,
        User.findByIdAndUpdate(friendId , {$pull : {friends : userId}} , {new : true}).select('_id name')
      ]) ;
    }).then(([updatedUser , updatedFriend]) => {
      res.status(200).json({message : 'User removed from friends successfully' , user : updatedUser , friend : updatedFriend }) ;
    }).catch(err => {
      if(!err.statusCode){
        err.statusCode = 500 ;
      }
      next(err) ;
    });
};

exports.blockUser = (req , res , next) => {
  const userId = req.userId ;
  const targetUserId = req.params.targetUserId ;
  if(userId === targetUserId){
    const error = new Error('You can not block yourself') ;
    error.statusCode = 400 ;
    throw error ;
  };
  User.findById(targetUserId)
    .then(targetUser => {
      if(!targetUser){
        const error = new Error('User is not found') ;
        error.statusCode = 404 ;
        throw error ;
      };
      return Promise.all(([
        User.findByIdAndUpdate(userId , {$addToSet : {blocked : targetUserId} , $pull : {friends : targetUserId}} , {new : true}).select("_id name friends blocked") ,
        User.findByIdAndUpdate(targetUserId , {$pull : {friends : userId}} , {new : true}).select("_id name friends blocked")
      ]));
    }).then(([updatedCurrentUser , updatedTargetUser]) => {
      res.status(200).json({message : 'User is blocked successfully' , currentUser : updatedCurrentUser , targetUser : updatedTargetUser});
    }).catch(err => {
      if(!err.statusCode){
        err.statusCode = 500 ;
      }
      next(err) ;
    });
};

exports.unBlockUser = (req , res , next) => {
  const targetUserId = req.params.targetUserId ;
  const userId = req.userId ;
  if(userId === targetUserId){
    const error = new Error('You can not unblock yourself') ;
    error.statusCode = 400 ;
    throw error ;
  };
  User.findById(userId)
    .then(user => {
      if(!user){
        const error = new Error('User is not found') ;
        error.statusCode = 404 ;
        throw error ;
      };
      if(!user.blocked.some(id => id.toString()=== targetUserId)){
        const error = new Error('This user is not blocked') ;
        error.statusCode = 400 ;
        throw error ;
      };
      user.blocked.pull(targetUserId) ;
      return user.save() ;
    }).then(result => {
      res.status(200).json({message : 'User unblocked successfully' , userId : result._id , blockedUsers : result.blocked}) ;
    }).catch(err => {
      if(!err.statusCode){
        err.statusCode = 500 ;
      }
      next(err) ;
    });
};

exports.getBlockedUsers = (req , res , next) => {
  const userId = req.userId ;
  User.findById(userId)
   .populate("blocked" , "_id name")
   .then(user => {
    if(!user){
      const error = new Error('User is not found') ;
      user.statusCode = 404 ;
      throw error ;
    };
    res.status(200).json({message : 'Blocked user has fetched successfully' , blockedUsers : user.blocked || []}) ;
   }).catch(err => {
    if(!err.statusCode){
      err.statusCode = 500 ;
    }
    next(err) ;
   });
};

