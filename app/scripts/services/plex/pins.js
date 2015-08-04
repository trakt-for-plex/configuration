'use strict';

angular.module('configurationApp')
  .factory('PPins', function(PHeaders, $http, $q) {
    return {
      create: function() {
        return $http({
          method: 'POST',
          url: 'https://plex.tv/pins.json',
          headers: PHeaders.get()
        });
      },
      get: function(id) {
        return $http({
          method: 'GET',
          url: 'https://plex.tv/pins/' + id + '.json',
          headers: PHeaders.get()
        });
      }
    };
  });
