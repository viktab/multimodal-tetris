// Configuration of the game

var Colors = {
  GREY: "#AAAAAA",  // default tile color
  WHITE: "#FFFFFF", // highlighting
  GREEN: "#7CD3A2", // S
  RED: "#FA5C4F",   // Z
  YELLOW: "#FAF36F",// O
  ORANGE: "#ED9418",// L
  BLUE: "#1100FF",  // J
  CYAN: "#00FFFF",  // I
  PURPLE: "#8000FF",// T
};
var ROWNAMES = ["A", "B", "C", "D", "E", "F", "G", "H"];
var COLNAMES = ["1", "2", "3", "4", "5", "6", "7", "8"];

var BOARDHEIGHT = 600;
var BOARDWIDTH = 300;
var NUMROWS = 20;
var NUMCOLS = 10;
var TILESIZE = Math.ceil(BOARDHEIGHT / NUMROWS);
var CURSORSIZE = 20;
var TURNDELAY = 2500;

var VOICEINDEX = 17;
var LEAPSCALE = 0.6;
var DEBUGSPEECH = true;
var SKIPSETUP = false;

var SHAPES = ["L", "J", "T", "I", "O", "Z", "S"];
var FALLSPEED = 1000;
