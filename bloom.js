import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import Stats from "three/addons/libs/stats.module.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
const params = {
  threshold: 0,
  strength: 1,
  radius: 0,
  exposure: 1,
};

let camera, renderer;
let mixer, composer;

init();

function init() {
  THREE.ColorManagement.enabled = true;
  renderer = new THREE.WebGLRenderer({
    antialias: true,
  });
  renderer.setSize(500, 500);
  renderer.toneMapping = THREE.ReinhardToneMapping;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  document.body.appendChild(renderer.domElement);

  const scene = new THREE.Scene();

  /// light
  let light = new THREE.DirectionalLight(0xffff00, 10);
  scene.add(light);

  /// camera
  camera = new THREE.PerspectiveCamera(45, 1, 1, 10000);
  camera.position.set(-5, 2.5, -3.5);

  /// orbit controls
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.maxPolarAngle = Math.PI * 0.5;
  controls.minDistance = 3;
  controls.maxDistance = 8;
  controls.update();

  /// model
  new GLTFLoader().load("gltf/PrimaryIonDrive.glb", function (gltf) {
    const model = gltf.scene;

    scene.add(model);

    mixer = new THREE.AnimationMixer(model);
    const clip = gltf.animations[0];
    mixer.clipAction(clip.optimize()).play();

    animate();
  });

  /// render pass
  const renderScene = new RenderPass(scene, camera);

  /// bloom pass
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.5,
    0.4,
    0.85
  );
  bloomPass.threshold = params.threshold;
  bloomPass.strength = params.strength;
  bloomPass.radius = params.radius;

  const outputPass = new OutputPass();

  composer = new EffectComposer(renderer);
  composer.addPass(renderScene);
  composer.addPass(bloomPass);
  composer.addPass(outputPass);

  /// gui
  const gui = new GUI();

  const bloomFolder = gui.addFolder("bloom");

  bloomFolder.add(params, "threshold", 0.0, 1.0).onChange(function (value) {
    bloomPass.threshold = Number(value);
  });

  bloomFolder.add(params, "strength", 0.0, 3.0).onChange(function (value) {
    bloomPass.strength = Number(value);
  });

  gui
    .add(params, "radius", 0.0, 1.0)
    .step(0.01)
    .onChange(function (value) {
      bloomPass.radius = Number(value);
    });

  const toneMappingFolder = gui.addFolder("tone mapping");

  toneMappingFolder.add(params, "exposure", 0.1, 2).onChange(function (value) {
    renderer.toneMappingExposure = Math.pow(value, 4.0);
  });
}

// window.addEventListener("resize", onWindowResize);

function animate() {
  requestAnimationFrame(animate);

  let clock = new THREE.Clock();
  const delta = clock.getDelta();

  mixer.update(delta);

  composer.render();
}

function onWindowResize() {
  const width = window.innerWidth;
  const height = window.innerHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
  composer.setSize(width, height);
}
