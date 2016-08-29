(function() {
  'use strict';

  angular
    .module('chipForHire')
    .controller('MenuController', MenuController);

  /** @ngInject */
  function MenuController($rootScope, auth, $state) {
    var vm = this;
    vm.navigate = navigate;
    vm.logout = logout;

    function navigate(stateName) {
      if ($rootScope.state != stateName) {
        $state.go(stateName);
      }
    }

    function logout() {
      auth
        .logout()
        .then(function() {
          $state.go('login')
        });
    }
  }

})();
