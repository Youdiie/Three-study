import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const renderer = new THREE.WebGLRenderer({
  antialias: true,
});
renderer.setSize(500, 500);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
// scene.background = new THREE.Color(0x263238);
scene.background = new THREE.Color("white");

/// light
let light = new THREE.DirectionalLight(0xffff00, 10);
scene.add(light);

/// camera
const camera = new THREE.PerspectiveCamera(45, 1, 1, 10000);
camera.position.set(0, 0, 5);

/// orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.update();

/// model
const loader = new GLTFLoader();
loader.load(
  "gltf/scene.gltf",
  function (gltf) {
    scene.add(gltf.scene);
  },
  undefined,
  function (error) {
    console.error(error);
  }
);

animate();

function animate() {
  requestAnimationFrame(animate);

  // required if controls.enableDamping or controls.autoRotate are set to true
  controls.update();

  renderer.render(scene, camera);
}
