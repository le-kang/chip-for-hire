(function() {
  'use strict';

  angular
    .module('chipForHire')
    .controller('LoginController', LoginController);

  /** ngInject */
  function LoginController(auth, $state) {
    var vm = this;
    vm.name = '';
    vm.email = '';
    vm.password = '';
    vm.login = login;

    function login(role) {
      auth['loginAs' + role](vm.email, vm.password)
        .then(function() {
          $state.go(role == 'Admin' ? 'admin' : 'main.view.home');
        }, function() {

        });
    }
  }

})();
