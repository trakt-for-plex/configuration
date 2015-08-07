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
    'ngRaven',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',

    'angulartics',
    'angulartics.google.analytics',

    'angularSpinner',
    'mm.foundation',
    'selectize',
    'xml'
  ])
  .config(function ($httpProvider, $ravenProvider, $routeProvider) {
    // Setup angular-raven
    // $ravenProvider.development(true);

    // Setup angular-xml
    $httpProvider.interceptors.push('xmlHttpInterceptor');

    // Setup routes
    $routeProvider
      .when('/', {
        templateUrl: 'views/home.html',
        controller: 'HomeController'
      })
      .when('/configuration/server', {
        templateUrl: 'views/configuration/server.html',
        controller: 'ServerController'
      })
      .when('/configuration/accounts', {
        templateUrl: 'views/configuration/accounts.html',
        controller: 'AccountsController',
        reloadOnSearch: false
      })
      .when('/configuration/rules', {
        templateUrl: 'views/configuration/rules.html',
        controller: 'RulesController'
      })
      .when('/connect', {
        templateUrl: 'views/connect.html',
        controller: 'ConnectController'
      })
      .when('/login', {
        templateUrl: 'views/login.html',
        controller: 'LoginController'
      })
      .when('/logout', {
        templateUrl: 'views/logout.html',
        controller: 'LogoutController'
      })
      .otherwise({
        redirectTo: '/'
      });
  })
  .run(function(Authentication, RavenTags, $location, $rootScope) {
    var $m = window.tfpc.metadata;

    // Store metadata in root scope
    $rootScope.$m = $m;

    // Send version/revision with error reports
    RavenTags.update({
      application_version: $m.version,
      application_revision: $m.revision.label
    });

    // Setup plex.js
    plex.cloud.http.headers.setProduct('trakt (for Plex) - Configuration', '1.0.0');
    plex.cloud.http.xmlParser = 'x2js';

    if(typeof localStorage['plex.client.identifier'] === 'undefined' ||
       localStorage['plex.client.identifier'] === null) {
      localStorage['plex.client.identifier'] = plex.utils.random.string();
    }

    plex.cloud.client_identifier = localStorage['plex.client.identifier'];

    // Redirect handler
    $rootScope.$r = {
      path: null,
      search: null,

      redirect: function() {
        var path, search;

        // Get path
        if(typeof this.path !== 'undefined' && this.path !== null) {
          // Original
          path = this.path;
        } else {
          // Home
          path = '/';
        }

        // Get search query
        if(typeof this.search !== 'undefined' && this.search !== null) {
          // Original
          search = this.search;
        } else {
          // Home
          search = '';
        }

        // Ensure destination is valid
        if(this.path === $location.path()) {
          path = '/';
          search = '';
        }

        // Redirect
        console.log('redirecting to %s (%s)', path, search);

        $location.path(path);
        $location.search(search);
      }
    };

    $rootScope.$on('$routeChangeStart', function(event, next) {
      var controller = next.controller;

      if(controller === 'LoginController') {
        return;
      }

      if(!Authentication.authenticated()) {
        next.resolve = angular.extend(next.resolve || {}, {
          __authenticate__: function() {
            return Authentication.get().then(function() {
              console.log('authenticated');
            }, function() {
              $rootScope.$r.path = $location.path();
              $rootScope.$r.search = $location.search();

              $location.path('/login');
              $location.search('');
            });
          }
        });
      }

      if(controller === 'ConnectController' || controller === 'LogoutController') {
        return;
      }

      if($rootScope.$s === null || typeof $rootScope.$s === 'undefined') {
        $rootScope.$r.path = $location.path();
        $rootScope.$r.search = $location.search();

        $location.path('/connect');
        $location.search('');
      }
    });
  });
