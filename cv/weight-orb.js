/* Illustrative weights morph from a sphere to a Dala horse, then a JAS Gripen. */
(() => {
  'use strict';
  const orb = document.getElementById('weight-orb');
  if (!orb) return;
  const canvas = orb.querySelector('canvas');
  const context = canvas.getContext('2d');
  if (!context) return;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  let size = 0;
  let points = [];
  let yaw = 0.35;
  let pitch = -0.25;
  let velocityX = 0;
  let velocityY = 0;
  let paused = motion.matches;
  let visible = true;
  let frame = null;
  let lastTime = null;
  let drag = null;
  let dragged = false;
  let hovered = false;
  let morph = 0;
  let flightMorph = 0;
  let idlePhase = 0;

  function halton(index, base) {
    let value = 0, fraction = 1;
    for (let n = index; n > 0; n = Math.floor(n / base)) {
      fraction /= base;
      value += fraction * (n % base);
    }
    return value;
  }
  function inside(x, y, polygon) {
    let hit = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const a = polygon[i], b = polygon[j];
      if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) hit = !hit;
    }
    return hit;
  }
  function horsePoints(count) {
    // Carved body, upright ear, sloped muzzle and four individually offset legs.
    const pieces = [
      {share: 0.62, z: 0, depth: 0.29, outline: [[-0.93,0.08],[-0.9,0.28],[-0.79,0.43],[-0.62,0.48],[-0.2,0.46],[0.1,0.45],[0.32,0.82],[0.55,0.97],[0.7,0.99],[0.84,1.18],[0.96,1.2],[0.94,0.84],[1.2,0.48],[1.25,0.38],[1.22,0.25],[1.11,0.19],[0.88,0.28],[0.78,0.37],[0.7,0.13],[0.65,-0.25],[0.43,-0.4],[0.06,-0.43],[-0.34,-0.37],[-0.65,-0.26],[-0.86,-0.26]]},
      {share: 0.12, z: 0.25, depth: 0.1, outline: [[-0.86,-0.11],[-0.57,-0.15],[-0.78,-1.15],[-0.98,-1.15]]},
      {share: 0.1, z: 0.25, depth: 0.1, outline: [[0.43,-0.2],[0.73,-0.18],[0.68,-1.18],[0.47,-1.18]]},
      {share: 0.08, z: -0.25, depth: 0.09, outline: [[-0.66,-0.23],[-0.43,-0.28],[-0.49,-1.05],[-0.67,-1.05]]},
      {share: 0.08, z: -0.25, depth: 0.09, outline: [[0.68,-0.1],[0.86,-0.12],[0.86,-1.08],[0.71,-1.08]]}
    ];
    const result = [];
    let sequence = 1;
    pieces.forEach((piece, part) => {
      const amount = part === pieces.length - 1 ? count - result.length : Math.floor(count * piece.share);
      const polygon = piece.outline;
      const minX = Math.min(...polygon.map(p => p[0])), maxX = Math.max(...polygon.map(p => p[0]));
      const minY = Math.min(...polygon.map(p => p[1])), maxY = Math.max(...polygon.map(p => p[1]));
      const edges = polygon.map((a, i) => {
        const b = polygon[(i + 1) % polygon.length];
        return {a, b, length: Math.hypot(b[0] - a[0], b[1] - a[1])};
      });
      const perimeter = edges.reduce((sum, edge) => sum + edge.length, 0);
      for (let i = 0; i < amount; i++) {
        let x, y, z;
        if (i % 5 === 0) {
          let distance = halton(sequence++, 5) * perimeter;
          const edge = edges.find(edge => { if (distance <= edge.length) return true; distance -= edge.length; return false; }) || edges[0];
          const t = distance / edge.length;
          x = edge.a[0] + t * (edge.b[0] - edge.a[0]);
          y = edge.a[1] + t * (edge.b[1] - edge.a[1]);
          z = piece.z + (halton(sequence, 7) * 2 - 1) * piece.depth;
        } else {
          do {
            x = minX + halton(sequence, 2) * (maxX - minX);
            y = minY + halton(sequence++, 3) * (maxY - minY);
          } while (!inside(x, y, polygon));
          z = piece.z + (i % 2 ? 1 : -1) * piece.depth;
        }
        result.push({x: (x - 0.135) * 0.78, y: -(y - 0.01) * 0.78, z: z * 0.78});
      }
    });
    return result.sort((a, b) => a.y - b.y || a.x - b.x);
  }
  function gripenPoints(count) {
    // A sculptural silhouette: tapered fuselage, swept delta wings, canards and one fin.
    // x runs from tail to nose, y is vertical and z runs from wingtip to wingtip.
    const result = [];
    const bodyCount = Math.floor(count * 0.28);
    const stations = [[-1.16,0.085],[-1.02,0.115],[-0.62,0.145],[-0.15,0.14],[0.28,0.115],[0.59,0.09],[0.91,0.048],[1.28,0.002]];
    for (let i = 0; i < bodyCount; i++) {
      const x = -1.16 + halton(i + 1, 2) * 2.44;
      const end = stations.findIndex(station => station[0] >= x);
      const a = stations[end - 1], b = stations[end];
      const t = (x - a[0]) / (b[0] - a[0]);
      const radius = a[1] + (b[1] - a[1]) * t;
      const angle = halton(i + 1, 3) * Math.PI * 2;
      result.push({x, y: 0.02 + Math.sin(angle) * radius * 0.9, z: Math.cos(angle) * radius});
    }
    const wing = [[0.22,0.12],[-0.69,0.94],[-0.89,0.94],[-0.8,0.12]];
    const canard = [[0.64,0.095],[0.27,0.43],[0.12,0.41],[0.28,0.11]];
    const pieces = [
      {share:0.21, outline:wing, point:(x,z,i)=>({x,y:0.055 + (i % 2 ? 0.012 : -0.012),z})},
      {share:0.21, outline:wing, point:(x,z,i)=>({x,y:0.055 + (i % 2 ? 0.012 : -0.012),z:-z})},
      {share:0.055, outline:canard, point:(x,z,i)=>({x,y:-0.075 + (i % 2 ? 0.008 : -0.008),z})},
      {share:0.055, outline:canard, point:(x,z,i)=>({x,y:-0.075 + (i % 2 ? 0.008 : -0.008),z:-z})},
      {share:0.075, outline:[[-0.34,-0.09],[-0.83,-0.57],[-1.09,-0.58],[-1.04,-0.06]], point:(x,y,i)=>({x,y,z:i % 2 ? 0.012 : -0.012})}
    ];
    let sequence = 1;
    for (const piece of pieces) {
      const polygon = piece.outline;
      const minX = Math.min(...polygon.map(p => p[0])), maxX = Math.max(...polygon.map(p => p[0]));
      const minY = Math.min(...polygon.map(p => p[1])), maxY = Math.max(...polygon.map(p => p[1]));
      const edges = polygon.map((a,i) => {
        const b = polygon[(i + 1) % polygon.length];
        return {a,b,length:Math.hypot(b[0] - a[0],b[1] - a[1])};
      });
      const perimeter = edges.reduce((sum,edge) => sum + edge.length,0);
      const amount = Math.floor(count * piece.share);
      for (let i = 0; i < amount; i++) {
        let x, y;
        if (i % 4 === 0) {
          let distance = halton(sequence++,5) * perimeter;
          const edge = edges.find(edge => {if (distance <= edge.length) return true; distance -= edge.length; return false;}) || edges[0];
          const t = distance / edge.length;
          x = edge.a[0] + (edge.b[0] - edge.a[0]) * t;
          y = edge.a[1] + (edge.b[1] - edge.a[1]) * t;
        } else {
          do {
            x = minX + halton(sequence,2) * (maxX - minX);
            y = minY + halton(sequence++,3) * (maxY - minY);
          } while (!inside(x,y,polygon));
        }
        result.push(piece.point(x,y,i));
      }
    }
    const canopyCount = Math.floor(count * 0.065);
    for (let i = 0; i < canopyCount; i++) {
      const t = halton(i + 1,2), angle = halton(i + 1,3) * Math.PI;
      const arch = Math.sin(Math.PI * t);
      result.push({x:0.02 + t * 0.66,y:-0.095 - Math.sin(angle) * arch * 0.13,z:Math.cos(angle) * arch * 0.092});
    }
    const railCount = count - result.length;
    for (let i = 0; i < railCount; i++) {
      const side = i % 2 ? 1 : -1;
      result.push({x:-0.98 + halton(Math.floor(i / 2) + 1,2) * 0.46,y:0.045,z:side * (0.94 + (i % 3 - 1) * 0.01)});
    }
    return result.map(point => ({x:point.x * 0.9,y:(point.y + 0.06) * 0.9,z:point.z * 0.9}))
      .sort((a,b) => (a.y + a.z) - (b.y + b.z) || a.x - b.x);
  }
  function readScroll() {
    const scroll = window.scrollY || 0;
    const height = window.innerHeight || 800;
    const scrollRoom = Math.max(0, document.documentElement.scrollHeight - height);
    const end = Math.min(Math.max(320, Math.min(height * 0.6, 500)), Math.max(1, scrollRoom * 0.38));
    const start = Math.min(80, end * 0.2);
    const progress = clamp((scroll - start) / (end - start), 0, 1);
    morph = motion.matches ? (progress >= 0.5 ? 1 : 0) : progress * progress * (3 - 2 * progress);
    // Keep the horse through Education. Reveal the aircraft as Projects approaches.
    const projects = document.getElementById('projects');
    const projectTop = projects ? projects.getBoundingClientRect().top + scroll : end + 850;
    const flightEnd = Math.min(Math.max(end + 620, projectTop - height * 0.25), Math.max(end + 1, scrollRoom - 24));
    const flightStart = Math.max(end + (flightEnd - end) * 0.28, flightEnd - 400);
    const flightProgress = clamp((scroll - flightStart) / (flightEnd - flightStart), 0, 1);
    flightMorph = motion.matches ? (flightProgress >= 0.5 ? 1 : 0) : flightProgress * flightProgress * (3 - 2 * flightProgress);
    const shape = flightMorph > 0.99 ? 'jas-gripen' : flightMorph > 0.01 ? 'horse-to-gripen' : morph < 0.01 ? 'sphere' : morph > 0.99 ? 'dala-horse' : 'transition';
    orb.setAttribute('data-shape', shape);
  }

  function draw() {
    if (!size) return;
    context.clearRect(0, 0, size, size);
    const scenePitch = pitch + 0.17 * morph - 0.82 * flightMorph;
    const sceneYaw = yaw + idlePhase - 0.7 * morph;
    const sx = Math.sin(scenePitch), cx = Math.cos(scenePitch);
    const sy = Math.sin(sceneYaw), cy = Math.cos(sceneYaw);
    const radius = size * 0.39;
    const projected = points.map(point => {
      const hx = point.x + (point.horse.x - point.x) * morph;
      const hy = point.y + (point.horse.y - point.y) * morph;
      const hz = point.z + (point.horse.z - point.z) * morph;
      const px = hx + (point.gripen.x - hx) * flightMorph;
      const py = hy + (point.gripen.y - hy) * flightMorph;
      const pz = hz + (point.gripen.z - hz) * flightMorph;
      const x = px * cy + pz * sy;
      const z = pz * cy - px * sy;
      return {x, y: py * cx - z * sx, z: py * sx + z * cx, text: point.text};
    }).sort((a, b) => a.z - b.z);
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    for (const point of projected) {
      const depth = (point.z + 1) / 2;
      const perspective = 3 / (3 - point.z * 0.23);
      const alpha = 0.065 + depth * depth * (hovered || drag ? 0.61 : 0.43);
      const fontSize = clamp(size / 33, 5.5, 9.5) * (0.88 + depth * 0.16);
      context.font = `${fontSize.toFixed(2)}px ui-monospace, SFMono-Regular, Consolas, monospace`;
      context.fillStyle = `rgba(70,70,70,${alpha.toFixed(3)})`;
      context.fillText(point.text, size / 2 + point.x * radius * perspective, size / 2 + point.y * radius * perspective);
    }
  }

  function stop() {
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
    lastTime = null;
  }
  function requestFrame() {
    if (frame === null && visible && document.visibilityState !== 'hidden') {
      frame = requestAnimationFrame(animate);
    }
  }
  function animate(now) {
    frame = null;
    if (!visible || document.visibilityState === 'hidden') { lastTime = null; return; }
    const dt = lastTime === null ? 0 : Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;
    if (!drag) {
      idlePhase += (paused ? 0 : 0.075) * dt;
      yaw += velocityX * dt;
      pitch += velocityY * dt;
      const decay = Math.pow(0.92, dt * 60);
      velocityX *= decay;
      velocityY *= decay;
      if (Math.abs(velocityX) < 0.005) velocityX = 0;
      if (Math.abs(velocityY) < 0.005) velocityY = 0;
    }
    draw();
    if (!paused || velocityX || velocityY) requestFrame();
    else lastTime = null;
  }
  function setPaused(value) {
    paused = value;
    velocityX = velocityY = 0;
    orb.setAttribute('aria-pressed', String(paused));
    stop();
    draw();
    if (!paused) requestFrame();
  }
  function resize() {
    size = orb.getBoundingClientRect().width;
    if (!size) return;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(size * ratio);
    canvas.height = Math.round(size * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    const count = clamp(Math.round(size * size / 200), 112, 800);
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    const horse = horsePoints(count);
    const gripen = gripenPoints(count);
    points = Array.from({length: count}, (_, i) => {
      const y = 1 - 2 * (i + 0.5) / count;
      const ring = Math.sqrt(1 - y * y);
      const angle = i * goldenAngle;
      // Stable illustrative values, not a claim about a trained model.
      const weight = Math.sin(i * 127.1 + 19.7) * 0.48 + Math.cos(i * 31.3) * 0.21;
      return {x: ring * Math.cos(angle), y, z: ring * Math.sin(angle), horse: horse[count - 1 - i], gripen: gripen[count - 1 - i], text: (Math.abs(weight) < 0.005 ? 0 : weight).toFixed(2)};
    });
    readScroll();
    draw();
  }

  orb.addEventListener('pointerdown', event => {
    if (event.button !== 0 || drag) return;
    drag = {id: event.pointerId, x: event.clientX, y: event.clientY, distance: 0, time: event.timeStamp};
    dragged = false;
    velocityX = velocityY = 0;
    orb.setPointerCapture(event.pointerId);
    orb.classList.add('is-dragging');
  });
  orb.addEventListener('pointermove', event => {
    if (!drag || event.pointerId !== drag.id) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    const dt = Math.max((event.timeStamp - drag.time) / 1000, 1 / 120);
    const factor = 4.4 / size;
    yaw += dx * factor;
    pitch += dy * factor;
    drag.distance += Math.hypot(dx, dy);
    dragged = drag.distance > 4;
    velocityX = motion.matches ? 0 : clamp(dx * factor / dt, -4, 4);
    velocityY = motion.matches ? 0 : clamp(dy * factor / dt, -4, 4);
    drag.x = event.clientX; drag.y = event.clientY; drag.time = event.timeStamp;
    draw();
  });
  function endDrag(event) {
    if (!drag || event.pointerId !== drag.id) return;
    if (event.type === 'pointercancel') velocityX = velocityY = 0;
    drag = null;
    orb.classList.remove('is-dragging');
    if (orb.hasPointerCapture(event.pointerId)) orb.releasePointerCapture(event.pointerId);
    requestFrame();
  }
  orb.addEventListener('pointerup', endDrag);
  orb.addEventListener('pointercancel', endDrag);
  orb.addEventListener('lostpointercapture', endDrag);
  orb.addEventListener('click', event => {
    if (dragged && event.detail !== 0) { dragged = false; return; }
    setPaused(!paused);
  });
  orb.addEventListener('keydown', event => {
    const directions = {ArrowLeft: [-0.18, 0], ArrowRight: [0.18, 0], ArrowUp: [0, -0.18], ArrowDown: [0, 0.18]};
    const direction = directions[event.key];
    if (!direction) return;
    event.preventDefault();
    setPaused(true);
    yaw += direction[0]; pitch += direction[1];
    draw();
  });
  orb.addEventListener('pointerenter', () => { hovered = true; draw(); });
  orb.addEventListener('pointerleave', () => { hovered = false; draw(); });
  orb.addEventListener('focus', () => { hovered = true; draw(); });
  orb.addEventListener('blur', () => { hovered = false; draw(); });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') stop();
    else if (!paused || velocityX || velocityY) requestFrame();
  });
  motion.addEventListener('change', event => { readScroll(); setPaused(event.matches); });
  window.addEventListener('scroll', () => { readScroll(); requestFrame(); }, {passive: true});
  window.addEventListener('pageshow', () => { if (!paused) requestFrame(); });
  orb.hidden = false;
  resize();
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(orb);
  else window.addEventListener('resize', resize, {passive: true});
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      if (!visible) stop();
      else if (!paused || velocityX || velocityY) requestFrame();
    }).observe(orb);
  }
  setPaused(paused);
})();
