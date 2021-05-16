var Cursor = Backbone.Model.extend({
  defaults: {
    screenPosition: [0, 0]
  },
  setScreenPosition: function(position) {
    this.set('screenPosition', position.slice(0));
  }
});

var Piece = Backbone.Model.extend({
  defaults: {
    offsets: [],
  }, 

  initialize: function(shape, isTutorial) {
    this.set('shape', shape);
    let color = getShapeColor(shape);
    this.set('color', color);
    let shadow = getShapeShadow(shape);
    this.set('shadow', shadow);
    let drop = getShapeDrop(shape);
    this.set('drop', drop);
    let offsets = getShapeCoordinates(shape);
    this.set('offsets', offsets);
    var topOffsets = offsets.map(function(elt) { return elt[1]; });
    var topOffset = Math.min.apply(null, topOffsets);
    if (isTutorial.val) this.set('screenPosition', {row: NUMROWS/2, col: NUMCOLS/2});
    else {
      this.set('screenPosition', {row: -topOffset, col: NUMCOLS/2});
    }
    this.set('rotation', 0);
    this.set('shadowTiles', [])
    this.set('hasLeft', false);
  },

  setScreenPosition: function(position) {
    this.set('screenPosition', {row: this.get('screenPosition').row, col: position.col});
  },

  setHasLeft: function(hasLeft) {
    this.set('hasLeft', hasLeft);
  },

  setShape: function(shape, board) {
    let oldShape = this.getShape();
    let oldOffsets = this.get('offsets');
    let oldRotation = this.get('rotation');
    this.set('shape', shape);
    let color = getShapeColor(shape);
    this.set('color', color);
    let shadow = getShapeShadow(shape);
    this.set('shadow', shadow);
    let drop = getShapeDrop(shape);
    this.set('drop', drop);
    let offsets = getShapeCoordinates(shape);
    this.set('offsets', offsets);
    this.set('rotation', 0);

    // if new shape collides, don't change it
    if (this.collides(board, this.getScreenPosition(), this.get('offsets'))) {
      this.set('shape', oldShape);
      let color = getShapeColor(oldShape);
      this.set('color', color);
      let shadow = getShapeShadow(oldShape);
      this.set('shadow', shadow);
      let drop = getShapeDrop(oldShape);
      this.set('drop', drop);
      this.set('offsets', oldOffsets);
      this.set('rotation', oldRotation);
      return false;
    }
    return true;
  },

  getScreenPosition: function() {
    return this.get('screenPosition');
  }, 

  getOffsets: function() {
    return this.get('offsets');
  },

  getColor: function() {
    return this.get('hasLeft') ? this.get('drop') : this.get('color');
  },

  getShape: function() {
    return this.get('shape');
  },

  getTiles: function() {
    var pieceTiles = [];
    var screenPos = this.get('screenPosition');
    for (let i = 0; i < 4; i++) {
      var offset = this.get('offsets')[i];
      var tile = {row: screenPos.row + offset[1], col: screenPos.col + offset[0]};
      pieceTiles.push(tile);
    }
    return pieceTiles;
  },

  drawShadow: function(board) {
    var collided = false;
    var pos = this.get('screenPosition');
    while (!collided) {
      newPos = {row: pos.row + 1, col: pos.col};
      if (!this.collides(board, newPos, this.get('offsets'))) {
        pos = newPos;
      } else {
        collided = true;
      }
    }
    let shadowTiles = [];
    for (let i = 0; i < 4; i++) {
      var offset = this.get('offsets')[i];
      var tile = {row: pos.row + offset[1], col: pos.col + offset[0]};
      highlightTile(tile, this.get('shadow'));
      shadowTiles.push(tile);
    }
    this.set('shadowTiles', shadowTiles);
  },

  fall: function(board) {
    var oldPosition = this.get('screenPosition');
    var newPosition = {row: oldPosition.row + 1, col: oldPosition.col};
    if (!this.collides(board, newPosition, this.get('offsets'))) {
      this.set('screenPosition', newPosition);
      this.draw();
      return true;
    } else return false;
  },

  rotate: function(board, turns) {
    var rotation = this.get('rotation');
    rotation += turns;
    let offsets = rotateBlock(this.get('shape'), rotation);
    if (!this.collides(board, this.get('screenPosition'), offsets)) {
      this.set('offsets', offsets);
      this.set('rotation', rotation);
      this.draw();
    }
  },

  collides: function(board, position, offsets) {
    var positions = [];
    offsets = offsets ? offsets : this.get('offsets');
    for (let i = 0; i < 4; i++) { 
      var offset = offsets[i];
      var pos = [position.col + offset[0], position.row + offset[1]];
      positions.push(pos)
    }

    for (let i = 0; i < 4; i++) {
      let pos = positions[i];
      if (pos[0] < 0 || pos[0] >= NUMCOLS || pos[1] < 0 || pos[1] >= NUMROWS) {
        return true;
      } 
      if (positions.indexOf(pos) > -1 && board.hasBlock(pos)) {
        return true;
      }
    }
    return false;
  },

  draw: function() {
    for (let i = 0; i < 4; i++) {
      var offset = this.get('offsets')[i];
      var tile = {row: this.get('screenPosition').row + offset[1], col: this.get('screenPosition').col + offset[0]};
      highlightTile(tile, this.getColor());
    }
  },

  unhighlightTiles: function() {
    for (tile of this.getTiles()) {
      highlightTile(tile, Colors.GREY);
    }
    for (shadowTile of this.get('shadowTiles')) {
      highlightTile(shadowTile, Colors.GREY);
    }
  },

  drop: function(board) {
    var collided = false;
    var pos = this.get('screenPosition');
    while (!collided) {
      newPos = {row: pos.row + 1, col: pos.col};
      if (!this.collides(board, newPos, this.get('offsets'))) {
        pos = newPos;
      } else {
        collided = true;
      }
    }
    this.set('screenPosition', pos);
    this.draw();
  },

  moveUp: function() {
    this.set('screenPosition', {row: NUMROWS/2, col: this.get('screenPosition').col});
    this.draw();
  }
})

var Board = Backbone.Model.extend({

  initialize: function() {
    this.set('grid', new Array(NUMROWS*NUMCOLS).fill(Colors.GREY));
  },

  getColor: function(position) {
    let grid = this.get('grid');
    let index = position.row*NUMCOLS + position.col;
    return grid[index];
  },

  draw: function() {
    let grid = this.get('grid');
    for (let i = 0; i < NUMCOLS*NUMROWS; i++) {
      let color = grid[i];
      let row = Math.floor(i / NUMCOLS);
      let col = i % NUMCOLS;
      highlightTile({row: row, col: col}, color);
    }
  },

  placePiece: function(piece) {
    let position = piece.getScreenPosition();
    let offsets = piece.getOffsets();
    let color = piece.getColor();
    var grid = this.get('grid');
    for (let i = 0; i < 4; i++) {
      var offset = offsets[i];
      var pos = {row: position.row + offset[1], col: position.col + offset[0]};
      var index = pos.row*NUMCOLS + pos.col;
      grid[index] = color;
    }
    this.set('grid', grid);
  },

  checkRows: function() {
    let grid = this.get('grid');
    var full = [];
    for (let row = 0; row < NUMROWS; row++) {
      let gridRow = grid.slice(row*NUMCOLS, row*NUMCOLS + NUMCOLS);
      if (gridRow.indexOf(Colors.GREY) == -1 && gridRow.indexOf(Colors.WHITE) == -1) {
        full.push(row);
      }
    }
    if (full.length > 0) {
      for(let row of full) {
        this.deleteRow(row);
      }
    }
    return full.length;
  },

  deleteRow: function(row) {
    var oldGrid = this.get('grid');
    var newGrid = [];
    for (let i = 0; i < NUMCOLS*NUMROWS; i++) {

      // place empty blocks in the top row
      if (Math.floor(i / NUMCOLS) == 0) {
        newGrid.push(Colors.GREY);
      }

      // place the same blocks under the deleted row
      else if (Math.floor(i / NUMCOLS) > row) {
        newGrid.push(oldGrid[i]);
      }

      // place blocks that moved down
      else {
        let oldIndex = i - NUMCOLS;
        newGrid.push(oldGrid[oldIndex]);
      }
    }
    this.set('grid', newGrid);
  },

  lost: function() {
    var grid = this.get('grid');
    for (let i = 0; i < NUMCOLS; i++) {
      if (grid[i] != Colors.GREY) {
        return true;
      }
    }
    return false;
  },

  clear: function() {
    this.set('grid', new Array(NUMROWS*NUMCOLS).fill(Colors.GREY));
    for (let row = 0; row < NUMROWS; row++) {
      for (let col = 0; col < NUMCOLS; col++) {
        highlightTile({row: row, col: col}, Colors.GREY);
      }
    }
  }, 

  hasBlock: function(position) {
    let grid = this.get('grid');
    return (grid[position[1]*NUMCOLS + position[0]] != Colors.GREY && 
            grid[position[1]*NUMCOLS + position[0]] != Colors.WHITE);
  },

  resetBoard: function() {
    this.initialize();
  },
});
