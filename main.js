import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";

let camera, renderer, controls, composer;

function set_viewer(gltf_url) {
  renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector("#three_canvas"),
    antialias: true,
  });

  const scene = new THREE.Scene();
  scene.background = new THREE.Color("white");

  /// light
  let light = new THREE.DirectionalLight(0xffff00, 10);
  scene.add(light);

  /// camera
  camera = new THREE.PerspectiveCamera(45, 1, 1, 10000);
  camera.position.set(0, 0, 5);

  /// orbit controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.update();

  /// model
  new GLTFLoader().load(
    gltf_url,
    function (gltf) {
      const model = gltf.scene;

      scene.add(model);

      animate();
    },
    undefined,
    function (error) {
      console.error(error);
    }
  );

  /// render pass
  const renderScene = new RenderPass(scene, camera);

  composer = new EffectComposer(renderer);
  composer.addPass(renderScene);
}

function animate() {
  requestAnimationFrame(animate);

  // required if controls.enableDamping or controls.autoRotate are set to true
  controls.update();

  composer.render();
}

export { set_viewer };