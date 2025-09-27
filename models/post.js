const mongoose = require('mongoose') ;

const Schema = mongoose.Schema ;

 const postSchema = new Schema({
 title : {
  type : String ,
  required : true 
 } ,
 content : {
  type : String ,
  required : true
 } ,
 imageUrl : {
  type : String ,
  required : true
 } ,
 creator : {
  type : Schema.Types.ObjectId ,
  ref : 'User' ,
  required : true } ,
  likes : [{
    type : Schema.Types.ObjectId ,
    ref : 'User'
  }] ,
  comments : [{
    user : { type : Schema.Types.ObjectId , ref : 'User'} ,
    text : {type : String , required : true} ,
    createdAt : {type : Date , default : Date.now} ,
    updatedAt : {type : Date }
  }] , 
  sharedFrom : {
    type : Schema.Types.ObjectId ,
    ref : 'Post'
  }
 } ,
{timestamps : true}
) ;

module.exports = mongoose.model('Post' , postSchema) ;
