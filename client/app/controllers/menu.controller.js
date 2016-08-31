(function() {
  'use strict';

  angular
    .module('chipForHire')
    .controller('MenuController', MenuController);

  /** @ngInject */
  function MenuController($rootScope, auth, $state, $mdSidenav) {
    var vm = this;
    vm.navigate = navigate;
    vm.logout = logout;

    function navigate(stateName) {
      if ($rootScope.state != stateName) {
        $mdSidenav('menu').close();
        $state.go(stateName);
      }
    }

    function logout() {
      auth
        .logout()
        .then(function() {
          $state.go('login');
        });
    }
  }

})();
