const MOVEMENT_TIME_INTERVAL = 5000;
const STOPPAGE_TIME_INTERVAL = 2000;

const UP_DIRECTION = 0;
const DOWN_DIRECTION = 1;

const TOP_FLOOR = 2;
const BOTTOM_FLOOR = 0;

let currentPosition = BOTTOM_FLOOR;
let movingUp = false;
let movingDown = false;

let buttons = [];
for (let i = BOTTOM_FLOOR; i <= TOP_FLOOR; i++)
  buttons.push([false, false]);

const elevator = document.getElementById("elevator-main");
let elevatorAtFloor = [];
for (let i = 0; i <= TOP_FLOOR - BOTTOM_FLOOR; i++)
  elevatorAtFloor[i] = document.getElementById(`elevator-level-${i}`);

const audioPlayer = document.getElementById("elevator-audio");

function playAudio() {
  audioPlayer.play();
}

function pauseAudio() {
  audioPlayer.pause();
  audioPlayer.currentTime = null;
}

function setBgColorOfElementById(elementId, color) {
  document.getElementById(elementId).style.backgroundColor = color;
}

function isAnyButtonPressed(direction) {
  for (let i = BOTTOM_FLOOR; i <= TOP_FLOOR; i++)
    if (buttons[i][direction]) return true;
  return false;
}

function getFloorCoordinates(direction, floor) {
  const srcFloor = elevator[floor];
  const destFloor =
    direction === UP_DIRECTION ? elevatorAtFloor[floor + 1] : elevatorAtFloor[floor - 1];
  const clone = elevator.cloneNode();
  clone.style.visibility = "hidden";
  destFloor.appendChild(clone);
  const newTop =
    clone.getBoundingClientRect().top - elevator.getBoundingClientRect().top;
  const newLeft =
    clone.getBoundingClientRect().left - elevator.getBoundingClientRect().left;
  clone.parentNode.removeChild(clone);
  return {
    top: newTop + "px",
    left: newLeft + "px",
    floor: direction === UP_DIRECTION ? floor + 1 : floor - 1,
    to: destFloor,
  };
}

function transit({ top, left, floor, to }) {
  elevator.classList.add("elevator-transition");
  elevator.style.top = top;
  elevator.style.left = left;
  setTimeout(() => {
    elevator.style.position = "scroll";
    elevator.classList.remove("elevator-transition");
    elevator.style.removeProperty("top");
    elevator.style.removeProperty("left");
    currentPosition = floor;
    to.appendChild(elevator);
  }, MOVEMENT_TIME_INTERVAL);
}

async function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function moveElevator() {
  if (currentPosition === TOP_FLOOR) {
    if (isAnyButtonPressed(DOWN_DIRECTION)) {
      playAudio();
      for (let floor = TOP_FLOOR; floor > BOTTOM_FLOOR; floor--) {
        if (buttons[floor][DOWN_DIRECTION]) {
          pauseAudio();
          await sleep(STOPPAGE_TIME_INTERVAL);
          buttons[floor][DOWN_DIRECTION] = false;
          setBgColorOfElementById(`button-down-${floor}`, "#aaa");
          playAudio();
        }
        transit(getFloorCoordinates(DOWN_DIRECTION, floor));
        await sleep(MOVEMENT_TIME_INTERVAL);
        movingDown = false;
      }
      pauseAudio();
    } else movingDown = false;
  } else if (currentPosition === BOTTOM_FLOOR) {
    if (isAnyButtonPressed(UP_DIRECTION)) {
      playAudio();
      for (let floor = BOTTOM_FLOOR; floor < TOP_FLOOR; floor++) {
        if (buttons[floor][UP_DIRECTION]) {
          pauseAudio();
          await sleep(STOPPAGE_TIME_INTERVAL);
          buttons[floor][UP_DIRECTION] = false;
          setBgColorOfElementById(`button-up-${floor}`, "#aaa");
          playAudio();
        }
        transit(getFloorCoordinates(UP_DIRECTION, floor));
        await sleep(MOVEMENT_TIME_INTERVAL);
        movingUp = false;
      }
      pauseAudio();
    } else movingUp = false;
  }
}

function triggerMovement(direction, floor) {
  if (direction === "UP" || direction === "DOWN") {
    const moveDirection = direction === "UP" ? UP_DIRECTION : DOWN_DIRECTION;
    buttons[floor][moveDirection] = true;
    setBgColorOfElementById(
      `button-${moveDirection === UP_DIRECTION ? "up" : "down"}-${floor}`,
      "#2e2"
    );
    buttons[TOP_FLOOR][UP_DIRECTION] = false;
    buttons[BOTTOM_FLOOR][DOWN_DIRECTION] = false;
    if (moveDirection === UP_DIRECTION) {
      if (!movingUp) {
        movingUp = true;
        moveElevator();
      }
    } else {
      if (!movingDown) {
        movingDown = true;
        moveElevator();
      }
    }
  }
}
