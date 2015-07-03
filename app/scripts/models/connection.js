'use strict';

angular.module('configurationApp')
  .factory('Connection', function($http) {
    function Connection() {
      this.uri = null;
    }

    Connection.prototype.request = function(path, config) {
      // build url
      config.url = this.uri + '/' + path;

      // create request
      return $http(config);
    };

    Connection.fromElement = function(e) {
      var c = new Connection();

      // Set attributes
      c.uri = e._uri;

      return c;
    };

    return Connection;
  });
