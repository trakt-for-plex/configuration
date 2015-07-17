'use strict';

/**
 * @ngdoc function
 * @name configurationApp.controller:HomeController
 * @description
 * # HomeController
 * Controller of the configurationApp
 */
angular.module('configurationApp')
  .controller('HomeController', function($location) {
    $location.path('/configuration/server');
    $location.search('');
  });
