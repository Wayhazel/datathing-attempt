import * as THREE from 'three';
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls';
//import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
//import WebGL from 'three/addons/capabilities/WebGL.js';

// WebGL Compatibility Check
/*
if (WebGL.isWebGL2Available()) {
  animate();
} else {
  const warning = WebGL.getWebGL2ErrorMessage();
  document.getElementById('container').appendChild(warning);
}
*/
// Fetch sample JSON data
fetch('testData.json')
  .then(response => response.json())
  .then(data => {
    console.log('Sample JSON Data:', data);
  })
  .catch(error => {
    console.error('Error fetching or parsing JSON:', error);
  });

// Set up scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create a rotating cube
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

camera.position.z = 5;

// Create controls
const controls = new TrackballControls(camera, renderer.domElement);
controls.rotateSpeed = 1.0;
controls.zoomSpeed = 1.2;
controls.panSpeed = 0.8;

// Handle window resizing
window.addEventListener('resize', () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
});

// Load and add text geometry
const fontLoader = new FontLoader();

fontLoader.load('fonts/helvetiker_regular.typeface.json', function (font) {
  const textGeometry = new TextGeometry('Hello Three.js!', {
    font: font,
    size: 0.5,
    height: 0.1,
    curveSegments: 12,
    bevelEnabled: true,
    bevelThickness: 0.02,
    bevelSize: 0.02,
    bevelOffset: 0,
    bevelSegments: 5,
  });

  const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const textMesh = new THREE.Mesh(textGeometry, textMaterial);
  textMesh.position.set(-1, 1, 0);
  scene.add(textMesh);
});

// Load a 3D GLTF model
/*
const loader = new GLTFLoader();
loader.load(
  'path/to/model.glb',
  function (gltf) {
    scene.add(gltf.scene);
  },
  undefined,
  function (error) {
    console.error('Error loading model:', error);
  }
);
*/

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  controls.update();
  renderer.render(scene, camera);
}

animate();
