import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import {
  CSS3DRenderer,
  CSS3DObject,
} from "three/addons/renderers/CSS3DRenderer.js";

let camera, scene, renderer, cssRenderer;
let katamari, controls, ground;
let domElements = [];
let velocity = new THREE.Vector3();
let keys = { w: false, a: false, s: false, d: false };
let cameraOffset = new THREE.Vector3(0, 5, 10);
let followCamera = true;

init();
animate();

// Listen for DOM elements from parent window
window.addEventListener("message", function (event) {
  if (event.data.type === "INJECT_ELEMENTS") {
    const container = document.getElementById("elementContainer");

    // Clear existing elements
    domElements.forEach((obj) => {
      scene.remove(obj);
    });
    domElements = [];
    container.innerHTML = "";

    // Clone and inject the new elements
    event.data.elements.forEach((elementData) => {
      const clone = document.createElement("div");
      clone.innerHTML = elementData.html;
      clone.style.cssText = elementData.style;
      container.appendChild(clone);

      const element = clone.firstChild;
      if (element && element.offsetWidth > 0 && element.offsetHeight > 0) {
        createDOMObject(element);
      }
    });
  }
});

function createDOMObject(element) {
  // Create CSS3D object
  const object = new CSS3DObject(element);

  // Random position on the ground plane
  const radius = Math.random() * 20 + 10;
  const angle = Math.random() * Math.PI * 2;
  object.position.set(Math.cos(angle) * radius, 0.5, Math.sin(angle) * radius);
  object.rotation.x = -Math.PI / 8; // Tilt slightly for better visibility

  // Store original properties for animation
  object.userData.originalScale = 0.01;
  object.scale.set(0.01, 0.01, 0.01);

  scene.add(object);
  domElements.push(object);
}

function init() {
  // Scene setup
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87ceeb); // Sky blue background

  // Camera setup
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000,
  );
  camera.position.copy(cameraOffset);
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  // WebGL renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  document.body.appendChild(renderer.domElement);

  // CSS3D renderer for DOM elements
  cssRenderer = new CSS3DRenderer();
  cssRenderer.setSize(window.innerWidth, window.innerHeight);
  cssRenderer.domElement.style.position = "absolute";
  cssRenderer.domElement.style.top = "0";
  cssRenderer.domElement.style.pointerEvents = "none";
  document.body.appendChild(cssRenderer.domElement);

  // Controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.enabled = !followCamera;

  // Create infinite ground plane
  const groundGeometry = new THREE.PlaneGeometry(2000, 2000);
  const groundMaterial = new THREE.MeshPhongMaterial({
    color: 0x90ee90, // Light green for grass
    side: THREE.DoubleSide,
  });
  ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -1;
  ground.receiveShadow = true;
  scene.add(ground);

  // Add grid for better depth perception
  const gridHelper = new THREE.GridHelper(2000, 200, 0x000000, 0x000000);
  gridHelper.position.y = -0.99;
  gridHelper.material.opacity = 0.2;
  gridHelper.material.transparent = true;
  scene.add(gridHelper);

  // Create katamari ball
  const geometry = new THREE.SphereGeometry(1, 32, 32);
  const material = new THREE.MeshPhongMaterial({
    color: 0xb8bb26,
    wireframe: true,
    transparent: true,
    opacity: 0.7,
  });
  katamari = new THREE.Mesh(geometry, material);
  katamari.position.y = 1;
  katamari.castShadow = true;
  scene.add(katamari);

  // Add lights
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(50, 50, 50);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 500;
  directionalLight.shadow.camera.left = -100;
  directionalLight.shadow.camera.right = 100;
  directionalLight.shadow.camera.top = 100;
  directionalLight.shadow.camera.bottom = -100;
  scene.add(directionalLight);

  const ambientLight = new THREE.AmbientLight(0x404040, 2);
  scene.add(ambientLight);

  // Event listeners
  window.addEventListener("resize", onWindowResize, false);
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
  window.addEventListener("keypress", (e) => {
    if (e.key === "c") {
      followCamera = !followCamera;
      controls.enabled = !followCamera;
    }
  });

  // Signal to parent that we're ready to receive elements
  window.parent.postMessage({ type: "KATAMARI_READY" }, "*");
}

function updateCamera() {
  if (followCamera) {
    // Calculate camera distance based on katamari size
    const ballRadius = katamari.geometry.parameters.radius * katamari.scale.x;
    const minDistance = ballRadius * 4; // Minimum distance to keep ball in view
    const heightOffset = ballRadius * 2; // Height offset scales with ball size

    // Update camera offset based on ball size
    cameraOffset.set(0, heightOffset, minDistance);

    // Calculate target position (behind and above the katamari)
    const targetPosition = katamari.position.clone().add(cameraOffset);
    camera.position.lerp(targetPosition, 0.1);
    camera.lookAt(katamari.position);

    // Update camera's near and far planes based on ball size
    camera.near = ballRadius * 0.1;
    camera.far = Math.max(1000, ballRadius * 100);
    camera.updateProjectionMatrix();
  }
}

function updateKatamari() {
  // Update velocity based on keys
  const speed = 0.2;
  const forward = new THREE.Vector3();
  camera.getWorldDirection(forward);
  forward.y = 0;
  forward.normalize();
  const right = new THREE.Vector3(-forward.z, 0, forward.x);

  if (keys.w) velocity.add(forward.multiplyScalar(speed));
  if (keys.s) velocity.add(forward.multiplyScalar(-speed));
  if (keys.a) velocity.add(right.multiplyScalar(-speed));
  if (keys.d) velocity.add(right.multiplyScalar(speed));

  // Apply damping and gravity
  velocity.multiplyScalar(0.95);

  // Keep ball on the ground
  katamari.position.y = Math.max(
    katamari.geometry.parameters.radius,
    katamari.position.y,
  );

  // Update katamari position
  katamari.position.add(velocity);

  // Roll the ball based on movement
  const movement = velocity.length();
  if (movement > 0.001) {
    const rotationAxis = new THREE.Vector3(
      -velocity.z,
      0,
      velocity.x,
    ).normalize();
    katamari.rotateOnAxis(rotationAxis, movement);
  }

  // Check collisions with DOM elements
  domElements.forEach((element) => {
    if (!element.userData.collected) {
      const distance = element.position.distanceTo(katamari.position);
      if (
        distance <
        katamari.geometry.parameters.radius * katamari.scale.x * 2
      ) {
        // Attach element to katamari
        element.userData.collected = true;
        element.userData.orbitRadius =
          katamari.geometry.parameters.radius * katamari.scale.x * 1.2;
        element.userData.orbitSpeed = Math.random() * 0.02 + 0.01;
        element.userData.orbitOffset = Math.random() * Math.PI * 2;

        // Increase katamari size
        const scale = katamari.scale.x + 0.1;
        katamari.scale.set(scale, scale, scale);
      }
    } else {
      // Update collected elements' positions
      element.userData.orbitOffset += element.userData.orbitSpeed;

      element.position.x =
        katamari.position.x +
        Math.cos(element.userData.orbitOffset) * element.userData.orbitRadius;
      element.position.y =
        katamari.position.y +
        Math.sin(element.userData.orbitOffset) * element.userData.orbitRadius;
      element.position.z =
        katamari.position.z +
        Math.sin(element.userData.orbitOffset * 2) *
          element.userData.orbitRadius;

      // Make elements face outward
      element.lookAt(katamari.position);
      element.rotateY(Math.PI);
    }
  });
}

function animate() {
  requestAnimationFrame(animate);
  updateKatamari();
  updateCamera();
  controls.update();
  renderer.render(scene, camera);
  cssRenderer.render(scene, camera);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  cssRenderer.setSize(window.innerWidth, window.innerHeight);
}

function onKeyDown(event) {
  switch (event.key.toLowerCase()) {
    case "w":
      keys.w = true;
      break;
    case "a":
      keys.a = true;
      break;
    case "s":
      keys.s = true;
      break;
    case "d":
      keys.d = true;
      break;
  }
}

function onKeyUp(event) {
  switch (event.key.toLowerCase()) {
    case "w":
      keys.w = false;
      break;
    case "a":
      keys.a = false;
      break;
    case "s":
      keys.s = false;
      break;
    case "d":
      keys.d = false;
      break;
  }
}
