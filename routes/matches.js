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
	var mapsParam = req.query.maps;
	var teamsOr = req.query.teams_or;
	var teamsAnd = req.query.teams_and;
	
	var query = Match.find();

	if(days)
	{
		var seconds = days * 3600 * 24;
		var today = Math.floor(Date.now() / 1000);
		days = today - seconds;
		query = query.where('date').gt(days);
	}

	if(mapsParam)
	{ 
		var maps = mapsParam.split(",");
		query = query.where('map').in(maps);
	}

	if(teamsOr && !teamsAnd)
	{
		var teams = teamsOr.split(",");
		query = query.or([{"team1.name": {$in: teams}}, {"team2.name": {$in: teams}}]);
	}

	else if(teamsAnd && !teamsOr)
	{
		var teams = teamsAnd.split(",");
		var team1match = query.and([{"team1.name": {$in: teams}}, {"team2.name": {$in: teams}}]);
	}

	query.exec(function (err, matches)
	{
		if(err)
			res.send(err);
		else
		{
			res.setHeader('Content-Type','application/json');
			res.send(matches);
		}
	});
};