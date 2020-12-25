var dudeClass;
var pads;
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
var g = 0.8;
let sky;
let stars;
let worldWidth;
let worldHeight;

function preload() {

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
    //     sky = loadImage("sky.png");
    //     stars = loadImage("stars.png");

}

function setup() {

    pixelDensity(1);

    createCanvas(displayWidth * 2, displayHeight * 2 * 0.8);

    worldWidth = width;
    worldHeight = 12 * height;

    colorMode(HSB);
    sky = createGraphics(worldWidth, worldHeight);
    stars = createGraphics(worldWidth, worldHeight);
    stars.stroke(255);
    for (i = 0; i < worldWidth * worldHeight / 10000; i++) {
        stars.strokeWeight(random(1, 5));
        stars.point(random(0, worldWidth), random(0, worldHeight));
    }

    //         for (let i = 0; i < worldWidth; i++) {
    //             for (let j = 0; j < worldHeight; j++) {
    //                 
    //                 sky.set(i, j, color(hue(c), 100, 80, (j - worldHeight/2) / (worldHeight/2)));
    //             }
    //         }
    //         sky.updatePixels();

    sky.strokeWeight(1);
    let c = color('#87CEEB');
    for (let j = 0; j < worldHeight; j++) {
        sky.stroke(color(hue(c), 100, 80, (j - worldHeight / 2) / (worldHeight / 2)));
        sky.line(0, j, width, j);
    }

    //frameRate(5);

    resetSketch();
}

function resetSketch() {
    scroll = 0;
    endGameCounter = 0;
    numPads = 150;
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
    for (var y = -100; y > height - worldHeight; y += -100) {
        for (var i = 0; i < 2; i++) {
            var Fx = random(-width / 2, width / 2);
            var Fw = 128;
            pads.push(new pad(Fx,y,Fw,false));
        }
        if (y < highest) {
            highest = y;
        }

    }

    for (var i = 0; i < pads.length; i++) {
        if (pads[i].Fy == highest) {
            pads[i].winner = true;
        }
    }
}

function draw() {

    winORloose();
    translate(0, scroll);
    translate(width / 2, height);

    var leftPressed = false;
    var rightPressed = false;
    var jumpPressed = false;
    for (var i = 0; i < touches.length; i++) {
        if (touches[i].y > 0.75 * height) {
            if (touches[i].x < 0.25 * width) {
                var leftPressed = true;
            } else if (touches[i].x > 0.25 * width && touches[i].x < 0.5 * width) {
                var rightPressed = true;
            } else {
                var jumpPressed = true;
            }
        }
    }

    dude.Tx = rightPressed - leftPressed;

    if (jumpPressed) {
        dude.jump()
    }

    dude.move();
    for (var i = 0; i < pads.length; i++) {
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
        text('OOPS', width / 2, height / 4);
        endGameCounter++;
    }

    if (endGameCounter > 200) {
        resetSketch();
    }

    textSize(16);
    textAlign(LEFT, CENTER);
    text("WON: " + wins, 10, 20);
    text("LOSS: " + losses, 10, 40);

    stroke(0, 100, 100, 0.1);
    strokeWeight(12);
    textSize(100);
    textAlign(CENTER, CENTER);

    y = 0.75 * height;
    h = height - y;

    x = 0;
    w = 0.25 * width;
    fill(0, 0, 100, 0.1);
    rect(x, y, w, h);
    fill(128, 0, 100);
    text("<", x + w / 2, y + h / 2);

    x = 0.25*width;
    w = 0.25 * width;
    fill(0, 0, 100, 0.1);
    rect(x, y, w, h);
    fill(128, 0, 100);
    text(">", x + w / 2, y + h / 2);

    x = 0.5*width;
    w = 0.5 * width;
    fill(0, 0, 100, 0.1);
    rect(x, y, w, h);
    fill(128, 0, 100);
    text("^", x + w / 2, y + h / 2);

}

function pad(Fx, Fy, Fw, winner) {
    this.Fx = Fx;
    this.Fy = Fy;
    this.Fw = Fw;
    this.winner = winner;
    this.frame = 0;
    this.falling = false;

    this.show = function() {

        image(padFrames[floor(this.frame / 4)], this.Fx, this.Fy);

        if (!this.winner) {
           if ((this == dude.on && dude.Py != 0) || this.falling) {
                this.frame++;
               this.falling = true;
           }

           if (floor(this.frame / 4) == 10) {
               for (var i = 0; i < pads.length; i++) {
                  if (pads[i] === this) {
                        pads.splice(i, 1);
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
    this.jumpCounter = 20;

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
            this.jumpCounter = 20;
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
        if (this.jumpCounter > 0) {
            this.Ay = 1;
            // this.Vy += -6/sqrt(20-this.jumpCounter+1);
            if (this.jumpCounter == 20) {
                this.Vy = -15;
            } else {
                this.Vy += -2 / sqrt(20 - this.jumpCounter + 1);
            }
        }

    }

    this.move = function() {

        this.Px += this.Vx;
        this.Vx += this.Ax;
        if (this.Ay == 1) {
            if (this.Tx == 0) {
                this.Ax = 3.0 * (this.Tx - 1 / 10 * this.Vx);
            } else {
                this.Ax = 0.5 * (this.Tx - 1 / 10 * this.Vx);
            }
        } else {
            if (this.Tx == 0) {
                this.Ax = 4 * (this.Tx - 1 / 10 * this.Vx);
            } else {
                this.Ax = 0.67 * (this.Tx - 1 / 10 * this.Vx);
            }
        }

        if (this.Py + scroll < -height / 2) {
            scroll = -height / 2 - this.Py
        }

        if (this.Py + scroll > -height / 4) {
            scroll = -height / 4 - this.Py
        }

        if (this.Ay == 1 && this.jumpCounter > 0) {
            this.jumpCounter--;
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
