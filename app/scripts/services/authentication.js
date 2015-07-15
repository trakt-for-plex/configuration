'use strict';

angular.module('configurationApp')
  .factory('Authentication', function(PUsers, RavenTags, $http, $q) {
    var identifierSalt = 'MLawOtoMiFf5Ni9nbu0bTes2+UkrVLMZ8LSPwA+qTtA=',
        user = null;

    return {
      authenticated: function() {
        return user !== null;
      },
      user: function(value) {
        if(value !== undefined) {
          // Update user details
          user = value;

          // Update raven context
          RavenTags.update({
            user_identifier: typeof user.username !== 'undefined' ?
              md5(user.username + identifierSalt) :
              null
          });

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

        if(credentials === null || credentials.username === null || credentials.password === null) {
          deferred.reject();
          return deferred.promise;
        }

        // Send request
        PUsers.sign_in(credentials)
          .success(function(data) {
            self.token(data.user._authenticationToken);
            self.user(data.user);

            deferred.resolve(data.user);
          })
          .error(function() {
            deferred.reject();
          });

        return deferred.promise;
      },
      get: function() {
        var deferred = $q.defer(),
            self = this,
            token = self.token(),
            user = self.user();

        if(token === null) {
          deferred.reject();
          return deferred.promise;
        }

        if(user !== null) {
          deferred.resolve(user);
          return deferred.promise;
        }

        // Send request
        PUsers.account(token)
          .success(function(data) {
            self.user(data.user);

            deferred.resolve(data.user);
          })
          .error(function() {
            deferred.reject();
          });

        return deferred.promise;
      }
    };
  });
