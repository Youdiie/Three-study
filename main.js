import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";

let camera, renderer, controls, composer;

const canvas = document.getElementById("three_canvas");
const fullscreen_button = document.querySelector("#button");
const rect = canvas.getBoundingClientRect();

const originalWidth = canvas.width;
const originalHeight = canvas.height;
const originalStyle = canvas.style.cssText;

const fullscreenStyle =
  "position:fixed; top:0px; left:0px; bottom:0px; right:0px; background-size: cover;width:100vh; border:none; margin:0; padding:0; overflow:hidden; z-index:999999;";

function set_viewer(gltf_url) {
  renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
  });

  const scene = new THREE.Scene();
  scene.background = new THREE.Color("white");

  /// light
  let light = new THREE.DirectionalLight(0xffff00, 10);
  scene.add(light);

  /// camera
  camera = new THREE.PerspectiveCamera(45, 1, 1, 10000);
  camera.position.set(-2, 0, 4); // 카메라 위치 여기서 조정
  camera.zoom = 1.5;

  /// orbit controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.update();

  // resize
  onWindowResize(originalWidth, originalHeight);

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

  /// fullscreen button
  if (document.fullscreenEnabled) {
    fullscreen_button.setAttribute("id", "fullscreen-button");
    fullscreen_button.addEventListener("click", toggle_fullscreen);
    fullscreen_button.innerHTML = `
        <svg viewBox="0 0 24 24">
            <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 
            7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
        </svg>
        <svg viewBox="0 0 24 24">
            <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 
            11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>
        </svg>
    `;
    fullscreen_button.style.top = rect.top + 10 + "px";
    fullscreen_button.style.left = rect.left + originalWidth - 50 + "px";
  }

  // 전체 화면 해제 이벤트
  document.addEventListener("fullscreenchange", exitHandler);

  canvas.addEventListener("mousemove", onMouseMove);
}

function onMouseMove(event) {
  const rect = canvas.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;

  // Check if the mouse is over the canvas
  if (
    mouseX >= 0 &&
    mouseX <= canvas.width &&
    mouseY >= 0 &&
    mouseY <= canvas.height
  ) {
    // Change cursor style when hovering over the canvas
    canvas.style.cursor = "move";
  } else {
    // Restore default cursor style
    canvas.style.cursor = "auto";
  }
}

// 전체 화면 함수
function toggle_fullscreen() {
  if (!document.fullscreenElement) {
    document.body.requestFullscreen();

    // 전체 화면시 버튼 숨김
    fullscreen_button.style.display = "none";

    canvas.style = fullscreenStyle;

    // 전체 화면시 screen 크기로 canvas 조정
    onWindowResize(screen.width, screen.height);
  } else {
    canvas.style = originalStyle;
  }
}

// 전체 화면 해제 함수
function exitHandler() {
  if (
    !document.fullscreenElement &&
    !document.webkitIsFullScreen &&
    !document.mozFullScreen &&
    !document.msFullscreenElement
  ) {
    // 전체 화면 해제시 버튼 보임
    fullscreen_button.style.display = "flex";

    canvas.style = originalStyle;
    // 원래 canvas 크기로 돌아감
    onWindowResize(originalWidth, originalHeight);
  }
}

// width, height를 받아서 renderer, camera, composer 크기 조정
function onWindowResize(width, height) {
  // Update camera
  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}

function animate() {
  requestAnimationFrame(animate);

  // required if controls.enableDamping or controls.autoRotate are set to true
  controls.update();

  composer.render();
}

export { set_viewer };
