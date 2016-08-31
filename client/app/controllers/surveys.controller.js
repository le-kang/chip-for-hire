(function() {
  'use strict';

  angular
    .module('chipForHire')
    .controller('SurveysController', SurveysController);

  /** ngInject */
  function SurveysController($rootScope, Survey, SurveyItem, $mdDialog, $mdMedia, _) {
    var vm = this;
    vm.list = [];
    vm.selected = null;
    vm.smallScreen = $mdMedia('xs');

    vm.add = add;
    vm.select = select;
    vm.unselect = unselect;
    vm.addSurveyItem = addSurveyItem;

    Survey
      .find({
        filter: {
          where: {
            shopkeeperId: $rootScope.currentUser.id
          },
          include: ['surveyItems']
        }
      })
      .$promise
      .then(function(surveys) {
        vm.list = surveys;
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
      }, function() {

      });
    }

    function addSurveyItem($event) {
      $mdDialog
        .show({
          templateUrl: 'app/views/add-survey-item.html',
          controller: surveyItemController,
          controllerAs: 'surveyItem',
          targetEvent: $event,
          locals: {
            surveyId: vm.selected.id
          }
        })
        .then(function(surveyItem) {
          vm.selected.surveyItems.push(surveyItem);
        });

      function surveyItemController(surveyId) {
        var vm = this;
        vm.question = '';
        vm.option1 = '';
        vm.option2 = '';
        vm.option3 = '';
        vm.option4 = '';
        vm.create = create;
        vm.cancel = cancel;

        function create() {
          var options = _.uniq(_.compact([vm.option1, vm.option2, vm.option3, vm.option4]));
          console.log(options);
          if (options.length < 1) {
            return;
          }
          SurveyItem
            .create({
              question: vm.question,
              options: _.compact(options),
              surveyId: surveyId
            })
            .$promise
            .then(function(surveyItem) {
              $mdDialog.hide(surveyItem)
            })
        }

        function cancel() {
          console.log(11);
          $mdDialog.cancel();
        }
      }
    }

    function select(survey) {
      vm.selected = survey;
    }

    function unselect() {
      vm.selected = null;
    }
  }

})();
