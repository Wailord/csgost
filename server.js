var express = require('express'),
	app = express();
	mongoose = require('mongoose');
	bodyParser = require('body-parser');
 	cron = require('cron');
	exec = require('child_process').exec;
	db = require('./config/db');
	port = process.env.PORT || 8080; 

// connect to the match database
mongoose.connect(db.url);

// server the public folder
app.use(express.static(__dirname + '/public'));

// start up the cron job to parse through HLTV
var scraper = cron.job('0 * * * * *', function ()
{
    exec('python ' + __dirname + '/scripts/parsehltv.py', function (err, stdout, stderr)
    	{
    		if(err)
    			console.log("ParseHLTV.py failed to run: " + err);
    		else if(stderr)
    			console.log("Error during ParseHLTV.py: " + stderr);
    		else if(stdout)
    			process.stdout.write("ParseHLTV.py ran successfully: " + stdout);
    	});
}); 
scraper.start();

// get all data/stuff of the body (POST) parameters
// parse application/json 
app.use(bodyParser.json()); 

// parse application/vnd.api+json as json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); 

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true })); 

// set the static files location /public/img will be /img for users
app.use(express.static(__dirname + '/public')); 

// routes ==================================================
require('./app/routes')(app); // configure our routes

// start app ===============================================
// startup our app at http://localhost:8080
app.listen(port);               

// shoutout to the user                     
console.log('Server now running on port ' + port);

// expose app           
exports = module.exports = app;                         