
// SPEECH SYNTHESIS SETUP
var voicesReady = false;
window.speechSynthesis.onvoiceschanged = function() {
  voicesReady = true;
  // Uncomment to see a list of voices
  // console.log("Choose a voice:\n" + window.speechSynthesis.getVoices().map(function(v,i) { return i + ": " + v.name; }).join("\n"));
};

var generateSpeech = function(message, callback) {
  if (voicesReady) {
    var msg = new SpeechSynthesisUtterance();
    msg.voice = window.speechSynthesis.getVoices()[VOICEINDEX];
    msg.text = message;
    msg.rate = 0.2;
    if (typeof callback !== "undefined")
      msg.onend = callback;
    speechSynthesis.speak(msg);
  }
};

// getIntersectingTile(screenPosition)
//    Returns the tile enclosing the input screen position
// Input:
//    screenPosition = [x,y]
// Output:
//    tilePosition = {row: r, col: c}, if intersecting the board
//    false, if not intersecting the board
var getIntersectingTile = function(screenPosition) {
  if (screenPosition[0] >= gridOrigin[0] && screenPosition[0] <= gridOrigin[0] + BOARDWIDTH
    && screenPosition[1] >= gridOrigin[1] && screenPosition[1] <= gridOrigin[1] + BOARDHEIGHT) {
    var column = Math.floor((screenPosition[0] - gridOrigin[0]) / TILESIZE);
    var row = Math.floor((screenPosition[1] - gridOrigin[1]) / TILESIZE);
    var tile = tiles[row*NUMCOLS + column];
    return {row: row, col: column};
  }
  else {
    return false;
  }
};

var getShapeCoordinates = function(shape) {
  if (shape == "L") {
    return [[0, -1], [0, 0], [0, 1], [1, 1]];
  }
};

var rotateBlock = function(shape, rotation) {
  rotation = rotation % 4;
  if (shape == "L") {
    if (rotation == 0) {
      return [[0, -1], [0, 0], [0, 1], [1, 1]];
    } else if (rotation == 1) {
      return [[1, 0], [0, 0], [-1, 0], [-1, 1]];
    } else if (rotation == 2) {
      return [[0, 1], [0, 0], [0, -1], [-1, -1]];
    } else {
      return [[-1, 0], [0, 0], [1, 0], [1, -1]];
    }
  }
}

// unhighlightTiles()
//    Clears all highlighting from the tiles
var unhighlightTiles = function() {
  tiles.forEach(function(tile) {
    tile.setProperties({backgroundColor: Colors.GREY});
  });
};

// highlightTile(position, color)
//    Highlights a tile with a particular color
// Input:
//    position = {row: r, col: c}, tilePosition
//    color = color hex code (see Colors at top of file)
var highlightTile = function(position, color) {
  tiles[position.row*NUMCOLS + position.col].setProperties({backgroundColor: color});
};

// unblinkTiles()
//    Clears all blinking from the tiles
var unblinkTiles = function() {
  tileModifiers.forEach(function(modifier) {
    modifier.opacityFrom(1);
  });
};

// blinkTile(position)
//    Causes a tile to blink
// Input: position = {row: r, col: c}, tilePosition
var blinkTile = function(position) {
  var angle = 0;
  tileModifiers[position.row*NUMCOLS + position.col].opacityFrom(function() {
    angle += 0.1;
    return Math.cos(angle);
  });
};

// nextTurn()
//    Moves the game state to the next turn after TURNDELAY ms
var nextTurn = function() {
  // setTimeout(gameState.nextTurn, TURNDELAY);
};

// placeShip(ship)
//    Deploys a ship to the player board, based on its current screen position
var placeShip = function(ship) {
  // First, snap rotation to vert / horiz
  ship.snapRotation();

  // Get the ship origin
  var screenOrigin = ship.getScreenOrigin();
  // this seems to mistakenly think that ships near the edge are out of bounds??
  screenOrigin[0] += TILESIZE / 2;
  screenOrigin[1] += TILESIZE / 2;

  // Find the ship's origin in board coordinates
  var boardPosition = getIntersectingTile(screenOrigin); 
  if (!boardPosition) {
    ship.resetShip();
    return;
  }
  ship.setBoardPosition(boardPosition);

  // Snap to grid
  var snappedPosition = getSnappedScreenPosition(boardPosition);
  ship.setScreenPosition(snappedPosition);
  
  // Try deploying ship
  var success = playerBoard.deployShip(ship);
  if (! success)
    ship.resetShip();
};

var getSnappedScreenPosition = function(boardPosition) {
  var screenPosition = gridOrigin.slice(0);
  screenPosition[0] += boardPosition.col * TILESIZE;
  screenPosition[1] += boardPosition.row * TILESIZE;
  return screenPosition;
};
