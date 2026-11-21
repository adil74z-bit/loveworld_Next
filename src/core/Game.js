import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.debugHandler = null;
    this.statusHandler = null;
    this.clock = new THREE.Clock();
    this.frames = 0;
    this.fpsTimer = 0;
    this.fps = 0;
    this.world = null;

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x9bd8ed);
    this.scene.fog = new THREE.Fog(0x9bd8ed, 360, 900);

    this.camera = new THREE.PerspectiveCamera(48, 1, 0.1, 2000);
    this.camera.position.set(190, 165, 230);

    this.scene.add(new THREE.HemisphereLight(0xe8fbff, 0x54724a, 2.2));
    const sun = new THREE.DirectionalLight(0xfff1d2, 2.8);
    sun.position.set(-130, 220, 100);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -180;
    sun.shadow.camera.right = 180;
    sun.shadow.camera.top = 180;
    sun.shadow.camera.bottom = -180;
    this.scene.add(sun);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.055;
    this.controls.enablePan = true;
    this.controls.minDistance = 20;
    this.controls.maxDistance = 700;
    this.controls.target.set(0, 8, 0);

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

  onDebug(handler) { this.debugHandler = handler; }
  onStatus(handler) { this.statusHandler = handler; }
  #status(message, ready = false) { this.statusHandler?.(message, ready); }

  #mat(color, roughness = 1) {
    return new THREE.MeshStandardMaterial({ color, roughness, flatShading: true });
  }

  #mesh(geometry, material, parent, position = [0, 0, 0], cast = true, receive = true) {
    const m = new THREE.Mesh(geometry, material);
    m.position.set(...position);
    m.castShadow = cast;
    m.receiveShadow = receive;
    parent.add(m);
    return m;
  }

  #box(parent, w, h, d, material, x, y, z) {
    return this.#mesh(new THREE.BoxGeometry(w, h, d), material, parent, [x, y, z]);
  }

  #cylinder(parent, rTop, rBottom, h, material, x, y, z, segments = 7) {
    return this.#mesh(new THREE.CylinderGeometry(rTop, rBottom, h, segments), material, parent, [x, y, z]);
  }

  #cone(parent, radius, height, material, x, y, z, segments = 6) {
    return this.#mesh(new THREE.ConeGeometry(radius, height, segments), material, parent, [x, y, z]);
  }

  #makeTree(parent, x, z, scale = 1, kind = 0) {
    const trunk = this.#mat(kind === 2 ? 0x806044 : 0x79523a);
    const leaves = [0x57964d, 0x75a958, 0x43834a, 0x8abf65, 0x3f7950].map(c => this.#mat(c));
    this.#cylinder(parent, 0.24 * scale, 0.38 * scale, 2.6 * scale, trunk, x, 1.3 * scale, z, 5);
    if (kind === 1) {
      for (let i = 0; i < 4; i++) this.#cone(parent, 1.7 * scale - i * 0.24 * scale, 1.65 * scale, leaves[i], x, (2.7 + i * 0.8) * scale, z, 6);
    } else if (kind === 2) {
      const crown = this.#mesh(new THREE.SphereGeometry(1.35 * scale, 6, 5), leaves[2], parent, [x, 3.1 * scale, z]);
      crown.scale.set(1.1, 1.0, 1.0);
    } else {
      for (const [dx, dy, dz, s] of [[0,3.3,0,1.1],[-0.75,2.8,0.25,0.8],[0.7,2.9,-0.2,0.85],[0,4,0.15,0.8]]) {
        const crown = this.#mesh(new THREE.DodecahedronGeometry(1.25 * scale * s, 0), leaves[Math.floor(Math.random() * leaves.length)], parent, [x + dx * scale, dy * scale, z + dz * scale]);
        crown.rotation.set(Math.random() * 0.3, Math.random() * 2, Math.random() * 0.3);
      }
    }
  }

  #flowerPatch(parent, x, z, count = 12, spread = 4) {
    const green = this.#mat(0x5d9b4d);
    const colors = [0xffe68a, 0xff8fb4, 0xffffff, 0xb6a4ff, 0xffb66d].map(c => this.#mat(c));
    for (let i = 0; i < count; i++) {
      const px = x + (Math.random() - 0.5) * spread;
      const pz = z + (Math.random() - 0.5) * spread;
      this.#cylinder(parent, 0.035, 0.035, 0.45, green, px, 0.22, pz, 4);
      this.#mesh(new THREE.IcosahedronGeometry(0.16, 0), colors[i % colors.length], parent, [px, 0.48 + Math.random() * 0.1, pz]);
    }
  }

  #path(parent, points, width, material) {
    const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(p[0], 0.22, p[1])));
    const tube = this.#mesh(new THREE.TubeGeometry(curve, Math.max(20, points.length * 8), width / 2, 5, false), material, parent, [0, 0.2, 0], false);
    tube.scale.y = 0.04;
    return tube;
  }

  #makeHouse(parent, x, z, scale, palette, angle = 0) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    group.rotation.y = angle;
    group.scale.setScalar(scale);
    parent.add(group);
    const wall = this.#mat(palette.wall);
    const trim = this.#mat(palette.trim);
    const roof = this.#mat(palette.roof);
    const floor = this.#mat(0xb89a70);
    const dark = this.#mat(0x49372b);
    const glass = this.#mat(0x9bd8ed);
    // House footprint; front is toward local -Z. The doorway is intentionally open.
    this.#box(group, 7.6, 0.25, 7, floor, 0, 0.16, 0);
    this.#box(group, 7.6, 3.7, 0.32, wall, 0, 2.0, 3.35);
    this.#box(group, 0.32, 3.7, 6.7, wall, -3.65, 2, 0);
    this.#box(group, 0.32, 3.7, 6.7, wall, 3.65, 2, 0);
    // Back wall and front wall split around a wide walk-in opening.
    this.#box(group, 7.6, 3.7, 0.32, wall, 0, 2, -3.35);
    this.#box(group, 2.3, 3.7, 0.32, wall, -2.65, 2, -3.35);
    this.#box(group, 2.3, 3.7, 0.32, wall, 2.65, 2, -3.35);
    this.#box(group, 3.0, 0.55, 0.38, trim, 0, 3.55, -3.35);
    // Low-poly pitched roof, four sloped triangular panels.
    const roofGeo = new THREE.BufferGeometry();
    roofGeo.setAttribute('position', new THREE.Float32BufferAttribute([
      -4.2,3.9,-3.9, 4.2,3.9,-3.9, 0,6.2,0,
      4.2,3.9,-3.9, 4.2,3.9,3.9, 0,6.2,0,
      4.2,3.9,3.9, -4.2,3.9,3.9, 0,6.2,0,
      -4.2,3.9,3.9, -4.2,3.9,-3.9, 0,6.2,0
    ], 3));
    roofGeo.setIndex([0,1,2,3,4,5,6,7,8,9,10,11]);
    roofGeo.computeVertexNormals();
    this.#mesh(roofGeo, roof, group, [0,0,0]);
    // Warm, furnished interior visible from the open entrance.
    this.#box(group, 2.3, 0.55, 1.25, trim, -1.25, 0.55, 0.65);
    this.#box(group, 1.3, 0.5, 1.1, dark, 1.25, 0.45, 0.8);
    this.#box(group, 1.7, 0.08, 1.2, trim, 1.25, 0.75, 0.8);
    this.#box(group, 1.1, 0.9, 0.35, dark, 0, 1.2, -2.65);
    this.#box(group, 1.3, 1.25, 0.12, glass, -2.2, 2.1, 3.16);
    this.#box(group, 1.3, 1.25, 0.12, glass, 2.2, 2.1, 3.16);
    this.#box(group, 1.3, 1.25, 0.12, glass, -2.2, 2.1, -3.16);
    this.#box(group, 1.3, 1.25, 0.12, glass, 2.2, 2.1, -3.16);
    return group;
  }

  #makeTemple(parent) {
    const temple = new THREE.Group();
    parent.add(temple);
    const stone = this.#mat(0xe7dfc8);
    const accent = this.#mat(0xf2c96e);
    const roof = this.#mat(0xc87954);
    const floor = this.#mat(0xc8b28a);
    this.#cylinder(temple, 12, 12.8, 0.6, floor, 0, 0.3, 0, 8);
    this.#cylinder(temple, 9.4, 9.4, 0.35, stone, 0, 0.75, 0, 8);
    // Pillared open temple so visitors can walk straight in.
    for (let i = 0; i < 8; i++) {
      const a = i * Math.PI / 4;
      const x = Math.cos(a) * 7.2, z = Math.sin(a) * 7.2;
      this.#cylinder(temple, 0.65, 0.8, 5.2, stone, x, 3.3, z, 6);
      this.#cylinder(temple, 0.95, 0.95, 0.35, accent, x, 5.95, z, 6);
    }
    this.#cylinder(temple, 8.8, 8.8, 0.65, roof, 0, 6.4, 0, 8);
    this.#cone(temple, 5.2, 5.8, accent, 0, 9.3, 0, 8);
    this.#cylinder(temple, 1.2, 1.4, 1.4, accent, 0, 12.3, 0, 8);
    this.#cone(temple, 1.6, 2.2, roof, 0, 14, 0, 8);
    // Interior altar and lantern.
    this.#box(temple, 2.6, 1.2, 2.2, accent, 0, 1.5, 0);
    this.#cylinder(temple, 0.4, 0.55, 2.1, accent, 0, 3.1, 0, 6);
    return temple;
  }

  #makeMountainRange(parent, centerX, centerZ, length, direction = 'x', seed = 0) {
    // Distant, modest mountain silhouettes that frame the island without hiding the village.
    const foothillMats = [0x668b5d, 0x789b68, 0x587f55, 0x87a875].map(c => this.#mat(c));
    const slopeMats = [0x718b76, 0x829783, 0x667e70, 0x98a28e].map(c => this.#mat(c));
    const rockMats = [0x858f8d, 0x9da6a1, 0x727f7d, 0xb0b5aa].map(c => this.#mat(c));
    const count = Math.max(6, Math.floor(length / 21));
    const shape = new THREE.IcosahedronGeometry(1, 1);

    for (let i = 0; i < count; i++) {
      const t = (i / (count - 1) - 0.5) * length;
      const wave = Math.sin((i + seed) * 1.7) * 5;
      const x = centerX + (direction === 'x' ? t : wave);
      const z = centerZ + (direction === 'z' ? t : wave * 0.7);
      const radius = 10 + ((i * 7 + seed * 3) % 7);
      const height = 17 + ((i * 11 + seed * 5) % 14);

      const foot = this.#mesh(shape, foothillMats[(i + seed) % foothillMats.length], parent, [x, 4, z], false);
      foot.scale.set(radius * 1.8, 7 + height * 0.25, radius * 1.25);
      foot.rotation.set(0.06 * Math.sin(i), (i * 0.31) % Math.PI, 0.05 * Math.cos(i));

      const body = this.#mesh(shape, slopeMats[(i + seed + 1) % slopeMats.length], parent, [x + wave * 0.25, height * 0.35, z - 1], true);
      body.scale.set(radius * 1.2, height * 0.7, radius * 0.95);
      body.rotation.set(0.06 * Math.cos(i), (i * 0.47) % Math.PI, 0.04 * Math.sin(i));

      const crown = this.#mesh(new THREE.DodecahedronGeometry(1, 1), rockMats[(i * 3 + seed) % rockMats.length], parent, [x + wave * 0.35, height * 0.72, z - 2], true);
      crown.scale.set(radius * 0.52, height * 0.34, radius * 0.5);
      crown.rotation.set(0.1, (i * 0.63) % Math.PI, 0.07);

      for (let side = -1; side <= 1; side += 2) {
        const shoulder = this.#mesh(shape, foothillMats[(i + side + 5) % foothillMats.length], parent,
          [x + side * radius * 0.82, 6 + height * 0.1, z + side * 2], false);
        shoulder.scale.set(radius * 0.62, height * 0.25, radius * 0.62);
        shoulder.rotation.y = (i * 0.29 + side) % Math.PI;
      }

      if (i % 3 === 0) {
        this.#makeTree(parent, x - radius * 0.7, z + radius * 0.7, 1.1, 1);
        this.#makeTree(parent, x + radius * 0.7, z + radius * 0.65, 1.0, 1);
      }
    }
  }

  #buildMountainBoundary(parent) {
    // Mountain chains surround the far edge, with winding trails and valley clearings.
    this.#makeMountainRange(parent, 0, -142, 250, 'x', 3);
    this.#makeMountainRange(parent, 0, 142, 250, 'x', 8);
    this.#makeMountainRange(parent, -145, 0, 230, 'z', 5);
    this.#makeMountainRange(parent, 145, 0, 230, 'z', 11);
    const trail = this.#mat(0xb9a987);
    this.#path(parent, [[-80,-88],[-95,-105],[-112,-118],[-122,-136],[-126,-151]], 4, trail);
    this.#path(parent, [[65,78],[86,98],[104,115],[120,132],[128,150]], 4, trail);
    this.#mesh(new THREE.CircleGeometry(10, 7), this.#mat(0x86b66d), parent, [-128,0.18,-112]).rotation.x = -Math.PI / 2;
    this.#mesh(new THREE.CircleGeometry(12, 7), this.#mat(0x86b66d), parent, [126,0.18,120]).rotation.x = -Math.PI / 2;
  }

  #buildWorld() {
    const world = new THREE.Group();
    world.name = 'LowPolyLoveVillage';
    this.scene.add(world);
    const grass = this.#mat(0x74ad61);
    const darkGrass = this.#mat(0x4f8d4e);
    const sand = this.#mat(0xe5d0a0);
    const water = this.#mat(0x39b8d3);
    const pathMat = this.#mat(0xcbb995);
    const wood = this.#mat(0x916444);
    const stone = this.#mat(0x9c9b8a);
    const bridgeMat = this.#mat(0x9c704b);

    // Ocean + layered island base.
    this.#mesh(new THREE.CircleGeometry(420, 48), water, world, [0, -3.2, 0], false).rotation.x = -Math.PI / 2;
    this.#cylinder(world, 0, 0, 1, grass, 0, 0, 0, 8);
    const islandShape = new THREE.Shape();
    const outline = [[-105,-55],[-92,-88],[-58,-104],[-18,-108],[24,-100],[62,-88],[96,-62],[110,-20],[104,24],[84,62],[52,92],[12,106],[-28,102],[-65,88],[-98,55],[-112,12]];
    islandShape.moveTo(outline[0][0], outline[0][1]);
    outline.slice(1).forEach(p => islandShape.lineTo(p[0], p[1]));
    islandShape.closePath();
    const base = this.#mesh(new THREE.ExtrudeGeometry(islandShape, { depth: 8, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 3, bevelThickness: 2 }), sand, world, [0, -9, 0], false);
    base.rotation.x = -Math.PI / 2;
    // Green top plateau and low polygon rolling hills.
    const top = this.#mesh(new THREE.ShapeGeometry(islandShape, 2), grass, world, [0, 0.1, 0], false);
    top.rotation.x = -Math.PI / 2;
    for (const [x,z,r,h,c] of [[-75,-48,22,10,0x7fb86a],[-55,62,25,12,0x6da75d],[65,55,24,10,0x7ab464],[80,-48,21,8,0x70a95f],[0,90,18,8,0x82bd6d]]) {
      this.#cone(world, r, h, this.#mat(c), x, h/2-0.3, z, 7);
    }
    // Sandy shoreline rim.
    const beach = new THREE.RingGeometry(102, 116, 48);
    this.#mesh(beach, sand, world, [0, 0.1, 0], false).rotation.x = -Math.PI / 2;

    // Main roads and branching footpaths.
    this.#path(world, [[-100,0],[-72,-18],[-48,-22],[-18,-18],[8,-12],[38,-8],[70,4],[100,20]], 8, pathMat);
    this.#path(world, [[-18,-18],[-15,-42],[-10,-62],[0,-82]], 5, pathMat);
    this.#path(world, [[8,-12],[22,14],[34,36],[55,56]], 5, pathMat);
    this.#path(world, [[-48,-22],[-60,8],[-66,36],[-50,64]], 5, pathMat);
    this.#path(world, [[-15,-42],[10,-45],[36,-48],[58,-38]], 5, pathMat);

    // Central green plaza + temple.
    this.#mesh(new THREE.CircleGeometry(23, 8), darkGrass, world, [0,0.22,0]).rotation.x = -Math.PI/2;
    this.#makeTemple(world);
    for (let i=0;i<8;i++) {
      const a=i*Math.PI/4;
      this.#cylinder(world,0.12,0.15,1.8,wood,Math.cos(a)*19,0.9,Math.sin(a)*19,5);
      this.#cone(world,0.55,0.65,this.#mat(0xffd77b),Math.cos(a)*19,2.1,Math.sin(a)*19,5);
    }
    // Village clusters: homes, gardens, shared courtyards, market stalls.
    const palettes = [
      {wall:0xffe4b9,trim:0x9a6844,roof:0xb95e4c},
      {wall:0xe6f0c8,trim:0x805c42,roof:0x7d5a9b},
      {wall:0xffd4c3,trim:0x995d49,roof:0x4e8e9b},
      {wall:0xd9edff,trim:0x6d805e,roof:0xc58b43},
      {wall:0xfff1d5,trim:0x986b48,roof:0x6c9c5a}
    ];
    const homes = [
      [-72,-55,1.05,0.4],[-52,-70,0.9,0.8],[-30,-76,0.85,0.2],[-83,-28,0.92,1.2],
      [58,-65,1.0,-0.5],[78,-42,0.9,0.3],[88,-12,0.85,1.0],[64,-20,0.9,-0.8],
      [-70,48,0.95,0.5],[-48,70,0.9,-0.3],[-25,82,0.8,0.9],[48,75,0.95,0.2],
      [68,48,0.9,-0.7],[85,22,0.85,0.5],[30,48,0.85,1.1],[-34,34,0.9,-0.6]
    ];
    homes.forEach((h,i) => {
      this.#makeHouse(world,h[0],h[1],h[2],palettes[i%palettes.length],h[3]);
      // Small private yards, fences, flower beds, wells and vegetable gardens.
      this.#flowerPatch(world,h[0]+(i%2?5:-5),h[1]+(i%3?6:-6),8,4);
      for (let j=0;j<4;j++) {
        const side=j%2===0?1:-1;
        this.#box(world,0.18,0.65,3.2,wood,h[0]+side*7,h[1]*0+0.35,h[1]+(j<2?-5:5));
      }
      this.#cylinder(world,0.55,0.65,0.9,stone,h[0]+(i%2? -6:6),0.45,h[1]+(i%3? -5:5),6);
    });

    // Busy, colorful central market with open stalls.
    for (let i=0;i<6;i++) {
      const x=-25+i*10, z=-35;
      this.#box(world,4,0.5,3,wood,x,0.6,z);
      this.#box(world,4.4,0.25,3.4,this.#mat([0xffd37c,0xff8e8e,0x92d9b1][i%3]),x,3,z);
      this.#box(world,0.18,2.7,0.18,wood,x-1.8,1.8,z-1.3);
      this.#box(world,0.18,2.7,0.18,wood,x+1.8,1.8,z-1.3);
      for(let k=0;k<3;k++) this.#mesh(new THREE.SphereGeometry(0.4,5,4), this.#mat([0xe45b54,0x72bd68,0xffd15b][k]), world, [x-1+k,1.2,z]);
    }
    // Pond, little stream, stepping stones and bridge.
    this.#mesh(new THREE.CircleGeometry(13,9),this.#mat(0x6dc9d8),world,[42,0.3,28]).rotation.x=-Math.PI/2;
    for(let i=0;i<12;i++) this.#mesh(new THREE.DodecahedronGeometry(1.2,0),stone,world,[30+i*2.2,0.5,26+Math.sin(i*0.4)*2]);
    this.#box(world,18,0.5,4,bridgeMat,42,0.8,28);
    for(let i=0;i<20;i++) {
      const x=(Math.random()-0.5)*190,z=(Math.random()-0.5)*180;
      if(Math.abs(x)<30&&Math.abs(z)<35) continue;
      this.#makeTree(world,x,z,0.8+Math.random()*0.65,Math.floor(Math.random()*3));
    }
    // Decorative details fill the island: rocks, lamps, benches, tiny garden plots.
    for(let i=0;i<45;i++) {
      const x=(Math.random()-0.5)*190,z=(Math.random()-0.5)*180;
      if(Math.abs(x)<28&&Math.abs(z)<28) continue;
      this.#mesh(new THREE.DodecahedronGeometry(0.6+Math.random()*1.1,0),stone,world,[x,0.35,z]);
    }
    for(const [x,z] of [[-90,0],[-65,-20],[-40,-20],[20,-10],[60,0],[80,20],[0,-60],[0,60],[-50,50],[50,50]]) {
      this.#cylinder(world,0.12,0.15,3,wood,x,1.5,z,5);
      this.#mesh(new THREE.BoxGeometry(0.8,0.6,0.8),this.#mat(0xffe3a0),world,[x,3.2,z]);
    }
    for(const [x,z] of [[-10,25],[15,22],[25,-20],[-28,15],[50,38],[-58,30]]) {
      this.#box(world,3,0.4,1.2,wood,x,0.7,z);
      this.#box(world,0.25,1.4,0.25,wood,x-1.2,0.1,z);
      this.#box(world,0.25,1.4,0.25,wood,x+1.2,0.1,z);
    }
    // Coastal walking trail linking the village, beach, and ocean lookout.
    this.#path(world, [[0,-55],[0,-75],[0,-92],[0,-108],[0,-124]], 4, pathMat);
    // Beach umbrellas, loungers, docks and shoreline activities.
    for(let i=0;i<10;i++) {
      const x=-85+i*18,z=-(100+Math.random()*4);
      this.#cylinder(world,0.1,0.1,4,wood,x,2,z,5);
      this.#cone(world,3,1.1,this.#mat(i%2?0xff8f98:0xffd86e),x,4.2,z,8);
      this.#box(world,2.8,0.3,1.1,this.#mat(0xf7f0df),x+4,0.35,z+2);
    }
    this.#box(world,26,0.5,5,bridgeMat,0,0.4,-112);
    // Connected open-world perimeter: distant mountain ranges beyond the village.
    this.#buildMountainBoundary(world);
    for(let i=0;i<8;i++) this.#box(world,1,0.5,5,wood,-12+i*3.4,0.75,-112);
    this.world=world;
    return world;
  }

  start() {
    this.#status('Creating your new low-poly village...');
    this.#buildWorld();
    this.controls.target.set(0,5,0);
    this.camera.position.set(205,175,235);
    this.controls.update();
    this.#status('Village map ready! Drag to explore and scroll/pinch to zoom.',true);
    this.debugHandler?.('Procedural village map | Temple plaza | 16 walk-in homes | market | gardens | beach');
    this.renderer.setAnimationLoop(() => this.#tick());
  }

  stop() { this.renderer.setAnimationLoop(null); }

  #tick() {
    const dt=this.clock.getDelta();
    this.controls.update();
    this.frames++;this.fpsTimer+=dt;
    if(this.fpsTimer>=0.5){
      this.fps=Math.round(this.frames/this.fpsTimer);this.frames=0;this.fpsTimer=0;
      this.debugHandler?.(`FPS: ${this.fps} | Village map ready`);
    }
    this.renderer.render(this.scene,this.camera);
  }
}
