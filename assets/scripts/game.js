$( document ).ready(function() {

  let card = $('.easy .card');
  // var card = $('.active div');
  let cards = [];
  let z = 0;
  let clickCount = 0;
  let firstClick = 0;
  let matchedPairs = 0;
  let cardIndex;
  let gameOver = false;
  let gameTime;
  let gameScore = 0;
  let timeAdjust = 0;
  let timePenalty = 0;
  let scorePenalty = 0;
  let timeBonus = 0;
  let mistakes = 0;
  let timeRemaining;
  let highScores = [];
  let flippedCards = [];
  let card1Seen = false;
  let card2Seen = false;
  let flippedCardIndex = []
  let storageModeChanged;
  let gameSoundEffects = true;
  let storage;
  let persistentHighScoreData;
  const cardPictures = ['homer','bart','marge','lisa','maggie','milhouse','krusty','willie', 'wiggum', 'apu', 'lovejoy', 'flanders', 'moe', 'skinner'];
  let maxPairs = 14;
  let gameMode = sessionStorage.getItem("gameMode");
  const scorePositions = ["1st","2nd","3rd","4th","5th","6th","7th","8th","9th","10th"];
  let matchPoints;

  // Check for any high scores in local Storage
  checkDataStorage();
  // Check for any sound effect settings in local Storage
  checkGameSoundEffects();
  // Check which game mode has been selected & configure game accordingly
  gameSetup();
  //create a random order of cards for the game
  cardShuffle(cardPictures);

  // *********************  Main Functionality of the game *********************************
  $.each(card, function(index) {
  $(card[index]).click(function() {
    firstClick++;
    if (firstClick == 1) {
      timer(60);
    }
    //Prevent clicking the same card twice to produce false True result
    if ((cardIndex == index)&&(!$(card[index]).hasClass('is-flipped'))) {}
    // Prevent card still flipping at 0 seconds
    else if (gameOver) {}
    else {
      clickCount++;
      cardIndex = index;
      if (gameSoundEffects) {
        $('#cardFlip')[0].play();
      }
        if ((matchedPairs == maxPairs - 1)&&(clickCount == 2)) {
          clearInterval(gameTime);
        }
        // Prevent more than 2 cards being selected
        if (clickCount <= 2) {
          card[index].classList.remove('is-flipped');
          cards[z] = card[index];
          flippedCardIndex[z] = index;
          z++;
          card1Seen = false;
          card2Seen = false;
          if (cards[1]){
            let a = $(cards[0]).attr("class").split(" ")[1];
            let b = $(cards[1]).attr("class").split(" ")[1];
            if (flippedCards) {
              for (let i = 0 ; i < flippedCards.length ; i++) {
                if (flippedCards[i].index ==  flippedCardIndex[0]) {
                  card1Seen = true;
                }
              }
              for (let i = 0 ; i < flippedCards.length ; i++) {
                if (flippedCards[i].index ==  flippedCardIndex[1]) {
                  card2Seen = true;
                }
              }
              if (card1Seen == false) {
                flippedCards.push({"picture": a,"index": flippedCardIndex[0]});
              }
              if (card2Seen == false) {
                flippedCards.push({"picture": b,"index": flippedCardIndex[1]});
              }
            }
            else {
              flippedCards.push({"picture": a,"index": flippedCardIndex[0]});
              flippedCards.push({"picture": b,"index": flippedCardIndex[1]});
            }
            let c = {"picture": a,"index": flippedCardIndex[0]};

            // Added timeout to enable card flip animations to complete
            setTimeout(function() {
              // Check for matching pair
              if ((a === b)&&(!gameOver)) {
                adjustScore(50);
                z= 0;
                matchedPairs++;
                timeAdjust -= timeBonus;
                if (gameSoundEffects) {
                  $('#woohoo')[0].play();
                }
                $.each(cards, function(index) {
                  cards[index].classList.add('animate__animated','animate__bounceOutUp', 'animate__slow');
                });
                cards[1] = null;
                clickCount = 0;

                // Check if all pairs have been matched
                if (matchedPairs === maxPairs) {
                  gameOver = true;
                  adjustScore(timeRemaining);
                    let scorePosition = highScorePos()
                    if (scorePosition){
                      gameCompletePopup(scorePosition);
                    }
                    else {
                      gameOverPopup();
                    }
                }
                else if (gameOver){
                }
              }
              else if (a != b){
                if (flippedCards) {
                  let matchKnown = false;
                  let check = 0;
                  for (let i = 0 ; i < flippedCards.length ; i++) {
                    // Check if matching card has already been seen
                    if (flippedCards[i].picture == c.picture && flippedCards[i].index != c.index) {
                      matchKnown = true;
                      adjustScore(scorePenalty);
                      timeAdjust += timePenalty;
                      mistakes++;
                      if (gameSoundEffects) {
                        $('#doh')[0].play();
                      }
                      $('#mistakes').html(`Mistakes: ${mistakes}`)
                    }
                    else {
                      check++;
                    }
                  }
                  $.each(cards, function(index) {
                    cards[index].classList.add('is-flipped');
                  });
                  cards[1] = null;
                  clickCount = 0;
                  z = 0;
                  }
                }
              else {
                $.each(cards, function(index) {
                  cards[index].classList.add('is-flipped');
                });
                cards[1] = null;
                clickCount = 0;
                z = 0;
              }
            }, 1000);
          }
        }
      }
    });
  });

  //Check if an exit button was used to access main screen to enable index.js to prevent start button.
  $('.exit-buttons').click(function() {
    sessionStorage.setItem('exitButtonUsed', true);
  });

  // **************************** GAME FUNCTIONS *********************************************

  function placeHighScore(name, scorePos) {
    // If no scores exist yet, add score to 1st place
    if (!JSON.parse(storage.getItem("highScores"))) {
      highScores = [[name,gameScore,gameMode]];
      storage.setItem("highScores", JSON.stringify(highScores));
    }
    else {
      for (let i = 0 ; i < scorePositions.length ; i++) {
        if (scorePos == scorePositions[i]) {
          highScores = JSON.parse(storage.getItem("highScores"));
          highScores.splice(i,0,[name,gameScore,gameMode]);
          storage.setItem("highScores", JSON.stringify(highScores));
        }
        else if (typeof(scorePos) == "undefined") {
        }
        if (highScores[10]) {
          highScores.pop();
          for (let i = 0 ; i < highScores.length ; i ++){
          }
          storage.setItem("highScores", JSON.stringify(highScores));
        }
      }
    }
  }

  function highScorePos() {
    var scorePos;
    // If no scores exist yet, add score to 1st place
    if (!JSON.parse(storage.getItem("highScores"))) {
      scorePos = scorePositions[0]
    }
    // Else if scores do exist, find where to place score
    else if (JSON.parse(storage.getItem("highScores"))[0][1]) {
      highScores = JSON.parse(storage.getItem("highScores"));
      let l = highScores.length;
      // Boolen scorePlaced used to Stop score being listed more than once if more than 1 lower score exists.
      let scorePlaced = false;
      // Loop through existing scores to find correct position
      for (let j = 0 ; ((j < l) && (scorePlaced == false)) ; j++) {
        if (gameScore > highScores[j][1]) {
          scorePlaced = true;
          scorePos = scorePositions[j];
        }
        else if  ((typeof(highScores[j+1])=="undefined")&&(j+1 != 10)) {
            scorePlaced = true;
            scorePos = scorePositions[j+1];
        }
      }
    }
    return scorePos;
  }

  function timer(time) {
    time = new Date().getTime() + (time * 1000);
    gameTime = setInterval(function() {
      let now = new Date().getTime()
      timeDiff = time - now - timeAdjust;
      let minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      let seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
      timeRemaining = (minutes * 60) + seconds;
      $("#timer").html(minutes + "m " + seconds + "s ");
      if (timeDiff < 1000) {
         clearInterval(gameTime);
         $("#timer").html("Time's Up");
         gameOver = true;
         timesUpPopup();
         setTimeout(function() {
         },1000);
      } else if (gameOver) {
         clearInterval(gameTime);
      }
      else {
      }
      if (gameSoundEffects && (timeDiff < 6000 && timeDiff > 0)) {
        $('#clockTick')[0].play();
      }
    }, 1000);
  }

  function timesUpPopup() {
    setTimeout(function() {
      $('#clockTick')[0].pause();
      $('#gameOverModal').modal('toggle');
      let score = gameScore - timeRemaining;
      $('.modal-footer button:first').remove();
      $('#gameCompleteText').html("<p>Sorry you ran out of time</p><p>Would you like to try again?</p>");
    }, 500);
  }

  function gameOverPopup() {
    setTimeout(function() {
      let score = gameScore - timeRemaining;
      $('#gameOverModal').modal('toggle');
      $('#gameCompleteText button:first').remove();
      $('#gameCompleteText button:first').remove();
      $('.player-name').remove();
      $('.game-results:first').html(mistakes);
      //https://stackoverflow.com/questions/20782590/jquery-selector-with-nth-of-type
      $('.game-results:eq(1)').html(score);
      $('.game-results:eq(2)').html(timeRemaining);
      $('.game-results:last').html(gameScore);
      $('.modal-footer button:first').remove();
      $('#gameCompleteText').append(`<p style="font-size: 24px; margin-top: 20px;">Would you like to play again?</p>`);
    }, 500);
  }

  function gameCompletePopup(scorePos) {
    setTimeout(function() {
      let score = gameScore - timeRemaining
      $('#gameCompleteText button:first').hide();
      $('#gameCompleteText button:eq(1)').hide();
      $('#gameOverModal h2').html(`Congratulations ${scorePos} place`)
      $('#gameOverModal').modal('toggle');
      $('.game-results:first').html(mistakes);
      //https://stackoverflow.com/questions/20782590/jquery-selector-with-nth-of-type
      $('.game-results:eq(1)').html(score);
      $('.game-results:eq(2)').html(timeRemaining);
      $('.game-results:last').html(gameScore);
      $('.modal-footer button:eq(1), .modal-footer button:eq(2)').remove();
      $('#nameEntry').click(function() {
        onClickOrEnter(scorePos);
      })
      //https://stackoverflow.com/questions/979662/how-to-detect-pressing-enter-on-keyboard-using-jquery
      $(document).on('keypress',function(e) {
        // If enter is pressed
        if(e.which == 13) {
          //https://stackoverflow.com/questions/45634088/how-to-prevent-page-from-reloading-after-form-submit-jquery/45634140
          event.preventDefault()
          onClickOrEnter(scorePos);
        }
      });
    }, 1500);
  }

  function onClickOrEnter(scorePos) {
    let name = $('#playerName');
    name = name.val();
      placeHighScore(name, scorePos);
      $('#gameCompleteText button:first').show();
      $('#gameCompleteText button:eq(1)').show();
       $('.score-stats, .player-name').remove();
      $('.modal-footer').remove();
      $('.modal-header').html("<h2>Would you like to play again?</h2>");
  }

  // Shuffle cards by assigning each picture class to 2 unique random array indices
  function cardShuffle(cardsArray) {
    let i = 0;
    let j = 1;
    let cardPicture = $('.card div:first-child');
    let arr = randomIndices(card.length);
    $.each(card, function(index){
      card[arr[index]].classList.add(cardsArray[i]);
      if ((j % 2) == 0) {
        i++;
      }
     j++;
    });
  }

  // generate randomised array of unique index numbers
  //https://stackoverflow.com/questions/2380019/generate-unique-random-numbers-between-1-and-100
  function randomIndices(arrayLength) {
    let l = arrayLength;
    let arr = [];
    while(arr.length < l) {
        let r = Math.floor(Math.random() * l) ;
        if(arr.indexOf(r) === -1) arr.push(r);
    }
    return arr;
  }

  function adjustScore(points) {
    gameScore += points;
    $('#score').html('Score: ' + gameScore);
  }

    function checkDataStorage() {
      if (localStorage.getItem("persistentHighScoreData")) {
        persistentHighScoreData = JSON.parse(localStorage.getItem("persistentHighScoreData"));
        if(persistentHighScoreData == true) {
          storage = localStorage;
        }
        else if (persistentHighScoreData == false) {
          storage = sessionStorage;
        }
        else if (persistentHighScoreData == false){
          storage = sessionStorage;
        }
        else {
          storage = localStorage;
        }
      }
      else {
        persistentHighScoreData = true;
        storage = localStorage;
      }
    }

    function checkGameSoundEffects() {
      if (localStorage.getItem("gameSoundEffects")) {
        gameSoundEffects = JSON.parse(localStorage.getItem("gameSoundEffects"));
      }
    }

    function gameSetup() {
      switch (gameMode) {
      case ("easy"):
        $('.medium-remove').remove();
        $('.hard-remove').remove();
        maxPairs = 6;
        matchPoints = 50;
        timePenalty = 2000;
        scorePenalty = -5;
        timeBonus = 5000;
        card = $('.easy .card');
        break;
      case ("medium"):
        $('.hard-remove').remove();
        maxPairs = 10;
        matchPoints = 50;
        timePenalty = 5000;
        scorePenalty = -10
        timeBonus = 4000;
        card = $('.medium .card');
        break;
      case ("hard"):
        maxPairs = 14;
        matchPoints = 50;
        timePenalty = 10000;
        scorePenalty = -20
        timeBonus = 3000;
        card = $('.hard .card');
      }
    }

  });
