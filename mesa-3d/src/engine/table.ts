import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import "@babylonjs/core/Cameras/Inputs/arcRotateCameraPointersInput";
import "@babylonjs/core/Cameras/Inputs/arcRotateCameraMouseWheelInput";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { CubeTexture } from "@babylonjs/core/Materials/Textures/cubeTexture";
import { GlowLayer } from "@babylonjs/core/Layers/glowLayer";
import { DefaultRenderingPipeline } from "@babylonjs/core/PostProcesses/RenderPipeline/Pipelines/defaultRenderingPipeline";
import { SSAO2RenderingPipeline } from "@babylonjs/core/PostProcesses/RenderPipeline/Pipelines/ssao2RenderingPipeline";
import { FxaaPostProcess } from "@babylonjs/core/PostProcesses/fxaaPostProcess";
import "@babylonjs/core/PostProcesses/RenderPipeline/postProcessRenderPipelineManagerSceneComponent";
import { CreateTube } from "@babylonjs/core/Meshes/Builders/tubeBuilder";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import { readingPoint } from "../interaction/readingPlane";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { DirectionalLight } from "@babylonjs/core/Lights/directionalLight";
import { PointLight } from "@babylonjs/core/Lights/pointLight";
import { SpotLight } from "@babylonjs/core/Lights/spotLight";
import { Light } from "@babylonjs/core/Lights/light";
import { CreateLathe } from "@babylonjs/core/Meshes/Builders/latheBuilder";
import { Mesh as MeshClass } from "@babylonjs/core/Meshes/mesh";
import { PBRMaterial } from "@babylonjs/core/Materials/PBR/pbrMaterial";
import { ShadowGenerator } from "@babylonjs/core/Lights/Shadows/shadowGenerator";
import "@babylonjs/core/Lights/Shadows/shadowGeneratorSceneComponent";
import { CreateBox } from "@babylonjs/core/Meshes/Builders/boxBuilder";
import { CreateGround } from "@babylonjs/core/Meshes/Builders/groundBuilder";
import { CreateCylinder } from "@babylonjs/core/Meshes/Builders/cylinderBuilder";
import { CreateSphere } from "@babylonjs/core/Meshes/Builders/sphereBuilder";
import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import type { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import {
  material,
  wood,
  cloth,
  cardBack,
  painted,
  metal,
  assetUrl,
  gilt,
  pageEdges,
  cardBody,
  leather,
  finish,
} from "../scene/materials";
import { roundedBox, outline, ring, roundedPlane, roundedSlab } from "../scene/geometry";
import type { MultiMaterial } from "@babylonjs/core/Materials/multiMaterial";
import { atmosphere } from "../scene/atmosphere";
import { FramePacer } from "./framePacer";
import { CardMotion } from "../cards/motion";
import { createCardFront } from "../cards/material";
import {
  type Session,
  type Card,
  type Note,
  type Quality,
  type CameraState,
  clampPosition,
  DEFAULT_CAMERA,
} from "../session/model";

export type TableCallbacks = {
  select: (id?: string, inspect?: boolean) => void;
  move: (id: string, position: { x: number; z: number }) => void;
  returnCard: (id: string) => void;
  draw: (position?: { x: number; z: number }) => void;
  camera: (c: CameraState) => void;
  message: (m: string) => void;
  context: (lost: boolean) => void;
};
/** Corner radius of every card, deck and discard pile (about 6% of the card width). */
const CARD_RADIUS = 0.1;
// Inertia keeps nudging the camera by imperceptible amounts for many frames. Comparing at 1e-4
// precision stops those from counting as changes, so the scene can go idle and saves can settle.
const cameraKey = (c: CameraState) =>
  [c.alpha, c.beta, c.radius, c.x, c.z].map((v) => Math.round(v * 1e4)).join(",");
export class Table {
  engine: Engine;
  scene: Scene;
  camera: ArcRotateCamera;
  private objects = new Map<
    string,
    {
      mesh: Mesh;
      signature: string;
      noteMat?: StandardMaterial;
      contact?: Mesh;
    }
  >();
  private fronts = new Map<string, StandardMaterial>();
  private quality: Quality = "low";
  private frontLoads: Promise<void>[] = [];
  private motion = new CardMotion(() => this.reducedMotion);
  private pendingArrival?: Vector3;
  private jumperArrival = false;
  prepareJumper() { this.jumperArrival = true; }
  private exits = new Map<string, Mesh>();
  private glow: GlowLayer;
  private pipeline?: DefaultRenderingPipeline;
  private ssao?: SSAO2RenderingPipeline;
  private lowFxaa?: FxaaPostProcess;
  private flames: { outer: Mesh; core: Mesh; baseY: number; seed: number }[] = [];
  private armillary?: Mesh;
  private lastAmbient = 0;
  private deckDrag?: {
    pointerId: number;
    mesh: Mesh;
    offset: Vector3;
    screenX: number;
    screenY: number;
    moved: boolean;
  };
  private reducedMotion = matchMedia("(prefers-reduced-motion: reduce)")
    .matches;
  private back: StandardMaterial;
  private paper: StandardMaterial;
  private cardMaterial: MultiMaterial;
  private notePaper: StandardMaterial;
  private noteMaterial!: MultiMaterial;
  private noteTemplate!: Mesh;
  private noteFaceTemplate!: Mesh;
  private selectionMat: StandardMaterial;
  private cardTemplate: Mesh;
  private faceTemplate: Mesh;
  private contactTemplate: Mesh;
  private ring: Mesh;
  private deck: Mesh;
  private shadow: ShadowGenerator;
  private lamp: PointLight;
  private session?: Session;
  private selected?: string;
  private frames = 2;
  private lastCamera = "";
  private visualTarget = 1;
  private lastVisualFrameReady = false;
  private readyWaiters: { target: number; resolve: () => void }[] = [];
  private resizeObserver: ResizeObserver;
  private drag?: {
    id: string;
    pointerId: number;
    start: { x: number; z: number };
    offset: Vector3;
    moved: boolean;
    screenX: number;
    screenY: number;
  };
  private pointers = new Set<number>();
  private disposed = false;
  private hidden = false;
  private lastDrawCalls = 0;
  private pacer: FramePacer;
  private discardedTop: Mesh;
  private samples: number[] = [];
  private renderCount = 0;
  private idleSkips = 0;
  private listeners: (() => void)[] = [];
  constructor(
    private canvas: HTMLCanvasElement,
    private callbacks: TableCallbacks,
    quality: Quality,
  ) {
    this.engine = new Engine(
      canvas,
      true,
      {
        stencil: true,
        preserveDrawingBuffer: false,
        powerPreference: "high-performance",
      },
      false,
    );
    this.pacer = new FramePacer(this.engine);
    this.scene = new Scene(this.engine);
    this.scene.clearColor = new Color4(0.025, 0.018, 0.04, 0);
    this.scene.environmentTexture = CubeTexture.CreateFromPrefilteredData(
      assetUrl("environments/observatory.env"),
      this.scene,
    );
    this.scene.environmentIntensity = 0.3;
    this.scene.fogMode = Scene.FOGMODE_EXP2;
    this.scene.fogDensity = 0.012;
    this.scene.fogColor = new Color3(0.03, 0.022, 0.045);
    this.glow = new GlowLayer("Luz das velas", this.scene, {
      blurKernelSize: 32,
      mainTextureRatio: 0.35,
    });
    this.glow.intensity = 0.7;
    this.scene.skipPointerMovePicking = true;
    this.camera = new ArcRotateCamera(
      "Observatório",
      DEFAULT_CAMERA.alpha,
      DEFAULT_CAMERA.beta,
      DEFAULT_CAMERA.radius,
      Vector3.Zero(),
      this.scene,
    );
    this.camera.lowerBetaLimit = 0.08;
    this.camera.upperBetaLimit = 1.2;
    this.camera.lowerRadiusLimit = 9;
    this.camera.upperRadiusLimit = 42;
    this.camera.minZ = 0.1;
    this.camera.wheelDeltaPercentage = 0.015;
    this.camera.pinchDeltaPercentage = 0.005;
    this.camera.panningSensibility = 110;
    this.camera.inertia = 0.65;
    this.camera.useNaturalPinchZoom = true;
    this.camera.inputs.removeByType("ArcRotateCameraKeyboardMoveInput");
    this.attachCamera();
    const fill = new HemisphericLight(
      "Luz noturna",
      new Vector3(0, 1, 0),
      this.scene,
    );
    // Faint cold moonlight in the shadows; the warm light comes from the candles and the pool.
    fill.intensity = 0.12;
    fill.diffuse = new Color3(0.55, 0.64, 1);
    fill.groundColor = new Color3(0.05, 0.03, 0.07);
    const key = new DirectionalLight(
      "Luz dourada",
      new Vector3(0.62, -1, 0.5),
      this.scene,
    );
    // A lower, warmer key light so cards and props cast readable shadows on the cloth.
    key.position = new Vector3(-12, 17, -10);
    key.intensity = 1.05;
    key.diffuse = new Color3(1, 0.8, 0.58);
    key.shadowMinZ = 1;
    key.shadowMaxZ = 50;
    key.shadowFrustumSize = 34;
    this.shadow = new ShadowGenerator(1024, key);
    this.shadow.usePercentageCloserFiltering = true;
    this.shadow.filteringQuality = ShadowGenerator.QUALITY_MEDIUM;
    this.shadow.bias = 0.0004;
    this.shadow.normalBias = 0.015;
    this.shadow.darkness = 0.2;
    // A soft pool of reading light over the centre of the cloth, falling off towards the rim.
    const pool = new SpotLight(
      "Luz de leitura",
      new Vector3(0, 13, 1.2),
      new Vector3(0, -1, -0.09),
      0.92,
      7,
      this.scene,
    );
    pool.falloffType = Light.FALLOFF_STANDARD;
    pool.range = 30;
    pool.intensity = 1.55;
    pool.diffuse = new Color3(1, 0.86, 0.68);
    pool.specular = new Color3(0.3, 0.27, 0.22);
    this.paper = material(this.scene, "Papel marfim", "#ded1b4", 0.09);
    this.notePaper = material(this.scene, "Papel das notas", "#c6b38d");
    const table = roundedBox("Mesa de nogueira", 23, 17, 0.7, 0.7, this.scene);
    table.position.y = -0.46;
    table.material = wood(this.scene);
    table.isPickable = false;
    table.receiveShadows = true;
    this.shadow.addShadowCaster(table);
    const fabric = roundedBox(
      "Veludo e bordado celeste",
      20,
      13.5,
      0.035,
      0.32,
      this.scene,
    );
    fabric.position.y = -0.077;
    fabric.material = cloth(this.scene);
    fabric.receiveShadows = true;
    fabric.isPickable = false;
    const brass = metal(this.scene, "Latão envelhecido", "#b39455", 0.34);
    for (const inset of [0, 0.12]) {
      const points = outline(22.5 - inset, 16.5 - inset, 0.58, -0.098);
      points.push(points[0]);
      const inlay = CreateTube(
        "Marchetaria dourada",
        { path: points, radius: 0.018, tessellation: 6 },
        this.scene,
      );
      inlay.material = brass;
      inlay.isPickable = false;
    }
    const wax = finish(new PBRMaterial("Cera de abelha", this.scene));
    wax.albedoColor = Color3.FromHexString("#dcc092");
    wax.metallic = 0;
    wax.roughness = 0.5;
    // Light scattering through the wax makes the candles glow softly near the flame.
    wax.subSurface.isTranslucencyEnabled = true;
    wax.subSurface.translucencyIntensity = 0.35;
    wax.subSurface.tintColor = new Color3(0.95, 0.66, 0.36);
    const char = material(this.scene, "Carvão", "#2a201a");
    const fireOuter = material(this.scene, "Chama de âmbar", "#ffdaa0");
    fireOuter.disableLighting = true;
    fireOuter.emissiveColor = new Color3(2.5, 0.78, 0.12);
    fireOuter.alpha = 0.86;
    const fireCore = material(this.scene, "Coração da chama", "#fff4d8");
    fireCore.disableLighting = true;
    fireCore.emissiveColor = new Color3(3, 2.15, 1.05);
    // Turned brass candlestick: foot, mouldings, stem and a drip pan, revolved from one profile.
    const stickProfile = [
      [0, -0.06], [0.5, -0.06], [0.51, -0.035], [0.47, -0.005], [0.38, 0.02], [0.31, 0.05],
      [0.17, 0.08], [0.13, 0.11], [0.17, 0.14], [0.12, 0.17], [0.095, 0.22], [0.09, 0.31],
      [0.13, 0.34], [0.11, 0.37], [0.29, 0.395], [0.34, 0.425], [0.31, 0.445], [0.25, 0.44], [0, 0.44],
    ].map(([x, y]) => new Vector3(x, y, 0));
    const flameProfile = [
      [0, 0], [0.034, 0.02], [0.058, 0.07], [0.062, 0.12], [0.048, 0.2], [0.024, 0.29], [0, 0.37],
    ].map(([x, y]) => new Vector3(x, y, 0));
    for (const [i, height] of [1.5, 2.15, 0.95].entries()) {
      const x = -10 + (i === 1 ? -0.15 : i === 2 ? 0.6 : 0),
        z = 4.4 + (i === 1 ? 1.25 : i === 2 ? 0.6 : 0);
      const stick = CreateLathe("Castiçal torneado", { shape: stickProfile, tessellation: 48, cap: MeshClass.NO_CAP }, this.scene);
      stick.position.set(x, 0, z);
      stick.material = brass;
      stick.isPickable = false;
      stick.receiveShadows = true;
      this.shadow.addShadowCaster(stick);
      // Candle with a softened, melted rim and a shallow pool around the wick.
      const candleProfile = [
        [0, 0], [0.24, 0], [0.246, height * 0.45], [0.238, height - 0.05], [0.222, height - 0.012],
        [0.19, height - 0.006], [0.15, height - 0.022], [0.05, height - 0.036], [0, height - 0.036],
      ].map(([px, py]) => new Vector3(px, py, 0));
      const body = CreateLathe("Vela de cera", { shape: candleProfile, tessellation: 40 }, this.scene);
      const drips: Mesh[] = [];
      for (let d = 0; d < 4; d++) {
        const angle = (d * 2.1 + i * 1.3) % (Math.PI * 2),
          length = 0.12 + ((d * 37 + i * 11) % 9) * 0.03;
        const drip = CreateSphere("Escorrido", { diameter: 0.075, segments: 10 }, this.scene);
        drip.scaling.set(1, length / 0.075, 0.8);
        drip.position.set(Math.cos(angle) * 0.236, height - 0.02 - length / 2, Math.sin(angle) * 0.236);
        drip.rotation.y = -angle;
        drips.push(drip);
      }
      const candle = MeshClass.MergeMeshes([body, ...drips], true, true)!;
      candle.name = "Vela de cera";
      candle.position.set(x, 0.44, z);
      candle.material = wax;
      candle.isPickable = false;
      candle.receiveShadows = true;
      this.shadow.addShadowCaster(candle);
      const wick = CreateCylinder("Pavio", { diameter: 0.032, height: 0.15, tessellation: 8 }, this.scene);
      wick.position.set(x, 0.44 + height + 0.035, z);
      wick.rotation.z = 0.12;
      wick.material = char;
      wick.isPickable = false;
      const outer = CreateLathe("Chama", { shape: flameProfile, tessellation: 24 }, this.scene);
      outer.material = fireOuter;
      outer.isPickable = false;
      const core = CreateLathe("Coração da chama", { shape: flameProfile, tessellation: 16 }, this.scene);
      core.parent = outer;
      core.scaling.set(0.48, 0.55, 0.48);
      core.position.y = 0.012;
      core.material = fireCore;
      core.isPickable = false;
      const baseY = 0.44 + height + 0.07;
      outer.position.set(x, baseY, z);
      outer.scaling.setAll(1.15);
      this.glow.addIncludedOnlyMesh(outer);
      this.glow.addIncludedOnlyMesh(core);
      this.flames.push({ outer, core, baseY, seed: i * 17.3 + 4.1 });
    }
    this.lamp = new PointLight(
      "Luz das velas",
      new Vector3(-9.3, 2.35, 4.2),
      this.scene,
    );
    // Candle light: a strong warm source that reaches across the left of the table and fades out.
    this.lamp.falloffType = Light.FALLOFF_STANDARD;
    this.lamp.diffuse = new Color3(1, 0.5, 0.18);
    this.lamp.specular = new Color3(0.9, 0.5, 0.2);
    this.lamp.intensity = 3.1;
    this.lamp.range = 15;
    const box = roundedBox("Caixa de couro", 2.2, 3.65, 0.7, 0.14, this.scene);
    box.position.set(9.7, 0.3, 4.7);
    box.rotation.y = -0.15;
    box.material = leather(this.scene, "Couro obsidiana", "#1b1720", 2.2, 3.65);
    box.isPickable = false;
    this.shadow.addShadowCaster(box);
    const boxLabel = CreateGround(
      "Gravação da caixa",
      { width: 1.8, height: 3.15 },
      this.scene,
    );
    boxLabel.parent = box;
    boxLabel.position.y = 0.357;
    boxLabel.material = cardBack(this.scene);
    boxLabel.isPickable = false;
    const armillary = new MeshClass("Esfera armilar", this.scene);
    armillary.position.set(10, 0.95, -4.9);
    armillary.rotation.z = 0.41; // The axis leans like the Earth's.
    for (const [i, [d, t]] of [[1.42, 0.04], [1.36, 0.032], [1.36, 0.032], [1.36, 0.032], [1.1, 0.026]].entries()) {
      const orbit = ring("Anel da esfera armilar", d, t, this.scene, 64);
      orbit.parent = armillary;
      orbit.rotation.set(i === 0 ? 0 : i === 4 ? Math.PI / 2 : Math.PI / 2, i === 1 ? 0 : i === 2 ? Math.PI / 3 : i === 3 ? -Math.PI / 3 : 0, i === 4 ? 0.41 : 0);
      orbit.material = brass;
      orbit.isPickable = false;
      this.shadow.addShadowCaster(orbit);
    }
    const axis = CreateCylinder("Eixo da esfera", { diameter: 0.035, height: 1.7, tessellation: 10 }, this.scene);
    axis.parent = armillary;
    axis.material = brass;
    axis.isPickable = false;
    const globe = CreateSphere("Globo central", { diameter: 0.32, segments: 24 }, this.scene);
    globe.parent = armillary;
    globe.material = metal(this.scene, "Globo de lápis-lazúli", "#24406e", 0.28);
    globe.isPickable = false;
    this.armillary = armillary;
    const pedestal = CreateCylinder(
      "Pé da esfera",
      { diameter: 1.1, height: 0.14, tessellation: 40 },
      this.scene,
    );
    pedestal.position.set(10, 0, -4.9);
    pedestal.material = brass;
    pedestal.isPickable = false;
    const stem = CreateCylinder(
      "Haste da esfera",
      { diameter: 0.08, height: 0.62, tessellation: 12 },
      this.scene,
    );
    stem.position.set(10, 0.33, -4.9);
    stem.material = brass;
    stem.isPickable = false;
    const crystalMat = finish(new PBRMaterial("Quartzo azul", this.scene));
    crystalMat.albedoColor = Color3.FromHexString("#7fb2cc");
    crystalMat.metallic = 0;
    crystalMat.roughness = 0.08;
    crystalMat.alpha = 0.78;
    crystalMat.indexOfRefraction = 1.54;
    crystalMat.emissiveColor = new Color3(0.02, 0.06, 0.1);
    crystalMat.backFaceCulling = false;
    crystalMat.enableSpecularAntiAliasing = true;
    // Hexagonal prism with a six-sided pyramid tip, revolved from a sharp profile.
    const crystalProfile = (h: number, r: number) =>
      [[0, 0], [r, 0], [r, h * 0.72], [r * 0.06, h], [0, h]].map(([px, py]) => new Vector3(px, py, 0));
    const cluster: [number, number, number, number, number][] = [
      // x, z, height, radius, lean
      [9.75, -2.6, 1.15, 0.2, 0.05], [10.15, -2.35, 0.8, 0.15, 0.42], [9.45, -2.35, 0.7, 0.14, -0.48],
      [9.95, -2.95, 0.55, 0.12, 0.3], [9.55, -2.85, 0.42, 0.1, -0.25],
    ];
    for (const [cx, cz, h, r, lean] of cluster) {
      const crystal = CreateLathe("Cristal de quartzo", { shape: crystalProfile(h, r), tessellation: 6 }, this.scene);
      crystal.convertToFlatShadedMesh();
      crystal.position.set(cx, -0.06, cz);
      crystal.rotation.set(lean * 0.5, lean * 3, lean);
      crystal.material = crystalMat;
      crystal.isPickable = false;
      this.shadow.addShadowCaster(crystal);
    }
    atmosphere(this.scene);
    this.back = cardBack(this.scene);
    // Printed cards: 1.72 × 3 with corners rounded like a real deck, a paper core and gilded edges.
    const edgeGilt = gilt(this.scene);
    this.cardMaterial = cardBody(this.scene, this.paper, edgeGilt);
    this.cardTemplate = roundedSlab(
      "Geometria compartilhada das cartas",
      1.72,
      3,
      0.035,
      CARD_RADIUS,
      this.scene,
    );
    this.cardTemplate.setEnabled(false);
    this.faceTemplate = roundedPlane(
      "Geometria compartilhada das artes",
      1.69,
      2.97,
      CARD_RADIUS - 0.015,
      this.scene,
    );
    this.faceTemplate.setEnabled(false);
    const ink = material(this.scene, "Borda tingida das notas", "#6d5634", 0.05);
    this.noteMaterial = cardBody(this.scene, this.notePaper, ink, "Nota de pergaminho");
    this.noteTemplate = roundedSlab("Geometria das notas", 2.4, 1.05, 0.035, 0.08, this.scene);
    this.noteTemplate.setEnabled(false);
    this.noteFaceTemplate = roundedPlane("Geometria do texto das notas", 2.35, 1, 0.065, this.scene);
    this.noteFaceTemplate.setEnabled(false);
    const contactMat = material(this.scene, "Sombra de contato", "#ffffff", 0);
    contactMat.disableLighting = true;
    contactMat.emissiveColor = Color3.White();
    contactMat.fogEnabled = false;
    contactMat.diffuseTexture = painted(
      this.scene,
      "Contato suave",
      128,
      256,
      (c) => {
        // Two layers: a tight dark core under the card and a wide soft penumbra.
        c.clearRect(0, 0, 128, 256);
        c.filter = "blur(12px)";
        c.fillStyle = "#00000059";
        c.beginPath();
        c.roundRect(12, 16, 104, 224, 10);
        c.fill();
        c.filter = "blur(5px)";
        c.fillStyle = "#0000008c";
        c.beginPath();
        c.roundRect(20, 24, 88, 208, 8);
        c.fill();
      },
    );
    contactMat.diffuseTexture.hasAlpha = true;
    contactMat.useAlphaFromDiffuseTexture = true;
    this.contactTemplate = CreateGround(
      "Geometria da sombra",
      { width: 2, height: 3.3 },
      this.scene,
    );
    this.contactTemplate.material = contactMat;
    this.contactTemplate.isPickable = false;
    this.contactTemplate.setEnabled(false);
    this.deck = roundedSlab(
      "Monte · puxar carta",
      1.72,
      3,
      0.28,
      CARD_RADIUS,
      this.scene,
    );
    this.deck.position.set(-8, 0.12, -4.4);
    this.deck.material = cardBody(this.scene, this.paper, pageEdges(this.scene), "Monte de papel e ouro");
    this.deck.metadata = { deck: true };
    this.deck.receiveShadows = true;
    this.shadow.addShadowCaster(this.deck);
    const top = this.faceTemplate.clone("Verso do monte", this.deck, true);
    top.setEnabled(true);
    top.position.y = 0.1415;
    top.material = this.back;
    top.metadata = { deck: true };
    const tray = roundedBox(
      "Bandeja dos descartes",
      2.15,
      3.5,
      0.04,
      0.14,
      this.scene,
    );
    tray.position.set(8, -0.032, -4.4);
    tray.material = leather(this.scene, "Couro da bandeja", "#241c1d", 2.15, 3.5);
    tray.isPickable = false;
    const trayEdge = outline(2, 3.35, 0.12, 0.0);
    trayEdge.push(trayEdge[0]);
    const trim = CreateTube(
      "Friso do descarte",
      { path: trayEdge, radius: 0.012, tessellation: 6 },
      this.scene,
    );
    trim.position.set(8, 0, -4.4);
    trim.material = brass;
    trim.isPickable = false;
    this.discardedTop = roundedSlab(
      "Pilha de descartes",
      1.72,
      3,
      0.04,
      CARD_RADIUS,
      this.scene,
    );
    this.discardedTop.position.set(8, 0.02, -4.4);
    this.discardedTop.material = this.cardMaterial;
    this.discardedTop.isPickable = false;
    this.discardedTop.setEnabled(false);
    const discardedFace = this.faceTemplate.clone(
      "Verso dos descartes",
      this.discardedTop,
      true,
    );
    discardedFace.setEnabled(true);
    discardedFace.position.y = 0.023;
    discardedFace.material = this.back;
    discardedFace.isPickable = false;
    this.selectionMat = material(this.scene, "Contorno dourado", "#dec080");
    this.selectionMat.emissiveColor = Color3.FromHexString("#9a773c");
    const halo = outline(1.94, 3.28, 0.1);
    halo.push(halo[0]);
    this.ring = CreateTube(
      "Seleção",
      { path: halo, radius: 0.012, tessellation: 6 },
      this.scene,
    );
    this.ring.material = this.selectionMat;
    this.ring.isPickable = false;
    this.ring.setEnabled(false);
    this.bindInteractions();
    this.resizeObserver = new ResizeObserver(() => {
      this.engine.resize();
      this.invalidate();
      this.wake();
    });
    this.resizeObserver.observe(canvas);
    this.listen(document, "visibilitychange", () => {
      this.hidden = document.hidden;
      this.wake();
    });
    this.listen(canvas, "webglcontextlost", (event: Event) => {
      event.preventDefault();
      this.cancelDrag();
      this.pacer.reset(true);
      this.lastVisualFrameReady = false;
      this.invalidate();
      this.callbacks.context(true);
    });
    this.engine.onContextRestoredObservable.add(() => {
      this.invalidate();
      this.callbacks.context(false);
      this.wake(8);
    });
    this.setQuality(quality);
    this.scene.executeWhenReady(() => this.wake());
    this.engine.runRenderLoop(() => {
      if (this.hidden || this.disposed) return;
      if (!this.pacer.ready()) return;
      if (this.lastVisualFrameReady && this.renderCount >= this.visualTarget) {
        this.canvas.dataset.render = "ready";
        this.readyWaiters = this.readyWaiters.filter((waiter) => {
          if (this.renderCount >= waiter.target) {
            waiter.resolve();
            return false;
          }
          return true;
        });
      }
      if (this.frames <= 0) {
        const now = performance.now();
        if (!this.ambientEnabled() || now - this.lastAmbient < 50) {
          this.idleSkips++;
          return;
        }
        this.lastAmbient = now;
      }
      const start = performance.now();
      const t = this.camera.target;
      t.x = Math.max(-6, Math.min(6, t.x));
      t.z = Math.max(-4, Math.min(4, t.z));
      t.y = 0;
      let shuffling = false;
      if (this.shuffleStarted) {
        const progress = Math.min(1, (start - this.shuffleStarted) / 980);
        shuffling = progress < 1;
        this.animateRiffle(progress);
        if (!shuffling) {
          this.shuffleStarted = 0;
          this.endRiffle();
        }
      }
      const moving = this.motion.update(start) || shuffling;
      if (moving) this.frames = Math.max(this.frames, 2);
      const motionState = moving ? "active" : "idle";
      if (this.canvas.dataset.motion !== motionState)
        this.canvas.dataset.motion = motionState;
      for (const item of this.objects.values())
        if (item.contact) {
          // Offset along the key light so the card reads as resting on the cloth.
          const lift = Math.max(0, item.mesh.position.y);
          item.contact.position.set(
            item.mesh.position.x + 0.07 + lift * 0.45,
            -0.045,
            item.mesh.position.z + 0.055 + lift * 0.36,
          );
          item.contact.rotation.y = item.mesh.rotation.y;
          item.contact.visibility =
            0.8 / (1 + Math.max(0, item.mesh.position.y) * 2);
        }
      this.animateAmbient(start);
      const chosen = this.selected
        ? this.objects.get(this.selected)?.mesh
        : undefined;
      if (chosen) this.updateRing(chosen);
      const callsBefore = this.engine._drawCalls.current;
      this.scene.render();
      this.lastVisualFrameReady =
        this.scene.isReady() &&
        (!this.glow.isEnabled || this.glow.isLayerReady());
      if (!this.lastVisualFrameReady) this.frames = Math.max(this.frames, 3);
      this.pacer.submitted();
      this.lastDrawCalls = this.engine._drawCalls.current - callsBefore;
      this.renderCount++;
      this.frames = Math.max(0, this.frames - 1);
      const camera = this.getCamera(),
        key = cameraKey(camera);
      if (key !== this.lastCamera) {
        this.lastCamera = key;
        this.callbacks.camera(camera);
        this.frames = Math.max(this.frames, 2);
      }
      this.samples.push(performance.now() - start);
      if (this.samples.length > 600) this.samples.shift();
    });
  }
  private listen(
    target: EventTarget,
    name: string,
    fn: EventListener,
    options?: AddEventListenerOptions,
  ) {
    target.addEventListener(name, fn, options);
    this.listeners.push(() => target.removeEventListener(name, fn, options));
  }
  private invalidate() {
    this.visualTarget = this.renderCount + 1;
    this.canvas.dataset.render = "preparing";
  }
  private shuffleStarted = 0;
  private riffle?: { halves: Mesh[]; height: number };
  /** Set by cancelDrag: the next sync snaps instead of gliding, so a quick re-grab finds the card. */
  private snapNextSync = false;
  shuffleDeck() {
    this.endRiffle();
    this.shuffleStarted = this.reducedMotion ? 0 : performance.now();
    if (this.shuffleStarted && this.deck.isEnabled()) this.beginRiffle();
    this.wake(2);
  }
  // Candle flicker and the armillary sphere only run on desktop profiles and without reduced motion.
  private ambientEnabled() {
    return this.quality !== "low" && !this.reducedMotion && !this.hidden;
  }
  private animateAmbient(time: number) {
    const still = !this.ambientEnabled();
    let glow = 0;
    for (const f of this.flames) {
      const t = time * 0.001 + f.seed;
      // Layered sines give an irregular, non-repeating flicker.
      const n = still ? 0 : Math.sin(t * 7.3) * 0.5 + Math.sin(t * 13.1 + 1.7) * 0.3 + Math.sin(t * 23.7) * 0.2;
      f.outer.scaling.set(1.15 - n * 0.05, 1.15 + n * 0.16, 1.15 - n * 0.05);
      f.outer.position.y = f.baseY + n * 0.006;
      f.outer.rotation.z = still ? 0 : Math.sin(t * 2.3) * 0.06;
      f.outer.rotation.x = still ? 0 : Math.sin(t * 1.7 + 0.6) * 0.05;
      glow += n;
    }
    this.lamp.intensity = 3.1 + (glow / Math.max(1, this.flames.length)) * 0.32;
    if (this.armillary && !still) this.armillary.rotation.y = time * 0.00012;
  }
  wake(frames = 2) {
    this.frames = Math.max(this.frames, frames);
  }
  private attachCamera() {
    this.camera.attachControl(this.canvas, true);
  }
  private point(e: PointerEvent) {
    return readingPoint(this.scene, this.camera, this.canvas, e);
  }
  private deckOrigin() {
    return new Vector3(
      this.deck.position.x,
      0.12 + 0.16 * this.deck.scaling.y,
      this.deck.position.z,
    );
  }
  private beginDeckDrag(e: PointerEvent) {
    if (!this.session?.remainingCardIds.length) return;
    const point = this.point(e);
    if (!point) return;
    const mesh = this.cardTemplate.clone("Carta retirada do monte", null, true);
    mesh.setEnabled(true);
    mesh.material = this.cardMaterial;
    mesh.isPickable = false;
    mesh.position.copyFrom(this.deckOrigin());
    const face = this.faceTemplate.clone("Verso da carta retirada", mesh, true);
    face.setEnabled(true);
    face.position.y = 0.021;
    face.material = this.back;
    face.isPickable = false;
    this.shadow.addShadowCaster(mesh);
    this.deckDrag = {
      pointerId: e.pointerId,
      mesh,
      offset: mesh.position.subtract(point),
      screenX: e.clientX,
      screenY: e.clientY,
      moved: false,
    };
    this.canvas.setPointerCapture(e.pointerId);
    this.canvas.dataset.interaction = "drawing";
    this.wake();
  }
  private endDeckDrag(commit: boolean, preserveCamera = false) {
    const d = this.deckDrag;
    if (!d) return;
    this.deckDrag = undefined;
    delete this.canvas.dataset.interaction;
    if (!preserveCamera) {
      if (this.canvas.hasPointerCapture(d.pointerId))
        this.canvas.releasePointerCapture(d.pointerId);
      this.camera.detachControl();
      this.attachCamera();
    }
    const position = clampPosition({
      x: d.mesh.position.x,
      z: d.mesh.position.z,
    });
    const outside =
      Math.hypot(
        position.x - this.deck.position.x,
        position.z - this.deck.position.z,
      ) > 1.25;
    const shouldDraw = commit && (!d.moved || outside);
    if (shouldDraw) this.pendingArrival = d.mesh.position.clone();
    this.shadow.removeShadowCaster(d.mesh);
    d.mesh.dispose(false, false);
    if (shouldDraw) this.callbacks.draw(d.moved ? position : undefined);
    this.wake();
  }
  private bindInteractions() {
    // The camera records pointer-downs for seamless two-finger takeover; captured moves are blocked during object drags.
    this.listen(
      this.canvas,
      "pointerdown",
      ((e: PointerEvent) => {
        this.wake(8);
        this.pointers.add(e.pointerId);
        if (this.pointers.size > 1) {
          this.cancelDrag(true);
          return;
        }
        if (e.button !== 0) return;
        const r = this.canvas.getBoundingClientRect();
        // Picking reuses world matrices cached for the last rendered frame. A cancelled drag or
        // undo moves meshes between frames, so refresh them or a quick press misses the card.
        for (const { mesh } of this.objects.values()) {
          mesh.computeWorldMatrix(true);
          for (const child of mesh.getChildMeshes()) child.computeWorldMatrix(true);
        }
        const hit = this.scene.pick(
          e.clientX - r.left,
          e.clientY - r.top,
          (m) =>
            !!m.metadata &&
            m.isEnabled() &&
            m.isVisible &&
            m.isPickable &&
            (!m.metadata.id || !this.exits.has(m.metadata.id)),
        );
        const metadata = hit?.pickedMesh?.metadata;
        if (metadata?.deck) {
          this.beginDeckDrag(e);
          e.preventDefault();
          return;
        }
        if (metadata?.id) {
          const object = [
            ...(this.session?.cards || []),
            ...(this.session?.notes || []),
          ].find((o) => o.instanceId === metadata.id);
          const point = this.point(e);
          if (!object || !point) return;
          this.motion.finish(object.instanceId);
          this.canvas.dataset.interaction = "dragging";
          this.objects.get(object.instanceId)?.mesh.scaling.set(1, 1, 1);
          this.camera.inertialAlphaOffset = 0;
          this.camera.inertialBetaOffset = 0;
          this.camera.inertialRadiusOffset = 0;
          this.camera.inertialPanningX = 0;
          this.camera.inertialPanningY = 0;
          this.callbacks.select(object.instanceId);
          this.drag = {
            id: object.instanceId,
            pointerId: e.pointerId,
            start: { ...object.position },
            offset: new Vector3(
              object.position.x,
              0,
              object.position.z,
            ).subtract(point),
            moved: false,
            screenX: e.clientX,
            screenY: e.clientY,
          };
          this.canvas.setPointerCapture(e.pointerId);
          e.preventDefault();
        } else {
          this.callbacks.select();
        }
      }) as EventListener,
      { capture: true },
    );
    this.listen(
      this.canvas,
      "pointermove",
      ((e: PointerEvent) => {
        if (this.pointers.size || this.drag || this.deckDrag) this.wake(8);
        const deckDrag = this.deckDrag;
        if (deckDrag && e.pointerId === deckDrag.pointerId) {
          e.stopPropagation();
          const point = this.point(e);
          if (!point) return;
          if (
            Math.hypot(
              e.clientX - deckDrag.screenX,
              e.clientY - deckDrag.screenY,
            ) > 5
          )
            deckDrag.moved = true;
          if (deckDrag.moved) {
            const p = clampPosition({
              x: point.x + deckDrag.offset.x,
              z: point.z + deckDrag.offset.z,
            });
            deckDrag.mesh.position.set(p.x, 0.75, p.z);
            deckDrag.mesh.rotation.z = Math.max(
              -0.12,
              Math.min(0.12, (e.clientX - deckDrag.screenX) * 0.0008),
            );
          }
          return;
        }
        if (!this.drag || e.pointerId !== this.drag.pointerId) return;
        e.stopPropagation();
        const point = this.point(e);
        if (!point) return;
        const d = this.drag;
        if (Math.hypot(e.clientX - d.screenX, e.clientY - d.screenY) > 4)
          d.moved = true;
        if (!d.moved) return;
        const p = clampPosition({
          x: point.x + d.offset.x,
          z: point.z + d.offset.z,
        });
        const item = this.objects.get(d.id);
        if (item) {
          const mesh = item.mesh,
            dx = p.x - mesh.position.x,
            dz = p.z - mesh.position.z;
          mesh.position.set(p.x, 0.42, p.z);
          // Lean into the drag like a card held at one point, easing back when it slows.
          const clamp = (v: number) => Math.max(-0.26, Math.min(0.26, v));
          mesh.rotation.z = mesh.rotation.z * 0.55 + clamp(-dx * 1.6) * 0.45;
          mesh.rotation.x = mesh.rotation.x * 0.55 + clamp(dz * 1.6) * 0.45;
          this.updateRing(mesh);
        }
        e.stopPropagation();
      }) as EventListener,
      { capture: true },
    );
    this.listen(
      this.canvas,
      "pointerup",
      ((e: PointerEvent) => {
        this.pointers.delete(e.pointerId);
        if (this.deckDrag?.pointerId === e.pointerId) {
          this.endDeckDrag(true);
          return;
        }
        if (!this.drag || this.drag.pointerId !== e.pointerId) return;
        const d = this.drag,
          mesh = this.objects.get(d.id)?.mesh;
        this.drag = undefined;
        delete this.canvas.dataset.interaction;
        this.camera.detachControl();
        this.attachCamera();
        if (this.canvas.hasPointerCapture(e.pointerId))
          this.canvas.releasePointerCapture(e.pointerId);
        if (mesh && d.moved) {
          const isCard = this.session?.cards.some((card) => card.instanceId === d.id);
          if (isCard && Math.abs(mesh.position.x + 8) < 1.25 && Math.abs(mesh.position.z + 4.4) < 1.8)
            this.callbacks.returnCard(d.id);
          else this.callbacks.move(d.id, { x: mesh.position.x, z: mesh.position.z });
        }
        else if (this.session) {
          this.sync(this.session, this.selected);
          this.callbacks.select(d.id, true);
        }
        // Let Babylon observe the release too, so its pointer bookkeeping stays balanced.
        this.wake();
      }) as EventListener,
      { capture: true },
    );
    for (const name of ["pointercancel", "lostpointercapture"])
      this.listen(this.canvas, name, ((e: PointerEvent) => {
        this.pointers.delete(e.pointerId);
        if (
          this.drag?.pointerId === e.pointerId ||
          this.deckDrag?.pointerId === e.pointerId
        )
          this.cancelDrag();
      }) as EventListener);
    this.listen(window, "blur", () => {
      this.pointers.clear();
      this.cancelDrag();
    });
    this.listen(window, "keydown", ((e: KeyboardEvent) => {
      if (e.key === "Escape") this.cancelDrag();
    }) as EventListener);
    this.listen(
      this.canvas,
      "wheel",
      (event) => {
        this.wake(8);
        if (this.drag || this.deckDrag) {
          event.preventDefault();
          event.stopPropagation();
        }
      },
      { capture: true, passive: false },
    );
    this.listen(this.canvas, "contextmenu", (e) => e.preventDefault());
  }
  cancelDrag(preserveCamera = false) {
    this.endDeckDrag(false, preserveCamera);
    const d = this.drag;
    if (!d) return;
    this.drag = undefined;
    this.snapNextSync = true;
    delete this.canvas.dataset.interaction;
    if (!preserveCamera) {
      if (this.canvas.hasPointerCapture(d.pointerId))
        this.canvas.releasePointerCapture(d.pointerId);
      this.camera.detachControl();
      this.attachCamera();
    }
    if (this.session) this.sync(this.session, this.selected);
    this.wake();
  }
  private front(card: Card) {
    const cached = this.fronts.get(card.cardId);
    if (cached) return cached;
    const front = createCardFront(
      this.scene,
      card.cardId,
      this.quality,
      () => this.wake(),
      (message) => this.callbacks.message(message),
    );
    this.frontLoads.push(front.ready);
    this.fronts.set(card.cardId, front.material);
    return front.material;
  }
  // Two half-stacks stand in for the deck while it is riffled; the real deck is hidden meanwhile.
  private beginRiffle() {
    const height = 0.28 * this.deck.scaling.y * 0.5;
    const halves = [0, 1].map((i) => {
      const half = roundedSlab(`Metade do monte ${i + 1}`, 1.72, 3, height, CARD_RADIUS, this.scene);
      half.material = this.deck.material;
      half.isPickable = false;
      const top = this.faceTemplate.clone(`Verso da metade ${i + 1}`, half, true);
      top.setEnabled(true);
      top.position.y = height / 2 + 0.0015;
      top.material = this.back;
      top.isPickable = false;
      this.shadow.addShadowCaster(half);
      return half;
    });
    this.riffle = { halves, height };
    this.deck.visibility = 0;
    this.deck.getChildMeshes().forEach((m) => (m.visibility = 0));
    this.animateRiffle(0);
  }
  private animateRiffle(progress: number) {
    if (!this.riffle) return;
    const { halves, height } = this.riffle;
    const origin = this.deck.position,
      base = origin.y - 0.14 * this.deck.scaling.y + height / 2;
    // 0–0.3 split apart · 0.3–0.75 bend and riffle together · 0.75–1 square up.
    const split = Math.min(1, progress / 0.3),
      merge = Math.max(0, Math.min(1, (progress - 0.3) / 0.45)),
      square = Math.max(0, (progress - 0.75) / 0.25);
    const apart = Math.sin(split * Math.PI * 0.5) * (1 - merge) * 1.05;
    halves.forEach((half, i) => {
      const side = i === 0 ? -1 : 1;
      half.position.set(
        origin.x + side * apart,
        base + (i === 0 ? 0 : height) * (merge < 1 ? merge : 1) + Math.sin(split * Math.PI) * 0.18 * (1 - merge),
        origin.z + side * 0.06 * (1 - square),
      );
      // Thumbs bend the inner edges up while the leaves interleave.
      const bend = Math.sin(merge * Math.PI) * 0.28 + (1 - merge) * split * 0.08;
      half.rotation.z = -side * bend;
      half.rotation.y = side * 0.05 * (1 - square) + Math.sin(square * Math.PI * 2) * 0.015;
    });
  }
  private endRiffle() {
    if (!this.riffle) return;
    this.riffle.halves.forEach((h) => {
      this.shadow.removeShadowCaster(h);
      h.dispose(false, false);
    });
    this.riffle = undefined;
    this.deck.visibility = 1;
    this.deck.getChildMeshes().forEach((m) => (m.visibility = 1));
  }
  private updateRing(mesh: Mesh) {
    this.ring.position.set(mesh.position.x, -0.025, mesh.position.z);
    this.ring.rotation.y = mesh.rotation.y;
    const size = mesh.getBoundingInfo().boundingBox.extendSize;
    this.ring.scaling.set(
      (size.x * 2 + 0.22) / 1.94,
      1,
      (size.z * 2 + 0.28) / 3.28,
    );
  }
  sync(session: Session, selected?: string) {
    const previous = this.session;
    const snap = this.snapNextSync;
    this.session = session;
    this.selected = selected;
    const ids = new Set(
      [...session.cards, ...session.notes].map((o) => o.instanceId),
    );
    for (const [id, item] of this.objects)
      if (!ids.has(id)) {
        this.motion.finish(id);
        const card = previous?.cards.find((c) => c.instanceId === id);
        if (
          card &&
          (session.discardedCardIds.includes(card.cardId) ||
            session.remainingCardIds.includes(card.cardId))
        ) {
          const target = session.discardedCardIds.includes(card.cardId)
            ? new Vector3(8, 0.12, -4.4)
            : this.deckOrigin();
          this.exits.set(id, item.mesh);
          this.motion.fly(id, item.mesh, item.mesh.position, target, {
            exit: true,
            duration: 430,
            arc: 1,
            done: () => {
              this.shadow.removeShadowCaster(item.mesh);
              item.mesh.dispose(false, false);
              this.exits.delete(id);
            },
          });
        } else {
          this.shadow.removeShadowCaster(item.mesh);
          item.mesh.dispose(false, false);
        }
        item.noteMat?.dispose(false, true);
        item.contact?.dispose(false, false);
        this.objects.delete(id);
      }
    const objects = [...session.cards, ...session.notes];
    const ordered = [...objects].sort(
      (a, b) => a.stackingOrder - b.stackingOrder,
    );
    objects.forEach((o) => {
      const isCard = "cardId" in o;
      let item = this.objects.get(o.instanceId);
      const fresh = !item;
      if (this.exits.has(o.instanceId)) this.motion.finish(o.instanceId);
      if (!item) {
        const mesh = (isCard ? this.cardTemplate : this.noteTemplate).clone(o.instanceId, null, true);
        mesh.setEnabled(true);
        mesh.material = isCard ? this.cardMaterial : this.noteMaterial;
        mesh.receiveShadows = true;
        mesh.metadata = { id: o.instanceId };
        this.shadow.addShadowCaster(mesh);
        const face = (isCard ? this.faceTemplate : this.noteFaceTemplate).clone(`${o.instanceId}-face`, null, true);
        face.setEnabled(true);
        face.parent = mesh;
        face.position.y = 0.021;
        face.metadata = { id: o.instanceId };
        const contact = isCard
          ? this.contactTemplate.clone(`${o.instanceId}-sombra`, null, true)
          : undefined;
        if (contact) {
          contact.setEnabled(true);
          contact.isPickable = false;
        }
        item = { mesh, signature: "", contact };
        this.objects.set(o.instanceId, item);
      }
      const mesh = item.mesh;
      const face = mesh.getChildMeshes()[0];
      const signature = isCard
        ? `${o.faceUp}:${o.isReversed}`
        : (o as Note).text;
      if (item.signature !== signature || !face.material) {
        if (isCard) {
          const oldMaterial = face.material,
            oldY = face.rotation.y;
          const nextMaterial = o.faceUp ? this.front(o) : this.back,
            nextY = o.faceUp && o.isReversed ? Math.PI : 0;
          face.material = nextMaterial;
          face.rotation.y = nextY;
          if (
            item.signature &&
            item.signature.split(":")[0] !== String(o.faceUp)
          )
            this.motion.flip(
              o.instanceId,
              mesh,
              face as Mesh,
              oldMaterial,
              nextMaterial,
              oldY,
              nextY,
            );
        } else {
          item.noteMat?.dispose(false, true);
          const note = o as Note;
          const mat = material(this.scene, `Texto ${o.instanceId}`, "#ffffff");
          mat.disableLighting = true;
          mat.emissiveColor = Color3.White();
          mat.diffuseTexture = painted(
            this.scene,
            `Etiqueta ${o.instanceId}`,
            512,
            216,
            (c) => {
              c.fillStyle = note.kind === "position" ? "#d7c5a0" : "#c9bb9c";
              c.fillRect(0, 0, 512, 216);
              c.fillStyle = "#3b3430";
              const position = note.kind === "position";
              c.font = `${position ? 56 : 38}px Georgia`;
              const words = note.text
                .replace(/\s+/g, " ")
                .slice(0, 160)
                .split(" ");
              const lines: string[] = [];
              let line = "";
              for (const word of words) {
                if (line && c.measureText(`${line} ${word}`).width > 450) {
                  lines.push(line);
                  line = word;
                } else line += `${line ? " " : ""}${word}`;
              }
              if (line) lines.push(line);
              const count = position ? 3 : 4,
                visible = lines.slice(0, count);
              if (lines.length > count)
                visible[count - 1] = `${visible[count - 1].slice(0, -2)}…`;
              if (position && visible.length === 1) {
                c.textAlign = "center";
                c.fillText(visible[0], 256, 130, 464);
              } else
                visible.forEach((text, i) =>
                  c.fillText(
                    text,
                    24,
                    (position ? 62 : 48) + i * (position ? 58 : 46),
                    464,
                  ),
                );
            },
          );
          item.noteMat = mat;
          face.material = mat;
        }
        item.signature = signature;
      }
      const before = mesh.position.clone(),
        beforeYaw = mesh.rotation.y;
      mesh.position.set(
        o.position.x,
        0.01 +
          (o.instanceId === selected
            ? objects.length * 0.004 + 0.045
            : ordered.indexOf(o) * 0.004),
        o.position.z,
      );
      mesh.rotation.y = o.rotation;
      if (!this.motion.has(o.instanceId)) {
        mesh.rotation.x = 0;
        mesh.rotation.z = 0;
      }
      this.motion.retarget(
        o.instanceId,
        mesh.position,
        o.rotation,
        isCard && o.faceUp && o.isReversed ? Math.PI : 0,
      );
      if (fresh && isCard && previous?.remainingCardIds.includes(o.cardId)) {
        const from = this.pendingArrival || this.deckOrigin();
        this.pendingArrival = undefined;
        this.motion.fly(o.instanceId, mesh, from, mesh.position, {
          duration: this.jumperArrival ? 1100 : from.y > 0.5 ? 260 : 720,
          arc: this.jumperArrival ? 3.4 : from.y > 0.5 ? 0.12 : 1.2,
        });
        this.jumperArrival = false;
      } else if (
        !fresh &&
        !snap &&
        !this.motion.has(o.instanceId) &&
        this.drag?.id !== o.instanceId
      ) {
        // Moves, rotations, selection lifts, undo/redo and drops glide instead of jumping.
        const distance = Vector3.Distance(before, mesh.position),
          turn = Math.abs(Math.atan2(Math.sin(o.rotation - beforeYaw), Math.cos(o.rotation - beforeYaw)));
        if (distance > 0.002 || turn > 0.001)
          this.motion.fly(o.instanceId, mesh, before, mesh.position, {
            duration: Math.min(460, 170 + distance * 70 + turn * 90),
            arc: distance > 0.8 ? 0.45 : 0,
            tilt: distance > 0.8 ? 0.1 : 0,
            fromRotation: beforeYaw,
          });
      }
    });
    this.snapNextSync = false;
    this.discardedTop.setEnabled(session.discardedCardIds.length > 0);
    this.deck.setEnabled(session.remainingCardIds.length > 0);
    this.deck.scaling.y =
      0.5 +
      (0.5 * session.remainingCardIds.length) /
        (session.deckId === "tarot" ? 78 : 36);
    const chosen = selected ? this.objects.get(selected)?.mesh : undefined;
    this.ring.setEnabled(!!chosen);
    if (chosen) this.updateRing(chosen);
    this.wake();
    this.canvas.dataset.motion = this.motion.active ? "active" : "idle";
    this.invalidate();
    this.scene.executeWhenReady(() => this.wake());
  }
  // Desktop profiles add a post-processing stack; low only adds an FXAA pass.
  // Image processing remains per material so the card art keeps its original colours.
  private configurePostProcessing(q: Quality) {
    if (q === "low") {
      this.pipeline?.dispose();
      this.pipeline = undefined;
      // Cheap edge smoothing for the low profile, which renders below native resolution.
      this.lowFxaa ??= new FxaaPostProcess("Suavização de bordas", 1, this.camera);
    } else {
      this.lowFxaa?.dispose(this.camera);
      this.lowFxaa = undefined;
      if (!this.pipeline) {
        this.pipeline = new DefaultRenderingPipeline("Acabamento da mesa", true, this.scene, [this.camera]);
        // Image processing stays in each material: applying it here would gamma-correct twice.
        // The vignette is drawn in CSS over the canvas instead.
        this.pipeline.imageProcessingEnabled = false;
        // Only HDR highlights above 1 (the flames) bloom; paper and art stay crisp.
        this.pipeline.bloomEnabled = true;
        this.pipeline.bloomThreshold = 1.05;
        this.pipeline.bloomWeight = 0.55;
        this.pipeline.bloomKernel = 96;
        this.pipeline.bloomScale = 0.5;
        // No sharpening: it re-accentuates the stair-steps that MSAA and FXAA remove.
        this.pipeline.sharpenEnabled = false;
        this.pipeline.fxaaEnabled = true;
      }
      // MSAA on the off-screen target (the canvas' own antialiasing no longer applies once
      // post-processing is on), capped by what the GPU supports.
      const maxSamples = Math.max(1, this.engine.getCaps().maxMSAASamples || 4);
      this.pipeline.samples = Math.min(maxSamples, q === "high" ? 8 : 4);
    }
    const wantsSsao = q === "high" && SSAO2RenderingPipeline.IsSupported;
    if (!wantsSsao) {
      this.ssao?.dispose();
      this.ssao = undefined;
    } else if (!this.ssao) {
      // Ambient occlusion where cards, candles and props meet the cloth.
      this.ssao = new SSAO2RenderingPipeline("Oclusão ambiente", this.scene, { ssaoRatio: 0.75, blurRatio: 1 }, [this.camera]);
      this.ssao.radius = 0.9;
      this.ssao.totalStrength = 1.15;
      this.ssao.base = 0.12;
      this.ssao.samples = 16;
      this.ssao.maxZ = 60;
      this.ssao.expensiveBlur = true;
    }
  }
  setQuality(q: Quality) {
    this.motion.clear();
    const old = this.quality;
    this.quality = q;
    if ((old === "high") !== (q === "high")) {
      this.fronts.forEach((m) => m.dispose(false, true));
      this.fronts.clear();
      this.frontLoads = [];
      this.objects.forEach((o) => (o.signature = ""));
      if (this.session) this.sync(this.session, this.selected);
    }
    // Render scale. High supersamples on standard displays (at least 1.5×, up to 2×), which is
    // the most effective cure for shimmering on thin brass inlays and card edges.
    const dpr = devicePixelRatio || 1;
    const ratio =
      q === "high" ? Math.min(2, Math.max(dpr, 1.5)) : q === "medium" ? Math.min(dpr, 1.5) : Math.min(dpr, 1);
    this.engine.setHardwareScalingLevel((q === "low" ? 1.15 : 1) / ratio);
    this.scene.shadowsEnabled = q !== "low";
    this.glow.isEnabled = q !== "low";
    this.lamp.setEnabled(true);
    this.shadow.mapSize = q === "high" ? 2048 : 1024;
    this.shadow.filteringQuality =
      q === "high"
        ? ShadowGenerator.QUALITY_MEDIUM
        : ShadowGenerator.QUALITY_LOW;
    this.configurePostProcessing(q);
    this.invalidate();
    this.scene.executeWhenReady(() => this.wake());
    this.engine.resize();
    this.wake();
  }
  getCamera(): CameraState {
    return {
      alpha: this.camera.alpha,
      beta: this.camera.beta,
      radius: this.camera.radius,
      x: this.camera.target.x,
      z: this.camera.target.z,
    };
  }
  setCamera(c: CameraState) {
    this.camera.alpha = c.alpha;
    this.camera.beta = c.beta;
    this.camera.radius = c.radius;
    this.camera.target.set(c.x, 0, c.z);
    this.lastCamera = cameraKey(c);
    this.invalidate();
    this.wake();
  }
  view(mode: "table" | "top" | "all") {
    this.cancelDrag();
    if (mode === "table")
      this.setCamera({
        ...DEFAULT_CAMERA,
        radius: Math.min(
          42,
          Math.max(
            22,
            26 / (this.canvas.clientWidth / this.canvas.clientHeight),
          ),
        ),
      });
    else if (mode === "top")
      this.setCamera({ ...this.getCamera(), alpha: -Math.PI / 2, beta: 0.08 });
    else {
      const list = [
        ...(this.session?.cards || []),
        ...(this.session?.notes || []),
      ];
      const xs = list.map((o) => o.position.x),
        zs = list.map((o) => o.position.z);
      const x = list.length ? (Math.min(...xs) + Math.max(...xs)) / 2 : 0,
        z = list.length ? (Math.min(...zs) + Math.max(...zs)) / 2 : 0;
      const spanX = list.length ? Math.max(...xs) - Math.min(...xs) + 4 : 20,
        spanZ = list.length ? Math.max(...zs) - Math.min(...zs) + 5 : 14;
      const aspect = this.canvas.clientWidth / this.canvas.clientHeight;
      this.setCamera({
        alpha: -Math.PI / 2,
        beta: 0.18,
        radius: Math.min(
          42,
          Math.max(12, (Math.max(spanX / aspect, spanZ) / 0.8) * 1.25),
        ),
        x: Math.max(-6, Math.min(6, x)),
        z: Math.max(-4, Math.min(4, z)),
      });
    }
  }
  async ready() {
    await Promise.all(this.frontLoads);
    await this.scene.whenReadyAsync();
    if (this.disposed) return;
    this.invalidate();
    this.wake();
    await new Promise<void>((resolve) =>
      this.readyWaiters.push({ target: this.visualTarget, resolve }),
    );
  }
  metrics() {
    const sorted = [...this.samples].sort((a, b) => a - b);
    return {
      renderedFrames: this.renderCount,
      idleFramesSkipped: this.idleSkips,
      gpuBackpressureFrames: this.pacer.blockedFrames,
      cpuFrameP95Ms: sorted[Math.floor(sorted.length * 0.95)] || 0,
      meshes: this.scene.meshes.length,
      triangles: this.scene.getActiveIndices() / 3,
      textures: this.scene.textures.length,
      drawCalls: this.lastDrawCalls,
      textureBytesEstimate: this.scene.textures.reduce((n, t) => {
        const s = t.getSize();
        return n + s.width * s.height * 4 * 1.33;
      }, 0),
    };
  }
  dispose() {
    this.disposed = true;
    this.motion.clear();
    this.cancelDrag();
    this.listeners.forEach((fn) => fn());
    this.resizeObserver.disconnect();
    this.engine.stopRenderLoop();
    this.readyWaiters.forEach((waiter) => waiter.resolve());
    this.readyWaiters = [];
    this.pacer.reset();
    this.scene.dispose();
    this.engine.dispose();
  }
}
