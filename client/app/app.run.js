(function() {
  'use strict';

  angular
    .module('chipForHire')
    .run(authenticate);

  /** @ngInject */
  function authenticate($rootScope, $state, $window, $timeout, _, LoopBackAuth) {
    $window.addEventListener('storage', function(event) {
      if (event.key == 'getSessionStorage') {
        localStorage.setItem('sessionStorage', JSON.stringify(sessionStorage));
        localStorage.removeItem('sessionStorage');
      } else if (event.key == 'sessionStorage' && !sessionStorage.length) {
        var data = JSON.parse(event.newValue);
        _.forEach(data, function(value, key) {
          sessionStorage.setItem(key, value);
        })
      }
    });

    $rootScope.$on('$stateChangeStart', function(event, next) {
      $rootScope.currentUser = getCurrentUserFromStorage();
      if (next.access && !$rootScope.currentUser) {
        event.preventDefault();
        // try to get currentUser from other session storage
        localStorage.setItem('getSessionStorage', Date.now());
        // wait for 0.1 second and check again
        $timeout(function() {
          $rootScope.currentUser = getCurrentUserFromStorage(sessionStorage);
          // check if other session has current user and the access matches the role
          if (!$rootScope.currentUser || $rootScope.currentUser.role != next.access) {
            $state.go('authentication.' + next.access.toLowerCase() +'-login');
          } else {
            LoopBackAuth.currentUserId = sessionStorage.getItem('$LoopBack$currentUserId');
            LoopBackAuth.accessTokenId = sessionStorage.getItem('$LoopBack$accessTokenId');
            $state.go(next.name);
          }
        }, 100)
      } else if (next.access && $rootScope.currentUser.role != next.access) {
        event.preventDefault();
        $state.go('authentication.' + next.access.toLowerCase() +'-login');
      }
    });

    function getCurrentUserFromStorage(storage) {
      var currentUserInString, currentUser;
      if (!storage) {
        currentUserInString = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
      } else {
        currentUserInString = storage.getItem('currentUser');
      }
      try {
        currentUser = JSON.parse(currentUserInString);
      } catch(e) {
        currentUser = null;
      }
      return currentUser;
    }
  }
})();
