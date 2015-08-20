var request = require('request');
	cheerio = require('cheerio');
	sleep = require('sleep');
	Match = require('../app/models/match');
	MatchSummary = require('../app/models/match_summary');
	async = require('async');
	lupus = require('lupus');

var hltvparser = module.exports = {};

hltvparser.runScraper = function()
{
	scrapeHLTVPage(0);
};

var scrapeHLTVPage = function(pageNum) {
	var url = 'http://www.hltv.org/results/' + (pageNum * 50) + '/';

	var parsedMatches = [];
	request(url, function(err, response, html) {
		if(!err) {
			//console.log('scraping page #' + pageNum);
			var $ = cheerio.load(html);
			var matches = $('a[title="Match page"]');
			lupus(0, matches.length, function(x) {
				scrapeHLTVMatch('http://www.hltv.org' + $(matches[x]).attr('href'));
			});
		}
		else
		{
			console.log("Error accessing match list page: " + pageNum + ". Requeuing.");
			sleep.sleep(4);
			scrapeHLTVPage(pageNum);
		}
	})

	return parsedMatches;
}

var scrapeHLTVMatch = function(hltvMatchURL) {

	if(hltvMatchURL == 'http://www.hltv.org/match/') return;
	request(hltvMatchURL, function(err, response, html) {
		if(!err) {
			// ============================== SET UP STUFF WE'RE GOING TO USE ============================== //
			var $ = cheerio.load(html);
			var match = {};

			// ============================== GET ID AND DATE INFORMATION ============================== //
			var matchid = hltvMatchURL.substring(hltvMatchURL.lastIndexOf('/') + 1, hltvMatchURL.indexOf('-'));
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
			match.id = matchid;

			// ============================== GET TEAM INFORMATION ============================== //
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

			// ============================== GET EVENT INFORMATION ============================== //
			var matchEvent = {};

			var eventInfo = $(headerInfo[2]);
			var eventurl = 'http://www.hltv.org' + eventInfo.children().attr('href');
			var eventname = eventInfo.text();
			var eventid = eventurl.substring(eventurl.lastIndexOf('=') + 1);
			matchEvent.url = eventurl;
			matchEvent.name = eventname;
			matchEvent.id = eventid;
			
			match.event = matchEvent;

			// ============================== GET INFORMATION FOR EACH MAP ============================== //
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

				}

				// ============================== GET INFORMATION FOR EACH PLAYER ============================== //
				// if there isn't a match stats page, there's no player stat data to harvest
				var maplinks = $('span[id*="map_link"]');
				if(maplinks.length != 0) {
					var id = $(maplinks[x]).attr('id');
					id = id.substring(id.lastIndexOf('_') + 1);
					players = getHLTVPlayersFromStatID(id, team1.name, team2.name);
					team1.players = players.team1;
					team2.players = players.team2;
				}
				else {
					team1.players = [];
					team2.players = [];
				}
			});
		}
		else {		
			console.log("Error accessing match page: " + hltvMatchURL + ". Requeuing.");
			scrapeHLTVMatch(hltvMatchURL);
		}
	})

	var getHLTVPlayersFromStatID = function(statID, team1name, team2name) {
		var hltvMatchURL = 'http://www.hltv.org/?pageid=188&matchid=' + statID;
		var result = {};
		request(hltvMatchURL, function(err, response, html) {
			if(!err) {
				var $ = cheerio.load(html);
				var matches = $('div .covSmallHeadline');
				var team1players = [];
				var team2players = [];
				console.log(statID);
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

					player.id = playerID;
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
				})

				result.team1 = {};
				result.team1 = team1players;
				result.team2 = {};
				result.team2 = team2players;
			}
			else
			{
				console.log('error loading page ' + hltvMatchURL);
			}
		})

		return result;
	}
}
