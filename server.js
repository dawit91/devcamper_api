const express = require('express')
const dotenv = require('dotenv')
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const connectDB = require('./config/db')
const errorHandler = require('./middleware/errorHandler')
const colors = require('colors')
const path = require('path')
const fileupload = require('express-fileupload')
// load env vars
dotenv.config({path: './config/config.env'})

//Connect to database
connectDB();

//Route files
const bootcamps = require('./routes/bootcamps')
const courses = require('./routes/courses')
const auth = require('./routes/auth')

const app = express();

//Body parser
app.use(express.json())

//cookie parser
app.use(cookieParser())
//Dev logging middleware
if(process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}

//File uploading
app.use(fileupload())

//Set static folder
app.use(express.static(path.join(__dirname, 'public')))
console.log(path.join(__dirname, 'public'))
//Mount routers
app.use('/api/v1/bootcamps', bootcamps)
app.use('/api/v1/courses', courses)
app.use('/api/v1/auth', auth)
app.use(errorHandler)

const PORT = process.env.PORT || 5000

const server = 
app.listen(PORT, () => [
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold)
])

//Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`.red)
    //Close server and exit process
    server.close(() => process.exit(1))
} )