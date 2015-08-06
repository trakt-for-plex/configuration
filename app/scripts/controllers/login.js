'use strict';

/**
 * @ngdoc function
 * @name configurationApp.controller:LoginController
 * @description
 * # LoginController
 * Controller of the configurationApp
 */
angular.module('configurationApp')
  .controller('LoginController', function(Authentication, $location, $modal, $scope, $timeout) {
    $scope.credentials = {
      username: null,
      password: null
    };
    $scope.errors = [];
    $scope.method = 'pin';

    // PIN authentication
    $scope.pin = {
      data: null,
      expires_at: null,

      opened: function() {
        // Create new pin code
        plex.cloud.pins().then(function(data) {
          // Store pin details
          $scope.pin.data = data.pin;
          $scope.pin.expires_at = new Date(data.pin.expires_at);

          // Schedule pin checks
          $timeout(function() {
            $scope.pin.check(2000);
          }, 4000);
        }, function(error) {
          console.log(error);

          $scope.pin.reset();
        });
      },
      check: function(interval) {
        console.debug('Checking pin status...');

        // Ensure method is valid
        if($scope.method !== 'pin') {
          console.debug('Login method changed, pin authentication cancelled');
          $scope.pin.reset();
          return;
        }

        // Ensure pin details are valid
        if(typeof $scope.pin.data === 'undefined' || $scope.pin.data === null || $scope.pin.data.id === null) {
          console.warn('Invalid pin data', $scope.pin.data);
          $scope.pin.reset();
          return;
        }

        // Ensure pin hasn't expired
        if(new Date() > $scope.pin.expires_at) {
          console.debug('Pin has expired');
          $scope.pin.reset();
          return;
        }

        // Check if pin is authenticated
        plex.cloud["/pins"].get($scope.pin.data.id).then(function(data) {
          if(data.pin.auth_token._nil === 'true') {
            // PIN not authenticated yet, schedule next check
            $scope.pin.schedule(interval);
            return;
          }

          // Complete login
          return Authentication.login({token: data.pin.auth_token}).then(function(user) {
            $scope.$r.redirect();
          }, function(data, status) {
            return $q.reject();
          });
        }, function(error) {
          console.log(error);

          // Schedule next check
          //$scope.pin.schedule(interval);
        });
      },
      schedule: function(interval) {
        // Schedule next pin check at `interval`
        $timeout(function() {
          $scope.pin.check(interval);
        }, interval);

        console.debug('Checking pin status in %sms', interval);
      },
      reset: function() {
        $scope.pin.data = null;
        $scope.pin.expires_at = null;
      }
    };

    // Basic authentication
    $scope.basic = {
      login: function() {
        // Reset errors
        $scope.errors = [];

        Authentication.login($scope.credentials).then(function() {
          // Login successful
          $scope.$r.redirect();
        }, function(data, status) {
          // Login failed
          if(typeof data !== 'undefined' && data !== null) {
            // Display API errors
            $scope.errors = $scope.errors.concat(
              typeof data.errors.error === 'object' ?
                data.errors.error : [data.errors.error]
            );
          } else {
            // Display HTTP error
            $scope.errors.push('HTTP Error: ' + status);
          }
        });
      }
    };

    $scope.switch = function(method) {
      $scope.method = method;
    };

    $scope.showAuthenticationDetails = function() {
      var modal = $modal.open({
        templateUrl: 'modals/authenticationDetails.html',
        windowClass: 'small'
      });

      modal.result.then(function() {
        console.log('Modal closed');
      }, function () {
        console.log('Modal dismissed');
      });
    };

    // Initial load
    $scope.pin.opened();
  });
