'use strict';

angular.module('configurationApp')
  .factory('PlexConnection', function($http) {
    function PlexConnection() {
      this.client = null;
      this.uri = null;
    }

    PlexConnection.prototype.request = function(path, config) {
      // build url
      config.url = this.uri + '/' + path;

      // create request
      return $http(config);
    };

    PlexConnection.fromElement = function(e) {
      var c = new PlexConnection();

      // Set attributes
      c.uri = e._uri;

      return c;
    };

    return PlexConnection;
  });
