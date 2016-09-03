(function() {
  'use strict';

  angular
    .module('chipForHire')
    .controller('AdminLoginController', AdminLoginController);

  /** ngInject */
  function AdminLoginController(auth, $state) {
    var vm = this;
    vm.email = '';
    vm.password = '';
    vm.login = login;

    function login() {
      auth
        .loginAsAdmin(vm.email, vm.password)
        .then(function() {
          $state.go('admin');
        }, function() {

        });
    }
  }

})();
