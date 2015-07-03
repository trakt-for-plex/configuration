'use strict';

/**
 * @ngdoc overview
 * @name configurationApp
 * @description
 * # configurationApp
 *
 * Main module of the application.
 */
angular
  .module('configurationApp', [
    'ngAnimate',
    'ngAria',
    'ngCookies',
    'ngMessages',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',

    'mm.foundation',
    'xml'
  ])
  .config(function ($httpProvider, $routeProvider) {
    // Setup angular-xml
    $httpProvider.interceptors.push('xmlHttpInterceptor');

    // Setup routes
    $routeProvider
      .when('/', {
        templateUrl: 'views/home.html',
        controller: 'HomeController',
        controllerAs: 'home'
      })
      .when('/accounts', {
        templateUrl: 'views/configuration/accounts.html',
        controller: 'AccountsController',
        controllerAs: 'accounts'
      })
      .when('/connect', {
        templateUrl: 'views/connect.html',
        controller: 'ConnectController',
        controllerAs: 'home'
      })
      .when('/login', {
        templateUrl: 'views/login.html',
        controller: 'LoginController',
        controllerAs: 'login'
      })
      .when('/server', {
        templateUrl: 'views/configuration/server.html',
        controller: 'ServerController',
        controllerAs: 'server'
      })
      .otherwise({
        redirectTo: '/login'
      });
  })
  .run(function(PAuthentication, $location, $rootScope) {
    $rootScope.$a = {
      originalPath: null,

      authenticated: false,
      user: null
    };

    $rootScope.$on('$routeChangeStart', function(event, next) {
      var controller = next.controller;

      if(controller === 'LoginController') {
        return;
      }

      if(!PAuthentication.authenticated()) {
        $rootScope.$a.authenticated = false;

        next.resolve = angular.extend(next.resolve || {}, {
          __authenticate__: function() {
            PAuthentication.get().then(function() {
              $rootScope.$a.authenticated = true;
              $rootScope.$a.user = PAuthentication.user();

              console.log('authenticated');
            }, function() {
              $rootScope.$a.originalPath = next.originalPath;

              $location.path('/login');
            });
          }
        });
      } else {
        $rootScope.$a.authenticated = true;
      }

      if($rootScope.$s === null || typeof $rootScope.$s === 'undefined') {
        $location.path('/connect');
      }
    });
  });
