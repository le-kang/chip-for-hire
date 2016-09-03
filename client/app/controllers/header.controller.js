(function() {
  'use strict';

  angular
    .module('chipForHire')
    .controller('HeaderController', HeaderController);

  /** ngInject */
  function HeaderController($mdSidenav, auth, $state) {
    var vm = this;
    vm.toggleMenu = toggleMenu;
    vm.logoutAsAdmin = logoutAsAdmin;

    function toggleMenu() {
      $mdSidenav('menu').toggle();
    }

    function logoutAsAdmin() {
      auth
        .logoutAsAdmin()
        .then(function() {
          $state.go('admin-login');
        });
    }
  }

})();
