const express = require('express') ;
const {body} = require('express-validator') ;
const User = require('../models/user') ;
const router = express.Router() ;

const authControllers = require('../controllers/auth') ;
const isauth = require('../middleware/is-auth') ;

router.post('/signup' , [
  body('email')
    .not()
    .isEmpty()
    .isEmail()
    .custom((value) => {
       return User.findOne({email : value})
        .then(user => {
          if(user){
            return Promise.reject('Email already exist') ;
          }
        })
    }).normalizeEmail() ,
  body('name')
    .not()
    .isEmpty()
    .isLength({min : 3}) ,
  body('password')
    .not()
    .isEmpty()
    .isLength({min : 8})
    .trim()  ,
  body('confirmedPassword')
    .not()
    .isEmpty()
    .custom((value , {req}) => {
      if(value !== req.body.password){
        return Promise.reject('Password has to match confirmedPassword') ;
      }
      return true ;
    })
], authControllers.signup) ;

 router.post('/login' , authControllers.login) ;

 router.post('/forget-password' , authControllers.forgetPassword) ;

router.post('/reset-password' , [
  body('newPassword')
    .not()
    .isEmpty()
    .isLength({min : 8})
    .trim()
] , authControllers.resetPassword);

 router.put('/update-user/:userId' ,[
  body('name')
    .not()
    .isEmpty()
    .isLength({min : 3}) ,
 ] ,isauth , authControllers.updateUser) ;

router.patch('/change-password' , [
  body('newPassword')
    .not()
    .isEmpty()
    .isLength({min : 8})
    .custom((value , {req}) => {
      if(value !== req.body.confirmedPassword){
        return Promise.reject('Password has to match confirmedPassword') ;
      }
      return true ;
    })
],isauth , authControllers.changePassword) ;

 router.get('/logout' , isauth  , authControllers.logout) ;

 router.delete('/delete-account/:userId' , isauth , authControllers.deleteAccount) ;

module.exports = router ;
