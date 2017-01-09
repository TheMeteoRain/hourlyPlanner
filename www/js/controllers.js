angular.module('hourlyPlanner.controllers', ['ui.rCalendar'])

.controller('CalendarCtrl', function($scope, $ionicModal, $ionicPopup,
                                     CalendarService, Activities, ChoreList) {
  'use strict';

  // Declare variables
  $scope.activities = [];
  $scope.calendar = {};
  $scope.newActivity = {};
  $scope.editActivity = {};
  $scope.activityOptions = {};
  $scope.choreList = [];
  $scope.newChore = {};
  initVariables();

  var selectedActivity = {};

  /**
   * Listens calendar mode (month, week day).
   *
   * @param mode
   */
  $scope.changeMode = function (mode) {
    $scope.calendar.mode = mode;
  };

  $scope.onViewTitleChanged = function (title) {
    $scope.viewTitle = title;
  };

  /**
   * Jump to current date.
   */
  $scope.today = function () {
    $scope.calendar.currentDate = new Date();
  };

  /**
   * Check if selected date is today.
   *
   * @returns {boolean}
   */
  $scope.isToday = function () {
    var today = new Date(),
        currentCalendarDate = new Date($scope.calendar.currentDate);

    today.setHours(0, 0, 0, 0);
    currentCalendarDate.setHours(0, 0, 0, 0);
    return today.getTime() === currentCalendarDate.getTime();
  };


  /**
   * Update newActivity fields.
   * Activates when a day or hour is pressed in any calendar views.
   *
   * @param selectedTime
   * @param events
   * @param date
   */
  $scope.onTimeSelected = function (selectedTime, events, newDate) {
    $scope.date = newDate;

    $scope.newActivity.day = newDate.selectedDay;
    $scope.newActivity.month = newDate.selectedMonth;
    $scope.newActivity.year = newDate.selectedYear;
    $scope.newActivity.startHour = newDate.selectedHour;

    $scope.activityOptions.days   =
        CalendarService.getNumberOfDaysInMonth
        (newDate.selectedYear, newDate.selectedMonth);

    if ($scope.calendar.mode != "month" ) {
      if (events[0] == null) {
        $scope.addActivityModal.show();
      }
    }
  };

  /**
   * Update editActivity fields.
   * Activates when an event is pressed in a week or a day views.
   *
   * @param event
   */
  $scope.onEventSelected = function (selectedActivity) {
    var tempDate;

    $scope.editActivity = angular.copy(selectedActivity);
    $scope.selectedActivity = selectedActivity;

    $scope.editActivityModal.show();
  };


  /**
   * Initialize newActivity and activityOptions and
   * load activities from memory and unload to calendar.
   */
  function initVariables () {
    var today = new Date();

    $scope.choreList = ChoreList.load();

    // newActivity
    $scope.newActivity = {
      startHour: 12,
      day: today.getDate(),
      month: today.getMonth(),
      year: today.getFullYear(),
      activity: ($scope.choreList.length > 0) ? $scope.choreList[0] : {},
      description: "",
      startMinute: 0,
      durationHour: 1,
      durationMinute: 0
    };

    // activityOptions
    $scope.activityOptions = {
      years: CalendarService.getYears(2015),
      months: CalendarService.getMonths(),
      days: CalendarService.getNumberOfDaysInMonth
      ($scope.newActivity.year, $scope.newActivity.month),
      hours: CalendarService.getNumberOfHours(),
      minutes: CalendarService.getNumberOfMinutes(),
      colors: CalendarService.getColors()
    };

    $scope.newChore.color = $scope.activityOptions.colors
        [Math.floor((Math.random() * $scope.activityOptions.colors.length))];

    // Fetch activities
    $scope.activities = Activities.load();
    // Pass activites to calendar
    $scope.calendar.eventSource = $scope.activities;
  }

  /**
   * Add new activity to activities, saves activities and passes to calendar.
   */
  $scope.insertActivity = function () {
    $scope.activities.push(CalendarService.createActivity($scope.newActivity));
    Activities.save($scope.activities);
    $scope.calendar.eventSource = $scope.activities;
    $scope.addActivityModal.hide();
    resetActivity();
  };

  /**
   * Modify selected activity.
   *
   * @param activity
   */
  $scope.modifyActivity = function (activity) {
    for(var k in $scope.editActivity) activity[k]=$scope.editActivity[k];

    var activityIndex = $scope.activities.indexOf(activity);

    $scope.activities[activityIndex] =
        CalendarService.createActivity(activity);
    Activities.save($scope.activities);
    $scope.calendar.eventSource = $scope.activities;

    $scope.editActivityModal.hide();
  };


  /**
   * Delete selected activity.
   *
   * @param activity
   */
  $scope.deleteActivity = function (activity) {
    var activityIndex = $scope.activities.indexOf(activity);

    $scope.activities.splice(activityIndex, 1);
    Activities.save($scope.activities);
    $scope.calendar.eventSource = $scope.activities;

    $scope.editActivityModal.hide();
  };

  /**
   * Add new chore to list.
   */
  $scope.insertChore = function () {

    if ($scope.newChore.name != null) {
      // Save
      $scope.choreList.push($scope.newChore);
      ChoreList.save($scope.choreList);
      $scope.newActivity.activity = $scope.choreList[0];

      // Reset
      $scope.newChore = {};
      $scope.newChore.color = $scope.activityOptions.colors
          [Math.floor((Math.random() * $scope.activityOptions.colors.length))];
    }
  };

  /**
   * Delete selected chore from list.
   *
   * @param chore
   */
  function deleteChore  (chore) {
    var choreIndex = $scope.choreList.indexOf(chore);

    $scope.choreList.splice(choreIndex, 1);
    ChoreList.save($scope.choreList);
  };

  /**
   * Reset newActivity fields.
   */
  function resetActivity () {
    $scope.newActivity.startHour =
        $scope.newActivity.startHour + $scope.newActivity.durationHour;
    //$scope.newActivity.activity = ($scope.choreList.length > 0) ? $scope.choreList[0] : {};
    $scope.newActivity.startMinute = 0;
    $scope.newActivity.durationHour = 1;
    $scope.newActivity.durationMinute = 0;
    $scope.newActivity.hour = 12;
    $scope.newActivity.description = "";
  }

  /**
   * Add activity modal.
   */
  $ionicModal.fromTemplateUrl('addActivityModal', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.addActivityModal = modal;
  });
  $scope.openModal = function() {
    $scope.addActivityModal.show();
  };
  $scope.closeModal = function() {
    $scope.addActivityModal.hide();
  };
  // Cleanup the modal when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.addActivityModal.remove();
  });
  // Execute action on hide modal
  $scope.$on('modal.hidden', function() {
    // Execute action
  });
  // Execute action on remove modal
  $scope.$on('modal.removed', function() {
    // Execute action
  });

  /**
   * Edit activity modal.
   */
  $ionicModal.fromTemplateUrl('editActivityModal', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.editActivityModal = modal;
  });
  $scope.openModal = function() {
    $scope.editActivityModal.show();
  };
  $scope.closeModal = function() {
    $scope.editActivityModal.hide();
  };
  // Cleanup the modal when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.editActivityModal.remove();
  });
  // Execute action on hide modal
  $scope.$on('modal.hidden', function() {
    // Execute action
  });
  // Execute action on remove modal
  $scope.$on('modal.removed', function() {
    // Execute action
  });

  /**
   * Activities list modal.
   */
  $ionicModal.fromTemplateUrl('choreListModal', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.choreListModal = modal;
  });
  $scope.openModal = function() {
    $scope.choreListModal.show();
  };
  $scope.closeModal = function() {
    $scope.choreListModal.hide();
  };
  // Cleanup the modal when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.choreListModal.remove();
  });
  // Execute action on hide modal
  $scope.$on('modal.hidden', function() {
    // Execute action
  });
  // Execute action on remove modal
  $scope.$on('modal.removed', function() {
    // Execute action
  });


  $scope.showConfirm = function(chore) {
    var confirmPopup = $ionicPopup.confirm({
      title: 'Delete chore',
      template: 'Do you really want to delete chore: \n' + '<b>'+chore.name+'</b>'
    });

    confirmPopup.then(function(res) {
      if(res) {
        deleteChore(chore);
      } else {
      }
    });
  };
})

.controller('ScreenCtrl', function ($scope, $window) {
  $scope.cellHeight = ((window.innerHeight - 125 - 50) / 6 < 50) ?
      45 : (window.innerHeight - 125 - 50) / 6;

  angular.element($window).bind('resize',function(){
    $scope.$apply(function(){
      $scope.cellHeight = ((window.innerHeight - 125 - 50) / 6 < 50) ?
          45 : (window.innerHeight - 125 - 50) / 6;
    });
  });
})

.controller('StatsCtrl', function($scope, Activities,
                                  ChoreList, CalendarService) {
  'use strict';

  var activities = Activities.load();
  var choreList = ChoreList.load();
  var days = CalendarService.getDays();

  function totalHours() {
    var hours = 0;

    if (activities.length > 0) {
      activities.forEach(function (element) {
        hours = hours + element.durationHour
      });
    }

    return hours;
  }

  function averageHoursPerWorkDay() {
    var averageHours = 0,
        hours = totalHours(),
        totalDays = activities.length;

    if (activities.length > 0) {
      averageHours = hours / totalDays;
    }

    return averageHours;
  }

  function chores() {
    var currentChore = {},
        choresArray = [],
        activityWeekDay,
        currentHours = [],
        previousHour,
        totalHour = totalHours(),
        i;

    // loop chores
    choreList.forEach(function (chore) {
      currentChore = {
        name: chore.name,
        hours: 0,
        weekday: 0,
        ofTotal: 0
      };

      currentHours = [0,0,0,0,0,0,0];
      previousHour = 0;

      // loop activities
      activities.forEach(function (activity) {
        // get current activity weekday and set current hours to zero
        activityWeekDay = new Date(activity.startTime).getDay();

        // loop through weekdays and calculate how many hours each day accumulate
        for (i = 0; i < 7; i++) {
          // calculate only if names and weekdays match
          if (currentChore.name == activity.activity.name && activityWeekDay == i) {
            // total hours per chore
            currentChore.hours = currentChore.hours + activity.durationHour;
            // total hours per weekday
            currentHours[i] = currentHours[i] + activity.durationHour;
          }
        }
      });

      // calculate busiest weekday by hour
      for (i = 0; i < 7; i++) {
        if (currentHours[i] > previousHour) {
          currentChore.weekday = i;
          previousHour = currentHours[i];
          // translate weekday number
          currentChore.weekday = days[i].name;
        }
      }

      if (currentChore.weekday == 0) {
        currentChore.weekday = "-";
      }

      currentChore.ofTotal = currentChore.hours / totalHour * 100;

      // push currentChore to choresArray
      choresArray.push(currentChore);
    });

    return choresArray;
  }

  $scope.totalHours = totalHours();
  $scope.averageHours = averageHoursPerWorkDay();
  $scope.chores = chores();
});
