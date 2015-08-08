'use strict';

/**
 * @ngdoc function
 * @name configurationApp.controller:LoginController
 * @description
 * # LoginController
 * Controller of the configurationApp
 */
angular.module('configurationApp')
  .controller('LoginController', function(Authentication, $location, $modal, $q, $scope) {
    $scope.onAuthenticated = function(token, user){
      if(Authentication.login(token, user)) {
        // Login successful
        $scope.$r.redirect();
      }
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
