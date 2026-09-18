import * as THREE from 'three';

export function createSkySystem(scene, player) {
  //Sky creation
  const skyGeometry = new THREE.SphereGeometry(50, 32, 16);
  //Sky Color Paletee
  const skyPalettes = {
    midnight: {
      horizon: new THREE.Color(0x253a63),
      zenith: new THREE.Color(0x08152f),
      ambient: new THREE.Color(0x263657),
    },
    sunrise: {
      horizon: new THREE.Color(0xffb36b),
      zenith: new THREE.Color(0x7378c8),
      ambient: new THREE.Color(0xffb07c),
    },
    noon: {
      horizon: new THREE.Color(0xcfefff),
      zenith: new THREE.Color(0x2a66b7),
      ambient: new THREE.Color(0xdceeff),
    },
    sunset: {
      horizon: new THREE.Color(0xe89a72),
      zenith: new THREE.Color(0x514789),
      ambient: new THREE.Color(0xd98570),
    },
  };
  //sky shader material
  const skyMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uHorizonColor: { value: skyPalettes.midnight.horizon.clone() },
      uZenithColor: { value: skyPalettes.midnight.zenith.clone() },
      uTimeOfDay: { value: 0 },
      uGradientStart: { value: 0.1 },
      uGradientEnd: { value: 0.8 },
    },
    vertexShader: `
    
      varying vec3 vPosition;
      void main(){
    
      gl_Position = 
      projectionMatrix * 
      modelViewMatrix *
      vec4(position,1.0);
      vPosition = normalize(position);
      }
      `,
    fragmentShader: `
    
      varying vec3 vPosition;
      uniform vec3 uHorizonColor;
      uniform vec3 uZenithColor;
      uniform float uGradientStart;
      uniform float uGradientEnd;
      uniform float uTimeOfDay;
      void main(){
      vec3 up = vec3(0.0,1.0,0.0);
      float skyHeight = dot(vPosition,up);
      float gradientFactor = smoothstep(uGradientStart, uGradientEnd, skyHeight);
      vec3 finalColor = mix(uHorizonColor,uZenithColor, gradientFactor);
    
      gl_FragColor = vec4(finalColor,1.0);
      }
      `,
    side: THREE.BackSide,
  });
  const sky = new THREE.Mesh(skyGeometry, skyMaterial);
  scene.add(sky);

  //Sun creation
  const sunGeometry = new THREE.SphereGeometry(2, 64, 32);
  const sunMaterial = new THREE.MeshBasicMaterial({
    color: 0xffcc33,
    transparent: true,
  });
  const sun = new THREE.Mesh(sunGeometry, sunMaterial);
  sky.add(sun);

  //Moon creation
  const moonGeometry = new THREE.SphereGeometry(2, 64, 32);
  const moonMaterial = new THREE.MeshBasicMaterial({
    color: 0xd8e6ff,
    transparent: true,
  });
  const moon = new THREE.Mesh(moonGeometry, moonMaterial);
  sky.add(moon);

  function update(timeOfDay, cameraPosition, playerPosition) {
    sky.position.copy(cameraPosition);
  }

  return {
    sky,
    skyMaterial,
    sun,
    sunMaterial,
    moon,
    moonMaterial,
    skyPalettes,
    update,
  };
}
