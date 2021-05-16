// GAME SETUP
var playerBoard = new Board();
var cursor = new Cursor();
var piece = makePiece(false, undefined);
var holdShape = makeShape();

// UI SETUP
setupUserInterface();

// selectedTile: The tile that the player is currently hovering above
var selectedTile = false;

var start = Date.now();
var score = 0;

var lastDrop = Date.now();
var lastSwipe = Date.now();
var lastNext = Date.now();
var pointPositions = [];
var leftPositions = [];
var paused = false;

var playing = false;
var opened = true;
var tutorial = -1;

var content = "";
var nextInst = "<h4>Next tip: \"Next\" or \"Help\"</h4>";
var prevInst = "<h4>Previous tip: \"Back\"</h4>";
var exitInst = "<h4>Go to main screen: \"Exit\"</h4>";
var startInst = "<h4>Start playing: \"Start\"</h4>";
var tutorialInsts = nextInst + prevInst + exitInst + startInst;

// MAIN GAME LOOP
// Called every time the Leap provides a new frame of data
Leap.loop({ frame: function(frame) {
  if (paused) return;
  // Clear any highlighting at the beginning of the loop
  if (playing || tutorial > 1) playerBoard.draw();

  var hand = undefined
  var leftHand = undefined;
  var hands = frame.hands;
  for (currHand of hands) {
    if (currHand.type == "right") hand = currHand;
    if (currHand.type == "left") leftHand = currHand;
  }

  // Use the hand data to control the cursor's screen position
  var translatedCursor = translateCursor(hand, -450); 
  var translatedLeftCursor = translateCursor(leftHand, 0); 

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
      if (translatedCursor && (tutorial == 2 || !translatedLeftCursor)) {
        cursor.setScreenPosition(translatedCursor);
    
        // Get the tile that the player is currently selecting, highlight it and move the block
        selectedTile = getIntersectingTile(translatedCursor);
        if (selectedTile) {
          if (!collides()) {
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
      if (translatedLeftCursor) {
        piece.setHasLeft(true);
        leftPositions.push(translatedLeftCursor[1]);
        if (leftPositions.length > 7) {
          leftPositions.shift();
          if ((leftPositions[6] - leftPositions[0]) > 150) { // need a higher threshold for dropping bc scary
            if ((Date.now() - lastDrop) >= 1000) {
              piece.unhighlightTiles();
              piece.drop(playerBoard);
              lastDrop = Date.now();
            }
          }
        }
      } else { // finger left motion sensor so reset the list
        leftPositions = [];
        piece.setHasLeft(false);
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
        }
      }
    } else { // finger left motion sensor so reset the list
      pointPositions = [];
    }

    // check swipes
    if (translatedLeftCursor) {
      leftPositions.push(translatedLeftCursor[1]);
      if (leftPositions.length > 7) {
        leftPositions.shift();
        if ((leftPositions[6] - leftPositions[0]) > 150) {
          tryDrop();
        }
      }
    } else { // finger left motion sensor so reset the list
      leftPositions = [];
    }

    // move block down every FALLSPEED milliseconds
    let now = Date.now();
    if (now - start >= FALLSPEED) {
      var falling = piece.fall(playerBoard);
      start = now;
      if (!falling) {
        piece.setHasLeft(false);
        playerBoard.placePiece(piece);
        if (playerBoard.lost()) {
          piece.draw();
          playing = false;
          SPEECHTIMEOUT = 1000;
          generateSpeech("You lost! Would you like to play again?");
        } else {
          let rows = playerBoard.checkRows();
          updateSpeed(score, rows);
          score += rows;
          playerBoard.draw();
          piece = makePiece(false, undefined);
        }
      }
    }

    if (translatedCursor && !translatedLeftCursor) {
      cursor.setScreenPosition(translatedCursor);
  
      // Get the tile that the player is currently selecting, highlight it and move the block
      selectedTile = getIntersectingTile(translatedCursor);
      if (selectedTile) {
        if (!collides()) {
          piece.setScreenPosition(selectedTile);
        } else {
          piece.setScreenPosition(piece.getScreenPosition());
        }
      }
    }
    piece.setHasLeft(leftHand ? true : false);
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
    let turn = "<h4>Turn clockwise: \"Turn\" or flick right hand up</h4>";
    let turnBack = "<h4>Turn counterclockwise: \"Turn back\"</h4>";
    let turn180 = "<h4>Turn 180 desgrees: \"Flip\"</h4>";
    let drop = "<h4>Drop into place: \"Drop\", \"Down\" or flick left hand down</h4>";
    let askScore = "<h4>Ask for score: \"How many lines?\"</h4>";
    let askHold = "<h4>Replace piece with held piece: \"Hold\"</h4>";
    let askPause = "<h4>Pause the game: \"Stop\" or \"Pause\"</h4>";
    let askPlay = "<h4>Continue the game: \"Play\" or \"Start\"</h4>";
    hints.setContent(header + turn + turnBack + turn180 + drop + askScore + askHold + askPause + askPlay);
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

  if (!playing && userSaid(transcript.toLowerCase(), ["start", "begin", "go"]) && !userSaid(transcript.toLowerCase(), ["like"])) {
    SPEECHTIMEOUT = 100;
    tutorial = -1;
    playerBoard.clear();
    piece = makePiece(false, undefined);
    updateHold(holdShape);
    opened = false;
    playing = true;
    processed = true;
  }

  if (userSaid(transcript.toLowerCase(), ["stop"])) {
    paused = true;
    processed = true;
  }

  if (userSaid(transcript.toLowerCase(), ["play"])) {
    paused = false;
    processed = true;
  }

  if (userSaid(transcript.toLowerCase(), ["drop", "down"])) {
    if (tutorial == -1) tryDrop();
    else {
      piece.unhighlightTiles();
      piece.drop(playerBoard);
      lastDrop = Date.now();
    }
    processed = true;
  }

  if (userSaid(transcript.toLowerCase(), ["yes", "sure", "ok", "yeah", "yep", "please", "okay"])) {
    if (!playing && tutorial == -1) {
      playerBoard.clear();
      score = 0;
      playing = true;
      processed = true;
    }
  }

  if (userSaid(transcript.toLowerCase(), ["no", "nope", "nah", "nada"])) {
    if (!playing && tutorial == -1) {
      generateSpeech("Alright. Thanks for playing!");
      processed = true;
    }
  }

  if (userSaid(transcript.toLowerCase(), ["score", "lines", "points"])) {
    if (userSaid(transcript.toLowerCase(), ["what", "what's", "many", "much", "please", "tell", "say"])) {
      generateSpeech("You have cleared " + score + " lines.");
    }
  }

  if (!playing && userSaid(transcript.toLowerCase(), ["help", "next", "back"]) && !userSaid(transcript.toLowerCase(), ["say", "to", "step", "the", "turn"])) {
    let now = Date.now();
    if ((now - lastNext) >= 3000) {
      lastNext = now;
      if (tutorial == -1) {
        piece = makePiece(true, undefined);
        piece.draw();
      }
      if (userSaid(transcript.toLowerCase(), ["help", "next"])) {
        if (tutorial < 6) tutorial += 1;
        else tutorial = 0;
      }
      if (userSaid(transcript.toLowerCase(), ["back"])) {
        if (tutorial > 0) tutorial -= 1;
        else tutorial = 6;
      }
      if (tutorial == 0) {
        generateSpeech("To turn clockwise, flick your right hand up or say turn. Try it with this block!");
        content = "<h1>multimodal tetris</h1><h3>To turn clockwise, flick your <br> right hand up or say turn. Try <br> it with this block! </h3> <br>" + tutorialInsts;
      } else if (tutorial == 1) {
        generateSpeech("To turn counter clockwise, say turn back. To turn 180 degrees, say flip. Try it with this block!");
        content = "<h1>multimodal tetris</h1><h3>To turn counter clockwise, <br> say turn back. To turn 180 <br> degrees, say flip. Try it <br> with this block!</h3> <br>" + tutorialInsts;
      } else if (tutorial == 2) {
        generateSpeech("To move your block, point with your right hand at the position on the screen that you want to move it to. Try it with this block!");
        content = "<h1>multimodal tetris</h1><h3>To move your block, point your <br> right hand at the position <br> on the screen that you want <br> to move it to. Try it with <br> this block!</h3> <br>" + tutorialInsts;
      } else if (tutorial == 3) {
        generateSpeech("To drop your block into place, point your left hand at the screen and flick it down or say drop or down. Try it with this block!");
        content = "<h1>multimodal tetris</h1><h3>To drop your block into place, <br> point your left hand at the <br> screen and flick it down or say <br> drop or down. Try it with this <br> block!</h3> <br>" + tutorialInsts;
      } else if (tutorial == 4) {
        generateSpeech("While you're playing the game, you can ask me 'how many lines' and I will tell you your current score.");
        content = "<h1>multimodal tetris</h1><h3>While you're playing the game, <br> you can ask me 'how many <br> lines' and I will tell you your <br> current score.</h3> <br>" + tutorialInsts;
      } else if (tutorial == 5) {
        generateSpeech("To replace your piece with the one in the hold box, say 'hold'.");
        content = "<h1>multimodal tetris</h1><h3>To replace your piece with the <br> one in the hold box, say 'hold'.</h3> <br>" + tutorialInsts;
      } else if (tutorial == 6) {
        generateSpeech("You can say 'stop' or 'pause' to pause the game, and 'start' or 'play' to continue playing.");
        content = "<h1>multimodal tetris</h1><h3>You can say 'stop' or 'pause' <br> to pause the game, and 'start' <br> or 'play' to continue playing.</h3> <br>" + tutorialInsts;
      }
    }
  }

  if (userSaid(transcript.toLowerCase(), ["exit"]) && !userSaid(transcript.toLowerCase(), ["say"])) {
    piece.unhighlightTiles();
    tutorial = -1;
    piece = makePiece(false, undefined);
  }

  if (playing && userSaid(transcript.toLowerCase(), ["hold", "hulk", "hope", "whole", "help"])) {
    let currShape = piece.getShape();
    piece.setShape(holdShape);
    resetHold();
    updateHold(currShape);
    holdShape = currShape;
  }

  return processed;
};

var translateCursor = function(hand, offset) {
  var cursorPosition = hand ? hand.screenPosition() : undefined;
  var translateVector = Leap.vec3.fromValues(offset, 250, 0);
  var returnVector = Leap.vec3.create();
  return cursorPosition ? Leap.vec3.add(returnVector, cursorPosition, translateVector) : undefined;
}

var tryDrop = function() {
  let now = Date.now();
  if ((now - lastDrop) >= 1000) {
    piece.setHasLeft(false);
    piece.drop(playerBoard);
    playerBoard.placePiece(piece);
    let rows = playerBoard.checkRows();
    updateSpeed(score, rows);
    score += rows;
    playerBoard.draw();
    piece = makePiece(false, undefined);
    lastDrop = Date.now();
  }
};

var collides = function() {
  var currCol = piece.getScreenPosition().col;
  var newCol = selectedTile.col;
  var colA = currCol < newCol ? currCol : newCol;
  var colB = currCol < newCol ? newCol : currCol ;
  for (let col = colA; col < colB + 1; col++) {
    if (piece.collides(playerBoard, {row: piece.getScreenPosition().row, col: col}, undefined)) return true;
  }
  return false;
}