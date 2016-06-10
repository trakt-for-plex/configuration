'use strict';

angular.module('configurationApp')
  .directive('coConfigurationOption', function() {
    return {
      restrict: 'E',
      scope: {
        option: '='
      },
      template: '<ng-include src="getTemplateUrl()"/>',
      controller: function($scope) {
        var baseUrl = 'directives/configuration/option/',
          templateMap = {
            boolean:  'boolean.html',
            enum:     'enum.html',
            integer:  'integer.html',
            string:   'string.html'
          };

        $scope.descriptionOpened = false;

        $scope.getTemplateUrl = function() {
          return baseUrl + templateMap[$scope.option.type];
        };

        $scope.parseKey = function(id) {
          if(id === 'null') {
            return null;
          }

          // Try parse integer from string
          var number = parseInt(id, 10);

          if(!isNaN(number) && number.toString() === id) {
            return number;
          }

          // Return original string
          return id;
        };

        $scope.closeDescription = function() {
          $scope.descriptionOpened = false;
        };
        
        $scope.openDescription = function() {
          $scope.descriptionOpened = true;
        };
      }
    };
  });
