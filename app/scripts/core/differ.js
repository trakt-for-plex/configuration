'use strict';

angular.module('configurationApp')
  .factory('Differ', function () {
    function run(a, b) {
      var r = {};

      _.each(a, function(v, k) {
        if(b[k] === v) return;

        if(_.isObject(v)) {
          v = run(v, b[k]);

          if(Object.keys(v).length == 0) {
            return;
          }
        }

        r[k] = v;
      });

      return r;
    }

    return {
      run: run
    };
  });
