(function() {
  'use strict';

  angular
    .module('chipForHire')
    .controller('ActivityController', ActivityController);

  /** ngInject */
  function ActivityController($rootScope, $scope, Shopkeeper, $http, socket, $state, $stateParams, _, $timeout, $mdToast) {
    var vm = this;
    vm.selected = null;
    vm.save = save;
    vm.unselect = unselect;

    getSelected();

    function getSelected() {
      if ($scope.$parent.activities.fetching) {
        $timeout(getSelected, 100)
      } else {
        vm.selected = _.find($scope.$parent.activities.list, { id: $stateParams.id });
        if (!vm.selected) {
          $state.go('main.view.activities');
          $mdToast.show(
            $mdToast
              .simple()
              .textContent("Activity not found")
              .hideDelay(3000)
          )
        } else {
          $scope.$parent.activities.selected = vm.selected;
          initSocket();
          if (!vm.selected.started) {
            vm.products = $scope.$parent.activities.products;
            vm.surveys = $scope.$parent.activities.surveys;
          } else if (!vm.selected.ended) {
            prepareStream();
          } else {
            synthesiseSurveyResults();
          }
        }
      }
    }

    function initSocket() {
      socket.connect();
      socket.on('start:activity', function(id) {
        if (id == vm.selected.id) {
          vm.selected.started = true;
          $scope.$parent.$emit('regroup-activities');
          $mdToast.show(
            $mdToast
              .simple()
              .textContent("Your current activity is started.")
              .hideDelay(3000)
          );
          prepareStream();
        }
      });
      socket.on('end:activity', function(data) {
        if (data.id == vm.selected.id) {
          vm.selected.ended = true;
          vm.selected.surveyResults = data.surveyResults;
          $scope.$parent.$emit('regroup-activities');
          $mdToast.show(
            $mdToast
              .simple()
              .textContent("Your current activity is ended.")
              .hideDelay(3000)
          );
          synthesiseSurveyResults();
        }
      });
      $scope.$on('$destroy', function() {
        socket.disconnect();
      });
    }

    function save() {
      Shopkeeper
        .activities
        .updateById(
          {
            id: $rootScope.currentUser.id,
            fk: vm.selected.id
          },
          {
            productId: vm.selected.productId,
            surveyId: vm.selected.surveyId
          }
        )
        .$promise
        .then(function(activity) {
          vm.selected = activity;
          $mdToast.show(
            $mdToast
              .simple()
              .textContent("Activity updated")
              .hideDelay(3000)
          );
        })
    }

    function unselect() {
      vm.selected = null;
      $scope.$parent.activities.selected = null;
      $state.go('main.view.activities');
    }

    function prepareStream() {
      $http
        .get('/stream-token?activityId=' + vm.selected.id)
        .then(function(response) {
          vm.streamToken = response.data.streamToken;
        });
    }

    function synthesiseSurveyResults() {
      vm.results = [];
      _.forEach(vm.selected.surveyResults, function(surveyResult) {
        _.forEach(surveyResult, function(survey) {
          var result = _.find(vm.results, { question: survey.question });
          if (result) {
            var answerIndex = _.indexOf(result['answers'], survey.answer);
            if (answerIndex < 0) {
              result['answers'].push(survey.answer);
              result['answersCount'].push(1);
            } else {
              result['answersCount'][answerIndex]++;
            }
          } else {
            result = {};
            result['question'] = survey.question;
            result['answers'] = [];
            result['answersCount'] = [];
            result['answers'].push(survey.answer);
            result['answersCount'].push(1);
            vm.results.push(result);
          }
        });
      });
    }
  }

})();
