'use strict';

angular.module('configurationApp')
  .directive('coTraktLogin', function(Utils, $http) {
    var tr = new trakt.Client(
      'c9ccd3684988a7862a8542ae0000535e0fbd2d1c0ca35583af7ea4e784650a61',
      'bf00575b1ad252b514f14b2c6171fe650d474091daad5eb6fa890ef24d581f65'
    );

    function TraktLogin($scope) {
      this.$scope = $scope;

      // Bind scope functions
      var self = this;

      $scope.basicLogin = function() {
        self.basicLogin();
      };

      $scope.pinLogin = function() {
        self.pinLogin();
      };

      $scope.switch = function(method) {
        $scope.errors = [];
        $scope.method = method;
      };
    }

    TraktLogin.prototype.reset = function() {
      var $scope = this.$scope;

      // Reset state
      $scope.errors = [];
      $scope.method = 'pin';
    };

    TraktLogin.prototype.basicLogin = function() {
      var $scope = this.$scope;

      // Fire callback
      $scope.basicAuthenticated({
        credentials: $scope.basic
      });
    };

    TraktLogin.prototype.pinLogin = function() {
      var $scope = this.$scope,
          self = this;

      // Reset messages
      this.errors = [];

      // Request token for pin code
      tr.oauth.token($scope.pin.code).then(function(authorization) {
        console.log('TraktLogin - authorization successful', self);

        // Request account details
        return tr['users/settings'].get(authorization.access_token).then(function(settings) {
          // Fire callback
          $scope.pinAuthenticated({
            authorization: authorization,
            credentials: $scope.pin,
            settings: settings
          });
        }, function(data, status) {
          console.log('TraktLogin - unable to retrieve account details', self);
        });
      }, function(data, status) {
        // Retrieve error message
        var error = null;

        if(data.error === 'invalid_grant') {
          error = 'Invalid authentication pin provided';
        } else if(typeof data.error_description !== 'undefined') {
          error = data.error_description;
        } else if(typeof data.error !== 'undefined') {
          error = data.error;
        } else {
          error = 'HTTP Error: ' + status;
        }

        // Update messages
        self.errors.push(error);

        console.log('TraktLogin - authorization failure', self);
      });
    };

    return {
      restrict: 'E',
      scope: {
        buttonSize: '@coButtonSize',
        cancelled: '=coCancelled',

        basic: '=coBasic',
        basicAuthenticated: '&coBasicAuthenticated',

        pin: '=coPin',
        pinAuthenticated: '&coPinAuthenticated'
      },
      templateUrl: 'directives/trakt/login.html',

      controller: function($scope) {
        // Set parameter defaults
        if(typeof $scope.buttonSize === 'undefined') {
          $scope.buttonSize = 'small';
        }

        if(typeof $scope.basic === 'undefined') {
          $scope.basic = {
            username: null,
            password: null
          };
        }

        if(typeof $scope.pin === 'undefined') {
          $scope.pin = {
            code: null
          };
        }

        // Set initial scope values
        $scope.errors = [];
        $scope.method = 'pin';

        // Construct main controller
        var main = new TraktLogin($scope);
      }
    };
  });
