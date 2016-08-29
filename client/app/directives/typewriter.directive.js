(function() {
  'use strict';

  angular
    .module('chipForHire')
    .directive('typewriter', typewriter);

  /** @ngInject */
  function typewriter(malarkey) {
    var directive = {
      restrict: 'A',
      scope: {
        value: '@',
        speed: '='
      },
      link: link
    };

    return directive;

    function link(scope, el) {
      el.addClass('typewriter');
      var typewriter = malarkey(el[0], { typeSpeed: scope.speed });
      typewriter.type(scope.value);
    }
  }

})();
