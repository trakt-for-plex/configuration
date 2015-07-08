'use strict';

angular.module('configurationApp')
  .directive('coAuthenticationPlex', function() {
    return {
      restrict: 'E',
      scope: {
        authorization: '=coAuthorization'
      },
      templateUrl: 'directives/authentication/plex.html'
    };
  });
