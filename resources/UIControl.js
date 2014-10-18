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
  $("#statusBoard, #divConsole, #divLog, #divUserProgramInput").css("display", "none");
  $("#btnStartOS").click(function(){
    $("#welcome").fadeOut(500);
    $("#statusBoard, #divConsole, #divLog, #divUserProgramInput").delay(500).fadeIn(500);
  });
  var initialprogram = "A9 03 8D 41 00 A9 01 8D 40 00 AC 40 00 A2 01 FF EE 40 00 AE 40 "
  + "00 EC 41 00 D0 EF A9 44 8D 42 00 A9 4F 8D 43 00 A9 4E 8D 44 00 A9 45 8D 45 00 A9 00 8D 46 00 A2 02 A0 42 FF 00";
  $("#taProgramInput").val(initialprogram);
});
