import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { keys } from './input.js';

const scene = new THREE.Scene();

const axesHelper = new THREE.AxesHelper(3);
scene.add(axesHelper);
const loader = new THREE.TextureLoader();
const rockTexture = loader.load('./5911.jpg');
rockTexture.colorSpace = THREE.SRGBColorSpace;
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);
//Lights
//scene light
const light = new THREE.AmbientLight( 0xFFCA7B, 1); 

scene.add( light );

const directionalLight = new THREE.DirectionalLight( 0xffffff, 3);
directionalLight.position.set(3,15,10);
directionalLight.castShadow = true;
scene.add( directionalLight );
const helper = new THREE.DirectionalLightHelper( directionalLight, 10 );
scene.add( helper );



const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.shadowMap.enabled = true;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
// controls.update() must be called after any manual changes to the camera's transform
camera.position.set(0, 5, 5);
controls.update();

//Player
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
cube.castShadow = true;
cube.position.set(0, 0.5, 0);
scene.add(cube);
const cubeBox = new THREE.Box3();
cubeBox.setFromObject(cube);


// Collision objects
const rockMaterial = new THREE.MeshStandardMaterial({ map: rockTexture });
const rockGeometry = new THREE.BoxGeometry(1, 1, 1);

const rock = new THREE.Mesh(rockGeometry, rockMaterial);
rock.position.set(3, 0.5, 0);
rock.castShadow = true;
scene.add(rock);
const rockBox = new THREE.Box3();
rockBox.setFromObject(rock);

const rock2 = new THREE.Mesh(rockGeometry, rockMaterial);
rock2.position.set(3, 0.5, 5);
rock2.castShadow = true;
scene.add(rock2);
const rockBox2 = new THREE.Box3();
rockBox2.setFromObject(rock2);
//Tree
//Trunk
const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.5, 3, 16);
const truckMaterial = new THREE.MeshStandardMaterial({ color: 0x954535 });
const trunk = new THREE.Mesh(trunkGeometry, truckMaterial);
trunk.position.set(0, 1.5, 0);
trunk.castShadow = true;

//Leafs
const leafGeometry = new THREE.ConeGeometry(3, 2, 4);
const leafMaterial = new THREE.MeshStandardMaterial({ color: 0x2d9966 });
const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
leaf.position.set(0, 4, 0);
leaf.castShadow = true;

//tree group
const tree = new THREE.Group();
tree.add(trunk);
tree.add(leaf);
tree.position.set(5, 0, 5);
scene.add(tree);

tree.updateMatrixWorld(true);

const trunkBox = new THREE.Box3();
trunkBox.setFromObject(trunk);
const collisionObjsList = [rockBox, rockBox2, trunkBox];
//Floor
const floorGeometry = new THREE.PlaneGeometry(100, 50, 2);
const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x008000 });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.receiveShadow = true;
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
let cubePositionBeforeCollision = new THREE.Vector3().copy(cube.position);
let cameraPositionBeforeCollision = new THREE.Vector3().copy(camera.position);

function animate() {
  const delta = clock.getDelta();
  cubePositionBeforeCollision = cubePositionBeforeCollision.copy(cube.position);
  cameraPositionBeforeCollision = cameraPositionBeforeCollision.copy(
    camera.position,
  );

  characterMovement(delta);

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
  //checks the cube position for collision checks later on
  cubeBox.setFromObject(cube);

  //Player and rocks collisions
  for (let i = 0; i < collisionObjsList.length; i++) {
    if (cubeBox.intersectsBox(collisionObjsList[i])) {
      console.log('collision with:', collisionObjsList[i]);
      cube.position.copy(cubePositionBeforeCollision);
      camera.position.copy(cameraPositionBeforeCollision);
    }
  }

  //It makes the camera follow the cube/player
  controls.target.copy(cube.position);
  controls.update();
  renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);
