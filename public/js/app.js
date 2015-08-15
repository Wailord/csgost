angular.module('csghost', ['ngRoute', 'appRoutes', 'MainController', 'MatchService']).filter('reverse', function() {
  return function(items) {
    return items.slice().reverse();
  };
});