const express = require('express')
const router = express.Router()
const usrController = require('../controllers/usrController')
const asyncErr = require('../.utils/asyncErr')

/* ================================== Routes ==================================*/

router.get('/:username', asyncErr(usrController.userProfile))

router.post('/:username/:f', asyncErr(usrController.showListFollows))

router.put('/follow', asyncErr(usrController.profileFollow))

router.put('/unfollow', asyncErr(usrController.profileUnfollow))

module.exports = router

