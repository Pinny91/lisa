// Set the date we're counting down to
var countDownDate = new Date("2025/07/19 12:00:00").getTime();

// Update the count down every 1 second
var x = setInterval(function () {
  // Get today's date and time
  var now = new Date().getTime();

  // Find the distance between now and the count down date
  var distance = countDownDate - now;

  // Time calculations for days, hours, minutes and seconds
  var months = Math.floor(distance / (1000 * 60 * 60 * 24 * 30));
  var days = Math.floor((distance % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24));
  var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  var seconds = Math.floor((distance % (1000 * 60)) / 1000);

  // Display the result in the element with id="demo"
  document.getElementById("months-value").innerHTML = months;
  document.getElementById("days-value").innerHTML = days;
  document.getElementById("hours-value").innerHTML = hours;
  document.getElementById("minutes-value").innerHTML = minutes;
  document.getElementById("seconds-value").innerHTML = seconds;

  // If the count down is finished, write some text
  if (distance < 0) {
    clearInterval(x);
    document.getElementById("timer").innerHTML = "EXPIRED";
  }
}, 1000);
