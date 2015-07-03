'use strict';

angular.module('configurationApp')
  .factory('Server', function(Connection, CSystem, PMessaging, SConnection, $q) {
    var identifier = 'com.plexapp.plugins.trakttv',
      target = 'MessageKit:Api';

    function Server() {
      this.name = null;

      this.identifier = null;

      this.token_channel = null;
      this.token_channel_expire = null;

      this.token_plex = null;

      this.connections = null;
      this.current = null;

      this.error = null;
    }

    Server.prototype.isAuthenticated = function() {
      if(this.token_channel === null) {
        return false;
      }

      // TODO check token validity (via `token_channel_expire`)
      return true;
    };

    Server.prototype.authenticate = function() {
      var self = this;

      return CSystem.authenticate(this).then(function() {
        self.save();

      }, function(error) {
        self.error = error;

        return $q.reject();
      });
    };

    Server.prototype.connect = function() {
      var self = this;

      // Reset connection "error"
      self.error = null;

      // Test connections
      return SConnection.test(this).then(function(connection) {
        return connection;
      }, function(reason) {
        self.error = {
          message: reason
        };

        return $q.reject();
      });
    };

    Server.prototype.call = function(key, args, kwargs) {
      args = typeof args !== 'undefined' ? args : [];

      // insert `key` at the front of `args`
      args.splice(0, 0, key);

      // build headers
      var headers = {};

      if(this.token_channel !== null) {
        headers['X-Channel-Token'] = this.token_channel;
      }

      console.debug('[%s] Request "%s"', this.identifier, key, {
        args: args,
        kwargs: kwargs
      });

      // call api function
      return PMessaging.call(
        this, identifier, target,
        args, kwargs, headers
      );
    };

    Server.prototype.get = function(path, config) {
      config = typeof config !== 'undefined' ? config : {};

      config.method = 'GET';

      config.headers = typeof config.headers !== 'undefined' ? config.headers : {};
      config.headers['X-Plex-Token'] = this.token_plex;

      return this.current.request(path, config);
    };

    Server.prototype._attributeKey = function(name) {
      return 'server.' + this.identifier + '.' + name;
    };

    Server.prototype.load = function() {
      if(this.identifier === null || typeof this.identifier === 'undefined') {
        return;
      }

      var self = this;

      function loadAttribute(name) {
        var value = localStorage[self._attributeKey(name)];

        if(value === null || typeof value === 'undefined') {
          return;
        }

        self[name] = value;
      }

      loadAttribute('token_plex');

      loadAttribute('token_channel');
      loadAttribute('token_channel_expire');
    };

    Server.prototype.save = function() {
      if(this.identifier === null || typeof this.identifier === 'undefined') {
        return;
      }

      var self = this;

      function saveAttribute(name) {
        localStorage[self._attributeKey(name)] = self[name];
      }

      saveAttribute('token_plex');

      saveAttribute('token_channel');
      saveAttribute('token_channel_expire');
    };

    Server.fromElement = function(e) {
      var s = new Server();

      // Set attributes
      s.name = e._name;

      s.identifier = e._clientIdentifier;
      s.token_plex = e._accessToken;

      s.connections = _.map(e.Connection, function(e) {
        return Connection.fromElement(e);
      });

      // Load attributes from storage
      s.load();

      return s;
    };

    return Server;
  });
