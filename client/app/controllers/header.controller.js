(function() {
  'use strict';

  angular
    .module('chipForHire')
    .controller('HeaderController', HeaderController);

  /** ngInject */
  function HeaderController($mdSidenav, auth, $state) {
    var vm = this;
    vm.toggleMenu = toggleMenu;
    vm.logout = logout;

    function toggleMenu() {
      $mdSidenav('menu').toggle();
    }

    function logout(role) {
      auth['logoutAs' + role]()
        .then(function() {
          $state.go(role == 'Admin' ? 'authentication.admin-login' : 'authentication.shopkeeper-login');
        });
    }
  }

})();
