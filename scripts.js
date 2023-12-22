$(document).ready(function () {
    // Initialize game state
    let gameTimer;
    let shotClock;
    let isGamePaused = true;
    let isShotClockPaused = false;
    let homeTeam;
    let guestTeam;

    const defaultTime = "10:00";

    $(document).keypress(function (event) {
        if (event.which === 110 || event.which === 78) {
            // 'N' or 'n' key pressed, trigger the "New Game" button click
            $("#new-game").click();
        }

        else if (event.which === 82 || event.which === 114) {
            $('#reset-shot-clock').click();
        }

        else if (event.which === 32) {
            $('#pause-shot-clock').click();
        }

        else if (event.which === 115) {
            $('#start-game').click();
        }

        else if (event.which === 80 || event.which === 112) {
            $('#pause-game').click();
        }
    });



    $.ajax({
        type: "GET",
        url: "teams.csv",
        dataType: "text",
        success: function (csv) {
            rows = csv.trim().split('\n');
            homeTeam = rows[0];
            guestTeam = rows[1];

            $("#home-label").text(homeTeam);
            $("#guest-label").text(guestTeam);
        },
        error: function () {
            console.error("Error loading CSV file");
        }
    });



    // Control buttons
    $("#home-score-minus-one").click(function () {
        updateScore("home", -1);
    });

    $("#home-score-plus-one").click(function () {
        updateScore("home", 1);
    });

    $("#home-score-plus-two").click(function () {
        updateScore("home", 2);
    });

    $("#home-foul-minus").click(function () {
        updateFouls("home", -1);
    });

    $("#home-foul-plus").click(function () {
        updateFouls("home", 1);
    });

    $("#guest-score-minus-one").click(function () {
        updateScore("guest", -1);
    });

    $("#guest-score-plus-one").click(function () {
        updateScore("guest", 1);
    });

    $("#guest-score-plus-two").click(function () {
        updateScore("guest", 2);
    });

    $("#guest-foul-minus").click(function () {
        updateFouls("guest", -1);
    });

    $("#guest-foul-plus").click(function () {
        updateFouls("guest", 1);
    });

    $("#reset-shot-clock").click(function () {
        resetShotClock();
    });

    $("#pause-shot-clock").click(function () {
        // Toggle the shot clock state
        if (isShotClockPaused) {
            startShotClock();
        } else {
            pauseShotClock();
        }
    });

    $("#start-game").click(function () {
        startGame();
    });

    $("#pause-game").click(function () {
        pauseGame();
    });

    $("#new-game").click(function () {
        // Show a confirmation dialog
        const isConfirmed = window.confirm("Are you sure you want to start a new game?");

        // If the user confirms, proceed with the new game
        if (isConfirmed) {
            newGame();
        }
    });

    // Functions for updating scores and fouls
    function updateScore(team, points) {
        let scoreElement = $(`#${team}-score`);
        let currentScore = parseInt(scoreElement.text());
        let score = currentScore + points;

        scoreElement.text(score);

        if ($("#home-score").text() === '0') {
            $("#home-score-minus-one").addClass('hide');
        } else {
            $("#home-score-minus-one").removeClass('hide');
        }

        if ($("#guest-score").text() === '0') {
            $("#guest-score-minus-one").addClass('hide');
        } else {
            $("#guest-score-minus-one").removeClass('hide');
        }

    }

    function updateFouls(team, points) {
        let foulCounterElement = $(`#${team}-fouls`);
        let currentFouls = parseInt(foulCounterElement.text());
        let foul = currentFouls + + points;

        foulCounterElement.text(foul);

        if ($("#home-fouls").text() === '0') {
            $("#home-foul-minus").addClass('hide');
        } else {
            $("#home-foul-minus").removeClass('hide');
        }

        if ($("#guest-fouls").text() === '0') {
            $("#guest-foul-minus").addClass('hide');
        } else {
            $("#guest-foul-minus").removeClass('hide');
        }
    }

    // Functions for shot clock and game timer
    function resetShotClock() {
        $("#shot-clock").text("12");
    }

    function pauseShotClock() {
        clearInterval(shotClock);
        isShotClockPaused = true;
        $("#pause-shot-clock").text("Start (Space)"); // Update the button text
    }

    function startShotClock() {
        shotClock = setInterval(updateShotClock, 1000);
        isShotClockPaused = false;
        $("#pause-shot-clock").text("Pause (Space)"); // Update the button text
    }

    function startGame() {
        if (isGamePaused) {
            isGamePaused = false;
            clearInterval(gameTimer);
            clearInterval(shotClock);
            gameTimer = setInterval(updateGameTimer, 1000);
            shotClock = setInterval(updateShotClock, 1000);
        } else {
            console.log('gamePause');
        }
    }

    function pauseGame() {
        clearInterval(gameTimer);
        clearInterval(shotClock);
        isGamePaused = true;
    }

    function newGame() {
        clearInterval(gameTimer);
        clearInterval(shotClock);
        resetShotClock();

        // ======= WAKTU ========================================

        $("#game-timer").text(defaultTime);
        isGamePaused = true;

        // ===============================================

        // Reset scores and fouls
        $(".score").text("0");
        $(".foul-counter").text("0");
    }

    function updateGameTimer() {
        let timerElement = $("#game-timer");
        let currentTime = timerElement.text().split(":");
        let minutes = parseInt(currentTime[0]);
        let seconds = parseInt(currentTime[1]);

        if (minutes === 0 && seconds === 0) {
            // Game over logic
            pauseGame();
        } else {
            if (seconds === 0) {
                minutes--;
                seconds = 59;
            } else {
                seconds--;
            }

            // Format the time with leading zeros
            minutes = minutes < 10 ? "0" + minutes : minutes;
            seconds = seconds < 10 ? "0" + seconds : seconds;

            timerElement.text(minutes + ":" + seconds);
        }
    }

    function updateShotClock() {

        let shotClockElement = $("#shot-clock");
        let currentShotClock = parseInt(shotClockElement.text());

        if (currentShotClock === 0) {
            resetShotClock();
        } else {
            shotClockElement.text(currentShotClock - 1);
        }
    }
});
