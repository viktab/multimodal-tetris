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

  initialize: function(shape) {
    this.set('shape', shape);
    let color = getShapeColor(shape);
    this.set('color', color);
    let offsets = getShapeCoordinates(shape);
    this.set('offsets', offsets);
    var topOffsets = offsets.map(function(elt) { return elt[1]; });
    var topOffset = Math.min.apply(null, topOffsets);
    this.set('screenPosition', {row: -topOffset, col: 5});
    this.set('rotation', 0);
  },

  setScreenPosition: function(position) {
    this.set('screenPosition', {row: this.get('screenPosition').row, col: position.col});
  },

  getScreenPosition: function() {
    return this.get('screenPosition');
  }, 

  getOffsets: function() {
    return this.get('offsets');
  },

  getColor: function() {
    return this.get('color');
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
  },

  draw: function() {
    for (let i = 0; i < 4; i++) {
      var offset = this.get('offsets')[i];
      var tile = {row: this.get('screenPosition').row + offset[1], col: this.get('screenPosition').col + offset[0]};
      highlightTile(tile, this.get('color'));
    }
  },

  unhighlightTiles: function() {
    for (let i = 0; i < 4; i++) {
      var offset = this.get('offsets')[i];
      var tile = {row: this.get('screenPosition').row + offset[1], col: this.get('screenPosition').col + offset[0]};
      highlightTile(tile, Colors.GREY);
    }
  }
})

var Board = Backbone.Model.extend({

  initialize: function() {
    this.set('grid', new Array(NUMROWS*NUMCOLS).fill(Colors.GREY));
  },

  draw: function() {
    let grid = this.get('grid');
    for (let i = 0; i < NUMCOLS*NUMROWS; i++) {
      let color = grid[i];
      if (color != Colors.GREY) {
        let row = Math.floor(i / NUMCOLS);
        let col = i % NUMCOLS;
        highlightTile({row: row, col: col}, color);
      }
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
    return false;
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

  hasBlock: function(position) {
    let grid = this.get('grid');
    return (grid[position[1]*NUMCOLS + position[0]] != Colors.GREY);
  },

  resetBoard: function() {
    this.initialize();
  },
});
