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

const minlon = -118.6676
const minlat = 33.7059
const maxlon = -118.1554;
const maxlat = 34.3343;

// Fetch sample JSON data
/*
fetch('testData.json')
  .then(response => response.json())
  .then(data => {
    console.log('Sample JSON Data:', data);
  })
  .catch(error => {
    console.error('Error fetching or parsing JSON:', error);
  });
*/

function getBoxMaterial(row, col) {
  const color = (row + col) % 2 === 0 ? 0x00ff00 : 0x00f500;
  return new THREE.MeshPhongMaterial({ 
    color: color, 
    transparent: true, // Enable transparency
    opacity: 0.5 // Set the desired opacity (0.0 to 1.0)
  });
}

function createBoxMatrix(rows, cols) {
  const boxes = new THREE.Group(); // Create a group to hold all boxes
  const boxGeometry = new THREE.BoxGeometry(1, 1, 1); // Base geometry
  const boxMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00 }); // Using PhongMaterial for better lighting

  // Calculate spacing between boxes
  const spacing = 1;
  const offsetX = -(cols * spacing) / 2;
  const offsetZ = -(rows * spacing) / 2;

  // Create boxes in a grid
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const box = new THREE.Mesh(boxGeometry, getBoxMaterial(i, j));
      box.position.x = offsetX + j * spacing;
      box.position.z = offsetZ + i * spacing;

      // Store the box's index for later reference
      box.userData.row = i;
      box.userData.col = j;

      boxes.add(box);
    }
  }

  return boxes;
}

function updateBoxHeights(data) {
  boxMatrix.children.forEach((box, index) => {
    const row = box.userData.row;
    const col = box.userData.col;
    // Assuming data contains height values between 0 and 1
    const height = data[row]?.[col] || 0;
    box.scale.y = height * 0.1; // Adjust multiplier as needed
    box.position.y = (height * 0.1); // Center the box vertically
  });
}

// Set up scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const rows = 40;
const cols = 40;
const boxMatrix = createBoxMatrix(rows, cols);
boxMatrix.position.setX(0.5);
boxMatrix.position.setZ(0.5);
boxMatrix.position.setY(0.5);
scene.add(boxMatrix);

const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

const gridaxes = new THREE.Group();

const gridHelper = new THREE.GridHelper(rows, cols);

scene.add(gridHelper)

const axesHelper = new THREE.AxesHelper(40);

gridaxes.add(axesHelper);

camera.position.z = 50;

// Create controls
const controls = new TrackballControls(camera, renderer.domElement);
controls.rotateSpeed = 5;
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
  const lonGeometry = new TextGeometry("Longitude", {
      font: font,
      size: 2,
      height: 0.1,
      depth: 0.1,
      curveSegments: 12,
      bevelEnabled: false,
    });

    const latGeometry = new TextGeometry("Latitude", {
      font: font,
      size: 2,
      height: 0.1,
      depth: 0.1,
      curveSegments: 12,
      bevelEnabled: false,
    });

    const crmGeometry = new TextGeometry("Crimes", {
      font: font,
      size: 2,
      height: 0.1,
      depth: 0.1,
      curveSegments: 12,
      bevelEnabled: false,
    });

    const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const lonMesh = new THREE.Mesh(lonGeometry, textMaterial);
    lonMesh.position.set(rows/2, 5, 0);
    gridaxes.add(lonMesh);

    const latMesh = new THREE.Mesh(latGeometry, textMaterial);
    latMesh.position.set(-10, 5, cols/2);
    gridaxes.add(latMesh);

    const crmMesh = new THREE.Mesh(crmGeometry, textMaterial);
    crmMesh.position.set(0, 10, -0);
    gridaxes.add(crmMesh);
  });

gridaxes.position.set(-rows/2, 0, -cols/2);

scene.add(gridaxes);

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();