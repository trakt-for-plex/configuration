'use strict';

angular.module('configurationApp')
  .factory('Options', function () {
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
            options: []
          };
        }

        if(option.group.length - depth === 1) {
          if(option.key.endsWith('.enabled') && option.type =='boolean') {
            group.enabled = option;
          } else {
            group.options.push(option);
          }
        } else {
          parse(group.groups, [option], depth + 1);
        }
      }
    }

    function Options(options) {
      this.current = options;
      this.original = angular.copy(options);

      this.groups = {};

      parse(this.groups, options);
    }

    Options.prototype.discard = function() {
      for(var i = 0; i < this.current.length; ++i) {
        var c = this.current[i],
            o = this.original[i];

        c.value = o.value;
      }
    };

    Options.prototype.save = function(server) {
      var options = {};

      for(var i = 0; i < this.current.length; ++i) {
        var c = this.current[i],
            o = this.original[i];

        options[c.key] = {
          from: o.value,
          to: c.value
        }
      }

      console.log(options);
    };

    return Options;
  });
