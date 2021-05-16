// Configuration of the game

var Colors = {
  GREY: "#AAAAAA",    // default tile color
  DARKGREY: "#696969",// hold tile color
  WHITE: "#FFFFFF",   // highlighting
  GREEN: "#7CD3A2",   // S
  RED: "#FA5C4F",     // Z
  YELLOW: "#FAF36F",  // O
  ORANGE: "#ED9418",  // L
  BLUE: "#1100FF",    // J
  CYAN: "#00FFFF",    // I
  PURPLE: "#8000FF",  // T
  LIGHTGREEN: "#CBF5CC", // S shadow
  LIGHTRED: "#F5CBCB",   // Z shadow
  LIGHTYELLOW: "#F5F1CB",// O shadow
  LIGHTORANGE: "#F5E6CB",// L shadow
  LIGHTBLUE: "#CCCBF5",  // J shadow
  LIGHTCYAN: "#CBF5F5",  // I shadow
  LIGHTPURPLE: "#E0CBF5",// T shadow
  DARKGREEN: "#002E0D", // S drop
  DARKRED: "#2E0000",   // Z drop
  DARKYELLOW: "#2E2C00",// O drop
  DARKORANGE: "#2E1F00",// L drop
  DARKBLUE: "#00022E",  // J drop
  DARKCYAN: "#002D2E",  // I drop
  DARKPURPLE: "#18002E",// T drop
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

var VOICEINDEX = 2;
var LEAPSCALE = 0.6;
var DEBUGSPEECH = true;
var SKIPSETUP = false;

var SHAPES = ["L", "J", "T", "I", "O", "Z", "S"];
var FALLSPEED = 1000;
