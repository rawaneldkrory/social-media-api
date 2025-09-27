const bcrypt = require('bcrypt') ;
const User = require('../models/user') ;
const {validationResult} = require('express-validator') ;
const jwt = require('jsonwebtoken') ;
const crypto = require('crypto') ;
const Post = require('../models/post') ;

exports.signup = (req , res , next) => {
  const errors = validationResult(req) ;
  if(!errors.isEmpty()){
    const error = new Error('Validation is failed') ;
    error.statusCode = 422 ;
    error.data = errors.array()
    throw error ;
  };
  const {email , password , name } = req.body ;
  bcrypt.hash(password , 12)
    .then(hashedPw => {
      const user = new User({
        email : email ,
        name : name ,
        password : hashedPw
      });
   return user.save();
    }).then(user => {
      res.status(201).json({message : 'User created successfully' , userId : user._id}) ;
    }).catch(err => {
      if(!err.statusCode){
        err.statusCode = 500 ;
      }
      next(err) ;
    });
};

 exports.login = (req , res , next) => {
  const {email , password} = req.body ;
   if(!email || !password){
   const error = new Error('Email and Password are required') ;
   error.statusCode = 422 ;
   throw error ;
  };
  let loadUser ;
   User.findOne({email : email})
     .then(user => {
      if(!user){
        const error = new Error('User not found') ;
        error.statusCode = 404 ;
        throw error ;
      };
      loadUser = user ;
     return bcrypt.compare(password , user.password) ;
     }).then(isEqual =>{
        if(!isEqual){
          const error = new Error('Password is not correct') ;
          error.statusCode = 401;
          throw error ;
        };
        const token = jwt.sign({
          email : email ,
          userId : loadUser._id.toString()
        } , 'supersecretsecret' ,
        {expiresIn : '1h'}) ;
       res.status(200).json({token : token , userId : loadUser._id.toString()}) ;
     }).catch(err => {
        if(!err.statusCode){
          err.statusCode = 500 ;
        }
        next(err) ;
     });
 };

exports.forgetPassword = (req , res , next) => {
   const email = req.body.email ;
   if(!email){
    const error = new Error('Email is required') ;
    error.statusCode = 400 ;
    throw error ;
   };
   User.findOne({email : email})
     .then(user => {
      if(!user){
        const error = new Error('User not found') ;
        error.statusCode = 404 ;
        throw error ;
      };
      const token = crypto.randomBytes(32).toString('hex') ;
      const expiry = Date.now() + 60 * 60 * 1000 ;

      user.resetToken = token ;
      user.resetTokenExpiry = expiry ;

     return user.save() ;
     }).then(result => {
      res.status(200).json({message : 'if email is correct the link has been sent'}) ;
     }).catch(err => {
      if(!err.statusCode){
        err.statusCode = 500 ;
      }
      next(err) ;
     });
};

exports.resetPassword = (req , res , next) => {
  const errors = validationResult(req) ;
  if(!errors.isEmpty()){
    const error = new Error('Validation failed') ;
    error.statusCode = 422 ;
    error.data = errors.array() ;
    throw error ;
  };
  let loadUser ;
  const { token , newPassword , confirmedPassword} = req.body ;
   if(newPassword !== confirmedPassword){
    const error = new Error('newPassword has to match confirmedPassword') ;
    error.statusCode = 400 ;
    throw error ;
   };
   User.findOne({
    resetToken : token ,
    resetTokenExpiry : { $gt : Date.now()}
   }).then(user => {
     if(!user){
      const error = new Error('Token is expired or invalid') ;
      error.statusCode = 401 ;
      throw error ;
     };
     loadUser = user ;
     return bcrypt.hash(newPassword , 12) ;
   }).then(hashedPw => {
    loadUser.password = hashedPw ;
    loadUser.resetToken= undefined ;
    loadUser.resetTokenExpiry = undefined ;
    return loadUser.save() ;
   }).then(result => {
    res.status(200).json({message : 'Password changed successfully'}) ;
   }).catch(err => {
    if(!err.statusCode){
      err.statusCode = 500 ;
    }
    next(err) ;
   });
};

exports.updateUser = (req , res , next) => {
  const userId = req.params.userId ;
  if(req.userId.toString() !== userId.toString()) {
    return res.status(401).json({message : 'You are not authorized to update this user'}) ;
  }
  const updates = req.body ;
  const allowedFields = ['name' , 'status'] ;
  const validUpdates = {} ;
  Object.keys(updates).forEach(key => {
    if(allowedFields.includes(key)){
      validUpdates[key] = updates[key] ;
    }
  });
  User.findByIdAndUpdate(userId , {$set : validUpdates} , {new : true , runValidators : true})
    .then(user => {
      if(!user){
        const error = new Error('User not found') ;
        error.statusCode = 404 ;
        throw error ;
      }
      res.status(200).json({message : 'User updated successfully'  , userId : userId}) ;
    }).catch(err => {
      if(!err.statusCode){
        err.statusCode = 500
      }
      next(err) ;
    });
};

exports.changePassword = (req , res , next) => {
 const errors = validationResult(req) ;
 if(!errors.isEmpty()){
  const error = new Error('Validation failed') ;
  error.data = errors.array() ;
  error.statusCode = 422 ;
  throw error ;
 }
 let loadUser ;
 const userId = req.userId ;
 const {currentPassword , newPassword} = req.body ;
  User.findById(userId)
    .then(user => {
    if(!user){
      const error = new Error('User not found') ;
      error.statusCode = 404 ;
      throw error ;
    }
    loadUser = user ;
    return bcrypt.compare( currentPassword ,user.password ) ;
  }).then(isEqual => {
    if(!isEqual){
      const error = new Error('currentPassword is not correct') ;
      error.statusCode = 400 ;
      throw error ;
    }
    if(currentPassword === newPassword){
      const error = new Error('Password did not change') ;
      error.statusCode = 400 ;
      throw error ;
    }
    return bcrypt.hash(newPassword , 12) ;
  }).then(hashedPw => {
    loadUser.password = hashedPw ;
    return loadUser.save() ;
  }).then(result => {
    res.status(200).json({message : 'Password changed successfully '}) ;
  }).catch(err => {
    if(!err.statusCode){
      err.statusCode = 500
    }
    next(err) ;
  });
};

exports.logout = (req , res , next) => {
  res.status(200).json({message : 'User logged out successfully'}) ;
};

exports.deleteAccount = (req , res , next) => {
  const userId = req.params.userId ;
  if(userId.toString() !== req.userId.toString()){
    const error = new Error('Not authorized') ;
    error.statusCode = 401 ;
    throw error ;
  }
  User.findById(userId)
    .then(user => {
      if(!user){
        const error = new Error('User not found') ;
        error.statusCode = 404 ;
        throw error ;
      }
      return Post.deleteMany({creator : userId}) ;
    }).then(() => {
      return User.deleteOne({_id : userId}) ;
    }).then(() => {
      res.status(200).json({message : 'User deleted successfully'}) ;
    }).catch(err => {
      if(!err.statusCode){
        err.statusCode = 500 ;
      }
      next(err) ;
    });
};