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

        $scope.state = function(value) {
          if(Utils.isDefined(value)) {
            $scope._state = value;
            return;
          }

          if(!Utils.isDefined($scope.trakt)) {
            // Not initialized yet
            return 'view';
          }

          if(!Utils.isDefined($scope.trakt.username) || $scope.trakt.username.length === 0) {
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

        $scope.onBasicAuthenticated = function() {
          $scope.$apply(function() {
            // Update account details
            $scope.trakt.basic.login();
            $scope.trakt.updateDetails();

            $scope.state('view');
          });
        };

        $scope.onPinAuthenticated = function(authorization, settings) {
          $scope.$apply(function() {
            // Update account details
            $scope.trakt.pin.updateAuthorization(authorization);
            $scope.trakt.updateDetails(settings);

            $scope.state('view');
          });
        };

        $scope.onCancelled = function() {
          $scope.state('view');
        };
      }
    };
  });
