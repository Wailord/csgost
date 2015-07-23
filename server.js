var express = require('express'),
	matches = require('./routes/matches');
 	cron = require('cron');
	exec = require('child_process').exec;

var app = express();

app.get('/matches', matches.findMatches);

app.listen(8080);

console.log('starting up script to scrape hltv...');
console.log('starting up ' + __dirname + '/scripts/parsehltv.py');
var scraper = cron.job('0 * * * * *', function ()
{
    exec('python ' + __dirname + '/scripts/parsehltv.py', function (err, stdout, stderr)
    	{
    		if(err)
    			console.log("ParseHLTV.py failed to run: " + err);
    		else if(stderr)
    			console.log("Error during ParseHLTV.py: " + stderr);
    		else if(stdout)
    			console.log("ParseHLTV.py ran successfully: " + stdout);
    	});
}); 
scraper.start();

console.log('Listening on port 3000...');