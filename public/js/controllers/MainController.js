var app = angular.module('MainController', ['angularUtils.directives.dirPagination', 'angularSpinner']);

app.directive('errSrc', function() {
  return {
    link: function(scope, element, attrs) {
      element.bind('error', function() {
        if (attrs.src != attrs.errSrc) {
          attrs.$set('src', attrs.errSrc);
        }
      });
    }
  }
});

app.controller('MainController', ['$scope', 'MatchService', 'usSpinnerService', function($scope, MatchService, usSpinnerService)
{
	$scope.days = 2;
	$scope.map = 'any map';
    $scope.tagline = 'Choose your parameters below and get lightning-quick results from the HLTV database. Match data goes back to August of 2014.';
    $scope.resultCount = -2;
    $scope.ran = false;

    $scope.startSpin = function() {
        usSpinnerService.spin('spinner-1');
    };

    $scope.stopSpin = function() {
        usSpinnerService.stop('spinner-1');
    };

    // these are intentionally hardcoded so it's not cluttered with hundreds of teams that don't exist
    $scope.teams = [
    	'NiP',
    	'fnatic',
    	'Virtus.pro',
    	'Natus Vincere',
    	'EnVyUs',
    	'Kinguin',
    	'Keyd Stars',
    	'Luminosity',
    	'Cloud9',
    	'Nihilum',
    	'CLG',
    	'Liquid',
    	'HellRaisers',
    	'mousesports',
    	'Tempo Storm',
    	'dignitas',
    	'Titan',
    	'affNity',
    	'GPlay',
    	'Acer',
    	'LGB',
    	'eLevate',
    	'FlipSid3',
    	'Gamers2',
    	'SK',
    	'Method',
    	'PENTA',
    	'ACE',
    	'x6tence',
    	'TSM'
	].sort(function (a, b) 
		{
			return a.toLowerCase().localeCompare(b.toLowerCase());	
		});
	$scope.teams.unshift('any team');

    $scope.maps = [
    	'cobblestone',
    	'overpass',
    	'nuke',
    	'cache',
    	'season',
    	'dust2',
    	'mirage',
    	'inferno',
    	'train'
	].sort(function (a, b) 
		{
			return a.toLowerCase().localeCompare(b.toLowerCase());	
		});
	$scope.maps.unshift('any map');  

	$scope.currentPage = 1;
	$scope.pageSize = 10;
	$scope.getMatches = function()
	{
		$scope.startSpin();
		$scope.statString = "";
        if(!isNaN($scope.days) && isFinite($scope.days))
        {
        	var today = new Date();
        	var minDate = today.setDate(today.getDate() - $scope.days);
			MatchService.getMatches(minDate, $scope.team_a, $scope.team_b, $scope.map)
				.then(function(response) {
						$scope.matches =
							response.data.sort(function(a, b) {
								return new Date(a.date) - new Date(b.date);
							});
						$scope.resultCount = response.data.length;

						if($scope.resultCount > 0)
						{
							if($scope.team_a != "any team")
							{
								// get team a stats
								var x;
								var gamesPlayed = 0;
								var gamesWon = 0;
								var gamesTied = 0;
								for(x = 0; x < $scope.resultCount; x++)
								{
									if(response.data[x].team1[0].name == $scope.team_a)
									{
										gamesPlayed++;
										if(response.data[x].team1[0].score > response.data[x].team2[0].score)
										{
											gamesWon++;
										}
										else if(response.data[x].team1[0].score == response.data[x].team2[0].score)
										{
											gamesTied++;
										}
									}
									else if(response.data[x].team2[0].name == $scope.team_a)
									{
										gamesPlayed++;
										if(response.data[x].team1[0].score < response.data[x].team2[0].score)
										{
											gamesWon++;
										}
										else if(response.data[x].team1[0].score == response.data[x].team2[0].score)
										{
											gamesTied++;
										}
									}
								}
								$scope.statString += $scope.team_a + ' went ' + gamesWon + '-' + (gamesPlayed - (gamesWon + gamesTied)) + '-' + gamesTied + ' (' + Math.round(gamesWon / gamesPlayed * 1000) / 10 + '%) in these matches. ';
							}
							if($scope.team_b != "any team")
							{
								gamesPlayed = 0;
								gamesWon = 0;
								gamesTied = 0;
								for(x = 0; x < $scope.resultCount; x++)
								{
									if(response.data[x].team1[0].name == $scope.team_b)
									{
										gamesPlayed++;
										if(response.data[x].team1[0].score > response.data[x].team2[0].score)
										{
											gamesWon++;
										}
										else if(response.data[x].team1[0].score == response.data[x].team2[0].score)
										{
											gamesTied++;
										}
									}
									else if(response.data[x].team2[0].name == $scope.team_b)
									{
										gamesPlayed++;
										if(response.data[x].team1[0].score < response.data[x].team2[0].score)
										{
											gamesWon++;
										}
										else if(response.data[x].team1[0].score == response.data[x].team2[0].score)
										{
											gamesTied++;
										}
									}
								}
								$scope.statString += $scope.team_b + ' went ' + gamesWon + '-' + (gamesPlayed - (gamesWon + gamesTied)) + '-' + gamesTied + ' (' + Math.round(gamesWon / gamesPlayed * 1000) / 10 + '%) in these matches. ';
							}
						}
						$scope.ran = true;
						$scope.stopSpin();
					},
					function(errorResponse) {
						$scope.resultCount = -1;
						console.log(errorResponse);
						$scope.ran = true;
						$scope.stopSpin();
				});
			}
		}
	}
	]);