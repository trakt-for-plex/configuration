'use strict';

angular.module('configurationApp')
  .factory('PlexServer', function(PlexConnection, PlexConnectionManager, VersionUtil, $q) {
    var identifier = 'com.plexapp.plugins.trakttv',
        pluginVersionMinimum = '0.9.10.3',
        target = 'MessageKit:Api';

    function PlexServer() {
      this.name = null;

      this.identifier = null;
      this.plugin_version = null;

      this.token_channel = null;
      this.token_channel_expire = null;

      this.token_plex = null;

      this.client = null;
      this.connection_manager = null;

      this.error = null;
    }

    PlexServer.prototype.isAuthenticated = function() {
      if(this.token_channel === null) {
        return false;
      }

      // TODO check token validity (via `token_channel_expire`)
      return true;
    };

    PlexServer.prototype.authenticate = function() {
      var self = this;

      return this.call('system.authenticate', [this.token_plex]).then(function(token) {
        if(token['X-Channel-Token'] === null || token['X-Channel-Token-Expire'] === null) {
          // Reset authentication details
          self.token_channel = null;
          self.token_channel_expire = null;

          // Save server details
          self.save();

          // Reject promise
          self.error = 'Unable to authenticate with plugin';
          return $q.reject(null);
        }

        // Retrieve authentication details
        self.token_channel = token['X-Channel-Token'];
        self.token_channel_expire = token['X-Channel-Token-Expire'];

        // Save server details
        self.save();
      }, function(error) {
        self.error = error;

        return $q.reject();
      });
    };

    PlexServer.prototype.connect = function() {
      var self = this;

      // Reset connection "error"
      self.error = null;

      // Test connections
      return this.connection_manager.test().then(function(connection) {
        // Check server
        return self.check().then(function() {
          return connection;
        }, function(error) {
          // Server didn't pass validation
          self.error = error;

          return $q.reject(error);
        });

      }, function(reason) {
        // Unable to connect to server
        self.error = {
          message: reason
        };

        return $q.reject(self.error);
      });
    };

    PlexServer.prototype.check = function() {
      var self = this;

      return this.call('system.ping').then(function(pong) {
        // Store server version
        self.plugin_version = pong.version;

        // Check plugin meets version requirement
        if(VersionUtil.compare(self.plugin_version, pluginVersionMinimum) >= 0) {
          return true;
        }

        // Plugin update required
        return $q.reject({
          message: 'Plugin update required'
        });
      }, function(error) {
        // Unable to ping server
        return $q.reject(error);
      });
    };

    PlexServer.prototype.call = function(key, args, kwargs) {
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
      var deferred = $q.defer();

      this.client['/:/plugins/*/messaging'].callFunction(
        identifier, target, args, kwargs, {
          headers: headers
        }
      ).then(function(data) {
        // Parse response
        if(typeof data === 'string') {
          data = JSON.parse(data);
        } else if(typeof data === 'object') {
          console.warn('Legacy response format returned');
        }

        // Return response
        console.debug('Response', data);

        if(data.result !== undefined) {
          deferred.resolve(data.result);
          return;
        }

        // Handle errors
        if(data.error !== undefined) {
          deferred.reject(data.error);
        } else {
          deferred.reject(null);
        }
      }, function(data, status) {
        deferred.reject(data, status);
      });

      return deferred.promise;
    };

    PlexServer.prototype.get = function(path, config) {
      config = typeof config !== 'undefined' ? config : {};

      config.method = 'GET';

      config.headers = typeof config.headers !== 'undefined' ? config.headers : {};
      config.headers['X-Plex-Token'] = this.token_plex;

      return this.current.request(path, config);
    };

    PlexServer.prototype._attributeKey = function(name) {
      return 'server.' + this.identifier + '.' + name;
    };

    PlexServer.prototype.load = function() {
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

    PlexServer.prototype.save = function() {
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

    PlexServer.fromElement = function(e) {
      var s = new PlexServer();

      // Set attributes
      s.name = e._name;

      s.identifier = e._clientIdentifier;
      s.token_plex = e._accessToken;

      if(typeof e.Connection.length === 'undefined') {
        e.Connection = [e.Connection];
      }

      // Build `Connection` objects
      var connections = _.map(e.Connection, function(e) {
        return PlexConnection.fromElement(e);
      });

      s.connection_manager = new PlexConnectionManager(s, connections);

      // Load attributes from storage
      s.load();

      return s;
    };

    return PlexServer;
  });
