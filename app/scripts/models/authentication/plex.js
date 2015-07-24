'use strict';

angular.module('configurationApp')
  .factory('PlexAuthentication', function(BaseAuthentication, PUsers, $q) {
    function PlexAuthentication() {
      this.data = null;

      this.id = null;
      this.username = null;

      this.authorization = null;

      this.errors = [];
      this.warnings = [];

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
      this.warnings = [];

      // Send request
      PUsers.sign_in({
        username: current.username,
        password: current.password
      }).success(function(data) {
        var user = data.user;

        // Check authentication state
        self.check();

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
          // Display API errors
          self.errors = self.errors.concat(
            typeof data.errors.error === 'object' ?
              data.errors.error : [data.errors.error]
          );
        } else {
          // Display HTTP error
          self.errors.push('HTTP Error: ' + status);
        }

        // Update state
        self.authorization.basic.state = 'error';

        // Check authentication state
        self.check();

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
      this.warnings = [];

      this.state = '';
    };

    PlexAuthentication.prototype.check = function() {
      if((typeof this.username === 'undefined' ||
         this.username === null ||
         this.username.length === 0) &&
         this.authorization.basic.state === 'valid') {
        // Update warnings
        this.warnings.push('Missing username');

        // Update state
        this.authorization.basic.state = 'warning';
      }

      // Update state
      this.state =
        this.authorization.basic.state;
    };

    return PlexAuthentication;
  });
