'use strict';

angular.module('configurationApp')
  .factory('AccountAuthentication', function(BaseAuthentication, PlexAuthentication, TraktAuthentication, Utils) {
    function AccountAuthentication() {
      this.plex = new PlexAuthentication();
      this.trakt = new TraktAuthentication();

      // State
      this.messages = [];
      this.state = '';
    }

    AccountAuthentication.prototype.appendMessage = function(type, content) {
      this.messages.push({
        type: type,
        content: content
      });
    };

    AccountAuthentication.prototype.check = function() {
      this.plex.check();
      this.trakt.check();

      // Retrieve message states
      var states = _.map(this.messages, function(message) {
        return message.type;
      });

      // Extend `states` with authentication states
      states.push(this.plex.state);
      states.push(this.trakt.state);

      // Select highest severity state
      this.state = BaseAuthentication.selectPriorityState(states, 'bottom');
    };

    AccountAuthentication.prototype.clear = function() {
      // Clear messages
      this.messages = [];

      // Clear children
      this.plex.clear();
      this.trakt.clear();

      // Update state
      this.check();
    };

    AccountAuthentication.prototype.update = function(data) {
      // Update handlers
      this.plex.update(data.plex);
      this.trakt.update(data.trakt);

      // Reset state
      this.messages = [];
      this.state = '';

      // Check current authentication
      this.check();
    };

    AccountAuthentication.prototype.onSaveError = function(error) {
      if(!Utils.isDefined(error) || !Utils.isDefined(error.message)) {
        return;
      }

      // Store error message
      this.appendMessage('error', error.message);
    };

    return AccountAuthentication;
  });
