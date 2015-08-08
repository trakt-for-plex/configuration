'use strict';

angular.module('configurationApp')
  .factory('PlexAuthentication', function(BaseAuthentication, Utils, $q) {
    function PlexAuthentication() {
      this.data = null;

      this.id = null;
      this.username = null;
      this.thumb_url = null;

      this.authorization = null;

      this.errors = [];
      this.warnings = [];

      this.state = '';
    }

    PlexAuthentication.prototype.basicChanged = function() {
      var current = this.authorization.basic;

      if(Utils.isDefined(current.token_plex)) {
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

      console.log(this);

      // Reset errors
      this.errors = [];
      this.warnings = [];

      deferred.resolve({
        plex: {
          username: this.username,

          authorization: {
            basic: {
              token_plex: current.token_plex
            }
          }
        }
      });

      return deferred.promise;
    };

    PlexAuthentication.prototype.update = function(data) {
      this.data = angular.copy(data);

      this.id = data.id;
      this.username = data.username;
      this.thumb_url = data.thumb_url;

      this.authorization = data.authorization;

      this.errors = [];
      this.warnings = [];

      this.state = '';
    };

    PlexAuthentication.prototype.updateAuthorization = function(token_plex, user) {
      console.log('updateAuthorization', token_plex, user);

      // Update account details
      this.username = user.username;
      this.thumb_url = user._thumb;

      // Update token
      this.authorization.basic.token_plex = token_plex;
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
