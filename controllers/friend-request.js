const User = require('../models/user') ;
const FriendRequest = require('../models/friend-request') ;
const { request } = require('express');

exports.sendRequest = (req , res , next) => {
  const toUserId = req.params.toUserId ;
  const fromUserId = req.userId ;
  if(toUserId === fromUserId){
    const error = new Error('You can not send a friend request to yourself') ;
    error.statusCode = 400 ;
    throw error ;
  }
  User.findById(toUserId)
    .then(user => {
      if(!user){
        const error = new Error('user not found') ;
        error.statusCode = 404 ;
        throw error ;
      };
      if(user.blocked.some(id => id.toString() === fromUserId)){
       const error = new Error('you are blocked by this user') ;
       error.statusCode = 403 ;
       throw error ;
      } ;
     return FriendRequest.findOne({from : fromUserId , to : toUserId}) ;
    }).then(existingUser => {
      if(existingUser){
        if(existingUser.status === 'pending'){
          const error = new Error('Friend request already pending') ;
          error.statusCode = 400 ;
          throw error ;
        }
        if(existingUser.status === 'accepted'){
          const error = new Error('You are already Friends') ;
          error.statusCode = 400 ;
          throw error ;
        }
      }
      const newFriendRequest = new FriendRequest({
        from : fromUserId ,
        to : toUserId ,
      }) ;
     return newFriendRequest.save() ;
    }).then(result => {
      res.status(201).json({message : 'Friend request is sent successfully' , request : result}) ;
    }).catch(err => {
      if(!err.statusCode){
        err.statusCode = 500 ;
      }
      next(err) ;
    });
};

exports.acceptRequest = (req , res , next) => {
  const requestId = req.params.requestId ;
  const userId = req.userId ;
   FriendRequest.findById(requestId)
     .then(request => {
      if(!request){
        const error = new Error('request is not found') ;
        error.statusCode = 404 ;
        throw error ;
      };
      if(request.to.toString() !== userId){
        const error = new Error('not authorized') ;
        error.statusCode = 403 ;
        throw error ;
      } ;
      if(request.status !== 'pending'){
        const error = new Error('request already handled') ;
        error.statusCode = 400 ;
        throw error ;
      } ;
      request.status = 'accepted' 
       return request.save() ;
     }).then(updatedRequest => {
      return Promise.all([
        User.findByIdAndUpdate(updatedRequest.from , {$addToSet : {friends : updatedRequest.to}} ,{ new : true}) ,
        User.findByIdAndUpdate(updatedRequest.to , {$addToSet : {friends : updatedRequest.from}} , { new : true}) ,
        updatedRequest
      ])  ;
     }).then(([fromUser , toUser , updatedRequest]) => {
      res.status(200).json({message : 'Friend request accepted' , updatedRequest : updatedRequest}) ;
     }).catch(err => {
      if(!err.statusCode){
        err.statusCode = 500 ;
      }
      next(err) ;
     });
};

exports.rejectRequest = (req , res , next) => {
  const requestId = req.params.requestId ;
  const userId = req.userId ;
  FriendRequest.findById(requestId)
    .then(request => {
      if(!request){
        const error = new Error('Request is not found') ;
        error.statusCode = 404 ;
        throw error ;
      };
      if(request.to.toString() !== userId){
        const error = new Error('not authorized') ;
        error.statusCode = 403 ;
        throw error ;
      };
      if(request.status !== 'pending'){
        const error = new Error('Request is already handled') ;
        error.statusCode = 400 ;
        throw error ;
      };
      request.status = 'rejected' ;
      return request.save() ;
    }).then(updatedRequest => {
       res.status(200).json({message : 'Friend request rejected' , updatedRequest : updatedRequest}) ;
    }).catch(err => {
      if(!err.statusCode){
        err.statusCode = 500 ;
      }
      next(err) ;
    });
};

exports.cancelRequest = (req , res , next) => {
  const requestId = req.params.requestId ;
  const userId = req.userId ;
  FriendRequest.findById(requestId)
    .then(request => {
      if(!request){
        const error = new Error('request is not found') ;
        error.statusCode = 404 ;
        throw error ;
      };
      if(request.from.toString() !== userId){
        const error = new Error('not authorized') ;
        error.statusCode = 403 ;
         throw error ;
      };
      if(request.status !== 'pending'){
        const error = new Error('Request is not pending, cannot be canceled') ;
        error.statusCode = 400 ;
        throw error ;
      };
       return request.deleteOne() ;
    }).then(()=> {
       res.status(200).json({message : 'Request is canceled' , request : requestId}) ;
    }).catch(err => {
      if(!err.statusCode){
        err.statusCode = 500
      };
      next(err) ;
    });
};

exports.getIncomingRequests = (req , res , next) => {
  const userId = req.userId ;
  FriendRequest.find({to : userId , status : 'pending'})
    .populate("from" , "_id name")
    .then(requests => {
      if(!requests.length){
        const error = new Error('There is no requests') ;
        error.statusCode = 404 ;
        throw error ;
      };
      res.status(200).json({message : 'Incoming requests has fetched successfully' ,incomingRequests :  requests}) ;
    }).catch(err => {
      if(!err.statusCode){
        err.statusCode = 500 ;
      }
      next(err) ;
    });
};

exports.getOutgoingRequests = (req , res , next) => {
  const userId = req.userId ;
  FriendRequest.find({from : userId , status : 'pending'})
    .populate("to" ,"_id name")
    .then(requests => {
      if(!requests.length){
        const error = new Error('There is not outing requests') ;
        error.statusCode = 404 ;
        throw error ;
      };
      res.status(200).json({message : "Outing requests has fetched successfully" , outingRequests : requests}) ;
    }).catch(err =>{
      if(!err.statusCode){
        err.statusCode = 500 ;
      }
      next(err) ;
    });
};

exports.getUserStatus = (req , res , next) => {
  const userId = req.userId ;
  const targetUserId = req.params.targetUserId ;
  if(userId === targetUserId){
    const error = new Error('You can not check your status') ;
    error.statusCode = 400 ;
    throw error ;
  };
  Promise.all([
    User.findById(userId).populate("friends blocked" , "_id name") ,
    FriendRequest.findOne({
      $or : [
        {to : userId , from : targetUserId} ,
        {from : targetUserId , to : userId}
      ]
    })
  ]).then(([user , request]) => {
      if(!user){
        const error = new Error('User is not found') ;
        error.statusCode = 404 ;
        throw error ;
      };
      if(user.friends.some(friend => friend._id.toString() === targetUserId)){
        return res.status(200).json({status : 'Friends'}) ;
      };
      if(user.blocked.some(blocked => blocked._id.toString() === targetUserId)){
        return res.status(200).json({status : 'Blocked'}) ;
      };
      if(!request){
        return res.status(200).json({status : 'None'}) ;
      }
      if(request.status === 'pending'){
        if(request.from.toString() === userId){
          return res.status(200).json({status : 'Outgoing_request'}) ;
        }else{
          return res.status(200).json({status : 'Incoming_request'}) ;
        }
      }
  }).catch(err => {
    if(!err.statusCode){
      err.statusCode = 500 ;
    }
    next(err) ;
  });
};