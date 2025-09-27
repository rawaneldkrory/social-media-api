const express = require('express') ;
const bodyParser = require('body-parser') ;
const mongoose = require('mongoose') ;
const multer = require('multer') ;

const path = require('path') ;

const authRoutes = require('./routes/auth') ;
const postsRoutes = require('./routes/posts') ;
const requestsRoutes = require('./routes/friend-request') ;
const friendsRoutes = require('./routes/friends') ;
require('dotenv').config() ;

const app = express() ;


app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'OPTIONS, GET, POST, PUT, PATCH, DELETE'
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

 const fileStorage = multer.diskStorage({
  destination : (req , file , cb ) => {
    cb(null , 'images') ;
  } ,
  filename : (req , file , cb) => {
    cb(null , new Date().toISOString().replace(/:/g , '-') + '-' + file.originalname) ;
  }
 }) ;

 const fileFilter = (req , file ,cb) => {
   if(
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg' ||
    file.mimetype === 'image/png'
   ){
    cb(null , true) ;
   }else{
    cb(null , false)
   }
 } ;



 app.use(bodyParser.json()) ;
 app.use(multer({storage : fileStorage , fileFilter : fileFilter}).single('image')) ;

 app.use('/images' ,express.static(path.join(__dirname , 'images'))) ;

app.use('/auth' , authRoutes) ;
app.use('/posts', postsRoutes ) ;
app.use('/requests', requestsRoutes) ;
app.use(friendsRoutes) ;

app.use((error , req , res , next ) => {
  console.log(error) ;
  const status = error.statusCode || 500 ;
  const data = error.data ;
  const message = error.message ;
  res.status(status).json({message : message , data : data}) ;
}) ;


mongoose.connect(process.env.MONGODB_URI)
 .then(result => {
  app.listen(process.env.PORT||8080) ;
 }).catch(err => {
  console.log(err) ;
 })