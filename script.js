$(document).ready(function () {
    // Initialize game state
    let gameTimer;
    let shotClock;
    let isGamePaused = true;
    let isShotClockPaused = false;
    let homeTeam;
    let guestTeam;

    const defaultHomeScore = "0";
    const defaultGuestScore = "0";
    const defaultHomeFouls = "0";
    const defaultGuestFouls = "0";
    const defaultGameTimer = "10:00";
    const defaultShotClock = "12";

    // Make scoreboard elements editable on double click
    makeEditable('#home-score');
    makeEditable('#guest-score');
    makeEditable('#home-fouls');
    makeEditable('#guest-fouls');
    makeEditable('#game-timer');
    makeEditable('#shot-clock');


    if (localStorage.getItem('scoreboardData')) {
        const storedData = JSON.parse(localStorage.getItem('scoreboardData'));
        $('#home-score').text(storedData.homeScore);
        $('#guest-score').text(storedData.guestScore);
        $('#home-fouls').text(storedData.homeFouls);
        $('#guest-fouls').text(storedData.guestFouls);
        $('#game-timer').text(storedData.gameTimer);
        $('#shot-clock').text(storedData.shotClock);
    } else {
        $('#home-score').text(defaultHomeScore);
        $('#guest-score').text(defaultGuestScore);
        $('#home-fouls').text(defaultHomeFouls);
        $('#guest-fouls').text(defaultGuestFouls);
        $('#game-timer').text(defaultGameTimer);
        $('#shot-clock').text(defaultShotClock);

    }

    function makeEditable(elementId) {
        $(elementId).on('dblclick', function () {
            if(!isGamePaused){
                pauseGame();
            }

            const currentValue = $(this).text();
            const inputField = $('<input type="text" size="1" class="editable-input" />');
            
            inputField.val(currentValue);
            $(this).empty().append(inputField);

            inputField.focus();

            inputField.on('blur', function () {
                const newValue = $(this).val();
                $(this).closest(elementId).text(newValue);
                updateLocalStorage();
            });

            inputField.on('keypress', function (event) {
                if (event.which === 13) {
                    const newValue = $(this).val();
                    $(this).closest(elementId).text(newValue);
                    updateLocalStorage();
                }
            });
        });
    }

    function updateLocalStorage() {
        const scoreboardData = {
            homeScore: $('#home-score').text(),
            guestScore: $('#guest-score').text(),
            homeFouls: $('#home-fouls').text(),
            guestFouls: $('#guest-fouls').text(),
            gameTimer: $('#game-timer').text(),
            shotClock: $('#shot-clock').text()
        };
        localStorage.setItem('scoreboardData', JSON.stringify(scoreboardData));
    }

    function resetLocalStorage() {
        clearInterval(gameTimer);
        clearInterval(shotClock);

        localStorage.clear();

        $('#home-score').text(defaultHomeScore);
        $('#guest-score').text(defaultGuestScore);
        $('#home-fouls').text(defaultHomeFouls);
        $('#guest-fouls').text(defaultGuestFouls);
        $('#game-timer').text(defaultGameTimer);
        $('#shot-clock').text(defaultShotClock);
    }

    $(document).keypress(function (event) {
        if (event.which === 110 || event.which === 78) {
            // 'N' or 'n' key pressed, trigger the "New Game" button click
            $("#new-game").click();
        }

        if (event.which === 82 || event.which === 114) {
            if (!isGamePaused) {
                $('#reset-shot-clock').click();
            }
        }

        if (event.which === 32) {
            if (!isGamePaused) {

                $('#pause-shot-clock').click();
            }
        }

        if (event.which === 115) {
            $('#start-game').click();
        }

        if (event.which === 80 || event.which === 112) {
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
        updateLocalStorage();
    });

    $("#home-score-plus-one").click(function () {
        updateScore("home", 1);
        updateLocalStorage();
    });

    $("#home-score-plus-two").click(function () {
        updateScore("home", 2);
        updateLocalStorage();
    });

    $("#home-foul-minus").click(function () {
        updateFouls("home", -1);
        updateLocalStorage();
    });

    $("#home-foul-plus").click(function () {
        updateFouls("home", 1);
        updateLocalStorage();
    });

    $("#guest-score-minus-one").click(function () {
        updateScore("guest", -1);
        updateLocalStorage();
    });

    $("#guest-score-plus-one").click(function () {
        updateScore("guest", 1);
        updateLocalStorage();
    });

    $("#guest-score-plus-two").click(function () {
        updateScore("guest", 2);
        updateLocalStorage();
    });

    $("#guest-foul-minus").click(function () {
        updateFouls("guest", -1);
        updateLocalStorage();
    });

    $("#guest-foul-plus").click(function () {
        updateFouls("guest", 1);
        updateLocalStorage();
    });

    $("#reset-shot-clock").click(function () {
        resetShotClock();
        updateLocalStorage();
    });

    $("#pause-shot-clock").click(function () {
        // Toggle the shot clock state
        if (isShotClockPaused) {
            startShotClock();
            updateLocalStorage();
        } else {
            pauseShotClock();
            updateLocalStorage();
        }
    });

    $("#start-game").click(function () {
        startGame();
        updateLocalStorage();
    });

    $("#pause-game").click(function () {
        pauseGame();
        updateLocalStorage();
    });

    $("#new-game").click(function () {
        const isConfirmed = window.confirm("Reset Score Board?");

        if (isConfirmed) {
            newGame();
        }
    });

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

    function resetShotClock() {
        $("#shot-clock").text(defaultShotClock);
    }

    function pauseShotClock() {
        clearInterval(shotClock);
        isShotClockPaused = true;
        $("#pause-shot-clock").text("Start (Space)");
    }

    function startShotClock() {
        shotClock = setInterval(updateShotClock, 1000);
        isShotClockPaused = false;
        $("#pause-shot-clock").text("Pause (Space)");
    }

    function startGame() {
        if (isGamePaused) {
            isGamePaused = false;
            $('#reset-shot-clock').attr('disabled', false);
            $('#pause-shot-clock').attr('disabled', false);
            $('#pause-game').attr('disabled', false);
            $('#start-game').attr('disabled', true);
            clearInterval(gameTimer);
            clearInterval(shotClock);
            gameTimer = setInterval(updateGameTimer, 1000);
            startShotClock();
        }
    }

    function pauseGame() {
        clearInterval(gameTimer);
        pauseShotClock();
        isGamePaused = true;
        $('#reset-shot-clock').attr('disabled', true);
        $('#pause-shot-clock').attr('disabled', true);
        $('#pause-game').attr('disabled', true);
        $('#start-game').attr('disabled', false);
    }

    function newGame() {
        resetLocalStorage();
        location.reload();
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
        updateLocalStorage();
    }

    function updateShotClock() {

        let shotClockElement = $("#shot-clock");
        let currentShotClock = parseInt(shotClockElement.text());

        if (currentShotClock <= 0) {
            resetShotClock();
        } else {
            shotClockElement.text(currentShotClock - 1);
        }
        updateLocalStorage();
    }
});
