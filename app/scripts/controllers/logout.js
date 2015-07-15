'use strict';

/**
 * @ngdoc function
 * @name configurationApp.controller:LogoutController
 * @description
 * # LogoutController
 * Controller of the configurationApp
 */
angular.module('configurationApp')
  .controller('LogoutController', function(Authentication, $location) {
    Authentication.logout();

    $location.path('/login');
    $location.search('');
  });
