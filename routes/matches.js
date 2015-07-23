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

exports.findById = function(req, res)
{
	var id = req.params.id;
	console.log('Retrieving match: ' + id);
	Match.findOne({'_id': id}, function (err, match)
	{
		if(err)
			res.send(err);
		else if(!match)
			res.status(404).send('Match not found.');
		else
			res.send(match);
	});
};