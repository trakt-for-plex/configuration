'use strict';

angular.module('configurationApp')
  .directive('coAuthenticationPlex', function() {
    return {
      restrict: 'E',
      scope: {
        plex: '=coPlex'
      },
      templateUrl: 'directives/authentication/plex.html'
    };
  });
