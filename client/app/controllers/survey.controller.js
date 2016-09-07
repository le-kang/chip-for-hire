(function() {
  'use strict';

  angular
    .module('chipForHire')
    .controller('SurveyController', SurveyController);

  /** ngInject */
  function SurveyController($scope, $state, $stateParams, _, $timeout, $q, Survey, $mdToast, $mdDialog) {
    var vm = this;
    vm.selected = null;
    vm.addSurveyItem = addSurveyItem;
    vm.editSurveyItem = editSurveyItem;
    vm.removeSurveyItem = removeSurveyItem;
    vm.unselect = unselect;
    vm.uiTreeOption = {
      dropped: setItemsOrder
    };

    getSelected();

    function getSelected() {
      if ($scope.$parent.surveys.fetching) {
        $timeout(getSelected, 100)
      } else {
        vm.selected = _.find($scope.$parent.surveys.list, { id: $stateParams.id });
        if (!vm.selected) {
          $state.go('main.view.surveys');
          $mdToast.show(
            $mdToast
              .simple()
              .textContent("Survey not found")
              .hideDelay(3000)
          )
        } else {
          $scope.$parent.surveys.selected = vm.selected;
        }
      }
    }

    function addSurveyItem($event) {
      $mdDialog
        .show({
          templateUrl: 'app/views/edit-survey-item.html',
          controller: surveyItemController,
          controllerAs: 'surveyItem',
          targetEvent: $event,
          locals: {
            survey: vm.selected,
            surveyItem: null
          }
        })
        .then(function(surveyItem) {
          vm.selected.surveyItems.push(surveyItem);
        });
    }

    function editSurveyItem(surveyItem, $event) {
      $mdDialog
        .show({
          templateUrl: 'app/views/edit-survey-item.html',
          controller: surveyItemController,
          controllerAs: 'surveyItem',
          targetEvent: $event,
          locals: {
            survey: vm.selected,
            surveyItem: surveyItem
          }
        })
        .then(function(updated) {
          var item = _.find(vm.selected.surveyItems, {id: surveyItem.id});
          _.set(item, 'question', updated.question);
          _.set(item, 'options', updated.options);
          $mdToast.show(
            $mdToast
              .simple()
              .textContent("Survey question updated")
              .hideDelay(3000)
          )
        });
    }

    function removeSurveyItem(surveyItem, $event) {
      var confirm = $mdDialog.confirm()
        .title('Are you sure to delete this question from survey?')
        .textContent('You cannot retrieve the deleted question back')
        .ariaLabel('Deleting Confirmation')
        .targetEvent($event)
        .ok('Yes')
        .cancel('No');
      $mdDialog.show(confirm).then(function() {
        Survey
          .surveyItems
          .destroyById({
            id: vm.selected.id,
            fk: surveyItem.id
          })
          .$promise
          .then(function() {
            _.remove(vm.selected.surveyItems, function(item) {
              return item.id == surveyItem.id;
            });
            setItemsOrder();
          });
      });
    }

    function unselect() {
      vm.selected = null;
      $scope.$parent.surveys.selected = null;
      $state.go('main.view.surveys');
    }

    function setItemsOrder() {
      var jobList = [];
      _.forEach(vm.selected.surveyItems, function(item, index) {
        var oldOrder = item.order;
        item.order = index + 1;
        if (item.order != oldOrder) {
          jobList.push(
            Survey
              .surveyItems
              .updateById(
                {
                  id: vm.selected.id,
                  fk: item.id
                },
                { order: item.order }
              )
              .$promise
          );
        }
      });
      if (jobList.length > 0) {
        $q
          .all(jobList)
          .then(function() {
            $mdToast.show(
              $mdToast
                .simple()
                .textContent("Survey updated")
                .hideDelay(3000)
            )
          })
      }
    }

    function surveyItemController(survey, surveyItem) {
      var vm = this;
      vm.id = surveyItem ? surveyItem.id : null;
      vm.question = surveyItem ? surveyItem.question : '';
      vm.options = surveyItem ? _.clone(surveyItem.options) : [];
      vm.submit = submit;
      vm.cancel = cancel;

      function submit() {
        if (!vm.id) {
          Survey
            .surveyItems
            .create(
              { id: survey.id },
              {
                question: vm.question,
                options: vm.options,
                order: survey.surveyItems.length + 1,
                surveyId: survey.id
              }
            )
            .$promise
            .then(function(surveyItem) {
              $mdDialog.hide(surveyItem)
            });
        } else {
          Survey
            .surveyItems
            .updateById(
              {
                id: survey.id,
                fk: vm.id
              },
              {
                question: vm.question,
                options: vm.options
              }
            )
            .$promise
            .then(function(surveyItem) {
              $mdDialog.hide(surveyItem)
            });
        }
      }

      function cancel() {
        $mdDialog.cancel();
      }
    }
  }

})();
