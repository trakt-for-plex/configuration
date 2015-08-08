'use strict';

angular.module('configurationApp')
  .directive('coAuthenticationTabs', function(Utils) {
    return {
      restrict: 'E',
      scope: {
        authentication: '=coAuthentication'
      },
      templateUrl: 'directives/authentication/tabs.html',

      controller: function($scope) {
        $scope.selected = 'trakt';

        $scope.select = function(key) {
          $scope.selected = key;
        }
      }
    };
  });
