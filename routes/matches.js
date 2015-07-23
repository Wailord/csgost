var mongoose = require('mongoose');
var ObjectId = require('mongoose').Types.ObjectId; 

mongoose.connect('mongodb://localhost/hltv');

var db = mongoose.connection;

var eventSchema = mongoose.Schema({
	url: String,
	name: String,
});

var scoreSchema = mongoose.Schema({
	team_1: Number,
	team_2: Number,
});

var teamSchema = mongoose.Schema({
	url: String,
	name: String,
});

var matchSchema = mongoose.Schema({
	_id: String,
	map: String,
	url: String,
	date: Number,
	team1: [teamSchema],
	team2: [teamSchema],
	score: [scoreSchema],
	event: [eventSchema]
});

var Match = mongoose.model('Match', matchSchema);

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback)
{
	console.log("Successfully connected to 'hltv' database.")
});;



exports.findMatches = function(req, res)
{
	var days = req.query.days;
	if(days)
	{
		console.log("server received request for days = " + days + "...");
		var seconds = days * 3600 * 24;
		var today = Math.floor(Date.now() / 1000);
		days = today - seconds;

		var results = Match.find({date: {$gt: days}});

		console.log('using ' + days + ' as minimum time...');
		results.exec(function (err, matches)
		{
			if(err)
			{
				res.send(err);
			}
			else
			{
				res.setHeader('Content-Type','application/json');
				res.send(matches);
			}
		});
	}
	else
	{
		res.statusCode = 404;
		res.send('Days field required.')
	}
};