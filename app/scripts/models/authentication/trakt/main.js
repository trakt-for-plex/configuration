'use strict';

angular.module('configurationApp')
  .factory('TraktAuthentication', function(TraktBasicAuthentication, TraktPinAuthentication, BaseAuthentication, Utils) {
    function TraktAuthentication() {
      this.original = null;

      // Account details
      this.id = null;
      this.username = null;
      this.thumb_url = null;

      this.basic = new TraktBasicAuthentication(this);
      this.pin = new TraktPinAuthentication(this);

      // State
      this.messages = [];
      this.state = '';
    }

    TraktAuthentication.prototype.appendMessage = function(type, content) {
      this.messages.push({
        type: type,
        content: content
      });
    };

    TraktAuthentication.prototype.check = function() {
      // Retrieve message states
      var states = _.map(this.messages, function(message) {
        return message.type;
      });

      // Extend `states` with authentication state
      states.push(BaseAuthentication.selectPriorityState([
        this.basic.state,
        this.pin.state
      ]));

      // Select highest severity state
      this.state = BaseAuthentication.selectPriorityState(states, 'bottom');
    };

    TraktAuthentication.prototype.clear = function(data) {
      // Clear messages
      this.messages = [];

      // Update state
      this.check();
    };

    TraktAuthentication.prototype.current = function() {
      var data = {
        trakt: {}
      };

      // Basic
      if(this.basic.changed) {
        $.extend(true, data.trakt, this.basic.current());
      }

      // PIN
      if(this.pin.changed) {
        $.extend(true, data.trakt, this.pin.current());
      }

      return data;
    };

    TraktAuthentication.prototype.update = function(data) {
      this.original = angular.copy(data);

      // Account details
      this.id = data.id;
      this.username = data.username;
      this.thumb_url = data.thumb_url;

      this.basic.update(data.authorization.basic);
      this.pin.update(data.authorization.oauth);

      // Reset state
      this.messages = [];
      this.state = '';
    };

    TraktAuthentication.prototype.updateDetails = function(settings) {
      if(!Utils.isDefined(settings) || !Utils.isDefined(settings.user)) {
        this.username = 'Unknown';
        this.thumb_url = null;

        // TODO Add message to indicate a save is required (for basic authorization)
        return;
      }

      var avatar = settings.user.images.avatar,
          user = settings.user;

      this.username = user.username;
      this.thumb_url = avatar.full;
    };

    TraktAuthentication.prototype.onSaveError = function(error) {
      if(!Utils.isDefined(error) || !Utils.isDefined(error.message)) {
        return;
      }

      // Store error message
      this.appendMessage('error', error.message);
    };

    return TraktAuthentication;
  });
