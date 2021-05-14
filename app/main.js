// GAME SETUP
var initialState = SKIPSETUP ? "playing" : "setup";
var playerBoard = new Board();
var cursor = new Cursor();
var piece = makePiece(false);

// UI SETUP
setupUserInterface();

// selectedTile: The tile that the player is currently hovering above
var selectedTile = false;

var start = Date.now();
var score = 0;

var lastDrop = Date.now();
var lastSwipe = Date.now();
var pointPositions = [];

var playing = false;
var opened = true;
var tutorial = -1;

var content = "";

// MAIN GAME LOOP
// Called every time the Leap provides a new frame of data
Leap.loop({ frame: function(frame) {
  // Clear any highlighting at the beginning of the loop
  if (playing || tutorial > 1) piece.unhighlightTiles();

  var hand = frame.hands.length > 0 ? frame.hands[0] : undefined;

  // Use the hand data to control the cursor's screen position
  var cursorPosition = hand ? hand.screenPosition() : undefined;
  var translateVector = Leap.vec3.fromValues(-200, 250, 0);
  var returnVector = Leap.vec3.create();
  var translatedCursor = cursorPosition ? Leap.vec3.add(returnVector, cursorPosition, translateVector) : undefined;

  if (!playing) { // only draw the cursor
    if (translatedCursor) {
      cursor.setScreenPosition(translatedCursor);
    } if (tutorial > -1) {
      // check swipe up for turning tutorial
      if (translatedCursor) {
        pointPositions.push(translatedCursor[1]);
        if (pointPositions.length > 7) {
          pointPositions.shift();
          if ((pointPositions[0] - pointPositions[6]) > 100) {
            let now = Date.now();
            if ((now - lastSwipe) >= 200) {
              piece.unhighlightTiles();
              piece.rotate(playerBoard, 1);
              lastSwipe = now;
            }
          }
        }
      } else { // finger left motion sensor so reset the list
        pointPositions = [];
      }
    } if (tutorial > 1) {
      // allow user to move block side to side for tutorial
      if (translatedCursor) {
        cursor.setScreenPosition(translatedCursor);
    
        // Get the tile that the player is currently selecting, highlight it and move the block
        selectedTile = getIntersectingTile(translatedCursor);
        if (selectedTile) {
          if (!piece.collides(playerBoard, {row: piece.getScreenPosition().row, col: selectedTile.col}, undefined)) {
            piece.setScreenPosition(selectedTile);
          } else {
            piece.setScreenPosition(piece.getScreenPosition());
          }
        }
      }
      piece.draw();
    } if (tutorial > 2) {
      // move the piece back up if the last drop was over 2 seconds ago
      if (Date.now() - lastDrop >= 1000) {
        piece.unhighlightTiles();
        piece.moveUp();
      }

      // check swipe down for dropping tutorial
      if (translatedCursor) {
        pointPositions.push(translatedCursor[1]);
        if (pointPositions.length > 7) {
          pointPositions.shift();
          if ((pointPositions[6] - pointPositions[0]) > 150) { // need a higher threshold for dropping bc scary
            if ((Date.now() - lastDrop) >= 1000) {
              piece.unhighlightTiles();
              piece.drop(playerBoard);
              lastDrop = Date.now();
            }
          }
        }
      } else { // finger left motion sensor so reset the list
        pointPositions = [];
      }
    }
  }  else { // gameplay logic

    // check swipes
    if (translatedCursor) {
      pointPositions.push(translatedCursor[1]);
      if (pointPositions.length > 7) {
        pointPositions.shift();
        if ((pointPositions[0] - pointPositions[6]) > 100) {
          let now = Date.now();
          if ((now - lastSwipe) >= 200) {
            piece.unhighlightTiles();
            piece.rotate(playerBoard, 1);
            lastSwipe = now;
          }
        } else if ((pointPositions[6] - pointPositions[0]) > 150) { // need a higher threshold for dropping bc scary
          tryDrop();
        }
      }
    } else { // finger left motion sensor so reset the list
      pointPositions = [];
    }

    // move block down every FALLSPEED milliseconds
    let now = Date.now();
    if (now - start >= FALLSPEED) {
      var falling = piece.fall(playerBoard);
      start = now;
      if (!falling) {
        playerBoard.placePiece(piece);
        if (playerBoard.lost()) {
          piece.draw();
          playing = false;
          askPlayAgain();
        } else {
          let rows = playerBoard.checkRows();
          updateSpeed(score, rows);
          score += rows;
          playerBoard.draw();
          piece = makePiece(false);
        }
      }
    }

    if (translatedCursor) {
      cursor.setScreenPosition(translatedCursor);
  
      // Get the tile that the player is currently selecting, highlight it and move the block
      selectedTile = getIntersectingTile(translatedCursor);
      if (selectedTile) {
        if (!piece.collides(playerBoard, {row: piece.getScreenPosition().row, col: selectedTile.col}, undefined)) {
          piece.setScreenPosition(selectedTile);
        } else {
          piece.setScreenPosition(piece.getScreenPosition());
        }
      }
    }
    piece.drawShadow(playerBoard);
    piece.draw();
  }
  
  if (tutorial == -1) {
    let h3 = opened ? "<h3>Say 'start' to play or 'help' <br> for instructions</h3>" : "<h3>lines cleared: " + score + "</h3>";
    content = "<h1>multimodal tetris</h1>" + h3;
  }
  background.setContent(content);
  if (playing) {
    let header = "<h2>Actions</h2>";
    let turn = "<h4>Turn clockwise: \"Turn\" or flick finger up</h4>";
    let turnBack = "<h4>Turn counterclockwise: \"Turn back\"</h4>";
    let turn180 = "<h4>Turn 180 desgrees: \"Flip\"</h4>";
    let drop = "<h4>Drop into place: \"Drop\", \"Down\" or flick finger down</h4>";
    let askScore = "<h4>Ask for score: \"How many lines?\"</h4>";
    hints.setContent(header + turn + turnBack + turn180 + drop + askScore);
  }
}}).use('screenPosition', {scale: LEAPSCALE});

// processSpeech(transcript)
//  Is called anytime speech is recognized by the Web Speech API
// Input: 
//    transcript, a string of possibly multiple words that were recognized
// Output: 
//    processed, a boolean indicating whether the system reacted to the speech or not
var processSpeech = function(transcript) {
  // Helper function to detect if any commands appear in a string
  var userSaid = function(str, commands) {
    for (var i = 0; i < commands.length; i++) {
      if (str.indexOf(commands[i]) > -1)
        return true;
    }
    return false;
  };

  var processed = false;

  let turnBack = (transcript.toLowerCase().match(/turn back/g) || []).length * 2;
  let turn = (transcript.toLowerCase().match(/turn/g) || []).length;
  let flip = (transcript.toLowerCase().match(/flip/g) || []).length * 2;

  let rotation = turn - turnBack + flip;
  if (rotation != 0) {
    piece.unhighlightTiles();
    piece.rotate(playerBoard, rotation);
    processed = true;
  }

  if (userSaid(transcript.toLowerCase(), ["start", "begin", "go", "play"])) {
    opened = false;
    playing = true;
    processed = true;
  }

  if (userSaid(transcript.toLowerCase(), ["drop", "down"])) {
    tryDrop();
    processed = true;
  }

  if (userSaid(transcript.toLowerCase(), ["yes", "sure", "ok", "yeah", "yep", "please", "okay"])) {
    if (!playing) {
      playerBoard.clear();
      score = 0;
      playing = true;
      processed = true;
    }
  }

  if (userSaid(transcript.toLowerCase(), ["no", "nope", "nah", "nada"])) {
    if (!playing) {
      generateSpeech("Alright. Thanks for playing!");
      processed = true;
    }
  }

  if (userSaid(transcript.toLowerCase(), ["score", "lines", "points"])) {
    if (userSaid(transcript.toLowerCase(), ["what", "what's", "many", "much", "please", "tell", "say"])) {
      generateSpeech("You have cleared " + score + " lines.");
    }
  }

  if (userSaid(transcript.toLowerCase(), ["help"]) && !userSaid(transcript.toLowerCase(), ["say"])) {
    tutorial += 1;
    if (tutorial == 0) {
      piece = makePiece(true);
      piece.draw();
      generateSpeech("To turn clockwise, flick your finger up or say turn. Try this a couple times, and say help to move onto the next step.");
      content = "<h1>multimodal tetris</h1><h3>To turn clockwise, flick your <br> finger up or say turn. Try <br> this a couple times, and say <br> help to move onto the next <br> step.</h3>";
    } else if (tutorial == 1) {
      generateSpeech("To turn counter clockwise, say turn back. To turn 180 degrees, say flip. Try these a couple times, and say help to move onto the next step.");
      content = "<h1>multimodal tetris</h1><h3>To turn counter clockwise, <br> say turn back. To turn 180 <br> degrees, say flip. Try these <br> a couple times, and say help <br> to move onto the next step.</h3>";
    } else if (tutorial == 2) {
      generateSpeech("To move your block, point at the position on the screen that you want to move it to. Try this for a bit, and say help to move onto the next step.");
      content = "<h1>multimodal tetris</h1><h3>To move your block, point <br> at the position on the screen <br> that you want to move it to. <br> Try this for a bit, and say <br> help to move onto the next <br> step.</h3>";
    } else if (tutorial == 3) {
      generateSpeech("To drop your block into place, flick your finger down or say drop or down. Try this for a couple times, and say help to move onto the last step.");
      content = "<h1>multimodal tetris</h1><h3>To drop your block into place, <br> flick your finger down or say <br> drop or down. Try this a couple <br> times, and say help to move <br> onto the last step.</h3>";
    } else if (tutorial == 4) {
      generateSpeech("While you're playing the game, you can ask me 'how mnny lines' and I will tell you your current score. Say exit to go back to the main screen.");
      content = "<h1>multimodal tetris</h1><h3>While you're playing the game, <br> you can ask me 'how many <br> lines' and I will tell you your <br> current score. Say exit to go <br> back to the main screen.</h3>";
    }
  }

  if (userSaid(transcript.toLowerCase(), ["exit"]) && !userSaid(transcript.toLowerCase(), ["say"])) {
    piece.unhighlightTiles();
    tutorial = -1;
    piece = makePiece(false);
  }

  return processed;
};

var tryDrop = function() {
  let now = Date.now();
  if ((now - lastDrop) >= 1000) {
    piece.drop(playerBoard);
    playerBoard.placePiece(piece);
    let rows = playerBoard.checkRows();
    updateSpeed(score, rows);
    score += rows;
    playerBoard.draw();
    piece = makePiece(false);
    lastDrop = Date.now();
  }
};

var askPlayAgain = function() {
  generateSpeech("You lost! Would you like to play again?");
};