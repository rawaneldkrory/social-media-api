const express = require('express') ;

const router = express.Router() ;

const isauth = require('../middleware/is-auth') ;

const friendsControllers = require('../controllers/friends')

router.get('/get-friends' , isauth ,friendsControllers.getFriends ) ;

router.delete('/delete-friend/:friendId' , isauth , friendsControllers.deleteFriend) ;

router.post('/block/:targetUserId' , isauth , friendsControllers.blockUser) ;

router.post('/unblock/:targetUserId' , isauth , friendsControllers.unBlockUser) ;

router.get('/blockedUsers' , isauth , friendsControllers.getBlockedUsers) ;

module.exports = router ;