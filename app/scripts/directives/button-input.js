'use strict';

angular.module('configurationApp')
  .directive('coButtonInput', function($timeout) {
    return {
      restrict: 'E',
      scope: {
        callback: '=coCallback',

        placeholder: '@coPlaceholder',
        tooltip: '@coTooltip'
      },
      templateUrl: 'directives/button-input.html',
      transclude: true,

      controller: function($scope) {
        $scope.opened = false;
        $scope.value = null;

        $scope.click = function() {
          if(!$scope.opened) {
            $scope.open();
            return;
          }

          $scope.button.start();

          $scope.callback($scope.value).then(function() {
            $scope.close();
            $scope.button.stop();
          }, function(error) {
            $scope.error = error;

            $scope.button.stop();
          });
        };

        $scope.open = function() {
          $scope.opened = true;

          $timeout(function() {
            $scope.input.focus();
          }, 100);
        };

        $scope.close = function() {
          $scope.error = null;
          $scope.opened = false;
          $scope.value = null;
        };

        $scope.keyup = function(event) {
          if(event.keyCode === 13) {
            // ENTER
            $scope.click()
          } else if(event.keyCode === 27) {
            // ESC
            $scope.close();
          }
        };
      },
      link: function(scope, element) {
        scope.button = Ladda.create($('button', element)[0]);
        scope.input = $('input', element);
      }
    };
  });
