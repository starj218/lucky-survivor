const game = document.getElementById("game");

// ========================
// 게임 기본 설정
// ========================

const WORLD_WIDTH = 2400;
const WORLD_HEIGHT = 1800;

const VIEW_WIDTH = 800;
const VIEW_HEIGHT = 500;

// ========================
// 게임 화면
// ========================

game.innerHTML = `
    <div id="world">
        <div id="player"></div>
        <div id="status">
            🍀 행운: 0
        </div>
    </div>
`;

const world = document.getElementById("world");
const player = document.getElementById("player");
const status = document.getElementById("status");

// ========================
// 플레이어
// ========================

let playerX = WORLD_WIDTH / 2;
let playerY = WORLD_HEIGHT / 2;

let velocityX = 0;
let velocityY = 0;

const NORMAL_SPEED = 5;
let maxSpeed = NORMAL_SPEED;

const ACCELERATION = 0.35;
const FRICTION = 0.82;

// ========================
// 아이템 관련
// ========================

let luck = 0;
let shield = false;

const ITEM_COUNT = 25;

const itemTypes = [
    {
        name: "speed",
        icon: "⚡",
        color: "#f1c40f"
    },
    {
        name: "shield",
        icon: "🛡️",
        color: "#3498db"
    },
    {
        name: "luck",
        icon: "🍀",
        color: "#2ecc71"
    },
    {
        name: "boost",
        icon: "💨",
        color: "#e67e22"
    }
];

const items = [];

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

// 장애물 생성
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
// 아이템 위치가 안전한지 검사
// ========================

function isSafeItemPosition(x, y) {

    const itemSize = 24;

    // 장애물과 겹치는지 확인
    for (const obstacle of obstacles) {

        if (
            x < obstacle.x + obstacle.width &&
            x + itemSize > obstacle.x &&
            y < obstacle.y + obstacle.height &&
            y + itemSize > obstacle.y
        ) {
            return false;
        }
    }

    return true;
}

// ========================
// 랜덤 숫자
// ========================

function randomNumber(min, max) {
    return Math.random() * (max - min) + min;
}

// ========================
// 아이템 생성
// ========================

function createItem() {

    let x;
    let y;

    // 안전한 위치가 나올 때까지 다시 뽑기
    do {
        x = randomNumber(20, WORLD_WIDTH - 44);
        y = randomNumber(20, WORLD_HEIGHT - 44);
    } while (!isSafeItemPosition(x, y));

    // 랜덤 아이템 종류
    const type =
        itemTypes[Math.floor(Math.random() * itemTypes.length)];

    const element = document.createElement("div");

    element.className = "item";
    element.textContent = type.icon;

    element.style.left = x + "px";
    element.style.top = y + "px";

    element.style.backgroundColor = type.color;

    world.appendChild(element);

    const item = {
        x: x,
        y: y,
        width: 24,
        height: 24,
        type: type.name,
        element: element
    };

    items.push(item);
}

// 처음에 아이템 25개 생성
for (let i = 0; i < ITEM_COUNT; i++) {
    createItem();
}

// ========================
// 아이템 획득 검사
// ========================

function checkItems() {

    const playerSize = 30;

    for (let i = items.length - 1; i >= 0; i--) {

        const item = items[i];

        if (
            playerX < item.x + item.width &&
            playerX + playerSize > item.x &&
            playerY < item.y + item.height &&
            playerY + playerSize > item.y
        ) {

            collectItem(item, i);
        }
    }
}

// ========================
// 아이템 효과
// ========================

function collectItem(item, index) {

    // 화면에서 삭제
    item.element.remove();

    // 배열에서 삭제
    items.splice(index, 1);

    // 아이템 효과
    if (item.type === "speed") {

        maxSpeed = 8;

        setTimeout(() => {
            maxSpeed = NORMAL_SPEED;
        }, 5000);
    }

    else if (item.type === "shield") {

        shield = true;

        player.classList.add("shield");

        setTimeout(() => {
            shield = false;
            player.classList.remove("shield");
        }, 10000);
    }

    else if (item.type === "luck") {

        luck += 1;

        status.textContent =
            "🍀 행운: " + luck;
    }

    else if (item.type === "boost") {

        velocityX *= 2;
        velocityY *= 2;
    }

    // 3초 후 새로운 아이템 생성
    setTimeout(() => {
        createItem();
    }, 3000);
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

    // 대각선 속도 보정
    if (inputX !== 0 && inputY !== 0) {

        const length =
            Math.sqrt(inputX * inputX + inputY * inputY);

        inputX /= length;
        inputY /= length;
    }

    // 가속
    velocityX += inputX * ACCELERATION;
    velocityY += inputY * ACCELERATION;

    // 최대 속도 제한
    const velocityLength =
        Math.sqrt(
            velocityX * velocityX +
            velocityY * velocityY
        );

    if (velocityLength > maxSpeed) {

        velocityX =
            (velocityX / velocityLength) * maxSpeed;

        velocityY =
            (velocityY / velocityLength) * maxSpeed;
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
    }
    else {
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
    }
    else {
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
    checkItems();
    updateCamera();

    requestAnimationFrame(gameLoop);
}

updatePlayer();
updateCamera();
gameLoop();
