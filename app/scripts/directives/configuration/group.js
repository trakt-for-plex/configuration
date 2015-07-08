'use strict';

angular.module('configurationApp')
  .directive('coConfigurationGroup', function() {
    return {
      restrict: 'E',
      scope: {
        groups: '=coGroups'
      },
      templateUrl: 'directives/configuration/group.html'
    };
  });
