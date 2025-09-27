const User = require('../models/user') ;
const Post = require('../models/post') ;

const path = require('path') ;
const fs = require('fs') ;

const {validationResult} = require('express-validator') ;

exports.createPost = (req , res , next) => {
  const errors = validationResult(req) ;
  if(!errors.isEmpty()){
    const error = new Error('validation failed') ;
    error.data = errors.array() ;
    error.statusCode = 422 ;
    throw error ;
  }
  if(!req.file){
    const error = new Error('Image is required') ;
    error.statusCode = 422 ;
    throw error ;
  }
  let creator ;
  const {title , content} = req.body ;
  const imageUrl = req.file.path.replace(/\\/g , "/") ;
  const post = new Post({
    title : title ,
    content : content ,
    imageUrl : imageUrl ,
    creator : req.userId
  }) ;
   post.save() 
    .then(result => {
       return User.findById(req.userId)
    }).then(user => {
       user.posts.push(post) ;
       creator = user ;
       return user.save() ;
    }).then(result => {
       res.status(201).json({
        message : 'Post has been created succcessfully' ,
        post : post ,
        creator : {_id : creator._id , name : creator.name}
       }) ;
    }).catch(err => {
      if(!err.statusCode){
        err.statusCode = 500 ;
      }
      next(err) ;
    })
} ;

exports.deletePost = (req , res , next) => {
  const postId = req.params.postId ;
  Post.findById(postId)
    .then(post => {
      if(!post) {
      const error = new Error('Post is not found') ;
      error.statusCode = 404 ;
      throw error ;
      }
      if(req.userId !== post.creator._id.toString()){
        const error = new Error('not authorized') ;
        error.statusCode = 403 ;
        throw error ;
      }
      clearImage(post.imageUrl) ;
     return Post.findByIdAndDelete(postId)
        .then(result => {
          return User.findById(req.userId) ;
        }).then(user => {
          user.posts.pull(postId) ;
          return user.save() ;
        }).then(result => {
          res.status(200).json({message : 'Post is deleted'}) ;
        })
       }).catch(err => {
          if(!err.statusCode){
            err.statusCode = 500 ;
          }
          next(err) ;
        })
} ;

exports.updatePost = (req , res , next) => {
  const errors = validationResult(req) ;
  if(!errors.isEmpty()){
    const error = new Error('validation failed') ;
    error.data = errors.array() ;
    error.statusCode = 422 ;
    throw error ;
  }
  const {title , content} = req.body ;
  let imageUrl = req.body.imageUrl ;
  if(req.file){
    imageUrl = req.file.path.replace(/\\/g , "/") ;
  }
  if(!imageUrl){
    const error = new Error('no file picked') ;
    error.statusCode = 422 ;
    throw error ;
  }
   const postId = req.params.postId ;
    Post.findById(postId) 
      .then(post => {
        if(!post){
          const error = new Error('post not found') ;
          error.statusCode = 404 ;
          throw error ;
        }
        if(req.userId !== post.creator._id.toString()){
          const error = new Error('not authorized') ;
          error.statusCode = 403 ;
          throw error ;
        }
        if(imageUrl !== post.imageUrl){
          clearImage(post.imageUrl) ;
        }
        post.title = title ;
        post.content = content ;
        post.imageUrl = imageUrl ;
        return post.save() ;
      }).then(result => {
        res.status(200).json({message : 'Post updated successfully' , post : result}) ;
      }).catch(err => {
        if(!err.statusCode){
          err.statusCode = 500 ;
        }
        next(err) ;
      })
} ;

exports.likePost = (req , res , next) => {
  const postId = req.params.postId ;
    Post.findById(postId)
      .then(post => {
        if(!post){
          const error = new Error('Post not found') ;
          error.statusCode = 404 ;
          throw error ;
        }
       const alreadyLiked = post.likes.some(id => id.toString() === req.userId)
        if(alreadyLiked){
          post.likes.pull(req.userId) ;
        }else{
          post.likes.push(req.userId) ;
        }
        return post.save()
         .then(result => {
        res.status(alreadyLiked ? 200 : 201).json({ message : alreadyLiked ? 'like removed': 'like added' ,likes : result.likes.length , liked : !alreadyLiked}) ;
         })
      }).catch(err => {
        if(!err.statusCode){
          err.statusCode = 500 ;
        }
        next(err) ;
      })
};

exports.addComment = (req , res , next) => {
  const errors = validationResult(req) ;
  if(!errors.isEmpty()){
    const error = new Error('validation failed') ;
    error.data = errors.array() ;
    error.statusCode = 422 ;
    throw error ;
  }
  const postId = req.params.postId ;
  const text = req.body.text ;
  Post.findById(postId)
    .then(post => {
      if(!post){
        const error = new Error('post not found') ;
        error.statusCode = 404 ;
        throw error ;
      }
      post.comments.push({
        user : req.userId ,
        text : text ,
        createdAt : Date.now() 
      }) ;
      return post.save() ;
    }).then(result => {
      res.status(201).json({message : 'comment is added successfully' , commentsCount : result.comments.length , comments : result.comments , comment : result.comments[result.comments.length - 1 ] , createdAt : result.createdAt}) ;
    }).catch(err => {
      if(!err.statusCode) {
        err.statusCode = 500 ;
      }
      next(err) ;
    })

} ;

exports.updateComment = (req , res , next) => {
  const errors = validationResult(req) ;
  if(!errors.isEmpty()){
    const error = new Error('validation failed') ;
    error.data = errors.array() ;
    error.statusCode = 422 ;
    throw error ;
  }
  const postId = req.params.postId ;
  const commentId = req.params.commentId ;
   Post.findById(postId)
    .then(post => {
      if(!post){
        const error = new Error('post not found') ;
        error.statusCode = 404 ;
        throw error ;
      }
      const comment = post.comments.find(c => c._id.toString()=== commentId)
      if(!comment){
        const error = new Error('comment not found') ;
        error.statusCode = 404 ;
        throw error ;
      }
        if(comment.user.toString() !== req.userId){
        const error = new Error('not authorized') ;
        error.statusCode = 403 ;
        throw error ;
      }
      comment.text = req.body.text ;
      comment.updatedAt = Date.now() ;
      return post.save()
        .then(result => {
         res.status(200).json({message :'comment updated successfully' , comment}) ;
        })
    }).catch(err => {
      if(!err.statusCode){
        err.statusCode = 500 ;
      }
      next(err) ;
    }); 
} ;

exports.deleteComment = (req , res , next) => {
  const postId = req.params.postId ;
  const commentId = req.params.commentId ;
  Post.findById(postId)
    .then(post => {
      if(!post){
        const error = new Error('post not found') ;
        error.statusCode = 404 ;
        throw error ;
      }
      const comment = post.comments.find(c => c._id.toString() === commentId) ;
      if(!comment){
        const error = new Error('comment not found') ;
        error.statusCode = 404 ;
        throw error ;
      }
      if(comment.user.toString() !== req.userId){
        const error = new Error('not authorized') ;
        error.statusCode = 403 ;
        throw error ;
      }
     post.comments.pull(commentId) ;
     return post.save() ;
    }).then(result => {
      res.status(200).json({message : 'comment is deleted successfully' , commentsCount : result.comments.length}) ;
    }).catch(err => {
      if(!err.statusCode){
        err.statusCode = 500
      }
      next(err) ;
    });
};

exports.getUserPosts = (req , res , next) => {
  const userId = req.params.userId ;
  Post.find({creator : userId})
    .populate("creator" , "_id name")
    .populate("sharedFrom" , "creator content")
    .sort({createdAt : -1})
    .then(posts => {
     if(!posts.length){
      return res.status(200).json({message : 'There are no posts'}) ;
     };
     return res.status(200).json({message : 'User posts has been fetched successfully' , posts : posts}) ;
    }).catch(err => {
      if(!err.statusCode){
        err.statusCode = 500 ;
      }
      next(err) ;
    });
};

exports.getSinglePost = (req , res , next) => {
  const postId = req.params.postId ;
  Post.findById(postId)
    .populate("creator" ,"_id name")
    .populate("sharedFrom" , "creator content")
    .then(post => {
      if(!post){
        const error = new Error('Post not found') ;
        error.statusCode = 404 ;
        throw error ;
      };
      res.status(200).json({message : 'Post fetched successfully' , post : post}) ;
    }).catch(err => {
      if(!err.statusCode){
        err.statusCode = 500 ;
      }
      next(err) ;
    });
};

exports.sharePost = (req , res , next) => {
  const postId = req.params.postId ;
  const userId = req.userId ;
  Post.findById(postId)
   .then(post => {
    if(!post){
      const error = new Error('Post not found') ;
      error.statusCode = 404 ;
      throw error ;
    };
    const sharedPost = new Post({
      creator : userId ,
      title: post.title,
      content : req.body?.content || post.content ,
      imageUrl: post.imageUrl,
      sharedFrom : postId
    });
   return sharedPost.save() ;
   }).then(sharePost => {
     res.status(201).json({message : 'Post is shared successfully' , sharePost : sharePost}) ;
   }).catch(err => {
    if(!err.statusCode){
      err.statusCode = 500
    };
     next(err) ;
   });
};

exports.getFeed = (req , res , next) => {
  const userId = req.userId ;
  User.findById(userId)
    .then(user => {
      if(!user){
        const error = new Error('User not found') ;
        error.statusCode = 404 ;
        throw error ;
      };
      const friendsIds = user.friends ;
      friendsIds.push(userId) ;
      return Post.find({creator : {$in : friendsIds}})
       .populate("creator" , "_id name")
       .populate({
        path : "sharedFrom" ,
        populate : {path : "creator" , select : "_id name"}
       })
       .sort({createdAt : -1})
    }).then(posts => {
      if(!posts.length){
      return res.status(200).json({message : 'There are no posts'}) ;
      };
      res.status(200).json({message : 'posts fetched successfully' , posts : posts});
    }).catch(err => {
      if(!err.statusCode){
        err.statusCode = 500 ;
      }
      next(err) ;
    });
};


const clearImage = filePath => {
  filePath = path.join(__dirname , '..' , filePath) ;
  fs.unlink(filePath , err => console.log(err)) ;
};