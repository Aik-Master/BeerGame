// The point and size class used in this program
function Point(x, y) {
    this.x = (x)? parseFloat(x) : 0.0;
    this.y = (y)? parseFloat(y) : 0.0;
}

function Size(w, h) {
    this.w = (w)? parseFloat(w) : 0.0;
    this.h = (h)? parseFloat(h) : 0.0;
}

// Helper function for checking intersection between two rectangles
function intersect(pos1, size1, pos2, size2) {
    return (pos1.x < pos2.x + size2.w && pos1.x + size1.w > pos2.x &&
            pos1.y < pos2.y + size2.h && pos1.y + size1.h > pos2.y);
}


// The player class used in this program
function Player() {
    this.node = svgdoc.getElementById("player");
    this.position = PLAYER_INIT_POS;
    this.motion = motionType.NONE;
    this.verticalSpeed = 0;
}

/*
oo           .88888.            888888ba  dP            dP   .8888b          
            d8'   `8b           88    `8b 88            88   88   "          
dP .d8888b. 88     88 88d888b. a88aaaa8P' 88 .d8888b. d8888P 88aaa  .d8888b. 88d888b. 88d8b.d8b. 
88 Y8ooooo. 88     88 88'  `88  88        88 88'  `88   88   88     88'  `88 88'  `88 88'`88'`88 
88       88 Y8.   .8P 88    88  88        88 88.  .88   88   88     88.  .88 88       88  88  88 
dP `88888P'  `8888P'  dP    dP  dP        dP `88888P8   dP   dP     `88888P' dP       dP  dP  dP 
*/
Player.prototype.isOnPlatform = function() {
    var platforms = svgdoc.getElementById("platforms");
    var movingPlatform = svgdoc.getElementById("movingPlatform");
    for (var i = 0; i < platforms.childNodes.length; i++) {
        var node = platforms.childNodes.item(i);
        if (node.nodeName != "rect") continue;

        var x = parseFloat(node.getAttribute("x"));
        var y = parseFloat(node.getAttribute("y"));
        var w = parseFloat(node.getAttribute("width"));
        var h = parseFloat(node.getAttribute("height"));

        if (((this.position.x + PLAYER_SIZE.w > x && this.position.x < x + w) ||
             ((this.position.x + PLAYER_SIZE.w) == x && this.motion == motionType.RIGHT) ||
             (this.position.x == (x + w) && this.motion == motionType.LEFT)) &&
             (this.position.y + PLAYER_SIZE.h == y 
                // in case of standing on the moving platform the detection must not be that strict
                 || (node == movingPlatform 
                    && this.position.y + PLAYER_SIZE.h >= y - 10 
                    && this.position.y + PLAYER_SIZE.h <= y + 10)
                ))return true;
    }
    if (this.position.y + PLAYER_SIZE.h == SCREEN_SIZE.h) return true;

    return false;
}

/*
                  dP dP oo       dP           888888ba  dP            dP   .8888b                              
                  88 88          88           88    `8b 88            88   88   "                              
.d8888b. .d8888b. 88 88 dP .d888b88 .d8888b. a88aaaa8P' 88 .d8888b. d8888P 88aaa  .d8888b. 88d888b. 88d8b.d8b. 
88'  `"" 88'  `88 88 88 88 88'  `88 88ooood8  88        88 88'  `88   88   88     88'  `88 88'  `88 88'`88'`88 
88.  ... 88.  .88 88 88 88 88.  .88 88.  ...  88        88 88.  .88   88   88     88.  .88 88       88  88  88 
`88888P' `88888P' dP dP dP `88888P8 `88888P'  dP        dP `88888P8   dP   dP     `88888P' dP       dP  dP  dP 
*/
Player.prototype.collidePlatform = function(position) {
    var platforms = svgdoc.getElementById("platforms");
    for (var i = 0; i < platforms.childNodes.length; i++) {
        var node = platforms.childNodes.item(i);
        if (node.nodeName != "rect") continue;

        this.collidePlatformCheck(position, node);
    }
    var disappearingPlatforms = svgdoc.getElementById("disappearingPlatforms");
    for (var i = 0; i < disappearingPlatforms.childNodes.length; i++) {
        var disappearingPlatform = disappearingPlatforms.childNodes.item(i);
        if (disappearingPlatform.nodeName != "use") continue;

        this.collidePlatformCheck(position, disappearingPlatform);
    }

}

Player.prototype.collidePlatformCheck = function(position, node) {
        var x = parseFloat(node.getAttribute("x"));
        var y = parseFloat(node.getAttribute("y"));
        var w = parseFloat(node.getAttribute("width"));
        var h = parseFloat(node.getAttribute("height"));
        var pos = new Point(x, y);
        var size = new Size(w, h);

        if (intersect(position, PLAYER_SIZE, pos, size)) {
            position.x = this.position.x;
            if (intersect(position, PLAYER_SIZE, pos, size)) {
                if (this.position.y >= y + h)
                    position.y = y + h;
                else
                    position.y = y - PLAYER_SIZE.h;
                this.verticalSpeed = 0;
            }
        }
}


Player.prototype.collideScreen = function(position) {
    if (position.x < 0) position.x = 0;
    if (position.x + PLAYER_SIZE.w > SCREEN_SIZE.w) position.x = SCREEN_SIZE.w - PLAYER_SIZE.w;
    if (position.y < 0) {
        position.y = 0;
        this.verticalSpeed = 0;
    }
    if (position.y + PLAYER_SIZE.h > SCREEN_SIZE.h) {
        position.y = SCREEN_SIZE.h - PLAYER_SIZE.h;
        this.verticalSpeed = 0;
    }
}

/*
                                      dP                       dP            
                                      88                       88            
.d8888b. .d8888b. 88d888b. .d8888b. d8888P .d8888b. 88d888b. d8888P .d8888b. 
88'  `"" 88'  `88 88'  `88 Y8ooooo.   88   88'  `88 88'  `88   88   Y8ooooo. 
88.  ... 88.  .88 88    88       88   88   88.  .88 88    88   88         88 
`88888P' `88888P' dP    dP `88888P'   dP   `88888P8 dP    dP   dP   `88888P'                                                                      
*/
//
// Below are constants used in the game
//
var PLAYER_SIZE = new Size(25, 52);         // The size of the player
var SCREEN_SIZE = new Size(600, 560);       // The size of the game screen
var PLAYER_INIT_POS  = new Point(0, 20);     // The initial position of the player

var MOVE_DISPLACEMENT = 5;                  // The speed of the player in motion
var JUMP_SPEED = 13;                        // The speed of the player jumping
var VERTICAL_DISPLACEMENT = 1;              // The displacement of vertical speed

var GAME_INTERVAL = 25;                     // The time interval of running the game

var BULLET_SIZE = new Size(10, 10); // The size of a bullet
var BULLET_SPEED = 10.0;            // The speed of a bullet
                                    //  = pixels it moves each game loop
var SHOOT_INTERVAL = 200.0;         // The period when shooting is disabled
var MONSTER_SHOOT_INTERVAL = 2000.0;
var canShoot = true;                // A flag indicating whether the player can shoot a bullet

var MONSTER_SIZE = new Size(26, 56);// The size of a monster

var BEER_SIZE = new Size(24, 30);
var BAR_SIZE = new Size(40, 60);
var PORTAL_SIZE = new Size(40,10);
var PORTAL1_POSITION = new Point(360, 20);
var PORTAL2_POSITION = new Point(480, 400);

/*
                           oo          dP       dP                   
                                       88       88                   
dP   .dP .d8888b. 88d888b. dP .d8888b. 88d888b. 88 .d8888b. .d8888b. 
88   d8' 88'  `88 88'  `88 88 88'  `88 88'  `88 88 88ooood8 Y8ooooo. 
88 .88'  88.  .88 88       88 88.  .88 88.  .88 88 88.  ...       88 
8888P'   `88888P8 dP       dP `88888P8 88Y8888' dP `88888P' `88888P' 
*/
//
// Variables in the game
//
var motionType = {NONE:0, LEFT:1, RIGHT:2}; // Motion enum

var svgdoc = null;                          // SVG root document node
var player = null;                          // The player object
var gameInterval = null;                    // The interval
var timerInterval = null;
var monsterShootInterval = null;
var zoom = 1.0;                             // The zoom level of the screen
var platformMovingDown = true;              // the flag for the direction of the moving platform
var cheatMode = false;
var nofBullets = 8;
var startingTime = 60;
var timeLeft = startingTime;
var nofBeers = 8;
var score = 0;
var nofMonsters = 6;
var currentLevel = 1; 
var drunkMode = false;
var playerIsMovingLeft = false;
var monster = null; // this is the variable used to create monsters
//but it also keeps reference of the last monster which is the super monster
var monsterCanShoot = true;
var monsterBulletOnScreen = false;
var playerName = null;

var dieSound = new Audio('die.mp3');
var killSound = new Audio('kill.mp3');
var levelUpSound = new Audio('levelUp.mp3');
var shootSound = new Audio('shoot.mp3');
var bgMusicSound = new Audio('bgmusic.mp3');

/*
dP                         dP 
88                         88 
88 .d8888b. .d8888b. .d888b88 
88 88'  `88 88'  `88 88'  `88 
88 88.  .88 88.  .88 88.  .88 
dP `88888P' `88888P8 `88888P8 
*/
//
// The load function for the SVG document
//
function load(evt) {
    // Set the root node to the global variable
    svgdoc = evt.target.ownerDocument;

    // Attach keyboard events
    svgdoc.documentElement.addEventListener("keydown", keydown, false);
    svgdoc.documentElement.addEventListener("keyup", keyup, false);

    // Remove text nodes in the 'platforms' group
    cleanUpGroup("platforms", true);

    //initGame(false);

    var highScore = svgdoc.createElementNS("http://www.w3.org/2000/svg", "use");
    highScore.setAttribute("x", 0);
    highScore.setAttribute("y", 0);
    highScore.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#highScoreTable");
    svgdoc.getElementById("gamearea").appendChild(highScore);

    var node = svgdoc.getElementById("highScoreTable");
    node.style.setProperty("visibility", "hidden", null);

    createBar( 0 , 20 ); // i could hardcode this in svg but i already created that function...
    var bar = svgdoc.getElementById("bar");
    bar.style.setProperty("visibility", "hidden", null);
}

/*
oo          oo   dP    .88888.                               
                 88   d8'   `88                              
dP 88d888b. dP d8888P 88        .d8888b. 88d8b.d8b. .d8888b. 
88 88'  `88 88   88   88   YP88 88'  `88 88'`88'`88 88ooood8 
88 88    88 88   88   Y8.   .88 88.  .88 88  88  88 88.  ... 
dP dP    dP dP   dP    `88888'  `88888P8 dP  dP  dP `88888P' 
*/
function initGame(enableDrunkMode){

    playerName = prompt("Please enter your name", "Anonymous");

    if (playerName == null || playerName == "") {
        playerName = "Anonymous";
    }
    svgdoc.getElementById("playerName").textContent = playerName;

    // the real beginning of the track sucks therefore we need to 
    //skip that part.. everytime it loops!
    bgMusicSound.currentTime = 137;
    bgMusicSound.addEventListener('ended', function() {
        this.currentTime = 137;
        this.play();
    }, false);
    bgMusicSound.play();

    if (enableDrunkMode){
       zoom = 2.0;
       drunkMode = true; 
    }

    var node = svgdoc.getElementById("startScreen"); 
    node.parentNode.removeChild(node);

    startGame();
}


/*
           dP                       dP    .88888.                      
           88                       88   d8'   `88                     
.d8888b. d8888P .d8888b. 88d888b. d8888P 88        .d8888b. 88d8b.d8b. .d8888b.  
Y8ooooo.   88   88'  `88 88'  `88   88   88   YP88 88'  `88 88'`88'`88 88ooood8  
      88   88   88.  .88 88         88   Y8.   .88 88.  .88 88  88  88 88.  ...  
`88888P'   dP   `88888P8 dP         dP    `88888'  `88888P8 dP  dP  dP `88888P'           
*/
function startGame(){

    monsterCanShoot = true;
    monsterBulletOnScreen = false;

    svgdoc.getElementById("leftMonsterLegAnimation").setAttribute("repeatCount", "indefinite");
    svgdoc.getElementById("rightMonsterLegAnimation").setAttribute("repeatCount", "indefinite");

    // Create the player
    player = new Player();

    updateScreen();

    createDisappearingPlatform(60, 300);
    createDisappearingPlatform(540, 360);
    createDisappearingPlatform(380, 480);

    //create beers
    findPlace4Beers();

    //create monsters
    findPlace4Monsters();

    // Start the game interval
    gameInterval = setInterval("gamePlay()", GAME_INTERVAL);

    // starting the Time-counter
    timerInterval = setInterval("decreaseTime()", 1000);

}

function restartGame(enableDrunkMode){
    clearGameArea();
    
    monsterCanShoot = true;
    monsterBulletOnScreen = false;
    
    nofBullets = 8;
    svgdoc.getElementById("nofBullets").textContent = nofBullets;

    currentLevel = 1;
    svgdoc.getElementById("level").textContent = "Level:" + currentLevel;

    nofMonsters = 6;

    if (enableDrunkMode){
       zoom = 2.0;
       drunkMode = true; 
    }

    timeLeft  = startingTime = 60;
    svgdoc.getElementById("time").textContent = timeLeft + "s";
    svgdoc.getElementById("timeRectangle").setAttribute("width", timeLeft*(120/startingTime));

    score = 0;
    svgdoc.getElementById("score").textContent = "Score:" + score ;

    startGame();
}

/*
                                       888888ba  dP                   
                                       88    `8b 88                   
.d8888b. .d8888b. 88d8b.d8b. .d8888b. a88aaaa8P' 88 .d8888b. dP    dP 
88'  `88 88'  `88 88'`88'`88 88ooood8  88        88 88'  `88 88    88 
88.  .88 88.  .88 88  88  88 88.  ...  88        88 88.  .88 88.  .88 
`8888P88 `88888P8 dP  dP  dP `88888P'  dP        dP `88888P8 `8888P88 
     .88                                                          .88 
 d8888P                                                       d8888P  
*/
//
// This function updates the position and motion of the player in the system
//
function gamePlay() {
    collisionDetection();

    // Check whether the player is on a platform
    var isOnPlatform = player.isOnPlatform();
    
    // Update player position
    var displacement = new Point();

    // Move left or right
    if (player.motion == motionType.LEFT)
        displacement.x = -MOVE_DISPLACEMENT;
    if (player.motion == motionType.RIGHT)
        displacement.x = MOVE_DISPLACEMENT;

    // Fall
    if (!isOnPlatform && player.verticalSpeed <= 0) {
        displacement.y = -player.verticalSpeed;
        player.verticalSpeed -= VERTICAL_DISPLACEMENT;
    }

    // Jump
    if (player.verticalSpeed > 0) {
        displacement.y = -player.verticalSpeed;
        player.verticalSpeed -= VERTICAL_DISPLACEMENT;
        if (player.verticalSpeed <= 0)
            player.verticalSpeed = 0;
    }

    // Get the new position of the player
    var position = new Point();
    position.x = player.position.x + displacement.x;
    position.y = player.position.y + displacement.y;

    // Check collision with platforms and screen
    player.collidePlatform(position);
    player.collideScreen(position);

    // Set the location back to the player object (before update the screen)
    player.position = position;

    superMonsterShoot();

    moveBullets();

    updateScreen();

    movePlatform();

    checkDiapperingPlatform();

    moveMonsters();
}

/*
.8888b oo                dP  888888ba  dP                            
88   "                   88  88    `8b 88                            
88aaa  dP 88d888b. .d888b88 a88aaaa8P' 88 .d8888b. .d8888b. .d8888b. 
88     88 88'  `88 88'  `88  88        88 88'  `88 88'  `"" 88ooood8 
88     88 88    88 88.  .88  88        88 88.  .88 88.  ... 88.  ... 
dP     dP dP    dP `88888P8  dP        dP `88888P8 `88888P' `88888P' 
*/
function findPlace4Monsters(){

    for (var i = 0; i < nofMonsters; i++) {

        var x = Math.floor(Math.random() * SCREEN_SIZE.w - MONSTER_SIZE.w)
        var y = Math.floor(Math.random() * SCREEN_SIZE.h - MONSTER_SIZE.h)

            // not to close to the player!
        if (x < PLAYER_INIT_POS.x + 100 || y < PLAYER_INIT_POS.y + 100){
            i--;
            continue;
        }

        createMonster(x,y);
    }
}
function findPlace4Beers(){
    var platforms = svgdoc.getElementById("platforms")
    var allPlatforms = [];
    var nofPlatforms = 0;

    // finding the real platforms
    for (var i = 0; i < platforms.childNodes.length; i++) {
        var node = platforms.childNodes.item(i)
        if (node.nodeName != "rect") continue;
        allPlatforms[nofPlatforms] = node;
        nofPlatforms = nofPlatforms +1;
    }

    shuffle(allPlatforms);

    //putting the beers on random platforms
    for (var i = 0; i < nofBeers ; i++) {
        // yes, i know that there are slightly more platforms than beers!!! no need to check that
        var width = allPlatforms[i].getAttribute("width");
        var x = parseInt(allPlatforms[i].getAttribute("x"));
        var y = parseInt(allPlatforms[i].getAttribute("y"));
        // create monster on random spot on the platform
        createBeers (x + ((Math.floor(Math.random() * width/20))* 20), y);
    }

}

/*
      dP                                                                d888888P oo                     
      88                                                                   88                           
.d888b88 .d8888b. .d8888b. 88d888b. .d8888b. .d8888b. .d8888b. .d8888b.    88    dP 88d8b.d8b. .d8888b. 
88'  `88 88ooood8 88'  `"" 88'  `88 88ooood8 88'  `88 Y8ooooo. 88ooood8    88    88 88'`88'`88 88ooood8 
88.  .88 88.  ... 88.  ... 88       88.  ... 88.  .88       88 88.  ...    88    88 88  88  88 88.  ... 
`88888P8 `88888P' `88888P' dP       `88888P' `88888P8 `88888P' `88888P'    dP    dP dP  dP  dP `88888P' 
*/
function decreaseTime(){
    timeLeft = timeLeft -1;

    svgdoc.getElementById("time").textContent = timeLeft + "s";
    svgdoc.getElementById("timeRectangle").setAttribute("width", timeLeft*(120/startingTime));

    if(timeLeft <= 0){
        playerDies();
    }
}

/*
         dP                            dP     dP           .88888.           
         88                            88     88          d8'   `88          
.d8888b. 88 .d8888b. .d8888b. 88d888b. 88     88 88d888b. 88        88d888b. .d8888b. dP    dP 88d888b. 
88'  `"" 88 88ooood8 88'  `88 88'  `88 88     88 88'  `88 88   YP88 88'  `88 88'  `88 88    88 88'  `88 
88.  ... 88 88.  ... 88.  .88 88    88 Y8.   .8P 88.  .88 Y8.   .88 88       88.  .88 88.  .88 88.  .88  
`88888P' dP `88888P' `88888P8 dP    dP `Y88888P' 88Y888P'  `88888'  dP       `88888P' `88888P' 88Y888P'     
                                                 88                                            88  
                                                 dP                                            dP                            
*/
//
// This function removes all/certain nodes under a group
//
function cleanUpGroup(id, textOnly) {
    var node, next;
    var group = svgdoc.getElementById(id);
    node = group.firstChild;
    while (node != null) {
        next = node.nextSibling;
        if (!textOnly || node.nodeType == 3) // A text node
            group.removeChild(node);
        node = next;
    }
}

/*
dP                               dP                              
88                               88                              
88  .dP  .d8888b. dP    dP .d888b88 .d8888b. dP  dP  dP 88d888b. 
88888"   88ooood8 88    88 88'  `88 88'  `88 88  88  88 88'  `88 
88  `8b. 88.  ... 88.  .88 88.  .88 88.  .88 88.88b.88' 88    88 
dP   `YP `88888P' `8888P88 `88888P8 `88888P' 8888P Y8P  dP    dP 
                       .88                                       
                   d8888P   
*/
//
// This is the keydown handling function for the SVG document
//
function keydown(evt) {
    var keyCode = (evt.keyCode)? evt.keyCode : evt.getKeyCode();

    switch (keyCode) {
        case "A".charCodeAt(0):
            player.motion = motionType.LEFT;
            playerIsMovingLeft = true; 
        break;

        case "D".charCodeAt(0):
            player.motion = motionType.RIGHT;
/*              if(!playerIsMovingLeft){
                    svgdoc.getElementById("playerName").setAttribute("transform", "translate(" + 20 + "," + 0 + " ) scale(-1, 1)");
                }*/
            playerIsMovingLeft = false;
        break;

        case "W".charCodeAt(0):
            if (player.isOnPlatform()) {
                player.verticalSpeed = JUMP_SPEED;
            }
        break;

        case "C".charCodeAt(0):
            cheatMode = true;
        break;

        case "V".charCodeAt(0):
            cheatMode = false;
        break;

        case 32: // spacebar = shoot
            if (canShoot) shootBullet();
        break;


        case "T".charCodeAt(0):
            // testing functions here
            playerDies();
        break;

        case "M".charCodeAt(0):
            // testing functions here
            bgMusicSound.pause();
        break;

    }
}


/*
dP                                           
88                                           
88  .dP  .d8888b. dP    dP dP    dP 88d888b. 
88888"   88ooood8 88    88 88    88 88'  `88 
88  `8b. 88.  ... 88.  .88 88.  .88 88.  .88 
dP   `YP `88888P' `8888P88 `88888P' 88Y888P' 
                       .88          88       
                   d8888P           dP  
*/
//
// This is the keyup handling function for the SVG document
//
function keyup(evt) {
    // Get the key code
    var keyCode = (evt.keyCode)? evt.keyCode : evt.getKeyCode();

    switch (keyCode) {
        case "A".charCodeAt(0):
            if (player.motion == motionType.LEFT) player.motion = motionType.NONE;
            break;

        case "D".charCodeAt(0):
            if (player.motion == motionType.RIGHT) player.motion = motionType.NONE;
            break;
    }
}

/*
                                       888888ba  dP            dP   .8888b 
                                       88    `8b 88            88   88   " 
88d8b.d8b. .d8888b. dP   .dP .d8888b. a88aaaa8P' 88 .d8888b. d8888P 88aaa  .d8888b. 88d888b. 88d8b.d8b. 
88'`88'`88 88'  `88 88   d8' 88ooood8  88        88 88'  `88   88   88     88'  `88 88'  `88 88'`88'`88 
88  88  88 88.  .88 88 .88'  88.  ...  88        88 88.  .88   88   88     88.  .88 88       88  88  88 
dP  dP  dP `88888P' 8888P'   `88888P'  dP        dP `88888P8   dP   dP     `88888P' dP       dP  dP  dP 
*/
function movePlatform(){
    var movingPlatform = svgdoc.getElementById("movingPlatform");
    var y = parseInt(movingPlatform.getAttribute("y"));
    if (y <= 440){
        platformMovingDown = true;
    } else if(y >= 460){
        platformMovingDown = false;
    }

    if (platformMovingDown){
        y += 1;
    }else {
        y -= 1;
    }

    movingPlatform.setAttribute("y", y);
}

/*
         dP                         dP       888888ba  oo                                              oo                    888888ba  dP            dP   .8888b                              
         88                         88       88    `8b                                                                       88    `8b 88            88   88   "                              
.d8888b. 88d888b. .d8888b. .d8888b. 88  .dP  88     88 dP .d8888b. 88d888b. 88d888b. .d8888b. 88d888b. dP 88d888b. .d8888b. a88aaaa8P' 88 .d8888b. d8888P 88aaa  .d8888b. 88d888b. 88d8b.d8b. 
88'  `"" 88'  `88 88ooood8 88'  `"" 88888"   88     88 88 88'  `88 88'  `88 88'  `88 88ooood8 88'  `88 88 88'  `88 88'  `88  88        88 88'  `88   88   88     88'  `88 88'  `88 88'`88'`88 
88.  ... 88    88 88.  ... 88.  ... 88  `8b. 88    .8P 88 88.  .88 88.  .88 88.  .88 88.  ... 88       88 88    88 88.  .88  88        88 88.  .88   88   88     88.  .88 88       88  88  88 
`88888P' dP    dP `88888P' `88888P' dP   `YP 8888888P  dP `88888P8 88Y888P' 88Y888P' `88888P' dP       dP dP    dP `8888P88  dP        dP `88888P8   dP   dP     `88888P' dP       dP  dP  dP 
                                                                   88       88                                          .88                               
                                                                   dP       dP                                      d8888P 
*/

function checkDiapperingPlatform(){

    var diappearingPlatforms = svgdoc.getElementById("disappearingPlatforms");

    for (var i = 0; i < diappearingPlatforms.childNodes.length; i++) {
        var diappearingPlatform = diappearingPlatforms.childNodes.item(i);
        if (diappearingPlatform.nodeName != "use") continue;

        var y = parseInt(diappearingPlatform.getAttribute("y"));
        var x = parseInt(diappearingPlatform.getAttribute("x"));
        var width = parseInt(diappearingPlatform.getAttribute("width"));
    
        if (player.position.y + PLAYER_SIZE.h == y
            && (player.position.x + PLAYER_SIZE.w) > x && player.position.x < (x + width)
            ) {
    
            var platformOpacity = parseFloat(diappearingPlatform.style.getPropertyValue("fill-opacity"));
    
            platformOpacity -= 0.05;
    
            if (platformOpacity <= 0)
                diappearingPlatforms.removeChild(diappearingPlatform);
    
            diappearingPlatform.style.setProperty("fill-opacity", platformOpacity, null);
            diappearingPlatform.style.setProperty("stroke-opacity", platformOpacity, null);
        }
    }
}

/*
                        dP            dP            .d88888b                                               
                        88            88            88.    "'                                              
dP    dP 88d888b. .d888b88 .d8888b. d8888P .d8888b. `Y88888b. .d8888b.88d888b. .d8888b. .d8888b. 88d888b.  
88    88 88'  `88 88'  `88 88'  `88   88   88ooood8       `8b 88'  `""88'  `88 88ooood8 88ooood8 88'  `88  
88.  .88 88.  .88 88.  .88 88.  .88   88   88.  ... d8'   .8P 88.  ...88       88.  ... 88.  ... 88    88  
`88888P' 88Y888P' `88888P8 `88888P8   dP   `88888P'  Y88888P  `88888P'dP       `88888P' `88888P' dP    dP  
         88                                                            
         dP                                                            
*/
//
// This function updates the position of the player's SVG object and
// set the appropriate translation of the game screen relative to the
// the position of the player
//
function updateScreen() {
    // Transform the player
    player.node.setAttribute("transform", "translate(" + player.position.x + "," + player.position.y + ")");
            
    var scale = new Point(zoom, zoom);
    var translate = new Point();

    translate.x = SCREEN_SIZE.w / 2- (player.position.x + PLAYER_SIZE.w /2 )* scale.x;
    if (translate.x > 0)
        translate.x = 0;
    else if (translate.x < SCREEN_SIZE.w -SCREEN_SIZE.w * scale.x)
        translate.x = SCREEN_SIZE.w -SCREEN_SIZE.w * scale.x;

    translate.y = SCREEN_SIZE.h / 2- (player.position.y + PLAYER_SIZE.h /2 )* scale.y;
    if (translate.y > 0)
        translate.y = 0;
    else if (translate.y < SCREEN_SIZE.h -SCREEN_SIZE.h * scale.y)
        translate.y = SCREEN_SIZE.h -SCREEN_SIZE.h * scale.y;

    svgdoc.getElementById("gamearea").setAttribute("transform", "translate("+ translate.x + "," + translate.y + ")scale(" + scale.x + "," + scale.y + ")");


    if (playerIsMovingLeft){                               // those fucking brackets!!! stupid string interpretation!!!!!
        player.node.setAttribute("transform", "translate(" + (player.position.x + PLAYER_SIZE.w) + "," + player.position.y + " ) scale(-1, 1)");
        
        //doesn't work :(
        //svgdoc.getElementById("playerName").setAttribute("transform", "translate(" + 20 + "," + 0 + " ) scale(-1, 1)");
    }

}

/*
                                      dP            8888ba.88ba                              dP                      
                                      88            88  `8b  `8b                             88                      
.d8888b. 88d888b. .d8888b. .d8888b. d8888P .d8888b. 88   88   88 .d8888b.88d888b. .d8888b. d8888P .d8888b. 88d888b.  
88'  `"" 88'  `88 88ooood8 88'  `88   88   88ooood8 88   88   88 88'  `8888'  `88 Y8ooooo.   88   88ooood8 88'  `88  
88.  ... 88       88.  ... 88.  .88   88   88.  ... 88   88   88 88.  .8888    88       88   88   88.  ... 88        
`88888P' dP       `88888P' `88888P8   dP   `88888P' dP   dP   dP `88888P'dP    dP `88888P'   dP   `88888P' dP                                                                                                                                                          
*/
function createMonster( x , y ){

    monster = svgdoc.createElementNS("http://www.w3.org/2000/svg", "use");
    monster.setAttribute("x", x);
    monster.setAttribute("y", y);
    monster.setAttribute("destinationX", x);
    monster.setAttribute("destinationY", y);
    monster.setAttribute("movingLeft", false);  
    monster.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#monster");
    svgdoc.getElementById("monsters").appendChild(monster);
/*    var monsterLookingLeft = getElementById("monsters").getElementsByTagName("use")[0];
    monsterLookingLeft.style.setProperty("visibility", "hidden", null);*/
}

function createDisappearingPlatform(x, y){

    var disappearingPlatform = svgdoc.createElementNS("http://www.w3.org/2000/svg", "use");
    disappearingPlatform.setAttribute("x", x);
    disappearingPlatform.setAttribute("y", y);
    disappearingPlatform.setAttribute("width", 40);
    disappearingPlatform.setAttribute("height", 20);
    disappearingPlatform.style.setProperty("fill-opacity", 1, null);
    disappearingPlatform.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#disappearingPlatform");
    svgdoc.getElementById("disappearingPlatforms").appendChild(disappearingPlatform);

}

function createBar( x , y ){

    bar = svgdoc.createElementNS("http://www.w3.org/2000/svg", "use");
    bar.setAttribute("x", x);
    bar.setAttribute("y", y);
    bar.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#bar");
    svgdoc.getElementById("gamearea").appendChild(bar);
}

function createBeers( x , y ){

    var beer = svgdoc.createElementNS("http://www.w3.org/2000/svg", "use");
    beer.setAttribute("x", x );
    beer.setAttribute("y", y - BEER_SIZE.h );
    beer.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#beer");
    svgdoc.getElementById("beers").appendChild(beer);
}

/*
                                      8888ba.88ba                               dP                              
                                      88  `8b  `8b                              88                              
88d8b.d8b. .d8888b. dP   .dP .d8888b. 88   88   88 .d8888b. 88d888b. .d8888b. d8888P .d8888b. 88d888b. .d8888b. 
88'`88'`88 88'  `88 88   d8' 88ooood8 88   88   88 88'  `88 88'  `88 Y8ooooo.   88   88ooood8 88'  `88 Y8ooooo. 
88  88  88 88.  .88 88 .88'  88.  ... 88   88   88 88.  .88 88    88       88   88   88.  ... 88             88 
dP  dP  dP `88888P' 8888P'   `88888P' dP   dP   dP `88888P' dP    dP `88888P'   dP   `88888P' dP       `88888P' 
*/
function moveMonsters(){
    var monsters = svgdoc.getElementById("monsters");
    for (var i = 0; i < monsters.childNodes.length; i++) {
        var monster = monsters.childNodes.item(i);
    
        var destX = parseInt(monster.getAttribute("destinationX"));
        var destY = parseInt(monster.getAttribute("destinationY"));
        var x = parseInt(monster.getAttribute("x"));
        var y = parseInt(monster.getAttribute("y"));
        
        if (destX == x && destY == y)
            randomDest(monster);
    
        if (destX > x)x = x + 1;
        if (destX < x)x = x - 1;
        if (destY > y)y = y + 1;
        if (destY < y)y = y - 1;
    
        monster.setAttribute("x",x);
        monster.setAttribute("y",y);
    }
}


function randomDest(monster){
        var destX = Math.floor(Math.random() * (SCREEN_SIZE.w - MONSTER_SIZE.w));
        var destY = Math.floor(Math.random() * (SCREEN_SIZE.h - MONSTER_SIZE.h));

        var x = parseInt(monster.getAttribute("x"));
        var y = parseInt(monster.getAttribute("y"));

        monster.setAttribute("destinationX", destX);
        monster.setAttribute("destinationY", destY);

        var movingLeft = monster.getAttribute("movingLeft");


        // doesn't work!
        //monster.setAttribute("transform", "translate(" + (x + MONSTER_SIZE.w) + ",0 ) scale(-1, 1)");

        if(destX < x && movingLeft === 'false') {
/*            var monsterLookingLeft = monster.getElementById("monsterLookingLeft");
            monsterLookingLeft.style.setProperty("visibility", "visible", null);
            var monsterLookingRight = monster.getElementById("monsterLookingRight");
            monsterLookingRight.style.setProperty("visibility", "hidden", null);*/

            monster.setAttribute("movingLeft", !(movingLeft === 'true'));  
        }
        if(destX > x && movingLeft === 'true'){
/*            var monsterLookingLeft = monster.getElementById("monsterLookingLeft");
            monsterLookingLeft.style.setProperty("visibility", "hidden", null);
            var monsterLookingRight = monster.getElementById("monsterLookingRight");
            monsterLookingRight.style.setProperty("visibility", "visible", null);*/

            monster.setAttribute("movingLeft", !(movingLeft === 'true'));  
        }

}

/*
         dP                           dP    888888ba           dP dP            dP   
         88                           88    88    `8b          88 88            88   
.d8888b. 88d888b. .d8888b. .d8888b. d8888P a88aaaa8P' dP    dP 88 88 .d8888b. d8888P 
Y8ooooo. 88'  `88 88'  `88 88'  `88   88    88   `8b. 88    88 88 88 88ooood8   88   
      88 88    88 88.  .88 88.  .88   88    88    .88 88.  .88 88 88 88.  ...   88   
`88888P' dP    dP `88888P' `88888P'   dP    88888888P `88888P' dP dP `88888P'   dP   
*/
function shootBullet() {
    if (cheatMode) {
        nofBullets++;
    }

    if (nofBullets <= 0) return;
    
    shootSound.pause();
    shootSound.currentTime = 0;
    shootSound.play();

    canShoot = false;
    
    nofBullets = nofBullets-1

    svgdoc.getElementById("nofBullets").textContent = nofBullets;
    setTimeout("canShoot = true", SHOOT_INTERVAL);

    var bullet = svgdoc.createElementNS("http://www.w3.org/2000/svg", "use");
    bullet.setAttribute("x", player.position.x + PLAYER_SIZE.w / 2-BULLET_SIZE.w /2);
    bullet.setAttribute("y", player.position.y + PLAYER_SIZE.h / 2-BULLET_SIZE.h /2);
    bullet.setAttribute("killMonster", true);

    bullet.setAttribute("movingLeft",playerIsMovingLeft);

    bullet.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#bullet");
    svgdoc.getElementById("bullets").appendChild(bullet);
}

function superMonsterShoot() {
    if (!monsterCanShoot || monster == null || monsterBulletOnScreen) return;

    monsterBulletOnScreen = true
    monsterCanShoot = false;

    monsterShootInterval = setTimeout("monsterCanShoot = true", MONSTER_SHOOT_INTERVAL);

    var x = parseInt(monster.getAttribute("x"));
    var y = parseInt(monster.getAttribute("y"));

    var bullet = svgdoc.createElementNS("http://www.w3.org/2000/svg", "use");
    bullet.setAttribute("x", x + MONSTER_SIZE.w / 2-BULLET_SIZE.w /2);
    bullet.setAttribute("y", y + MONSTER_SIZE.h / 2-BULLET_SIZE.h /2);
    bullet.setAttribute("killMonster", false);

    bullet.setAttribute("movingLeft",monster.getAttribute("movingLeft"));

    bullet.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#bullet");
    svgdoc.getElementById("bullets").appendChild(bullet);
}

/*
                                       888888ba           dP dP            dP            
                                       88    `8b          88 88            88            
88d8b.d8b. .d8888b. dP   .dP .d8888b. a88aaaa8P' dP    dP 88 88 .d8888b. d8888P .d8888b. 
88'`88'`88 88'  `88 88   d8' 88ooood8  88   `8b. 88    88 88 88 88ooood8   88   Y8ooooo. 
88  88  88 88.  .88 88 .88'  88.  ...  88    .88 88.  .88 88 88 88.  ...   88         88 
dP  dP  dP `88888P' 8888P'   `88888P'  88888888P `88888P' dP dP `88888P'   dP   `88888P'                                                                          
*/

function moveBullets() {
    // Go through all bullets
    var bullets = svgdoc.getElementById("bullets");
    for (var i = 0; i < bullets.childNodes.length; i++) {
        var bulletNode = bullets.childNodes.item(i);

        // Update the position of the bullet
        var x = parseInt(bulletNode.getAttribute("x"));
        if (bulletNode.getAttribute("movingLeft") === 'true')
            bulletNode.setAttribute("x", x - BULLET_SPEED);
        else
            bulletNode.setAttribute("x", x + BULLET_SPEED);

        // If the bullet is not inside the screen delete it from the group
        if (x > SCREEN_SIZE.w || x < 0){
            if (bulletNode.getAttribute("killMonster")){
                monsterBulletOnScreen = false;
            }
            bullets.removeChild(bulletNode);
            i--;
        }
    }
}

/*
                  dP dP oo          oo                   888888ba             dP                       dP   oo                   
                  88 88                                  88    `8b            88                       88                        
.d8888b. .d8888b. 88 88 dP .d8888b. dP .d8888b. 88d888b. 88     88 .d8888b. d8888P .d8888b. .d8888b. d8888P dP .d8888b. 88d888b. 
88'  `"" 88'  `88 88 88 88 Y8ooooo. 88 88'  `88 88'  `88 88     88 88ooood8   88   88ooood8 88'  `""   88   88 88'  `88 88'  `88 
88.  ... 88.  .88 88 88 88       88 88 88.  .88 88    88 88    .8P 88.  ...   88   88.  ... 88.  ...   88   88 88.  .88 88    88
`88888P' `88888P' dP dP dP `88888P' dP `88888P' dP    dP 8888888P  `88888P'   dP   `88888P' `88888P'   dP   dP `88888P' dP    dP
*/
function collisionDetection() {
    var monsters = svgdoc.getElementById("monsters");

    if(!cheatMode){
       // Check whether the player collides with a monster
       for (var i = 0; i < monsters.childNodes.length; i++) {
           var monster = monsters.childNodes.item(i);
           var x = parseInt(monster.getAttribute("x"));
           var y = parseInt(monster.getAttribute("y"));

           if(intersect(new Point(x,y), MONSTER_SIZE, player.position , PLAYER_SIZE)){
                playerDies();
           }

       }
   }
    
    // Check whether the player collides with a beer
    var beers = svgdoc.getElementById("beers");
    for (var i = 0; i < beers.childNodes.length; i++) {
        var beer = beers.childNodes.item(i);
        var x = parseInt(beer.getAttribute("x"));
        var y = parseInt(beer.getAttribute("y"));

        if(intersect(new Point(x,y), BEER_SIZE , player.position , PLAYER_SIZE)){
            beers.removeChild(beer);
            i--;
            if (drunkMode){
                score = score + 50;    
            }else{
                score = score + 25;
            }
            svgdoc.getElementById("score").textContent = "Score:" + score;


            if (beers.childNodes.length <= 0){
                var bar = svgdoc.getElementById("bar");
                bar.style.setProperty("visibility", "visible", null);
            }
        }
    }

    
    if (beers.childNodes.length <= 0){
    // Check whether the player collides with the bar at (0,20)
        if(intersect(new Point(0,20), BAR_SIZE , player.position , PLAYER_SIZE)){
            
            score = score + 100 * currentLevel;
            
            if (drunkMode){
                score = score + 10 * timeLeft;    
            }else{
                score = score + 5 * timeLeft;
            }
            svgdoc.getElementById("score").textContent = "Score:" + score;
            nextLevel();
        }
    }

    // Check whether the player collides with a portal 
    if(intersect(PORTAL1_POSITION, PORTAL_SIZE , player.position , PLAYER_SIZE)){
        player.verticalSpeed = 0;
        player.position = new Point(PORTAL2_POSITION.x , PORTAL2_POSITION.y + PORTAL_SIZE.h  );
    }
    if(intersect(PORTAL2_POSITION, PORTAL_SIZE , player.position , PLAYER_SIZE)){
        player.verticalSpeed = 0;
        player.position = new Point(PORTAL1_POSITION.x , PORTAL1_POSITION.y + PORTAL_SIZE.h  );
    }
    


    // Check whether a bullet hits a something
    var bullets = svgdoc.getElementById("bullets");
    for (var i = 0; i < bullets.childNodes.length; i++) {
        var bullet = bullets.childNodes.item(i);
        var x = parseInt(bullet.getAttribute("x"));
        var y = parseInt(bullet.getAttribute("y"));
        
        // is the bullet shot by the player?
        if(bullet.getAttribute("killMonster") === 'true')  
            for (var j = 0 ; j < monsters.childNodes.length ; j++) {
                var monster = monsters.childNodes.item(j);
                var mx = parseInt(monster.getAttribute("x"));
                var my = parseInt(monster.getAttribute("y"));
    
                if(intersect(new Point(x,y), BULLET_SIZE,new Point(mx,my) , MONSTER_SIZE)){
                    monsters.removeChild(monster);
                    if (monster == this.monster){
                        clearInterval(monsterShootInterval);
                    }
                    bullets.removeChild(bullet);
                    i--; j--;
    
                    if (drunkMode){
                        score = score + 60;    
                    }else{
                        score = score + 20;
                    }
                    svgdoc.getElementById("score").textContent = "Score:" + score;
                    killSound.pause();
                    killSound.currentTime = 0;
                    killSound.play();
                }
            }else{// or shot by the monster?
                if(intersect(new Point(x,y), BULLET_SIZE, player.position , PLAYER_SIZE)){
                    if (! cheatMode) playerDies();
                }
            }
    }
}




/*
                             dP   dP                                   dP 
                             88   88                                   88 
88d888b. .d8888b. dP.  .dP d8888P 88        .d8888b. dP   .dP .d8888b. 88 
88'  `88 88ooood8  `8bd8'    88   88        88ooood8 88   d8' 88ooood8 88 
88    88 88.  ...  .d88b.    88   88        88.  ... 88 .88'  88.  ... 88 
dP    dP `88888P' dP'  `dP   dP   88888888P `88888P' 8888P'   `88888P' dP 
*/
function nextLevel(){
    clearInterval(gameInterval);
    clearInterval(timerInterval);
    levelUpSound.pause();
    levelUpSound.currentTime = 0;
    levelUpSound.play();
        svgdoc.getElementById("leftMonsterLegAnimation").setAttribute("repeatCount", 0);
    svgdoc.getElementById("rightMonsterLegAnimation").setAttribute("repeatCount", 0);
    alert("Good Job!\nGet ready for the next level!");
    currentLevel++;
    timeLeft = timeLeft + 60;
    startingTime = timeLeft;
    svgdoc.getElementById("time").textContent = timeLeft + "s";
    svgdoc.getElementById("timeRectangle").setAttribute("width", timeLeft*(120/startingTime));
    nofMonsters = nofMonsters + 4;
    nofBullets = 8;
    svgdoc.getElementById("nofBullets").textContent = nofBullets;
    svgdoc.getElementById("level").textContent = "Level:" + currentLevel;
    clearGameArea();
    startGame();

}

function clearGameArea(){
    var monsters = svgdoc.getElementById("monsters");
    var bullets = svgdoc.getElementById("bullets");
    var beers = svgdoc.getElementById("beers");

    while(monsters.childNodes.length > 0){
        monsters.removeChild(monsters.childNodes.item(0));
    }
    while(bullets.childNodes.length > 0){
        bullets.removeChild(bullets.childNodes.item(0));
    }
    while(beers.childNodes.length > 0){
        beers.removeChild(beers.childNodes.item(0));
    }


    var bar = svgdoc.getElementById("bar");
    bar.style.setProperty("visibility", "hidden", null);


    var highScoreTable = svgdoc.getElementById("highScoreTable");
    highScoreTable.style.setProperty("visibility", "hidden", null);

}


function playerDies(){
    clearInterval(gameInterval);
    clearInterval(timerInterval);
    clearInterval(monsterShootInterval);
    dieSound.pause();
    dieSound.currentTime = 0;
    dieSound.play();

    svgdoc.getElementById("leftMonsterLegAnimation").setAttribute("repeatCount", 0);
    svgdoc.getElementById("rightMonsterLegAnimation").setAttribute("repeatCount", 0);


    alert("Game over! :(");
    zoom = 1.0;
    updateScreen();
    createHighScore();
}

function createHighScore(){

    var highScores = getHighScoreTable();
    var newRecord = new ScoreRecord(playerName, score);
    
    var i;
    for (i = 0; i < highScores.length ; i++) {
         if(highScores[i].score < score){
            break;
         }
    }
    highScores.splice(i, 0, newRecord);
    setHighScoreTable(highScores);

    showHighScoreTable(highScores);
}

//Fisher-Yates (aka Knuth) Shuffle.
//http://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex ;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}



//
// A score record JavaScript class to store the name and the score of a player
//
function ScoreRecord(name, score) {
    this.name = name;
    this.score = score;
}


//
// This function reads the high score table from the cookies
//
function getHighScoreTable() {
    var table = new Array();

    for (var i = 0; i < 10; i++) {
        // Contruct the cookie name
        var name = "player" +i;

        // Get the cookie value using the cookie name
        var value = getCookie(name);

        // If the cookie does not exist exit from the for loop
        if(value == null)break;

        // Extract the name and score of the player from the cookie value
        var record = value.split("~");

        // Add a new score record at the end of the array
        table.push(new ScoreRecord(record[0], parseInt(record[1])))
    }


    return table;
}

    
//
// This function stores the high score table to the cookies
//
function setHighScoreTable(table) {
    for (var i = 0; i < 10; i++) {
        // If i is more than the length of the high score table exit
        // from the for loop
        if (i >= table.length) break;

        // Contruct the cookie name
        var name = "player" +i;

        // Store the i-th record as a cookie using the cookie name
        setCookie(name, table[i].name +"~"+ table[i].score);
    }
}


//
// This function adds a high score entry to the text node
//
function addHighScore(record, node) {
    // Create the name text span
    var nameSpan = svgdoc.createElementNS("http://www.w3.org/2000/svg", "tspan");

    // Set the attributes and create the text
    nameSpan.setAttribute("x", 130);
    nameSpan.setAttribute("dy", 30);

    var nameTextNode = svgdoc.createTextNode(record.name);
    
    nameSpan.appendChild(nameTextNode);

    // Add the name to the text node
    node.appendChild(nameSpan);

    // Create the score text span
    var scoreSpan = svgdoc.createElementNS("http://www.w3.org/2000/svg", "tspan");

    // Set the attributes and create the text
    scoreSpan.setAttribute("x", 400);

    var scoreTextNode = svgdoc.createTextNode(record.score);
    scoreSpan.appendChild(scoreTextNode);

    // Add the name to the text node
    node.appendChild(scoreSpan);

    if (record.name == playerName  && record.score == score){
        nameSpan.style.fill = "red"
        scoreSpan.style.fill = "red"
    }
}

    
//
// This function shows the high score table to SVG 
//
function showHighScoreTable(table) {
    // Show the table
    var node = svgdoc.getElementById("highScoreTable");
    node.style.setProperty("visibility", "visible", null);

    // Get the high score text node
    var node = svgdoc.getElementById("highScoreEntrys");
    node.textContent = "";
    
    for (var i = 0; i < 10; i++) {
        // If i is more than the length of the high score table exit
        // from the for loop
        if (i >= table.length) break;

        // Add the record at the end of the text node
        addHighScore(table[i], node);
    }
}


//
// The following functions are used to handle HTML cookies
//

//
// Set a cookie
//
function setCookie(name, value, expires, path, domain, secure) {
    var curCookie = name + "=" + escape(value) +
        ((expires) ? "; expires=" + expires.toGMTString() : "") +
        ((path) ? "; path=" + path : "") +
        ((domain) ? "; domain=" + domain : "") +
        ((secure) ? "; secure" : "");
    document.cookie = curCookie;
}


//
// Get a cookie
//
function getCookie(name) {
    var dc = document.cookie;
    var prefix = name + "=";
    var begin = dc.indexOf("; " + prefix);
    if (begin == -1) {
        begin = dc.indexOf(prefix);
        if (begin != 0) return null;
    } else
        begin += 2;
    var end = document.cookie.indexOf(";", begin);
    if (end == -1)
        end = dc.length;
    return unescape(dc.substring(begin + prefix.length, end));
}


//
// Delete a cookie
//
function deleteCookie(name, path, domain) {
    if (get_cookie(name)) {
        document.cookie = name + "=" + 
        ((path) ? "; path=" + path : "") +
        ((domain) ? "; domain=" + domain : "") +
        "; expires=Thu, 01-Jan-70 00:00:01 GMT";
    }
}
