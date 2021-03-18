const express = require('express')
const router = express.Router()
const usrController = require('../controllers/usrController')
// Error handling
const asyncErr = require('../.utils/asyncErr')

/* ================================== Routes ==================================*/

router.get('/:username', asyncErr(usrController.userProfile))

// Show either list of followers or list of following
router.post('/:username/:f', asyncErr(usrController.showListFollows))

router.put('/follow', asyncErr(usrController.profileFollow))

router.put('/unfollow', asyncErr(usrController.profileUnfollow))

router.put('/like', asyncErr(usrController.profileLikeImage))

module.exports = router

