const mongoose = require('mongoose') ;
const Schema = mongoose.Schema ;

const friendRequestSchema = new Schema({
  from : {type : Schema.Types.ObjectId , ref : 'User' , required : true} ,
  to : {type : Schema.Types.ObjectId , ref : 'User' , required : true} ,
  status : {
    type : String ,
    enum : ['pending' , 'accepted' , 'rejected'] ,
    default : 'pending'
  } ,
  createdAt : {type : Date , default : Date.now}
}) ;

module.exports = mongoose.model('friendRequest' , friendRequestSchema) ;