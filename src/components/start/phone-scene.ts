/**
 * The 3D phone on /start — drawn in code: no model file, no image files, no
 * brand marks. Loaded on demand (see PhoneStage in StartExperience), so
 * three.js is never in the page's first download.
 *
 * Pinned to three r128 on purpose. It is the release the approved prototype
 * was tuned on, and the last line that still runs on WebGL 1 — which is what
 * a good share of budget Android phones offer.
 *
 * How it moves:
 *   scroll      one pose per chapter, a full turn between chapters 1 and 2
 *   weight      the phone eases toward its pose and leans with scroll speed
 *   touch       a sideways drag spins it; it springs back when let go
 *   tilt        on Android, tilting the handset shifts the view a little
 *   idle        a slow float, drifting gold dust, a soft glow behind
 *   the form    it rises and shrinks to make room; on success it spins once
 *               and its own screen shows the call that is coming
 */
import * as THREE from "three";

export type SceneMode = "story" | "sheet" | "done";

export type PhoneSceneOptions = {
  canvas: HTMLCanvasElement;
  /** CSS font-family lists, as next/font names them. */
  fonts: { display: string; body: string };
  reducedMotion: boolean;
  /** Where the reader is: 0 … 4, fractional between chapters. */
  chapter: () => number;
  /** Sideways drags on this element spin the phone. */
  dragSurface: HTMLElement;
  onContextLost: () => void;
};

export type PhoneScene = {
  /**
   * `freeTop` is how much of the screen is left above the form, from 0 to 1.
   * The phone sizes itself to sit in that space, whatever the form's height.
   */
  setMode: (mode: SceneMode, freeTop?: number) => void;
  dispose: () => void;
};

const TAU = Math.PI * 2;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const smooth = (t: number) => t * t * (3 - 2 * t);
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const nearestTurn = (from: number, to: number) => to + TAU * Math.round((from - to) / TAU);

type Pose = { ry: number; rx: number; rz: number; s: number };

/** One resting pose per chapter. */
const POSES: Pose[] = [
  { ry: -0.52, rx: 0.1, rz: -0.04, s: 1.0 },
  { ry: 0.46, rx: 0.05, rz: 0.03, s: 1.0 },
  { ry: TAU - 0.42, rx: 0.08, rz: -0.03, s: 1.0 },
  { ry: TAU + 0.32, rx: -0.06, rz: 0.02, s: 1.1 },
  { ry: TAU, rx: 0.0, rz: 0.0, s: 0.98 },
];

const CALL_SCREEN = 5;
const HANDSET =
  "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z";

export function createPhoneScene(o: PhoneSceneOptions): PhoneScene {
  const { canvas, reducedMotion: reduce } = o;
  // Asked for less motion: the same angles, without the full turn between chapters.
  const poses = reduce ? POSES.map((p) => ({ ...p, ry: p.ry > Math.PI ? p.ry - TAU : p.ry })) : POSES;

  // Throws when the device has no usable WebGL; the caller shows the flat
  // phone instead. failIfMajorPerformanceCaveat turns away software
  // rendering, which would draw this at a few frames a second.
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
    failIfMajorPerformanceCaveat: true,
  });
  const dpr = window.devicePixelRatio || 1;
  let pixelRatio = Math.min(dpr, 2);
  renderer.setPixelRatio(pixelRatio);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.setClearColor(0x000000, 0);

  // r128 reads a hex colour as a raw light value. Convert from the sRGB the
  // designer means, or navy renders mid-blue and gold renders pale.
  const srgb = (hex: number) => new THREE.Color(hex).convertSRGBToLinear();

  const scene = new THREE.Scene();
  // Tight near/far: the glass layers sit fractions of a unit apart and
  // flicker against each other if depth precision is spent on empty space.
  const camera = new THREE.PerspectiveCamera(30, 1, 8, 220);

  // ── A small photo studio, built in code and baked into reflections. ──
  const makeStudio = () => {
    const s = new THREE.Scene();
    s.add(
      new THREE.Mesh(
        new THREE.BoxGeometry(60, 60, 60),
        new THREE.MeshBasicMaterial({ color: srgb(0x0b1322), side: THREE.BackSide }),
      ),
    );
    const panel = (w: number, h: number, r: number, g: number, b: number, x: number, y: number, z: number) => {
      const m = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide });
      m.color.setRGB(r, g, b);
      const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m);
      p.position.set(x, y, z);
      p.lookAt(0, 0, 0);
      s.add(p);
    };
    panel(16, 26, 3.0, 3.0, 3.1, -22, 6, 12); // key softbox, front left
    panel(10, 30, 4.6, 3.3, 1.5, 24, 0, 8); // warm gold strip, right
    panel(30, 8, 3.2, 3.4, 3.8, 0, 26, 6); // overhead strip
    panel(18, 18, 0.5, 0.8, 1.5, -8, -10, -24); // cool rim, behind
    panel(14, 26, 2.6, 2.4, 2.0, 16, 8, -22); // soft warm panel, behind right
    panel(8, 12, 0.28, 0.28, 0.32, 20, 16, 22); // faint fill, off the camera axis so flat glass never mirrors it whole
    const pm = new THREE.PMREMGenerator(renderer);
    const tex = pm.fromScene(s, 0.04).texture;
    pm.dispose();
    s.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.geometry.dispose();
        (mesh.material as THREE.Material).dispose();
      }
    });
    return tex;
  };
  const envTex = makeStudio();
  scene.environment = envTex;
  const key = new THREE.DirectionalLight(0xffffff, 0.4);
  key.position.set(-6, 10, 14);
  scene.add(key);
  scene.add(new THREE.AmbientLight(srgb(0x8fa6c8), 0.12));

  // ── The phone. Generic on purpose. ──
  const W = 7.2, H = 15.2, R = 1.15, DEPTH = 0.62, BEVEL = 0.14, HALF = DEPTH / 2 + BEVEL;

  const roundedRect = (w: number, h: number, r: number) => {
    const x = -w / 2, y = -h / 2, s = new THREE.Shape();
    s.moveTo(x + r, y);
    s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
    s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
    return s;
  };
  const flatPanel = (w: number, h: number, r: number) => {
    const g = new THREE.ShapeGeometry(roundedRect(w, h, r), 20);
    const uv = g.attributes.uv as THREE.BufferAttribute;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) / w + 0.5, uv.getY(i) / h + 0.5);
    uv.needsUpdate = true;
    return g;
  };

  const metal = new THREE.MeshStandardMaterial({ color: srgb(0xd4a853), metalness: 1, roughness: 0.24, envMapIntensity: 1.35 });
  const backGlass = new THREE.MeshPhysicalMaterial({ color: srgb(0x0e2247), metalness: 0, roughness: 0.42, clearcoat: 0.3, clearcoatRoughness: 0.28, envMapIntensity: 0.9 });
  const blackGlass = new THREE.MeshPhysicalMaterial({ color: srgb(0x04060b), metalness: 0.4, roughness: 0.06, clearcoat: 1, clearcoatRoughness: 0.03 });
  const lensGlass = new THREE.MeshPhysicalMaterial({ color: srgb(0x02030a), metalness: 0.7, roughness: 0.04, clearcoat: 1, clearcoatRoughness: 0.02, envMapIntensity: 1.6 });

  const phone = new THREE.Group();

  const bodyGeo = new THREE.ExtrudeGeometry(roundedRect(W, H, R), {
    depth: DEPTH, bevelEnabled: true, bevelThickness: BEVEL, bevelSize: BEVEL, bevelSegments: 6, curveSegments: 20,
  });
  bodyGeo.center();
  phone.add(new THREE.Mesh(bodyGeo, metal));

  const front = new THREE.Mesh(flatPanel(W, H, R), blackGlass);
  front.position.z = HALF + 0.01;
  phone.add(front);

  // The screen is a live drawing, redrawn for each chapter.
  // Drawn in a 560-wide coordinate space, stored in a 512 x 1024 canvas:
  // WebGL 1 (common on budget phones) needs power-of-two sizes for sharp,
  // mipmapped textures and would otherwise rescale it on every update.
  const SW = W - 0.44, SH = H - 0.44, CW = 560, CH = Math.round((560 * SH) / SW);
  const TEX_W = 512, TEX_H = 1024;
  const cv = document.createElement("canvas");
  cv.width = TEX_W;
  cv.height = TEX_H;
  const ctx = cv.getContext("2d")!;
  const screenTex = new THREE.CanvasTexture(cv);
  screenTex.encoding = THREE.sRGBEncoding;
  screenTex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  const screenMat = new THREE.MeshBasicMaterial({ map: screenTex, toneMapped: false });
  const screen = new THREE.Mesh(flatPanel(SW, SH, R - 0.2), screenMat);
  screen.position.z = HALF + 0.03;
  phone.add(screen);

  // A thin reflective sheet over the screen, so the glass catches the studio
  // lights as it turns. Its strength jumps for a moment on each new chapter.
  const sheenMat = new THREE.MeshStandardMaterial({
    color: 0x000000, metalness: 1, roughness: 0.04, transparent: true, opacity: 0.16, envMapIntensity: 1.6, depthWrite: false,
  });
  const sheen = new THREE.Mesh(flatPanel(W, H, R), sheenMat);
  sheen.position.z = HALF + 0.05;
  phone.add(sheen);

  const back = new THREE.Mesh(flatPanel(W, H, R), backGlass);
  back.rotation.y = Math.PI;
  back.position.z = -(HALF + 0.01);
  phone.add(back);

  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.045, 12, 64), metal);
  ring.position.set(0, -0.6, -(HALF + 0.04));
  phone.add(ring);

  const island = new THREE.Group();
  const islandGeo = new THREE.ExtrudeGeometry(roundedRect(3.0, 3.0, 0.8), {
    depth: 0.1, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 4, curveSegments: 16,
  });
  islandGeo.center();
  island.add(new THREE.Mesh(islandGeo, backGlass));
  const lensGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.14, 40);
  const rimGeo = new THREE.TorusGeometry(0.55, 0.06, 12, 48);
  ([[-0.68, 0.68], [-0.68, -0.68], [0.68, 0]] as const).forEach(([lx, ly]) => {
    const lens = new THREE.Mesh(lensGeo, lensGlass);
    lens.rotation.x = Math.PI / 2;
    lens.position.set(lx, ly, -0.12);
    island.add(lens);
    const rim = new THREE.Mesh(rimGeo, metal);
    rim.position.set(lx, ly, -0.13);
    island.add(rim);
  });
  const flash = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.06, 24), new THREE.MeshBasicMaterial({ color: srgb(0xfff1c9) }));
  flash.rotation.x = Math.PI / 2;
  flash.position.set(0.72, 0.95, -0.11);
  island.add(flash);
  island.position.set(W / 2 - 2.05, H / 2 - 2.05, -(HALF + 0.1));
  phone.add(island);

  ([[W / 2 + BEVEL + 0.03, 2.6, 1.7], [-(W / 2 + BEVEL + 0.03), 3.4, 1.0], [-(W / 2 + BEVEL + 0.03), 1.9, 1.0]] as const).forEach(([bx, by, bh]) => {
    const btn = new THREE.Mesh(new THREE.BoxGeometry(0.1, bh, 0.26), metal);
    btn.position.set(bx, by, 0);
    phone.add(btn);
  });

  const rig = new THREE.Group();
  rig.add(phone);
  scene.add(rig);

  // ── Atmosphere: a warm glow behind the phone and slow gold dust. ──
  const radialTexture = (stops: [number, string][]) => {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const g2 = c.getContext("2d")!;
    const grad = g2.createRadialGradient(64, 64, 0, 64, 64, 64);
    stops.forEach(([at, col]) => grad.addColorStop(at, col));
    g2.fillStyle = grad;
    g2.fillRect(0, 0, 128, 128);
    const t = new THREE.CanvasTexture(c);
    t.encoding = THREE.sRGBEncoding;
    return t;
  };
  const glowTex = radialTexture([[0, "rgba(212,168,83,0.55)"], [0.35, "rgba(212,168,83,0.16)"], [1, "rgba(212,168,83,0)"]]);
  const glowMat = new THREE.SpriteMaterial({ map: glowTex, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false, transparent: true, opacity: 0.5 });
  const glow = new THREE.Sprite(glowMat);
  glow.scale.set(34, 34, 1);
  glow.renderOrder = -1;
  scene.add(glow);

  const DUST = 64;
  const dustPos = new Float32Array(DUST * 3);
  const dustSpeed = new Float32Array(DUST);
  // A fixed sequence, not Math.random: the dust looks the same on every visit.
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  for (let i = 0; i < DUST; i++) {
    dustPos[i * 3] = (rnd() - 0.5) * 44;
    dustPos[i * 3 + 1] = (rnd() - 0.5) * 52;
    dustPos[i * 3 + 2] = -16 + rnd() * 20;
    dustSpeed[i] = 0.25 + rnd() * 0.6;
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
  const dotTex = radialTexture([[0, "rgba(255,236,190,1)"], [0.4, "rgba(235,207,139,0.5)"], [1, "rgba(235,207,139,0)"]]);
  const dustMat = new THREE.PointsMaterial({ map: dotTex, size: 0.42, sizeAttenuation: true, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false });
  const dust = new THREE.Points(dustGeo, dustMat);
  dust.frustumCulled = false;
  scene.add(dust);

  // ── What the phone's own screen shows in each chapter. ──
  const NAVY = "#0A1628", INK = "#050B17", GOLD = "#D4A853", GOLDHI = "#EBCF8B", PAPER = "#F4F1E8", MIST = "#C3CBDA", LINE = "#2A3A58", CARD = "#11213C";
  const DISPLAY = `${o.fonts.display}, "Noto Sans Devanagari", system-ui, sans-serif`;
  const BODY = `${o.fonts.body}, "Noto Sans Devanagari", system-ui, sans-serif`;

  const rr = (x: number, y: number, w: number, h: number, r: number) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  };
  const text = (str: string, x: number, y: number, font: string, color: string, align: CanvasTextAlign = "left") => {
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.textBaseline = "alphabetic";
    ctx.fillText(str, x, y);
  };
  const check = (cx: number, cy: number, r: number, bg: string, fg: string) => {
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.fillStyle = bg; ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.42, cy + r * 0.02); ctx.lineTo(cx - r * 0.1, cy + r * 0.34); ctx.lineTo(cx + r * 0.46, cy - r * 0.3);
    ctx.lineWidth = r * 0.2; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.strokeStyle = fg; ctx.stroke();
  };
  const card = (x: number, y: number, w: number, h: number, on = false) => {
    rr(x, y, w, h, 28);
    ctx.fillStyle = on ? GOLD : CARD;
    ctx.fill();
    if (!on) { ctx.lineWidth = 2; ctx.strokeStyle = LINE; ctx.stroke(); }
  };
  const pill = (label: string) => {
    rr(60, 1010, CW - 120, 96, 48); ctx.fillStyle = GOLD; ctx.fill();
    text(label, CW / 2, 1072, `700 40px ${DISPLAY}`, INK, "center");
  };

  // Each screen's pieces arrive one after another: `enter(k, …)` draws the
  // k-th piece, faded and lifted according to how far the entrance has run.
  let entrance = 1;
  const enter = (k: number, fn: () => void) => {
    const e = easeOut(clamp(entrance * 2.1 - k * 0.24, 0, 1));
    if (e <= 0) return;
    ctx.save();
    ctx.globalAlpha = e;
    ctx.translate(0, (1 - e) * 36);
    fn();
    ctx.restore();
  };
  const frame = (title?: string, sub?: string) => {
    const g = ctx.createLinearGradient(0, 0, 0, CH);
    g.addColorStop(0, "#102445"); g.addColorStop(0.55, NAVY); g.addColorStop(1, INK);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, CW, CH);
    ctx.beginPath(); ctx.arc(CW / 2, 46, 13, 0, TAU); ctx.fillStyle = "#000"; ctx.fill();
    text("Credit Speed", 44, 138, `700 30px ${DISPLAY}`, GOLDHI);
    if (title) enter(0, () => text(title, 44, 236, `800 62px ${DISPLAY}`, PAPER));
    if (sub) enter(0.5, () => text(sub, 44, 284, `500 28px ${BODY}`, MIST));
  };

  const SCREENS: (() => void)[] = [
    () => {
      frame();
      enter(0, () => {
        ctx.beginPath(); ctx.arc(CW / 2, 520, 150, 0, TAU); ctx.lineWidth = 10; ctx.strokeStyle = GOLD; ctx.stroke();
        text("EMI", CW / 2, 552, `800 104px ${DISPLAY}`, PAPER, "center");
      });
      enter(1, () => text("नया फ़ोन", CW / 2, 800, `800 76px ${DISPLAY}`, PAPER, "center"));
      enter(1.5, () => text("आसान किस्तों पर", CW / 2, 866, `500 40px ${BODY}`, GOLDHI, "center"));
      enter(2.5, () => pill("शुरू करें"));
    },
    () => {
      frame("फ़ोन चुनें", "जो पसंद हो, वही");
      ([["बजट फ़ोन", false], ["5G फ़ोन", true], ["कैमरा फ़ोन", false]] as const).forEach(([label, on], i) =>
        enter(1 + i * 0.7, () => {
          const y = 350 + i * 200;
          card(40, y, CW - 80, 164, on);
          rr(68, y + 34, 60, 96, 12); ctx.fillStyle = on ? INK : LINE; ctx.fill();
          text(label, 156, y + 78, `700 40px ${DISPLAY}`, on ? INK : PAPER);
          text(on ? "चुना गया" : "देखें", 156, y + 124, `500 28px ${BODY}`, on ? INK : MIST);
        }),
      );
    },
    () => {
      frame("पहचान", "बस तीन चीज़ें");
      ["आधार", "पैन", "बैंक अकाउंट"].forEach((name, i) =>
        enter(1 + i * 0.7, () => {
          const y = 340 + i * 172;
          card(40, y, CW - 80, 140);
          text(name, 76, y + 88, `700 44px ${DISPLAY}`, PAPER);
          check(CW - 110, y + 70, 36, GOLD, INK);
        }),
      );
      enter(3.4, () => {
        rr(40, 880, CW - 80, 22, 11); ctx.fillStyle = LINE; ctx.fill();
        rr(40, 880, (CW - 80) * 0.82 * clamp(entrance * 1.2, 0.08, 1), 22, 11); ctx.fillStyle = GOLD; ctx.fill();
        text("जाँच हो रही है…", 44, 954, `500 32px ${BODY}`, MIST);
      });
    },
    () => {
      frame("किस्त चुनें", "कितने महीनों में चुकाएँगे");
      ([["6", false], ["8", true], ["10", false]] as const).forEach(([n, on], i) =>
        enter(1 + i * 0.5, () => {
          const w = (CW - 80 - 40) / 3, x = 40 + i * (w + 20);
          card(x, 370, w, 210, on);
          text(n, x + w / 2, 480, `800 92px ${DISPLAY}`, on ? INK : PAPER, "center");
          text("महीने", x + w / 2, 540, `500 30px ${BODY}`, on ? INK : MIST, "center");
        }),
      );
      enter(2.6, () => {
        card(40, 640, CW - 80, 170);
        text("डाउन पेमेंट", 76, 712, `700 40px ${DISPLAY}`, PAPER);
        text("दुकान पर दें", 76, 764, `500 30px ${BODY}`, MIST);
      });
      enter(3.4, () => pill("आगे बढ़ें"));
    },
    () => {
      frame();
      enter(0, () => check(CW / 2, 520, 150, GOLD, INK));
      enter(1, () => text("हो गया!", CW / 2, 800, `800 88px ${DISPLAY}`, PAPER, "center"));
      enter(1.6, () => text("फ़ोन आपका", CW / 2, 870, `500 42px ${BODY}`, GOLDHI, "center"));
    },
    // After the form is sent: the call that is coming.
    () => {
      frame();
      enter(0, () => {
        [230, 190].forEach((r, i) => {
          ctx.beginPath(); ctx.arc(CW / 2, 500, r, 0, TAU);
          ctx.lineWidth = 4; ctx.strokeStyle = i ? "rgba(212,168,83,0.5)" : "rgba(212,168,83,0.22)"; ctx.stroke();
        });
        ctx.beginPath(); ctx.arc(CW / 2, 500, 150, 0, TAU); ctx.fillStyle = GOLD; ctx.fill();
        // A telephone handset, from the Feather icon set (MIT licence), filled.
        ctx.save();
        ctx.translate(CW / 2 - 12 * 6.4, 500 - 12 * 6.4); ctx.scale(6.4, 6.4);
        ctx.fillStyle = INK;
        ctx.fill(new Path2D(HANDSET));
        ctx.restore();
      });
      enter(1, () => text("Credit Speed", CW / 2, 800, `800 68px ${DISPLAY}`, PAPER, "center"));
      enter(1.6, () => text("आपको कॉल करेगा", CW / 2, 868, `500 42px ${BODY}`, GOLDHI, "center"));
      enter(2.6, () => text("फ़ोन पास रखें", CW / 2, 1072, `500 34px ${BODY}`, MIST, "center"));
    },
  ];

  let shown = -1;
  const draw = (i: number) => {
    ctx.setTransform(TEX_W / CW, 0, 0, TEX_H / CH, 0, 0);
    ctx.globalAlpha = 1;
    SCREENS[i]();
    screenTex.needsUpdate = true;
    shown = i;
  };
  draw(0);

  let disposed = false;
  // The fonts arrive after the first drawing; redraw once they are in.
  if (document.fonts?.load) {
    Promise.all([document.fonts.load(`800 60px ${DISPLAY}`, "फ़ोन EMI"), document.fonts.load(`500 30px ${BODY}`, "किस्त")])
      .then(() => document.fonts.ready)
      .then(() => { if (!disposed) draw(shown < 0 ? 0 : shown); })
      .catch(() => {});
  }

  // ── Layout: where the phone sits for this window and this mode. ──
  let mode: SceneMode = "story";
  let wide = false;
  const home = { x: 0, y: 0, dist: 60, s: 1 };
  const resize = () => {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    wide = w >= 860 && w > h;
    const half = Math.tan(THREE.MathUtils.degToRad(15));
    if (wide) {
      home.dist = 46;
      home.y = 1.2;
      home.x = 0.42 * (half * home.dist * camera.aspect);
      home.s = 1;
    } else {
      // Portrait: fit the phone's width as well as its height, and keep it
      // clear of the words. The words take a fixed amount of room, so on a
      // short screen the phone gives way: smaller, its top edge held in place.
      home.dist = Math.max(68, (W * 1.5) / (2 * half * camera.aspect));
      home.x = 0;
      home.s = clamp(h / 800, 0.72, 1);
      const view = 2 * home.dist * half;
      home.y = (0.5 - 0.07 - (home.s * H) / (2 * view)) * view;
    }
    camera.position.set(0, 0, home.dist);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  };
  let freeTop = 0.3;
  /** Where the rig should be for the current mode: position and overall size. */
  const place = () => {
    if (mode === "story") return { x: home.x, y: home.y, s: home.s };
    if (wide) return { x: home.x, y: home.y, s: mode === "done" ? 0.96 : 0.9 };
    // A form is open below. Fit the phone into the band left above it:
    // four-fifths of the band's height, centred, never touching the top edge.
    const view = 2 * home.dist * Math.tan(THREE.MathUtils.degToRad(15));
    const band = clamp(freeTop, 0.1, 0.7);
    const s = clamp((band * 0.8 * view) / H, 0.28, 0.8);
    const centre = Math.max(band / 2, (s * H) / view / 2 + 0.03);
    return { x: 0, y: (0.5 - centre) * view, s };
  };
  const observer = typeof ResizeObserver === "function" ? new ResizeObserver(resize) : null;
  observer?.observe(canvas);
  window.addEventListener("resize", resize);
  resize();

  // ── Scroll → pose. ──
  const poseAt = (f: number): Pose => {
    const i = Math.min(poses.length - 2, Math.max(0, Math.floor(f)));
    const t = smooth(clamp(f - i, 0, 1));
    const a = poses[i], b = poses[i + 1];
    return { ry: a.ry + (b.ry - a.ry) * t, rx: a.rx + (b.rx - a.rx) * t, rz: a.rz + (b.rz - a.rz) * t, s: a.s + (b.s - a.s) * t };
  };
  const cur = poseAt(o.chapter());
  const at = { ...place() };
  let turns = 0; // whole turns carried over from a spin, so the story never unwinds one
  let held: Pose | null = null; // the pose while the form is open

  // ── Touch: a sideways drag spins the phone. ──
  let dragYaw = 0, dragVel = 0, dragging = false, pointerId = -1, startX = 0, startY = 0, lastX = 0, lastT = 0, decided = false;
  const interactive = "a,button,input,select,textarea,label,dialog,[role=button]";
  const onDown = (e: PointerEvent) => {
    if (reduce || mode !== "story" || !e.isPrimary || (e.target as Element | null)?.closest?.(interactive)) return;
    pointerId = e.pointerId; startX = lastX = e.clientX; startY = e.clientY; lastT = e.timeStamp; decided = false; dragging = false;
  };
  const onMove = (e: PointerEvent) => {
    if (e.pointerId !== pointerId) return;
    if (!decided) {
      const dx = Math.abs(e.clientX - startX), dy = Math.abs(e.clientY - startY);
      if (dx < 8 && dy < 8) return;
      decided = true;
      dragging = dx > dy * 1.2;
      if (!dragging) { pointerId = -1; return; }
    }
    const dx = e.clientX - lastX, dt = Math.max(1, e.timeStamp - lastT) / 1000;
    dragYaw = clamp(dragYaw + dx * 0.0075, -TAU, TAU);
    dragVel = clamp((dx * 0.0075) / dt, -14, 14);
    lastX = e.clientX; lastT = e.timeStamp;
  };
  const onUp = (e: PointerEvent) => {
    if (e.pointerId !== pointerId) return;
    pointerId = -1; dragging = false;
  };
  o.dragSurface.addEventListener("pointerdown", onDown);
  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", onUp);
  window.addEventListener("pointercancel", onUp);

  // ── A little parallax: the mouse on a computer, the handset's tilt on Android. ──
  const lookTo = { x: 0, y: 0 }, look = { x: 0, y: 0 };
  const onMouse = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    lookTo.x = (e.clientX / window.innerWidth) * 2 - 1;
    lookTo.y = (e.clientY / window.innerHeight) * 2 - 1;
  };
  let rest: { g: number; b: number } | null = null;
  const onTilt = (e: DeviceOrientationEvent) => {
    if (e.gamma == null || e.beta == null) return;
    if (!rest) rest = { g: e.gamma, b: e.beta };
    // The resting angle follows the hand slowly, so a new way of holding the phone becomes the new centre.
    rest.g += (e.gamma - rest.g) * 0.004;
    rest.b += (e.beta - rest.b) * 0.004;
    lookTo.x = clamp((e.gamma - rest.g) / 28, -1, 1);
    lookTo.y = clamp((e.beta - rest.b) / 28, -1, 1);
  };
  // iOS asks permission for motion data with a prompt; not worth interrupting anyone for. Android does not.
  const tiltOk =
    !reduce &&
    typeof DeviceOrientationEvent !== "undefined" &&
    typeof (DeviceOrientationEvent as unknown as { requestPermission?: unknown }).requestPermission !== "function";
  if (!reduce) window.addEventListener("pointermove", onMouse);
  if (tiltOk) window.addEventListener("deviceorientation", onTilt);

  // ── The loop. ──
  let raf = 0, running = !document.hidden, last = performance.now();
  let fade = 1, pulse = 0, intro = reduce ? 1 : 0, ringing = 0, lastF = o.chapter(), lean = 0, lastWhole = Math.round(lastF);
  let frames = 0, spent = 0, slow = false, tuned = false;

  const tick = (now: number) => {
    if (!running || disposed) return;
    raf = requestAnimationFrame(tick);
    const rawDt = (now - last) / 1000;
    const dt = Math.min(0.05, rawDt);
    last = now;
    const t = now / 1000;

    // Measure the first second and a half. A phone that cannot keep up gets a
    // lighter picture rather than a stuttering one.
    if (!tuned && intro >= 1) {
      frames++; spent += rawDt;
      if (frames >= 90) {
        tuned = true;
        const avg = spent / frames;
        if (avg > 0.024) {
          slow = true;
          pixelRatio = Math.min(dpr, avg > 0.04 ? 1 : 1.25);
          renderer.setPixelRatio(pixelRatio);
          resize();
          dust.visible = false;
        }
      }
    }

    const f = clamp(o.chapter(), 0, POSES.length - 1);
    const k = reduce ? 1 : 1 - Math.exp(-dt * 7);

    // Pose: from the story while reading, a held pose while the form is open.
    const story = poseAt(f);
    const target = held ?? { ...story, ry: story.ry + turns };
    cur.ry += (target.ry - cur.ry) * (held && !reduce ? 1 - Math.exp(-dt * 4.2) : k);
    cur.rx += (target.rx - cur.rx) * k;
    cur.rz += (target.rz - cur.rz) * k;
    cur.s += (target.s - cur.s) * k;

    const spot = place();
    at.x += (spot.x - at.x) * k;
    at.y += (spot.y - at.y) * k;
    at.s += (spot.s - at.s) * k;

    // Weight: lean into fast scrolling, then settle.
    const speed = dt > 0 ? (f - lastF) / dt : 0;
    lastF = f;
    lean += (clamp(speed * 0.085, -0.2, 0.2) - lean) * (1 - Math.exp(-dt * 6));

    // The drag springs home once the finger lifts.
    if (!dragging) {
      dragVel += (-46 * dragYaw - 9.5 * dragVel) * dt;
      dragYaw += dragVel * dt;
    }
    look.x += (lookTo.x - look.x) * (1 - Math.exp(-dt * 4));
    look.y += (lookTo.y - look.y) * (1 - Math.exp(-dt * 4));

    // The screen: swap its drawing behind a quick dim, then let the pieces arrive.
    const want = mode === "done" ? CALL_SCREEN : Math.round(f);
    if (want !== shown && reduce) {
      entrance = 1;
      draw(want);
    } else if (want !== shown) {
      fade -= dt * 9;
      if (fade <= 0.15) {
        fade = 0.15;
        entrance = reduce || slow ? 1 : 0;
        draw(want);
        pulse = 1;
      }
    } else {
      if (fade < 1) fade = Math.min(1, fade + dt * 6);
      if (entrance < 1) { entrance = Math.min(1, entrance + dt / 0.62); draw(shown); }
    }
    screenMat.color.setScalar(fade);

    const whole = Math.round(f);
    if (whole !== lastWhole) { lastWhole = whole; pulse = Math.max(pulse, 0.7); }
    pulse = Math.max(0, pulse - dt * 1.6);
    sheenMat.opacity = 0.16 + pulse * 0.2;

    if (intro < 1) intro = Math.min(1, intro + dt / 1.5);
    const arrive = easeOut(intro);
    ringing = Math.max(0, ringing - dt * 0.55);

    const bob = reduce ? 0 : Math.sin(t * 0.9) * 0.16;
    const sway = reduce ? 0 : Math.sin(t * 0.6) * 0.035;
    const buzz = ringing > 0 ? Math.sin(t * 46) * 0.022 * ringing : 0;

    phone.rotation.set(
      cur.rx + lean + look.y * 0.07,
      cur.ry + sway + dragYaw + look.x * 0.13 - (1 - arrive) * 2.2,
      cur.rz + buzz,
    );
    rig.scale.setScalar(cur.s * at.s * (0.82 + 0.18 * arrive));
    rig.position.set(at.x, at.y + bob - (1 - arrive) * 15, 0);

    glow.position.set(at.x, at.y + bob * 0.4, -7);
    const glowSize = 34 * at.s * (1 + pulse * 0.12);
    glow.scale.set(glowSize, glowSize, 1);
    glowMat.opacity = (0.42 + pulse * 0.3 + (reduce ? 0 : Math.sin(t * 0.7) * 0.05)) * arrive;

    if (dust.visible && !reduce) {
      for (let i = 0; i < DUST; i++) {
        let y = dustPos[i * 3 + 1] + dustSpeed[i] * dt + speed * dt * -1.6;
        if (y > 26) y -= 52; else if (y < -26) y += 52;
        dustPos[i * 3 + 1] = y;
      }
      (dustGeo.attributes.position as THREE.BufferAttribute).needsUpdate = true;
      dust.position.x = look.x * -0.8;
      dustMat.opacity = 0.55 * arrive;
    }

    renderer.render(scene, camera);
  };

  const onVisibility = () => {
    running = !document.hidden;
    if (running && !disposed) { last = performance.now(); cancelAnimationFrame(raf); raf = requestAnimationFrame(tick); }
  };
  document.addEventListener("visibilitychange", onVisibility);

  const onLost = (e: Event) => { e.preventDefault(); o.onContextLost(); };
  canvas.addEventListener("webglcontextlost", onLost);

  if (running) raf = requestAnimationFrame(tick);

  return {
    setMode(next, free) {
      if (disposed) return;
      if (typeof free === "number" && Number.isFinite(free)) freeTop = free;
      if (next === mode) return;
      const from = mode;
      mode = next;
      dragging = false; pointerId = -1;
      if (next === "story") {
        // Carry whole turns over, so going back to the story never unwinds a spin.
        const story = poseAt(clamp(o.chapter(), 0, POSES.length - 1));
        turns = TAU * Math.round((cur.ry - story.ry) / TAU);
        held = null;
      } else if (next === "sheet") {
        held = { ry: nearestTurn(cur.ry, -0.3), rx: 0.2, rz: 0.03, s: 1 };
      } else {
        // Sent: one full, unhurried turn, then face the reader and ring.
        const facing = nearestTurn(cur.ry, 0);
        held = { ry: reduce || from === "done" ? facing : facing + TAU, rx: 0.06, rz: 0, s: 1 };
        ringing = reduce ? 0 : 1;
        pulse = 1;
      }
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      cancelAnimationFrame(raf);
      observer?.disconnect();
      window.removeEventListener("resize", resize);
      o.dragSurface.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      window.removeEventListener("pointermove", onMouse);
      window.removeEventListener("deviceorientation", onTilt);
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("webglcontextlost", onLost);
      scene.traverse((obj) => {
        const m = obj as THREE.Mesh;
        m.geometry?.dispose?.();
        const mats = Array.isArray(m.material) ? m.material : m.material ? [m.material] : [];
        mats.forEach((mat) => mat.dispose());
      });
      [envTex, screenTex, glowTex, dotTex].forEach((tex) => tex.dispose());
      renderer.dispose();
    },
  };
}
