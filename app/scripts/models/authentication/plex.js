'use strict';

angular.module('configurationApp')
  .factory('PlexAuthentication', function(BaseAuthentication, Utils, $q) {
    function PlexAuthentication() {
      this.changed = false;
      this.original = null;

      // Account details
      this.id = null;
      this.username = null;
      this.thumb_url = null;

      // Authorization details
      this.authorization = null;

      // State
      this.messages = [];
      this.state = '';
    }

    PlexAuthentication.prototype.appendMessage = function(type, content) {
      this.messages.push({
        type: type,
        content: content
      });
    };

    PlexAuthentication.prototype.current = function() {
      if(!this.changed) {
        return {};
      }

      return {
        plex: {
          username: this.username,

          authorization: {
            basic: {
              token_plex: this.authorization.basic.token_plex
            }
          }
        }
      };
    };

    PlexAuthentication.prototype.update = function(data) {
      this.changed = false;
      this.original = angular.copy(data);

      // Account details
      this.id = data.id;
      this.username = data.username;
      this.thumb_url = data.thumb_url;

      // Authorization details
      this.authorization = data.authorization;

      // State
      this.messages = [];
      this.state = '';
    };

    PlexAuthentication.prototype.updateAuthorization = function(token_plex, user) {
      // Update account details
      this.username = user.username;
      this.thumb_url = user._thumb;

      // Update token
      this.authorization.basic.token_plex = token_plex;

      // Set `changed` flag
      this.changed = true;
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
