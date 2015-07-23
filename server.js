var express = require('express'),
	matches = require('./routes/matches');

var app = express();

app.get('/matches', matches.findMatches);

app.listen(3000);

console.log('Listening on port 3000...');