import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import "@babylonjs/core/Cameras/Inputs/arcRotateCameraPointersInput";
import "@babylonjs/core/Cameras/Inputs/arcRotateCameraMouseWheelInput";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { CubeTexture } from "@babylonjs/core/Materials/Textures/cubeTexture";
import { GlowLayer } from "@babylonjs/core/Layers/glowLayer";
import { CreateTube } from "@babylonjs/core/Meshes/Builders/tubeBuilder";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import { readingPoint } from "../interaction/readingPlane";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { DirectionalLight } from "@babylonjs/core/Lights/directionalLight";
import { PointLight } from "@babylonjs/core/Lights/pointLight";
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
} from "../scene/materials";
import { roundedBox, outline, ring } from "../scene/geometry";
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
  private exits = new Map<string, Mesh>();
  private glow: GlowLayer;
  private flames: Mesh[] = [];
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
  private notePaper: StandardMaterial;
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
    this.scene.environmentIntensity = 0.62;
    this.scene.fogMode = Scene.FOGMODE_EXP2;
    this.scene.fogDensity = 0.006;
    this.scene.fogColor = new Color3(0.065, 0.05, 0.09);
    this.glow = new GlowLayer("Luz das velas", this.scene, {
      blurKernelSize: 32,
      mainTextureRatio: 0.35,
    });
    this.glow.intensity = 0.42;
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
    fill.intensity = 0.45;
    fill.diffuse = new Color3(0.65, 0.72, 1);
    fill.groundColor = new Color3(0.12, 0.08, 0.15);
    const key = new DirectionalLight(
      "Luz dourada",
      new Vector3(0.45, -1, 0.35),
      this.scene,
    );
    key.position = new Vector3(-10, 17, -8);
    key.intensity = 1.65;
    key.diffuse = new Color3(1, 0.86, 0.66);
    key.shadowMinZ = 1;
    key.shadowMaxZ = 50;
    key.shadowFrustumSize = 34;
    this.shadow = new ShadowGenerator(1024, key);
    this.shadow.usePercentageCloserFiltering = true;
    this.shadow.filteringQuality = ShadowGenerator.QUALITY_MEDIUM;
    this.shadow.bias = 0.0004;
    this.shadow.normalBias = 0.015;
    this.shadow.darkness = 0.32;
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
    const wax = material(this.scene, "Cera de abelha", "#e2cda6", 0.16);
    for (const [i, height] of [1.5, 2.15, 0.95].entries()) {
      const x = -10 + (i === 1 ? -0.15 : i === 2 ? 0.6 : 0),
        z = 4.4 + (i === 1 ? 1.25 : i === 2 ? 0.6 : 0);
      const base = CreateCylinder(
        "Castiçal torneado",
        { diameter: 0.98, height: 0.14, tessellation: 40 },
        this.scene,
      );
      base.position.set(x, 0, z);
      base.material = brass;
      base.isPickable = false;
      const lip = ring("Borda do castiçal", 0.91, 0.065, this.scene, 32);
      lip.position.set(x, 0.09, z);
      lip.material = brass;
      lip.isPickable = false;
      const candle = CreateCylinder(
        "Vela de cera",
        { diameter: 0.48, height, tessellation: 32 },
        this.scene,
      );
      candle.position.set(x, height / 2 + 0.1, z);
      candle.material = wax;
      candle.isPickable = false;
      this.shadow.addShadowCaster(candle);
      const wick = CreateCylinder(
        "Pavio",
        { diameter: 0.035, height: 0.16, tessellation: 8 },
        this.scene,
      );
      wick.position.set(x, height + 0.16, z);
      wick.material = material(this.scene, "Carvão", "#30251d");
      wick.isPickable = false;
      const flame = CreateSphere(
        "Chama",
        { diameter: 0.16, segments: 16 },
        this.scene,
      );
      flame.position.set(x, height + 0.33, z);
      flame.scaling.set(1, 2.8, 1);
      flame.isPickable = false;
      const fire = material(this.scene, "Chama de âmbar", "#ffdaa0");
      fire.emissiveColor = new Color3(2.8, 1.15, 0.26);
      flame.material = fire;
      this.glow.addIncludedOnlyMesh(flame);
      this.flames.push(flame);
    }
    this.lamp = new PointLight(
      "Luz das velas",
      new Vector3(-10, 3.1, 4.8),
      this.scene,
    );
    this.lamp.diffuse = new Color3(1, 0.55, 0.23);
    this.lamp.intensity = 1.3;
    this.lamp.range = 11;
    const box = roundedBox("Caixa de couro", 2.2, 3.65, 0.7, 0.14, this.scene);
    box.position.set(9.7, 0.3, 4.7);
    box.rotation.y = -0.15;
    box.material = material(this.scene, "Couro obsidiana", "#17141c", 0.16);
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
    for (let i = 0; i < 3; i++) {
      const orbit = ring("Esfera armilar", 1.35, 0.035, this.scene, 48);
      orbit.position.set(10, 0.8, -4.9);
      orbit.rotation.set(i * 0.7, 0, i * 0.9);
      orbit.material = brass;
      orbit.isPickable = false;
    }
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
      { diameter: 0.08, height: 0.8, tessellation: 12 },
      this.scene,
    );
    stem.position.set(10, 0.4, -4.9);
    stem.material = brass;
    stem.isPickable = false;
    const crystalMat = metal(this.scene, "Quartzo azul", "#497f9b", 0.13);
    crystalMat.metallic = 0.12;
    crystalMat.alpha = 0.83;
    crystalMat.emissiveColor = new Color3(0.025, 0.07, 0.11);
    crystalMat.backFaceCulling = false;
    for (let i = 0; i < 3; i++) {
      const crystal = CreateCylinder(
        "Cristal de quartzo",
        {
          diameterTop: 0,
          diameterBottom: 0.55,
          height: 1.2 - i * 0.2,
          tessellation: 6,
        },
        this.scene,
      );
      crystal.position.set(9.8 + (i - 1) * 0.4, 0.5, -2.6 + (i % 2) * 0.3);
      crystal.rotation.z = (i - 1) * 0.22;
      crystal.material = crystalMat;
      crystal.isPickable = false;
      this.shadow.addShadowCaster(crystal);
    }
    atmosphere(this.scene);
    this.back = cardBack(this.scene);
    this.cardTemplate = CreateBox(
      "Geometria compartilhada das cartas",
      { width: 1.72, depth: 3, height: 0.035 },
      this.scene,
    );
    this.cardTemplate.setEnabled(false);
    this.faceTemplate = CreateGround(
      "Geometria compartilhada das artes",
      { width: 1.69, height: 2.97 },
      this.scene,
    );
    this.faceTemplate.setEnabled(false);
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
        c.clearRect(0, 0, 128, 256);
        c.filter = "blur(9px)";
        c.fillStyle = "#00000080";
        c.fillRect(14, 18, 100, 220);
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
    this.deck = CreateBox(
      "Monte · puxar carta",
      { width: 1.7, depth: 2.95, height: 0.28 },
      this.scene,
    );
    this.deck.position.set(-8, 0.12, -4.4);
    this.deck.material = this.paper;
    this.deck.metadata = { deck: true };
    this.shadow.addShadowCaster(this.deck);
    const top = CreateGround(
      "Verso do monte",
      { width: 1.68, height: 2.93 },
      this.scene,
    );
    top.parent = this.deck;
    top.position.y = 0.147;
    top.material = this.back;
    top.metadata = { deck: true };
    for (let i = 0; i < 5; i++) {
      const layer = CreateBox(
        "Folhas do monte",
        { width: 1.71, depth: 2.96, height: 0.009 },
        this.scene,
      );
      layer.parent = this.deck;
      layer.position.y = -0.1 + i * 0.048;
      layer.material =
        i % 2 ? this.paper : material(this.scene, `Borda ${i}`, "#b29c76");
      layer.metadata = { deck: true };
    }
    const tray = roundedBox(
      "Bandeja dos descartes",
      2.15,
      3.5,
      0.04,
      0.14,
      this.scene,
    );
    tray.position.set(8, -0.032, -4.4);
    tray.material = material(this.scene, "Couro da bandeja", "#201b1d", 0.1);
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
    this.discardedTop = CreateBox(
      "Pilha de descartes",
      { width: 1.72, depth: 3, height: 0.04 },
      this.scene,
    );
    this.discardedTop.position.set(8, 0.02, -4.4);
    this.discardedTop.material = this.paper;
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
        this.idleSkips++;
        return;
      }
      const start = performance.now();
      const t = this.camera.target;
      t.x = Math.max(-6, Math.min(6, t.x));
      t.z = Math.max(-4, Math.min(4, t.z));
      t.y = 0;
      let shuffling = false;
      if (this.shuffleStarted) {
        const progress = Math.min(1, (start - this.shuffleStarted) / 850);
        const envelope = Math.sin(progress * Math.PI);
        this.deck.rotation.y = Math.sin(progress * Math.PI * 8) * envelope * 0.16;
        this.deck.rotation.z = Math.sin(progress * Math.PI * 6) * envelope * 0.06;
        shuffling = progress < 1;
        if (!shuffling) {
          this.shuffleStarted = 0;
          this.deck.rotation.setAll(0);
        }
      }
      const moving = this.motion.update(start) || shuffling;
      if (moving) this.frames = Math.max(this.frames, 2);
      const motionState = moving ? "active" : "idle";
      if (this.canvas.dataset.motion !== motionState)
        this.canvas.dataset.motion = motionState;
      for (const item of this.objects.values())
        if (item.contact) {
          item.contact.position.set(
            item.mesh.position.x,
            -0.045,
            item.mesh.position.z,
          );
          item.contact.rotation.y = item.mesh.rotation.y;
          item.contact.visibility =
            0.8 / (1 + Math.max(0, item.mesh.position.y) * 2);
        }
      for (const [i, flame] of this.flames.entries())
        flame.scaling.y =
          2.8 +
          (this.reducedMotion ? 0 : Math.sin(start * 0.009 + i * 2) * 0.22);
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
      this.frames--;
      const camera = this.getCamera(),
        key = JSON.stringify(camera);
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
  shuffleDeck() {
    this.shuffleStarted = this.reducedMotion ? 0 : performance.now();
    this.wake(2);
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
    mesh.material = this.paper;
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
        const hit = this.scene.pick(
          e.clientX - r.left,
          e.clientY - r.top,
          (m) =>
            !!m.metadata &&
            m.isEnabled() &&
            m.isVisible &&
            m.isPickable &&
            (!m.metadata.id || !this.motion.has(m.metadata.id)),
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
          item.mesh.position.set(p.x, 0.35, p.z);
          this.updateRing(item.mesh);
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
        const mesh = isCard
          ? this.cardTemplate.clone(o.instanceId, null, true)
          : CreateBox(
              o.instanceId,
              { width: 2.4, depth: 1.05, height: 0.035 },
              this.scene,
            );
        mesh.setEnabled(true);
        mesh.material = isCard ? this.paper : this.notePaper;
        mesh.receiveShadows = true;
        mesh.metadata = { id: o.instanceId };
        this.shadow.addShadowCaster(mesh);
        const face = isCard
          ? this.faceTemplate.clone(`${o.instanceId}-face`, null, true)
          : CreateGround(
              `${o.instanceId}-face`,
              { width: 2.35, height: 1 },
              this.scene,
            );
        face.setEnabled(true);
        face.parent = mesh;
        face.position.y = 0.021;
        face.metadata = { id: o.instanceId };
        const contact = isCard
          ? this.contactTemplate.clone(`${o.instanceId}-sombra`, null, true)
          : undefined;
        if (contact) {
          contact.setEnabled(this.quality === "low");
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
      mesh.position.set(
        o.position.x,
        0.01 +
          (o.instanceId === selected
            ? objects.length * 0.004 + 0.045
            : ordered.indexOf(o) * 0.004),
        o.position.z,
      );
      mesh.rotation.y = o.rotation;
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
          duration: from.y > 0.5 ? 260 : 720,
          arc: from.y > 0.5 ? 0.12 : 1.2,
        });
      }
    });
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
    const ratio = Math.min(
      devicePixelRatio || 1,
      q === "high" ? 2 : q === "medium" ? 1.35 : 1,
    );
    this.engine.setHardwareScalingLevel((q === "low" ? 1.35 : 1) / ratio);
    this.scene.shadowsEnabled = q !== "low";
    this.glow.isEnabled = q !== "low";
    this.lamp.setEnabled(true);
    this.shadow.mapSize = q === "high" ? 2048 : 1024;
    this.shadow.filteringQuality =
      q === "high"
        ? ShadowGenerator.QUALITY_MEDIUM
        : ShadowGenerator.QUALITY_LOW;
    this.objects.forEach((item) => item.contact?.setEnabled(q === "low"));
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
    this.lastCamera = JSON.stringify(c);
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
