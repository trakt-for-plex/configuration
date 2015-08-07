'use strict';

angular.module('configurationApp')
  .factory('Authentication', function(RavenTags, Utils, $http, $q, $rootScope) {
    var identifierSalt = 'MLawOtoMiFf5Ni9nbu0bTes2+UkrVLMZ8LSPwA+qTtA=',
        tokenRegex = /^server\.\w+\.((token_channel)|(token_channel_expire)|(token_plex))$/,
        user = null;

    function updateAuthentication(authenticated, user) {
      // Update authentication scope
      $rootScope.$a = {
        authenticated: Utils.isDefined(authenticated) ? authenticated : false,
        user: Utils.isDefined(user) ? user : null
      };

      // Update server scope
      if(!$rootScope.$a.authenticated) {
        $rootScope.$s = null;
      }

      // Update plex.js token
      if(Utils.isDefined(user)) {
        plex.cloud.token = user._authenticationToken;
      } else {
        plex.cloud.token = null;
      }
    }

    updateAuthentication();

    var Authentication = {
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

        function success(data) {
          self.token(data.user._authenticationToken);
          self.user(data.user);

          updateAuthentication(true, data.user);

          deferred.resolve(data.user);
        }

        function error(data, status) {
          updateAuthentication();

          deferred.reject(data, status);
        }

        if(Utils.isDefined(credentials.username) && Utils.isDefined(credentials.password)) {
          // Username/Password
          plex.cloud['/users'].login(
            credentials.username,
            credentials.password
          ).then(
            success,
            error
          );
        } else if(Utils.isDefined(credentials.token)) {
          // Token
          plex.cloud['/users'].account(
            credentials.token
          ).then(
            success,
            error
          );
        } else {
          deferred.reject(null, 0);
        }

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
        plex.cloud['/users'].account(token).then(function(data) {
          self.user(data.user);

          updateAuthentication(true, data.user);

          deferred.resolve(data.user);
        }, function() {
          updateAuthentication();

          deferred.reject();
        });

        return deferred.promise;
      }
    };

    return Authentication;
  });
