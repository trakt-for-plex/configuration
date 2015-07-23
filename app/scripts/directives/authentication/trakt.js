'use strict';

angular.module('configurationApp')
  .directive('coAuthenticationTrakt', function() {
    return {
      restrict: 'E',
      scope: {
        trakt: '=coTrakt'
      },
      templateUrl: 'directives/authentication/trakt.html'
    };
  });
