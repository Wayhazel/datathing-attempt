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

const minlon = -118.6676;
const minlat = 33.7059;
const maxlon = -118.1554;
const maxlat = 34.3343;

console.log(`127.0.0.1:6969/height/${minlat}/${maxlat}/${minlon}/${maxlon}`);

/*
fetch(`http://127.0.0.1:6969/height/${minlat}/${maxlat}/${minlon}/${maxlon}`)
  .then(response => response.json())
  .then(data => {
    console.log('Height Data:', data);
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
    opacity: 0.7 // Set the desired opacity (0.0 to 1.0)
  });
}

let moveDown = 0;

function createBoxMatrix(rows, cols) {
  const boxes = new THREE.Group();
  const boxGeometry = new THREE.BoxGeometry(1, 1, 1);

  // Set the total width of the matrix to be equal to the number of rows
  const totalWidth = rows; // Total width in units
  const totalLonDist = Math.abs(maxlon - minlon);
  const totalLatDist = (Math.abs(maxlat - minlat) / totalLonDist) * totalWidth;
  moveDown = totalLatDist - totalWidth;
  
  // Calculate individual box dimensions
  const boxWidth = totalWidth / cols; // Width of each box
  const boxDepth = totalLatDist / rows; // Depth based on latitude range
  
  // Calculate spacing based on the box dimensions
  const spacingX = boxWidth;
  const spacingZ = boxDepth;
  
  const offsetX = -(cols * spacingX) / 2;
  const offsetZ = -(rows * spacingZ) / 2;

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const box = new THREE.Mesh(boxGeometry, getBoxMaterial(i, j));
      
      // Scale each box to match its geographical dimensions
      box.scale.x = boxWidth;
      box.scale.z = boxDepth;
      
      // Position boxes with the new spacing
      box.position.x = offsetX + j * spacingX;
      box.position.z = offsetZ + i * spacingZ;

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
    box.scale.y = height * 0.001; // Adjust multiplier as needed
    box.position.y = (height * 0.001)/2;
  });
}

// Set up scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const textureLoader = new THREE.TextureLoader();
textureLoader.load(
  'api/los_angeles_map.png',
  function (texture) {
    const mapGeometry = new THREE.PlaneGeometry((rows) + 2 * rows/10, (rows + moveDown) + 1.6 * cols/10);
    const mapMaterial = new THREE.MeshBasicMaterial({
      map: texture
    });
    const mapPlane = new THREE.Mesh(mapGeometry, mapMaterial);
    
    // Rotate plane to be horizontal and position it slightly below the boxes
    mapPlane.rotation.x = -Math.PI / 2;
    mapPlane.position.set(-0.45 * rows/10, -0.01, 1.55 * cols/10);
    
    scene.add(mapPlane);
  }
);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const rows = 20;
const cols = 20;
const boxMatrix = createBoxMatrix(rows, cols);
// Set box heights:
// Calculate the lat/lon step size for each box
const latStep = (maxlat - minlat) / cols;
const lonStep = (maxlon - minlon) / rows;

// Create a 2D array to store heights
const heights = Array(rows).fill().map(() => Array(cols).fill(0));

// For each box in the grid
for (let i = 0; i < rows; i++) {
  for (let j = 0; j < cols; j++) {
    // Calculate the lat/lon bounds for this box
    const boxMinLat = minlat + (i * latStep);
    const boxMaxLat = minlat + ((i + 1) * latStep);
    const boxMinLon = minlon + (j * lonStep);
    const boxMaxLon = minlon + ((j + 1) * lonStep);
    
    // Fetch data for this specific box
    fetch(`http://127.0.0.1:6969/height/${boxMinLat}/${boxMaxLat}/${boxMinLon}/${boxMaxLon}`)
      .then(response => response.json())
      .then(boxData => {
        heights[rows-1-i][j] = boxData.data;
        // Update visualization after all data is collected
        if (i === rows - 1 && j === cols - 1) {
          updateBoxHeights(heights);
        }
      });
  }
}

boxMatrix.position.setX(0.5);
boxMatrix.position.setZ(-0.5 + moveDown);
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