(function() {
  'use strict';

  angular
    .module('chipForHire')
    .controller('SurveysController', SurveysController);

  /** ngInject */
  function SurveysController($rootScope, Survey, $mdDialog, $mdMedia) {
    var vm = this;
    vm.list = [];
    vm.fetching = true;
    vm.selected = null;
    vm.smallScreen = $mdMedia('xs');
    vm.add = add;

    Survey
      .find({
        filter: {
          where: {
            shopkeeperId: $rootScope.currentUser.id
          },
          include: {
            relation: 'surveyItems',
            scope: {
              order: 'order ASC'
            }
          }
        }
      })
      .$promise
      .then(function(surveys) {
        vm.list = surveys;
        vm.fetching = false;
      }, function() {
        vm.fetching = false;
      });

    function add($event) {
      var dialog = $mdDialog.prompt()
        .title('What would you name your survey?')
        .placeholder('Survey name')
        .ariaLabel('Survey name')
        .targetEvent($event)
        .ok('Add')
        .cancel('Cancel');
      $mdDialog.show(dialog).then(function(name) {
        Survey
          .create({
            name: name,
            shopkeeperId: $rootScope.currentUser.id
          })
          .$promise
          .then(function(survey) {
            survey.surveyItems = [];
            vm.list.push(survey);
          })
      });
    }
  }

})();
