const express = require('express') ;
const router = express.Router() ;
const {body} = require('express-validator') ;

const isauth = require('../middleware/is-auth') ;
const postsControllers = require('../controllers/posts') ;

router.post('/create-post' ,isauth ,
  [
  body('title')
    .not()
    .isEmpty()
    .isLength({min : 8})
    .trim() ,
  body('content')
    .not()
    .isEmpty()
    .isLength({min : 8}) 
    .trim()
  
  ], postsControllers.createPost) ;

  router.delete('/delete-post/:postId' , isauth , postsControllers.deletePost) ;

  router.patch('/update-post/:postId' , isauth , [
    body('title')
      .not()
      .isEmpty()
      .isLength({min : 8}) 
      .trim() ,
    body('content')
      .not()
      .isEmpty()
      .isLength({min : 8})
      .trim()
  ] , 
  postsControllers.updatePost) ;

  router.post('/like/:postId' , isauth , postsControllers.likePost) ;

  router.post('/add-comment/:postId' , isauth , [
    body('text')
      .not()
      .isEmpty()
  ] , postsControllers.addComment) ;

  router.put('/update-comment/:postId/:commentId' , isauth ,[
   body('text')
     .not()
     .isEmpty()
  ] , postsControllers.updateComment) ;

  router.delete('/delete-comment/:postId/:commentId' , isauth  , postsControllers.deleteComment) ;

  router.get('/user-posts/:userId' , isauth , postsControllers.getUserPosts) ;

  router.get('/single-post/:postId' , isauth , postsControllers.getSinglePost) ;

  router.post('/share-post/:postId' , isauth, postsControllers.sharePost) ;

  router.get('/feed' , isauth , postsControllers.getFeed) ;

  module.exports = router ;