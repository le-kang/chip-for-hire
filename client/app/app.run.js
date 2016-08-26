(function() {
  'use strict';

  angular
    .module('chipForHire')
    .run(authenticate);

  /** @ngInject */
  function authenticate($rootScope, $state, $window, $timeout) {
    if (!sessionStorage.getItem('currentUser')) {
      localStorage.setItem('getCurrentUser', Date.now());
      $timeout(function() {
        localStorage.removeItem('getCurrentUser');
      })
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
      if (route.requireAuthentication) {
        if (localStorage.getItem('getCurrentUser')) {
          $timeout(function() {
            secureRoute(event, route)
          }, 1);
        } else {
          if (!$rootScope.currentUser) {
            event.preventDefault();
            $state.go('login');
          }
        }
      }
    }
  }
})();
