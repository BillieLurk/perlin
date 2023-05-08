//p5js flowfield perlin noise pseudo code
// Path: sketch.js
var inc = 0.1;
var scl = 50;
var cols, rows;

var zoff = 0;

var fr;

var particles = [];

var flowfield;

var mic;
var amplitude;
var fft;

var canvas;

var audioStarted = false;

function handleResize() {
  resizeCanvas(window.innerWidth, window.innerHeight);
  cols = floor(width / scl)+1;
  rows = floor(height / scl+1);
  flowfield = new Array(cols * rows);
}


function setup() {
  canvas = createCanvas(window.innerWidth, window.innerHeight);
  cols = floor(width / scl)+1;
  rows = floor(height / scl)+1;
  fr = select("#framerate");

  mic = new p5.AudioIn();
  amplitude = new p5.Amplitude();
  fft = new p5.FFT();

  background(0);

  flowfield = new Array(cols * rows);

  for (var i = 0; i < 500; i++) {
    particles[i] = new Particle();
  }

  // Add an event listener for the button click
  let startAudioButton = select("#startAudioButton");
  startAudioButton.mousePressed(startAudio);

  window.addEventListener("resize", handleResize);
}

function startAudio() {
  // Start the audio context and hide the button
  if (!audioStarted) {
    audioStarted = true;
    userStartAudio();
    mic.start();
    amplitude.setInput(mic);
    fft.setInput(mic);
    select("#startAudioButton").hide();
  }
}

function draw() {
  if (true) {
    let spectrum = fft.analyze();
    let bass = fft.getEnergy("bass");
    let lineLength = 2.3*map(bass, 120, 200, 1, 50); // Scale lineLength based on the bass energy
    
    background(0, 0, 0, 10);
    var yoff = 0;
    for (var y = 0; y < rows; y++) {
      var xoff = 0;
      for (var x = 0; x < cols; x++) {
        var index = x + y * cols;
        var angle = noise(xoff, yoff, zoff) * TWO_PI * 4;
        var v = p5.Vector.fromAngle(angle);
        v.setMag(1);
        flowfield[index] = v;
        xoff += inc;
        stroke(0, 255, 0);
        // Visualize the flowfield vectors
        stroke(0, 50);
        push();
        colorMode(HSB);
        stroke(map(angle, 0, 12, 0, 255), 255, map(bass, 70, 255, 50, 255));
        translate(x * scl, y * scl);
        rotate(v.heading());
        strokeWeight(1);
        line(0, 0, lineLength, 0);
        pop();
      }
      yoff += inc;
      zoff += 0.0003;
    }
/*
    for (var i = 0; i < particles.length; i++) {
      particles[i].follow(flowfield);
      particles[i].update();
      particles[i].edges();
      particles[i].show();
    }
*/
    //fr.html(floor(frameRate()));
  }
}
// Path: particle.js
function Particle() {
  this.pos = createVector(random(width), random(height));
  this.vel = createVector(0, 0);
  this.acc = createVector(0, 0);
  this.maxspeed = 2;

  this.prevPos = this.pos.copy();

  this.update = function () {
    this.vel.add(this.acc);
    this.vel.limit(this.maxspeed);
    this.pos.add(this.vel);
    this.acc.mult(0);
  };

  this.follow = function (vectors) {
    var x = floor(this.pos.x / scl);
    var y = floor(this.pos.y / scl);
    var index = x + y * cols;
    var force = vectors[index];
    this.applyForce(force);
  };

  this.applyForce = function (force) {
    this.acc.add(force);
  };

  this.show = function () {
    
    stroke(255, 0,0);
    strokeWeight(1);
    line(this.pos.x, this.pos.y, this.prevPos.x, this.prevPos.y);
    this.updatePrev();
  };

  this.updatePrev = function () {
    this.prevPos.x = this.pos.x;
    this.prevPos.y = this.pos.y;
  };

  this.edges = function () {
    if (this.pos.x > width) {
      this.pos.x = 0;
      this.updatePrev();
    }
    if (this.pos.x < 0) {
      this.pos.x = width;
      this.updatePrev();
    }
    if (this.pos.y > height) {
      this.pos.y = 0;
      this.updatePrev();
    }
    if (this.pos.y < 0) {
      this.pos.y = height;
      this.updatePrev();
    }
  };
}
