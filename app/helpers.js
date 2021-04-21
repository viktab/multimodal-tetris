
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

var makePiece = function() {
  let shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
  return new Piece(shape);
}

var getShapeCoordinates = function(shape) {
  if (shape == "L") {
    return [[0, -1], [0, 0], [0, 1], [1, 1]];
  } else if (shape == "J") {
    return [[0, -1], [0, 0], [0, 1], [-1, 1]];
  } else if (shape == "T") {
    return [[-1, 0], [0, 0], [1, 0], [0, -1]];
  } else if (shape == "I") {
    return [[0, -1], [0, 0], [0, 1], [0, 2]];
  } else if (shape == "O") {
    return [[-1, 0], [0, 0], [0, 1], [-1, 1]];
  } else if (shape == "Z") {
    return [[-1, 0], [0, 0], [0, 1], [1, 1]];
  } else {
    return [[1, 0], [0, 0], [0, 1], [-1, 1]];
  }
};

var getShapeColor = function(shape) {
  if (shape == "L") {
    return Colors.ORANGE;
  } else if (shape == "J") {
    return Colors.BLUE;
  } else if (shape == "T") {
    return Colors.PURPLE;
  } else if (shape == "I") {
    return Colors.CYAN;
  } else if (shape == "O") {
    return Colors.YELLOW;
  } else if (shape == "Z") {
    return Colors.RED;
  } else {
    return Colors.GREEN;
  }
}

var getShapeShadow = function(shape) {
  if (shape == "L") {
    return Colors.LIGHTORANGE;
  } else if (shape == "J") {
    return Colors.LIGHTBLUE;
  } else if (shape == "T") {
    return Colors.LIGHTPURPLE;
  } else if (shape == "I") {
    return Colors.LIGHTCYAN;
  } else if (shape == "O") {
    return Colors.LIGHTYELLOW;
  } else if (shape == "Z") {
    return Colors.LIGHTRED;
  } else {
    return Colors.LIGHTGREEN;
  }
}

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
  } else if (shape == "J") {
    if (rotation == 0) {
      return [[0, -1], [0, 0], [0, 1], [-1, 1]];
    } else if (rotation == 1) {
      return [[1, 0], [0, 0], [-1, 0], [-1, -1]];
    } else if (rotation == 2) {
      return [[0, 1], [0, 0], [0, -1], [1, -1]];
    } else {
      return [[-1, 0], [0, 0], [1, 0], [1, 1]];
    }
  } else if (shape == "T") {
    if (rotation == 0) {
      return [[-1, 0], [0, 0], [1, 0], [0, -1]];
    } else if (rotation == 1) {
      return [[0, -1], [0, 0], [0, 1], [1, 0]];
    } else if (rotation == 2) {
      return [[-1, 0], [0, 0], [1, 0], [0, 1]];
    } else {
      return [[0, -1], [0, 0], [0, 1], [-1, 0]];
    }
  } else if (shape == "I") {
    if (rotation == 0 || rotation == 2) {
      return [[0, -1], [0, 0], [0, 1], [0, 2]];
    } else {
      return [[-1, 0], [0, 0], [1, 0], [2, 0]];
    }
  } else if (shape == "Z") {
    if (rotation == 0 || rotation == 2) {
      return [[-1, 0], [0, 0], [0, 1], [1, 1]];
    } else {
      return [[0, 1], [0, 0], [1, 0], [1, -1]];
    }
  } else if (shape == "S") {
    if (rotation == 0 || rotation == 2) {
      return [[1, 0], [0, 0], [0, 1], [-1, 1]];
    } else {
      return [[0, 1], [0, 0], [-1, 0], [-1, -1]];
    }
  } else {
    return [[-1, 0], [0, 0], [0, 1], [-1, 1]];
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

var unhighlightTile = function(position, board) {
  if (!board.hasBlock([position.col, position.row])) 
  tiles[position.row*NUMCOLS + position.col].setProperties({backgroundColor: Colors.GREY});
  else {
    tiles[position.row*NUMCOLS + position.col].setProperties({backgroundColor: board.getColor(position)});
  }
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
