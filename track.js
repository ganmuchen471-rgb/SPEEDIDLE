// ==================================================
//          宇宙尺度对比 — track.js
// ==================================================
//  🪐 深空背景 + 银河 + 星星
//  📏 底部尺寸标尺
//  🪐 星球按真实比例显示（对数尺度）
//  🚀 飞船在标尺上推进
// ==================================================

const PLANETS = [
    { d: 1,         name: "地球",            sub: "Earth · Planet",          img: "pic/地球.jpg" },
    { d: 3.84e8,    name: "月球",            sub: "Moon · Earth's Moon",     img: "pic/月球_冥王星_水星_火星_1.jpg" },
    { d: 4.14e10,   name: "金星",            sub: "Venus · Planet",          img: "pic/水星轨道_金星轨道.jpg" },
    { d: 9.14e10,   name: "水星",            sub: "Mercury · Planet",        img: "pic/月球_冥王星_水星_火星_1.jpg" },
    { d: 1.496e11,  name: "太阳",            sub: "Sun · Star",              img: "pic/太阳系行星.jpg", star: true },
    { d: 1.496e11,  name: "1天文单位",       sub: "1 AU · Earth-Sun",        img: "pic/太阳系大小.jpg" },
    { d: 2.25e11,   name: "火星",            sub: "Mars · Planet",           img: "pic/月球_冥王星_水星_火星_2.jpg" },
    { d: 2.28e11,   name: "火卫一",          sub: "Phobos · Moon of Mars",   img: "pic/火卫一_2.jpg" },
    { d: 2.30e11,   name: "火卫二",          sub: "Deimos · Moon of Mars",   img: "pic/火卫一_1.jpg" },
    { d: 4.14e11,   name: "谷神星",          sub: "Ceres · Dwarf Planet",    img: "pic/小行星带.jpg" },
    { d: 6.28e11,   name: "木星",            sub: "Jupiter · Planet",        img: "pic/木星.jpg" },
    { d: 6.30e11,   name: "木卫二",          sub: "Europa · Moon of Jupiter",img: "pic/木星.jpg" },
    { d: 1.28e12,   name: "土星",            sub: "Saturn · Planet",         img: "pic/土星.jpg", ring: true },
    { d: 2.72e12,   name: "天王星",          sub: "Uranus · Planet",         img: "pic/地球_海王星_天王星.jpg" },
    { d: 4.35e12,   name: "海王星",          sub: "Neptune · Planet",        img: "pic/海王星.jpg" },
    { d: 5.91e12,   name: "冥王星",          sub: "Pluto · Dwarf Planet",    img: "pic/月球_冥王星_水星_火星_2.jpg" },
    { d: 7.5e12,    name: "柯伊伯带",        sub: "Kuiper Belt",             img: "pic/柯伊伯带.jpg" },
    { d: 1.5e15,    name: "奥尔特云",        sub: "Oort Cloud",              img: "pic/奥尔特云_1.jpg" },
    { d: 9.461e15,  name: "1光年",           sub: "1 Light Year",            img: "pic/奥尔特云_2.jpg" },
    { d: 4.01e16,   name: "比邻星",          sub: "Proxima Centauri",        img: "pic/比邻星.jpg", star: true },
    { d: 4.13e16,   name: "南门二",          sub: "Alpha Centauri",          img: "pic/南门二.jpg", star: true },
    { d: 8.14e16,   name: "天狼星A",         sub: "Sirius A · Star",         img: "pic/天狼星_1.jpg", star: true },
    { d: 4.20e18,   name: "昴星团",          sub: "Pleiades · Star Cluster", img: "pic/武仙大球状星团.jpg" },
    { d: 6.05e18,   name: "参宿四",          sub: "Betelgeuse · Supergiant", img: "pic/天狼星_2.jpg", star: true },
    { d: 1.27e19,   name: "猎户座大星云",    sub: "Orion Nebula",            img: "pic/猎户座大星云.jpg" },
    { d: 1.79e20,   name: "史蒂文森2-18",    sub: "Stephenson 2-18 · Star",  img: "pic/天狼星_3.jpg", star: true },
    { d: 2.46e20,   name: "银河系中心",      sub: "Galactic Center",         img: "pic/银河系.jpg" },
    { d: 1.54e21,   name: "大麦哲伦云",      sub: "Large Magellanic Cloud",  img: "pic/大麦哲伦云.jpg" },
    { d: 1.99e21,   name: "小麦哲伦云",      sub: "Small Magellanic Cloud",  img: "pic/大小麦哲伦云.jpg" },
    { d: 2.40e22,   name: "仙女座星系",      sub: "Andromeda · Galaxy",      img: "pic/M31仙女座星系.jpg" },
    { d: 2.70e22,   name: "三角座星系",      sub: "Triangulum · Galaxy",     img: "pic/三角座星系M33.jpg" },
    { d: 1.04e23,   name: "IC 342",          sub: "IC 342 · Galaxy",         img: "pic/IC_342.jpg" },
    { d: 5.5e23,    name: "室女座超星系团",  sub: "Virgo Supercluster",      img: "pic/室女座超星系团.jpg" },
    { d: 5.2e24,    name: "拉尼亚凯亚",      sub: "Laniakea Supercluster",   img: "pic/拉尼亚凯亚超星系团.jpg" },
    { d: 1.5e25,    name: "宇宙空洞",        sub: "Cosmic Void",             img: "pic/宇宙空洞_1.jpg" },
    { d: 9.46e25,   name: "武仙-北冕座长城", sub: "Hercules-Corona Borealis",img: "pic/武仙-北冕座长城.jpg" },
    { d: 4.40e26,   name: "可观测宇宙",      sub: "Observable Universe",     img: "pic/可观测宇宙_1.jpg" }
];
PLANETS.forEach(p => { p.logD = Math.log10(p.d); });

// ---------- 星空数据 ----------
let stars = [];
let galaxyStars = [];
let canvasW = 0, canvasH = 0;

// ---------- 视图状态 ----------
let viewLogD = 3; // 当前视口中心的log尺度
let viewSmooth = 3; // 平滑插值
let visibleRange = 0.2; // 视口显示的log范围（±0.1），间距拉宽15倍
let cosmosInited = false; // 是否已初始化

// ==================================================
//  初始化星空背景
// ==================================================
function initStars(w, h) {
    stars = [];
    galaxyStars = [];

    // 远景星星（白色小点）
    for (let i = 0; i < 200; i++) {
        stars.push({
            x: Math.random() * w,
            y: Math.random() * h,
            r: Math.random() * 1.2 + 0.2,
            alpha: Math.random() * 0.6 + 0.2,
            twinkle: Math.random() * Math.PI * 2,
            speed: Math.random() * 0.5 + 0.5
        });
    }

    // 银河带星星（更密集，有色彩）
    const galX = w * 0.75;
    const galY = h * 0.25;
    for (let i = 0; i < 150; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.pow(Math.random(), 0.5) * Math.min(w, h) * 0.4;
        galaxyStars.push({
            x: galX + Math.cos(angle) * dist * 0.4,
            y: galY + Math.sin(angle) * dist * 0.25,
            r: Math.random() * 1.5 + 0.3,
            alpha: Math.random() * 0.5 + 0.1,
            color: ['#ffddaa', '#aaccff', '#ffffff', '#ccbbee'][Math.floor(Math.random() * 4)],
            twinkle: Math.random() * Math.PI * 2,
            speed: Math.random() * 0.8 + 0.3
        });
    }
}

// ==================================================
//  绘制深空背景
// ==================================================
function drawBackground(ctx, w, h, time) {
    // 深空渐变背景
    const grad = ctx.createRadialGradient(
        w * 0.8, h * 0.15, 0,
        w * 0.5, h * 0.5, Math.max(w, h) * 0.8
    );
    grad.addColorStop(0, "#0a0820");
    grad.addColorStop(0.3, "#050515");
    grad.addColorStop(1, "#000008");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // 银河光晕
    const galGrad = ctx.createRadialGradient(
        w * 0.75, h * 0.2, 0,
        w * 0.75, h * 0.2, Math.min(w, h) * 0.5
    );
    galGrad.addColorStop(0, "rgba(180, 140, 220, 0.15)");
    galGrad.addColorStop(0.5, "rgba(100, 80, 180, 0.08)");
    galGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = galGrad;
    ctx.fillRect(0, 0, w, h);

    // 远景星星（闪烁）
    for (const s of stars) {
        const tw = Math.sin(time * 0.001 * s.speed + s.twinkle) * 0.3 + 0.7;
        ctx.globalAlpha = s.alpha * tw;
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
    }

    // 银河星星
    for (const s of galaxyStars) {
        const tw = Math.sin(time * 0.0015 * s.speed + s.twinkle) * 0.4 + 0.6;
        ctx.globalAlpha = s.alpha * tw;
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.globalAlpha = 1;
}

// ==================================================
//  构建星球DOM
// ==================================================
function buildPlanets() {
    const container = document.getElementById("cosmos_planets");
    container.innerHTML = "";
    PLANETS.forEach((p, i) => {
        const el = document.createElement("div");
        el.className = "cosmos-planet";
        el.dataset.idx = i;
        el.style.opacity = "0";

        const orb = document.createElement("div");
        orb.className = "cp-orb";
        if (p.star) orb.classList.add("is-star");
        if (p.ring) orb.classList.add("has-ring");
        orb.style.backgroundImage = `url(${p.img})`;

        const label = document.createElement("div");
        label.className = "cp-label";
        label.innerHTML = p.name + `<span class="cp-sub">${p.sub || ""}</span>`;

        el.appendChild(orb);
        el.appendChild(label);
        container.appendChild(el);
    });
}

// ==================================================
//  格式化尺寸文本
// ==================================================
function formatSize(d) {
    const logD = Math.log10(d);
    if (!Number.isFinite(logD)) return "∞";
    if (logD < 3) return d.toFixed(0) + " meters";
    if (logD < 6) return (d / 1000).toFixed(d < 1e4 ? 1 : 0) + " km";
    if (logD < 9) return (d / 1e6).toFixed(1) + " × 10³ km";
    if (logD < 12) return (d / 1e9).toFixed(1) + " × 10⁶ km";
    if (logD < 16) return (d / 1e12).toFixed(1) + " AU";
    if (logD < 19) return (d / (9.46e15)).toFixed(1) + " ly";
    if (logD < 22) return (d / (3.086e16)).toFixed(1) + " pc";
    if (logD < 25) return (d / (3.086e19)).toFixed(1) + " kpc";
    // 超大值用科学计数法，避免 toFixed 返回超长字符串
    const gly = d / (9.46e24);
    if (!Number.isFinite(gly) || gly > 1e15) {
        return "10^" + (logD - 24.976).toFixed(1) + " ly";
    }
    return gly.toFixed(1) + " Gly";
}

// ==================================================
//  logD → 屏幕X坐标（相对视口）
// ==================================================
function logDToX(logD, centerLogD, w) {
    const range = visibleRange;
    const rel = (logD - centerLogD) / range;
    return w * 0.5 + rel * w * 0.42;
}

// ==================================================
//  获取当前视口附近的星球
// ==================================================
function getVisiblePlanets(centerLogD) {
    const range = visibleRange + 0.5;
    const result = [];
    for (let i = 0; i < PLANETS.length; i++) {
        const p = PLANETS[i];
        if (Math.abs(p.logD - centerLogD) <= range) {
            result.push(i);
        }
    }
    return result;
}

// ==================================================
//  计算星球显示大小（基于log尺度）
// ==================================================
function calcPlanetSize(p, centerLogD, h) {
    // 星球大小：与视口中心的距离越近越大
    const dist = Math.abs(p.logD - centerLogD);
    const maxDist = visibleRange;
    const sizeFactor = Math.max(0.15, 1 - dist / maxDist * 0.6);

    // 基准大小基于星球直径（但限制范围）
    const relSize = Math.pow(10, (p.logD - centerLogD) * 0.15);
    const clampedSize = Math.max(0.3, Math.min(2.5, relSize));

    const baseSize = Math.min(h * 0.28, 140);
    return baseSize * clampedSize * sizeFactor;
}

// ==================================================
//  主渲染函数
// ==================================================
function renderTrack() {
    const s = state.s;
    if (!s || s.man === 0 || s.man <= 0) return;

    // 确保已初始化
    if (!cosmosInited) {
        initCosmos();
        if (!cosmosInited) return;
    }

    const canvas = document.getElementById("cosmos_bg");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const w = canvas.width, h = canvas.height;
    if (w === 0 || h === 0) return;

    // 计算当前距离对应的log尺度
    const logS = s.exp + Math.log10(s.man);
    viewLogD = logS;

    // 平滑插值
    viewSmooth += (viewLogD - viewSmooth) * 0.08;
    if (Math.abs(viewLogD - viewSmooth) > 4) viewSmooth = viewLogD;

    const time = performance.now();

    // 绘制背景
    drawBackground(ctx, w, h, time);

    // 绘制底部标尺刻度线
    drawRulerTicks(ctx, w, h);

    // 更新星球
    const planetContainer = document.getElementById("cosmos_planets");
    if (!planetContainer) return;
    const planets = planetContainer.children;
    const visible = getVisiblePlanets(viewSmooth);
    const visibleSet = new Set(visible);

    for (let i = 0; i < PLANETS.length; i++) {
        const el = planets[i];
        const p = PLANETS[i];
        if (!el) continue;
        if (!visibleSet.has(i)) {
            el.style.opacity = "0";
            continue;
        }

        const x = logDToX(p.logD, viewSmooth, w);
        const size = calcPlanetSize(p, viewSmooth, h);
        const dist = Math.abs(p.logD - viewSmooth);
        const opacity = Math.max(0.2, 1 - dist / (visibleRange + 0.5) * 0.7);

        // y坐标：中心附近的星球更高（更突出）
        const yOffset = (1 - dist / visibleRange) * h * 0.15;
        const y = h * 0.45 - yOffset - size * 0.3;

        el.style.opacity = opacity.toFixed(2);
        el.style.left = (x - size / 2) + "px";
        el.style.top = y + "px";
        el.style.zIndex = Math.floor(100 - dist * 20);

        const orb = el.querySelector(".cp-orb");
        if (orb) {
            orb.style.width = size + "px";
            orb.style.height = size + "px";
        }
    }

    // 更新飞船位置（在标尺上）
    const ship = document.getElementById("cosmos_ship");
    if (ship) {
        const shipX = logDToX(viewLogD, viewSmooth, w);
        ship.style.left = (shipX - 12) + "px";

        // 速度光晕强度
        let vLog = 0;
        if (state.v && state.v.man > 0) {
            vLog = state.v.exp + Math.log10(state.v.man);
        }
        const vIntensity = Math.max(0, Math.min(1, (vLog + 2) / 20));
        const glow = 6 + vIntensity * 20;
        ship.style.filter = `drop-shadow(0 0 ${glow}px #00ff88) drop-shadow(0 0 ${glow * 1.5}px #00ffaa)`;
    }

    // 更新标尺标签
    const rulerLabel = document.getElementById("ruler_label");
    if (rulerLabel) {
        const currentD = Math.pow(10, viewSmooth);
        rulerLabel.textContent = formatSize(currentD);
    }

    // 更新旅程信息条
    updateTrackInfo(viewLogD);
}

// ==================================================
//  绘制标尺刻度
// ==================================================
function drawRulerTicks(ctx, w, h) {
    const rulerY = h * 0.78;
    const range = visibleRange;
    const center = viewSmooth;

    ctx.strokeStyle = "rgba(100, 170, 255, 0.3)";
    ctx.fillStyle = "rgba(150, 190, 255, 0.5)";
    ctx.font = "10px monospace";
    ctx.textAlign = "center";

    // 绘制刻度（每1个log单位一个主刻度，0.2一个小刻度）
    const startLog = Math.floor(center - range - 0.5);
    const endLog = Math.ceil(center + range + 0.5);

    for (let log = startLog; log <= endLog; log += 1) {
        const x = logDToX(log, center, w);
        if (x < 0 || x > w) continue;

        // 主刻度
        ctx.beginPath();
        ctx.moveTo(x, rulerY - 6);
        ctx.lineTo(x, rulerY + 6);
        ctx.strokeStyle = "rgba(100, 170, 255, 0.6)";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // 刻度标签 — 避免 Math.pow(10, log) 溢出 (log>308 → Infinity)
        let label;
        if (log < 3) label = "10^" + log + "m";
        else if (log < 6) {
            const d = Math.pow(10, log);
            label = (d / 1000).toFixed(0) + "km";
        }
        else if (log < 12) label = "10^" + (log - 3) + "km";
        else if (log < 16) label = "10^" + (log - 12) + " AU";
        else if (log < 22) label = "10^" + (log - 16) + " ly";
        else label = "10^" + (log - 22) + " kpc";

        ctx.fillStyle = "rgba(130, 180, 255, 0.7)";
        ctx.fillText(label, x, rulerY + 18);
    }

    // 小刻度
    ctx.strokeStyle = "rgba(100, 170, 255, 0.2)";
    ctx.lineWidth = 1;
    for (let log = startLog; log <= endLog; log += 0.2) {
        const x = logDToX(log, center, w);
        if (x < 0 || x > w) continue;
        if (Math.abs((log * 10) % 10) < 0.01) continue; // 跳过主刻度位置

        ctx.beginPath();
        ctx.moveTo(x, rulerY - 3);
        ctx.lineTo(x, rulerY + 3);
        ctx.stroke();
    }
}

// ==================================================
//  更新旅程信息条
// ==================================================
function updateTrackInfo(logS) {
    // 找到当前和下一个里程碑
    let cIdx = 0;
    for (let i = 0; i < PLANETS.length; i++) {
        if (PLANETS[i].logD <= logS) cIdx = i;
    }
    // 找到下一个距离不同的里程碑（跳过同距星球，防除零）
    let nextIdx = cIdx;
    for (let i = cIdx + 1; i < PLANETS.length; i++) {
        if (PLANETS[i].logD > PLANETS[cIdx].logD + 1e-9) {
            nextIdx = i;
            break;
        }
    }
    if (nextIdx === cIdx) nextIdx = PLANETS.length - 1;

    const baseExp = PLANETS[cIdx].logD;
    const nextExp = PLANETS[nextIdx].logD;
    const span = nextExp - baseExp;
    const progress = span > 0 ? Math.max(0, Math.min(1, (logS - baseExp) / span)) : 0;

    const curEl = document.getElementById("track_landmark_current");
    const nextEl = document.getElementById("track_landmark_next");
    const progEl = document.getElementById("track_progress_text");
    const speedEl = document.getElementById("track_speed");

    // 超过最后一个行星时显示更友好
    const beyondLast = logS > PLANETS[PLANETS.length - 1].logD + 1;

    if (curEl) curEl.textContent = "🪐 " + PLANETS[cIdx].name;
    if (nextEl) {
        if (beyondLast) {
            nextEl.textContent = "→ 超越可观测宇宙";
        } else {
            nextEl.textContent = "→ " + PLANETS[nextIdx].name;
        }
    }
    if (progEl) {
        if (beyondLast) {
            progEl.textContent = `10^${baseExp.toFixed(1)} → ∞ (${toDisplayNum(progress * 100)}%)`;
        } else {
            progEl.textContent =
                `10^${baseExp.toFixed(1)} → 10^${nextExp.toFixed(1)} ` +
                `(${toDisplayNum(progress * 100)}%)`;
        }
    }
    if (speedEl) {
        let vLog = 0;
        if (state.v && state.v.man > 0) {
            vLog = state.v.exp + Math.log10(state.v.man);
        }
        const vIntensity = Math.max(0, Math.min(1, (vLog + 2) / 20));
        const speedChars = ["▶", "▶▶", "▶▶▶", "▶▶▶▶", "🚀"];
        const speedIdx = Math.min(speedChars.length - 1,
                                  Math.floor(vIntensity * speedChars.length));
        speedEl.textContent = speedChars[speedIdx];
    }
}

// ==================================================
//  初始化
// ==================================================
function initCosmos() {
    const canvas = document.getElementById("cosmos_bg");
    if (!canvas) return;
    if (cosmosInited) return;

    const resize = () => {
        canvas.width  = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        canvasW = canvas.width;
        canvasH = canvas.height;
        initStars(canvasW, canvasH);
    };
    resize();
    window.addEventListener("resize", resize);

    buildPlanets();
    cosmosInited = true;
}

// 等待DOM加载
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCosmos);
} else {
    initCosmos();
}
