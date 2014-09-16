//Timer
function startClock(){
  var cur = new Date();
  var month = checkTime(cur.getMonth() + 1);
  var year = cur.getFullYear();
  var day = checkTime(cur.getDate());
  var hour = checkTime(cur.getHours());
  var minute = checkTime(cur.getMinutes());
  var second = checkTime(cur.getSeconds());
  $("#clock").text("Date: " + year + "/" + month + "/" + day + " Time: " + hour + ":" + minute + ":" + second);
  setTimeout(function(){startClock();}, 500);
  }
//append 0 to single digit month/day
function checkTime(time){
  if(time < 10){
    time = "0" + time;
  }
  return time;
}

$(document).ready(function(){
  startClock();
});
