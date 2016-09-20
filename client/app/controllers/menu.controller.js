(function() {
  'use strict';

  angular
    .module('chipForHire')
    .controller('MenuController', MenuController);

  /** @ngInject */
  function MenuController($rootScope, $state, $mdSidenav) {
    var vm = this;
    vm.navigate = navigate;
    vm.isCurrentState = isCurrentState;

    function isCurrentState(stateName) {
      return $state.is(stateName);
    }

    function navigate(stateName) {
      if (!isCurrentState(stateName)) {
        $mdSidenav('menu').close();
        $state.go(stateName);
      }
    }
  }

})();
