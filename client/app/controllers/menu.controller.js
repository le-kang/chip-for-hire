(function() {
  'use strict';

  angular
    .module('chipForHire')
    .controller('MenuController', MenuController);

  /** @ngInject */
  function MenuController($rootScope, $state, $mdSidenav) {
    var vm = this;
    vm.navigate = navigate;

    function navigate(stateName) {
      if ($rootScope.state != stateName) {
        $mdSidenav('menu').close();
        $state.go(stateName);
      }
    }
  }

})();
