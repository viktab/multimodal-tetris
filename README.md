# Multimodal Tetris

### How to Play
1. Download the [Leap Motion SDK](https://developer.leapmotion.com/) for your OS. Position the Leap sensor in front of your keyboard and run through a couple of the pre-packaged demos to make sure things are working properly.
2. Clone the repository to your device in a folder you can easily access. 
3. Run the webapp locally by navigating to the code directory in a terminal and running python -m http.server. Then, navigate to your web browser and go to localhost:8000. Be sure to enable microphone access, and click on the screen to ensure that the system can speak back to you.
4. Have fun!

** Be sure to run this in Google Chrome and play in a relatively quiet area to ensure that everything works properly. You must also be using python3 to run the code. Ideally, you should have Google Chrome Version 90.0.4430.212 - the game should still work otherwise, but the system's voice may have a different accent because Google loves to switch that up on us. 


### Table of Contents

All relevant code lives in the app/ folder
* app/config.js: Variable intializations for things that appear often such as colours and board size
* app/helper.js: Helper functions used primarily in main.js and models.js. Returns appropriate colours for each block shape, handles tile highlighting, generates speech, converts pointing location to the intersecting tile, etc.
* app/main.js: The main functionality of the system. Contains the loop controlled by Leap frames, handles game and gesture logic, handles speech commands, and controls the tutorial
* app/models.js: Contains all Backbone models for the app: the Cursor, the Pieces, and the Board
* app/setup.js: Sets up the user interface using famo.us
* app/setupSpeech.js: Sets up speech recognition using Google's webkitSpeechRecognition API
