'use strict';

angular.module('configurationApp')
  .factory('PlexAuthentication', function(BaseAuthentication, PUsers, $q) {
    function PlexAuthentication() {
      this.data = null;

      this.id = null;
      this.username = null;

      this.authorization = null;

      this.errors = [];
      this.state = '';
    }

    PlexAuthentication.prototype.basicChanged = function() {
      var current = this.authorization.basic,
        original = this.data.authorization.basic;

      if(current.username !== original.username) {
        return true;
      }

      if(current.password !== original.password) {
        return true;
      }

      return false;
    };

    PlexAuthentication.prototype.current = function() {
      if(!this.basicChanged()) {
        return $q.resolve({});
      }

      var current = this.authorization.basic,
        deferred = $q.defer(),
        self = this;

      // Reset errors
      this.errors = [];

      // Send request
      PUsers.sign_in({
        username: current.username,
        password: current.password
      }).success(function(data) {
        var user = data.user;

        deferred.resolve({
          plex: {
            username: user.username,

            authorization: {
              basic: {
                token: user._authenticationToken
              }
            }
          }
        });
      }).error(function(data, status) {
        // Update errors
        if(typeof data !== 'undefined' && data !== null) {
          self.errors = self.errors.concat(
            typeof data.errors.error === 'object' ?
              data.errors.error : [data.errors.error]
          );
        } else {
          self.errors.push('HTTP Error: ' + status);
        }

        // Update state
        self.authorization.basic.state = 'error';
        self.state = 'error';

        deferred.reject();
      });

      return deferred.promise;
    };

    PlexAuthentication.prototype.update = function(data) {
      this.data = angular.copy(data);

      this.id = data.id;
      this.username = data.username;

      this.authorization = data.authorization;

      this.errors = [];
      this.state = '';
    };

    PlexAuthentication.prototype.check = function() {
      this.state =
        this.authorization.basic.state;
    };

    return PlexAuthentication;
  });
