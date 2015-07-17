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

    $scope.submit = function() {
      Authentication.login($scope.credentials).then(function() {
        $scope.$r.redirect();
      }, function() {
        console.log('login error');
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
