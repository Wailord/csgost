angular.module('csgost', ['ngRoute', 'appRoutes', 'MainController', 'OddsController', 'MatchService', 'OddsService']).filter('reverse', function() {
  return function(items) {
  	if(!items || !items.length) return;
    return items.slice().reverse();
  };
});