var app = angular.module('MainController', []);
app.controller('MainController', function($scope, MatchService)
	{
		$scope.days = 7;
		$scope.map = 'any map';
	    $scope.tagline = 'Choose your parameters and get the requested history from HLTV\'s match listing.';

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

		$scope.team_a = 'any team';
		$scope.team_b = 'any team';

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

		$scope.getMatches = function()
		{
			MatchService.getMatches($scope.days, $scope.team_a, $scope.team_b, $scope.map)
				.then(function(response) {
						$scope.matches = response.data;
						console.log(response);
					},
					function(errorResponse) {
						$scope.resultText = "Error";
						console.log(errorResponse);
				});
		}
	}
);
