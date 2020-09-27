var dudeClass;
var pads;
var numPads;
var highest;
var youWon;
var youLost;
var endGameCounter;
let padFrames = [];
let marioRunRight = [];
let marioRunLeft = [];
let marioJumpRight;
let marioJumpLeft;
let marioStandRight;
let marioStandLeft;
var wins = 0;
var losses = 0;
var scroll;
var g = 0.75;
let sky;
let stars;
let screenScale = 8 / 10;
let screenWidth = 1920 / 2 * screenScale;
let screenHeight = 1080 * screenScale;
let worldWidth = screenWidth;
let worldHeight = 4 * screenHeight;

function preload() {
    colorMode(HSB);
    sky = createGraphics(worldWidth, worldHeight);
    stars = createGraphics(worldWidth, worldHeight);
    stars.stroke(255);
    stars.strokeWeight(4);
    for (i = 0; i < worldWidth * worldHeight / 10000; i++) {
        stars.point(random(0, worldWidth), random(0, worldHeight));
    }
    for (let i = 0; i < worldWidth; i++) {
        for (let j = 0; j < worldHeight; j++) {
            let c = color('#87CEEB');
            sky.set(i, j, color(hue(c), 100, 100, (j - screenHeight) / (worldHeight - 2 * screenHeight)));
        }
    }
    sky.updatePixels();

    for (var i = 0; i < 16; i++) {
        padFrames[i] = loadImage("pad_" + i + ".png");
    }

    for (var i = 0; i < 8; i++) {
        marioRunRight[i] = loadImage("right_running_" + (i + 1) + ".png");
        marioRunLeft[i] = loadImage("left_running_" + (i + 1) + ".png");
    }
    marioJumpRight = loadImage("right_jumping.png");
    marioJumpLeft = loadImage("left_jumping.png");
    marioStandRight = loadImage("right_standing.png");
    marioStandLeft = loadImage("left_standing.png");
}

function setup() {
    //frameRate(5);
    colorMode(HSB);
    createCanvas(screenWidth, screenHeight);
    resetSketch();
}

function resetSketch() {
    scroll = 0;
    endGameCounter = 0;
    numPads = 100;
    highest = 0;
    pads = [];

    if (youWon) {
        wins++;
    }
    if (youLost) {
        losses++;
    }

    youWon = false;
    youLost = false;
    dude = new dudeClass();
    pads[0] = new pad(-width,0,2 * width,false);
    for (var i = 1; i < numPads; i++) {
        var Fx = random(-width / 2, width / 2);
        var Fy = -100 * ceil(random((worldHeight - height) / 100));
        var Fw = 128;
        pads[i] = new pad(Fx,Fy,Fw,false);
        if (Fy < highest) {
            highest = Fy;
        }
    }
    for (var i = 0; i < numPads; i++) {
        if (pads[i].Fy == highest) {
            pads[i].winner = true;
        }
    }
}

function draw() {

    winORloose();
    translate(0, scroll);
    translate(width / 2, height);

    dude.move();
    for (var i = 0; i < numPads; i++) {
        dude.checkLanding(pads[i]);
        pads[i].show();
    }
    dude.show();
}

function winORloose() {
    background(0, 0, 0);
    image(stars, 0, -sky.height + height + scroll);
    image(sky, 0, -sky.height + height + scroll);
    fill(128, 0, 100);
    noStroke();

    if (youWon) {
        textSize(120);
        textAlign(CENTER, CENTER);
        text('YOU WON!', width / 2, height / 4);
        endGameCounter++;
    } else if (youLost) {
        textSize(120);
        textAlign(CENTER, CENTER);
        text('OOPS', width / 2, height * 7 / 8);
        endGameCounter++;
    }

    if (endGameCounter > 200) {
        resetSketch();
    }

    textSize(16);
    textAlign(LEFT, CENTER);
    text("WON: " + wins, 10, 20);
    text("LOSS: " + losses, 10, 40);

}

function pad(Fx, Fy, Fw, winner) {
    this.Fx = Fx;
    this.Fy = Fy;
    this.Fw = Fw;
    this.winner = winner;
    this.frame = 0;
    this.falling = false;

    this.show = function() {

        image(padFrames[floor(this.frame / 6)], this.Fx, this.Fy);

        if (!this.winner) {
            if ((this == dude.on && dude.Py != 0) || this.falling) {
                this.frame++;
                this.falling = true;
            }

            if (floor(this.frame / 6) == 10) {
                for (var i = 0; i < numPads; i++) {
                    if (pads[i] === this) {
                        pads.splice(i, 1);
                        numPads--;
                    }
                }
            }
        }
    }
}

function dudeClass() {
    this.Px = 0;
    this.Py = 0;
    this.Vx = 0;
    this.Vy = 0;
    this.Ax = 0;
    this.Tx = 0;
    this.Ay = 0;

    this.show = function() {

        x = this.Px - 44 / 2
        y = this.Py - 71

        if (this.Vx >= 0) {
            if (this.Ay == 1) {
                image(marioJumpRight, x, y);
            } else if (this.Vx > 1) {
                image(marioRunRight[floor((this.Px + width) / 15 % 8)], x, y);
            } else {
                image(marioStandRight, x, y);
            }
        } else {
            if (this.Ay == 1) {
                image(marioJumpLeft, x, y);
            } else if (this.Vx < -1) {
                image(marioRunLeft[7 - floor((this.Px + width) / 15 % 8)], x, y);
            } else {
                image(marioStandLeft, x, y);
            }
        }

    }

    this.checkLanding = function(pad) {

        if (this.Px > pad.Fx && this.Px < pad.Fx + pad.Fw && this.Py < pad.Fy && this.Py > pad.Fy - this.Vy && this.Vy > 0) {
            this.Vy = pad.Fy - this.Py;
        }
        if (this.Px > pad.Fx && this.Px < pad.Fx + pad.Fw && this.Py == pad.Fy && this.Vy >= 0) {
            this.Vy = 0;
            this.Ay = 0;
            this.on = pad;
            if (pad.winner) {
                youWon = true
            }
        }
    }

    this.setTx = function(Tx) {
        this.Tx += Tx;
    }

    this.jump = function() {
        if (this.Ay == 0) {
            this.Ay = 1;
            this.Vy = -20 * sqrt(g);
        }

    }

    this.move = function() {

        this.Px += this.Vx;
        this.Vx += this.Ax;
        if (this.Ay == 1) {
            if (this.Tx == 0) {
                this.Ax = 1.5 * (this.Tx - 1 / 10 * this.Vx);
            } else {
                this.Ax = 0.25 * (this.Tx - 1 / 10 * this.Vx);
            }
        } else {
            if (this.Tx == 0) {
                this.Ax = 3 * (this.Tx - 1 / 10 * this.Vx);
            } else {
                this.Ax = 0.5 * (this.Tx - 1 / 10 * this.Vx);
            }
        }

        if (this.Py + scroll < -height / 2) {
            scroll = -height / 2 - this.Py
        }

        if (this.Py + scroll > -height / 4) {
            scroll = -height / 4 - this.Py
        }

        this.Py += this.Vy;
        this.Vy += g * this.Ay - 1 / 30 * this.Vy;
        this.Ay = 1;

        if (this.Px > width / 2) {
            this.Px = -width / 2;
        }
        if (this.Px < -width / 2) {
            this.Px = width / 2;
        }

        if (this.Py > 0) {
            youLost = true;
        }
    }
}

function keyReleased() {
    if (dude.Vx != 0) {
        if (keyCode == RIGHT_ARROW) {
            dude.setTx(-1);
        }
        if (keyCode == LEFT_ARROW) {
            dude.setTx(1);
        }
    }
}

function keyPressed() {
    if (keyCode == RIGHT_ARROW) {
        dude.setTx(1);
    }
    if (keyCode == LEFT_ARROW) {
        dude.setTx(-1);
    }
    if (keyCode == UP_ARROW) {
        dude.jump();
    }
}
