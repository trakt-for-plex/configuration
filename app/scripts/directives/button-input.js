'use strict';

angular.module('configurationApp')
  .directive('coButtonInput', function($timeout) {
    return {
      restrict: 'E',
      scope: {
        callback: '=',

        placeholder: '@',
        title: '@'
      },
      templateUrl: 'directives/button-input.html',
      transclude: true,

      controller: function($scope) {
        $scope.opened = false;
        $scope.value = null;

        $scope.click = function() {
          if(!$scope.opened) {
            $scope.opened = true;

            $timeout(function() {
              $scope.input.focus();
            }, 100);
            return;
          }

          $scope.button.start();
          $scope.opened = false;

          $scope.callback($scope.value).then(function() {
            $scope.button.stop();
          }, function() {
            $scope.button.stop();
          });

          $scope.value = null;
        };
      },
      link: function(scope, element) {
        scope.button = Ladda.create($('button', element)[0]);
        scope.input = $('input', element);
      }
    };
  });
