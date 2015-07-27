'use strict';

/**
 * @ngdoc function
 * @name configurationApp.controller:LoginController
 * @description
 * # LoginController
 * Controller of the configurationApp
 */
angular.module('configurationApp')
  .controller('LoginController', function(Authentication, $location, $modal, $scope) {
    $scope.credentials = {
      username: null,
      password: null
    };
    $scope.errors = [];

    $scope.submit = function() {
      // Reset errors
      $scope.errors = [];

      Authentication.login($scope.credentials).then(function() {
        // Login successful
        $scope.$r.redirect();
      }, function(data, status) {
        // Login failed
        if(typeof data !== 'undefined' && data !== null) {
          // Display API errors
          $scope.errors = $scope.errors.concat(
            typeof data.errors.error === 'object' ?
              data.errors.error : [data.errors.error]
          );
        } else {
          // Display HTTP error
          $scope.errors.push('HTTP Error: ' + status);
        }
      });
    };

    $scope.showAuthenticationDetails = function() {
      var modal = $modal.open({
        templateUrl: 'modals/authenticationDetails.html',
        windowClass: 'small'
      });

      modal.result.then(function() {
        console.log('Modal closed');
      }, function () {
        console.log('Modal dismissed');
      });
    };
  });
