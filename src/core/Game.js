import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const ISLAND_URL = '/models/LoveWorld_Detailed_Compact_Island.glb.gz';

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.debugHandler = null;
    this.statusHandler = null;
    this.clock = new THREE.Clock();
    this.frames = 0;
    this.fpsTimer = 0;
    this.fps = 0;
    this.island = null;
    this.loading = false;

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x8bcfe8);

    this.camera = new THREE.PerspectiveCamera(55, 1, 0.1, 3000);
    this.camera.position.set(180, 140, 200);

    this.scene.add(new THREE.HemisphereLight(0xeaf8ff, 0x647b55, 2.0));

    const sun = new THREE.DirectionalLight(0xfff0d5, 2.2);
    sun.position.set(-120, 180, 90);
    this.scene.add(sun);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.enablePan = true;
    this.controls.minDistance = 8;
    this.controls.maxDistance = 900;
    this.controls.target.set(0, 0, 0);

    this.#resize();
    window.addEventListener('resize', () => this.#resize());
  }

  #resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  onDebug(handler) {
    this.debugHandler = handler;
  }

  onStatus(handler) {
    this.statusHandler = handler;
  }

  #status(message, ready = false) {
    this.statusHandler?.(message, ready);
  }

  async #loadIsland() {
    if (this.loading || this.island) return;
    this.loading = true;
    this.#status('Downloading island map...');

    try {
      const response = await fetch(ISLAND_URL);
      if (!response.ok) {
        throw new Error(`Island file request failed (${response.status}). Check that the .glb.gz file is in public/models/.`);
      }

      const compressed = await response.arrayBuffer();
      this.#status('Unpacking island map...');

      if (typeof DecompressionStream === 'undefined') {
        throw new Error('This browser does not support built-in GZIP decompression. Please try the latest Chrome, Edge, or Safari.');
      }

      const decompressedStream = new Blob([compressed]).stream().pipeThrough(new DecompressionStream('gzip'));
      const glbBuffer = await new Response(decompressedStream).arrayBuffer();

      this.#status('Building 3D island...');
      const loader = new GLTFLoader();

      const gltf = await new Promise((resolve, reject) => {
        loader.parse(glbBuffer, '/', resolve, reject);
      });

      this.island = gltf.scene;
      this.island.name = 'LoveWorldIsland';
      this.scene.add(this.island);

      const bounds = new THREE.Box3().setFromObject(this.island);
      if (bounds.isEmpty()) throw new Error('The island model loaded but contains no visible geometry.');

      const sphere = bounds.getBoundingSphere(new THREE.Sphere());
      const radius = Math.max(sphere.radius, 1);
      this.controls.target.copy(sphere.center);

      const direction = new THREE.Vector3(1, 0.72, 1).normalize();
      const distance = radius / Math.sin(THREE.MathUtils.degToRad(this.camera.fov * 0.5)) * 1.12;
      this.camera.position.copy(sphere.center).addScaledVector(direction, distance);
      this.camera.near = Math.max(0.1, radius / 1000);
      this.camera.far = radius * 15;
      this.camera.updateProjectionMatrix();

      this.controls.minDistance = Math.max(5, radius * 0.035);
      this.controls.maxDistance = radius * 5;
      this.controls.update();

      this.#status('Island loaded! Drag to look around and scroll/pinch to zoom.', true);
      this.debugHandler?.(`Map loaded | ${this.island.children.length} top-level objects`);
    } catch (error) {
      console.error('Island loading failed:', error);
      this.#status(`Map loading failed: ${error.message}`);
      this.debugHandler?.(`Map error: ${error.message}`);
    } finally {
      this.loading = false;
    }
  }

  start() {
    this.#status('Preparing island map...');
    this.#loadIsland();
    this.renderer.setAnimationLoop(() => this.#tick());
  }

  stop() {
    this.renderer.setAnimationLoop(null);
  }

  #tick() {
    const dt = this.clock.getDelta();
    this.controls.update();

    this.frames += 1;
    this.fpsTimer += dt;
    if (this.fpsTimer >= 0.5) {
      this.fps = Math.round(this.frames / this.fpsTimer);
      this.frames = 0;
      this.fpsTimer = 0;
      this.debugHandler?.(`FPS: ${this.fps}${this.island ? ' | Island ready' : ' | Loading island'}`);
    }

    this.renderer.render(this.scene, this.camera);
  }
}
