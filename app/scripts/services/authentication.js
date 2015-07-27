'use strict';

angular.module('configurationApp')
  .factory('Authentication', function(PUsers, RavenTags, $http, $q, $rootScope) {
    var identifierSalt = 'MLawOtoMiFf5Ni9nbu0bTes2+UkrVLMZ8LSPwA+qTtA=',
        tokenRegex = /^server\.\w+\.((token_channel)|(token_channel_expire)|(token_plex))$/,
        user = null;

    function updateAuthentication(authenticated, user) {
      $rootScope.$a = {
        authenticated: typeof authenticated !== 'undefined' ? authenticated : false,
        user: typeof user !== 'undefined' ? user : null
      };

      if(!$rootScope.$a.authenticated) {
        $rootScope.$s = null;
      }
    }

    updateAuthentication();

    return {
      authenticated: function() {
        return user !== null;
      },
      user: function(value) {
        if(value !== undefined) {
          // Update user details
          user = value;

          // Update raven context
          if(value !== null) {
            RavenTags.update({
              user_identifier: typeof user.username !== 'undefined' ?
                md5(user.username + identifierSalt) :
                null
            });
          } else {
            RavenTags.update({
              user_identifier: null
            });
          }

          return value;
        }

        return user;
      },
      token: function(value) {
        if(value === undefined) {
          return localStorage['plex.token'];
        }

        if(value === null) {
          delete localStorage['plex.token'];
        } else {
          localStorage['plex.token'] = value;
        }

        return value;
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

            updateAuthentication(true, data.user);

            deferred.resolve(data.user);
          })
          .error(function(data, status) {
            updateAuthentication();

            deferred.reject(data, status);
          });

        return deferred.promise;
      },
      logout: function() {
        // Destroy plex authentication details
        this.token(null);
        this.user(null);

        // Destroy server tokens
        var deleteKeys = [];

        for(var i = 0; i < localStorage.length; ++i) {
          var key = localStorage.key(i);

          if(tokenRegex.exec(key) === null) {
            continue;
          }

          deleteKeys.push(key);
        }

        _.each(deleteKeys, function(key) {
          delete localStorage[key];
        });

        updateAuthentication();
      },
      get: function() {
        var deferred = $q.defer(),
            self = this,
            token = self.token(),
            user = self.user();

        if(typeof token === 'undefined' || token === null) {
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

            updateAuthentication(true, data.user);

            deferred.resolve(data.user);
          })
          .error(function() {
            updateAuthentication();

            deferred.reject();
          });

        return deferred.promise;
      }
    };
  });
