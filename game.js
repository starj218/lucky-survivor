const game = document.getElementById("game");

// ========================
// 게임 기본 설정
// ========================

const WORLD_WIDTH = 2400;
const WORLD_HEIGHT = 1800;

const VIEW_WIDTH = 800;
const VIEW_HEIGHT = 500;

// ========================
// 게임 화면 만들기
// ========================

game.innerHTML = `
    <div id="world">
        <div id="player"></div>
    </div>
`;

const world = document.getElementById("world");
const player = document.getElementById("player");

// ========================
// 플레이어
// ========================

let playerX = WORLD_WIDTH / 2;
let playerY = WORLD_HEIGHT / 2;

let velocityX = 0;
let velocityY = 0;

const MAX_SPEED = 5;
const ACCELERATION = 0.35;
const FRICTION = 0.82;

// ========================
// 장애물
// ========================

const obstacles = [
    { x: 300, y: 250, width: 220, height: 80 },
    { x: 700, y: 500, width: 100, height: 250 },
    { x: 1100, y: 250, width: 300, height: 70 },
    { x: 1600, y: 400, width: 100, height: 300 },
    { x: 1900, y: 850, width: 250, height: 100 },
    { x: 1300, y: 1100, width: 300, height: 80 },
    { x: 600, y: 1250, width: 100, height: 250 },
    { x: 1800, y: 1400, width: 250, height: 80 }
];

// 장애물 화면에 생성
obstacles.forEach((obstacle) => {

    const element = document.createElement("div");

    element.className = "obstacle";

    element.style.left = obstacle.x + "px";
    element.style.top = obstacle.y + "px";
    element.style.width = obstacle.width + "px";
    element.style.height = obstacle.height + "px";

    world.appendChild(element);
});

// ========================
// 키 입력
// ========================

const keys = {};

document.addEventListener("keydown", (event) => {
    keys[event.key.toLowerCase()] = true;
});

document.addEventListener("keyup", (event) => {
    keys[event.key.toLowerCase()] = false;
});

// ========================
// 충돌 검사
// ========================

function isColliding(x, y) {

    const playerSize = 30;

    for (const obstacle of obstacles) {

        if (
            x < obstacle.x + obstacle.width &&
            x + playerSize > obstacle.x &&
            y < obstacle.y + obstacle.height &&
            y + playerSize > obstacle.y
        ) {
            return true;
        }
    }

    return false;
}

// ========================
// 플레이어 이동
// ========================

function movePlayer() {

    let inputX = 0;
    let inputY = 0;

    if (keys["w"] || keys["arrowup"]) {
        inputY -= 1;
    }

    if (keys["s"] || keys["arrowdown"]) {
        inputY += 1;
    }

    if (keys["a"] || keys["arrowleft"]) {
        inputX -= 1;
    }

    if (keys["d"] || keys["arrowright"]) {
        inputX += 1;
    }

    // 대각선 이동 속도 보정
    if (inputX !== 0 && inputY !== 0) {
        const length = Math.sqrt(inputX * inputX + inputY * inputY);

        inputX /= length;
        inputY /= length;
    }

    // 가속
    velocityX += inputX * ACCELERATION;
    velocityY += inputY * ACCELERATION;

    // 최대 속도 제한
    const velocityLength =
        Math.sqrt(velocityX * velocityX + velocityY * velocityY);

    if (velocityLength > MAX_SPEED) {

        velocityX =
            (velocityX / velocityLength) * MAX_SPEED;

        velocityY =
            (velocityY / velocityLength) * MAX_SPEED;
    }

    // 마찰
    if (inputX === 0) {
        velocityX *= FRICTION;
    }

    if (inputY === 0) {
        velocityY *= FRICTION;
    }

    // X축 이동
    const nextX = playerX + velocityX;

    if (
        nextX >= 0 &&
        nextX <= WORLD_WIDTH - 30 &&
        !isColliding(nextX, playerY)
    ) {
        playerX = nextX;
    } else {
        velocityX = 0;
    }

    // Y축 이동
    const nextY = playerY + velocityY;

    if (
        nextY >= 0 &&
        nextY <= WORLD_HEIGHT - 30 &&
        !isColliding(playerX, nextY)
    ) {
        playerY = nextY;
    } else {
        velocityY = 0;
    }
}

// ========================
// 카메라
// ========================

function updateCamera() {

    let cameraX =
        playerX - VIEW_WIDTH / 2 + 15;

    let cameraY =
        playerY - VIEW_HEIGHT / 2 + 15;

    // 맵 바깥으로 카메라가 나가지 않게
    cameraX = Math.max(
        0,
        Math.min(cameraX, WORLD_WIDTH - VIEW_WIDTH)
    );

    cameraY = Math.max(
        0,
        Math.min(cameraY, WORLD_HEIGHT - VIEW_HEIGHT)
    );

    world.style.transform =
        `translate(${-cameraX}px, ${-cameraY}px)`;
}

// ========================
// 플레이어 위치
// ========================

function updatePlayer() {

    player.style.left = playerX + "px";
    player.style.top = playerY + "px";
}

// ========================
// 게임 루프
// ========================

function gameLoop() {

    movePlayer();
    updatePlayer();
    updateCamera();

    requestAnimationFrame(gameLoop);
}

updatePlayer();
updateCamera();
gameLoop();
