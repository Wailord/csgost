var request = require('request');
	cheerio = require('cheerio');
	sleep = require('sleep');

var hltvparser = module.exports = {};

hltvparser.runScraper = function()
{
	// while you can get HLTV pages
	var pageNum = 0;
	var moreData = true;
	while(moreData)
	{
		var page = getHLTVPage(pageNum);
		//var matches = parseHLTVPage(page);
		//matches.forEach(function(match)) {
			//var match = parseHLTVMatch();
			//updateMatchInDatabase(match);
			//match.team1.players.forEach(function(player)) {
			//	updatePlayerInDatabase(player);
			//}
			//match.team2.players.forEach(function(player)) {
			//	updatePlayerInDatabase(player);
			//}
		//}

		pageNum++;
		if(pageNum > 0) moreData = false; 
	}
};

var getHLTVPage = function(pageNum) {
	var url = 'http://www.hltv.org/?pageid=188&offset=' + (pageNum * 50);

	var parsedMatches = [];

	request(url, function(err, response, html) {
		if(!err) {
			var $ = cheerio.load(html);
			var matches = $('div .covSmallHeadline');
			var x;
			for(x = 6; x < (matches.length); x += 5)
			{
				var dateLink = $(matches[x]);
				var matchURL = 'http://www.hltv.org' + dateLink.parent().attr('href');
				var date = dateLink.text();
				var matchID = matchURL.substring(matchURL.lastIndexOf('=') + 1);

				var match = parseHLTVMatch(matchID);
				//match.date = date;
				console.log(JSON.stringify(match, null, 2));

				parsedMatches.push(match);
			}
		}
		else
		{
			console.log("Error accessing match list page: " + pageNum);
		}
	}
)}

var parseHLTVMatch = function(hltvMatchID) {
	var hltvMatchURL = 'http://www.hltv.org/?pageid=188&matchid=' + hltvMatchID;

	request(hltvMatchURL, function(err, response, html) {
		if(!err) {
			console.log('parsing ' + hltvMatchURL);

			var match = {};
			var matchEvent = {};
			var team1 = {};
			var team1players = [];
			var team2 = {};
			var team2players = [];

			var $ = cheerio.load(html);
			var matches = $('div .covSmallHeadline');
			var x;

			var team1id = "";
			var team1name = "";
			var team1URL = "";
			var team2score = "";

			var team2id = "";
			var team2name = "";
			var team2URL = "";
			var team2score = "";

			var eventname = "";
			var eventurl = "";
			var eventid = "";
			
			// get all match info

			// 1 = team1 vs team2
			var split = $(matches[1]).text().indexOf(' vs  ');
			team1name = $(matches[1]).text().substring(1, split);
			team1URL = $(matches[1]).children().attr('href');
			team1id = team1URL.substring(team1URL.lastIndexOf('=') + 1);
			team1.id = team1id;
			team1.name = team1name;
			team1.url = 'http://www.hltv.org' + team1URL;
			
			team2name = $(matches[1]).text().substring(split + 5);
			team2URL = $(matches[1]).children().next().attr('href');
			team2id = team2URL.substring(team2URL.lastIndexOf('=') + 1);
			team2.id = team2id;
			team2.name = team2name;
			team2.url = 'http://www.hltv.org' + team2URL;
			
			// 3 = map name
			var map = $(matches[3]).text();

			// 5 = event name
			eventname = $(matches[5]).children().attr('title');
			eventurl = $(matches[5]).children().children().attr('href');
			eventid = eventurl.substring(eventurl.lastIndexOf('=') + 1);
			matchEvent.id = eventid;
			matchEvent.name = eventname;
			matchEvent.url = 'http://www.hltv.org' + eventurl;

			// 7 = score
			var team1score = $(matches[7]).children().text();
			var team2score = $(matches[7]).children().next().text();

			var t1half1 = {};
			var t1h1s = $(matches[7]).children().next().next().text();
			t1half1.score = t1h1s;

			var t2half1 = {};
			var t2h1s = $(matches[7]).children().next().next().next().text();
			t2half1.score = t2h1s;

			var t1half2 = {};
			var t1h2s = $(matches[7]).children().next().next().next().next().text();
			t1half2.score = t1h2s;

			var t2half2 = {};
			var t2h2s = $(matches[7]).children().next().next().next().next().next().text();
			t2half2.score = t2h2s;

			var t1ot = {};
			var team1ot = $(matches[7]).children().next().next().next().next().next().next().next().text();
			t1ot.score = team1ot;

			var t2ot = {};
			var team2ot = $(matches[7]).children().next().next().next().next().next().next().next().next().text();
			t2ot.score = team2ot;

			team1halves.push(t1half1);
			team1halves.push(t1half2);
			team1halves.push(t1ot);

			team2halves.push(t2half1);
			team2halves.push(t2half2);
			team2halves.push(t2ot);

			// assign the general data we got above to our match object
			team1.halves = team1halves;
			team2.halves = team2halves;
			match.event = matchEvent;
			match.map = map;
			match.team1 = team1;
			match.team2 = team2;

			// get all player info
			for(x = 34; x < (matches.length); x += 8)
			{
				var player = {};

				var playerelement = $(matches[x]);
				var teamelement = $(matches[x+1]);
				var killelement = $(matches[x+2]);
				var assistelement = $(matches[x+3]);
				var deathelement = $(matches[x+4]);

				var playerName = playerelement.text().substring(1);
				var playerURL = 'http://www.hltv.org' + playerelement.children().next().attr('href');
				var playerTeam = teamelement.text();

				var playerKillHS = killelement.text();
				var lastParen = playerKillHS.lastIndexOf('(');
				var playerHeadshots = playerKillHS.substring(lastParen + 1);
				playerHeadshots = playerHeadshots.substring(0, playerHeadshots.length - 1);
				if(playerHeadshots == "-")
					playerHeadshots = 0;

				var playerKills = playerKillHS.substring(0, lastParen - 1);
				if(playerKills == "-")
					playerKills = 0;

				var playerAssists = assistelement.text();
				if(playerAssists == "-")
					playerAssists = 0;

				var playerDeaths = deathelement.text();
				if(playerDeaths == "-")
					playerDeaths = 0;

				var playerID = playerURL.substring(playerURL.indexOf('&') + 10);

				player.ID = playerID;
				player.name = playerName;
				player.url = playerURL;
				player.kills = playerKills;
				player.headshots = playerHeadshots;
				player.assists = playerAssists;
				player.deaths = playerDeaths;
			
				if(playerTeam == team1name)
					team1players.push(player);
				else if(playerTeam == team2name)
					team2players.push(player);
				else
					console.log("error: player " + player.name + " on " + hltvMatchURL + " not playing for either of the provided teams");				
			}

			match.id = hltvMatchID;
			match.map = map;
			match.url = hltvMatchURL;
			match.team1.players = team1players;
			match.team2.players = team2players;
			sleep.sleep(2);

			return match;
		}
		else
		{
			console.log("Error accessing match page: " + hltvMatchURL);
		}
	})
}

var parseHLTVPlayer = function(hltvPlayer) {

}

var updatePlayerInDatabase = function(player) {

}

var updateMatchInDatabase = function(player) {

}
