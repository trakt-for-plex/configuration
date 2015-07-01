'use strict';

angular.module('configurationApp')
  .factory('PlexAuthentication', function(PlexHeaders, $http, $q) {
    var user = null;

    return {
      authenticated: function() {
        return user !== null;
      },
      user: function(value) {
        if(value !== undefined) {
          user = value;
          return value;
        }

        return user;
      },
      token: function(value) {
        if(value !== undefined) {
          localStorage['plex.token'] = value;
          return value;
        }

        return localStorage['plex.token'];
      },
      login: function(credentials) {
        var deferred = $q.defer(),
            self = this;

        if(credentials == null || credentials.username == null || credentials.password == null) {
          deferred.reject();
          return deferred.promise;
        }

        // Build request
        var request = {
          method: 'POST',
          url: 'https://plex.tv/users/sign_in.xml',
          headers: $.extend(PlexHeaders.get(), {
            'Authorization': 'Basic ' + btoa(credentials.username + ':' + credentials.password)
          })
        };

        // Send request
        $http(request)
          .success(function(data, status) {
            self.token(data.user._authenticationToken);
            self.user(data.user);

            deferred.resolve(data.user);
          })
          .error(function(data, status) {
            deferred.reject();
          });

        return deferred.promise;
      },
      get: function() {
        var deferred = $q.defer(),
            self = this,
            token = self.token(),
            user = self.user();

        if(token == null) {
          deferred.reject();
          return deferred.promise;
        }

        if(user != null) {
          deferred.resolve(user);
          return deferred.promise;
        }

        // Build request
        var request = {
          method: 'GET',
          url: 'https://plex.tv/users/account',
          headers: $.extend(PlexHeaders.get(), {
            'X-Plex-Token': token
          })
        };

        // Send request
        $http(request)
          .success(function(data, status) {
            self.user(data.user);

            deferred.resolve(data.user);
          })
          .error(function(data, status) {
            deferred.reject();
          });

        return deferred.promise;
      }
    };
  });
