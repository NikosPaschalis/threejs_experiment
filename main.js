import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { keys } from './input.js';
import { createSkySystem } from './skySystem.js';
import { Water } from 'three/addons/objects/Water.js';

const scene = new THREE.Scene();

//initialization of time
const clock = new THREE.Clock();

let timeOfDay = 0;
const loader = new THREE.TextureLoader();
const rockTexture = loader.load('./rock.png');
rockTexture.colorSpace = THREE.SRGBColorSpace;

const gltfLoader = new GLTFLoader();
//Pine Trees
const pineTree = await gltfLoader.loadAsync('asset/tree.gltf');
pineTree.scene.traverse((child) => {
  if (child.isMesh) {
    child.castShadow = true;
    //child.receiveShadow = true;
  }
});
pineTree.scene.scale.set(3, 2, 3);
pineTree.scene.position.set(0, 1.6, 0);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);

//Lights
//scene light
const light = new THREE.AmbientLight(0xffca7b, 1);

scene.add(light);

const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
directionalLight.castShadow = true;
directionalLight.shadow.camera.left = -20;
directionalLight.shadow.camera.right = 20;
directionalLight.shadow.camera.top = 20;
directionalLight.shadow.camera.bottom = -20;
directionalLight.shadow.camera.updateProjectionMatrix();
scene.add(directionalLight);
const helper = new THREE.DirectionalLightHelper(directionalLight, 10);
const shadowCameraHelper = new THREE.CameraHelper(
  directionalLight.shadow.camera,
);
scene.add(shadowCameraHelper);
scene.add(helper);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.shadowMap.enabled = true;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
const controls = new OrbitControls(camera, renderer.domElement);
// controls.update() must be called after any manual changes to the camera's transform
camera.position.set(0, 5, 7);
controls.update();

// Fireflies
const fireflyGeometry = new THREE.BufferGeometry();
const fireflyVertices = [];
for (let i = 0; i < 20; i++) {
  let x = 20 * Math.random() - 10;
  let y = 3 * Math.random() + 1;
  let z = 20 * Math.random() - 10;
  fireflyVertices.push(x, y, z);
}
fireflyGeometry.setAttribute(
  'position',
  new THREE.Float32BufferAttribute(fireflyVertices, 3),
);
const fireflyMaterial = new THREE.ShaderMaterial({
  uniforms: {
    uCoreColor: { value: new THREE.Color(0xfff59d) },
    uOuterColor: { value: new THREE.Color(0xffd600) },
    uTime: { value: 0 },
  },
  vertexShader: `

  void main(){
  
  gl_PointSize = 20.0;
  gl_Position = 
  projectionMatrix * 
  modelViewMatrix *
  vec4(position,1.0);
  }
  `,
  fragmentShader: `
  uniform vec3 uCoreColor;
  uniform vec3 uOuterColor;
  uniform float uTime;
  void main(){
  vec2 pointCoordinate = gl_PointCoord;
  vec2 center = vec2(0.5,0.5);
  float distanceFromCenter = distance(pointCoordinate,center);

  float glowStrength = 1.0 - smoothstep(0.0,0.5,distanceFromCenter);
  float normalizedPulse = (1.0 + sin(uTime)) / 2.0 ;
  float pulseStrength = mix(0.5,1.0,normalizedPulse);

  vec3 finalColor = mix(uOuterColor, uCoreColor, glowStrength);
  gl_FragColor = vec4(finalColor,glowStrength * pulseStrength);
  }
  `,
  transparent: true,
  blending: THREE.AdditiveBlending,
});
const fireflyParticles = new THREE.Points(fireflyGeometry, fireflyMaterial);
scene.add(fireflyParticles);

//Player
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
cube.castShadow = true;
cube.position.set(0, 0.5, 0);

scene.add(cube);
//Sky creation call
const {
  sky,
  skyMaterial,
  sun,
  sunMaterial,
  moon,
  moonMaterial,
  skyPalettes,
  update: updateSkySystem,
} = createSkySystem(scene, cube);

directionalLight.target = cube;
const cubeBox = new THREE.Box3();
cubeBox.setFromObject(cube);
//Water
// const waterGeometry = new THREE.PlaneGeometry(10, 20);

// const water = new Water(waterGeometry, {
//   textureWidth: 512,
//   textureHeight: 512,
//   waterNormals: new THREE.TextureLoader().load(
//     'asset/waternormals.jpg',
//     (t) => {
//       t.wrapS = t.wrapT = THREE.RepeatWrapping;
//     },
//   ),
//   sunDirection: new THREE.Vector3(0, 1, 0),
//   sunColor: 0xffffff,
//   waterColor: 0x006994,
//   distortionScale: 3.7,
// });
// water.position.y = 0.1;
// water.rotation.x = -Math.PI / 2; // ← μόνο αν το θες οριζόντιο

// scene.add(water);
// Collision objects
const collisionObjsList = [];

gltfLoader.load('asset/rocks.glb', (gltf) => {
  const rock = gltf.scene.getObjectByName('Rock');
  const darkRock = gltf.scene.getObjectByName('DarkRock');

  rock.position.set(3, 0, 0);
  darkRock.position.set(3, 0, 5);

  rock.castShadow = true;
  rock.receiveShadow = true;

  darkRock.castShadow = true;
  darkRock.receiveShadow = true;

  scene.add(rock);
  scene.add(darkRock);

  const rockBox = new THREE.Box3().setFromObject(rock);
  const rockBox2 = new THREE.Box3().setFromObject(darkRock);

  collisionObjsList.push(rockBox, rockBox2);
});

//Floor
const floorGeometry = new THREE.PlaneGeometry(100, 50, 2);
const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x008000 });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.receiveShadow = true;
floor.rotation.x = -Math.PI / 2;
floor.position.set(0, 0, 0);
scene.add(floor);
//grass
const grassGeometry = new THREE.PlaneGeometry(0.08, 0.55, 1, 5);
grassGeometry.translate(0, 0.275, 0);
const grassMaterial = new THREE.MeshStandardMaterial({
  color: 0x4f772d,
  side: THREE.DoubleSide,
  roughness: 0.9,
});
//Modify the grass to look pointy at the top
const grassPositions = grassGeometry.getAttribute('position');
grassPositions.setX(0, 0);
grassPositions.setX(1, 0);
grassPositions.needsUpdate = true;
//Grassfield generation with instanceMesh for performance
const grassField = new THREE.InstancedMesh(
  grassGeometry,
  grassMaterial,
  100000,
);
const dummy = new THREE.Object3D();

//grass loop
for (let i = 0; i < grassField.count; i++) {
  //grass dummy
  dummy.position.x = Math.random() * 100 - 50;
  dummy.position.z = Math.random() * 50 - 25;
  dummy.rotation.y = Math.random() * Math.PI;
  const randomHeight = 0.6 + Math.random() * 0.4;
  dummy.scale.set(1, randomHeight, 1);
  dummy.updateMatrix();

  grassField.setMatrixAt(i, dummy.matrix);
}
//Pine tree forest
for (let i = 0; i < 60; i++) {
  const treeClone = pineTree.scene.clone();
  treeClone.position.set(
    Math.random() * 100 - 50,
    1.5,
    Math.random() * 50 - 25,
  );

  treeClone.rotation.y = Math.random() * Math.PI * 2;

  scene.add(treeClone);
}
grassField.instanceMatrix.needsUpdate = true;
scene.add(grassField);

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

//Const for how long in seconds a day will be
const lengthOfDay = 60;
// Learning note: Revisit and reconstruct the sun/moon angle, direction,
// orbit radius, and sky-local positioning before extracting the sky system.
const sunDirection = new THREE.Vector3();
function animate() {
  const delta = clock.getDelta();

  fireflyMaterial.uniforms.uTime.value += delta;
  cubePositionBeforeCollision = cubePositionBeforeCollision.copy(cube.position);
  cameraPositionBeforeCollision = cameraPositionBeforeCollision.copy(
    camera.position,
  );
  timeOfDay += delta / lengthOfDay;
  //we need to keep the value 0-1 otherwise it keeps increasing
  timeOfDay = timeOfDay % 1;

  updateSkySystem(timeOfDay, camera.position, cube.position);

  skyMaterial.uniforms.uTimeOfDay.value = timeOfDay;

  //setting the sun and moon position based on time
  const sunAngle = (timeOfDay - 0.25) * Math.PI * 2;
  sunDirection.set(Math.cos(sunAngle), Math.sin(sunAngle), 0);
  const daylightFactor = THREE.MathUtils.smoothstep(sunDirection.y, 0, 1);
  directionalLight.intensity = 3 * daylightFactor;
  light.intensity = 0.4 + (0.8 - 0.4) * daylightFactor;
  sun.position.copy(sunDirection);
  sun.position.multiplyScalar(40);

  const moonAngle = sunAngle + Math.PI;
  const moonX = Math.cos(moonAngle) * 40;
  const moonY = Math.sin(moonAngle) * 40;
  moon.position.set(moonX, moonY, 0);
  //set colorPalette based on time and the mix of palettes between transition
  if (timeOfDay < 0.25) {
    const localT = (timeOfDay - 0) / (0.25 - 0);
    skyMaterial.uniforms.uHorizonColor.value.lerpColors(
      skyPalettes.midnight.horizon,
      skyPalettes.sunrise.horizon,
      localT,
    );
    skyMaterial.uniforms.uZenithColor.value.lerpColors(
      skyPalettes.midnight.zenith,
      skyPalettes.sunrise.zenith,
      localT,
    );
    light.color.lerpColors(
      skyPalettes.midnight.ambient,
      skyPalettes.sunrise.ambient,
      localT,
    );
  } else if (timeOfDay < 0.5) {
    const localT = (timeOfDay - 0.25) / (0.5 - 0.25);
    skyMaterial.uniforms.uHorizonColor.value.lerpColors(
      skyPalettes.sunrise.horizon,
      skyPalettes.noon.horizon,
      localT,
    );
    skyMaterial.uniforms.uZenithColor.value.lerpColors(
      skyPalettes.sunrise.zenith,
      skyPalettes.noon.zenith,
      localT,
    );
    light.color.lerpColors(
      skyPalettes.sunrise.ambient,
      skyPalettes.noon.ambient,
      localT,
    );
  } else if (timeOfDay < 0.75) {
    const localT = (timeOfDay - 0.5) / (0.75 - 0.5);
    skyMaterial.uniforms.uHorizonColor.value.lerpColors(
      skyPalettes.noon.horizon,
      skyPalettes.sunset.horizon,
      localT,
    );
    skyMaterial.uniforms.uZenithColor.value.lerpColors(
      skyPalettes.noon.zenith,
      skyPalettes.sunset.zenith,
      localT,
    );
    light.color.lerpColors(
      skyPalettes.noon.ambient,
      skyPalettes.sunset.ambient,
      localT,
    );
  } else {
    const localT = (timeOfDay - 0.75) / (1 - 0.75);
    skyMaterial.uniforms.uHorizonColor.value.lerpColors(
      skyPalettes.sunset.horizon,
      skyPalettes.midnight.horizon,
      localT,
    );
    skyMaterial.uniforms.uZenithColor.value.lerpColors(
      skyPalettes.sunset.zenith,
      skyPalettes.midnight.zenith,
      localT,
    );
    light.color.lerpColors(
      skyPalettes.sunset.ambient,
      skyPalettes.midnight.ambient,
      localT,
    );
  }
  if (timeOfDay >= 0.0 && timeOfDay < 0.25) {
    //moon
    sunMaterial.opacity = 0;
    moonMaterial.opacity = 1;
  } else if (timeOfDay >= 0.25 && timeOfDay < 0.3) {
    // sun and moon
    const sunriseFade = THREE.MathUtils.smoothstep(timeOfDay, 0.25, 0.3);

    sunMaterial.opacity = sunriseFade;
    moonMaterial.opacity = 1 - sunriseFade;
  } else if (timeOfDay >= 0.3 && timeOfDay < 0.7) {
    //sun
    sunMaterial.opacity = 1;
    moonMaterial.opacity = 0;
  } else if (timeOfDay >= 0.7 && timeOfDay < 0.75) {
    //sun and moon
    const sunsetFade = THREE.MathUtils.smoothstep(timeOfDay, 0.7, 0.75);

    sunMaterial.opacity = 1 - sunsetFade;
    moonMaterial.opacity = sunsetFade;
  } else {
    //moon
    sunMaterial.opacity = 0;
    moonMaterial.opacity = 1;
  }
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
  directionalLight.position.copy(cube.position);
  directionalLight.position.addScaledVector(sunDirection, 40);
  helper.update();

  //It makes the camera follow the cube/player
  controls.target.copy(cube.position);
  controls.update();

  renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);
