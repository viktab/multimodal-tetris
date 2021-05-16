// Import Famo.us dependencies
var Engine = famous.core.Engine;
var Modifier = famous.core.Modifier;
var Transform = famous.core.Transform;
var Surface = famous.core.Surface;
var ImageSurface = famous.surfaces.ImageSurface;
var StateModifier = famous.modifiers.StateModifier;
var Draggable = famous.modifiers.Draggable;
var GridLayout = famous.views.GridLayout;

var tiles = [];
var tileModifiers = [];
var holdTiles = [];
var gridOrigin = [350, 35];
var holdOrigin = [gridOrigin[0] + BOARDWIDTH + 15, gridOrigin[1]];

var background, otherFeedback, hints;

// USER INTERFACE SETUP
var setupUserInterface = function() {
  var mainContext = Engine.createContext();
  background = new Surface({
    content: "<h1>multimodal tetris</h1>",
    properties: {
      backgroundColor: "rgb(34, 34, 34)",
      color: "white"
    }
  });
  mainContext.add(background);
  otherFeedback = new Surface({
    content: "",
    size: [undefined, 50],
    properties: {
      backgroundColor: "rgb(34, 34, 34)",
      color: "white"
    }
  });
  var otherModifier = new StateModifier({
    origin: [0.0, 1.0],
    align: [0.0, 1.0]
  })
  mainContext.add(otherModifier).add(otherFeedback);

  // Draw the board
  for (var row = 0; row < NUMROWS; row++) {
    for (var col = 0; col < NUMCOLS; col++) {
      var tile = new Surface({
          size: [TILESIZE, TILESIZE],
          properties: {
              backgroundColor: Colors.GREY,
              color: "white",
              border: "solid 1px black"
          },
      });
      var transformModifier = new StateModifier({
        transform: Transform.translate(gridOrigin[0] + col*TILESIZE, gridOrigin[1] + row*TILESIZE, 0)
      });
      var tileModifier = new Modifier({
        opacity: 1.0
      });
      mainContext.add(transformModifier).add(tileModifier).add(tile);
      tiles.push(tile);
      tileModifiers.push(tileModifier);
    }
  }

  // Draw the hold piece section
  for (var row = 0; row < 4; row++) {
    for (var col = 0; col < 3; col++) {
      var tile = new Surface({
          size: [TILESIZE, TILESIZE],
          properties: {
              backgroundColor: Colors.DARKGREY,
              color: "white",
              border: "solid 1px black"
          },
      });
      var transformModifier = new StateModifier({
        transform: Transform.translate(holdOrigin[0] + col*TILESIZE, holdOrigin[1] + row*TILESIZE, 0)
      });
      var tileModifier = new Modifier({
        opacity: 1.0
      });
      mainContext.add(transformModifier).add(tileModifier).add(tile);
      holdTiles.push(tile);
    }
  }

  var hintsModifier = new StateModifier({
    origin: [0.0, 0.0],
    align: [0.6, 0.1] 
  })

  hints = new Surface({
    content: "",
    properties: {
      backgroundColor: "rgb(33, 33, 33)",
      color: "white"
    }
  });

  mainContext.add(hintsModifier).add(hints);

  // Draw the cursor
  var cursorSurface = new Surface({
    size : [CURSORSIZE, CURSORSIZE],
    properties : {
        backgroundColor: 'white',
        borderRadius: CURSORSIZE/2 + 'px',
        pointerEvents : 'none',
        zIndex: 1
    }
  });
  var cursorOriginModifier = new StateModifier({origin: [0.5, 0.5]});
  var cursorModifier = new Modifier({
    transform : function(){
      var cursorPosition = this.get('screenPosition');
      return Transform.translate(cursorPosition[0], cursorPosition[1], 0);
    }.bind(cursor)
  });
  mainContext.add(cursorOriginModifier).add(cursorModifier).add(cursorSurface);

};
