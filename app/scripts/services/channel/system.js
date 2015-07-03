'use strict';

angular.module('configurationApp')
  .factory('CSystem', function($q) {
    return {
      authenticate: function(server) {
        if(server.isAuthenticated()) {
          // already authenticated
          return $q.resolve(true);
        }

        return server.call('system.authenticate', [server.token_plex]).then(function(token) {
          if(token['X-Channel-Token'] == null || token['X-Channel-Token-Expire'] == null) {
            return $q.reject(null);
          }

          server.token_channel = token['X-Channel-Token'];
          server.token_channel_expire = token['X-Channel-Token-Expire'];

          return true;
        }, function(error) {
          return $q.reject(error);
        });
      }
    };
  });
