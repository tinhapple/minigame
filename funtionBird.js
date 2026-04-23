// script.js
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
let bird, pipes, score, gameOver, gameStarted;
let pipeInterval;

const sounds = {
  bgm: new Audio("music/bgm.wav"),
  flap: new Audio("music/flap.wav"), 
  score: new Audio("music/score.wav"),
  hit: new Audio("music/hit.wav"),
  start: new Audio("music/start.wav"),
  over: new Audio("music/gameover.wav"),
};

sounds.bgm.loop = true;
sounds.bgm.volume = 0.4;
sounds.flap.volume = 0.7;
sounds.score.volume = 0.8;
sounds.hit.volume = 0.8;
sounds.start.volume = 0.8;
sounds.over.volume = 0.8;

// Reset game
function resetGame() {
  bird = {
    x: 80,
    y: 250,
    gravity: 0.5,
    lift: -8,
    velocity: 0,
  };

  pipes = [];
  score = 0;
  gameOver = false;
  gameStarted = false;
}
// Start game
function startGame() {
  document.getElementById("homePage").style.display = "none";
  canvas.style.display = "block";

  resetGame();

  clearInterval(pipeInterval);

  pipeInterval = setInterval(() => {
    if (gameStarted && !gameOver) {
      createPipe();
    }
  }, 2000);

  if (!window.gameRunning) {
    window.gameRunning = true;
    gameLoop();
  }
}

// Back menu
function backHome() {
  canvas.style.display = "none";
  document.getElementById("homePage").style.display = "block";
  loadRanking();
}

// Create pipe
function createPipe() {
  let gap = 150;
  let topHeight = Math.random() * 250 + 50;

  pipes.push({
    x: canvas.width,
    width: 60,
    top: topHeight,
    bottom: canvas.height - topHeight - gap,
    passed: false,
  });
}

// Draw Bird
function drawBird() {
  let flap = Math.sin(Date.now() / 120) * 7;

  ctx.save();
  ctx.translate(bird.x, bird.y);
  ctx.rotate(bird.velocity * 0.05);

  // shadow
  ctx.shadowColor = "rgba(0,0,0,0.25)";
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 4;

  // body
  let body = ctx.createRadialGradient(-5, -8, 5, 0, 0, 24);
  body.addColorStop(0, "#fff59d");
  body.addColorStop(1, "#fbc02d");

  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.arc(0, 0, 18, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowColor = "transparent";

  // wings
  ctx.fillStyle = "#f57f17";
  ctx.beginPath();
  ctx.ellipse(-10, flap / 2, 12, 7, -0.7, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(-2, flap / 3, 10, 6, 0.6, 0, Math.PI * 2);
  ctx.fill();

  // eye
  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(8, -6, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "black";
  ctx.beginPath();
  ctx.arc(10, -6, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // mouth
  ctx.fillStyle = "#ff9800";
  ctx.beginPath();
  ctx.moveTo(16, -2);
  ctx.lineTo(30, -5);
  ctx.lineTo(18, 2);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#fb8c00";
  ctx.beginPath();
  ctx.moveTo(16, 2);
  ctx.lineTo(28, 5);
  ctx.lineTo(18, 6);
  ctx.closePath();
  ctx.fill();

  // tail
  ctx.fillStyle = "#ef6c00";
  ctx.beginPath();
  ctx.moveTo(-18, -4);
  ctx.lineTo(-30, -12);
  ctx.lineTo(-24, 0);
  ctx.lineTo(-30, 12);
  ctx.lineTo(-18, 4);
  ctx.closePath();
  ctx.fill();

  // border
  ctx.strokeStyle = "#d28b00";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, 18, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}

// Draw Pipes
function drawPipes() {
  pipes.forEach((pipe) => {
    // Gradient
    let gradient = ctx.createLinearGradient(pipe.x, 0, pipe.x + pipe.width, 0);
    gradient.addColorStop(0, "#1faa00");
    gradient.addColorStop(0.5, "#4cff00");
    gradient.addColorStop(1, "#0b6e00");
    ctx.fillStyle = gradient;
    // ===== pipe top =====
    ctx.fillRect(pipe.x, 0, pipe.width, pipe.top);
    //border top
    ctx.strokeStyle = "#064d00";
    ctx.lineWidth = 3;
    ctx.strokeRect(pipe.x, 0, pipe.width, pipe.top);

    // Top pipe cover
    ctx.fillStyle = "#32cd32";
    ctx.fillRect(pipe.x - 5, pipe.top - 20, pipe.width + 10, 20);

    ctx.strokeRect(pipe.x - 5, pipe.top - 20, pipe.width + 10, 20);

    // ===== pipeBottom =====
    ctx.fillStyle = gradient;
    ctx.fillRect(pipe.x, canvas.height - pipe.bottom, pipe.width, pipe.bottom);

    ctx.strokeRect(
      pipe.x,
      canvas.height - pipe.bottom,
      pipe.width,
      pipe.bottom,
    );
    // Bottom pipe cover
    ctx.fillStyle = "#32cd32";
    ctx.fillRect(pipe.x - 5, canvas.height - pipe.bottom, pipe.width + 10, 20);
    ctx.strokeRect(
      pipe.x - 5,
      canvas.height - pipe.bottom,
      pipe.width + 10,
      20,
    );
  });
}

// Update bird
function updateBird() {
  bird.velocity += bird.gravity;
  bird.y += bird.velocity;

  if (bird.y + 15 > canvas.height || bird.y - 15 < 0) {
    endGame();
  }
}

// Update pipes
function updatePipes() {
  pipes.forEach((pipe) => {
    pipe.x -= 2;

    if (
      bird.x + 15 > pipe.x &&
      bird.x - 15 < pipe.x + pipe.width &&
      (bird.y - 15 < pipe.top || bird.y + 15 > canvas.height - pipe.bottom)
    ) {
      endGame();
    }

    if (!pipe.passed && pipe.x + pipe.width < bird.x) {
      score++;
      pipe.passed = true;

      sounds.score.currentTime = 0;
      sounds.score.play();
    }
  });

  pipes = pipes.filter((pipe) => pipe.x + pipe.width > 0);
}

// Score
function drawScore() {
  ctx.fillStyle = "black";
  ctx.font = "30px Arial";
  ctx.fillText("Score: " + score, 20, 40);
}

// Start text
function drawStartText() {
  ctx.fillStyle = "blue";
  ctx.font = "28px Arial";
  ctx.fillText("Press SPACE to Start", 40, 300);
}

// Game Over
function drawGameOver() {
  ctx.fillStyle = "red";
  ctx.font = "40px Arial";
  ctx.fillText("GAME OVER", 70, 280);

  ctx.font = "22px Arial";
  ctx.fillStyle = "black";
  ctx.fillText("Press SPACE to Menu", 70, 330);
}

// Save score
function saveScore(newScore) {
  let scores = JSON.parse(localStorage.getItem("birdScores")) || [];
  scores.push(newScore);

  scores.sort((a, b) => b - a);
  scores = scores.slice(0, 10);

  localStorage.setItem("birdScores", JSON.stringify(scores));
}

// Load ranking
function loadRanking() {
  let scores = JSON.parse(localStorage.getItem("birdScores")) || [];
  let list = document.getElementById("scoreList");

  list.innerHTML = "";

  if (scores.length === 0) {
    list.innerHTML = "<li>No score yet</li>";
    return;
  }

  scores.forEach((s) => {
    let li = document.createElement("li");
    li.textContent = "⭐ " + s + " Score";
    list.appendChild(li);
  });
}

// End game
function endGame() {
  if (!gameOver) {
    gameOver = true;
    clearInterval(pipeInterval);

    sounds.hit.play();
    sounds.over.play();
    sounds.bgm.pause();
    sounds.bgm.currentTime = 0;

    saveScore(score);
    saveScore(score);
  }
}

// Main loop
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawBird();
  drawPipes();
  drawScore();

  if (!gameStarted) {
    drawStartText();
  } else if (!gameOver) {
    updateBird();
    updatePipes();
  } else {
    drawGameOver();
  }

  requestAnimationFrame(gameLoop);
}

// Controls
document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    if (canvas.style.display === "block") {
      if (!gameStarted) {
        gameStarted = true;
      } else if (!gameOver) {
        bird.velocity = bird.lift;
        sounds.flap.currentTime = 0;
        sounds.flap.play();
      } else {
        backHome();
      }
    }
  }
});

// Load score
loadRanking();
