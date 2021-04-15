const express = require('express')
const router = express.Router()
const multer = require('multer')
const { storage } = require('../cloudinary/cloudConfig')
const ExpressError = require('../.utils/ExpressError')
const asyncErr = require('../.utils/asyncErr')
const Joi = require('joi') // schema validation
    // controllers
const imgController = require('../controllers/imgController')
const upload = multer({storage})

router.get('/', asyncErr(imgController.explore))

router.get('/new', imgController.newImgForm)

router.post('/', upload.array('image'), asyncErr(imgController.uploadNewPost))

router.get('/:id', asyncErr(imgController.fullPost))

router.get('/:id/edit', asyncErr(imgController.editPostForm))

router.put('/:id', upload.array('image'), asyncErr(imgController.updatePost))

router.delete('/:id', asyncErr(imgController.deletePost))

router.post('/:id/comments', asyncErr(imgController.commentPost))

router.delete('/:imageId/comments/:commentId', asyncErr(imgController.deleteCommentPost))

module.exports = router
