const ErrorResponse = require('../utils/errorResponse')
const Course = require('../models/Course')
const Bootcamp = require('../models/Bootcamp')
const asyncHandler = require('../middleware/async')

// @desc     Get courses
// @route    GET /api/v1/courses
// @route    GET /api/v1/bootcamps/:bootcampId/courses
// @access   Public
exports.getCourses = asyncHandler(async (req, res, next) => {


    if(req.params.bootcampId){
        const courses = await Course.find({bootcamp: req.params.bootcampId})

        return res.status(200).json({
            sucess: true,
            count: courses.length,
            data: courses
    })
}
    else {
        res.status(200).json(res.advancedResults)
    }

});

// @desc     Get a single course
// @route    GET /api/v1/courses/:id
// @access   Public
exports.getCourse = asyncHandler(async (req, res, next) => {
    const course = await Course.findById(req.params.id)

    if(!course) {
        return next( new ErrorResponse(`Could not find course with id of ${req.params.id}`, 404))
    }

    res.status(200).json({sucess: true, data: course})
})


// @desc    Create course for a bootcamp
// @route   POST /api/v1/bootcamps/:bootcampId/courses
// @access  Private
exports.createCourse = asyncHandler(async(req, res, next) => {
    req.body.bootcamp = req.params.bootcampId
    req.body.user = req.user.id

    const bootcamp = await Bootcamp.findById(req.params.bootcampId)

    if(!bootcamp) {
        return next(new ErrorResponse(`No bootcamp found with id of ${req.params.bootcampId}`, 404))
    }

      // Make sure user is bootcamp owner
      if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return  next(new ErrorResponse(`User ${req.user.id} not authorized to add a course to bootcamp ${bootcamp._id}`, 400))
    }

    const course = await Course.create(req.body)

    res.status(200).json({sucess: true, data: course})
})

// @desc    Update a course
// @access Private
// @route /api/v1/course/:courseId

exports.updateCourse = asyncHandler(async (req, res, next) => {
    let course = await Course.findById(req.params.id)

    if(!course) {
        return next(new ErrorResponse(`No course found with id of ${req.params.id}`, 404))
    }

     // Make sure user is course owner
     if(course.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return  next(new ErrorResponse(`User ${req.user.id} not authorized to update course ${course._id}`, 400))
    }

    course = await Course.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true})

    res.status(200).json({sucess: true, data: course})
})


// @desc    Delete course
// @access Private
// @route /api/v1/course/:courseId

exports.deleteCourse = asyncHandler(async (req, res, next) => {
    const course = await Course.findById(req.params.id) // TODO: check for bootcamp owner

    if(!course) {
        return next(new ErrorResponse(`No course found with id of ${req.params.id}`, 404))
    }

      // Make sure user is course owner
      if(course.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return  next(new ErrorResponse(`User ${req.user.id} not authorized to delete course ${course._id}`, 400))
    }

    await course.deleteOne();

    res.status(200).json({sucess: true, data: {}})

})



