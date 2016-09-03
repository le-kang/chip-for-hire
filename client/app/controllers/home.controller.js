(function() {
  'use strict';

  angular
    .module('chipForHire')
    .controller('HomeController', HomeController);

  /** @ngInject */
  function HomeController() {
    var vm = this;
    vm.timeSlots = [];
    vm.news = [];
  }

})();
