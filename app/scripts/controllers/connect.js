'use strict';

/**
 * @ngdoc function
 * @name configurationApp.controller:ConnectController
 * @description
 * # ConnectController
 * Controller of the configurationApp
 */
angular.module('configurationApp')
  .controller('ConnectController', function(Server, CSystem, PAPI, SConnection, $location, $rootScope, $scope) {
    $scope.state = '';
    $scope.selected = null;

    $scope.servers = [];

    PAPI.resources(true)
      .success(function(data) {
        // Retrieve servers from response
        var servers = _.filter(data.MediaContainer.Device, function(device) {
          return device._provides === 'server';
        });

        $scope.servers = _.map(servers, function(server) {
          return Server.fromElement(server);
        });

        console.log($scope.servers);
      });

    $scope.select = function(server) {
      server.connect().then(function() {
        console.log('Connection successful');

        server.authenticate().then(function() {
          console.log('Authentication successful');

          $rootScope.$s = server;

          $location.path($scope.$r.originalPath);
        }, function() {
          console.log('Authentication failed', server);

          $scope.state = '';
        });
      }, function() {
        console.log('Unable to find valid connection', server);

        $scope.state = '';
      });

      $scope.state = 'connecting';
      $scope.selected = server;
    };
  });
