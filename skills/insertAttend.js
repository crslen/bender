//dev-DWBluHaIzxPOgftImCHsXOi4KDz4HyHd
//prod-Gxe79DnwseQEyz5DV65vhZWzfEJe5s94
//insert data into segment
var Analytics = require('analytics-node');
var analytics = new Analytics("Gxe79DnwseQEyz5DV65vhZWzfEJe5s94", {
  flushAt: 1,
  flushInterval: 10000
});

let wksAttendees = require("../json/attendees.json");
var dataStr = JSON.stringify(wksAttendees);
var jsonStr = JSON.parse(dataStr);
for (var i = 0; i < jsonStr.length; i++) {
  var jsonInput = {
    "event": "Workshop Attendance",
    "userId": "bender@vmware.com",
    "properties": jsonStr[i]
  }
  insertSegment(jsonInput, function(res) {
    console.log("segment response: " + res);
  });

  function insertSegment(json) {
    analytics.track(json);
  }
}
