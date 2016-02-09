var app = angular.module('OddsController', []);

app.controller('OddsController', ['$scope', 'OddsService', 'TeamService', 'usSpinnerService', function($scope, OddsService, TeamService, usSpinnerService)
	{
		$scope.teams = [];

		TeamService.getTeams().then(function(response) {
			$scope.teams = response.data;
		});

		$scope.tagline = "instantly get projected odds for any five-man roster using modified glicko2 rankings.";
		$scope.messageColor = '#424242';
		$scope.t1color = '#424242';
		$scope.t2color = '#424242'
		$scope.message = 'why don\'t you generate some odds?';

		$scope.res = 0;

		$scope.update = function()
		{
			if($scope.team1)
			{
				$scope.t1p0 = $scope.team1.players[0];
				$scope.t1p1 = $scope.team1.players[1];
				$scope.t1p2 = $scope.team1.players[2];
				$scope.t1p3 = $scope.team1.players[3];
				$scope.t1p4 = $scope.team1.players[4];
			}
			if($scope.team2)
			{
				$scope.t2p0 = $scope.team2.players[0];
				$scope.t2p1 = $scope.team2.players[1];
				$scope.t2p2 = $scope.team2.players[2];
				$scope.t2p3 = $scope.team2.players[3];
				$scope.t2p4 = $scope.team2.players[4];
			}
		}

	    $scope.startSpin = function() {
	        usSpinnerService.spin('spinner-1');
	    };

	    $scope.stopSpin = function() {
	        usSpinnerService.stop('spinner-1');
	    };

		$scope.getOdds = function()
		{
			$scope.startSpin();
			var t1 = [$scope.t1p0, $scope.t1p1, $scope.t1p2, $scope.t1p3, $scope.t1p4];
			var t2 = [$scope.t2p0, $scope.t2p1, $scope.t2p2, $scope.t2p3, $scope.t2p4];

			OddsService.getOdds(t1, t2).then(function(response) {
				var odds = response.data.bo1 * 100;
				if(odds > 50) {
					$scope.message = 'Team 1 (' + response.data.t1rating.toFixed(2) + ')  is favored and has a projected ' + (response.data.bo1 * 100).toFixed(2)
					+ '% chance of winning a Bo1, ' + (response.data.bo3 * 100).toFixed(2) + '% chance of winning a Bo3, and ' + (response.data.bo5 * 100).toFixed(2)
					+ '% chance of winning a Bo5 over Team 2 (' + response.data.t2rating .toFixed(2)+ ') .';
					$scope.res = 1;
					$scope.messageColor = '#424242';
					$scope.t1color = 'green';
					$scope.t2color = 'red';

					if(response.data.players[$scope.t1p0])
						$scope.t1p0name = response.data.players[$scope.t1p0].name;
					else
						$scope.t1p0name = '';
					$scope.t1p1name = response.data.players[$scope.t1p1].name;
					$scope.t1p2name = response.data.players[$scope.t1p2].name;
					$scope.t1p3name = response.data.players[$scope.t1p3].name;
					$scope.t1p4name = response.data.players[$scope.t1p4].name;
					$scope.t2p0name = response.data.players[$scope.t2p0].name;
					$scope.t2p1name = response.data.players[$scope.t2p1].name;
					$scope.t2p2name = response.data.players[$scope.t2p2].name;
					$scope.t2p3name = response.data.players[$scope.t2p3].name;
					$scope.t2p4name = response.data.players[$scope.t2p4].name;
				}
				else if(odds < 50) {
					$scope.message = 'Team 2 (' + response.data.t2rating.toFixed(2) + ') is favored and has a projected ' + ((1 - response.data.bo1) * 100).toFixed(2)
					+ '% chance of winning a Bo1, ' + ((1 - response.data.bo3) * 100).toFixed(2) + '% chance of winning a Bo3, and ' + ((1 - response.data.bo5) * 100).toFixed(2)
					+ '% chance of winning a Bo5 over Team 1 (' + response.data.t1rating.toFixed(2) + ').';
					$scope.res = -1;
					$scope.messageColor = '#424242';
					$scope.t1color = 'red';
					$scope.t2color = 'green'

					$scope.t1p0name = response.data.players[$scope.t1p0].name;
					$scope.t1p1name = response.data.players[$scope.t1p1].name;
					$scope.t1p2name = response.data.players[$scope.t1p2].name;
					$scope.t1p3name = response.data.players[$scope.t1p3].name;
					$scope.t1p4name = response.data.players[$scope.t1p4].name;
					$scope.t2p0name = response.data.players[$scope.t2p0].name;
					$scope.t2p1name = response.data.players[$scope.t2p1].name;
					$scope.t2p2name = response.data.players[$scope.t2p2].name;
					$scope.t2p3name = response.data.players[$scope.t2p3].name;
					$scope.t2p4name = response.data.players[$scope.t2p4].name;
				}
				else if(odds == 50){
					$scope.message = 'Too close to call!';
					$scope.res = 0;
					$scope.messageColor = '#424242';
					$scope.t1color = '#424242';
					$scope.t2color = '#424242'

					$scope.t1p0name = response.data.players[$scope.t1p0].name;
					$scope.t1p1name = response.data.players[$scope.t1p1].name;
					$scope.t1p2name = response.data.players[$scope.t1p2].name;
					$scope.t1p3name = response.data.players[$scope.t1p3].name;
					$scope.t1p4name = response.data.players[$scope.t1p4].name;
					$scope.t2p0name = response.data.players[$scope.t2p0].name;
					$scope.t2p1name = response.data.players[$scope.t2p1].name;
					$scope.t2p2name = response.data.players[$scope.t2p2].name;
					$scope.t2p3name = response.data.players[$scope.t2p3].name;
					$scope.t2p4name = response.data.players[$scope.t2p4].name;
				}
				else
				{
					$scope.message = 'Please verify you have entered ten valid, distinct player IDs.';
					$scope.messageColor = 'red';
					$scope.t1color = '#424242';
					$scope.t2color = '#424242'

					$scope.t1p0name = '';
					$scope.t1p1name = '';
					$scope.t1p2name = '';
					$scope.t1p3name = '';
					$scope.t1p4name = '';
					$scope.t2p0name = '';
					$scope.t2p1name = '';
					$scope.t2p2name = '';
					$scope.t2p3name = '';
					$scope.t2p4name = '';
				}
				
				$scope.stopSpin();
			});
		}
	}]
);
