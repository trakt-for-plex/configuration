'use strict';

angular.module('configurationApp')
  .factory('Option', function () {
    function parse(groups, options) {
      for(var i = 0; i < options.length; ++i) {
        var option = options[i],
          groupName = option.group[0],
          group = groups[groupName];

        if(typeof group === 'undefined') {
          group = groups[groupName] = {
            name: groupName,
            groups: {},

            enabled: null,
            options: []
          };
        }

        if(option.group.length === 1) {
          if(option.key.endsWith('.enabled') && option.type =='boolean') {
            group.enabled = option;
          } else {
            group.options.push(option);
          }
        } else {
          var o = angular.copy(option);

          // Remove first group name
          o.group.shift();

          parse(group.groups, [o]);
        }
      }
    }

    return {
      parse: parse
    }
  });
