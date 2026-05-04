/* =============================================
   PREMIUM PORTFOLIO — main.js
   Three.js + Interactive 3D + Scroll Reveals
   ============================================= */

// ─── LOADER ────────────────────────────────────────
window.addEventListener('load', () => {
  setTimeout(() => {
    const loader = document.getElementById('loader');
    loader.classList.add('hidden');
    setTimeout(() => loader.remove(), 700);
    initReveal();
  }, 2000);
});

// ─── CUSTOM CURSOR ─────────────────────────────────
const cursor = document.getElementById('cursor');
const cursorTrail = document.getElementById('cursorTrail');
let mx = 0, my = 0;

document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  cursor.style.left = mx + 'px';
  cursor.style.top = my + 'px';
  setTimeout(() => {
    cursorTrail.style.left = mx + 'px';
    cursorTrail.style.top = my + 'px';
  }, 60);
});

// ─── THREE.JS SCENE ────────────────────────────────
const canvas = document.getElementById('three-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 0);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 6);

// ── Lighting ──
const ambient = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambient);

const pLight1 = new THREE.PointLight(0x00f5c4, 6, 20);
pLight1.position.set(4, 4, 4);
scene.add(pLight1);

const pLight2 = new THREE.PointLight(0x7b5ea7, 4, 20);
pLight2.position.set(-4, -4, 2);
scene.add(pLight2);

const pLight3 = new THREE.PointLight(0xffffff, 2, 20);
pLight3.position.set(0, 6, -4);
scene.add(pLight3);

// ── Main Knot ──
const knotGeo = new THREE.TorusKnotGeometry(1.2, 0.35, 180, 28);
const knotMat = new THREE.MeshPhysicalMaterial({
  color: 0x00f5c4,
  metalness: 0.7,
  roughness: 0.1,
  clearcoat: 1.0,
  clearcoatRoughness: 0.05,
  emissive: new THREE.Color(0x00f5c4),
  emissiveIntensity: 0.08,
  wireframe: false,
});
const knot = new THREE.Mesh(knotGeo, knotMat);
scene.add(knot);

// ── Wireframe overlay ──
const knotWireMat = new THREE.MeshBasicMaterial({ color: 0x00f5c4, wireframe: true, transparent: true, opacity: 0.04 });
const knotWire = new THREE.Mesh(knotGeo, knotWireMat);
scene.add(knotWire);

// ── Stars ──
const starGeo = new THREE.BufferGeometry();
const starCount = 1800;
const starPos = new Float32Array(starCount * 3);
const starSizes = new Float32Array(starCount);
for (let i = 0; i < starCount; i++) {
  starPos[i * 3 + 0] = (Math.random() - 0.5) * 80;
  starPos[i * 3 + 1] = (Math.random() - 0.5) * 80;
  starPos[i * 3 + 2] = (Math.random() - 0.5) * 80;
  starSizes[i] = Math.random() * 2 + 0.5;
}
starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
starGeo.setAttribute('size', new THREE.BufferAttribute(starSizes, 1));
const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.04, transparent: true, opacity: 0.6, sizeAttenuation: true });
const stars = new THREE.Points(starGeo, starMat);
scene.add(stars);

// ── Floating Rings ──
const rings = [];
const ringColors = [0x00f5c4, 0x7b5ea7, 0xffffff];
for (let i = 0; i < 3; i++) {
  const rg = new THREE.TorusGeometry(2.2 + i * 0.6, 0.008, 8, 100);
  const rm = new THREE.MeshBasicMaterial({ color: ringColors[i], transparent: true, opacity: 0.12 - i * 0.03 });
  const ring = new THREE.Mesh(rg, rm);
  ring.rotation.x = Math.PI / 2 + i * 0.3;
  ring.rotation.y = i * 0.5;
  rings.push(ring);
  scene.add(ring);
}

// ── Floating Particles ──
const floatGeo = new THREE.BufferGeometry();
const floatCount = 120;
const floatPos = new Float32Array(floatCount * 3);
for (let i = 0; i < floatCount; i++) {
  floatPos[i * 3 + 0] = (Math.random() - 0.5) * 12;
  floatPos[i * 3 + 1] = (Math.random() - 0.5) * 12;
  floatPos[i * 3 + 2] = (Math.random() - 0.5) * 6;
}
floatGeo.setAttribute('position', new THREE.BufferAttribute(floatPos, 3));
const floatMat = new THREE.PointsMaterial({ color: 0x00f5c4, size: 0.06, transparent: true, opacity: 0.5 });
const floatParticles = new THREE.Points(floatGeo, floatMat);
scene.add(floatParticles);

// ─── MOUSE INTERACTION ─────────────────────────────
let targetX = 0, targetY = 0;
let mouseX = 0, mouseY = 0;
document.addEventListener('mousemove', e => {
  mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
  mouseY = -(e.clientY / window.innerHeight - 0.5) * 2;
});

// ─── SCROLL CAMERA ─────────────────────────────────
let scrollY = 0;
window.addEventListener('scroll', () => { scrollY = window.scrollY; });

// ─── ANIMATE ────────────────────────────────────────
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();

  // Smooth mouse follow
  targetX += (mouseX - targetX) * 0.05;
  targetY += (mouseY - targetY) * 0.05;

  // Knot rotation
  knot.rotation.x += 0.003 + targetY * 0.002;
  knot.rotation.y += 0.005 + targetX * 0.003;
  knotWire.rotation.copy(knot.rotation);

  // Breathing scale
  const breathe = 1 + Math.sin(t * 0.8) * 0.025;
  knot.scale.setScalar(breathe);
  knotWire.scale.setScalar(breathe * 1.002);

  // Light orbiting
  pLight1.position.x = Math.cos(t * 0.5) * 5;
  pLight1.position.z = Math.sin(t * 0.5) * 5;
  pLight2.position.x = Math.cos(t * 0.3 + Math.PI) * 5;
  pLight2.position.z = Math.sin(t * 0.3 + Math.PI) * 5;

  // Rings
  rings[0].rotation.z += 0.004;
  rings[1].rotation.x += 0.003;
  rings[2].rotation.y += 0.002;

  // Floating particles drift
  floatParticles.rotation.y += 0.0005;
  floatParticles.rotation.x = targetY * 0.2;

  // Stars slow drift
  stars.rotation.y += 0.0001;
  stars.rotation.x = targetY * 0.05;

  // Camera responds to scroll + mouse
  camera.position.y = -scrollY * 0.003;
  camera.position.x += (targetX * 0.6 - camera.position.x) * 0.04;
  camera.lookAt(scene.position);

  // Knot scroll fade
  const heroHeight = window.innerHeight;
  const fade = Math.max(0, 1 - scrollY / (heroHeight * 1.2));
  knot.material.opacity = fade;
  knot.material.transparent = true;
  knotWire.material.opacity = 0.04 * fade;

  renderer.render(scene, camera);
}
animate();

// ─── RESIZE ─────────────────────────────────────────
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ─── SCROLL REVEALS ─────────────────────────────────
function initReveal() {
  const els = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
      }
    });
  }, { threshold: 0.15 });
  els.forEach(el => obs.observe(el));

  // Trigger hero immediately
  document.querySelectorAll('#hero .reveal-up').forEach(el => {
    setTimeout(() => el.classList.add('revealed'), 100);
  });
}

// ─── NAV SCROLL EFFECTS ──────────────────────────────
const navbar = document.getElementById('navbar');
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section[id]');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);

  // Active nav link
  let current = '';
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 200) current = s.id;
  });
  navLinks.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === '#' + current);
  });
});

// ─── 3D TILT CARDS ──────────────────────────────────
document.querySelectorAll('[data-tilt]').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    card.style.transform = `perspective(1000px) rotateY(${dx * 10}deg) rotateX(${-dy * 8}deg) scale3d(1.03,1.03,1.03)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg) scale3d(1,1,1)';
  });
});

// ─── ABOUT CARD 3D TILT ──────────────────────────────
const aboutCard = document.getElementById('aboutCard');
if (aboutCard) {
  aboutCard.addEventListener('mousemove', e => {
    const rect = aboutCard.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    aboutCard.querySelector('.about-card-inner').style.transform =
      `perspective(600px) rotateY(${dx * 18}deg) rotateX(${-dy * 12}deg)`;
  });
  aboutCard.addEventListener('mouseleave', () => {
    aboutCard.querySelector('.about-card-inner').style.transform = '';
  });
}

// ─── SKILL BAR ANIMATION ────────────────────────────
const skillObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animated');
    }
  });
}, { threshold: 0.3 });
document.querySelectorAll('.skill-item').forEach(el => skillObs.observe(el));

// ─── SMOOTH SCROLL (for older browsers) ─────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  });
});
