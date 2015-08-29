var app = angular.module('MainController', ['angularUtils.directives.dirPagination']);

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
app.controller('MainController', function($scope, MatchService)
	{
		$scope.days = 7;
		$scope.map = 'any map';
	    $scope.tagline = 'Choose your parameters below and get lightning-quick results from the HLTV database. Match data goes back to August of 2014.';
	    $scope.resultCount = -2;

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

		$scope.currentPage = 1;
		$scope.pageSize = 10;
		$scope.getMatches = function()
		{
	        if(!isNaN($scope.days) && isFinite($scope.days))
	        {
	        	var today = new Date();
	        	var minDate = today.setDate(today.getDate() - $scope.days);
				MatchService.getMatches(minDate, $scope.team_a, $scope.team_b, $scope.map)
					.then(function(response) {
							$scope.matches =
								response.data.sort(function(a, b) {
									return a.date - b.date;
								});
							$scope.resultCount = response.data.length;
							console.log(response);
						},
						function(errorResponse) {
							$scope.resultCount = -1;
							console.log(errorResponse);
					});
			}
		}
	}
);
