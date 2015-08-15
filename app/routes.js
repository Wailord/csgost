var Match = require('./models/match');
var path = require('path');

module.exports = function(app)
{
	app.post('/api/matches', function(req, res) 
	{
		var days = req.body.days;
		var mapsParam = req.body.maps;
		var teamsOr = req.body.teams_or;
		var teamsAnd = req.body.teams_and;

		console.log('received a query');

		var acceptedParams = 0;

		var query = Match.find();

		if(days)
		{
			var seconds = (days) * 3600 * 24;
			var today = Math.floor(Date.now() / 1000);
			
			days = today - seconds;
			query = query.where('date').gt(days);
			acceptedParams++;
		}

		if(mapsParam)
		{ 
			var maps = mapsParam
			query = query.where('map').in(maps);
			acceptedParams++;
		}

		if(teamsOr)
		{
			var teams = teamsOr;
			console.log('teams = ' + teams[0] + ', ' + teams[1]);
			query = query.or([{"team1.name": {$in: teams}}, {"team2.name": {$in: teams}}]);
			acceptedParams++;
		}

		if(teamsAnd)
		{
			var teams = teamsAnd;
			query = query.and([{"team1.name": {$in: teams}}, {"team2.name": {$in: teams}}]);
			acceptedParams++;
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