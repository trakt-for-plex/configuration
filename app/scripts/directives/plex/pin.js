'use strict';

angular.module('configurationApp')
  .directive('coPlexPin', function($timeout) {
    function PlexPin($scope) {
      this.$scope = $scope;

      this.interval = 2000;
    }

    PlexPin.prototype.check = function() {
      console.debug('Checking pin status...');

      var $scope = this.$scope,
          self = this;

      // Ensure pin authentication has been enabled
      if($scope.enabled !== true) {
        console.debug('PIN authentication has been disabled, cancelling pin checks');
        self.reset();
        return;
      }

      // Ensure pin details are valid
      if(typeof $scope.current === 'undefined' || $scope.current === null || $scope.current.id === null) {
        console.warn('Invalid pin data', $scope.current);
        self.reset();
        return;
      }

      // Ensure pin hasn't expired
      if(new Date() > $scope.expires_at) {
        console.debug('Pin has expired');
        self.reset();
        return;
      }

      // Check if pin is authenticated
      plex.cloud["/pins"].get($scope.current.id).then(function(data) {
        if(data.pin.auth_token._nil === 'true') {
          // PIN not authenticated yet, schedule next check
          self.schedule();
          return;
        }

        // PIN has been authenticated
        $scope.$apply(function() {
          $scope.callback({
            token: data.pin.auth_token
          });
          $scope.state = 'complete';
        });
      }, function(data, status) {
        console.warn(data, status);

        $scope.$apply(function() {
          $scope.pin.state = 'error';
        });
      });
    };

    PlexPin.prototype.create = function() {
      var $scope = this.$scope,
          self = this;

      $scope.state = 'create';

      // Ensure pin authentication has been enabled
      if($scope.enabled !== true) {
        console.debug('PIN authentication has been disabled, cancelling pin checks');
        return;
      }

      // Request new pin code
      plex.cloud.pins().then(function(data) {
        $scope.$apply(function() {
          // Update pin details
          $scope.current = data.pin;
          $scope.expires_at = new Date(data.pin.expires_at);

          $scope.state = 'check';
        });

        // Schedule pin check
        self.schedule(4000);
      }, function() {
        $scope.$apply(function() {
          $scope.state = 'error';

          self.reset();
        })
      })
    };

    PlexPin.prototype.reset = function() {
      var $scope = this.$scope;

      $scope.$apply(function() {
        $scope.current = null;
        $scope.expires_at = null;
        $scope.state = null;
      });
    };

    PlexPin.prototype.schedule = function(interval) {
      var self = this;

      if(typeof interval === 'undefined') {
        interval = this.interval;
      }

      // Schedule pin check
      $timeout(function() {
        self.check();
      }, interval);

      console.debug('Checking pin status in %sms', interval);
    };

    return {
      restrict: 'E',
      scope: {
        callback: '=coCallback',
        enabled: '=coEnabled'
      },
      templateUrl: 'directives/plex/pin.html',

      controller: function($scope) {
        // Set initial scope values
        $scope.current = null;
        $scope.expires_at = null;
        $scope.state = null;

        // Construct main controller
        var main = new PlexPin($scope);

        // Create initial pin
        main.create();
      }
    };
  });
