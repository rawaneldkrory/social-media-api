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

   /*
   {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJ1c2VySWQiOiI2OGNhZDQ5YWY3MzIyMTI3MGRiNWExZDQiLCJpYXQiOjE3NTgxMjMxODcsImV4cCI6MTc1ODEyNjc4N30.c9yMgFWnWJzQnU7vk_G42VqmsRxtkuPpRO-N-rvovqs",
    "userId": "68cad49af73221270db5a1d4"
}*/

/*
{
  "title" : "A Ball" ,
  "content" : "A football Ball" ,
  "imageUrl" : "https://www.google.com/url?sa=i&url=https%3A%2F%2Fcommons.wikimedia.org%2Fwiki%2FFile%3AFootball_%2528soccer_ball%2529.svg&psig=AOvVaw1-dLHFH1fGn7eYtOEvcFR3&ust=1758376464895000&source=images&cd=vfe&opi=89978449&ved=0CBUQjRxqFwoTCMCu1Jf95I8DFQAAAAAdAAAAABAE"
}
*/ 
/*
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJ1c2VySWQiOiI2OGNhZDQ5YWY3MzIyMTI3MGRiNWExZDQiLCJpYXQiOjE3NTgzNzgyMjksImV4cCI6MTc1ODM4MTgyOX0.Jn3fkxB2RbXteSZ6WDLqvgWY6cnKLkEFOmr8WYm0lyY",
    "userId": "68cad49af73221270db5a1d4"
}
*/ 
/*
{
    "message": "Post has been created succcessfully",
    "post": {
        "title": "A football ball",
        "content": "A football ball",
        "imageUrl": "images/2025-09-20T14-50-39.942Z-ball.jpg",
        "creator": "68cad49af73221270db5a1d4",
        "likes": [],
        "_id": "68cebf3fcdff4eeadfc378f6",
        "comments": [],
        "createdAt": "2025-09-20T14:50:40.021Z",
        "updatedAt": "2025-09-20T14:50:40.021Z",
        "__v": 0
    },
    "creator": {
        "_id": "68cad49af73221270db5a1d4",
        "name": "Rawan"
    }
}
*/ 