(function() {
  'use strict';

  angular
    .module('chipForHire')
    .controller('AdminController', AdminController);

  /** @ngInject */
  function AdminController() {
    var vm = this;
    vm.timeSlots = [];
    vm.news = [];
  }

})();
