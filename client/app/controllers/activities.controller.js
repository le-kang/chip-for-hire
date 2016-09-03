(function() {
  'use strict';

  angular
    .module('chipForHire')
    .controller('ActivitiesController', ActivitiesController);

  /** @ngInject */
  function ActivitiesController() {
    var vm = this;
    vm.list = [];
  }

})();
