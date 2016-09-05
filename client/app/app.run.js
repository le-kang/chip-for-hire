(function() {
  'use strict';

  angular
    .module('chipForHire')
    .run(authenticate);

  /** @ngInject */
  function authenticate($rootScope, $state, $window, $timeout) {
    if (localStorage.getItem('getCurrentUser')) {
      localStorage.removeItem('getCurrentUser');
    }
    if (!sessionStorage.getItem('currentUser')) {
      localStorage.setItem('getCurrentUser', Date.now());
      $timeout(function() {
        localStorage.removeItem('getCurrentUser');
      }, 1)
    } else {
      $rootScope.currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    }

    $window.addEventListener('storage', function(event) {
      if (event.key == 'getCurrentUser' && event.newValue && sessionStorage.getItem('currentUser')) {
        localStorage.setItem('currentUser', sessionStorage.getItem('currentUser'));
        localStorage.removeItem('currentUser');
      } else if (event.key == 'currentUser' && event.newValue && !sessionStorage.getItem('currentUser')) {
        sessionStorage.setItem('currentUser', event.newValue);
        $rootScope.currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
      }
    });

    $rootScope.$on('$stateChangeStart', function(event, next) {
      secureRoute(event, next);
    });

    function secureRoute(event, route) {
      $rootScope.state = route.name;
      if (route.requireAuthentication) {
        if (localStorage.getItem('getCurrentUser')) {
          $timeout(function() {
            secureRoute(event, route)
          }, 2);
        } else {
          if (!$rootScope.currentUser) {
            event.preventDefault();
            $rootScope.state = route.requireAdmin ? 'authentication.admin-login' : 'authentication.shopkeeper-login';
            $state.go($rootScope.state);
          } else {
            if (route.requireAdmin && $rootScope.currentUser.role != 'Admin') {
              event.preventDefault();
              $rootScope.state = 'authentication.admin-login';
              $state.go($rootScope.state);
            } else if (!route.requireAdmin && $rootScope.currentUser.role == 'Admin') {
              event.preventDefault();
              $rootScope.state = 'authentication.shopkeeper-login';
              $state.go($rootScope.state);
            }
          }
        }
      }
    }
  }
})();
