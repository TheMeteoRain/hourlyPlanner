angular.module('hourlyPlanner.services', [])

.service('CalendarService', function () {
  this.getNumberOfDaysInMonth = function (year, month) {
    var isLeap  = ((year % 4) == 0 && ((year % 100) != 0 || (year % 400) == 0));
    var maxDays = [31, (isLeap ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];

    var days = [];
    for (var i = 0; i < maxDays; i++) {
      days[i] = i+1;
    }

    return days;
  }

  this.getNumberOfHours = function () {
    var hours = [];

    for (var i = 0; i < 24; i++) {
      hours.push(i);
    }

    return hours;
  }

  this.getNumberOfMinutes = function () {
    var minutes = [];

    for (var i = 0; i < 60; i++) {
      minutes.push(i);
    }

    return minutes;
  }

  this.createActivity = function (newActivity) {
    var activity = {};

    var startTime = new Date(newActivity.year, newActivity.month, newActivity.day, newActivity.startHour, 0);
    var endTime = new Date(newActivity.year, newActivity.month, newActivity.day, newActivity.durationHour, newActivity.startHour*60);

    activity = {
      activity: newActivity.activity,
      description: newActivity.description,
      startTime: startTime,
      endTime: endTime,
      day: newActivity.day,
      month: newActivity.month,
      year: newActivity.year,
      startHour: newActivity.startHour,
      durationHour: newActivity.durationHour
    };

    return activity;
  }

  this.getYears = function (startYear) {
    var years = [],
        currentYear = new Date().getFullYear() + 2,
        startYear = startYear || 1970;

    for (var i = startYear; i < currentYear + 1; i++) {
      years.push(i);
    }

    return years;
  }

  this.getMonths = function () {
    var months = [
      {id:0, name:'January'},
      {id:1, name:'February'},
      {id:2, name:'March'},
      {id:3, name:'April'},
      {id:4, name:'May'},
      {id:5, name:'June'},
      {id:6, name:'July'},
      {id:7, name:'August'},
      {id:8, name:'September'},
      {id:9, name:'October'},
      {id:10, name:'November'},
      {id:11, name:'December'}
    ];

    return months;
  }

  this.getDays = function () {
    var days = [
      {id:0, name:'Sunday'},
      {id:1, name:'Monday'},
      {id:2, name:'Tuesday'},
      {id:3, name:'Wednesday'},
      {id:4, name:'Thursday'},
      {id:5, name:'Friday'},
      {id:6, name:'Saturday'}
    ];

    return days;
  }

  this.getColors = function () {
    var colors = [
      {name: 'Red', color: '#c0392b'},
      {name: 'Green', color: '#33cd5f'},
      {name: 'Yellow', color: '#f39c12'},
      {name: 'Black', color: '#444444'},
      {name: 'Purple', color: '#8e44ad'},
      {name: 'Dark', color: '#2c3e50'},
      {name: 'Blue', color: '#2980b9'},
      {name: 'Brown', color: '#836953'},
      {name: 'Orange', color: '#d35400'},
      {name: 'Greensea', color: '#16a085'}
    ];

    return colors;
  }

})

.factory('Activities', function () {
  return {
    load: function() {
      var activitiesString = window.localStorage['activities'];
      if(activitiesString) {
        return angular.fromJson(activitiesString);
      }
      return [];
    },
    save: function (activities) {
      window.localStorage['activities'] = angular.toJson(activities);
    }
  }
})

.factory('ChoreList', function () {
  return {
    load: function() {
      var choreListString = window.localStorage['choreList'];
      if(choreListString) {
        return angular.fromJson(choreListString);
      }
      return [];
    },
    save: function (choreList) {
      window.localStorage['choreList'] = angular.toJson(choreList);
    }
  }
});
