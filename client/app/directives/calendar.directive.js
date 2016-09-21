(function() {
  'use strict';

  angular
    .module('chipForHire')
    .directive('calendar', calendar);

  /** @ngInject */
  function calendar($rootScope, TimeSlot, Shopkeeper, moment, _, socket, $mdDialog, $mdToast, $state) {
    var directive = {
      restrict: 'E',
      scope: {},
      bindToController: {
        timeSlots: '=',
        activities: '=',
        products: '=',
        surveys: '='
      },
      controller: controller,
      controllerAs: 'cal',
      templateUrl: 'app/views/calendar.html',
      link: function(scope) {
        scope.$on('$destroy', function() {
          socket.disconnect();
        });
      }
    };

    return directive;

    /** @ngInject */
    function controller($scope) {
      var vm = this;
      vm.role = $rootScope.currentUser.role;
      vm.today = moment().startOf('day');
      vm.currentDate = vm.today;
      vm.startDate = vm.currentDate.clone().startOf('week');
      vm.hours = ['09', '10', '11', '12', '13', '14', '15', '16'];
      vm.week = [];
      vm.availableDates = [];
      vm.activityDates = [];
      vm.isAdmin = isAdmin;
      vm.isCurrentWeek = isCurrentWeek;
      vm.isToday = isToday;
      vm.isBeforeToday = isBeforeToday;
      vm.isCurrentDay = isCurrentDay;
      vm.selectDay = selectDay;
      vm.isWeekend = isWeekend;
      vm.getTimeSlots = getTimeSlots;
      vm.getActivities = getActivities;
      vm.nextWeek = nextWeek;
      vm.previousWeek = previousWeek;
      vm.isAvailable = isAvailable;
      vm.isReserved = isReserved;
      vm.releaseSlot = releaseSlot;
      vm.closeSlot = closeSlot;
      vm.reserve = reserve;
      vm.viewActivity = viewActivity;
      vm.cancelActivity = cancelActivity;
      vm.cancelReservation = cancelReservation;

      $scope.$watch(function() {
        return vm.timeSlots;
      }, function() {
        vm.availableDates = _.map(_.uniq(_.map(vm.timeSlots, 'date')), function(date) {
          return moment(date);
        });
      });
      $scope.$watch(function() {
        return vm.activities;
      }, function() {
        vm.activityDates = _.map(_.uniq(_.map(vm.activities, 'timeSlot.date')), function(date) {
          return moment(date);
        });
      });

      getWeek();
      initSocket();

      function getWeek() {
        vm.week = [];
        for (var i = 0; i < 7; i++) {
          vm.week.push(vm.startDate.clone().add(i, 'days'));
        }
        return vm.week;
      }

      function initSocket() {
        socket.connect();
        if (isAdmin()) {
          // inform admin of new activity
          socket.on('add:activity', function(activity) {
            vm.activities.push(activity);
            var time = moment(activity.timeSlot.date).format('DD/MM/YYYY') + " " + activity.timeSlot.hour + ":00";
            $mdToast.show(
              $mdToast
                .simple()
                .textContent("Time slot (" + time + ") has been reserved by " + activity.shopkeeper.name)
                .hideDelay(3000)
            );
          });
          // inform admin of activity cancellation
          socket.on('cancel:activity', function(activity) {
            _.remove(vm.activities, function(a) {
              if (a.id == activity.id) {
                var time = a.timeSlot.hour + ":00 on " + moment(a.timeSlot.date).format('DD/MM/YYYY');
                $mdToast.show(
                  $mdToast
                    .simple()
                    .textContent("The activity at " + time + " has been cancelled by " + a.shopkeeper.name)
                    .hideDelay(3000)
                );
                return true;
              }
              return false;
            });
          });
        } else {
          // inform shopkeeper of new available time slot
          socket.on('add:time slot', function(timeSlot) {
            vm.timeSlots.push(timeSlot);
            var time = moment(timeSlot.date).format('DD/MM/YYYY') + " " + timeSlot.hour + ":00";
            $mdToast.show(
              $mdToast
                .simple()
                .textContent("New time slot is available: " + time)
                .hideDelay(3000)
            );
          });
          // inform shopkeeper of new available time slot that was released from a cancellation of activity
          socket.on('free:time slot', function(data) {
            if (data.shopkeeperId != $rootScope.currentUser.id) {
              vm.timeSlots.push(data.timeSlot);
              var time = moment(data.timeSlot.date).format('DD/MM/YYYY') + " " + data.timeSlot.hour + ":00";
              $mdToast.show(
                $mdToast
                  .simple()
                  .textContent("New time slot is available: " + time)
                  .hideDelay(3000)
              );
            }
          });
          // inform shopkeeper of removed time slot
          socket.on('remove:time slot', function(timeSlot) {
            _.remove(vm.timeSlots, function(t) {
              if (t.id == timeSlot.id) {
                var time = moment(t.date).format('DD/MM/YYYY') + " " + t.hour + ":00";
                $mdToast.show(
                  $mdToast
                    .simple()
                    .textContent("Time slot (" + time + ") is no longer available")
                    .hideDelay(3000)
                );
                return true;
              }
              return false;
            });
          });
          // inform shopkeeper of reserved time slot by other shopkeeper
          socket.on('reserve:time slot', function(data) {
            if (data.shopkeeperId != $rootScope.currentUser.id) {
              _.remove(vm.timeSlots, function(timeSlot) {
                if (timeSlot.id == data.timeSlotId) {
                  var time = moment(timeSlot.date).format('DD/MM/YYYY') + " " + timeSlot.hour + ":00";
                  $mdToast.show(
                    $mdToast
                      .simple()
                      .textContent("Time slot (" + time + ") has been reserved")
                      .hideDelay(3000)
                  );
                  return true;
                }
                return false;
              });
            }
          });
          // inform shopkeeper of a cancellation of activity by admin
          socket.on('cancel:reservation', function(timeSlot) {
            _.remove(vm.activities, function(activity) {
              if (activity.id == timeSlot.activity.id) {
                var time = timeSlot.hour + ":00 on " + moment(timeSlot.date).format('DD/MM/YYYY');
                $mdToast.show(
                  $mdToast
                    .simple()
                    .textContent("Your activity at (" + time + ") has been cancelled. An Email with more details has been sent to you.")
                    .hideDelay(3000)
                );
                return true;
              }
              return false;
            });
          });
        }
      }

      function isAdmin() {
        return vm.role == 'Admin';
      }

      function isCurrentWeek() {
        return vm.startDate.week() == moment().week() && vm.startDate.year() == moment().year();
      }

      function isToday(day) {
        return day.isSame(vm.today);
      }

      function isBeforeToday(day) {
        return day.isBefore(vm.today);
      }

      function isCurrentDay(day) {
        return day.isSame(vm.currentDate);
      }

      function selectDay(day) {
        if (!isBeforeToday(day)) {
          vm.currentDate = day;
          if (!vm.startDate.isSame(vm.currentDate.clone().startOf('week'))) {
            vm.startDate = vm.currentDate.clone().startOf('week');
            getWeek();
          }
        }
      }

      function isWeekend(day) {
        return day.format('d') == '0' || day.format('d') == '6';
      }

      function getTimeSlots(day) {
        return _.filter(vm.timeSlots, function(timeSlot) {
          return moment(timeSlot.date).isSame(day);
        });
      }

      function getTimeSlot(hour) {
        return _.find(vm.timeSlots, function(timeSlot) {
          return moment(timeSlot.date).isSame(vm.currentDate) && timeSlot.hour == hour;
        });
      }

      function getActivities(day) {
        return _.filter(vm.activities, function(activity) {
          return moment(activity.timeSlot.date).isSame(day);
        });
      }

      function getActivity(hour) {
        return _.find(vm.activities, function(activity) {
          return moment(activity.timeSlot.date).isSame(vm.currentDate) && activity.timeSlot.hour == hour;
        })
      }

      function nextWeek() {
        vm.startDate.add(7, 'days');
        getWeek();
      }

      function previousWeek() {
        vm.startDate.subtract(7, 'days');
        getWeek();
      }

      function isAvailable(hour) {
        return isAdmin() ? !getTimeSlot(hour) : getTimeSlot(hour);
      }

      function isReserved(hour) {
        return getActivity(hour)
      }

      function releaseSlot(hour) {
        TimeSlot
          .create({
            date: vm.currentDate.valueOf(),
            hour: hour
          })
          .$promise
          .then(function(timeSlot) {
            vm.timeSlots.push(timeSlot)
          })
      }

      function closeSlot(hour, $event) {
        var timeSlot = getTimeSlot(hour);
        var confirm = $mdDialog.confirm()
          .title('Are you sure to close this time slot?')
          .ariaLabel('Deleting Confirmation')
          .targetEvent($event)
          .ok('Yes')
          .cancel('No');
        $mdDialog.show(confirm).then(function() {
          TimeSlot
            .destroyById({ id: timeSlot.id })
            .$promise
            .then(function() {
              vm.timeSlots.splice(vm.timeSlots.indexOf(timeSlot), 1);
            })
        });
      }

      function reserve(hour, $event) {
        var timeSlot = getTimeSlot(hour);
        $mdDialog
          .show({
            templateUrl: 'app/views/reservation.html',
            controller: reservationController,
            controllerAs: 'reservation',
            targetEvent: $event,
            locals: {
              shopkeeperId: $rootScope.currentUser.id,
              products: vm.products,
              surveys: vm.surveys,
              timeSlot: timeSlot
            }
          })
          .then(function(activity) {
            activity.timeSlot = timeSlot;
            vm.timeSlots.splice(vm.timeSlots.indexOf(timeSlot), 1);
            vm.activities.push(activity);
          });
      }

      function viewActivity(hour) {
        var activity = getActivity(hour);
        $state.go('main.view.activities.selected', { id: activity.id })
      }

      function cancelActivity(hour, $event) {
        var activity = getActivity(hour);
        var timeSlot = activity.timeSlot;
        var confirm = $mdDialog.confirm()
          .title('Are you sure to cancel this activity?')
          .ariaLabel('Deleting Confirmation')
          .targetEvent($event)
          .ok('Yes')
          .cancel('No');
        $mdDialog.show(confirm).then(function() {
          Shopkeeper
            .cancelActivity({
              id: $rootScope.currentUser.id,
              activityId: activity.id
            })
            .$promise
            .then(function() {
              vm.activities.splice(vm.activities.indexOf(activity), 1);
              vm.timeSlots.push(timeSlot);
            })
        });
      }

      function cancelReservation(hour, $event) {
        var timeSlot = getTimeSlot(hour);
        var activity = getActivity(hour);
        $mdDialog
          .show({
            template:
            '<md-dialog aria-label="Cancel Reservation">' +
            '  <md-dialog-content class="md-dialog-content">' +
            '    <h2 class="md-title">Are you sure to cancel the reservation and close this slot?</h2>' +
            '    <p>If yes, please provide a reason to shopkeeper for canceling this reservation</p>' +
            '    <md-input-container class="full-width">' +
            '      <label>Reason</label>' +
            '      <textarea rows="3" md-select-on-focus md-maxlength="200" ng-model="reason" required></textarea>' +
            '    </md-input-container>' +
            '  </md-dialog-content>' +
            '  <md-dialog-actions layout="row">' +
            '    <md-button ng-click="submit()" class="md-primary" ng-disabled="!reason">' +
            '      Yes' +
            '    </md-button>' +
            '    <md-button ng-click="cancel()" class="md-primary">' +
            '      No' +
            '    </md-button>' +
            '  </md-dialog-actions>' +
            '</md-dialog>',
            controller: function($scope) {
              $scope.reason = '';
              $scope.submit = function() {
                $mdDialog.hide($scope.reason);
              };
              $scope.cancel = function() {
                $mdDialog.cancel();
              };
            },
            targetEvent: $event
          })
          .then(function(reason) {
            TimeSlot
              .cancelReservation({
                id: timeSlot.id,
                reason: reason
              })
              .$promise
              .then(function() {
                vm.timeSlots.splice(vm.timeSlots.indexOf(timeSlot), 1);
                vm.activities.splice(vm.activities.indexOf(activity), 1);
              })
          });
      }

      function reservationController(shopkeeperId, products, surveys, timeSlot) {
        var vm = this;
        vm.productId = null;
        vm.surveyId = null;
        vm.products = products;
        vm.surveys = surveys;
        vm.date = moment(timeSlot.date).format('DD/MM/YYYY');
        vm.hour = timeSlot.hour;
        vm.submit = submit;
        vm.cancel = cancel;

        function submit() {
          Shopkeeper
            .activities
            .create(
              { id: shopkeeperId },
              {
                productId: vm.productId,
                surveyId: vm.surveyId,
                shopkeeperId: shopkeeperId,
                timeSlotId: timeSlot.id
              }
            )
            .$promise
            .then(function(activity) {
              $mdDialog.hide(activity);
            })
        }

        function cancel() {
          $mdDialog.cancel();
        }
      }
    }
  }

})();
