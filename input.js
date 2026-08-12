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
    console.log(keyDown);
  }
  if (keyDown.key === 'S' || keyDown.key === 's') {
    keys.backward = true;
    console.log(keyDown);
  }
  if (keyDown.key === 'A' || keyDown.key === 'a') {
    keys.left = true;
    console.log(keyDown);
  }
  if (keyDown.key === 'D' || keyDown.key === 'd') {
    keys.right = true;
    console.log(keyDown);
  }
  if (keyDown.key === ' ') {
    keys.jump = true;
    console.log(keyDown);
  }
});
//Keyup check
document.addEventListener('keyup', (keyUp) => {
  if (keyUp.key === 'W' || keyUp.key === 'w') {
    keys.forward = false;
    console.log(keyUp);
  }
  if (keyUp.key === 'S' || keyUp.key === 's') {
    keys.backward = false;
    console.log(keyUp);
  }
  if (keyUp.key === 'A' || keyUp.key === 'a') {
    keys.left = false;
    console.log(keyUp);
  }
  if (keyUp.key === 'D' || keyUp.key === 'd') {
    keys.right = false;
    console.log(keyUp);
  }
  if (keyUp.key === ' ') {
    keys.jump = false;
    console.log(keyUp);
  }
});
