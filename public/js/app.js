angular.module('csgost', ['ngRoute', 'appRoutes', 'MainController', 'OddsController', 'TeamLeaderboardController', 'MatchService', 'OddsService', 'TeamService']).filter('reverse', function() {
  return function(items) {
  	if(!items || !items.length) return;
    return items.slice().reverse();
  };
});