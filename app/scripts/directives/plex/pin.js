'use strict';

angular.module('configurationApp')
  .directive('coPlexPin', function($timeout) {
    var intervalMinimum = 2000,
        intervalMaximum = 10000;

    function PlexPin($scope) {
      this.$scope = $scope;

      this.checks = 0;
      this.interval = intervalMinimum;

      // Bind scope functions
      var self = this;

      $scope.$on('reset', function() {
        self.reset();
      });
    }

    PlexPin.prototype.reset = function() {
      var $scope = this.$scope;

      // Reset handler
      this.checks = 0;
      this.interval = intervalMinimum;

      // Reset scope
      $scope.current = null;
      $scope.enabled = true;
      $scope.expires_at = null;
      $scope.state = null;
    };

    PlexPin.prototype.check = function() {
      console.debug('Checking pin status...');

      var $scope = this.$scope,
          self = this;

      // Ensure pin authentication has been enabled
      if($scope.enabled !== true) {
        console.debug('PIN authentication has been cancelled');
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
      this.checks += 1;

      plex.cloud["/pins"].get($scope.current.id).then(function(data) {
        if(data.pin.auth_token._nil === 'true') {
          // PIN not authenticated yet, schedule next check
          self.schedule();
          return;
        }

        // PIN has been authenticated
        $scope.$apply(function() {
          if($scope.enabled === true) {
            // Fire callback
            $scope.onAuthenticated({
              token: data.pin.auth_token
            });
          }

          $scope.state = 'complete';
        });
      }, function(data, status) {
        // Update state
        $scope.$apply(function() {
          $scope.state = 'complete';
        });

        // Fire callback
        $scope.onExpired();
      });
    };

    PlexPin.prototype.create = function() {
      var $scope = this.$scope,
          self = this;

      $scope.state = 'create';

      // Ensure pin authentication has been enabled
      if($scope.enabled !== true) {
        console.debug('PIN authentication has been cancelled');
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
        self.schedule(8000);
      }, function() {
        $scope.$apply(function() {
          $scope.state = 'error';

          self.reset();
        });
      })
    };

    PlexPin.prototype.schedule = function(interval) {
      var self = this;

      // Increase interval
      this.interval = Math.round(intervalMinimum + ((this.checks / 3) * 1000));

      if(this.interval > intervalMaximum) {
        // Ensure interval doesn't exceed the maximum
        this.interval = intervalMaximum;
      }

      // Use default interval
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
        onAuthenticated: '=coAuthenticated',
        onExpired: '=coExpired'
      },
      templateUrl: 'directives/plex/pin.html',

      controller: function($scope) {
        // Set initial scope values
        $scope.current = null;
        $scope.enabled = true;
        $scope.expires_at = null;
        $scope.state = null;

        // Construct main controller
        var main = new PlexPin($scope);

        // Create initial pin
        main.create();
      },

      link: function(scope, element, attrs) {
        element.on('$destroy', function() {
          // Disable pin checks
          scope.enabled = false;
        });
      }
    };
  });
