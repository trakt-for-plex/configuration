'use strict';

angular.module('configurationApp')
  .directive('coAuthenticationTrakt', function() {
    return {
      restrict: 'E',
      scope: {
        authorization: '=coAuthorization'
      },
      templateUrl: 'directives/authentication/trakt.html'
    };
  });
