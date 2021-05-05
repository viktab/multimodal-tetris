// GAME SETUP
var initialState = SKIPSETUP ? "playing" : "setup";
var playerBoard = new Board();
var cursor = new Cursor();
var piece = makePiece();

// UI SETUP
setupUserInterface();

// selectedTile: The tile that the player is currently hovering above
var selectedTile = false;

var start = Date.now();
var score = 0;

var lastDrop = Date.now();

// grabbedShip/Offset: The ship and offset if player is currently manipulating a ship
var grabbedShip = false;
var grabbedOffset = [0, 0];
var rollOffset = 0;

var playing = true;

// MAIN GAME LOOP
// Called every time the Leap provides a new frame of data
Leap.loop({ frame: function(frame) {
  // Clear any highlighting at the beginning of the loop
  piece.unhighlightTiles();
  if (selectedTile) unhighlightTile(selectedTile, playerBoard);

  let now = Date.now();
  if (now - start >= FALLSPEED) {
    var falling = piece.fall(playerBoard);
    start = now;
    if (!falling) {
      playerBoard.placePiece(piece);
      if (playerBoard.lost()) {
        playerBoard.clear();
        playing = false;
        // askPlayAgain();
      } else {
        let rows = playerBoard.checkRows();
        updateSpeed(score, rows);
        score += rows;
        playerBoard.draw();
        piece = makePiece();
      }
    }
  }

  var hand = frame.hands.length > 0 ? frame.hands[0] : undefined;

  // Use the hand data to control the cursor's screen position
  var cursorPosition = hand ? hand.screenPosition() : undefined;
  var translateVector = Leap.vec3.fromValues(-200, 250, 0);
  var returnVector = Leap.vec3.create();
  var translatedCursor = cursorPosition ? Leap.vec3.add(returnVector, cursorPosition, translateVector) : undefined;

  if (translatedCursor) {
    cursor.setScreenPosition(translatedCursor);

    // Get the tile that the player is currently selecting, and highlight it
    selectedTile = getIntersectingTile(translatedCursor);
    if (selectedTile) {
      highlightTile(selectedTile, Colors.WHITE);
      if (!piece.collides(playerBoard, selectedTile, undefined)) {
        piece.setScreenPosition(selectedTile);
      } else {
        piece.setScreenPosition(piece.getScreenPosition());
      }
    }
  }
  piece.drawShadow(playerBoard);
  piece.draw();

  let content = "<h1>multimodal tetris</h1><h3>lines cleared: " + score + "</h3>";
  background.setContent(content);
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

  if (userSaid(transcript.toLowerCase(), ["drop", "down"])) {
    console.log("dropping?");
    let now = Date.now();
    if ((now - lastDrop) >= 1000) {
      piece.drop(playerBoard);
      playerBoard.placePiece(piece);
      let rows = playerBoard.checkRows();
      updateSpeed(score, rows);
      score += rows;
      playerBoard.draw();
      piece = makePiece();
      lastDrop = Date.now();
    }
  }

  return processed;
};