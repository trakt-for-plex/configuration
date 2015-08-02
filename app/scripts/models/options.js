'use strict';

angular.module('configurationApp')
  .factory('Options', function (StringUtil, $q) {
    function parse(groups, options, depth) {
      depth = typeof depth !== 'undefined' ? depth : 0;

      for(var i = 0; i < options.length; ++i) {
        var option = options[i],
          groupName = option.group[depth],
          group = groups[groupName];

        if(typeof group === 'undefined') {
          group = groups[groupName] = {
            name: groupName,
            groups: {},

            enabled: null,
            options: [],

            order: null
          };
        }

        // Update group order
        if(group.order === null) {
          group.order = option.order;
        } else if(option.order < group.order) {
          group.order = option.order;
        }

        // Update group options
        if(option.group.length - depth === 1) {
          if(StringUtil.endsWith(option.key, '.enabled') && option.type === 'boolean') {
            group.enabled = option;
          } else {
            group.options.push(option);
          }
        } else {
          parse(group.groups, [option], depth + 1);
        }
      }
    }

    function Options(options, account) {
      this.current = options;
      this.account = typeof account !== 'undefined' ? account : null;

      this.original = angular.copy(options);

      // Parse options
      this.groups = {};

      parse(this.groups, options);
    }

    Options.prototype.discard = function() {
      for(var i = 0; i < this.current.length; ++i) {
        var c = this.current[i],
            o = this.original[i];

        c.value = o.value;
      }

      return $q.resolve();
    };

    Options.prototype.save = function(server) {
      var self = this,
          changes = {};

      for(var i = 0; i < this.current.length; ++i) {
        var c = this.current[i],
            o = this.original[i];

        changes[c.key] = {
          from: o.value,
          to: c.value
        };
      }

      return server.call('option.update', [], {
        changes: changes,
        account: this.account !== null ? this.account.id : null
      }).then(function(result) {
        // Build object of updated options
        var updated = _.object(
          _.map(
            result.updated,
            function(key) {
              return [key, true];
            }
          )
        );

        // Update `original` option values to match the update
        _.each(self.original, function(option, index) {
          if(typeof updated[option.key] === 'undefined') {
            return;
          }

          option.value = self.current[index].value;
        });
      }, function(error) {
        return $q.reject(error);
      });
    };

    return Options;
  });
