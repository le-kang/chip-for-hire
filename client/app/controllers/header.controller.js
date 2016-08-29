(function() {
  'use strict';

  angular
    .module('chipForHire')
    .controller('HeaderController', HeaderController);

  /** ngInject */
  function HeaderController($mdSidenav) {
    var vm = this;
    vm.toggleMenu = toggleMenu;

    function toggleMenu() {
      $mdSidenav('menu').toggle();
    }
  }

})();
