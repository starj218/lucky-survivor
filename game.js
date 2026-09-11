const game = document.getElementById("game");

game.innerHTML = `
    <div id="player"></div>
`;

const player = document.getElementById("player");

let playerX = 380;
let playerY = 230;

const speed = 5;

function updatePlayer() {
    player.style.left = playerX + "px";
    player.style.top = playerY + "px";
}

const keys = {};

document.addEventListener("keydown", function(event) {
    keys[event.key.toLowerCase()] = true;
});

document.addEventListener("keyup", function(event) {
    keys[event.key.toLowerCase()] = false;
});

function gameLoop() {

    if (keys["w"] || keys["arrowup"]) {
        playerY -= speed;
    }

    if (keys["s"] || keys["arrowdown"]) {
        playerY += speed;
    }

    if (keys["a"] || keys["arrowleft"]) {
        playerX -= speed;
    }

    if (keys["d"] || keys["arrowright"]) {
        playerX += speed;
    }

    // 맵 밖으로 나가지 못하게 하기
    playerX = Math.max(0, Math.min(780, playerX));
    playerY = Math.max(0, Math.min(480, playerY));

    updatePlayer();

    requestAnimationFrame(gameLoop);
}

updatePlayer();
gameLoop();
