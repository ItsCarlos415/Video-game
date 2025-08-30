const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let keys = {};
let bullets = [];
let enemies = [];
let particles = [];
let gameRunning = false;
let paused = false;

class Player {
  constructor() {
    this.x = canvas.width / 2;
    this.y = canvas.height / 2;
    this.radius = 20;
    this.speed = 5;
    this.color = "#00ffff";
    this.dx = 0;
    this.dy = 0;
    this.hp = 100;
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
  update() {
    if (keys["w"]) this.dy = -this.speed;
    else if (keys["s"]) this.dy = this.speed;
    else this.dy = 0;

    if (keys["a"]) this.dx = -this.speed;
    else if (keys["d"]) this.dx = this.speed;
    else this.dx = 0;

    this.x += this.dx;
    this.y += this.dy;

    this.x = Math.max(this.radius, Math.min(canvas.width - this.radius, this.x));
    this.y = Math.max(this.radius, Math.min(canvas.height - this.radius, this.y));

    this.draw();
  }
}

class Bullet {
  constructor(x, y, dx, dy) {
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
    this.radius = 5;
    this.color = "yellow";
    this.speed = 10;
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
  update() {
    this.x += this.dx * this.speed;
    this.y += this.dy * this.speed;
    this.draw();
  }
}

class Enemy {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.radius = 20;
    this.color = "red";
    this.speed = 2;
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
  update(player) {
    const angle = Math.atan2(player.y - this.y, player.x - this.x);
    this.x += Math.cos(angle) * this.speed;
    this.y += Math.sin(angle) * this.speed;
    this.draw();
  }
}

function spawnEnemies() {
  setInterval(() => {
    if (gameRunning && !paused) {
      enemies.push(new Enemy());
    }
  }, 2000);
}

let player = new Player();

function animate() {
  if (!gameRunning) return;
  requestAnimationFrame(animate);

  if (paused) {
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.font = "40px Arial";
    ctx.fillText("Paused", canvas.width / 2 - 60, canvas.height / 2);
    return;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  player.update();

  bullets.forEach((bullet, bIndex) => {
    bullet.update();
    if (
      bullet.x < 0 ||
      bullet.x > canvas.width ||
      bullet.y < 0 ||
      bullet.y > canvas.height
    ) {
      bullets.splice(bIndex, 1);
    }
  });

  enemies.forEach((enemy, eIndex) => {
    enemy.update(player);

    // Collision with bullets
    bullets.forEach((bullet, bIndex) => {
      const dist = Math.hypot(bullet.x - enemy.x, bullet.y - enemy.y);
      if (dist < enemy.radius + bullet.radius) {
        enemies.splice(eIndex, 1);
        bullets.splice(bIndex, 1);
      }
    });

    // Collision with player
    const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
    if (dist < player.radius + enemy.radius) {
      gameRunning = false;
      document.getElementById("ui").style.display = "block";
      alert("Game Over!");
    }
  });
}

window.addEventListener("keydown", (e) => {
  keys[e.key.toLowerCase()] = true;
  if (e.key === "Escape") paused = !paused;
});

window.addEventListener("keyup", (e) => {
  keys[e.key.toLowerCase()] = false;
});

window.addEventListener("click", (e) => {
  if (!gameRunning || paused) return;
  const angle = Math.atan2(e.clientY - player.y, e.clientX - player.x);
  const dx = Math.cos(angle);
  const dy = Math.sin(angle);
  bullets.push(new Bullet(player.x, player.y, dx, dy));
});

document.getElementById("startBtn").addEventListener("click", () => {
  document.getElementById("ui").style.display = "none";
  player = new Player();
  bullets = [];
  enemies = [];
  gameRunning = true;
  paused = false;
  animate();
});
spawnEnemies();