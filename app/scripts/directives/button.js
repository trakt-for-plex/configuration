'use strict';

angular.module('configurationApp')
  .directive('coButton', function() {
    return {
      restrict: 'E',
      scope: {
        self: '=coSelf',
        callback: '=coCallback',

        class: '@coClass',
        tooltip: '@coTooltip'
      },
      templateUrl: 'directives/button.html',
      transclude: true,

      controller: function($scope) {
        $scope.call = function() {
          if(typeof $scope.self === 'undefined' || $scope.self === null) {
            return $scope.callback();
          }

          return $.proxy($scope.callback, $scope.self)();
        };

        $scope.click = function() {
          $scope.button.start();

          $scope.call().then(function() {
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

        if(scope.class === 'secondary') {
          $button.attr('data-spinner-color', '#333333');
        }

        scope.button = Ladda.create($button[0]);
      }
    };
  });
