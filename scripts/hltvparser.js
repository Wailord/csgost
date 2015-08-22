var request = require('request');
	cheerio = require('cheerio');
	Match = require('../app/models/match');
	MatchSummary = require('../app/models/match_summary');
	async = require('async');
	lupus = require('lupus');

var hltvparser = module.exports = {};

hltvparser.runScraper = function()
{
	var page_queue = async.queue(function (pg, callback) {
		scrapeHLTVPage(pg);
		callback();
	}, 1);
	
	lupus(0, 105, function(x) {
		page_queue.push(x);
	});
};

var scrapeHLTVPage = function(pageNum) {
	var url = 'http://www.hltv.org/results/' + (pageNum * 50) + '/';

	var req = request(url, function(err, response, html) {
		if(!err) {
			//console.log('scraping page #' + pageNum);
			var $ = cheerio.load(html);
			var matches = $('a[title="Match page"]');
			var match_queue = async.queue(function (u, callback) {
				getMatchInfo(u);
				callback();
			}, 1);

			lupus(0, matches.length, function(x) {
				var matchurl = 'http://www.hltv.org' + $(matches[x]).attr('href');
				match_queue.push(matchurl);
				//console.log('pushed ' + matchurl);
			});
		}
		else
		{
			console.log("Error accessing match list page: " + pageNum + ". Requeuing.");
			scrapeHLTVPage(pageNum);
		}
	})
	req.end();
}

var getMatchInfo = function(hltvMatchURL) {
	if(hltvMatchURL == 'http://www.hltv.org/match/') return;
	var matchid = hltvMatchURL.substring(hltvMatchURL.lastIndexOf('/') + 1, hltvMatchURL.indexOf('-'));
	Match.find({id : matchid}, function (err, docs) {
		if(err)
			console.log('Mongo error: ' + err);
        else if (!docs.length) {
        	//console.log('found new match ' + matchid);
            var req = request(hltvMatchURL, function(err, response, html) {
				if(!err) {
					//console.log('loaded match ' + matchid);
					var $ = cheerio.load(html);

					// set up basic info; format, url, id
					var match = {};
					match.team1 = {};
					match.team2 = {};
					match.url = hltvMatchURL;
					var formatInfo = $("div .hotmatchbox");
					var formatString = $(formatInfo[0]).children().text().trim();
					var loc = formatString.indexOf('Best of ');
					formatString = formatString.substring(loc + 8, loc + 9);
					match.format = formatString;
					match.id = matchid;

					getDateInfo(hltvMatchURL, getTeamInfo, $, match);
				}
				else {		
					console.log("Error accessing match page: " + hltvMatchURL + ". Requeueing.");
					getMatchInfo(hltvMatchURL);
				}
			});
			req.end();
		}
	    else {                
		    //console.log('match ' + matchid + ' exists');
    	}
    })
};

var getDateInfo = function (hltvMatchURL, getTeamInfo, $, match)
{
	//console.log('getting date info for ' + match.id);
	var headerInfo = $('div[style="text-align:center;font-size: 18px;"]');

	var dateInfo = $(headerInfo[0]);
	
	// drill down to date; remove extra info from string, then parse it out
	var dateString = dateInfo.children().text().replace(" of", "").replace("th", "").replace("1st", "1").replace("2nd", "2");
	var day = dateString.substring(0, dateString.indexOf(" "));
	var monthName = dateString.substring(dateString.indexOf(" ") + 1, dateString.lastIndexOf(" "));
	var myDate = new Date(monthName + " 1, 2000");
	var monthDigit = myDate.getMonth();
	var month = monthDigit + 1;
	if(month < 10)
		month = '0' + month;
	var year = dateString.substring(dateString.lastIndexOf(" ") + 1);
	var timeInfo = dateInfo.text();
	var timeString = timeInfo.substring(timeInfo.lastIndexOf(" ") + 1) + ':00'; 
	var dateString = year + '-' + month + '-' + day + 'T' + timeString;
	
	var matchDate = new Date(dateString);
	match.date = matchDate;

	getTeamInfo(getEventInfo, $, match);
}

var getTeamInfo = function (getEventInfo, $, match)
{
	//console.log('getting team info for ' + match.id);
	var team1 = {};
	var team2 = {};
	team1.players = {};
	team2.players = {};

	var teams = $('a[class="nolinkstyle"]');
	var t1url = 'http://www.hltv.org' + $(teams[0]).attr('href')
	var t1name = $(teams[0]).text();
	var t1id = t1url.substring(t1url.indexOf('teamid=') + 7, t1url.lastIndexOf('&')); 
	var t2url = 'http://www.hltv.org' + $(teams[1]).attr('href')
	var t2name = $(teams[1]).text();
	var t2id = t2url.substring(t2url.indexOf('teamid=') + 7, t2url.lastIndexOf('&')); 

	team1.url = t1url;
	team1.name = t1name;
	team1.id = t1id;
	team2.url = t2url;
	team2.name = t2name;
	team2.id = t2id;

	getEventInfo(getAllMapInfo, $, match, team1, team2);
}

var getEventInfo = function (getAllMapInfo, $, match, team1, team2)
{
	var matchEvent = {};

	var headerInfo = $('div[style="text-align:center;font-size: 18px;"]');
	var eventInfo = $(headerInfo[2]);
	var eventurl = 'http://www.hltv.org' + eventInfo.children().attr('href');
	var eventname = eventInfo.text();
	var eventid = eventurl.substring(eventurl.lastIndexOf('=') + 1);
	matchEvent.url = eventurl;
	matchEvent.name = eventname;
	matchEvent.id = eventid;
	match.event = matchEvent;

	getAllMapInfo(checkMapLinks, match, $, team1, team2);
}

var getAllMapInfo = function(checkMapLinks, match, $, team1, team2)
{
	//console.log('checking maps in match for ' + match.id);
	var mapsInMatch = $('div[style="border: 1px solid darkgray;border-radius: 5px;width:280px;height:28px;margin-bottom:3px;"]');
	var numMaps = mapsInMatch.length;
	lupus(0, mapsInMatch.length, function(x) {
		// score info
		var thisMap = $(mapsInMatch[x]);
		var scoreline = thisMap.next().find('span');
		var players = {};

		// map info
		var mapurl = thisMap.children().attr('src');
		var mapname = mapurl.substring(mapurl.lastIndexOf('/') + 1, mapurl.lastIndexOf('.'));
		if(scoreline.length > 0 && mapname != 'default')
		{
			// if we found a map without a score, it didn't happen
			// if we get to here the map happened
			var t1score = $(scoreline[0]).text();
			var t2score = $(scoreline[1]).text();

			var t1startCT = $(scoreline[2]).attr('style') == 'color: blue';

			// split up the scores by half for fun data analysis later
			var t1halves = [];
			var t2halves = [];

			var t1h1 = {};
			t1h1.score = $(scoreline[2]).text();
			var t1h2 = {};
			t1h2.score = $(scoreline[4]).text();

			var t2h1 = {};
			t2h1.score = $(scoreline[3]).text();
			var t2h2 = {};
			t2h2.score = $(scoreline[5]).text();

			// once we know if team 1 started CT, we can say who played
			// which side for the rest of the roudns
			if(t1startCT)
			{
				t1h1.side = "ct";
				t1h2.side = "t";
				t2h1.side = "t";
				t2h2.side = "ct";
			}
			else
			{
				t1h1.side = "t";
				t1h2.side = "ct";
				t2h1.side = "ct";
				t2h2.side = "t";						
			}

			// add the created halves to the array of halves
			t1halves.push(t1h1);
			t1halves.push(t1h2);
			t2halves.push(t2h1);
			t2halves.push(t2h2);

			// if overtime info is available, grab it
			var scorestring = thisMap.next().text();
			if(scorestring.indexOf('(') != scorestring.lastIndexOf('('))
			{
				var t1ot = {};
				var t2ot = {};
				var t1otscore = scorestring.substring(scorestring.lastIndexOf('(') + 1, scorestring.lastIndexOf(':'));
				var t2otscore = scorestring.substring(scorestring.lastIndexOf(':') + 1, scorestring.lastIndexOf(')'))
				t1ot.score = t1otscore;
				t2ot.score = t2otscore;
				t1ot.side = "ot";
				t2ot.side = "ot";

				t1halves.push(t1ot);
				t2halves.push(t2ot);
			}

			// assign the halves back to the team dictionaries
			team1.halves = t1halves;
			team2.halves = t2halves;
			team1.score = t1score;
			team2.score = t2score;

			// finally, we can comfortably hook our created team to our match
			match.team1 = team1;
			match.team2 = team2;

			match.map = mapname;

		(function(insertMatchInDatabase, match, $, x) {
			checkMapLinks(insertMatchInDatabase, match, $, x);
		})(insertMatchInDatabase, match, $, x);
	}
	});
};

var checkMapLinks = function (insertMatchInDatabase, match, $, x)
{
	//console.log('checking map links for ' + match.id);
	// ============================== GET INFORMATION FOR EACH PLAYER ============================== //
	// if there isn't a match stats page, there's no player stat data to harvest
	var maplinks = $('span[id*="map_link"]');
	var id = $(maplinks[x]).attr('id');
	if(typeof id != "undefined") {
		id = id.substring(id.lastIndexOf('_') + 1);
		getFullPlayerInfo(id, match.team1.name, match.team2.name, insertMatchInDatabase, match);
	}
	else {
		match.team1.players = [];
		match.team2.players = [];
		getPlayerInfo(id, match, insertMatchInDatabase, $);
	}
}

var getFullPlayerInfo = function(statID, team1name, team2name, insertMatchInDatabase, match) {
	//console.log('getting full player stats for ' + match.id);
	var hltvMatchURL = 'http://www.hltv.org/?pageid=188&matchid=' + statID;
	var req = request(hltvMatchURL, function(err, response, html) {
		if(!err) {
			var $ = cheerio.load(html);
			var matches = $('div .covSmallHeadline');
			var team1players = [];
			var team2players = [];
			lupus(0, (matches.length - 34) / 8, function(x) {
				var player = {};
				var playerelement = $(matches[x * 8 + 34]);
				var teamelement = $(matches[x* 8+1 + 34]);
				var killelement = $(matches[x* 8+2 + 34]);
				var assistelement = $(matches[x* 8+3 + 34]);
				var deathelement = $(matches[x* 8+4 + 34]);

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

				if(typeof playerID != undefined)
				{
					player.id = playerID;
					player.name = playerName;
					player.url = playerURL;
				}

				player.kills = playerKills;
				player.headshots = playerHeadshots;
				player.assists = playerAssists;
				player.deaths = playerDeaths;
				
				if(playerTeam == team1name)
				{
					team1players.push(player);
				}
				else if(playerTeam == team2name)
				{
					team2players.push(player);
				}
			}, function()
			{
				match.team2.players = [];
				match.team1.players = [];
				match.team1.players = team1players;
				match.team2.players = team2players;

				insertMatchInDatabase(match);
			})
		}
		else
		{
			console.log('error loading page ' + hltvMatchURL);
		}
	});
	req.end();
}

var getPlayerInfo = function(id, match, insertMatchInDatabase, $) {
	//console.log('getting player info for ' + match.id);
	var players = $('div[style="background-color:white;width:105px;float:left;margin-left:4px;border: 1px solid rgb(189, 189, 189);border-radius: 5px;padding:2px;"]');
	var team1players = [];
	var team2players = [];

	lupus(0, 10, function (x) {
		var player = {};
		var playerurl = $(players[x]).children().next().attr('href');
		playerurl = 'http://www.hltv.org' + playerurl;
		var playername = $(players[x]).children().next().children().html();
		var playerid = playerurl.substring(playerurl.indexOf('playerid=') + 9, playerurl.lastIndexOf('&'));

		if(typeof playerid != undefined)
		{
			player.id = playerid;
			player.name = playername;
			player.url = playerurl;
		}

		if(x < 5)
			team1players.push(player);
		else
			team2players.push(player);
	}, function() {
		match.team1.players = team1players;
		match.team2.players = team2players;

		insertMatchInDatabase(match);
	});
}

var insertMatchInDatabase = function (match)
{
	// create match summary
	var match_summary = {};
	var team1 = {};
	var team2 = {};
	match_summary.date = match.date;
	match_summary.event = match.event;
	match_summary.id = match.id;
	match_summary.url = match.url;
	match_summary.team1 = {};
	match_summary.team2 = {};
	match_summary.team1.name = match.team1.name;
	match_summary.team1.url = match.team1.url;
	match_summary.team1.id = match.team1.id;
	match_summary.team1.score = match.team1.score;
	match_summary.team2.name = match.team2.name;
	match_summary.team2.url = match.team2.url;
	match_summary.team2.id = match.team2.id;
	match_summary.team2.score = match.team2.score;

	// insert full match
	var newMatch = new Match(match);
	var newMatchSummary = new MatchSummary(match_summary);

	console.log('attempting to insert a new match');
	newMatch.save(function (err, inserted) {
		if(err)
			console.log('Match ' + newMatch.id + ': ' + err);
		console.log('inserted ' + newMatch.id);
	});

	console.log('attempting to insert a new match summary');
	newMatchSummary.save(function (err, inserted) {
		if(err)
			console.log('Summary ' + newMatchSummary.id + ': ' + err);
		console.log('inserted summary for ' + newMatchSummary.id);
	});
}