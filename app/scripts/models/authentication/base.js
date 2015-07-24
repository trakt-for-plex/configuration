'use strict';

angular.module('configurationApp')
  .factory('BaseAuthentication', function() {
    var stateIds = {
        'valid':    0,
        'warning':  1,
        'error':    2,
        'empty':    3
      },
      stateKeys = {
        0: 'valid',
        1: 'warning',
        2: 'error',
        3: 'empty'
      };

    return {
      selectPriorityState: function(states, type) {
        type = typeof type !== 'undefined' ? type : 'top';

        if(states.length === 0) {
          return null;
        }

        // Ensure states are unique
        states = _.uniq(states);

        if(states.length === 1) {
          return states[0];
        }

        // Map states to sort indices
        var ids =_.map(states, function(key) {
          return stateIds[key];
        });

        // Sort state indices
        ids = _.sortBy(ids, function(id) { return id; });

        // Retrieve highest priority state
        var id;

        if(type === 'top') {
          id = ids[0];
        } else if(type === 'bottom') {
          id = ids[ids.length - 1];
        } else {
          console.warn('Unknown "type" provided for selectPriorityState()');
          return null;
        }

        // Map id to state key
        return stateKeys[id];
      }
    };
  });
