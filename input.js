export const keys = {
  forward: false,
  backward: false,
  left: false,
  right: false,
  jump: false,
};

//WASD check

//keydown check
document.addEventListener('keydown', (keyDown) => {
  if (keyDown.key === 'W' || keyDown.key === 'w') {
    keys.forward = true;
  }
  if (keyDown.key === 'S' || keyDown.key === 's') {
    keys.backward = true;
  }
  if (keyDown.key === 'A' || keyDown.key === 'a') {
    keys.left = true;
  }
  if (keyDown.key === 'D' || keyDown.key === 'd') {
    keys.right = true;
  }
  if (keyDown.key === ' ') {
    keys.jump = true;
  }
});
//Keyup check
document.addEventListener('keyup', (keyUp) => {
  if (keyUp.key === 'W' || keyUp.key === 'w') {
    keys.forward = false;
  }
  if (keyUp.key === 'S' || keyUp.key === 's') {
    keys.backward = false;
  }
  if (keyUp.key === 'A' || keyUp.key === 'a') {
    keys.left = false;
  }
  if (keyUp.key === 'D' || keyUp.key === 'd') {
    keys.right = false;
  }
  if (keyUp.key === ' ') {
    keys.jump = false;
  }
});
