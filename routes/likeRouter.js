const express = require('express')
const router = express.Router()
const likeController = require('../controllers/likeController')
const asyncErr = require('../.utils/asyncErr')

router.put('/like', asyncErr(likeController.profileLikeImage))

router.put('/unlike', asyncErr(likeController.profileUnlikeImage))

module.exports = router
