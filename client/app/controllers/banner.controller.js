(function() {
  'use strict';

  angular
    .module('chipForHire')
    .controller('BannerController', BannerController);

  /** ngInject */
  function BannerController($timeout) {
    var vm = this;
    vm.hidden = false;
    vm.showArrow = false;
    vm.hide = hide;

    $timeout(function() {
      vm.showArrow = true;
    }, 2000);

    function hide() {
      vm.hidden = true;
    }
  }

})();
