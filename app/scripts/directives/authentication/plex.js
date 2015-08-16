'use strict';

angular.module('configurationApp')
  .directive('coAuthenticationPlex', function(Utils) {
    return {
      restrict: 'E',
      scope: {
        plex: '=coPlex'
      },
      templateUrl: 'directives/authentication/plex.html',

      controller: function($scope) {
        $scope._state = null;

        $scope.isAuthenticated = function() {
          return !!(
            Utils.isDefined($scope.plex.username) &&
            $scope.plex.username.length !== 0
          );
        };

        $scope.state = function(value) {
          if(Utils.isDefined(value)) {
            $scope._state = value;
            return;
          }

          if(!Utils.isDefined($scope.plex)) {
            // Not initialized yet
            return 'view';
          }

          if(!$scope.isAuthenticated()) {
            // Account hasn't been authenticated yet
            return 'edit';
          }

          if(Utils.isDefined($scope._state)) {
            return $scope._state;
          }

          return 'view';
        };

        $scope.switch = function(state) {
          $scope.state(state);
        };

        $scope.onAuthenticated = function(token, user) {
          $scope.plex.updateAuthorization(token, user);
          $scope.state('view');
        };

        $scope.onCancelled = function() {
          $scope.state('view');
        };
      }
    };
  });
