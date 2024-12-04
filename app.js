require('dotenv').config();

const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const cookieParser = require('cookie-parser');
const sessions = require('express-session');
const MongoStore = require('connect-mongo');

const connectDB = require('./server/config/db');
const {isActiveRoute} = require('./server/helpers/routeHelpers');

const app = express();

// Correct PORT setup
const PORT = process.env.PORT || 8080;


//connection
connectDB();

// Middleware
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true })); //new
app.use(express.json());
app.use(cookieParser());
app.use(sessions({
    secret: 'keyboard cat',
    resave:false,
    saveUninitialized:true,
    store: MongoStore.create({
        mongoUrl:process.env.MONGODB_URI
    })
}))
// Template Engine Setup
app.use(expressLayouts);
app.set('layout', './layouts/main');  // Corrected path
app.set('view engine', 'ejs');        // Corrected syntax



app.locals.isActiveRoute = isActiveRoute;

// Routes
app.use('/', require('./server/routes/main'));
app.use('/', require('./server/routes/admin'));

// Start server
app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
});