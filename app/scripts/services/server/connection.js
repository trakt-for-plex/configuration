'use strict';

angular.module('configurationApp')
  .factory('SConnection', function($http, $q) {
    return {
      test: function(server) {
        console.debug('[%s] Testing %s connections', server.identifier, server.connections.length);

        var self = this,
            connections = angular.copy(server.connections),
            deferred = $q.defer(),
            error = 'Unable to find valid connection';

        function testOne() {
          var connection = connections.shift();

          if(connection == null) {
            deferred.reject(error);
            return;
          }

          self.testConnection(connection, server).then(function(connection) {
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
      },
      testConnection: function(connection, server) {
        console.debug('[%s] Testing connection: %s', server.identifier, connection.uri);

        // Ensure we don't attempt an http:// connection while https:// is being used
        if(window.location.protocol === 'https:' && connection.uri.startsWith('http:')) {
          return $q.reject("Only secure servers are supported when browsing over https://");
        }

        // Test connection
        //var deferred = $q.defer(),
        //    request = $http({
        //      method: 'GET',
        //      url: connection.uri + '/identity',
        //      headers: $.extend(PHeaders.get(), {
        //        'X-Plex-Token': server.token_plex
        //      })
        //    });

        request.success(function(data) {
          var connectionIdentifier = data.MediaContainer._machineIdentifier;

          if(connectionIdentifier !== server.identifier) {
            console.debug("Connection identifier %s doesn't match server identifier %s", connectionIdentifier, server._clientIdentifier);
            deferred.reject();
            return;
          }

          console.log('[%s] Using connection: %s', server.identifier, connection.uri);

          // Update server
          server.current = connection;

          // Resolve promise
          deferred.resolve(connection);
        }).error(function() {
          deferred.reject();
        });

        return deferred.promise;
      }
    };
  });
