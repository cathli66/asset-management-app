var warningTimeout = 840000; // 840000 = 14 minutes
var timoutNow = 60000; // 60000 = 1 minute
var warningTimerID,timeoutTimerID;

function startTimer() {
    // window.setTimeout returns an Id that can be used to start and stop a timer
    warningTimerID = window.setTimeout(warningInactive, warningTimeout);
}

function warningInactive() {
    window.clearTimeout(warningTimerID);
    timeoutTimerID = window.setTimeout(IdleTimeout, timoutNow);
    // $('#timeout').modal('show');
    document.getElementById("timeout").classList.toggle("show-myModal");
    // alert('You will be logged out automatically in 1 minute.');
}

function resetTimer() {
    window.clearTimeout(timeoutTimerID);
    window.clearTimeout(warningTimerID);
    startTimer();
}

// Logout the user.
function IdleTimeout() {
    // document.getElementById('logout-form').submit();
    window.location.href = '/logout';
}

function setupTimers () {
    document.addEventListener("mousemove", resetTimer, false);
    document.addEventListener("mousedown", resetTimer, false);
    document.addEventListener("keypress", resetTimer, false);
    document.addEventListener("touchmove", resetTimer, false);
    document.addEventListener("onscroll", resetTimer, false);
    startTimer();
}

$(document).on('click','#btnStayLoggedIn',function(){
    resetTimer();
    // $('#timeout').modal('hide');
    document.getElementById("timeout").classList.toggle("show-myModal");
});