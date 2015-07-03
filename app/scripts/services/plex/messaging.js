'use strict';

angular.module('configurationApp')
  .factory('PMessaging', function($q) {
    function generate_path(identifier, key, args) {
      args = typeof args !== 'undefined' ? args : [];

      // generate path
      var path = ':/plugins/' + identifier + '/messaging/' + key;

      // append arguments to path
      if(args.length > 0) {
        path += '/' + args.join('/');
      }

      return path;
    }

    function pack(value) {
      var result;

      // dump value to string
      result = cerealizer.dumps(value);

      // encode value to a URL safe format
      result = safe_encode(result);
      result = encodeURIComponent(result);

      return result;
    }

    function unpack(value) {
      var result;

      // decode value from URL safe format
      result = decodeURIComponent(value);
      result = safe_decode(result);

      // load value from string
      return cerealizer.loads(result);
    }

    function safe_encode(value) {
      return btoa(value).replace(/\//g, '@').replace(/\+/g, '*').replace(/\=/g, '_');
    }

    function safe_decode(value) {
      value = value.replace(/\@/g, '/').replace(/\*/g, '+').replace(/\_/g, '=');

      var rem = value.length % 4;

      if(rem > 0) {
        value += _repeat('=', 4 - rem);
      }

      return atob(value);
    }

    function _repeat(x, n) {
      var s = '';
      while (n-- > 0) s += x;
      return s;
    }

    return {
      call: function(server, identifier, name, args, kwargs, headers) {
        args = typeof args !== 'undefined' ? args : [];
        kwargs = typeof kwargs !== 'undefined' ? kwargs : {};

        var path = generate_path(identifier, 'function', [
          safe_encode(name),
          pack(args),
          pack(kwargs)
        ]), config = {
          headers: headers
        };

        var self = this;

        return server.get(path, config).then(function(response) {
          var data = JSON.parse(unpack(response.data));

          console.debug('[%s] Response', server.identifier, data);

          if(data.result !== undefined) {
            return data.result;
          }

          if(data.error !== undefined) {
            return $q.reject(data.error);
          }

          return null;
        }, function() {
          return $q.reject(null);
        })
      }
    };
  });
