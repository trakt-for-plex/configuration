'use strict';

angular.module('configurationApp')
  .directive('coAuthenticationPlex', function(Utils, $modal, $rootScope) {
    return {
      restrict: 'E',
      scope: {
        account: '=coAccount',
        plex: '=coPlex'
      },
      templateUrl: 'directives/authentication/plex.html',

      controller: function($scope, $timeout) {
        $scope._state = null;

        $scope.isAuthenticated = function() {
          return !!(
            Utils.isDefined($scope.plex.title) &&
            $scope.plex.title.length !== 0
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

        $scope.disconnect = function() {
          // Create new scope for modal
          var scope = $scope.$new(true);
          scope.account = $scope.account;
          scope.username = $scope.plex.title;

          // Create modal
          var modal = $modal.open({
            templateUrl: 'modals/disconnectAccount.html',
            windowClass: 'small',
            scope: scope
          });

          // Display modal, wait for result
          return modal.result.then(function() {
            // Delete plex account on server
            return $scope.plex.delete($rootScope.$s).then(function() {
              $rootScope.$broadcast('account.plex.deleted');
            });
          });
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

        // Watch for account changes
        $scope.$watch(
          function(scope) { return scope.plex; },
          function() {
            $scope._state = null;

            // Broadcast events
            $scope.$broadcast('reset');

            $timeout(function() {
              $scope.$broadcast('activate');
            });
          }
        );
      }
    };
  });
