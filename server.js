var express = require('express'),
	app = express();
	mongoose = require('mongoose');
	bodyParser = require('body-parser');
 	schedule = require('node-schedule');
    db = require('./config/db');
    hltvparser = require('./scripts/hltvparser');
	port = process.env.PORT || 8080;

// connect to the match database
var dbURL = process.env.MONGOLAB_URI || db.url;
mongoose.connect(dbURL);

// server the public folder
app.use(express.static(__dirname + '/public'));

// get all data/stuff of the body (POST) parameters
// parse application/json 
app.use(bodyParser.json()); 

// parse application/vnd.api+json as json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); 

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true })); 

// set the static files location /public/img will be /img for users
app.use(express.static(__dirname + '/public')); 


//var scraper = schedule.scheduleJob("*/2 * * * *",
//    function() {
//        hltvparser.runScraper();
//    });

hltvparser.runScraper();

// routes ==================================================
require('./app/routes')(app); // configure our routes

// start app ===============================================
// startup our app at http://localhost:8080
app.listen(port);               

// shoutout to the user                     
console.log('Server now running on port ' + port);

// expose app           
exports = module.exports = app;                         