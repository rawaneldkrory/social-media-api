const express = require('express') ;

const router = express.Router() ;
const isauth = require('../middleware/is-auth') ;

const requestControllers = require('../controllers/friend-request') ;

router.post('/send-request/:toUserId' , isauth , requestControllers.sendRequest) ;

router.post('/accept-request/:requestId' , isauth , requestControllers.acceptRequest) ;

router.post('/reject-request/:requestId' , isauth , requestControllers.rejectRequest) ;

router.delete('/cancel-request/:requestId' , isauth , requestControllers.cancelRequest) ;

router.get('/incoming' , isauth , requestControllers.getIncomingRequests) ;

router.get('/outgoing' , isauth , requestControllers.getOutgoingRequests) ;

router.get('/user-status/:targetUserId' , isauth , requestControllers.getUserStatus) ;

module.exports = router ;
