var Match = require('./models/match');
var path = require('path');

module.exports = function(app)
{
	app.post('/api/matches', function(req, res) 
	{
		var id = req.body.id;

		console.log('received a full query');

		var acceptedParams = 0;

		var query = Match.find();
		query = query.findOne({'id': id})

		query.exec(function (err, match)
		{
			if(err)
				res.status(400).send(err);
			else
			{
				res.setHeader('Content-Type','application/json');
				res.send(match);
			}
		});
	});

	app.post('/api/match_summaries', function(req, res) 
	{
		var days = req.body.days;
		var mapsParam = req.body.maps;
		var teamsOr = req.body.teams_or;
		var teamsAnd = req.body.teams_and;

		console.log('received a summary query, days = ' + days + ', maps = ' + mapsParam + ', teamsOr = ' + teamsOr);

		var acceptedParams = 0;

		var query = Match.find();

		if(days)
		{
			var milliseconds = days * 3600 * 1000 * 24;
			var today = Date.now();
			
			days = today - milliseconds;
			query = query.where('date').gt(days);
		}

		if(mapsParam)
		{ 
			var maps = mapsParam
			query = query.where('map').in(maps);
		}

		if(teamsOr)
		{
			var teams = teamsOr;
			query = query.or([{"team1.name": {$in: teams}}, {"team2.name": {$in: teams}}]);
		}

		if(teamsAnd)
		{
			var teams = teamsAnd;
			query = query.and([{"team1.name": {$in: teams}}, {"team2.name": {$in: teams}}]);
		}

		query.exec(function (err, matches)
		{
			if(err)
				res.status(400).send(err);
			else
			{
				res.setHeader('Content-Type','application/json');
				res.send(matches);
			}
		});
	});

	// frontend routes =========================================================
    // route to handle all angular requests
    app.get('*', function(req, res)
    {
    	res.sendFile(path.join(__dirname, '../public/views', 'index.html'));
    });
}