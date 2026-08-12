import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { keys } from './input.js';

const scene = new THREE.Scene();

const axesHelper = new THREE.AxesHelper(3);
scene.add(axesHelper);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
// controls.update() must be called after any manual changes to the camera's transform
camera.position.set(0, 5, 5);
controls.update();

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
cube.position.set(0, 0.5, 0);
scene.add(cube);

//Floor
const floorGeometry = new THREE.PlaneGeometry(100, 50, 2);
const floorMaterial = new THREE.MeshBasicMaterial({ color: 0x008000 });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.position.set(0, 0, 0);
scene.add(floor);

const clock = new THREE.Clock();

function characterMovement(delta) {
  const direction = new THREE.Vector3(0, 0, 0);
  if (keys.forward == true) {
    direction.z -= 1;
  }
  if (keys.backward == true) {
    direction.z += 1;
  }
  if (keys.left == true) {
    direction.x -= 1;
  }
  if (keys.right == true) {
    direction.x += 1;
  }
  direction.normalize().multiplyScalar(delta);
  cube.position.add(direction);
  camera.position.add(direction);
}
//Testing some basic physics

let verticalVelocity = 0;
let isGrounded = true;
const gravity = -1;

function animate() {
  const delta = clock.getDelta();
  characterMovement(delta);

  //It makes the camera follow the cube/player
  controls.target.copy(cube.position);
  controls.update();

  verticalVelocity += gravity * delta;
  cube.position.y += verticalVelocity * delta;

  //Testing if cube hitted the floor
  if (cube.position.y <= 0.5) {
    verticalVelocity = 0;
    cube.position.y = 0.5;
    isGrounded = true;
    cube.rotation.set(0, 0, 0);
  }
  if (!isGrounded) {
    cube.rotation.x += delta;
    cube.rotation.y += delta * 0.5;
    cube.rotation.z += delta * 1;
  }
  // Checking the jump with gravity
  if (isGrounded && keys.jump) {
    verticalVelocity = 1.6;
    isGrounded = false;
  }
  renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);
