import * as THREE from 'three';

// Phase 0 game shell: renderer + camera + a placeholder spinning cube on a plane.
// This only proves the 3D engine runs. The real island arrives in a later phase.
export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.debugHandler = null;
    this.clock = new THREE.Clock();
    this.frames = 0;
    this.fpsTimer = 0;
    this.fps = 0;

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1b1033);
    this.scene.fog = new THREE.Fog(0x1b1033, 15, 45);

    this.camera = new THREE.PerspectiveCamera(60, 1, 0.1, 200);
    this.camera.position.set(4, 3, 6);
    this.camera.lookAt(0, 0.5, 0);

    this.#buildPlaceholderScene();
    this.#resize();
    window.addEventListener('resize', () => this.#resize());
  }

  #buildPlaceholderScene() {
    this.scene.add(new THREE.HemisphereLight(0xffffff, 0x3a1d6e, 1.1));
    const sun = new THREE.DirectionalLight(0xffd9a0, 1.4);
    sun.position.set(5, 8, 3);
    this.scene.add(sun);

    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(8, 48),
      new THREE.MeshStandardMaterial({ color: 0x5fb98a })
    );
    ground.rotation.x = -Math.PI / 2;
    this.scene.add(ground);

    this.cube = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshStandardMaterial({ color: 0xff6fa5 })
    );
    this.cube.position.y = 0.5;
    this.scene.add(this.cube);
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

  start() {
    this.renderer.setAnimationLoop(() => this.#tick());
  }

  stop() {
    this.renderer.setAnimationLoop(null);
  }

  #tick() {
    const dt = this.clock.getDelta();
    this.cube.rotation.y += dt;

    this.frames += 1;
    this.fpsTimer += dt;
    if (this.fpsTimer >= 0.5) {
      this.fps = Math.round(this.frames / this.fpsTimer);
      this.frames = 0;
      this.fpsTimer = 0;
      this.debugHandler?.(`FPS: ${this.fps}`);
    }

    this.renderer.render(this.scene, this.camera);
  }
}
