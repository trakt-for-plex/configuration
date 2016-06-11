'use strict';

angular.module('configurationApp')
  .directive('coConfigurationOption', function() {
    var descriptionBottomOffset = 20;

    return {
      restrict: 'E',
      scope: {
        option: '='
      },
      template: '<ng-include src="getTemplateUrl()"/>',
      controller: function($scope, $element) {
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
          $($element).css('top', '');

          $scope.descriptionOpened = true;
        };
      },
      link: function(scope, element, attrs) {
        var $description = null;

        $(element).hover(function() {
          if($description == null) {
            $description = $('.description', element);
          }

          var documentHeight = $(document).height();

          // Open description
          $description.addClass('visible');

          if($description.css('display') != 'block') {
            // Small screens (description is displayed in a modal)
            $description.removeClass('visible');
            return;
          }

          // Position description (ensure it is within the document height)
          var offset = $description.offset(),
              bottom = offset.top + $description.height() + descriptionBottomOffset,
              hidden = bottom - documentHeight;

          if(hidden > 0) {
            $description.css('top', (-hidden) + 'px');
          }
        }, function() {
          if($description == null) {
            $description = $('.description', element);
          }

          // Reset offset
          $description.css('top', '');

          // Close description
          $description.removeClass('visible');
        })
      }
    };
  });
