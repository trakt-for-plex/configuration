'use strict';

angular.module('configurationApp')
  .directive('coButton', function() {
    return {
      restrict: 'E',
      scope: {
        callback: '=coCallback',

        class: '@coClass',
        tooltip: '@coTooltip'
      },
      templateUrl: 'directives/button.html',
      transclude: true,

      controller: function($scope) {
        $scope.click = function() {
          $scope.button.start();

          $scope.callback().then(function() {
            $scope.button.stop();
          }, function() {
            $scope.button.stop();
          });
        };
      },
      link: function(scope, element) {
        var $button = $('button', element);

        $button.addClass(scope.class)
               .addClass('ladda-button');

        scope.button = Ladda.create($button[0]);
      }
    };
  });
