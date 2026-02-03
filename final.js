let step = 35;

let state = "INTRO";
let round = 1;

let wordsByRound = {
  1: ["START", "LOGIN", "ENTER", "ACCESS", "CODE"],
  2: ["HELLO", "PROTOCOL", "HANDSHAKE", "ENCRYPT", "FIREWALL"],
  3: ["AUTHENTICATE", "INTRUSION", "SIGNATURE", "OVERRIDE", "TRANSMISSION"]
};

let target = "";
let lastTarget = "";
let buffer = "";
let correctCount = 0;
let mistakes = 0;

let wordStartMs = 0;
let timeLimitByRound = {
  1: 6000,
  2: 5000,
  3: 4000
};

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont("monospace");
  textAlign(CENTER, CENTER);
}

function resetWordTimer() {
  wordStartMs = millis();
}

function getTimeLimitMs() {
  return timeLimitByRound[round];
}

function checkTimeOut() {
  let limit = getTimeLimitMs();
  let elapsed = millis() - wordStartMs;

  if (elapsed >= limit) {
    mistakes++;
    buffer = "";

    if (mistakes >= 2) {
      state = "FAILED";
      return;
    }

    pickNewWord();
  }
}

function draw() {
  background(0);
  drawCodeGrid();

  if (state === "INTRO") drawIntro();
  if (state === "PLAY") drawPlay();
  if (state === "TRANSITION") drawTransition();
  if (state === "FAILED") drawFailed();
  if (state === "CLEAR") drawClear();

  if (state === "PLAY") checkTimeOut();
}

// background grid 
function drawCodeGrid() {
  textSize(18);
  fill(0, 255, 200, 120);

  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      let n = noise(x * 0.01, y * 0.01, frameCount * 0.02);
      let t = int(map(n, 0, 1, 33, 126));
      let ch = String.fromCharCode(t);
      text(ch, x + step / 2, y + step / 2);
    }
  }
}

//  screens
function drawIntro() {
  fill(255);
  textSize(30);
  text("DECRYPT TRAINING", width / 2, height / 2 - 90);

  textSize(16);
  text(
    "Type the word exactly.\n" +
    "2 mistakes = MISSION FAILED\n" +
    "5 correct = NEXT ROUND\n" +
    "Round 3 clears the game",
    width / 2,
    height / 2 - 10
  );

  fill(0, 255, 200);
  text("Press ENTER to begin", width / 2, height / 2 + 90);
}

function drawPlay() {
  fill(255);
  textSize(60);
  text(target, width / 2, height / 2 - 20);

  textSize(24);
  text(buffer, width / 2, height / 2 + 40);

  textSize(14);
  text(
    `Round ${round} | ${correctCount}/5 | Mistakes ${mistakes}/2`,
    width / 2,
    40
  );

  let limit = getTimeLimitMs();
  let elapsed = millis() - wordStartMs;
  let remaining = max(0, limit - elapsed);
  let display = (remaining / 1000).toFixed(1);

  text("Time: " + display + "s", width / 2, 65);
}

function drawTransition() {
  fill(255);
  textSize(24);
  text(`ROUND ${round} UNLOCKED`, width / 2, height / 2);
}

function drawFailed() {
  fill(255, 80, 80);
  textSize(36);
  text("MISSION FAILED", width / 2, height / 2);

  fill(0, 255, 200);
  textSize(14);
  text("Press R to retry", width / 2, height / 2 + 70);
}

function drawClear() {
  fill(0, 255, 200);
  textSize(36);
  text("MISSION COMPLETE", width / 2, height / 2);

  fill(255);
  textSize(14);
  text("Press R to play again", width / 2, height / 2 + 70);
}

//  input 
function keyPressed() {
  
  if (state === "INTRO" && keyCode === ENTER) {
    resetGame();
    resetWordTimer();
    state = "PLAY";
    return;
  }

  
  if ((state === "FAILED" || state === "CLEAR") && (key === "r" || key === "R")) {
    resetGame();
    state = "INTRO";
    return;
  }

  if (state !== "PLAY") return;

  
  if (typeof key !== "string" || key.length !== 1) return;

  let ch = key.toUpperCase();
  if (!(/[A-Z0-9]/.test(ch))) return;

  buffer += ch;

  if (target.startsWith(buffer)) {
    if (buffer === target) {
      correctCount++;
      buffer = "";

      if (correctCount >= 5) {
        if (round >= 3) {
          state = "CLEAR";
          return;
        }

        round++;
        correctCount = 0;
        state = "TRANSITION";

        setTimeout(() => {
          state = "PLAY";
          pickNewWord();
        }, 1000);
      } else {
        pickNewWord();
      }
    }
  } else {
    mistakes++;
    buffer = "";

    if (mistakes >= 2) {
      state = "FAILED";
    }
  }
}

function pickNewWord() {
  let list = wordsByRound[round];
  let newWord = random(list);

  while (newWord === lastTarget && list.length > 1) {
    newWord = random(list);
  }

  lastTarget = newWord;
  target = newWord;
  buffer = "";
  resetWordTimer();
}

function resetGame() {
  round = 1;
  correctCount = 0;
  mistakes = 0;
  buffer = "";
  lastTarget = "";
  pickNewWord();
}
