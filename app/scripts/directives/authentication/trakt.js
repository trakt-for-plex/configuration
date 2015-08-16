'use strict';

angular.module('configurationApp')
  .directive('coAuthenticationTrakt', function(Utils) {
    return {
      restrict: 'E',
      scope: {
        trakt: '=coTrakt'
      },
      templateUrl: 'directives/authentication/trakt.html',

      controller: function($scope) {
        $scope._state = null;

        $scope.isAuthenticated = function() {
          return !!(
            Utils.isDefined($scope.trakt.username) &&
            $scope.trakt.username.length !== 0
          );
        };

        $scope.state = function(value) {
          if(Utils.isDefined(value)) {
            $scope._state = value;
            return;
          }

          if(!Utils.isDefined($scope.trakt)) {
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
          // Change view state
          $scope.state(state);
        };

        $scope.onBasicAuthenticated = function() {
          // Clear messages
          $scope.messages = [];

          // Update account details
          $scope.trakt.basic.updateAuthorization();
          $scope.trakt.updateDetails();

          // Change view state
          $scope.state('view');
        };

        $scope.onPinAuthenticated = function(authorization, settings) {
          // Update account details
          $scope.trakt.pin.updateAuthorization(authorization);
          $scope.trakt.updateDetails(settings);

          // Change view state
          $scope.state('view');
        };

        $scope.onCancelled = function() {
          // Change view state
          $scope.state('view');
        };
      }
    };
  });
