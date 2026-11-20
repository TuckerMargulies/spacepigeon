// Generated from the design canvas by the export script — the 3D renderer for every page.
// Canvases opt in with data-sp-scene="0..3"; data-sp-bg="1" on scene 0 draws only space (no pigeon).
class DCLogic {
  constructor() { this.props = { accent: '#FF6B2C', shell42: '#5DC4A0', autoRotate: true }; }
}
class Component extends DCLogic {
  renderVals() {
    return {
      accent: this.props.accent ?? '#FF6B2C',
      heroRef: this._ref(0),
      r72: this._ref(1),
      r42: this._ref(2),
      patchRef: this._ref(3)
    };
  }

  componentDidMount() {
    this._alive = true;
    this._start = performance.now();
    this._views = this._views || [];
    var self = this;
    setTimeout(function () {
      var list = document.querySelectorAll('canvas[data-sp-scene]');
      for (var i = 0; i < list.length; i++) self._attach(+list[i].getAttribute('data-sp-scene'), list[i]);
    }, 60);
    this._loop();
  }

  componentWillUnmount() {
    this._alive = false;
    cancelAnimationFrame(this._raf);
    this._raf = 0;
    (this._views || []).forEach(function (v) { if (v.io) v.io.disconnect(); });
    this._views = [];
  }

  _ref(scene) {
    this._refs = this._refs || {};
    var self = this;
    if (!this._refs[scene]) this._refs[scene] = function (el) { self._attach(scene, el); };
    return this._refs[scene];
  }

  _lin(hex) {
    var h = String(hex || '#ffffff').replace('#', '');
    if (h.length === 3) h = h.split('').map(function (c) { return c + c; }).join('');
    var n = parseInt(h.slice(0, 6), 16) || 0;
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(function (x) { return Math.pow(x / 255, 2.2); });
  }

  /* Side livery for a helmet: model number, maker, spec lines, barcode, hazard block, scale ticks. */
  _decal(scene) {
    var c = document.createElement('canvas');
    c.width = 1024; c.height = 512;
    var x = c.getContext('2d');
    var model = scene === 2 ? 'SPH42' : 'SPH72';
    var use = scene === 2 ? 'LOW EARTH ORBIT' : 'INTER-PLANETARY';
    var ink = 'rgba(22,24,30,0.92)';
    var accent = (this.props && this.props.accent) || '#FF6B2C';
    x.clearRect(0, 0, 1024, 512);
    x.fillStyle = ink;
    x.textBaseline = 'alphabetic';
    x.font = '800 196px Unbounded, "Arial Black", sans-serif';
    x.fillText(model, 22, 226);
    x.fillRect(28, 258, 690, 6);
    x.font = '500 40px "JetBrains Mono", monospace';
    x.fillText('SPACE PIGEON', 28, 326);
    x.font = '400 33px "JetBrains Mono", monospace';
    x.fillText('FIT: DOVE', 28, 388);
    x.fillText('USE: ' + use, 28, 440);
    var bx = 762, seed = scene * 7 + 3;
    for (var i = 0; i < 60 && bx < 990; i++) {
      seed = (seed * 9301 + 49297) % 233280;
      var w = 2 + Math.floor(seed / 233280 * 7);
      if (i % 3 !== 2) x.fillRect(bx, 300, w, 140);
      bx += w + 3;
    }
    x.save();
    x.beginPath(); x.rect(762, 40, 230, 70); x.clip();
    x.fillStyle = scene === 2 ? ink : accent; x.fillRect(762, 40, 230, 70);
    x.fillStyle = scene === 2 ? 'rgba(240,240,236,0.95)' : ink;
    for (var k = -3; k < 10; k++) {
      x.beginPath();
      x.moveTo(762 + k * 40, 110); x.lineTo(782 + k * 40, 110); x.lineTo(822 + k * 40, 40); x.lineTo(802 + k * 40, 40);
      x.closePath(); x.fill();
    }
    x.restore();
    x.fillStyle = ink;
    x.fillRect(762, 150, 230, 3);
    for (var j = 0; j <= 8; j++) x.fillRect(762 + j * 28.5, 150, 3, j % 4 ? 14 : 28);
    x.font = '500 26px "JetBrains Mono", monospace';
    x.fillText('DV-' + (scene === 2 ? '042' : '072'), 762, 232);
    return c;
  }

  _texture(gl, unit) {
    var tex = gl.createTexture();
    gl.activeTexture(unit);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255]));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.activeTexture(gl.TEXTURE0);
    return tex;
  }

  /* mip: true for colour (mipmapped); false for the distance field, which is read inside the raymarch loop. */
  _loadInto(gl, tex, unit, url, mip, done) {
    var img = new Image();
    img.onload = function () {
      gl.activeTexture(unit);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      if (mip) { gl.generateMipmap(gl.TEXTURE_2D); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); }
      gl.activeTexture(gl.TEXTURE0);
      done();
    };
    img.src = url;
  }

  _uploadCanvas(v, canvas) {
    var gl = v.gl;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, v.tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    v.texOn = 1;
  }

  _attach(scene, el) {
    this._views = this._views || [];
    if (!el) { this._views = this._views.filter(function (v) { return v.scene !== scene || document.contains(v.el); }); return; }
    for (var i = 0; i < this._views.length; i++) if (this._views[i].el === el) return;
    var gl = el.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'high-performance' });
    if (!gl) return;
    var compile = function (type, src) {
      var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.warn('[spacepigeon]', gl.getShaderInfoLog(s));
      return s;
    };
    var prog = gl.createProgram();
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, 'attribute vec2 aPos;void main(){gl_Position=vec4(aPos,0.,1.);}'));
    var fdx = scene === 0 ? gl.getExtension('EXT_frag_depth') : null;
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, (fdx ? '#extension GL_EXT_frag_depth : enable\n#define FRAGDEPTH 1\n' : '') + this._fs()));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { console.warn('[spacepigeon]', gl.getProgramInfoLog(prog)); return; }
    gl.useProgram(prog);
    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var al = gl.getAttribLocation(prog, 'aPos');
    gl.enableVertexAttribArray(al);
    gl.vertexAttribPointer(al, 2, gl.FLOAT, false, 0, 0);
    var u = {};
    ['uRes', 'uTime', 'uScene', 'uRot', 'uOff', 'uShift', 'uDist', 'uShell', 'uAccent', 'uVisor', 'uTex', 'uTexOn', 'uPass', 'uTex2', 'uTex3', 'uTex2On', 'uStack'].forEach(function (n) { u[n] = gl.getUniformLocation(prog, n); });
    var v = { scene: scene, el: el, gl: gl, u: u, yaw: 0, pitch: 0, vel: 0, drag: false, px: 0, py: 0, visible: true, texOn: 0, prog: prog, fsBuf: buf, al: al, fdx: !!fdx, mesh: null };
    if (scene === 0) this._loadMesh(v, compile);

    v.tex = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, v.tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([10, 10, 12, 0]));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    var self = this;
    if (scene === 3) {
      var img = new Image();
      img.onload = function () { self._uploadCanvas(v, img); };
      img.src = '/assets/patch-round.jpg';
      v.tex2 = this._texture(gl, gl.TEXTURE1);
      v.tex3 = this._texture(gl, gl.TEXTURE2);
      var left = 2;
      var done = function () { if (--left === 0) v.tex2On = 1; };
      this._loadInto(gl, v.tex2, gl.TEXTURE1, '/assets/patch-pigeon.jpg', true, done);
      this._loadInto(gl, v.tex3, gl.TEXTURE2, '/assets/patch-pigeon-sdf.png', false, done);
    } else {
      var ds = scene === 0 ? 1 : scene;
      this._uploadCanvas(v, this._decal(ds));
      if (document.fonts && document.fonts.load) {
        Promise.all([
          document.fonts.load('800 196px Unbounded'),
          document.fonts.load('500 40px "JetBrains Mono"')
        ]).then(function () { self._uploadCanvas(v, self._decal(ds)); }).catch(function () {});
      }
    }

    el.addEventListener('pointerdown', function (e) {
      v.drag = true; v.px = e.clientX; v.py = e.clientY; v.vel = 0; el.style.cursor = 'grabbing';
      try { el.setPointerCapture(e.pointerId); } catch (_) {}
    });
    el.addEventListener('pointermove', function (e) {
      if (!v.drag) return;
      var dx = e.clientX - v.px, dy = e.clientY - v.py;
      v.px = e.clientX; v.py = e.clientY;
      v.yaw -= dx * 0.01; v.vel = -dx * 0.01;
      v.pitch = Math.max(-0.5, Math.min(0.5, v.pitch + dy * 0.005));
    });
    var up = function () { v.drag = false; el.style.cursor = 'grab'; };
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    if (typeof IntersectionObserver !== 'undefined') {
      v.io = new IntersectionObserver(function (es) { es.forEach(function (en) { v.visible = en.isIntersecting; }); });
      v.io.observe(el);
    }
    this._views.push(v);
    if (this._alive && !this._raf) this._loop();
  }

  _loop() {
    var self = this;
    var tick = function () {
      if (!self._alive) { self._raf = 0; return; }
      var t = (performance.now() - self._start) / 1000;
      var P = self.props || {};
      var accent = self._lin(P.accent || '#FF6B2C');
      var ta = P.autoRotate === false ? 0 : t;
      var views = self._views || [];
      for (var i = 0; i < views.length; i++) {
        var v = views[i];
        if (!v.visible) continue;
        var el = v.el, gl = v.gl;
        var cw = el.clientWidth, ch = el.clientHeight;
        if (!cw || !ch) continue;
        var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        var budget = (v.scene === 0 || v.scene === 3) ? 1.5e6 : 0.85e6;
        if (cw * ch * dpr * dpr > budget) dpr = Math.sqrt(budget / (cw * ch));
        var W = Math.max(1, Math.round(cw * dpr)), H = Math.max(1, Math.round(ch * dpr));
        if (el.width !== W || el.height !== H) { el.width = W; el.height = H; }
        gl.viewport(0, 0, W, H);
        if (!v.drag) { v.yaw += v.vel; v.vel *= 0.94; }
        var a = W / H;
        var stack = 0, yaw, pitch, off = [0, 0, 0], shift = [0, 0], dist = 5.0, shell = self._lin('#EEEDEA'), visor = self._lin('#E6EEF5');
        if (v.scene === 0) {
          yaw = 1.2 + 0.25 * Math.sin(ta * 0.22) + v.yaw;
          pitch = 0.06 + 0.04 * Math.sin(ta * 0.35) + v.pitch;
          off = [0, -0.03 + 0.05 * Math.sin(t * 0.8), 0];
          if (a > 1.15) { shift = [Math.min(a * 0.19, 0.42), 0.0]; dist = 6.0; }
          else { shift = [0, -0.18]; dist = 7.4; }
        } else if (v.scene === 1 || v.scene === 2) {
          yaw = -1.0 + ta * 0.3 + v.yaw;
          pitch = 0.14 + v.pitch;
          off = [0, (v.scene === 1 ? -0.02 : 0.12) + 0.035 * Math.sin(t * 1.1), 0];
          dist = 5.0;
          if (v.scene === 2) shell = self._lin(P.shell42 || '#5DC4A0');
        } else {
          yaw = 0.12 * Math.sin(ta * 0.2) + v.yaw;
          pitch = 0.05 * Math.sin(t * 0.27) + v.pitch;
          off = [0, 0.04 * Math.sin(t * 1.3), 0];
          if (a > 1.15) { shift = [Math.min(a * 0.2, 0.42), 0]; dist = 8.6; stack = 0; }
          else { shift = [0, -0.5 + 330 / ch]; dist = 1.9 * 3.6 / (620 / ch); stack = 1; }
        }
        var u = v.u;
        gl.useProgram(v.prog);
        gl.bindBuffer(gl.ARRAY_BUFFER, v.fsBuf);
        gl.enableVertexAttribArray(v.al);
        gl.vertexAttribPointer(v.al, 2, gl.FLOAT, false, 0, 0);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, v.tex);
        gl.uniform2f(u.uRes, W, H);
        gl.uniform1f(u.uTime, t);
        gl.uniform1f(u.uScene, v.scene);
        gl.uniform2f(u.uRot, yaw, pitch);
        gl.uniform3f(u.uOff, off[0], off[1], off[2]);
        gl.uniform2f(u.uShift, shift[0], shift[1]);
        gl.uniform1f(u.uDist, dist);
        gl.uniform3f(u.uShell, shell[0], shell[1], shell[2]);
        gl.uniform3f(u.uAccent, accent[0], accent[1], accent[2]);
        gl.uniform3f(u.uVisor, visor[0], visor[1], visor[2]);
        gl.uniform1i(u.uTex, 0);
        gl.uniform1f(u.uTexOn, v.texOn);
        gl.uniform1i(u.uTex2, 1);
        gl.uniform1i(u.uTex3, 2);
        gl.uniform1f(u.uTex2On, v.tex2On || 0);
        gl.uniform1f(u.uStack, stack);
        if (v.scene !== 0) {
          gl.uniform1f(u.uPass, 0);
          gl.drawArrays(gl.TRIANGLES, 0, 3);
        } else {
          self._drawHero(v, W, H, t, yaw, pitch, off, shift, dist);
        }
      }
      self._raf = requestAnimationFrame(tick);
    };
    if (!this._raf) this._raf = requestAnimationFrame(tick);
  }

  _loadMesh(v, compile) {
    var gl = v.gl;
    var vs = compile(gl.VERTEX_SHADER, this._meshVs());
    var fs = compile(gl.FRAGMENT_SHADER, this._meshFs());
    var prog = gl.createProgram();
    gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { console.warn('[spacepigeon] mesh', gl.getProgramInfoLog(prog)); return; }
    var dec = function (str) { var bin = atob(str); var arr = new Uint8Array(bin.length); for (var i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i); return arr; };
    fetch('/assets/pigeon-mesh.json').then(function (r) { return r.json(); }).then(function (d) {
      var vbo = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
      gl.bufferData(gl.ARRAY_BUFFER, dec(d.vb), gl.STATIC_DRAW);
      var ibo = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, dec(d.ib), gl.STATIC_DRAW);
      var u = {};
      ['uRes', 'uRot', 'uOff', 'uShift', 'uDist', 'uTime'].forEach(function (n) { u[n] = gl.getUniformLocation(prog, n); });
      v.mesh = { prog: prog, vbo: vbo, ibo: ibo, count: d.tris * 3, u: u,
        aP: gl.getAttribLocation(prog, 'aPos'), aN: gl.getAttribLocation(prog, 'aNor'), aM: gl.getAttribLocation(prog, 'aMat') };
    }).catch(function (e) { console.warn('[spacepigeon] mesh load', e); });
  }

  _drawHero(v, W, H, t, yaw, pitch, off, shift, dist) {
    var gl = v.gl, u = v.u;
    gl.disable(gl.BLEND);
    gl.disable(gl.DEPTH_TEST);
    gl.depthMask(true);
    gl.clearDepth(1);
    gl.clear(gl.DEPTH_BUFFER_BIT);
    gl.uniform1f(u.uPass, 0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    if (v.el.getAttribute('data-sp-bg')) return; // background only: stars, planet, traffic
    if (v.mesh) {
      var M = v.mesh;
      gl.enable(gl.DEPTH_TEST);
      gl.depthFunc(gl.LESS);
      gl.useProgram(M.prog);
      gl.bindBuffer(gl.ARRAY_BUFFER, M.vbo);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, M.ibo);
      gl.enableVertexAttribArray(M.aP); gl.vertexAttribPointer(M.aP, 3, gl.FLOAT, false, 16, 0);
      gl.enableVertexAttribArray(M.aN); gl.vertexAttribPointer(M.aN, 3, gl.BYTE, true, 16, 12);
      gl.enableVertexAttribArray(M.aM); gl.vertexAttribPointer(M.aM, 1, gl.UNSIGNED_BYTE, false, 16, 15);
      gl.uniform2f(M.u.uRes, W, H);
      gl.uniform2f(M.u.uRot, yaw, pitch);
      gl.uniform3f(M.u.uOff, off[0], off[1], off[2]);
      gl.uniform2f(M.u.uShift, shift[0], shift[1]);
      gl.uniform1f(M.u.uDist, dist);
      gl.uniform1f(M.u.uTime, t);
      gl.drawElements(gl.TRIANGLES, M.count, gl.UNSIGNED_SHORT, 0);
      [M.aP, M.aN, M.aM].forEach(function (l) { if (l >= 0 && l !== v.al) gl.disableVertexAttribArray(l); });
      gl.useProgram(v.prog);
      gl.bindBuffer(gl.ARRAY_BUFFER, v.fsBuf);
      gl.enableVertexAttribArray(v.al);
      gl.vertexAttribPointer(v.al, 2, gl.FLOAT, false, 0, 0);
    }
    if (v.fdx) { gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LEQUAL); } else { gl.disable(gl.DEPTH_TEST); }
    gl.uniform1f(u.uPass, 1);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.depthMask(false);
    gl.uniform1f(u.uPass, 2);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.disable(gl.BLEND);
    gl.depthMask(true);
    gl.disable(gl.DEPTH_TEST);
  }

  _meshVs() {
    return [
'attribute vec3 aPos;attribute vec3 aNor;attribute float aMat;',
'uniform vec2 uRes;uniform vec2 uRot;uniform vec3 uOff;uniform vec2 uShift;uniform float uDist;',
'varying vec3 vM;varying vec3 vN;varying vec3 vW;varying float vMat;',
'mat2 rot(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}',
'vec3 toWorldDir(vec3 d){d.yz=rot(-uRot.y)*d.yz;d.xz=rot(-uRot.x)*d.xz;return d;}',
'void main(){vM=aPos;vMat=aMat;vec3 l=(aPos-vec3(0.532,1.05,-0.55))*0.33333;vec3 w=toWorldDir(l)+uOff;vW=w;vN=toWorldDir(aNor);',
'  vec3 c=w-vec3(0.,0.,uDist);float W=-c.z;vec2 uv=c.xy*1.9/W+uShift;float n=0.1,f=50.;',
'  gl_Position=vec4(uv.x*2.*uRes.y/uRes.x*W,uv.y*2.*W,(f+n)/(n-f)*c.z+2.*f*n/(n-f),W);}'
    ].join('\n');
  }

  /* Plumage painted onto the model by region, after the reference: grey head, iridescent green neck,
     mauve chest, checkered wings, dark flight and tail feathers, coral banded legs, orange eyes. */
  _meshFs() {
    return [
'precision highp float;',
'varying vec3 vM;varying vec3 vN;varying vec3 vW;varying float vMat;',
'uniform float uDist;uniform float uTime;',
'vec3 lin(vec3 c){return pow(c,vec3(2.2));}',
'float hash13(vec3 p3){p3=fract(p3*0.1031);p3+=dot(p3,p3.zyx+31.32);return fract((p3.x+p3.y)*p3.z);}',
'float hash12(vec2 p){vec3 p3=fract(vec3(p.xyx)*0.1031);p3+=dot(p3,p3.yzx+33.33);return fract((p3.x+p3.y)*p3.z);}',
'float vnoise(vec3 x){vec3 i=floor(x);vec3 f=fract(x);f=f*f*(3.-2.*f);',
'  return mix(mix(mix(hash13(i),hash13(i+vec3(1.,0.,0.)),f.x),mix(hash13(i+vec3(0.,1.,0.)),hash13(i+vec3(1.,1.,0.)),f.x),f.y),',
'             mix(mix(hash13(i+vec3(0.,0.,1.)),hash13(i+vec3(1.,0.,1.)),f.x),mix(hash13(i+vec3(0.,1.,1.)),hash13(i+vec3(1.,1.,1.)),f.x),f.y),f.z);}',
'vec3 env(vec3 d){',
'  vec3 c=mix(vec3(0.004,0.005,0.012),vec3(0.03,0.04,0.09),smoothstep(-0.4,0.8,d.y));',
'  c+=vec3(1.,0.97,0.92)*1.8*smoothstep(0.72,0.95,d.y)*smoothstep(0.9,0.15,abs(d.x));',
'  vec3 L=normalize(vec3(-0.6,0.55,0.6));c+=vec3(1.,0.85,0.7)*pow(max(dot(d,L),0.),60.)*3.;',
'  c+=vec3(0.3,0.65,0.95)*0.9*smoothstep(0.82,0.98,dot(d,normalize(vec3(1.,0.2,-0.6))));',
'  return c;}',
'void main(){',
'  vec3 n=normalize(vN);vec3 rd=normalize(vW-vec3(0.,0.,uDist));if(dot(n,rd)>0.)n=-n;',
'  vec3 m=vM;float g=vnoise(m*vec3(40.,40.,14.));float nz=vnoise(m*4.);float cs=max(dot(n,-rd),0.);',
'  vec3 alb=lin(vec3(0.5,0.52,0.56));float spec=0.12;float shin=18.;float wrap=0.4;float sheen=0.3;float refl=0.03;',
'  if(vMat>1.5){',
'    alb=lin(vec3(0.2,0.21,0.24))*(0.8+0.3*g);alb=mix(alb,lin(vec3(0.06,0.06,0.07)),smoothstep(-3.0,-3.35,m.z));spec=0.25;sheen=0.35;',
'  }else{',
'    alb=mix(alb,lin(vec3(0.6,0.62,0.66)),smoothstep(0.75,0.2,m.y)*smoothstep(-0.5,0.5,m.z));',
'    float head=smoothstep(2.62,2.78,m.y);',
'    float grn=smoothstep(1.85,2.15,m.y)*(1.-head);',
'    float mauve=smoothstep(1.15,1.45,m.y)*smoothstep(2.1,1.85,m.y)*smoothstep(0.9,1.35,m.z);',
'    float wing=smoothstep(1.25,1.05,m.z)*smoothstep(0.58,0.8,m.y+0.05*m.z)*(1.-smoothstep(1.95,2.15,m.y))*(1.-mauve);',
'    vec2 fu=vec2(m.z*4.2,(m.y+0.3*m.z)*5.2);float row=floor(fu.y);fu.x+=0.5*row;vec2 cell=floor(fu);vec2 f=fract(fu);',
'    vec2 side=m.x>0.532?vec2(0.):vec2(19.,7.);float hsh=hash12(cell+side);float h2=hash12(cell*1.7+side+3.1);',
'    vec2 cq=f-vec2(0.5,0.32);float tipS=abs(cq.x)*1.1+cq.y*0.8;',
'    float mot=0.6*vnoise(m*vec3(6.,8.,5.)+side.xyx)+0.4*vnoise(m*vec3(17.,21.,14.));',
'    float mark=smoothstep(0.5,0.68,mot+0.12*smoothstep(0.45,0.15,tipS)*step(0.3,hsh)-0.08*h2);',
'    float edge=smoothstep(0.32,0.5,abs(f.x-0.5)+0.55*(1.-f.y));',
'    vec3 wc=lin(vec3(0.52,0.54,0.59));wc=mix(wc,lin(vec3(0.11,0.11,0.13))*(0.8+0.4*g),mark*0.92);wc*=0.82+0.24*edge;',
'    wc=mix(wc,lin(vec3(0.17,0.18,0.21)),smoothstep(-1.5,-1.9,m.z));',
'    alb=mix(alb,wc,wing);',
'    vec3 iri=mix(lin(vec3(0.2,0.6,0.46)),lin(vec3(0.36,0.72,0.55)),0.5+0.5*sin(cs*5.+m.x*6.+m.y*5.));',
'    iri=mix(iri,lin(vec3(0.45,0.36,0.6)),smoothstep(0.55,0.15,cs)*0.4);',
'    alb=mix(alb,iri,grn);',
'    alb=mix(alb,mix(lin(vec3(0.5,0.38,0.5)),lin(vec3(0.42,0.4,0.55)),1.-cs),mauve*0.85);',
'    alb=mix(alb,lin(vec3(0.55,0.58,0.63)),head);',
'    alb*=0.84+0.24*g;alb*=0.94+0.1*nz;',
'    spec=0.1+0.55*max(grn,mauve*0.6);shin=18.+30.*grn;sheen=0.3+0.3*grn;',
'    if(m.y<-0.08&&m.z>-0.45&&m.z<1.05){float lg=smoothstep(-0.1,-0.22,m.y);vec3 lc=lin(vec3(0.86,0.38,0.38));',
'      float sc=smoothstep(0.6,0.95,sin(m.y*95.+m.z*25.));lc=mix(lc,lin(vec3(0.95,0.78,0.76)),sc*0.3);',
'      if(m.y<-1.0&&(m.z>0.86||m.z<-0.2))lc=vec3(0.01);',
'      alb=mix(alb,lc,lg);spec=mix(spec,0.4,lg);wrap=mix(wrap,0.2,lg);sheen=mix(sheen,0.,lg);}',
'    if(m.z>2.15&&m.y<2.8&&m.y>2.3){float bk=smoothstep(2.15,2.22,m.z);alb=mix(alb,lin(vec3(0.17,0.17,0.19)),bk);spec=0.5;shin=50.;',
'      float ce=1.-smoothstep(0.06,0.1,length((m-vec3(0.532,2.7,2.24))*vec3(1.,1.4,1.)));alb=mix(alb,lin(vec3(0.9,0.89,0.86))*(0.9+0.1*g),ce);}',
'  }',
'  vec3 ec=vec3(m.x<0.532?0.28:0.784,2.885,2.019);float er=length((m-ec).yz);float ex=abs(m.x-ec.x);',
'  if(vMat>0.5&&vMat<1.5||(ex<0.1&&er<0.12)){vec3 ic=lin(vec3(0.93,0.45,0.1));ic=mix(ic,vec3(0.01),smoothstep(0.052,0.04,er));',
'    ic=mix(lin(vec3(0.6,0.62,0.66)),ic,smoothstep(0.115,0.098,er));alb=ic;spec=1.2;shin=160.;wrap=0.1;sheen=0.;refl=0.2;}',
'  vec3 L1=normalize(vec3(-0.6,0.55,0.6));vec3 L2=normalize(vec3(0.9,0.3,-0.6));',
'  float nl=dot(n,L1);float dif=clamp((nl+wrap)/(1.+wrap),0.,1.);float rim=max(dot(n,L2),0.);float amb=0.5+0.5*n.y;',
'  vec3 H=normalize(L1-rd);float sp=pow(max(dot(n,H),0.),shin)*spec*(shin+8.)/40.;',
'  float ao=0.6+0.4*smoothstep(-1.1,0.3,m.y);',
'  vec3 c=alb*(dif*lin(vec3(1.,0.94,0.87))*1.5+rim*lin(vec3(0.45,0.7,1.))*0.9+amb*vec3(0.06,0.07,0.11))*ao;',
'  c+=sp*vec3(1.,0.95,0.9)*max(nl,0.);c+=env(reflect(rd,n))*(refl+pow(1.-cs,5.)*0.2);',
'  c+=lin(vec3(0.6,0.7,0.9))*sheen*pow(1.-cs,3.)*0.4;',
'  c=1.-exp(-c);c=pow(c,vec3(0.4545));',
'  c+=(hash12(gl_FragCoord.xy)-0.5)/255.;',
'  gl_FragColor=vec4(c,1.);}'
    ].join('\n');
  }

  _fs() {
    return [
'precision highp float;',
'uniform vec2 uRes;uniform float uTime;uniform float uScene;uniform vec2 uRot;uniform vec3 uOff;uniform vec2 uShift;uniform float uDist;',
'uniform vec3 uShell;uniform vec3 uAccent;uniform vec3 uVisor;uniform sampler2D uTex;uniform float uTexOn;uniform float uPass;',
'uniform sampler2D uTex2;uniform sampler2D uTex3;uniform float uTex2On;uniform float uStack;',
'float gMat;vec3 gHP;',
'mat2 rot(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}',
'vec3 lin(vec3 c){return pow(c,vec3(2.2));}',
'float smin(float a,float b,float k){float h=clamp(.5+.5*(b-a)/k,0.,1.);return mix(b,a,h)-k*h*(1.-h);}',
'float sdEll(vec3 p,vec3 r){float k0=length(p/r);float k1=length(p/(r*r));return k0*(k0-1.)/k1;}',
'float sdCap(vec3 p,vec3 a,vec3 b,float r){vec3 pa=p-a,ba=b-a;float h=clamp(dot(pa,ba)/dot(ba,ba),0.,1.);return length(pa-ba*h)-r;}',
'float sdRBox(vec3 p,vec3 b,float r){vec3 q=abs(p)-b;return length(max(q,0.))+min(max(q.x,max(q.y,q.z)),0.)-r;}',
'float sdRoundCone(vec3 p,vec3 a,vec3 b,float r1,float r2){vec3 ba=b-a;float l2=dot(ba,ba);float rr=r1-r2;float a2=l2-rr*rr;float il2=1./l2;',
'  vec3 pa=p-a;float y=dot(pa,ba);float z=y-l2;vec3 xv=pa*l2-ba*y;float x2=dot(xv,xv);float y2=y*y*l2;float z2=z*z*l2;float k=sign(rr)*rr*rr*x2;',
'  if(sign(z)*a2*z2>k)return sqrt(x2+z2)*il2-r2;if(sign(y)*a2*y2<k)return sqrt(x2+y2)*il2-r1;return (sqrt(x2*a2*il2)+y*rr)*il2-r1;}',
'float extrude(float z,float d2,float h){vec2 w=vec2(d2,abs(z)-h);return min(max(w.x,w.y),0.)+length(max(w,0.));}',
'float hash13(vec3 p3){p3=fract(p3*0.1031);p3+=dot(p3,p3.zyx+31.32);return fract((p3.x+p3.y)*p3.z);}',
'float hash12(vec2 p){vec3 p3=fract(vec3(p.xyx)*0.1031);p3+=dot(p3,p3.yzx+33.33);return fract((p3.x+p3.y)*p3.z);}',
'float vnoise(vec3 x){vec3 i=floor(x);vec3 f=fract(x);f=f*f*(3.-2.*f);',
'  return mix(mix(mix(hash13(i),hash13(i+vec3(1.,0.,0.)),f.x),mix(hash13(i+vec3(0.,1.,0.)),hash13(i+vec3(1.,1.,0.)),f.x),f.y),',
'             mix(mix(hash13(i+vec3(0.,0.,1.)),hash13(i+vec3(1.,0.,1.)),f.x),mix(hash13(i+vec3(0.,1.,1.)),hash13(i+vec3(1.,1.,1.)),f.x),f.y),f.z);}',
'vec3 toLocal(vec3 p){p-=uOff;p.xz=rot(uRot.x)*p.xz;p.yz=rot(uRot.y)*p.yz;return p;}',
'vec3 toLocalDir(vec3 d){d.xz=rot(uRot.x)*d.xz;d.yz=rot(uRot.y)*d.yz;return d;}',
'vec3 toWorldDir(vec3 d){d.yz=rot(-uRot.y)*d.yz;d.xz=rot(-uRot.x)*d.xz;return d;}',
'float hv(vec3 p){return p.z-0.28+0.2*p.y+0.25*p.x*p.x;}',
'const vec3 SD=vec3(0.,-0.947,-0.322);const vec3 SE=vec3(0.,-0.97,-0.19);vec3 gSE=vec3(0.,-0.97,-0.19);float gR2=0.68;',

/* ---------- helmet: unit scale, head at origin, facing +z; shell runs down the neck as a collar ---------- */
'float hOuter(vec3 p){',
'  float dome=sdEll(p-vec3(0.,0.06,-0.02),vec3(0.74,0.78,0.8));',
'  float nose=sdRoundCone(p,vec3(0.,0.,0.12),vec3(0.,-0.12,0.66),0.62,0.34);',
'  float sleeve=sdRoundCone(p,vec3(0.,-0.35,0.02),gSE,0.6,gR2);',
'  return smin(smin(dome,nose,0.25),sleeve,0.2);}',
'float helmet(vec3 p,float variant){',
'  gHP=p;vec3 q=vec3(abs(p.x),p.y,p.z);',
'  float o=hOuter(p);float v=hv(p);',
'  if(variant<1.5){float ridge=sdCap(p,vec3(0.,0.82,0.0),vec3(0.,0.66,-0.6),0.028);o=smin(o,ridge,0.05);}',
'  float ob=o-0.022*smoothstep(0.075,0.03,abs(v));',
'  float sh=max(ob,-(o+0.05));',
'  sh=max(sh,v-0.06);',
'  float slots=1e3;for(int i=0;i<3;i++){float y=0.02+0.075*float(i);slots=min(slots,sdCap(q,vec3(0.68,y,-0.44),vec3(0.68,y,-0.26),0.03));}',
'  sh=max(sh,-slots);',
'  float grille=1e3;for(int i=0;i<4;i++){float x=-0.09+0.06*float(i);grille=min(grille,sdCap(p,vec3(x,-0.1,-0.8),vec3(x,-0.3,-0.74),0.016));}',
'  sh=max(sh,-grille);',
'  sh=max(sh,dot(p-gSE,SD));',
'  float d=sh;gMat=abs(v)<0.065?6.:1.;if(o<-0.02)gMat=7.;',
'  float boss=sdCap(q,vec3(0.58,-0.1,0.18),vec3(0.72,-0.1,0.18),0.08);if(boss<d){d=boss;gMat=3.;}',
'  float pin=sdCap(q,vec3(0.72,-0.1,0.18),vec3(0.755,-0.1,0.18),0.033);if(pin<d){d=pin;gMat=6.;}',
'  vec3 pr=p-gSE;float al=dot(pr,SD);vec3 rv=pr-SD*al;float rad=length(rv);',
'  float ring=length(vec2(rad-(gR2-0.02),al+0.02))-0.045;if(ring<d){d=ring;gMat=3.;}',
'  float x1=rv.x;float x2=dot(rv,vec3(0.,-0.322,0.947));float ang=atan(x2,x1);float sec=0.785398;ang=mod(ang+sec*0.5,sec)-sec*0.5;vec2 lp=rad*vec2(cos(ang),sin(ang));',
'  float tab=sdRBox(vec3(lp.x-(gR2+0.02),al+0.02,lp.y),vec3(0.035,0.03,0.025),0.006);if(tab<d){d=tab;gMat=6.;}',
'  float led=sdCap(p,vec3(-0.14,0.12,-0.81),vec3(0.14,0.12,-0.81),0.018);if(led<d){d=led;gMat=8.;}',
'  if(variant>1.5){',
'    float pod=sdCap(q,vec3(0.52,0.46,-0.36),vec3(0.5,0.46,-0.02),0.06);if(pod<d){d=pod;gMat=3.;}',
'    float lens=length(q-vec3(0.5,0.46,0.02))-0.048;if(lens<d){d=lens;gMat=5.;}',
'    float ant=sdCap(p,vec3(0.,0.62,-0.52),vec3(0.,0.98,-0.82),0.012);if(ant<d){d=ant;gMat=3.;}',
'  }',
'  return d;}',
'float glassH(vec3 p){float o=hOuter(p);return max(max(abs(o+0.016)-0.006,0.03-hv(p)),dot(p-gSE,SD)+0.035);}',

/* ---------- pigeon: rock dove after the original illustration, facing +z ---------- */
/* ---------- hero: helmet fitted to the pigeon mesh (model units), mesh drawn separately ---------- */
'const vec3 HH=vec3(0.532,2.62,1.74);const vec3 MC=vec3(0.532,1.05,-0.55);const float MK=0.33333;const float HS=0.92;',
'vec3 heroL(vec3 p){vec3 m=p/MK+MC-HH;m.yz=rot(-0.1)*m.yz;return m/HS;}',
'float heroH(vec3 p){return helmet(heroL(p),1.)*HS*MK;}',
'float heroG(vec3 p){return glassH(heroL(p))*HS*MK;}',

/* ---------- patch ---------- */
'const float PS=1.6;',
'float pigeonSD(vec2 q){vec2 uv=q/PS+0.5;vec2 o=max(abs(uv-0.5)-0.5,0.);float box=length(o)*PS;',
'  float sd=(0.5-texture2D(uTex3,clamp(uv,0.,1.)).r)*48./512.*PS;return max(sd,box);}',
'vec3 patchC1(){return mix(vec3(-0.82,0.12,0.),vec3(0.,0.8,0.),uStack);}',
'vec3 patchC2(){return mix(vec3(1.08,-0.3,0.18),vec3(0.,-0.95,0.12),uStack);}',
'float mapPatch(vec3 p){',
'  vec3 a=p-patchC1();a.xz=rot(0.3*sin(uTime*0.45))*a.xz;a.yz=rot(0.1*sin(uTime*0.37))*a.yz;',
'  float d1=extrude(a.z,length(a.xy)-0.96,0.03)-0.035;',
'  vec3 b=p-patchC2();b.xz=rot(0.34*sin(uTime*0.4+2.))*b.xz;b.yz=rot(0.12*sin(uTime*0.33+1.))*b.yz;',
'  float d2=uTex2On>0.5?extrude(b.z,pigeonSD(b.xy),0.022)-0.014:1e3;',
'  if(d1<d2){gMat=20.;gHP=a;return d1;}gMat=24.;gHP=b;return d2;}',

'float map(vec3 p){if(uScene<0.5)return heroH(p);if(uScene<2.5)return helmet(p,uScene<1.5?1.:2.);return mapPatch(p);}',
'float mapGlass(vec3 p){if(uScene<0.5)return heroG(p);return glassH(p);}',
'float softShadow(vec3 ro,vec3 rd){float res=1.;float t=0.02;for(int i=0;i<32;i++){float h=map(ro+rd*t);res=min(res,8.*h/t);t+=clamp(h,0.015,0.2);if(res<0.01||t>3.)break;}return clamp(res,0.,1.);}',
'vec3 calcN(vec3 p){vec2 e=vec2(0.0012,-0.0012);return normalize(e.xyy*map(p+e.xyy)+e.yyx*map(p+e.yyx)+e.yxy*map(p+e.yxy)+e.xxx*map(p+e.xxx));}',
'vec3 calcNG(vec3 p){vec2 e=vec2(0.001,-0.001);return normalize(e.xyy*mapGlass(p+e.xyy)+e.yyx*mapGlass(p+e.yyx)+e.yxy*mapGlass(p+e.yxy)+e.xxx*mapGlass(p+e.xxx));}',
'float calcAO(vec3 p,vec3 n){float o=0.,s=1.;for(int i=1;i<=4;i++){float h=0.05*float(i);o+=(h-map(p+n*h))*s;s*=0.6;}return clamp(1.-2.2*o,0.,1.);}',

/* ---------- environment ---------- */
'vec3 env(vec3 d){',
'  vec3 c=mix(vec3(0.004,0.005,0.012),vec3(0.03,0.04,0.09),smoothstep(-0.4,0.8,d.y));',
'  c+=vec3(1.,0.97,0.92)*1.8*smoothstep(0.72,0.95,d.y)*smoothstep(0.9,0.15,abs(d.x));',
'  vec3 L=normalize(vec3(-0.6,0.55,0.6));c+=vec3(1.,0.85,0.7)*pow(max(dot(d,L),0.),60.)*3.;',
'  c+=vec3(0.3,0.65,0.95)*0.9*smoothstep(0.82,0.98,dot(d,normalize(vec3(1.,0.2,-0.6))));',
'  c+=vec3(0.9,0.9,1.)*0.5*smoothstep(0.9,0.99,dot(d,normalize(vec3(-1.,0.1,-0.3))));',
'  return c;}',
'vec3 stars(vec3 d){vec3 c=vec3(0.);',
'  for(int i=0;i<2;i++){float sc=i==0?60.:140.;vec3 q=d*sc;vec3 id=floor(q);vec3 f=fract(q)-0.5;',
'    float h=hash13(id+float(i)*13.7);float th=i==0?0.965:0.935;',
'    if(h>th){float b=(h-th)/(1.-th);float tw=0.7+0.3*sin(uTime*(1.+b*3.)+h*80.);',
'      c+=vec3(0.9,0.92,1.)*b*tw*smoothstep(i==0?0.14:0.22,0.,length(f))*(i==0?1.4:0.6);}}',
'  return c;}',
'float hash11(float n){return fract(sin(n*127.1)*43758.5453);}',
'float fbm3(vec3 p){float a=0.5,t=0.;for(int i=0;i<5;i++){t+=a*vnoise(p);p=p*2.03+vec3(1.7,9.2,3.1);a*=0.5;}return t;}',
'const vec3 PLC=vec3(3.6,-3.8,-11.);const float PLR=4.;',
'vec3 PLN(){return normalize(vec3(0.25,1.,0.35));}',
'float sphereT(vec3 ro,vec3 rd,vec3 c,float r){vec3 oc=ro-c;float b=dot(oc,rd);float h=b*b-dot(oc,oc)+r*r;return h>0.?-b-sqrt(h):1e9;}',
/* a small glowing point in the sky, hidden behind the planet */
'float spot(vec3 ro,vec3 rd,vec3 P,float size,float tp){vec3 v=P-ro;float t=dot(v,rd);if(t<0.||t>tp)return 0.;float d=length(v-rd*t)/t;return exp(-d*d/(size*size));}',
'vec3 orbitPos(float r,float th,vec3 e1,vec3 e2){return PLC+r*(cos(th)*e1+sin(th)*e2);}',
'vec3 planetAlbedo(vec3 n){',
'  vec3 rn=PLN();float y=dot(n,rn);vec3 q=n*2.2+vec3(uTime*0.004,0.,0.);',
'  float w=fbm3(q*vec3(1.,5.,1.));float fine=fbm3(n*vec3(9.,30.,9.)+vec3(0.,0.,uTime*0.01));',
'  float band=sin(y*20.+w*4.2+fine*1.2);',
'  vec3 c=mix(lin(vec3(0.78,0.43,0.24)),lin(vec3(0.97,0.88,0.72)),0.5+0.5*band);',
'  c=mix(c,lin(vec3(0.42,0.2,0.11)),smoothstep(0.55,0.9,sin(y*7.3+w*2.))*0.55);',
'  c=mix(c,lin(vec3(0.99,0.93,0.82)),smoothstep(0.62,0.8,fine)*0.35);',
'  vec3 sd=normalize(vec3(-0.35,-0.15,0.92));float sa=acos(clamp(dot(n,sd),-1.,1.));',
'  vec3 tq=normalize(cross(rn,sd));float sw=atan(dot(n-sd*dot(n,sd),cross(sd,tq)),dot(n-sd*dot(n,sd),tq));',
'  float storm=smoothstep(0.2,0.1,sa*vec2(1.,1.8).x+0.02*sin(sw*3.+sa*40.-uTime*0.5));',
'  c=mix(c,mix(lin(vec3(0.75,0.25,0.12)),lin(vec3(0.95,0.6,0.4)),0.5+0.5*sin(sa*60.-uTime*0.6+sw*2.)),storm*0.85);',
'  return c*(0.9+0.2*fine);}',
'vec3 planet(vec3 ro,vec3 rd,vec3 col){',
'  vec3 pc=PLC;float pr=PLR;vec3 L=normalize(vec3(-0.6,0.55,0.6));vec3 rn=PLN();',
'  float tp=sphereT(ro,rd,pc,pr);',
'  float tr=dot(pc-ro,rn)/dot(rd,rn);vec3 rp=ro+rd*tr-pc;float rr=length(rp);',
'  vec4 ring=vec4(0.);',
'  if(tr>0.&&rr>4.9&&rr<7.8){',
'    float g=vnoise(vec3(rr*38.,0.,0.))*0.6+vnoise(vec3(rr*140.,1.,0.))*0.4;',
'    float bands=0.35+0.65*g;float gap=smoothstep(0.03,0.09,abs(rr-6.15))*smoothstep(0.015,0.04,abs(rr-7.05));',
'    float a=0.65*smoothstep(4.9,5.25,rr)*smoothstep(7.8,7.35,rr)*gap*(0.45+0.55*g);',
'    vec3 rc=mix(lin(vec3(0.82,0.66,0.5)),lin(vec3(0.98,0.9,0.78)),g)*(0.25+0.6*bands);',
'    float sh=sphereT(ro+rd*tr,L,pc,pr)<1e8?0.12:1.;',
'    ring=vec4(rc*sh*0.75,a);}',
'  if(tp<1e8){vec3 p=ro+rd*tp;vec3 n=normalize(p-pc);',
'    vec3 alb=planetAlbedo(n);float nd=dot(n,L);float dif=smoothstep(-0.12,0.6,nd);',
'    float tr2=dot(pc-p,rn)/dot(L,rn);float rr2=length(p+L*tr2-pc);',
'    float rs=(tr2>0.&&rr2>4.9&&rr2<7.8)?1.-0.6*smoothstep(4.9,5.3,rr2)*smoothstep(7.8,7.3,rr2)*smoothstep(0.03,0.09,abs(rr2-6.15)):1.;',
'    vec3 pcol=alb*(0.008+dif*0.95*rs);',
'    float fr=pow(1.-max(dot(n,-rd),0.),2.5);pcol+=lin(vec3(1.,0.62,0.4))*fr*0.55*(0.15+dif);',
'    pcol+=lin(vec3(0.35,0.5,1.))*fr*0.08*(1.-dif);',
     /* lightning flickers on the night side */
'    float ln=step(0.985,hash13(floor(n*14.)+floor(uTime*2.7)))*smoothstep(0.1,-0.3,nd);',
'    pcol+=lin(vec3(0.7,0.8,1.))*ln*0.6*smoothstep(0.5,0.,length(fract(n*14.)-0.5));',
'    col=pcol;if(tr<tp)col=mix(col,ring.rgb,ring.a);',
'  }else{vec3 oc=ro-pc;float b=dot(oc,rd);if(b<0.){float dd=sqrt(max(dot(oc,oc)-b*b,0.))-pr;col+=lin(vec3(1.,0.55,0.3))*0.18*exp(-dd*2.2);}',
'    col=mix(col,ring.rgb,ring.a);}',
   /* moon */
'  vec3 mc=orbitPos(8.2,uTime*0.025+2.2,normalize(vec3(1.,0.35,0.)),normalize(vec3(0.,0.25,-1.)));float tm=sphereT(ro,rd,mc,0.42);',
'  if(tm<tp&&tm<1e8){vec3 n=normalize(ro+rd*tm-mc);float cr=fbm3(n*6.);vec3 mcol=lin(vec3(0.62,0.6,0.58))*(0.6+0.5*cr)*(0.02+max(dot(n,L),0.));',
'    if(tr<tm)mcol=mix(mcol,ring.rgb,ring.a);col=mcol;}',
'  float tpp=min(tp,tm);',
   /* satellites: tiny lights with a blinking beacon */
'  for(int i=0;i<4;i++){float fi=float(i);',
'    vec3 e1=normalize(vec3(1.,0.2*fi-0.3,0.3*sin(fi*2.1)));vec3 e2=normalize(cross(normalize(vec3(0.15*fi-0.2,1.,0.3)),e1));',
'    vec3 sp=orbitPos(5.2+fi*1.05,uTime*(0.22-fi*0.035)+fi*2.4,e1,e2);',
'    float body=spot(ro,rd,sp,0.0011,tpp);float bl=step(0.85,fract(uTime*0.9+fi*0.37));',
'    col+=lin(vec3(0.95,0.97,1.))*body*1.4+lin(vec3(1.,0.25,0.2))*spot(ro,rd,sp,0.0028,tpp)*bl*1.2;',
'    vec3 tang=normalize(e2*cos(uTime*(0.22-fi*0.035)+fi*2.4)-e1*sin(uTime*(0.22-fi*0.035)+fi*2.4));',
'    col+=lin(vec3(0.6,0.8,1.))*(spot(ro,rd,sp+tang*0.06,0.0009,tpp)+spot(ro,rd,sp-tang*0.06,0.0009,tpp))*0.6;}',
   /* ships on doomed approaches: a hot streak, then an impact flash and shockwave on the surface */
'  for(int i=0;i<2;i++){float fi=float(i);float P=13.+fi*5.;float ph=mod(uTime+fi*6.5,P)/P;',
'    vec3 tgt=normalize(vec3(-0.55+fi*0.5,0.35-fi*0.25,0.75));vec3 T=PLC+tgt*PLR;',
'    vec3 S0=PLC+normalize(vec3(-1.6+fi*2.4,1.1-fi*0.2,0.6))*13.;vec3 side=normalize(cross(T-S0,vec3(0.,0.,1.)));',
'    if(ph<0.8){float f=pow(ph/0.8,1.7);',
'      for(int k=0;k<16;k++){float fk=f-float(k)*0.0055;if(fk<0.)break;vec3 sp=mix(S0,T,fk)+side*sin(fk*3.1416)*1.4;',
'        float w=k==0?1.:0.4*exp(-float(k)*0.18);col+=mix(lin(vec3(1.,0.95,0.85)),lin(vec3(1.,0.45,0.15)),min(float(k)/3.,1.))*spot(ro,rd,sp,k==0?0.0013:0.0018,tp)*w*(0.6+f);}',
'    }else{float e=(ph-0.8)/0.2;float fl=exp(-e*7.);',
'      col+=lin(vec3(1.,0.75,0.4))*spot(ro,rd,T,0.004+0.02*e,1e9)*fl*3.;',
'      if(tp<1e8){vec3 p=ro+rd*tp;float dd=acos(clamp(dot(normalize(p-PLC),tgt),-1.,1.));',
'        col+=lin(vec3(1.,0.6,0.3))*exp(-pow((dd-e*0.35)/0.012,2.))*(1.-e)*1.2+lin(vec3(1.,0.35,0.1))*exp(-dd*dd/0.0008)*(1.-e)*2.;}}}',
   /* sporadic bursts: brief flares with diffraction spikes, on the planet and in nearby space */
'  for(int i=0;i<3;i++){float fi=float(i);float P=3.1+fi*1.7;float slot=floor(uTime/P+fi*0.37);float h=hash11(slot*13.7+fi*7.1);',
'    if(h>0.45){float tt=fract(uTime/P+fi*0.37)*P;float env=exp(-tt*2.6)*step(tt,2.);',
'      vec3 dirB=normalize(vec3(hash11(slot+1.3)-0.75,hash11(slot+4.1)-0.3,0.9));float onP=step(0.6,hash11(slot+8.8));',
'      vec3 B=onP>0.5?PLC+dirB*PLR*1.002:PLC+normalize(vec3(hash11(slot+2.2)*2.-1.4,hash11(slot+5.5)*1.6-0.2,0.6))*(PLR*1.6+hash11(slot+9.)*4.);',
'      vec3 v=normalize(B-ro);float vis=(onP>0.5||sphereT(ro,v,PLC,PLR)>dot(B-ro,v))?1.:0.;',
'      vec2 dxy=rd.xy/(-rd.z)-v.xy/(-v.z);',
'      float spikes=exp(-abs(dxy.x)*900.)*exp(-abs(dxy.y)*60.)+exp(-abs(dxy.y)*900.)*exp(-abs(dxy.x)*60.);',
'      float core=exp(-dot(dxy,dxy)/(0.00003+0.0001*env));',
'      col+=mix(lin(vec3(0.75,0.9,1.)),lin(vec3(1.,0.7,0.4)),onP)*(core*2.5+spikes*0.6)*env*vis;}}',
'  return col;}',
'vec3 background(vec3 ro,vec3 rd,vec2 uv){',
'  vec3 c=vec3(0.0021,0.0024,0.0052)+stars(rd);',
'  if(uScene<0.5){c=planet(ro,rd,c);}',
'  else{c+=lin(vec3(0.3,0.36,0.6))*0.05*exp(-4.*dot(uv,uv));}',
'  return c;}',

/* ---------- shading ---------- */
'vec3 shade(vec3 pl,vec3 n,vec3 rd,float m,float ao,float shd){',
'  vec3 L1=normalize(vec3(-0.6,0.55,0.6));vec3 L2=normalize(vec3(0.9,0.3,-0.6));',
'  vec3 alb=vec3(0.5);float spec=0.25;float shin=24.;float refl=0.04;vec3 emi=vec3(0.);float wrap=0.;float sheen=0.;',
'  float fres=pow(1.-max(dot(n,-rd),0.),5.);vec3 R=reflect(rd,n);',
'  vec3 hp=gHP;float v=hv(hp);bool base=dot(hp-gSE,SD)>-0.012&&(m<1.5||(m>5.5&&m<6.5));',
'  if(m<1.5){alb=uShell;spec=0.55;shin=60.;refl=0.12;',
'    vec3 sc=uScene<1.5?uAccent:lin(vec3(0.97,0.97,0.95));',
'    if(abs(hp.x)<0.1&&hp.y>0.22&&v<-0.07)alb=sc;',
'    float pline=step(abs(abs(hp.x)-0.118),0.007)*step(0.2,hp.y)*step(v,-0.07)+step(abs(hp.z+0.5-0.18*hp.y),0.006)*step(hp.y,0.5);',
'    pline+=step(abs(hp.y+0.48),0.006);',
'    alb*=1.-0.7*clamp(pline,0.,1.);',
'    if(uTexOn>0.5&&abs(hp.x)>0.3){float du=hp.x>0.?(-0.12-hp.z)/0.5:(hp.z+0.62)/0.5;float dv=(hp.y+0.45)/0.25;',
'      if(du>0.&&du<1.&&dv>0.&&dv<1.){vec4 dc=texture2D(uTex,vec2(du,dv));alb=mix(alb,pow(dc.rgb,vec3(2.2)),dc.a);}}}',
'  else if(m<3.5){alb=lin(vec3(0.1,0.105,0.12));spec=0.6;shin=50.;refl=0.25;}',
'  else if(m<5.5){alb=vec3(1.);emi=lin(vec3(1.,0.88,0.6))*2.5;}',
'  else if(m<6.5){alb=lin(vec3(0.56,0.59,0.65))*(0.92+0.08*sin(hp.x*220.));spec=0.9;shin=80.;refl=0.4;',
'    float fa=atan(hp.y+0.1,hp.x);float sd=abs(fract(fa*2.2)-0.5);if(abs(v)<0.035&&sd<0.06)alb*=0.35;}',
'  else if(m<7.5){alb=lin(vec3(0.13,0.13,0.15))*(0.8+0.2*sin(hp.y*45.)*sin(hp.z*45.));spec=0.1;}',
'  else if(m<8.5){alb=vec3(0.);emi=lin(vec3(0.35,0.9,0.85))*(1.6+0.6*sin(uTime*3.));}',
'  else if(m<10.5){float g=vnoise(pl*vec3(90.,90.,30.));float nz=vnoise(pl*8.);float cs=max(dot(n,-rd),0.);',
'    alb=lin(vec3(0.52,0.54,0.58));',
'    alb=mix(alb,lin(vec3(0.6,0.62,0.66)),smoothstep(0.0,-0.3,pl.y));',
'    float mauve=smoothstep(-0.02,0.14,pl.y)*smoothstep(0.42,0.26,pl.y)*smoothstep(-0.05,0.2,pl.z);',
'    alb=mix(alb,mix(lin(vec3(0.5,0.38,0.5)),lin(vec3(0.42,0.4,0.55)),1.-cs),mauve*0.85);',
'    float grn=smoothstep(0.26,0.42,pl.y);',
'    vec3 iri=mix(lin(vec3(0.22,0.62,0.48)),lin(vec3(0.38,0.72,0.55)),0.5+0.5*sin(cs*5.+pl.x*8.+pl.y*6.));',
'    iri=mix(iri,lin(vec3(0.45,0.36,0.6)),smoothstep(0.55,0.15,cs)*0.4);',
'    alb=mix(alb,iri,grn);',
'    alb=mix(alb,lin(vec3(0.56,0.59,0.64)),smoothstep(0.7,0.78,pl.y));',
'    alb*=0.84+0.24*g;alb*=0.94+0.1*nz;spec=0.12+0.55*max(grn,mauve*0.6);shin=18.+30.*grn;wrap=0.4;sheen=0.3+0.3*grn;}',
'  else if(m<11.5){float g=vnoise(pl*vec3(70.,70.,25.));alb=lin(vec3(0.5,0.52,0.57));',
'    vec2 fu=vec2(pl.z*12.,(pl.y+0.5*pl.z)*12.);float row=floor(fu.y);fu.x+=0.5*row;vec2 cell=floor(fu);vec2 f=fract(fu);',
'    float hsh=hash12(cell+vec2(pl.x>0.?0.:17.,3.));',
'    float spot=smoothstep(0.42,0.22,length((f-vec2(0.5,0.62))*vec2(1.,1.3)));',
'    float edge=smoothstep(0.3,0.5,abs(f.x-0.5)+0.6*(1.-f.y));',
'    alb=mix(alb,lin(vec3(0.11,0.11,0.13)),spot*step(0.32,hsh)*0.92);',
'    alb*=0.82+0.22*edge;',
'    alb=mix(alb,lin(vec3(0.2,0.21,0.24)),smoothstep(-0.48,-0.62,pl.z));',
'    alb*=0.85+0.25*g;spec=0.12;shin=14.;wrap=0.35;sheen=0.25;}',
'  else if(m<12.5){alb=lin(vec3(0.2,0.19,0.21));spec=0.6;shin=50.;}',
'  else if(m<13.5){alb=lin(vec3(0.92,0.9,0.86))*(0.9+0.1*vnoise(pl*60.));wrap=0.3;}',
'  else if(m<14.5){float er=length(gHP.xy);alb=lin(vec3(0.93,0.45,0.1));spec=1.2;shin=160.;refl=0.25;emi=alb*0.1;}',
'  else if(m<15.5){alb=vec3(0.005);spec=1.2;shin=150.;refl=0.2;}',
'  else if(m<16.5){alb=lin(vec3(0.86,0.38,0.38));float sc=smoothstep(0.55,0.85,sin((pl.y+0.4*pl.z)*170.));alb=mix(alb,lin(vec3(0.96,0.82,0.8)),sc*0.6);spec=0.45;shin=40.;wrap=0.25;}',
'  else if(m<17.5){float g=vnoise(pl*vec3(90.,90.,18.));alb=lin(vec3(0.18,0.19,0.22))*(0.75+0.4*g);spec=0.3;shin=30.;wrap=0.25;sheen=0.35;}',
'  else if(m<18.5){float g=vnoise(pl*vec3(90.,90.,18.));alb=lin(vec3(0.22,0.23,0.27))*(0.8+0.35*g);alb=mix(alb,lin(vec3(0.06,0.06,0.07)),smoothstep(-0.95,-1.05,pl.z));spec=0.25;shin=24.;wrap=0.25;sheen=0.3;}',
'  else if(m<19.5){alb=vec3(0.01);spec=0.8;shin=80.;refl=0.15;}',
'  else if(m<21.5&&uScene<0.5){alb=lin(vec3(0.6,0.62,0.66));spec=0.2;}',
'  else if(m>23.5){vec2 uv=gHP.xy/PS+0.5;vec3 tx=pow(texture2D(uTex2,uv).rgb,vec3(2.2));',
'    if(gHP.z<-0.012&&pigeonSD(gHP.xy)<-0.04)tx=lin(vec3(0.84,0.84,0.82))*(0.9+0.1*sin(dot(gHP.xy,vec2(1.,-1.))*220.));',
'    alb=tx*1.08*(0.96+0.04*sin(dot(gHP.xy,vec2(0.6,0.8))*420.));spec=0.2;shin=14.;refl=0.02;wrap=0.2;sheen=0.2;}',
'  else{float r=length(gHP.xy);vec2 dir=gHP.xy/max(r,1e-4);vec2 uv=dir*min(r,0.985)*0.5+0.5;',
'    vec3 tx=uTexOn>0.5?pow(texture2D(uTex,uv).rgb,vec3(2.2)):lin(vec3(0.06));',
'    if(gHP.z<-0.02&&r<0.955)tx=lin(vec3(0.09,0.09,0.1))*(0.85+0.15*sin(dot(gHP.xy,vec2(1.,-1.))*200.));',
'    float th=0.96+0.04*sin(dot(gHP.xy,vec2(0.71,0.71))*320.);',
'    if(r>0.955)th=0.86+0.14*sin(atan(gHP.y,gHP.x)*240.+gHP.z*60.);',
'    alb=tx*th*1.12;spec=0.18;shin=12.;refl=0.02;wrap=0.15;sheen=0.15;}',
'  if(base){alb=lin(vec3(0.08,0.08,0.09));spec=0.2;refl=0.02;}',
'  float nl=dot(n,L1);float dif=clamp((nl+wrap)/(1.+wrap),0.,1.)*shd;float rim=max(dot(n,L2),0.);float amb=0.5+0.5*n.y;',
'  vec3 H=normalize(L1-rd);float sp=pow(max(dot(n,H),0.),shin)*spec*(shin+8.)/40.;',
'  vec3 c=alb*(dif*lin(vec3(1.,0.94,0.87))*1.5+rim*lin(vec3(0.45,0.7,1.))*0.9+amb*vec3(0.05,0.06,0.1))*mix(1.,ao,0.8);',
'  c+=sp*vec3(1.,0.95,0.9)*max(nl,0.)*shd;c+=env(R)*(refl+fres*0.25)*ao;c+=emi;',
'  c+=lin(vec3(0.6,0.7,0.9))*sheen*pow(1.-max(dot(n,-rd),0.),3.)*0.4;',
'  return c;}',

'vec3 toWorld(vec3 p){return toWorldDir(p)+uOff;}',
'float fdepth(vec3 lp){vec3 c=toWorld(lp)-vec3(0.,0.,uDist);float n=0.1,f=50.;float zc=(f+n)/(n-f)*c.z+2.*f*n/(n-f);return clamp((zc/(-c.z))*0.5+0.5,0.,1.);}',
'void main(){',
'  vec2 uv=(gl_FragCoord.xy-0.5*uRes)/uRes.y;uv-=uShift;',
'  vec3 ro=vec3(0.,0.,uDist);vec3 rd=normalize(vec3(uv,-1.9));',
'  if(uScene<1.5){gSE=vec3(0.,-0.35,0.02)+SD*0.25;gR2=1.0;}',
'  if(uScene<0.5&&uPass<0.5){vec3 bg=background(ro,rd,uv);bg=1.-exp(-bg);bg=pow(bg,vec3(0.4545));bg+=(hash12(gl_FragCoord.xy)-0.5)/255.;gl_FragColor=vec4(bg,1.);return;}',
'  vec3 lro=toLocal(ro);vec3 lrd=toLocalDir(rd);',
'  vec3 bc=uScene<0.5?(HH-MC)*MK:vec3(0.);float bR=uScene<0.5?0.5:(uScene<2.5?1.45:2.25);',
'  vec3 oc=lro-bc;float b=dot(oc,lrd);float c=dot(oc,oc)-bR*bR;float h=b*b-c;float t0=0.;float tmax=0.;float tHit=1e9;',
'  if(h>0.){float sh=sqrt(h);t0=max(-b-sh,0.);tmax=-b+sh;}',
'  if(uScene<0.5&&uPass>1.5){',
'    if(h<=0.)discard;float t=t0;float tg=1e9;',
'    for(int i=0;i<90;i++){vec3 p=lro+lrd*t;float d=mapGlass(p);if(d<0.0004*t){tg=t;break;}t+=d*0.9;if(t>tmax)break;}',
'    if(tg>1e8)discard;vec3 p=lro+lrd*tg;vec3 n=toWorldDir(calcNG(p));if(dot(n,rd)>0.)n=-n;',
'    float cs=max(dot(n,-rd),0.);float fr=0.06+0.94*pow(1.-cs,5.);vec3 R=reflect(rd,n);',
'    vec3 g=env(R)*fr*1.1+pow(max(dot(R,normalize(vec3(-0.6,0.55,0.6))),0.),260.)*vec3(5.)+lin(vec3(0.55,0.75,1.))*0.03*pow(1.-cs,2.);',
'    g=1.-exp(-g);g=pow(g,vec3(0.4545));',
'    gl_FragColor=vec4(g,clamp(fr,0.,1.));',
'#ifdef FRAGDEPTH',
'    gl_FragDepthEXT=fdepth(p);',
'#endif',
'    return;}',
'  if(h>0.){float t=t0;',
'    for(int i=0;i<130;i++){vec3 p=lro+lrd*t;float d=map(p);if(d<0.0007*t){tHit=t;break;}t+=d*0.8;if(t>tmax)break;}}',
'  if(uScene<0.5){',
'    if(tHit>1e8)discard;vec3 p=lro+lrd*tHit;vec3 nl=calcN(p);float ao=calcAO(p,nl);map(p);',
'    vec3 hc=shade(p,toWorldDir(nl),rd,gMat,ao,1.);hc=1.-exp(-hc);hc=pow(hc,vec3(0.4545));',
'    gl_FragColor=vec4(hc,1.);',
'#ifdef FRAGDEPTH',
'    gl_FragDepthEXT=fdepth(p);',
'#endif',
'    return;}',
'  vec3 col=background(ro,rd,uv);',
'  if(tHit<1e8){vec3 p=lro+lrd*tHit;vec3 nl=calcN(p);float ao=calcAO(p,nl);map(p);float m=gMat;',
'    col=shade(p,toWorldDir(nl),rd,m,ao,1.);}',
'  if(h>0.&&uScene<2.5){float t=t0;float tg=1e9;float lim=min(tmax,tHit);',
'    for(int i=0;i<90;i++){vec3 p=lro+lrd*t;float d=mapGlass(p);if(d<0.0005*t){tg=t;break;}t+=d*0.9;if(t>lim)break;}',
'    if(tg<tHit){vec3 p=lro+lrd*tg;vec3 n=toWorldDir(calcNG(p));if(dot(n,rd)>0.)n=-n;',
'      float cs=max(dot(n,-rd),0.);float fr=0.04+0.96*pow(1.-cs,5.);vec3 R=reflect(rd,n);',
'      col=col*uVisor*(1.-fr)+env(R)*fr*1.1;',
'      col+=pow(max(dot(R,normalize(vec3(-0.6,0.55,0.6))),0.),260.)*vec3(5.);',
'      col+=lin(vec3(0.55,0.75,1.))*0.03*pow(1.-cs,2.);}}',
'  col=1.-exp(-col);col=pow(col,vec3(0.4545));',
'  col+=(hash12(gl_FragCoord.xy)-0.5)/255.;',
'  gl_FragColor=vec4(col,1.);}'
    ].join('\n');
  }
}

document.addEventListener('DOMContentLoaded', function () { new Component().componentDidMount(); });
