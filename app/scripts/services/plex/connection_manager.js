'use strict';

angular.module('configurationApp')
  .factory('PlexConnectionManager', function($http, $q) {
    function PlexConnectionManager(server, connections) {
      this.server = server;
      this.available = connections;

      this.client = null;
      this.current = null;
    }

    PlexConnectionManager.prototype.test = function() {
      var self = this,
          connections = angular.copy(self.available),
          deferred = $q.defer(),
          error = 'Unable to find valid connection';

      console.debug('[%s] Testing %s connections', self.server.identifier, connections.length);

      function testOne() {
        var connection = connections.shift();

        if(connection == null) {
          deferred.reject(error);
          return;
        }

        self.testConnection(connection).then(function(connection) {
          deferred.resolve(connection);
        }, function(connectionError) {
          if(typeof connectionError !== 'undefined' && connectionError !== null) {
            error = connectionError;
          }

          testOne();
        });
      }

      testOne();

      return deferred.promise;
    };

    PlexConnectionManager.prototype.testConnection = function(connection) {
      var self = this,
          client = new plex.Server(connection.uri);

      console.debug('[%s] Testing connection: %s', self.server.identifier, connection.uri);

      // Setup client
      client.client_identifier = localStorage['plex.client.identifier'];
      client.token = self.server.token_plex;

      client.http.headers.setProduct('trakt (for Plex) - Configuration', '1.0.0');
      client.http.xmlParser = 'x2js';

      // Ensure we don't attempt an http:// connection while https:// is being used
      if(window.location.protocol === 'https:' && connection.uri.startsWith('http:')) {
        return $q.reject("Only secure servers are supported when browsing over https://");
      }

      // Test connection
      var deferred = $q.defer();

      client.identity().then(function(data) {
        var connectionIdentifier = data.MediaContainer._machineIdentifier;

        if(connectionIdentifier !== self.server.identifier) {
          console.debug("Connection identifier %s doesn't match the server identifier %s", connectionIdentifier, self.server.identifier);
          deferred.reject();
          return;
        }

        console.log('[%s] Using connection: %s', self.server.identifier, connection.uri);

        // Update connection
        connection.client = client;

        // Update server
        self.client = client;
        self.current = connection;

        self.server.client = client;

        // Resolve promise
        deferred.resolve(connection);
      }, function() {
        deferred.reject();
      });

      return deferred.promise;
    };

    return PlexConnectionManager;
  });
