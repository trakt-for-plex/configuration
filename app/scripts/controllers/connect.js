'use strict';

/**
 * @ngdoc function
 * @name configurationApp.controller:ConnectController
 * @description
 * # ConnectController
 * Controller of the configurationApp
 */
angular.module('configurationApp')
  .controller('ConnectController', function(PlexServer, RavenTags, $location, $rootScope, $scope) {
    $scope.state = '';
    $scope.selected = null;

    $scope.servers = [];

    plex.cloud['/api'].resources(true).then(function(response) {
      // Retrieve devices
      var data = response.data,
          devices = data.MediaContainer.Device;

      if(typeof devices.length === 'undefined') {
        devices = [devices];
      }

      // Filter devices to servers only
      var servers = _.filter(devices, function(device) {
        return device._provides === 'server';
      });

      $scope.$apply(function() {
        // Build `Server` objects
        $scope.servers = _.map(servers, function (server) {
          return PlexServer.fromElement(server);
        });
      });
    });

    $scope.select = function(server) {
      server.connect().then(function() {
        console.log('Connection successful');

        server.authenticate().then(function() {
          console.log('Authentication successful');

          // Update current server
          $rootScope.$s = server;

          // Update raven tags
          RavenTags.update({
            plugin_version: server.plugin_version
          });

          // Redirect to original view
          $scope.$r.redirect();
        }, function() {
          console.warn('Authentication failed');

          $scope.state = '';
        });
      }, function() {
        console.warn('Unable to find valid connection');

        $scope.state = '';
      });

      $scope.state = 'connecting';
      $scope.selected = server;
    };
  });
