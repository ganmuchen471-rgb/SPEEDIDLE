// ==================================================
//          SPEED IDLE — 跃迁版
// ==================================================
// ✅ 速度解锁超越 (v > 3e8)
// ✅ BP = BP + lg(V)^0.75
// ✅ 超越碎片 + 自动化
// ✅ 购买 1/10/100 + 买最大
// ✅ Tab 导航 + 悬浮状态栏
// ==================================================

const C = { man: 1, exp: 8 };
const LIGHT_SPEED = { man: 3, exp: 8 };
let lastTime = Date.now();
let sceneEnabled = true;

// ---------- Tab 切换 ----------
function switchTab(name, el) {
    document.querySelectorAll(".tab-page").forEach(p => p.classList.remove("active"));
    document.querySelectorAll(".tab-nav .tab-btn").forEach(b => b.classList.remove("active"));
    const page = document.getElementById("tab_" + name);
    if (page) page.classList.add("active");
    if (el) el.classList.add("active");
    if (name === "distance" && cosmosInited) {
        const canvas = document.getElementById("cosmos_bg");
        if (canvas) {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        }
    }
    if (name === "leap") updateTranscendUI();
    if (name === "automation") updateAutomationUI();
    if (name === "stats") updateStatsUI();
    if (name === "flow") updateFlowUI();
}

// ---------- 跃迁子导航 ----------
function switchLeapTab(name, el) {
    document.querySelectorAll("#tab_leap .sub-page").forEach(p => p.classList.remove("active"));
    document.querySelectorAll("#tab_leap .sub-btn").forEach(b => b.classList.remove("active"));
    document.getElementById("leap_" + name).classList.add("active");
    if (el) el.classList.add("active");
}

// ---------- 超越三级导航 ----------
function switchTranscendTab(name, el) {
    document.querySelectorAll("#transcend_content .sub-page").forEach(p => p.classList.remove("active"));
    document.querySelectorAll("#transcend_content .sub3-btn").forEach(b => b.classList.remove("active"));
    document.getElementById("tc_" + name).classList.add("active");
    if (el) el.classList.add("active");
}

// ---------- 距离子导航 ----------
function switchDistTab(name, el) {
    document.querySelectorAll("#tab_distance .sub-page").forEach(p => p.classList.remove("active"));
    document.querySelectorAll("#tab_distance .sub-btn").forEach(b => b.classList.remove("active"));
    document.getElementById("dist_" + name).classList.add("active");
    if (el) el.classList.add("active");
}

// ---------- 悬浮状态栏更新 ----------
function updateFloatBar() {
    const bar = document.getElementById("float_bar");
    if (!bar || bar.style.display === "none") return;
    const fbS = document.getElementById("fb_s");
    const fbRate = document.getElementById("fb_rate");
    const fbV = document.getElementById("fb_v");
    const fbLandmark = document.getElementById("fb_landmark");
    if (fbS) fbS.textContent = toDisplay(state.s);
    if (fbRate) fbRate.textContent = formatDistanceRate();
    if (fbV) fbV.textContent = toDisplay(state.v);
    if (fbLandmark) {
        const cur = document.getElementById("track_landmark_current");
        fbLandmark.textContent = cur ? cur.textContent : "—";
    }
}

// ---------- BP 状态条更新（距离页顶部） ----------
function updateBPBar() {
    const bar = document.getElementById("bp_bar");
    if (!bar) return;
    if (!transcendUnlocked && state.bp.man === 0 && state.tpLevel <= 0 && !state.frag1 && !state.frag2 && !state.frag3 && !state.frag5 && !state.frag6) {
        bar.style.display = "none";
        return;
    }
    bar.style.display = "flex";
    const valEl = document.getElementById("bp_bar_value");
    const discEl = document.getElementById("bp_bar_discount");
    const tpEl = document.getElementById("bp_bar_tp");
    if (valEl) valEl.textContent = toDisplay(state.bp);
    const discount = getBPDiscount();
    if (discEl) {
        discEl.textContent = discount < 1 ? ("×" + toDisplayNum(discount)) : t("status.noDiscount");
        discEl.style.color = discount < 1 ? "#ffaa00" : "#008855";
    }
    if (tpEl) tpEl.textContent = "+" + toDisplay(muil(change(state.tpLevel), change(10))) + "%";
}

// ---------- 设置项绑定 ----------
document.addEventListener("DOMContentLoaded", () => {
    // 悬浮状态栏
    const fbCheckbox = document.getElementById("setting_float_bar");
    if (fbCheckbox) {
        fbCheckbox.addEventListener("change", () => {
            gameSettings.floatBar = fbCheckbox.checked;
            applySettingsToUI();
            const bar = document.getElementById("float_bar");
            if (bar) bar.style.display = gameSettings.floatBar ? "flex" : "none";
            if (currentSlot !== null) saveGameSilent(currentSlot);
        });
    }
    // 场景动画
    const sceneCheckbox = document.getElementById("setting_scene");
    if (sceneCheckbox) {
        sceneCheckbox.addEventListener("change", () => {
            gameSettings.scene = sceneCheckbox.checked;
            applySettingsToUI();
            const scene = document.getElementById("cosmos_scene");
            if (scene) scene.style.display = gameSettings.scene ? "" : "none";
            if (currentSlot !== null) saveGameSilent(currentSlot);
        });
    }
    // 科学计数法精度滑块
    const precSlider = document.getElementById("setting_sci_precision");
    if (precSlider) {
        precSlider.addEventListener("input", () => {
            gameSettings.sciPrecision = parseInt(precSlider.value);
            applySettingsToUI();
            render();
        });
        precSlider.addEventListener("change", () => {
            if (currentSlot !== null) saveGameSilent(currentSlot);
        });
    }
    // 自定义计数法
    const customInput = document.getElementById("setting_custom_notation");
    if (customInput) {
        customInput.addEventListener("input", () => {
            const val = customInput.value;
            // 验证：至少10个不重复字符
            const unique = new Set(val);
            if (val.length >= 10 && unique.size >= 10) {
                gameSettings.customNotation = val;
            } else {
                gameSettings.customNotation = "";
            }
            applySettingsToUI();
            render();
        });
        customInput.addEventListener("change", () => {
            if (currentSlot !== null) saveGameSilent(currentSlot);
        });
    }
    // 离线Ticks上限滑块
    const ticksSlider = document.getElementById("setting_offline_ticks");
    if (ticksSlider) {
        ticksSlider.addEventListener("input", () => {
            gameSettings.offlineTicksLimit = parseInt(ticksSlider.value);
            applySettingsToUI();
        });
        ticksSlider.addEventListener("change", () => {
            if (currentSlot !== null) saveGameSilent(currentSlot);
        });
    }
    // 离线进度开关
    const offlineCb = document.getElementById("setting_offline_progress");
    if (offlineCb) {
        offlineCb.addEventListener("change", () => {
            gameSettings.offlineProgress = offlineCb.checked;
            applySettingsToUI();
            updateFlowUI();
            if (currentSlot !== null) saveGameSilent(currentSlot);
        });
    }
    // 自动保存间隔滑块（离散选项：1/3/5/10/15/30/60秒）
    const autoSaveSlider = document.getElementById("setting_autosave_interval");
    if (autoSaveSlider) {
        autoSaveSlider.addEventListener("input", () => {
            const idx = parseInt(autoSaveSlider.value);
            gameSettings.autoSaveInterval = AUTOSAVE_OPTIONS[idx];
            applySettingsToUI();
        });
        autoSaveSlider.addEventListener("change", () => {
            setupAutoSave(); // 重新设置定时器
            if (currentSlot !== null) saveGameSilent(currentSlot);
        });
    }
    // 确认开关 - 超越重置
    const confirmTcCb = document.getElementById("setting_confirm_transcend");
    if (confirmTcCb) {
        confirmTcCb.addEventListener("change", () => {
            gameSettings.confirmTranscend = confirmTcCb.checked;
            applySettingsToUI();
            if (currentSlot !== null) saveGameSilent(currentSlot);
        });
    }
    // 确认开关 - 量子重置
    const confirmQmCb = document.getElementById("setting_confirm_quantum");
    if (confirmQmCb) {
        confirmQmCb.addEventListener("change", () => {
            gameSettings.confirmQuantum = confirmQmCb.checked;
            applySettingsToUI();
            if (currentSlot !== null) saveGameSilent(currentSlot);
        });
    }
    // 确认开关 - 重置游戏
    const confirmRstCb = document.getElementById("setting_confirm_reset");
    if (confirmRstCb) {
        confirmRstCb.addEventListener("change", () => {
            gameSettings.confirmReset = confirmRstCb.checked;
            applySettingsToUI();
            if (currentSlot !== null) saveGameSilent(currentSlot);
        });
    }
    // 构建元素周期表
    buildElementGrid();
    // 生成存档槽位卡片
    generateSaveSlots();
    // 应用设置到UI
    applySettingsToUI();
    // 应用翻译
    applyTranslations();
    // 刷新存档槽位状态（autoLoad在DOMContentLoaded前运行，卡片此时才生成）
    updateSaveSlots();
});

// ---------- 构建元素周期表 ----------
// 真实周期表布局：18列，7行 + 镧系/锕系2行
// 每个元素的位置映射（period, group）
const ELEMENT_POSITIONS = {
    1: [1,1], 2: [1,18],
    3: [2,1], 4: [2,2], 5: [2,13], 6: [2,14], 7: [2,15], 8: [2,16], 9: [2,17], 10: [2,18],
    11: [3,1], 12: [3,2], 13: [3,13], 14: [3,14], 15: [3,15], 16: [3,16], 17: [3,17], 18: [3,18],
    19: [4,1], 20: [4,2], 21: [4,3], 22: [4,4], 23: [4,5], 24: [4,6], 25: [4,7], 26: [4,8], 27: [4,9], 28: [4,10], 29: [4,11], 30: [4,12], 31: [4,13], 32: [4,14], 33: [4,15], 34: [4,16], 35: [4,17], 36: [4,18],
    37: [5,1], 38: [5,2], 39: [5,3], 40: [5,4], 41: [5,5], 42: [5,6], 43: [5,7], 44: [5,8], 45: [5,9], 46: [5,10], 47: [5,11], 48: [5,12], 49: [5,13], 50: [5,14], 51: [5,15], 52: [5,16], 53: [5,17], 54: [5,18],
    55: [6,1], 56: [6,2],
    72: [6,4], 73: [6,5], 74: [6,6], 75: [6,7], 76: [6,8], 77: [6,9], 78: [6,10], 79: [6,11], 80: [6,12], 81: [6,13], 82: [6,14], 83: [6,15], 84: [6,16], 85: [6,17], 86: [6,18],
    87: [7,1], 88: [7,2],
    104: [7,4], 105: [7,5], 106: [7,6], 107: [7,7], 108: [7,8], 109: [7,9], 110: [7,10], 111: [7,11], 112: [7,12], 113: [7,13], 114: [7,14], 115: [7,15], 116: [7,16], 117: [7,17], 118: [7,18],
    // 镧系 (57-71): 第8行，group 3-17
    57: [9,3], 58: [9,4], 59: [9,5], 60: [9,6], 61: [9,7], 62: [9,8], 63: [9,9], 64: [9,10], 65: [9,11], 66: [9,12], 67: [9,13], 68: [9,14], 69: [9,15], 70: [9,16], 71: [9,17],
    // 锕系 (89-103): 第9行，group 3-17
    89: [10,3], 90: [10,4], 91: [10,5], 92: [10,6], 93: [10,7], 94: [10,8], 95: [10,9], 96: [10,10], 97: [10,11], 98: [10,12], 99: [10,13], 100: [10,14], 101: [10,15], 102: [10,16], 103: [10,17]
};

// 当前选中的元素
let selectedElementNum = null;

// 获取已实装元素列表（按编号排序）
function getImplementedElements() {
    return ELEMENTS.filter(e => e.cost > 0).sort((a, b) => a.num - b.num);
}

// 获取元素的行号（period）
function getElementRow(num) {
    const pos = ELEMENT_POSITIONS[num];
    return pos ? pos[0] : 0;
}

// 获取某一行中所有已实装的元素
function getImplementedElementsInRow(row) {
    return ELEMENTS.filter(e => e.cost > 0 && getElementRow(e.num) === row);
}

// 获取所有有已实装元素的行号，按从上到下排序
function getRowsWithImplementedElements() {
    const rows = new Set();
    ELEMENTS.forEach(e => {
        if (e.cost > 0) rows.add(getElementRow(e.num));
    });
    return Array.from(rows).sort((a, b) => a - b);
}

// 检查某一行是否已完成（所有已实装元素都已购买）
function isRowComplete(row) {
    const elems = getImplementedElementsInRow(row);
    if (elems.length === 0) return true;
    return elems.every(e => state.elementsOwned.includes(e.num));
}

// 检查某一行是否已解锁（可购买其中的元素）
function isRowUnlocked(row) {
    const rows = getRowsWithImplementedElements();
    const idx = rows.indexOf(row);
    if (idx === -1) return false; // 该行没有已实装元素
    if (idx === 0) return true; // 第一行总是解锁
    // 检查前面所有行是否都已完成
    for (let i = 0; i < idx; i++) {
        if (!isRowComplete(rows[i])) return false;
    }
    return true;
}

// 检查元素是否已解锁（可购买）- 基于行解锁机制
function isElementUnlocked(num) {
    const elem = ELEMENTS.find(e => e.num === num);
    if (!elem || elem.cost === 0) return false;
    if (state.elementsOwned.includes(num)) return true;
    return isRowUnlocked(getElementRow(num));
}

function buildElementGrid() {
    const grid = document.getElementById("element_grid");
    if (!grid) return;
    let html = '<div class="periodic-table" id="periodic_table_inner">';
    // 10行（7主行 + 空行 + 镧系 + 锕系），18列
    const rows = 10;
    const cols = 18;
    // 创建网格
    for (let r = 1; r <= rows; r++) {
        for (let c = 1; c <= cols; c++) {
            // 跳过空行（第8行）
            if (r === 8) { if (c === 1) html += '<div style="grid-column:1/19;height:8px;"></div>'; continue; }
            // 查找该位置的元素
            let elem = null;
            for (const e of ELEMENTS) {
                const pos = ELEMENT_POSITIONS[e.num];
                if (pos && pos[0] === r && pos[1] === c) { elem = e; break; }
            }
            if (elem) {
                const implemented = elem.cost > 0;
                const clickHandler = implemented ? 'selectElement(' + elem.num + ')' : '';
                html += `<div class="elem-cell" id="elem_${elem.num}" style="grid-row:${r};grid-column:${c};" onclick="${clickHandler}">`;
                html += `<div class="elem-num">${elem.num}</div>`;
                html += `<div class="elem-sym">${elem.symbol}</div>`;
                html += `<div class="elem-name">${elem.name}</div>`;
                html += '</div>';
            } else {
                html += `<div style="grid-row:${r};grid-column:${c};"></div>`;
            }
        }
    }
    html += '</div>';
    grid.innerHTML = html;
    // 首次构建后更新状态
    updateElementGridStatus();
}

// 仅更新元素格子的状态样式（不重建DOM，避免滚动位置重置）
function updateElementGridStatus() {
    for (const elem of ELEMENTS) {
        const cell = document.getElementById("elem_" + elem.num);
        if (!cell) continue;
        const owned = state.elementsOwned.includes(elem.num);
        const implemented = elem.cost > 0;
        const unlocked = isElementUnlocked(elem.num);

        // 更新样式类
        let cls = "elem-cell";
        if (owned) cls += " owned";
        if (!implemented) cls += " unimpl";
        if (implemented && !owned && !unlocked) cls += " locked";
        if (selectedElementNum === elem.num) cls += " selected";
        cell.className = cls;

        // 更新锁图标
        const existingLock = cell.querySelector(".elem-lock-icon");
        if (implemented && !owned && !unlocked) {
            if (!existingLock) {
                const lockDiv = document.createElement("div");
                lockDiv.className = "elem-lock-icon";
                lockDiv.textContent = "🔒";
                cell.appendChild(lockDiv);
            }
        } else {
            if (existingLock) existingLock.remove();
        }
    }
}

// 选中元素，在顶部显示详情
function selectElement(num) {
    const elem = ELEMENTS.find(e => e.num === num);
    if (!elem) return;
    selectedElementNum = num;
    const detailEl = document.getElementById("elem_detail");
    if (!detailEl) return;
    const owned = state.elementsOwned.includes(num);
    const unlocked = isElementUnlocked(num);
    const cost = change(elem.cost);
    const canAfford = gte(state.quantumPoints, cost);
    
    let html = '<div class="elem-detail-card">';
    html += `<div class="elem-detail-header">`;
    html += `<div class="elem-detail-num">${elem.num}</div>`;
    html += `<div class="elem-detail-info">`;
    html += `<div class="elem-detail-name">${elem.symbol} · ${elem.name} <span style="color:#8866aa;font-size:14px;">(${elem.enName})</span></div>`;
    html += `<div class="elem-detail-desc">${elem.desc}</div>`;
    html += `</div></div>`;
    html += `<div class="elem-detail-action">`;
    if (owned) {
        html += `<button class="elem-detail-btn owned" disabled>${t("elements.bought")}</button>`;
    } else if (!unlocked) {
        // 行锁定状态 - 显示需要完成哪一行
        const row = getElementRow(num);
        const rows = getRowsWithImplementedElements();
        const idx = rows.indexOf(row);
        // 找到上一个未完成的行
        let blockedBy = "";
        for (let i = 0; i < idx; i++) {
            if (!isRowComplete(rows[i])) {
                const elemsInRow = getImplementedElementsInRow(rows[i]);
                const missing = elemsInRow.filter(e => !state.elementsOwned.includes(e.num));
                const missingNames = missing.map(e => e.symbol + "(" + e.name + ")").join(", ");
                blockedBy = t("elements.lockedNeed") + rows[i] + t("elements.lockedNeedMid") + missingNames;
                break;
            }
        }
        html += `<div style="text-align:center; padding:12px; color:#ff6666; font-size:13px;">${blockedBy || t("elements.lockedMsg")}</div>`;
    } else {
        html += `<button class="elem-detail-btn ${canAfford ? '' : 'disabled'}" ${canAfford ? '' : 'disabled'} onclick="buyElement(${num})">${t("elements.buy")}${toDisplay(cost)} QP</button>`;
    }
    html += `</div>`;
    html += '</div>';
    detailEl.innerHTML = html;
    
    // 更新网格中的选中状态
    document.querySelectorAll(".elem-cell.selected").forEach(el => el.classList.remove("selected"));
    const cell = document.getElementById("elem_" + num);
    if (cell) cell.classList.add("selected");
}

// ---------- 游戏状态 ----------
const state = {
    s: { man: 1, exp: 0 },
    v: { man: 1, exp: 0 },
    a: { man: 1, exp: -3 },
    j: { man: 1, exp: -6 },
    vLevel: 0,
    aLevel: 0,
    jLevel: 0,
    bp: { man: 0, exp: 0 },
    tpLevel: 0,
    transcendCount: 0,
    // 碎片
    frag1: false,
    frag2: false,
    frag3: false,
    frag4: false,
    frag5: false,
    frag6: false,
    // 升级购买总次数（碎片6用）
    upgradeBuyCount: 0,
    // 自动化
    autoV: { enabled: false, level: 0 },
    autoA: { enabled: false, level: 0 },
    autoJ: { enabled: false, level: 0 },
    autoTranscend: {
        enabled: false,
        condInterval: false, intervalSec: 60,
        condBPAmount: false, bpAmount: "1",
        condBPMult: false, bpMult: 2
    },
    // 距离升级（一次性）
    distU1_1: false, // 速度效果 ×2
    distU1_2: false, // 速度以 log100(1+v) 倍率加强自身
    distU1_3: false, // 免费 v 等级 = log100(距离最大值+1)
    // 距离升级（可重复）
    distU2_1: 0, // 升级3价格 ×0.7^n
    distU2_1_bonus: 0, // 量子里程碑1赠送的额外U2-1（不计入购买数量）
    distU2_2: 0, // 急动度生产速度
    maxDist: { man: 1, exp: 0 }, // 历史最大距离
    // 超越里程碑
    milestones: [], // 记录已解锁的里程碑索引
    // 量子层级
    quantumPoints: { man: 0, exp: 0 },
    quantumCount: 0,
    quantumMilestones: [],
    upgrade6Level: 0,
    upgrade7Level: 0, // 升级7：量子点获取量*2，最多1000次
    quantumUnlocked: false,
    // 元素周期表
    elementsOwned: [], // 已购买的元素编号
    autoFrag: { enabled: false }, // 元素1：自动购买超越碎片
    autoDistUpgrade: { enabled: false }, // 元素4：自动购买距离升级
    autoTranscendUpgrade: { enabled: false }, // 元素4：自动购买超越升级
    autoQuantum: { enabled: false, condBPAmount: false, bpAmount: "10000" }, // 元素7：自动量子
    tp5Level: 0, // 升级5等级（元素5解锁）
    autoBuyMode: 1, // 自动化购买模式：1=每次1级，0=最大
    // 统计数据
    totalDistanceProduced: { man: 0, exp: 0 }, // 总共生产的距离（只增不减）
    gameStartTime: 0, // 游戏开始时间戳
    totalPlayTime: 0, // 累计游戏总时间（秒）
    transcendStartTime: 0, // 本次超越开始时间戳
    minTranscendTime: Infinity, // 超越最少用时记录（秒）
    quantumStartTime: 0, // 本次量子开始时间戳
    minQuantumTime: Infinity, // 量子最少用时记录（秒）
    // 离线流量系统
    offlineFlow: {
        stored: 1800, // 存储的流量（秒），初始30分钟
        storageLimit: 36000, // 存储上限（秒），初始10:00:00
        conversionRateLevel: 0, // 转换率购买等级
        storageLimitLevel: 0, // 存储上限购买等级
        speedMultiplier: 1, // 当前激活的速度倍率
    },
    // 核反应堆
    reactor: {
        // 5层: [0]=层1(生产复制能量), [1]=层2, [2]=层3, [3]=层4, [4]=层5(顶层)
        layers: [
            { quantity: 0, efficiency: 1, purchaseCount: 0 },
            { quantity: 0, efficiency: 1, purchaseCount: 0 },
            { quantity: 0, efficiency: 1, purchaseCount: 0 },
            { quantity: 0, efficiency: 1, purchaseCount: 0 },
            { quantity: 0, efficiency: 1, purchaseCount: 0 },
        ],
        replicationEnergy: 1, // 复制能量，初始为1
    },
    // 超越挑战
    challenges: {
        activeChallenge: -1, // -1 = 无活跃挑战
        challengeStartTime: 0, // 挑战开始时间戳
        completed: [false, false, false, false, false, false], // 完成状态
        bestTimes: [1e300, 1e300, 1e300, 1e300, 1e300, 1e300], // 最快记录(秒)
        c5_t: 0, // 挑战5的t值
        c6_accumulator: 0, // 挑战6的时间累积器
    },
    // 挑战奖励 (量子重置会重置)
    challengeRewards: [false, false, false, false, false, false],
    // 距离升级U1-4 (挑战2奖励解锁)
    distU1_4: false,
};

// ---------- 每存档独立设置 ----------
let gameSettings = {
    sciPrecision: 3, // 科学计数法小数位数 (3-20)
    customNotation: "", // 自定义计数法字符串（空=不启用）
    offlineTicksLimit: 100000, // 离线Ticks存储上限 (100-5000000)
    offlineProgress: true, // 离线进度开关
    autoSaveInterval: 1, // 自动保存间隔（秒）：1/3/5/10/15/30/60
    floatBar: true, // 悬浮状态栏
    scene: true, // 场景动画
    confirmTranscend: true, // 超越重置确认
    confirmQuantum: true, // 量子重置确认
    confirmReset: true, // 重置游戏确认
};

// 自动保存间隔可选值（滑块索引 → 实际秒数）
const AUTOSAVE_OPTIONS = [1, 3, 5, 10, 15, 30, 60];
function autosaveIndexFromSeconds(sec) {
    const idx = AUTOSAVE_OPTIONS.indexOf(sec);
    return idx >= 0 ? idx : 0;
}
function autosaveLabelFromSeconds(sec) {
    return sec < 60 ? (sec + t("set.autoSaveUnit")) : t("set.autoSave1Min");
}

let currentSlot = null;

// ==================================================
//          Toast 通知系统
// ==================================================
function showToast(msg, type) {
    type = type || "info"; // info | success | error | warn
    const colors = {
        info: "#00aa55",
        success: "#00ff88",
        error: "#ff4444",
        warn: "#ffaa00"
    };
    const toast = document.createElement("div");
    toast.style.cssText = "position:fixed;top:60px;left:50%;transform:translateX(-50%);background:rgba(0,30,15,0.95);border:2px solid " + colors[type] + ";border-radius:8px;padding:12px 24px;z-index:9999;color:" + colors[type] + ";font-weight:bold;font-size:14px;pointer-events:none;animation:achPop 2.5s ease forwards;text-align:center;white-space:nowrap;max-width:90%;";
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2800);
}

// ==================================================
//          成就系统
// ==================================================
const ACHIEVEMENTS = {
    a1: { name: t("ach.a1.name"), desc: t("ach.a1.desc"), icon: "🎮" },
    a2: { name: t("ach.a2.name"), desc: t("ach.a2.desc"), icon: "💨" },
    a3: { name: t("ach.a3.name"), desc: t("ach.a3.desc"), icon: "🚶" },
    a4: { name: t("ach.a4.name"), desc: t("ach.a4.desc"), icon: "🌙" },
    a5: { name: t("ach.a5.name"), desc: t("ach.a5.desc"), icon: "🤔" },
    a6: { name: t("ach.a6.name"), desc: t("ach.a6.desc"), icon: "✨" },
    a7: { name: t("ach.a7.name"), desc: t("ach.a7.desc"), icon: "💥" },
    a8: { name: t("ach.a8.name"), desc: t("ach.a8.desc"), icon: "🔭" },
    a9: { name: t("ach.a9.name"), desc: t("ach.a9.desc"), icon: "🧩" },
    a10: { name: t("ach.a10.name"), desc: t("ach.a10.desc"), icon: "🧸" },
    a11: { name: t("ach.a11.name"), desc: t("ach.a11.desc"), icon: "🛤️" },
    a12: { name: t("ach.a12.name"), desc: t("ach.a12.desc"), icon: "💰" },
    a13: { name: t("ach.a13.name"), desc: t("ach.a13.desc"), icon: "⚛️" },
    a14: { name: t("ach.a14.name"), desc: t("ach.a14.desc"), icon: "🏅" },
    a15: { name: t("ach.a15.name"), desc: t("ach.a15.desc"), icon: "💫" },
    a16: { name: t("ach.a16.name"), desc: t("ach.a16.desc"), icon: "⬆️" },
    a17: { name: t("ach.a17.name"), desc: t("ach.a17.desc"), icon: "🔬" },
    a18: { name: t("ach.a18.name"), desc: t("ach.a18.desc"), icon: "🎯" },
    a19: { name: t("ach.a19.name"), desc: t("ach.a19.desc"), icon: "🗺️" },
    a20: { name: t("ach.a20.name"), desc: t("ach.a20.desc"), icon: "⚡" }
};

let achievements = {}; // { a1: true, a2: true, ... }

function unlockAchievement(id) {
    if (achievements[id]) return; // 已解锁
    achievements[id] = true;
    const ach = ACHIEVEMENTS[id];
    if (!ach) return;
    // 顶部通知
    showAchievementPopup(ach);
    updateAchievementUI();
    console.log("🏆 " + t("ach.popup") + ach.icon + " " + ach.name);
}

function showAchievementPopup(ach) {
    const popup = document.createElement("div");
    popup.style.cssText = "position:fixed;top:60px;left:50%;transform:translateX(-50%);background:rgba(0,30,15,0.95);border:2px solid #ffcc00;border-radius:8px;padding:12px 24px;z-index:9999;color:#ffcc00;font-weight:bold;font-size:15px;pointer-events:none;animation:achPop 3s ease forwards;text-align:center;white-space:nowrap;";
    popup.innerHTML = ach.icon + " " + t("ach.popup") + ach.name + "<br><span style='font-size:12px;color:#aa8800;'>" + ach.desc + "</span>";
    document.body.appendChild(popup);
    // 添加动画
    if (!document.getElementById("ach_anim_style")) {
        const style = document.createElement("style");
        style.id = "ach_anim_style";
        style.textContent = "@keyframes achPop{0%{opacity:0;top:80px}15%{opacity:1;top:60px}80%{opacity:1;top:60px}100%{opacity:0;top:40px}}";
        document.head.appendChild(style);
    }
    setTimeout(() => popup.remove(), 3200);
}

function checkAchievements() {
    // a1: 购买任何一个升级
    if (state.vLevel > 0 || state.aLevel > 0 || state.jLevel > 0) unlockAchievement("a1");
    // a2: 速度达到 20 m/s
    if (gte(state.v, { man: 2, exp: 1 })) unlockAchievement("a2");
    // a3: 距离达到 1e6 米
    if (gte(state.s, { man: 1, exp: 6 })) unlockAchievement("a3");
    // a4: 距离达到 4e8 米
    if (gte(state.s, { man: 4, exp: 8 })) unlockAchievement("a4");
    // a5: 速度达到 3e7
    if (gte(state.v, { man: 3, exp: 7 })) unlockAchievement("a5");
    // a6: 速度达到 3e8（光速）
    if (gte(state.v, LIGHT_SPEED)) unlockAchievement("a6");
    // a7: 超越点数达到 10
    if (gte(state.bp, { man: 1, exp: 1 })) unlockAchievement("a7");
    // a8: 距离达到 1e12
    if (gte(state.s, { man: 1, exp: 12 })) unlockAchievement("a8");
    // a9: 所有距离升级均购买过1次
    if (state.distU1_1 && state.distU1_2 && state.distU1_3 && state.distU2_1 >= 1 && state.distU2_2 >= 1) unlockAchievement("a9");
    // a10: 购买全部6个超越碎片
    if (state.frag1 && state.frag2 && state.frag3 && state.frag4 && state.frag5 && state.frag6) unlockAchievement("a10");
    // a11: 获取所有超越里程碑
    if (state.milestones.length >= MILESTONES.length) unlockAchievement("a11");
    // a12: 获得 5000 BP
    if (gte(state.bp, { man: 5, exp: 3 })) unlockAchievement("a12");
    // a13: 运行量子重置
    if (state.quantumCount > 0) unlockAchievement("a13");
    // a14: 获得 3 个量子里程碑
    if (state.quantumMilestones.length >= 3) unlockAchievement("a14");
    // a15: Snap 值达到 2
    if (getSnapCount() >= 2) unlockAchievement("a15");
    // a16: 购买 5 个升级6等级
    if (state.upgrade6Level >= 5) unlockAchievement("a16");
    // a17: 解锁元素周期表
    if (state.quantumMilestones.includes(6)) unlockAchievement("a17");
    // 挑战相关成就
    checkChallengeAchievements();
}

function updateAchievementUI() {
    const total = Object.keys(ACHIEVEMENTS).length;
    const unlocked = Object.keys(achievements).length;
    const counter = document.getElementById("ach_counter");
    if (counter) counter.textContent = toDisplayNum(unlocked) + "/" + toDisplayNum(total);

    Object.keys(ACHIEVEMENTS).forEach(id => {
        const card = document.getElementById("ach_" + id);
        if (!card) return;
        if (achievements[id]) {
            card.classList.add("unlocked");
            card.querySelector(".ach-status").textContent = t("ach.unlocked");
        } else {
            card.classList.remove("unlocked");
            card.querySelector(".ach-status").textContent = t("ach.locked");
        }
    });
}

// ---------- 辅助：超越点数折扣系数 ----------
function getBPDiscount() {
    if (isUpgrade45Disabled()) return 1; // 挑战3: BP折扣失效
    if (state.bp.man === 0) return 1;
    const lgBP = state.bp.exp + Math.log10(state.bp.man);
    if (!Number.isFinite(lgBP) || lgBP <= 1) return 1;
    return Math.min(1, 1 / Math.pow(lgBP, 0.5));
}

// ---------- 辅助：TP因子（升级4/5效果倍率） ----------
function getTPFactor() {
    let tpFactor = plus(change(1), muil(change(state.tpLevel), change(0.1)));
    if (state.elementsOwned.includes(5) && state.tp5Level > 0) {
        const u5Mult = plus(change(1), muil(change(0.4), change(state.tp5Level)));
        tpFactor = muil(tpFactor, u5Mult);
    }
    return tpFactor;
}

// ---------- 辅助：升级4有效加成 ----------
function effectiveLevel(baseLevel) {
    let effectiveBase = baseLevel;
    // 挑战6: 等级债务
    const debt = getChallenge6LevelDebt();
    if (debt > 0) effectiveBase = Math.max(0, effectiveBase - debt);

    // 挑战3: 升级4/5失效
    if (isUpgrade45Disabled()) {
        return change(effectiveBase);
    }

    let tpFactor = getTPFactor();
    return muil(change(effectiveBase), tpFactor);
}

// ---------- 升级5 ----------
function getUpgrade5Cost() {
    // 初始价格100BP，每次购买价格*5
    return muil(change(100), power(change(5), change(state.tp5Level)));
}

function buyUpgrade5() {
    if (!state.elementsOwned.includes(5)) return;
    const cost = getUpgrade5Cost();
    if (!gte(state.bp, cost)) {
        showToast(t("toast.bpShort"), "error");
        return;
    }
    state.bp = minus(state.bp, cost);
    state.tp5Level++;
    resetChallenge5T();
    render();
    updateTranscendUI();
    if (currentSlot !== null) saveGameSilent(currentSlot);
    console.log("⬆️ 升级5 升到 Lv" + state.tp5Level);
}

function buyMaxUpgrade5() {
    if (!state.elementsOwned.includes(5)) return;
    let bought = 0;
    let maxIter = 10000;
    let cost = getUpgrade5Cost();
    while (gte(state.bp, cost) && maxIter-- > 0) {
        state.bp = minus(state.bp, cost);
        state.tp5Level++;
        bought++;
        cost = getUpgrade5Cost();
    }
    if (bought > 0) {
        resetChallenge5T();
        render();
        updateTranscendUI();
        if (currentSlot !== null) saveGameSilent(currentSlot);
        console.log("⬆️ 升级5 最大购买 " + toDisplayNum(bought) + " 次，升到 Lv" + toDisplayNum(state.tp5Level));
    }
}

// ---------- 速度倍率（含碎片加成） ----------
function getSpeedMultiplier() {
    let mult = plus({ man: 1, exp: 0 }, effectiveLevel(state.vLevel));
    if (state.frag3) {
        const lgS = state.s.man > 0 ? state.s.exp + Math.log10(state.s.man) : 0;
        if (lgS > 1) mult = muil(mult, change(lgS));
    }
    if (state.frag1) {
        const lgBP = state.bp.man > 0 ? state.bp.exp + Math.log10(state.bp.man) : 0;
        if (lgBP > 1) mult = muil(mult, change(lgBP));
    }
    return mult;
}

// ---------- 升级花费 ----------
function getUpgradeCost(level, type) {
    let levelObj = change(level);
    let baseCost;
    if (type === "j") {
        baseCost = plus(power({ man: 2.0, exp: 0 }, levelObj), { man: 10, exp: 0 });
        // U2-1: 价格 ×0.7^n（n = 购买数 + 赠送数）
        const totalU2_1 = state.distU2_1 + (state.distU2_1_bonus || 0);
        if (totalU2_1 > 0) {
            let newMan = baseCost.man * Math.pow(0.7, totalU2_1);
            let newExp = baseCost.exp;
            while (newMan < 1 && newMan > 0) { newMan *= 10; newExp -= 1; }
            while (newMan >= 10) { newMan /= 10; newExp += 1; }
            baseCost = { man: newMan, exp: newExp };
        }
    } else if (type === "a") {
        baseCost = plus(power({ man: 1.8, exp: 0 }, levelObj), { man: 5, exp: 0 });
    } else {
        baseCost = plus(power({ man: 1.5, exp: 0 }, levelObj), { man: 3, exp: 0 });
    }
    const discount = getBPDiscount();
    let finalMan = baseCost.man * discount;
    let finalExp = baseCost.exp;

    // 量子点折扣：速度升级价格 ×0.9999^(量子点数)
    if (type === "v" && state.quantumPoints.man > 0) {
        const qpLog = state.quantumPoints.exp + Math.log10(state.quantumPoints.man);
        const discountLog = qpLog * Math.log10(0.9999); // 负数
        const newExp = finalExp + discountLog;
        if (newExp < -300) {
            finalMan = 1;
            finalExp = -300;
        } else {
            finalExp = Math.floor(newExp);
            finalMan = finalMan * Math.pow(10, newExp - finalExp);
        }
    }

    // 归一化，防止 man < 1 导致 gte 比较错误
    while (finalMan < 1 && finalMan > 0) { finalMan *= 10; finalExp -= 1; }
    while (finalMan >= 10) { finalMan /= 10; finalExp += 1; }
    return { man: finalMan, exp: finalExp };
}

// ---------- 升级4价格 ----------
function getTPCost() {
    return power(change(2), change(state.tpLevel));
}

// ==================================================
//          距离升级系统
// ==================================================
// U1-1: 速度效果 ×2
// U1-2: 速度以 log100(1+v) 倍率加强自身
// U1-3: 免费 v 等级 = floor(log100(maxDist+1))
// U2-1: 升级3(J)价格 ×0.7^n，价格=1000×100^n
// U2-2: 急动度生产速度，价格=1e5×1e5^n

function getDistU1Cost(id) {
    if (id === 1) return { man: 1, exp: 6 };
    if (id === 2) return { man: 1, exp: 8 };
    if (id === 3) return { man: 1, exp: 14 };
    return { man: 0, exp: 0 };
}

function getDistU2Cost(id, owned) {
    if (id === 1) {
        // 1000 × 100^n，超过10次后每次价格^2 → 10^(23 * 2^(owned-10))
        if (owned <= 10) {
            return { man: 1, exp: 3 + 2 * owned };
        }
        // 使用 power 计算 2^(owned-10)，避免循环
        const pow2 = power(change(2), change(owned - 10));
        const expVal = muil(change(23), pow2);
        if (expVal.exp >= 15) return { man: 9.9, exp: EXP_CAP };
        return { man: 1, exp: safeExp(expVal.man * Math.pow(10, expVal.exp)) };
    }
    if (id === 2) {
        // 1e5 × 1e5^n，超过10次后每次价格^2 → 10^(55 * 2^(owned-10))
        if (owned <= 10) {
            return { man: 1, exp: 5 + 5 * owned };
        }
        const pow2 = power(change(2), change(owned - 10));
        const expVal = muil(change(55), pow2);
        if (expVal.exp >= 15) return { man: 9.9, exp: EXP_CAP };
        return { man: 1, exp: safeExp(expVal.man * Math.pow(10, expVal.exp)) };
    }
    return { man: 0, exp: 0 };
}

function buyDistU1(id) {
    if (isDistUpgradeDisabled()) { showToast(t("ch.c2.distBlocked"), "warn"); return; } // 挑战2
    const key = "distU1_" + id;
    if (state[key]) return; // 已购买
    const cost = getDistU1Cost(id);
    if (!gte(state.s, cost)) return;
    state.s = minus(state.s, cost);
    state[key] = true;
    state.upgradeBuyCount++;
    resetChallenge5T();
    render();
}

function buyDistU2(id) {
    if (isDistUpgradeDisabled()) { showToast(t("ch.c2.distBlocked"), "warn"); return; } // 挑战2
    if (id === 2 && isU2_2Disabled()) { showToast(t("ch.c4.u22Blocked"), "warn"); return; } // 挑战4
    const key = "distU2_" + id;
    const owned = state[key];
    const cost = getDistU2Cost(id, owned);
    if (!gte(state.s, cost)) return;
    state.s = minus(state.s, cost);
    state[key]++;
    state.upgradeBuyCount++;
    resetChallenge5T();
    render();
}

// 购买距离升级U2(最大)
function buyMaxDistU2(id) {
    if (isDistUpgradeDisabled()) { showToast(t("ch.c2.distBlocked"), "warn"); return; } // 挑战2
    if (id === 2 && isU2_2Disabled()) { showToast(t("ch.c4.u22Blocked"), "warn"); return; } // 挑战4
    const key = "distU2_" + id;
    let bought = 0;
    let maxIter = 10000;
    let cost = getDistU2Cost(id, state[key]);
    while (gte(state.s, cost) && maxIter-- > 0) {
        state.s = minus(state.s, cost);
        state[key]++;
        state.upgradeBuyCount++;
        bought++;
        cost = getDistU2Cost(id, state[key]);
    }
    if (bought > 0) {
        resetChallenge5T();
        render();
        console.log("⬆️ U2-" + id + " 最大购买 " + toDisplayNum(bought) + " 次");
    }
}

// 计算U2最大可购买数量
function getMaxDistU2(id) {
    const key = "distU2_" + id;
    let count = 0;
    let tempS = { ...state.s };
    let cost = getDistU2Cost(id, state[key]);
    while (gte(tempS, cost) && count < 10000) {
        tempS = minus(tempS, cost);
        count++;
        cost = getDistU2Cost(id, state[key] + count);
    }
    return count;
}

// U1-3: 免费 v 等级
function getFreeVLevels() {
    if (!state.distU1_3) return 0;
    const md = state.maxDist;
    const mdLog = md.exp + Math.log10(Math.max(md.man, 0.001));
    // log100(x) = log10(x) / 2
    const log100md = mdLog / 2;
    let levels = Math.max(0, Math.floor(log100md));
    // U1-4: 效果*3
    if (state.distU1_4) levels *= 3;
    return levels;
}

// U1-2: log100(1+v) 倍率
function getU1_2Multiplier() {
    if (!state.distU1_2) return 1;
    const vLog = state.v.exp + Math.log10(Math.max(state.v.man, 0.001));
    // log100(1+v) ≈ log10(v)/2 when v >> 1
    const log100v = vLog / 2;
    return Math.max(1, log100v);
}

// U2-2: 急动度生产速度（返回科学计数法）
function getU2_2ProductionRate() {
    const owned = state.distU2_2;
    if (owned === 0) return { man: 0, exp: 0 };
    // 1, 10, 100, 1000, ... (第一次+1，之后每次×10)
    let rate = { man: 1, exp: owned - 1 };
    // U1-4: 效果*3
    if (state.distU1_4) rate = muil(rate, { man: 3, exp: 0 });
    // 元素2 (氦): U2-2的效果 ^1.5
    if (state.elementsOwned.includes(2)) {
        // rate ^ 1.5 = rate^(3/2)
        // log10(rate) * 1.5
        const rateLog = rate.exp + Math.log10(rate.man);
        const newLog = rateLog * 1.5;
        const newExp = Math.floor(newLog);
        const newMan = Math.pow(10, newLog - newExp);
        rate = { man: newMan, exp: safeExp(newExp) };
        // 归一化
        while (rate.man >= 10) { rate.man /= 10; rate.exp++; }
        while (rate.man > 0 && rate.man < 1) { rate.man *= 10; rate.exp--; }
    }
    return rate;
}

// 科学计数法平方
function sciSquare(val) {
    let man = val.man * val.man;
    let exp = val.exp * 2;
    while (man >= 10) { man /= 10; exp++; }
    while (man > 0 && man < 1) { man *= 10; exp--; }
    return { man, exp };
}

// 总速度倍率（含距离升级）
function getTotalSpeedMultiplier() {
    // 1 + effectiveLevel(vLevel) — 使用科学计数法运算
    let mult = plus({ man: 1, exp: 0 }, effectiveLevel(state.vLevel));
    // 碎片3: ×lg(距离+1)
    if (state.frag3) {
        const lgS = state.s.man > 0 ? state.s.exp + Math.log10(state.s.man) : 0;
        if (lgS > 1) mult = muil(mult, change(lgS));
    }
    // 碎片1: ×lg(BP+1)
    if (state.frag1) {
        const lgBP = state.bp.man > 0 ? state.bp.exp + Math.log10(state.bp.man) : 0;
        if (lgBP > 1) mult = muil(mult, change(lgBP));
    }
    // U1-1: 速度效果 ×2 (挑战3奖励: 升级4/5效果也生效)
    if (state.distU1_1) {
        let u11Mult = { man: 2, exp: 0 };
        if (state.challengeRewards[2] && !isUpgrade45Disabled()) {
            u11Mult = muil(u11Mult, getTPFactor());
        }
        mult = muil(mult, u11Mult);
    }
    // U1-2: log100(1+v) 倍率 (挑战3奖励: 升级4/5效果也生效)
    const u12 = getU1_2Multiplier();
    if (u12 > 1) {
        let u12Mult = change(u12);
        if (state.challengeRewards[2] && !isUpgrade45Disabled()) {
            u12Mult = muil(u12Mult, getTPFactor());
        }
        mult = muil(mult, u12Mult);
    }
    // U1-4: 挑战2奖励 — U1-1, U1-2, U1-3, U2-2效果*3
    if (state.distU1_4) {
        mult = muil(mult, { man: 3, exp: 0 });
    }
    // U1-3: 免费 v 等级
    const freeLv = getFreeVLevels();
    if (freeLv > 0) mult = plus(mult, change(freeLv));
    // 量子里程碑6: 每个量子点为速度提供 0.05 倍加乘数
    if (state.quantumMilestones.includes(5) && state.quantumPoints.man > 0) {
        const qpLog = state.quantumPoints.exp + Math.log10(state.quantumPoints.man);
        const qpNum = Math.pow(10, Math.min(qpLog, 15));
        const qpBonus = qpNum * 0.05;
        if (qpBonus > 0) mult = plus(mult, change(qpBonus));
    }
    // 挑战5奖励: 超越中速度获得lg(当前超越已用时间+1)倍率加成
    const c5Reward = getChallenge5RewardMult();
    if (c5Reward > 1) mult = muil(mult, change(c5Reward));
    return mult;
}

// 升级花费（含 U2-1 折扣）
// 更新距离升级 UI
function updateDistUpgradeUI() {
    // U1-1
    const u11Btn = document.getElementById("dist_u1_1_btn");
    if (u11Btn) {
        const owned = state.distU1_1;
        u11Btn.disabled = owned;
        u11Btn.textContent = owned ? t("elements.bought") : t("dist.upgrades.buy") + toDisplayNum(1e6) + t("dist.distanceUnit");
        const eff = document.getElementById("dist_u1_1_eff");
        if (eff) eff.textContent = owned ? t("dist.upgrades.u1_1.eff") : t("dist.upgrades.u1_1.name");
    }
    // U1-2
    const u12Btn = document.getElementById("dist_u1_2_btn");
    if (u12Btn) {
        const owned = state.distU1_2;
        const curMult = getU1_2Multiplier();
        const nextMult = owned ? curMult : Math.max(1, (state.v.exp + Math.log10(Math.max(state.v.man, 0.001))) / 2);
        u12Btn.disabled = owned;
        u12Btn.textContent = owned ? t("elements.bought") : t("dist.upgrades.buy") + toDisplayNum(1e8) + t("dist.distanceUnit");
        const eff = document.getElementById("dist_u1_2_eff");
        if (eff) eff.textContent = t("dist.upgrades.u1_2.cur") + toDisplayNum(curMult);
    }
    // U1-3
    const u13Btn = document.getElementById("dist_u1_3_btn");
    if (u13Btn) {
        const owned = state.distU1_3;
        const freeLv = getFreeVLevels();
        u13Btn.disabled = owned;
        u13Btn.textContent = owned ? t("elements.bought") : t("dist.upgrades.buy") + toDisplayNum(1e14) + t("dist.distanceUnit");
        const eff = document.getElementById("dist_u1_3_eff");
        if (eff) eff.textContent = t("dist.upgrades.u1_3.cur") + toDisplayNum(freeLv) + t("dist.upgrades.u1_3.suffix");
    }
    // U2-1
    const u21Btn = document.getElementById("dist_u2_1_btn");
    if (u21Btn) {
        const owned = state.distU2_1;
        const bonus = state.distU2_1_bonus || 0;
        const total = owned + bonus;
        const cost = getDistU2Cost(1, owned);
        u21Btn.disabled = !gte(state.s, cost);
        u21Btn.textContent = t("dist.upgrades.buy") + toDisplay(cost) + t("dist.distanceUnit");
        const curDiscount = total > 0 ? (toDisplay(muil(power(change(0.7), change(total)), change(100))) + "%") : t("status.noDiscount");
        const nextDiscount = toDisplay(muil(power(change(0.7), change(total + 1)), change(100))) + "%";
        const eff = document.getElementById("dist_u2_1_eff");
        if (eff) eff.textContent = t("dist.upgrades.u2_1.cur") + curDiscount + t("dist.upgrades.u2_1.next") + nextDiscount;
        const cnt = document.getElementById("dist_u2_1_cnt");
        if (cnt) cnt.textContent = t("dist.upgrades.u2_1.bought") + toDisplayNum(owned) + t("dist.upgrades.u2_1.levels") + (bonus > 0 ? t("dist.upgrades.u2_1.bonus") + toDisplayNum(bonus) + t("dist.upgrades.u2_1.bonusSuffix") : "");
        // U2-1 最大购买按钮
        const u21MaxBtn = document.getElementById("dist_u2_1_max_btn");
        if (u21MaxBtn) {
            const maxU21 = getMaxDistU2(1);
            u21MaxBtn.style.display = "inline-block";
            u21MaxBtn.disabled = maxU21 <= 0;
            const u21MaxCnt = document.getElementById("u2_1_max_count");
            if (u21MaxCnt) u21MaxCnt.textContent = toDisplayNum(maxU21);
        }
    }
    // U2-2
    const u22Btn = document.getElementById("dist_u2_2_btn");
    if (u22Btn) {
        const owned = state.distU2_2;
        const cost = getDistU2Cost(2, owned);
        u22Btn.disabled = !gte(state.s, cost);
        u22Btn.textContent = t("dist.upgrades.buy") + toDisplay(cost) + t("dist.distanceUnit");
        const curRate = getU2_2ProductionRate();
        // 下一级速率
        let nextRate = { man: 0, exp: 0 };
        if (owned === 0) nextRate = { man: 1, exp: 0 };
        else nextRate = { man: 1, exp: owned };
        // 相对论修正显示
        let relDisplay = "";
        let factor = getRelativisticFactor();
        let factorLog = factor.exp + Math.log10(factor.man);
        if (factorLog < -0.005) {
            let denom = dev({ man: 1, exp: 0 }, factor);
            let actualRate = muil(curRate, factor);
            relDisplay = " (÷" + toDisplay(denom) + " = " + toDisplay(actualRate) + ")";
        }
        let nextRelDisplay = "";
        if (factorLog < -0.005) {
            let actualNext = muil(nextRate, factor);
            let denom = dev({ man: 1, exp: 0 }, factor);
            nextRelDisplay = " (÷" + toDisplay(denom) + " = " + toDisplay(actualNext) + ")";
        }
        const eff = document.getElementById("dist_u2_2_eff");
        if (eff) eff.textContent = t("dist.upgrades.u2_1.cur") + toDisplay(curRate) + relDisplay + t("dist.upgrades.u2_1.next") + toDisplay(nextRate) + nextRelDisplay;
        const cnt = document.getElementById("dist_u2_2_cnt");
        if (cnt) cnt.textContent = t("dist.upgrades.u2_2.bought") + toDisplayNum(owned) + t("dist.upgrades.u2_1.levels");
        // U2-2 最大购买按钮
        const u22MaxBtn = document.getElementById("dist_u2_2_max_btn");
        if (u22MaxBtn) {
            const maxU22 = getMaxDistU2(2);
            u22MaxBtn.style.display = "inline-block";
            u22MaxBtn.disabled = maxU22 <= 0;
            const u22MaxCnt = document.getElementById("u2_2_max_count");
            if (u22MaxCnt) u22MaxCnt.textContent = toDisplayNum(maxU22);
        }
    }
}

// ---------- 升级花费（覆盖原版，使用含距离升级版本） ----------

// ---------- 数值比较 ----------
function gte(a, b) {
    if (a.exp > b.exp) return true;
    if (a.exp < b.exp) return false;
    return a.man >= b.man;
}

// ---------- 相对论 ----------
function getActualAcceleration() {
    return muil(state.a, getRelativisticFactor());
}

// 相对论加速度修正系数（实际/原始）
function getRelativisticFactor() {
    // 升级6: 相对论影响的开始速度推迟（乘以delay倍率）
    const u6Delay = getUpgrade6RelativityDelay();
    let effectiveC = muil(C, change(u6Delay));
    let vc = dev(state.v, effectiveC);
    let vc2 = muil(vc, vc);
    let base = plus({ man: 1, exp: 0 }, vc2);
    let denom = power(base, { man: 15, exp: -1 });
    let factor = dev({ man: 1, exp: 0 }, denom);

    // 碎片5: 相对论debuff弱化log10(s)，实时更新
    // factor^(1/log10(s)) → debuff被log10(s)次方根弱化，趋近1
    if (state.frag5) {
        const lgS = state.s.man > 0 ? state.s.exp + Math.log10(state.s.man) : 0;
        if (lgS > 1) {
            const lgFactor = factor.exp + Math.log10(factor.man); // log10(factor)，为负数
            if (lgFactor < 0) {
                const newLg = lgFactor / lgS; // 弱化后的log10(factor)
                const newExp = Math.floor(newLg);
                const newMan = Math.pow(10, newLg - newExp);
                factor = { man: newMan, exp: safeExp(newExp) };
            }
        }
    }

    return factor;
}

// 格式化相对论修正分母（÷N 格式）
function formatRelativisticReduction() {
    let factor = getRelativisticFactor();
    if (factor.man === 0) return "";
    let factorLog = factor.exp + Math.log10(factor.man);
    if (factorLog >= -0.005) return "";
    let denomLog = -factorLog;
    if (denomLog > 15) return " (÷∞)";
    // 使用 toDisplay 统一科学计数法显示分母
    let denom = dev({ man: 1, exp: 0 }, factor);
    return " (÷" + toDisplay(denom) + ")";
}

// ---------- 计算买最大 ----------
function getMaxBuyable(level, type) {
    let count = 0;
    let cost = getUpgradeCost(level, type);
    let tempS = { ...state.s };
    const freeUpgrades = state.quantumMilestones.includes(2);
    for (let i = 0; i < 10000; i++) {
        if (gte(tempS, cost)) {
            if (!freeUpgrades) tempS = minus(tempS, cost);
            count++;
            cost = getUpgradeCost(level + count, type);
        } else break;
    }
    return count;
}

// ---------- 超越是否已解锁 ----------
let transcendUnlocked = false;

// ---------- 计算本次超越可获得BP ----------
function calcGainBP() {
    // BP = lg(V)^0.75 × 里程碑倍率
    const lgV = lg(state.v);
    if (!lgV || lgV.man <= 0) return { man: 0, exp: 0 };
    let base = power(lgV, { man: 0.75, exp: 0 });
    let mult = getMilestoneBPMult();
    let result = { man: base.man * mult, exp: base.exp };

    // 碎片6: 每次升级购买使本次BP获取 ×1.001
    if (state.frag6 && state.upgradeBuyCount > 0) {
        // 1.001^n = 10^(n * log10(1.001))
        const logMult = state.upgradeBuyCount * Math.log10(1.001);
        result = muil(result, change(Math.pow(10, logMult)));
    }

    // 挑战6奖励: 超越点获取量*3
    const c6Mult = getChallenge6RewardMult();
    if (c6Mult > 1) result = muil(result, change(c6Mult));

    // 量子里程碑8: 超越点获取量 ^1.2
    if (state.quantumMilestones.includes(7)) {
        result = power(result, { man: 1.2, exp: 0 });
    }

    return result;
}

// ==================================================
//          核反应堆系统
// ==================================================
const REACTOR_LAYER_CONFIG = [
    { initialPrice: 1,     priceMult: 2  },  // 层1 (生产复制能量)
    { initialPrice: 100,   priceMult: 4  },  // 层2
    { initialPrice: 500,   priceMult: 9  },  // 层3
    { initialPrice: 2000,  priceMult: 24 },  // 层4
    { initialPrice: 12500, priceMult: 50 },  // 层5 (顶层)
];

function getReactorPrice(layerIdx) {
    const cfg = REACTOR_LAYER_CONFIG[layerIdx];
    return muil(change(cfg.initialPrice), power(change(cfg.priceMult), change(state.reactor.layers[layerIdx].purchaseCount)));
}

function buyReactorLayer(layerIdx) {
    if (!transcendUnlocked) return;
    const price = getReactorPrice(layerIdx);
    if (!gte(state.bp, price)) {
        showToast(t("toast.bpShort"), "error");
        return;
    }
    state.bp = minus(state.bp, price);
    const layer = state.reactor.layers[layerIdx];
    layer.purchaseCount++;
    layer.efficiency *= 2;
    layer.quantity += 1;
    resetChallenge5T();
    render();
    updateReactorUI();
    if (currentSlot !== null) saveGameSilent(currentSlot);
}

function getReplicationEnergyBonus() {
    const energy = state.reactor.replicationEnergy;
    // 元素9 (氟): 复制能量加成改为 energy^(2/3)
    if (state.elementsOwned.includes(9)) {
        return Math.pow(energy, 2/3);
    }
    // 默认: √(复制能量) 加成倍率
    return Math.sqrt(energy);
}

function updateReactorProduction(dt) {
    // 生产链: 层5→层4→层3→层2→层1→复制能量
    // 每层生产率 = quantity * efficiency
    const layers = state.reactor.layers;
    // 从顶层(4)向下生产
    for (let i = 4; i >= 1; i--) {
        const production = layers[i].quantity * layers[i].efficiency * dt;
        layers[i - 1].quantity += production;
    }
    // 层1生产复制能量
    const energyProd = layers[0].quantity * layers[0].efficiency * dt;
    state.reactor.replicationEnergy += energyProd;
}

function resetReactorForTranscend() {
    // 超越重置: 重置数量，不重置效率、购买数量和价格
    for (let i = 0; i < 5; i++) {
        state.reactor.layers[i].quantity = 0;
    }
    state.reactor.replicationEnergy = 1;
}

function resetReactorForQuantum() {
    // 量子重置: 完全重置
    for (let i = 0; i < 5; i++) {
        state.reactor.layers[i] = { quantity: 0, efficiency: 1, purchaseCount: 0 };
    }
    state.reactor.replicationEnergy = 1;
}

function updateReactorUI() {
    const container = document.getElementById("reactor_content");
    if (!container) return;
    if (!transcendUnlocked) {
        container.style.display = "none";
        return;
    }
    container.style.display = "";

    // 复制能量显示
    const energyEl = document.getElementById("reactor_energy");
    if (energyEl) energyEl.textContent = toDisplay(change(state.reactor.replicationEnergy));
    const bonusEl = document.getElementById("reactor_bonus");
    if (bonusEl) bonusEl.textContent = "×" + toDisplayNum(getReplicationEnergyBonus());

    // 每层显示
    for (let i = 0; i < 5; i++) {
        const layer = state.reactor.layers[i];
        const cfg = REACTOR_LAYER_CONFIG[i];
        const price = getReactorPrice(i);

        const qtyEl = document.getElementById("reactor_layer_qty_" + i);
        if (qtyEl) qtyEl.textContent = toDisplayNum(layer.quantity);
        const effEl = document.getElementById("reactor_layer_eff_" + i);
        if (effEl) effEl.textContent = "×" + toDisplayNum(layer.efficiency);
        const pcEl = document.getElementById("reactor_layer_pc_" + i);
        if (pcEl) pcEl.textContent = toDisplayNum(layer.purchaseCount);
        const priceEl = document.getElementById("reactor_layer_price_" + i);
        if (priceEl) priceEl.textContent = toDisplay(price) + " BP";
        const btnEl = document.getElementById("reactor_layer_btn_" + i);
        if (btnEl) {
            btnEl.disabled = !gte(state.bp, price);
            btnEl.textContent = t("reactor.buy") + toDisplay(price) + " BP";
        }
        // 生产率显示
        const rateEl = document.getElementById("reactor_layer_rate_" + i);
        if (rateEl) {
            const rate = layer.quantity * layer.efficiency;
            rateEl.textContent = toDisplay(change(rate)) + "/s";
        }
    }
}

// ==================================================
//          超越挑战系统
// ==================================================
const CHALLENGES = [
    { id: 0, icon: "🐌", name: t("ch.c1.name"), desc: t("ch.c1.desc"), reward: t("ch.c1.reward") },
    { id: 1, icon: "🚫", name: t("ch.c2.name"), desc: t("ch.c2.desc"), reward: t("ch.c2.reward") },
    { id: 2, icon: "💸", name: t("ch.c3.name"), desc: t("ch.c3.desc"), reward: t("ch.c3.reward") },
    { id: 3, icon: "⚡", name: t("ch.c4.name"), desc: t("ch.c4.desc"), reward: t("ch.c4.reward") },
    { id: 4, icon: "⏳", name: t("ch.c5.name"), desc: t("ch.c5.desc"), reward: t("ch.c5.reward") },
    { id: 5, icon: "📉", name: t("ch.c6.name"), desc: t("ch.c6.desc"), reward: t("ch.c6.reward") },
];

function isInChallenge() {
    return state.challenges.activeChallenge >= 0;
}

function getChallengeElapsedSec() {
    if (state.challenges.challengeStartTime <= 0) return 0;
    const flowMult = getCurrentSpeedMultiplier();
    return (Date.now() - state.challenges.challengeStartTime) / 1000;
    // 注意: 挑战计时也受游戏倍速影响，但Date.now()已经反映了实际时间
    // 游戏倍速影响的是游戏内的物理模拟速度，不影响真实时间
    // 但用户要求"所有计时项受游戏倍速影响"，所以需要用游戏时间而非真实时间
}

function getChallengeElapsedGameSec() {
    // 游戏内时间（受倍速影响）= 真实时间 × 游戏倍速
    if (state.challenges.challengeStartTime <= 0) return 0;
    const flowMult = getCurrentSpeedMultiplier();
    return ((Date.now() - state.challenges.challengeStartTime) / 1000) * flowMult;
}

function enterChallenge(challengeId) {
    if (!transcendUnlocked) return;
    if (state.challenges.activeChallenge >= 0) {
        showToast(t("ch.alreadyInChallenge"), "warn");
        return;
    }
    if (gameSettings.confirmTranscend && !confirm(t("ch.confirmEnter") + CHALLENGES[challengeId].name + "?")) return;

    // 进入挑战时自动进行一次无收益的超越级别重置
    doRestartTranscend(true);

    state.challenges.activeChallenge = challengeId;
    state.challenges.challengeStartTime = Date.now();
    state.challenges.c5_t = 0;
    state.challenges.c6_accumulator = 0;

    // 挑战1: 不再修改初始值，改为在物理计算中持续应用 ^0.95

    showToast(t("ch.entered") + CHALLENGES[challengeId].name, "info");
    updateChallengeUI();
    updateTranscendUI();
    if (currentSlot !== null) saveGameSilent(currentSlot);
}

function exitChallenge(completed) {
    const challengeId = state.challenges.activeChallenge;
    if (challengeId < 0) return;

    if (completed) {
        // 完成挑战
        const elapsed = getChallengeElapsedGameSec();
        state.challenges.completed[challengeId] = true;
        if (elapsed < state.challenges.bestTimes[challengeId]) {
            state.challenges.bestTimes[challengeId] = elapsed;
        }
        // 首次完成时授予奖励
        if (!state.challengeRewards[challengeId]) {
            state.challengeRewards[challengeId] = true;
            showToast(t("ch.completed") + CHALLENGES[challengeId].name + " " + t("ch.rewardUnlocked") + CHALLENGES[challengeId].reward, "success");
        } else {
            showToast(t("ch.completed") + CHALLENGES[challengeId].name, "success");
        }
        // 检查成就
        checkChallengeAchievements();
    } else {
        // 放弃挑战
        showToast(t("ch.abandoned") + CHALLENGES[challengeId].name, "warn");
    }

    state.challenges.activeChallenge = -1;
    state.challenges.challengeStartTime = 0;
    state.challenges.c5_t = 0;
    state.challenges.c6_accumulator = 0;
    updateChallengeUI();
    updateTranscendUI();
    if (currentSlot !== null) saveGameSilent(currentSlot);
}

// 挑战1: 获取速度的幂次（^0.95 = 挑战中, ^1.04 = 奖励, 可叠加）
function getVPower() {
    let power = 1.0;
    if (state.challenges.activeChallenge === 0) power -= 0.05; // ^0.95
    if (state.challengeRewards[0]) power += 0.04; // ^1.04
    return power;
}

// 挑战1: 获取加速度的幂次
function getAPower() {
    if (state.challenges.activeChallenge === 0) return 0.95;
    return 1.0;
}

// 挑战1: 获取急动度的幂次
function getJPower() {
    if (state.challenges.activeChallenge === 0) return 0.95;
    return 1.0;
}

// 对科学计数法值应用幂次 (val^p)
function applyPower(val, p) {
    if (p === 1.0) return val;
    if (val.man === 0 || val.man === 1 && val.exp === 0) return val;
    return power(val, change(p));
}

// 挑战5: 收益乘数
function getChallenge5IncomeMult() {
    if (state.challenges.activeChallenge !== 4) return 1;
    const tVal = state.challenges.c5_t;
    return 1 / Math.pow(tVal + 1, 1.5);
}

// 挑战5奖励: 超越中速度获得lg(当前超越已用时间+1)倍率加成
function getChallenge5RewardMult() {
    if (!state.challengeRewards[4]) return 1;
    if (state.transcendStartTime <= 0) return 1;
    const elapsed = (Date.now() - state.transcendStartTime) / 1000;
    const flowMult = getCurrentSpeedMultiplier();
    const gameElapsed = elapsed * flowMult;
    return Math.max(1, Math.log10(gameElapsed + 1));
}

// 挑战6: 等级债务
function getChallenge6LevelDebt() {
    if (state.challenges.activeChallenge !== 5) return 0;
    return state.challenges.c6_accumulator * 0.5;
}

// 挑战6奖励: 超越点获取量*3
function getChallenge6RewardMult() {
    if (!state.challengeRewards[5]) return 1;
    return 3;
}

// 挑战3: 升级4/5和BP折扣是否失效
function isUpgrade45Disabled() {
    return state.challenges.activeChallenge === 2;
}

// 挑战2: 禁止购买距离升级
function isDistUpgradeDisabled() {
    return state.challenges.activeChallenge === 1;
}

// 挑战4: 禁用急动度生产加速度
function isJerkToAccelDisabled() {
    return state.challenges.activeChallenge === 3;
}

// 挑战4: 禁用U2-2
function isU2_2Disabled() {
    return state.challenges.activeChallenge === 3;
}

// 挑战4奖励: 急动度生产加速度效果*2
function getJerkToAccelRewardMult() {
    if (!state.challengeRewards[3]) return 1;
    return 2;
}

// 重置挑战5的t值 (购买升级时调用)
function resetChallenge5T() {
    if (state.challenges.activeChallenge === 4) {
        state.challenges.c5_t = 0;
    }
}

function updateChallengeUI() {
    const container = document.getElementById("challenge_content");
    if (!container) return;
    if (!transcendUnlocked) {
        container.style.display = "none";
        return;
    }
    container.style.display = "";

    // 活跃挑战状态
    const activeEl = document.getElementById("challenge_active_status");
    if (activeEl) {
        if (state.challenges.activeChallenge >= 0) {
            const elapsed = getChallengeElapsedGameSec();
            activeEl.textContent = CHALLENGES[state.challenges.activeChallenge].icon + " " +
                CHALLENGES[state.challenges.activeChallenge].name + " | " +
                t("ch.elapsed") + formatTime(elapsed);
            activeEl.style.display = "";
        } else {
            activeEl.style.display = "none";
        }
    }

    // 每个挑战卡片
    for (let i = 0; i < 6; i++) {
        const card = document.getElementById("challenge_card_" + i);
        if (!card) continue;
        const completed = state.challenges.completed[i];
        const bestTime = state.challenges.bestTimes[i];
        const hasReward = state.challengeRewards[i];
        const timeEl = document.getElementById("challenge_time_" + i);
        if (timeEl) {
            if (bestTime >= 1e300) {
                timeEl.textContent = t("ch.notCompleted");
            } else {
                timeEl.textContent = formatTime(bestTime);
            }
        }
        const statusEl = document.getElementById("challenge_status_" + i);
        if (statusEl) {
            if (hasReward) {
                statusEl.textContent = "✅ " + t("ch.rewardActive");
                statusEl.style.color = "#00ff88";
            } else if (completed) {
                statusEl.textContent = "✔ " + t("ch.completed2");
                statusEl.style.color = "#88aaff";
            } else {
                statusEl.textContent = "🔒 " + t("ch.notCompleted2");
                statusEl.style.color = "#888888";
            }
        }
        const btnEl = document.getElementById("challenge_btn_" + i);
        if (btnEl) {
            if (state.challenges.activeChallenge >= 0 && state.challenges.activeChallenge !== i) {
                btnEl.disabled = true;
                btnEl.textContent = t("ch.inAnotherChallenge");
            } else if (state.challenges.activeChallenge === i) {
                btnEl.disabled = false;
                btnEl.textContent = t("ch.abandon");
                btnEl.onclick = () => exitChallenge(false);
            } else {
                btnEl.disabled = false;
                btnEl.textContent = t("ch.start");
                btnEl.onclick = () => enterChallenge(i);
            }
        }
    }
}

function formatTime(sec) {
    if (sec >= 1e300) return "∞";
    if (sec < 0.01) return "0.00s";
    if (sec < 60) return sec.toFixed(2) + "s";
    if (sec < 3600) return Math.floor(sec / 60) + "m " + (sec % 60).toFixed(0) + "s";
    return Math.floor(sec / 3600) + "h " + Math.floor((sec % 3600) / 60) + "m";
}

function checkChallengeAchievements() {
    // a18: 完成任一挑战
    if (state.challenges.completed.some(c => c)) unlockAchievement("a18");
    // a19: 完成所有挑战
    if (state.challenges.completed.every(c => c)) unlockAchievement("a19");
    // a20: 6个挑战完成时间总和小于300秒
    if (state.challenges.completed.every(c => c)) {
        let total = 0;
        for (let i = 0; i < 6; i++) {
            if (state.challenges.bestTimes[i] < 1e300) total += state.challenges.bestTimes[i];
            else { total = 1e300; break; }
        }
        if (total < 300) unlockAchievement("a20");
    }
}

// ==================================================
//          重启超越 (无收益重置)
// ==================================================
function doRestartTranscend(skipConfirm) {
    if (!transcendUnlocked) return;
    if (!skipConfirm && gameSettings.confirmTranscend && !confirm(t("confirm.restartTranscend"))) return;

    // 如果在挑战中，视为放弃
    if (state.challenges.activeChallenge >= 0) {
        exitChallenge(false);
    }

    // 重置到超越初始状态 (不获得BP)
    state.s = { man: 1, exp: 0 };
    state.v = { man: 1, exp: 0 };
    state.a = { man: 1, exp: -3 };
    state.j = { man: 1, exp: -6 };
    // 挑战1奖励: 不再修改初始值，改为在物理计算中持续应用 ^1.04
    state.vLevel = 0;
    state.aLevel = 0;
    state.jLevel = 0;
    state.transcendStartTime = Date.now();
    state.upgradeBuyCount = 0;

    // 重置距离升级
    state.distU1_1 = false;
    state.distU1_2 = false;
    state.distU1_3 = false;
    state.distU2_1 = 0;
    state.distU2_1_bonus = 0;
    state.distU2_2 = 0;
    state.maxDist = { man: 1, exp: 0 };

    // 元素6: 每次超越/量子重置从3000BP开始
    if (state.elementsOwned.includes(6)) {
        state.distU1_1 = true;
        state.distU1_2 = true;
        state.distU1_3 = true;
        state.distU2_1 = 1;
        state.distU2_2 = 1;
        state.distU2_1_bonus = 5;
    }

    // 量子里程碑1: 自动获得U1-1, U1-2和额外U2-1
    if (state.quantumMilestones.includes(0)) {
        state.distU1_1 = true;
        state.distU1_2 = true;
        state.distU2_1_bonus = (state.distU2_1_bonus || 0) + 3;
    }

    // 重置核反应堆数量
    resetReactorForTranscend();

    lastTime = Date.now();
    render();
    updateTranscendUI();
    if (currentSlot !== null) saveGameSilent(currentSlot);
    console.log("🔄 重启超越（无收益）");
}

// ---------- 超越重置 ----------
function transcend() {
    if (!transcendUnlocked) return;
    if (!gte(state.v, LIGHT_SPEED)) return;
    if (gameSettings.confirmTranscend && !confirm(t("confirm.transcend"))) return;

    // 如果在挑战中，完成挑战
    const wasInChallenge = state.challenges.activeChallenge >= 0;

    const gainedBP = calcGainBP();
    state.bp = plus(state.bp, gainedBP);

    state.s = { man: 1, exp: 0 };
    state.v = { man: 1, exp: 0 };
    state.a = { man: 1, exp: -3 };
    state.j = { man: 1, exp: -6 };
    // 挑战1奖励: 不再修改初始值，改为在物理计算中持续应用 ^1.04
    state.vLevel = 0;
    state.aLevel = 0;
    state.jLevel = 0;
    state.transcendCount++;
    // 统计：记录超越用时
    if (state.transcendStartTime > 0) {
        const tTime = (Date.now() - state.transcendStartTime) / 1000;
        if (tTime < state.minTranscendTime) state.minTranscendTime = tTime;
    }
    state.transcendStartTime = Date.now();
    state.upgradeBuyCount = 0;
    // 检查里程碑
    checkMilestones();
    // 重置距离升级
    state.distU1_1 = false;
    state.distU1_2 = false;
    state.distU1_3 = false;
    state.distU2_1 = 0;
    state.distU2_1_bonus = 0;
    state.distU2_2 = 0;
    state.maxDist = { man: 1, exp: 0 };

    // 元素6: 每次超越/量子重置从3000BP开始，所有距离升级有1级，U2-1有5级
    if (state.elementsOwned.includes(6)) {
        state.bp = plus(state.bp, change(3000));
        state.distU1_1 = true;
        state.distU1_2 = true;
        state.distU1_3 = true;
        state.distU2_1 = 1;
        state.distU2_2 = 1;
        state.distU2_1_bonus = 5;
    }

    // 重置核反应堆数量
    resetReactorForTranscend();

    lastTime = Date.now();
    render();
    updateTranscendUI();

    // 量子里程碑1: 每次超越重置自动获得U1-1, U1-2和3个额外不计入购买数量的U2-1
    if (state.quantumMilestones.includes(0)) {
        state.distU1_1 = true;
        state.distU1_2 = true;
        state.distU2_1_bonus = (state.distU2_1_bonus || 0) + 3;
    }

    // 完成挑战 (在重置之后，确保挑战状态被正确处理)
    if (wasInChallenge) {
        exitChallenge(true);
    }

    console.log("🌌 超越重置成功！获得 " + toDisplay(gainedBP) + " bp，总 bp: " + toDisplay(state.bp));

    // 在所有状态修改完成后再保存
    if (currentSlot !== null) saveGame(currentSlot);
}

// ==================================================
//          量子层级系统
// ==================================================
const QUANTUM_BP_THRESHOLD = { man: 1, exp: 4 }; // BP > 10000

// 量子里程碑定义
const QUANTUM_MILESTONES = [
    { count: 1,  name: t("quantum.qms1.name"),   reward: t("quantum.qms1.reward") },
    { count: 2,  name: t("quantum.qms2.name"),   reward: t("quantum.qms2.reward") },
    { count: 4,  name: t("quantum.qms3.name"),   reward: t("quantum.qms3.reward") },
    { count: 7,  name: t("quantum.qms4.name"),   reward: t("quantum.qms4.reward") },
    { count: 12, name: t("quantum.qms5.name"), reward: t("quantum.qms5.reward") },
    { count: 20, name: t("quantum.qms6.name"),   reward: t("quantum.qms6.reward") },
    { count: 35, name: t("quantum.qms7.name"),   reward: t("quantum.qms7.reward") },
    { count: 10, name: t("quantum.qms8.name"),   reward: t("quantum.qms8.reward") }
];

// ==================================================
//          元素周期表系统
// ==================================================
// 真实元素周期表数据（118个元素，名称+符号）
const ELEMENTS = [
    { num: 1,  symbol: "H",  name: t("elements.1.name"),   enName: "Hydrogen",       cost: 20,  desc: t("elements.1.desc") },
    { num: 2,  symbol: "He", name: t("elements.2.name"),   enName: "Helium",         cost: 45,  desc: t("elements.2.desc") },
    { num: 3,  symbol: "Li", name: t("elements.3.name"),   enName: "Lithium",        cost: 570, desc: t("elements.3.desc") },
    { num: 4, symbol: "Be", name: t("elements.4.name"),   enName: "Beryllium",      cost: 880,  desc: t("elements.4.desc") },
    { num: 5, symbol: "B",  name: t("elements.5.name"),   enName: "Boron",          cost: 1700, desc: t("elements.5.desc") },
    { num: 6, symbol: "C",  name: t("elements.6.name"),   enName: "Carbon",         cost: 3200, desc: t("elements.6.desc") },
    { num: 7, symbol: "N",  name: t("elements.7.name"),   enName: "Nitrogen",       cost: 10000,desc: t("elements.7.desc") },
    { num: 8,  symbol: "O",  name: t("elements.8.name"),   enName: "Oxygen",         cost: 13000, desc: t("elements.8.desc") },
    { num: 9,  symbol: "F",  name: t("elements.9.name"),   enName: "Fluorine",       cost: 17000, desc: t("elements.9.desc") },
    { num: 10, symbol: "Ne", name: t("elements.10.name"),   enName: "Neon",           cost: 30000, desc: t("elements.10.desc") },
    { num: 11, symbol: "Na", name: t("elements.11.name"),   enName: "Sodium",         cost: 0,   desc: t("elements.notImpl") },
    { num: 12, symbol: "Mg", name: t("elements.12.name"),   enName: "Magnesium",      cost: 0,   desc: t("elements.notImpl") },
    { num: 13, symbol: "Al", name: t("elements.13.name"),   enName: "Aluminium",      cost: 0,   desc: t("elements.notImpl") },
    { num: 14, symbol: "Si", name: t("elements.14.name"),   enName: "Silicon",        cost: 0,   desc: t("elements.notImpl") },
    { num: 15, symbol: "P",  name: t("elements.15.name"),   enName: "Phosphorus",     cost: 0,   desc: t("elements.notImpl") },
    { num: 16, symbol: "S",  name: t("elements.16.name"),   enName: "Sulfur",         cost: 0,   desc: t("elements.notImpl") },
    { num: 17, symbol: "Cl", name: t("elements.17.name"),   enName: "Chlorine",       cost: 0,   desc: t("elements.notImpl") },
    { num: 18, symbol: "Ar", name: t("elements.18.name"),   enName: "Argon",          cost: 0,   desc: t("elements.notImpl") },
    { num: 19, symbol: "K",  name: t("elements.19.name"),   enName: "Potassium",      cost: 0,   desc: t("elements.notImpl") },
    { num: 20, symbol: "Ca", name: t("elements.20.name"),   enName: "Calcium",        cost: 0,   desc: t("elements.notImpl") },
    { num: 21, symbol: "Sc", name: t("elements.21.name"),   enName: "Scandium",       cost: 0,   desc: t("elements.notImpl") },
    { num: 22, symbol: "Ti", name: t("elements.22.name"),   enName: "Titanium",       cost: 0,   desc: t("elements.notImpl") },
    { num: 23, symbol: "V",  name: t("elements.23.name"),   enName: "Vanadium",       cost: 0,   desc: t("elements.notImpl") },
    { num: 24, symbol: "Cr", name: t("elements.24.name"),   enName: "Chromium",       cost: 0,   desc: t("elements.notImpl") },
    { num: 25, symbol: "Mn", name: t("elements.25.name"),   enName: "Manganese",      cost: 0,   desc: t("elements.notImpl") },
    { num: 26, symbol: "Fe", name: t("elements.26.name"),   enName: "Iron",           cost: 0,   desc: t("elements.notImpl") },
    { num: 27, symbol: "Co", name: t("elements.27.name"),   enName: "Cobalt",         cost: 0,   desc: t("elements.notImpl") },
    { num: 28, symbol: "Ni", name: t("elements.28.name"),   enName: "Nickel",         cost: 0,   desc: t("elements.notImpl") },
    { num: 29, symbol: "Cu", name: t("elements.29.name"),   enName: "Copper",         cost: 0,   desc: t("elements.notImpl") },
    { num: 30, symbol: "Zn", name: t("elements.30.name"),   enName: "Zinc",           cost: 0,   desc: t("elements.notImpl") },
    { num: 31, symbol: "Ga", name: t("elements.31.name"),   enName: "Gallium",        cost: 0,   desc: t("elements.notImpl") },
    { num: 32, symbol: "Ge", name: t("elements.32.name"),   enName: "Germanium",      cost: 0,   desc: t("elements.notImpl") },
    { num: 33, symbol: "As", name: t("elements.33.name"),   enName: "Arsenic",        cost: 0,   desc: t("elements.notImpl") },
    { num: 34, symbol: "Se", name: t("elements.34.name"),   enName: "Selenium",       cost: 0,   desc: t("elements.notImpl") },
    { num: 35, symbol: "Br", name: t("elements.35.name"),   enName: "Bromine",        cost: 0,   desc: t("elements.notImpl") },
    { num: 36, symbol: "Kr", name: t("elements.36.name"),   enName: "Krypton",        cost: 0,   desc: t("elements.notImpl") },
    { num: 37, symbol: "Rb", name: t("elements.37.name"),   enName: "Rubidium",       cost: 0,   desc: t("elements.notImpl") },
    { num: 38, symbol: "Sr", name: t("elements.38.name"),   enName: "Strontium",      cost: 0,   desc: t("elements.notImpl") },
    { num: 39, symbol: "Y",  name: t("elements.39.name"),   enName: "Yttrium",        cost: 0,   desc: t("elements.notImpl") },
    { num: 40, symbol: "Zr", name: t("elements.40.name"),   enName: "Zirconium",      cost: 0,   desc: t("elements.notImpl") },
    { num: 41, symbol: "Nb", name: t("elements.41.name"),   enName: "Niobium",        cost: 0,   desc: t("elements.notImpl") },
    { num: 42, symbol: "Mo", name: t("elements.42.name"),   enName: "Molybdenum",     cost: 0,   desc: t("elements.notImpl") },
    { num: 43, symbol: "Tc", name: t("elements.43.name"),   enName: "Technetium",     cost: 0,   desc: t("elements.notImpl") },
    { num: 44, symbol: "Ru", name: t("elements.44.name"),   enName: "Ruthenium",      cost: 0,   desc: t("elements.notImpl") },
    { num: 45, symbol: "Rh", name: t("elements.45.name"),   enName: "Rhodium",        cost: 0,   desc: t("elements.notImpl") },
    { num: 46, symbol: "Pd", name: t("elements.46.name"),   enName: "Palladium",      cost: 0,   desc: t("elements.notImpl") },
    { num: 47, symbol: "Ag", name: t("elements.47.name"),   enName: "Silver",         cost: 0,   desc: t("elements.notImpl") },
    { num: 48, symbol: "Cd", name: t("elements.48.name"),   enName: "Cadmium",        cost: 0,   desc: t("elements.notImpl") },
    { num: 49, symbol: "In", name: t("elements.49.name"),   enName: "Indium",         cost: 0,   desc: t("elements.notImpl") },
    { num: 50, symbol: "Sn", name: t("elements.50.name"),   enName: "Tin",            cost: 0,   desc: t("elements.notImpl") },
    { num: 51, symbol: "Sb", name: t("elements.51.name"),   enName: "Antimony",       cost: 0,   desc: t("elements.notImpl") },
    { num: 52, symbol: "Te", name: t("elements.52.name"),   enName: "Tellurium",      cost: 0,   desc: t("elements.notImpl") },
    { num: 53, symbol: "I",  name: t("elements.53.name"),   enName: "Iodine",         cost: 0,   desc: t("elements.notImpl") },
    { num: 54, symbol: "Xe", name: t("elements.54.name"),   enName: "Xenon",          cost: 0,   desc: t("elements.notImpl") },
    { num: 55, symbol: "Cs", name: t("elements.55.name"),   enName: "Caesium",        cost: 0,   desc: t("elements.notImpl") },
    { num: 56, symbol: "Ba", name: t("elements.56.name"),   enName: "Barium",         cost: 0,   desc: t("elements.notImpl") },
    { num: 57, symbol: "La", name: t("elements.57.name"),   enName: "Lanthanum",      cost: 0,   desc: t("elements.notImpl") },
    { num: 58, symbol: "Ce", name: t("elements.58.name"),   enName: "Cerium",         cost: 0,   desc: t("elements.notImpl") },
    { num: 59, symbol: "Pr", name: t("elements.59.name"),   enName: "Praseodymium",   cost: 0,   desc: t("elements.notImpl") },
    { num: 60, symbol: "Nd", name: t("elements.60.name"),   enName: "Neodymium",      cost: 0,   desc: t("elements.notImpl") },
    { num: 61, symbol: "Pm", name: t("elements.61.name"),   enName: "Promethium",     cost: 0,   desc: t("elements.notImpl") },
    { num: 62, symbol: "Sm", name: t("elements.62.name"),   enName: "Samarium",       cost: 0,   desc: t("elements.notImpl") },
    { num: 63, symbol: "Eu", name: t("elements.63.name"),   enName: "Europium",       cost: 0,   desc: t("elements.notImpl") },
    { num: 64, symbol: "Gd", name: t("elements.64.name"),   enName: "Gadolinium",     cost: 0,   desc: t("elements.notImpl") },
    { num: 65, symbol: "Tb", name: t("elements.65.name"),   enName: "Terbium",        cost: 0,   desc: t("elements.notImpl") },
    { num: 66, symbol: "Dy", name: t("elements.66.name"),   enName: "Dysprosium",     cost: 0,   desc: t("elements.notImpl") },
    { num: 67, symbol: "Ho", name: t("elements.67.name"),   enName: "Holmium",        cost: 0,   desc: t("elements.notImpl") },
    { num: 68, symbol: "Er", name: t("elements.68.name"),   enName: "Erbium",         cost: 0,   desc: t("elements.notImpl") },
    { num: 69, symbol: "Tm", name: t("elements.69.name"),   enName: "Thulium",        cost: 0,   desc: t("elements.notImpl") },
    { num: 70, symbol: "Yb", name: t("elements.70.name"),   enName: "Ytterbium",      cost: 0,   desc: t("elements.notImpl") },
    { num: 71, symbol: "Lu", name: t("elements.71.name"),   enName: "Lutetium",       cost: 0,   desc: t("elements.notImpl") },
    { num: 72, symbol: "Hf", name: t("elements.72.name"),   enName: "Hafnium",        cost: 0,   desc: t("elements.notImpl") },
    { num: 73, symbol: "Ta", name: t("elements.73.name"),   enName: "Tantalum",       cost: 0,   desc: t("elements.notImpl") },
    { num: 74, symbol: "W",  name: t("elements.74.name"),   enName: "Tungsten",       cost: 0,   desc: t("elements.notImpl") },
    { num: 75, symbol: "Re", name: t("elements.75.name"),   enName: "Rhenium",        cost: 0,   desc: t("elements.notImpl") },
    { num: 76, symbol: "Os", name: t("elements.76.name"),   enName: "Osmium",         cost: 0,   desc: t("elements.notImpl") },
    { num: 77, symbol: "Ir", name: t("elements.77.name"),   enName: "Iridium",        cost: 0,   desc: t("elements.notImpl") },
    { num: 78, symbol: "Pt", name: t("elements.78.name"),   enName: "Platinum",       cost: 0,   desc: t("elements.notImpl") },
    { num: 79, symbol: "Au", name: t("elements.79.name"),   enName: "Gold",           cost: 0,   desc: t("elements.notImpl") },
    { num: 80, symbol: "Hg", name: t("elements.80.name"),   enName: "Mercury",        cost: 0,   desc: t("elements.notImpl") },
    { num: 81, symbol: "Tl", name: t("elements.81.name"),   enName: "Thallium",       cost: 0,   desc: t("elements.notImpl") },
    { num: 82, symbol: "Pb", name: t("elements.82.name"),   enName: "Lead",           cost: 0,   desc: t("elements.notImpl") },
    { num: 83, symbol: "Bi", name: t("elements.83.name"),   enName: "Bismuth",        cost: 0,   desc: t("elements.notImpl") },
    { num: 84, symbol: "Po", name: t("elements.84.name"),   enName: "Polonium",       cost: 0,   desc: t("elements.notImpl") },
    { num: 85, symbol: "At", name: t("elements.85.name"),   enName: "Astatine",       cost: 0,   desc: t("elements.notImpl") },
    { num: 86, symbol: "Rn", name: t("elements.86.name"),   enName: "Radon",          cost: 0,   desc: t("elements.notImpl") },
    { num: 87, symbol: "Fr", name: t("elements.87.name"),   enName: "Francium",       cost: 0,   desc: t("elements.notImpl") },
    { num: 88, symbol: "Ra", name: t("elements.88.name"),   enName: "Radium",         cost: 0,   desc: t("elements.notImpl") },
    { num: 89, symbol: "Ac", name: t("elements.89.name"),   enName: "Actinium",       cost: 0,   desc: t("elements.notImpl") },
    { num: 90, symbol: "Th", name: t("elements.90.name"),   enName: "Thorium",        cost: 0,   desc: t("elements.notImpl") },
    { num: 91, symbol: "Pa", name: t("elements.91.name"),   enName: "Protactinium",   cost: 0,   desc: t("elements.notImpl") },
    { num: 92, symbol: "U",  name: t("elements.92.name"),   enName: "Uranium",        cost: 0,   desc: t("elements.notImpl") },
    { num: 93, symbol: "Np", name: t("elements.93.name"),   enName: "Neptunium",      cost: 0,   desc: t("elements.notImpl") },
    { num: 94, symbol: "Pu", name: t("elements.94.name"),   enName: "Plutonium",      cost: 0,   desc: t("elements.notImpl") },
    { num: 95, symbol: "Am", name: t("elements.95.name"),   enName: "Americium",      cost: 0,   desc: t("elements.notImpl") },
    { num: 96, symbol: "Cm", name: t("elements.96.name"),   enName: "Curium",         cost: 0,   desc: t("elements.notImpl") },
    { num: 97, symbol: "Bk", name: t("elements.97.name"),   enName: "Berkelium",      cost: 0,   desc: t("elements.notImpl") },
    { num: 98, symbol: "Cf", name: t("elements.98.name"),   enName: "Californium",    cost: 0,   desc: t("elements.notImpl") },
    { num: 99, symbol: "Es", name: t("elements.99.name"),   enName: "Einsteinium",    cost: 0,   desc: t("elements.notImpl") },
    { num: 100,symbol: "Fm", name: t("elements.100.name"),   enName: "Fermium",        cost: 0,   desc: t("elements.notImpl") },
    { num: 101,symbol: "Md", name: t("elements.101.name"),   enName: "Mendelevium",    cost: 0,   desc: t("elements.notImpl") },
    { num: 102,symbol: "No", name: t("elements.102.name"),   enName: "Nobelium",       cost: 0,   desc: t("elements.notImpl") },
    { num: 103,symbol: "Lr", name: t("elements.103.name"),   enName: "Lawrencium",     cost: 0,   desc: t("elements.notImpl") },
    { num: 104,symbol: "Rf", name: t("elements.104.name"),   enName: "Rutherfordium",  cost: 0,   desc: t("elements.notImpl") },
    { num: 105,symbol: "Db", name: t("elements.105.name"),   enName: "Dubnium",        cost: 0,   desc: t("elements.notImpl") },
    { num: 106,symbol: "Sg", name: t("elements.106.name"),   enName: "Seaborgium",     cost: 0,   desc: t("elements.notImpl") },
    { num: 107,symbol: "Bh", name: t("elements.107.name"),   enName: "Bohrium",        cost: 0,   desc: t("elements.notImpl") },
    { num: 108,symbol: "Hs", name: t("elements.108.name"),   enName: "Hassium",        cost: 0,   desc: t("elements.notImpl") },
    { num: 109,symbol: "Mt", name: t("elements.109.name"),   enName: "Meitnerium",     cost: 0,   desc: t("elements.notImpl") },
    { num: 110,symbol: "Ds", name: t("elements.110.name"),   enName: "Darmstadtium",   cost: 0,   desc: t("elements.notImpl") },
    { num: 111,symbol: "Rg", name: t("elements.111.name"),   enName: "Roentgenium",    cost: 0,   desc: t("elements.notImpl") },
    { num: 112,symbol: "Cn", name: t("elements.112.name"),   enName: "Copernicium",    cost: 0,   desc: t("elements.notImpl") },
    { num: 113,symbol: "Nh", name: t("elements.113.name"),   enName: "Nihonium",       cost: 0,   desc: t("elements.notImpl") },
    { num: 114,symbol: "Fl", name: t("elements.114.name"),   enName: "Flerovium",      cost: 0,   desc: t("elements.notImpl") },
    { num: 115,symbol: "Mc", name: t("elements.115.name"),   enName: "Moscovium",      cost: 0,   desc: t("elements.notImpl") },
    { num: 116,symbol: "Lv", name: t("elements.116.name"),   enName: "Livermorium",    cost: 0,   desc: t("elements.notImpl") },
    { num: 117,symbol: "Ts", name: t("elements.117.name"),   enName: "Tennessine",     cost: 0,   desc: t("elements.notImpl") },
    { num: 118,symbol: "Og", name: t("elements.118.name"),   enName: "Oganesson",      cost: 0,   desc: t("elements.notImpl") }
];

// 检查量子是否已解锁
function isQuantumUnlocked() {
    return gte(state.bp, QUANTUM_BP_THRESHOLD) || state.quantumCount > 0 || state.quantumUnlocked;
}

// 检查并更新量子里程碑
function checkQuantumMilestones() {
    for (let i = 0; i < QUANTUM_MILESTONES.length; i++) {
        if (!state.quantumMilestones.includes(i) && state.quantumCount >= QUANTUM_MILESTONES[i].count) {
            state.quantumMilestones.push(i);
            console.log("⚛️ 量子里程碑解锁：" + QUANTUM_MILESTONES[i].name);
        }
    }
}

// 量子里程碑是否解锁
function isQuantumMilestoneUnlocked(idx) {
    return state.quantumMilestones.includes(idx);
}

// 计算量子重置可获得的量子点: f(x) = (lg(bp)/4)^4
function calcGainQP() {
    if (!gte(state.bp, QUANTUM_BP_THRESHOLD)) return { man: 0, exp: 0 };
    // lg(bp)
    let lgBP = lg(state.bp);
    if (!lgBP || lgBP.man <= 0) return { man: 0, exp: 0 };
    // lg(bp) / 4
    let lgBPdiv4 = dev(lgBP, { man: 4, exp: 0 });
    if (!lgBPdiv4 || lgBPdiv4.man <= 0) return { man: 0, exp: 0 };
    // (lg(bp)/4)^4
    let qp = power(lgBPdiv4, { man: 4, exp: 0 });
    // 量子里程碑4: 量子点数获取 ×2
    if (state.quantumMilestones.includes(3)) {
        qp = muil(qp, { man: 2, exp: 0 });
    }
    // 元素3 (锂): 量子点获取量 × 成就数
    if (state.elementsOwned.includes(3)) {
        const achCount = Object.keys(achievements).length;
        if (achCount > 0) {
            qp = muil(qp, change(achCount));
        }
    }
    // 升级7: 量子点获取量 ×2^level
    if (state.upgrade7Level > 0) {
        qp = muil(qp, getUpgrade7Mult());
    }
    // 量子里程碑8: 量子点获取量 ^1.5
    if (state.quantumMilestones.includes(7)) {
        qp = power(qp, { man: 1.5, exp: 0 });
    }
    return qp;
}

// 获取Snap冲击波数量 = √(量子超越次数)
function getSnapCount() {
    if (!state.quantumMilestones.includes(4)) return 0;
    return Math.floor(Math.sqrt(state.quantumCount));
}

// 量子升级6: 相对论影响的开始速度推迟
// 每级推迟10%（累乘），超过15级后效果折算为15%，超过50级后折算为1/(25+购买数量)
function getUpgrade6RelativityDelay() {
    const lv = state.upgrade6Level;
    if (lv === 0) return 1; // 无推迟
    let totalDelay;
    if (lv <= 15) {
        // 每级推迟10%，累乘: 1.1^lv
        totalDelay = Math.pow(1.1, lv);
    } else if (lv <= 50) {
        // 前15级正常，之后每级效果折算为原来的15%: (1+0.1*0.15)^extra
        const base15 = Math.pow(1.1, 15);
        const extra = lv - 15;
        totalDelay = base15 * Math.pow(1 + 0.1 * 0.15, extra);
    } else {
        // 前15级正常，16-50级15%，50级以上1/(25+购买数量)
        // 使用 log10 累加防止大数溢出
        let logSum = 15 * Math.log10(1.1) + 35 * Math.log10(1 + 0.1 * 0.15);
        for (let i = 51; i <= lv; i++) {
            const factor = 1 / (25 + i); // 1/(25+购买数量)
            logSum += Math.log10(1 + 0.1 * factor); // 推迟效果
        }
        // 转回普通数值（change() 会处理大数）
        const exp = Math.floor(logSum);
        const man = Math.pow(10, logSum - exp);
        totalDelay = man * Math.pow(10, Math.min(exp, 15));
    }
    return totalDelay;
}

// 量子升级6价格
function getUpgrade6Cost() {
    return power(change(2), change(state.upgrade6Level));
}

// 购买量子升级6
function buyUpgrade6() {
    if (!isQuantumMilestoneUnlocked(1)) return;
    const cost = getUpgrade6Cost();
    if (!gte(state.quantumPoints, cost)) {
        showToast(t("toast.qpShort"), "error");
        return;
    }
    state.quantumPoints = minus(state.quantumPoints, cost);
    state.upgrade6Level++;
    render();
    updateQuantumUI();
    console.log("⚛️ 升级6 升到 Lv" + state.upgrade6Level);
}

// 购买量子升级6(最大)
function buyMaxUpgrade6() {
    if (!isQuantumMilestoneUnlocked(1)) return;
    let bought = 0;
    let maxIter = 10000;
    let cost = getUpgrade6Cost();
    while (gte(state.quantumPoints, cost) && maxIter-- > 0) {
        state.quantumPoints = minus(state.quantumPoints, cost);
        state.upgrade6Level++;
        bought++;
        cost = getUpgrade6Cost();
    }
    if (bought > 0) {
        render();
        updateQuantumUI();
        console.log("⚛️ 升级6 最大购买 " + toDisplayNum(bought) + " 次，升到 Lv" + toDisplayNum(state.upgrade6Level));
    }
}

// 量子升级7: 量子点获取量*2（每购买一次）
const UPGRADE7_MAX_LEVEL = 1000;
const UPGRADE7_BASE_COST = 10;
const UPGRADE7_COST_MULT = 5;

function getUpgrade7Cost() {
    return muil(change(UPGRADE7_BASE_COST), power(change(UPGRADE7_COST_MULT), change(state.upgrade7Level)));
}

function getUpgrade7Mult() {
    return power(change(2), change(state.upgrade7Level));
}

function buyUpgrade7() {
    if (!isQuantumMilestoneUnlocked(1)) return;
    if (state.upgrade7Level >= UPGRADE7_MAX_LEVEL) return;
    const cost = getUpgrade7Cost();
    if (!gte(state.quantumPoints, cost)) {
        showToast(t("toast.qpShort"), "error");
        return;
    }
    state.quantumPoints = minus(state.quantumPoints, cost);
    state.upgrade7Level++;
    render();
    updateQuantumUI();
    console.log("⚛️ 升级7 升到 Lv" + state.upgrade7Level);
}

function buyMaxUpgrade7() {
    if (!isQuantumMilestoneUnlocked(1)) return;
    let bought = 0;
    let maxIter = 10000;
    let cost = getUpgrade7Cost();
    while (state.upgrade7Level < UPGRADE7_MAX_LEVEL && gte(state.quantumPoints, cost) && maxIter-- > 0) {
        state.quantumPoints = minus(state.quantumPoints, cost);
        state.upgrade7Level++;
        bought++;
        cost = getUpgrade7Cost();
    }
    if (bought > 0) {
        render();
        updateQuantumUI();
        console.log("⚛️ 升级7 最大购买 " + toDisplayNum(bought) + " 次，升到 Lv" + toDisplayNum(state.upgrade7Level));
    }
}

// 量子重置
function quantumReset() {
    if (!isQuantumUnlocked()) return;
    if (!gte(state.bp, QUANTUM_BP_THRESHOLD)) {
        showToast(t("toast.bpShortQuantum") + toDisplayNum(1e4) + t("toast.bpShortQuantumSuffix"), "error");
        return;
    }
    if (gameSettings.confirmQuantum && !confirm(t("confirm.quantum"))) return;

    const gainedQP = calcGainQP();
    state.quantumPoints = plus(state.quantumPoints, gainedQP);
    state.quantumCount++;
    // 统计：记录量子用时
    if (state.quantumStartTime > 0) {
        const qTime = (Date.now() - state.quantumStartTime) / 1000;
        if (qTime < state.minQuantumTime) state.minQuantumTime = qTime;
    }
    state.quantumStartTime = Date.now();

    // 重置所有量子层级之前的进度
    state.s = { man: 1, exp: 0 };
    state.v = { man: 1, exp: 0 };
    state.a = { man: 1, exp: -3 };
    state.j = { man: 1, exp: -6 };
    state.vLevel = 0;
    state.aLevel = 0;
    state.jLevel = 0;
    state.bp = { man: 0, exp: 0 };
    state.tpLevel = 0;
    state.transcendCount = 0;
    state.frag1 = false; state.frag2 = false; state.frag3 = false;
    state.frag4 = false; state.frag5 = false; state.frag6 = false;
    state.upgradeBuyCount = 0;
    state.autoV = { enabled: false, level: 0 };
    state.autoA = { enabled: false, level: 0 };
    state.autoJ = { enabled: false, level: 0 };
    state.autoTranscend = {
        enabled: false,
        condInterval: false, intervalSec: 60,
        condBPAmount: false, bpAmount: "1",
        condBPMult: false, bpMult: 2
    };
    state.distU1_1 = false;
    state.distU1_2 = false;
    state.distU1_3 = false;
    state.distU2_1 = 0;
    state.distU2_1_bonus = 0;
    state.distU2_2 = 0;
    state.maxDist = { man: 1, exp: 0 };
    state.milestones = [];
    transcendUnlocked = false;
    state.quantumUnlocked = true;

    // 退出活跃挑战
    state.challenges.activeChallenge = -1;
    state.challenges.challengeStartTime = 0;
    state.challenges.c5_t = 0;
    state.challenges.c6_accumulator = 0;
    // 量子重置重置挑战完成进度和奖励（但不重置最快记录）
    // 元素8 (氧): 量子重置不再重置挑战完成情况
    if (!state.elementsOwned.includes(8)) {
        state.challenges.completed = [false, false, false, false, false, false];
        state.challengeRewards = [false, false, false, false, false, false];
    }
    // 量子重置重置U1-4
    state.distU1_4 = false;
    // 量子重置完全重置核反应堆
    resetReactorForQuantum();

    // 先检查量子里程碑（确保第1次重置时里程碑1就已生效）
    checkQuantumMilestones();

    // 量子里程碑1: 以10次超越次数和50BP开始
    if (state.quantumMilestones.includes(0)) {
        state.transcendCount = 10;
        state.bp = { man: 5, exp: 1 }; // 50 BP
        checkMilestones();
    }

    // 量子里程碑1: 自动获得U1-1, U1-2和3个额外不计入购买数量的U2-1
    if (state.quantumMilestones.includes(0)) {
        state.distU1_1 = true;
        state.distU1_2 = true;
        state.distU2_1_bonus = 3;
    }

    // 元素6: 每次超越/量子重置从3000BP开始，所有距离升级有1级，U2-1有5级
    if (state.elementsOwned.includes(6)) {
        state.bp = plus(state.bp, change(3000));
        state.distU1_1 = true;
        state.distU1_2 = true;
        state.distU1_3 = true;
        state.distU2_1 = 1;
        state.distU2_2 = 1;
        state.distU2_1_bonus = (state.distU2_1_bonus || 0) + 5;
    }

    // 隐藏自动化tab
    const tabBtn = document.getElementById("tabbtn_automation");
    if (tabBtn) tabBtn.style.display = "none";

    lastTime = Date.now();
    render();
    updateQuantumUI();
    if (currentSlot !== null) saveGame(currentSlot);
    console.log("⚛️ 量子重置成功！获得 " + toDisplay(gainedQP) + " QP，总 QP: " + toDisplay(state.quantumPoints));
}

// ---------- 元素购买 ----------
function buyElement(num) {
    const elem = ELEMENTS.find(e => e.num === num);
    if (!elem) return;
    if (state.elementsOwned.includes(num)) return;
    if (elem.cost === 0) {
        showToast(t("toast.elemNotImpl"), "warn");
        return;
    }
    const cost = change(elem.cost);
    if (!gte(state.quantumPoints, cost)) {
        showToast(t("toast.qpShortNeed") + toDisplayNum(elem.cost) + t("toast.qpShortNeedSuffix"), "error");
        return;
    }
    state.quantumPoints = minus(state.quantumPoints, cost);
    state.elementsOwned.push(num);

    // 元素1: 显示自动购买碎片控件
    if (num === 1) {
        const autoFragCtrl = document.getElementById("auto_frag_control");
        if (autoFragCtrl) autoFragCtrl.style.display = "block";
    }
    // 元素4: 显示自动购买距离升级和超越升级控件
    if (num === 4) {
        const autoDistCtrl = document.getElementById("auto_dist_upgrade_control");
        if (autoDistCtrl) autoDistCtrl.style.display = "block";
        const autoTransCtrl = document.getElementById("auto_transcend_upgrade_control");
        if (autoTransCtrl) autoTransCtrl.style.display = "block";
    }
    // 元素7: 显示自动量子控件
    if (num === 7) {
        const autoQCtrl = document.getElementById("auto_quantum_control");
        if (autoQCtrl) autoQCtrl.style.display = "block";
    }

    // 重建元素网格（更新解锁状态）
    buildElementGrid();
    // 更新详情面板
    selectElement(num);
    render();
    updateQuantumUI();
    updateElementUI();
    if (currentSlot !== null) saveGame(currentSlot);
    console.log("🔬 元素 " + num + " (" + elem.name + ") 已购买");
}

// ---------- 自动购买超越碎片 ----------
function checkAutoFrag() {
    if (!state.elementsOwned.includes(1)) return;
    if (!state.autoFrag.enabled) return;
    // 遍历所有未购买的碎片，尝试自动购买
    for (let id = 1; id <= 6; id++) {
        if (!state["frag" + id]) {
            const frag = FRAGMENTS[id];
            if (frag && gte(state.bp, change(frag.cost))) {
                buyFragment(id);
            }
        }
    }
}

// ---------- 自动购买距离升级（元素4） ----------
function checkAutoDistUpgrade() {
    if (!state.elementsOwned.includes(4)) return;
    if (!state.autoDistUpgrade.enabled) return;
    // 自动购买距离升级 U1 (一次性)
    for (let id = 1; id <= 3; id++) {
        if (!state["distU1_" + id]) {
            const cost = getDistU1Cost(id);
            if (gte(state.s, cost)) buyDistU1(id);
        }
    }
    // 自动购买距离升级 U2 (可重复)
    for (let id = 1; id <= 2; id++) {
        const cost = getDistU2Cost(id, state["distU2_" + id]);
        if (gte(state.s, cost)) {
            if (state.autoBuyMode === 0) {
                buyMaxDistU2(id);
            } else {
                buyDistU2(id);
            }
        }
    }
}

// ---------- 自动购买超越升级（元素4） ----------
function checkAutoTranscendUpgrade() {
    if (!state.elementsOwned.includes(4)) return;
    if (!state.autoTranscendUpgrade.enabled) return;
    if (!isTranscendUpgradeUnlocked()) return;
    // 自动购买升级4
    const tpCost = getTPCost();
    if (gte(state.bp, tpCost)) {
        if (state.autoBuyMode === 0) {
            buyMaxTP();
        } else {
            buyTP();
        }
    }
    // 自动购买升级5（如果已解锁元素5）
    if (state.elementsOwned.includes(5)) {
        const u5Cost = getUpgrade5Cost();
        if (gte(state.bp, u5Cost)) {
            if (state.autoBuyMode === 0) {
                buyMaxUpgrade5();
            } else {
                buyUpgrade5();
            }
        }
    }
}

// ---------- 自动量子（元素7） ----------
function checkAutoQuantum() {
    if (!state.elementsOwned.includes(7)) return;
    if (!state.autoQuantum.enabled) return;
    if (!isQuantumUnlocked()) return;
    if (!gte(state.bp, QUANTUM_BP_THRESHOLD)) return;
    // 条件检查
    if (state.autoQuantum.condBPAmount) {
        const target = parseFloat(state.autoQuantum.bpAmount);
        const currentBPVal = state.bp.man > 0 ? state.bp.exp + Math.log10(state.bp.man) : 0;
        if (currentBPVal < Math.log10(target)) return;
    }
    // 临时关闭确认，执行量子重置
    const oldConfirm = gameSettings.confirmQuantum;
    gameSettings.confirmQuantum = false;
    quantumReset();
    gameSettings.confirmQuantum = oldConfirm;
}

// ---------- 元素UI更新 ----------
function updateElementUI() {
    // 元素计数器
    const elemCounterEl = document.getElementById("elem_counter");
    if (elemCounterEl) elemCounterEl.textContent = toDisplayNum(state.elementsOwned.length);

    // 元素1: 自动购买碎片控件
    const autoFragCtrl = document.getElementById("auto_frag_control");
    if (autoFragCtrl) {
        autoFragCtrl.style.display = state.elementsOwned.includes(1) ? "block" : "none";
    }
    const autoFragCb = document.getElementById("auto_frag_enabled");
    if (autoFragCb) autoFragCb.checked = state.autoFrag.enabled;

    // 元素4: 自动购买距离升级控件
    const autoDistCtrl = document.getElementById("auto_dist_upgrade_control");
    if (autoDistCtrl) {
        autoDistCtrl.style.display = state.elementsOwned.includes(4) ? "block" : "none";
    }
    const autoDistCb = document.getElementById("auto_dist_upgrade_enabled");
    if (autoDistCb) autoDistCb.checked = state.autoDistUpgrade.enabled;

    // 元素4: 自动购买超越升级控件
    const autoTransCtrl = document.getElementById("auto_transcend_upgrade_control");
    if (autoTransCtrl) {
        autoTransCtrl.style.display = state.elementsOwned.includes(4) ? "block" : "none";
    }
    const autoTransCb = document.getElementById("auto_transcend_upgrade_enabled");
    if (autoTransCb) autoTransCb.checked = state.autoTranscendUpgrade.enabled;

    // 元素7: 自动量子控件
    const autoQCtrl = document.getElementById("auto_quantum_control");
    if (autoQCtrl) {
        autoQCtrl.style.display = state.elementsOwned.includes(7) ? "block" : "none";
    }
    const autoQCb = document.getElementById("auto_quantum_enabled");
    if (autoQCb) autoQCb.checked = state.autoQuantum.enabled;
    const autoQCond = document.getElementById("auto_q_cond_bpamount");
    if (autoQCond) autoQCond.checked = state.autoQuantum.condBPAmount;
    const autoQAmount = document.getElementById("auto_q_bpamount_val");
    if (autoQAmount) autoQAmount.value = state.autoQuantum.bpAmount;

    // 自动化购买模式
    const modeRadio1 = document.querySelector('input[name="auto_buy_mode"][value="1"]');
    const modeRadio0 = document.querySelector('input[name="auto_buy_mode"][value="0"]');
    if (state.autoBuyMode === 1) {
        if (modeRadio1) modeRadio1.checked = true;
    } else {
        if (modeRadio0) modeRadio0.checked = true;
    }

    // 更新元素网格状态（不重建DOM，保留滚动位置）
    updateElementGridStatus();
    // 更新行状态提示
    updateRowStatus();
    // 如果有选中的元素，刷新详情面板
    if (selectedElementNum !== null) {
        selectElement(selectedElementNum);
    }
}

// 更新行状态提示
function updateRowStatus() {
    const statusEl = document.getElementById("col_status");
    if (!statusEl) return;
    const rows = getRowsWithImplementedElements();
    if (rows.length === 0) { statusEl.innerHTML = ""; return; }
    
    let html = '<div style="display:flex; flex-wrap:wrap; gap:6px; justify-content:center;">';
    rows.forEach((r, i) => {
        const complete = isRowComplete(r);
        const unlocked = isRowUnlocked(r);
        const elems = getImplementedElementsInRow(r);
        const ownedCount = elems.filter(e => state.elementsOwned.includes(e.num)).length;
        
        let bgColor, borderColor, textColor, icon;
        if (complete) {
            bgColor = "rgba(60, 20, 90, 0.6)";
            borderColor = "#aa44ff";
            textColor = "#cc88ff";
            icon = "✅";
        } else if (unlocked) {
            bgColor = "rgba(40, 30, 60, 0.5)";
            borderColor = "#8866cc";
            textColor = "#aa99cc";
            icon = "🔓";
        } else {
            bgColor = "rgba(20, 10, 30, 0.5)";
            borderColor = "#443366";
            textColor = "#664488";
            icon = "🔒";
        }
        
        html += `<div style="padding:4px 10px; border:1px solid ${borderColor}; border-radius:4px; background:${bgColor}; color:${textColor}; font-size:11px;">`;
        html += `${icon} ${t("elements.rowStatus")}${r} (${ownedCount}/${elems.length})`;
        html += `</div>`;
    });
    html += '</div>';
    statusEl.innerHTML = html;
}

// 更新量子UI
function updateQuantumUI() {
    const lockEl = document.getElementById("quantum_lock");
    const contentEl = document.getElementById("quantum_content");
    if (!lockEl) return;

    const unlocked = isQuantumUnlocked();

    if (unlocked) {
        if (lockEl) lockEl.style.display = "none";
        if (contentEl) contentEl.style.display = "block";

        // 量子重置页面
        const qpEl = document.getElementById("quantum_qp");
        if (qpEl) qpEl.textContent = toDisplay(state.quantumPoints) + " QP";

        const gainEl = document.getElementById("quantum_gain");
        const gainQP = calcGainQP();
        if (gainEl) gainEl.textContent = "+ " + toDisplay(gainQP) + " QP";

        const resetBtn = document.getElementById("quantum_reset_btn");
        if (resetBtn) {
            const canReset = gte(state.bp, QUANTUM_BP_THRESHOLD);
            resetBtn.disabled = !canReset;
            resetBtn.textContent = canReset
                ? t("quantum.resetBtnGain") + toDisplay(gainQP) + " QP)"
                : t("quantum.resetBtnFail") + toDisplayNum(1e4) + " (" + toDisplay(state.bp) + " / " + toDisplay(change(1e4)) + ")";
        }

        const countEl = document.getElementById("quantum_count");
        if (countEl) countEl.textContent = toDisplayNum(state.quantumCount + 1) + t("quantum.count");

        // 量子里程碑UI
        QUANTUM_MILESTONES.forEach((ms, i) => {
            const card = document.getElementById("qms_" + i);
            if (!card) return;
            const done = state.quantumMilestones.includes(i);
            card.classList.toggle("unlocked", done);
            const statusEl = card.querySelector(".ach-status");
            if (statusEl) statusEl.textContent = done ? t("quantum.ms.unlocked") : t("quantum.ms.lockedNeeds") + toDisplayNum(ms.count) + t("quantum.ms.lockedSuffix");
        });

        const msCounterEl = document.getElementById("quantum_milestone_counter");
        if (msCounterEl) msCounterEl.textContent = toDisplayNum(state.quantumMilestones.length) + "/" + toDisplayNum(QUANTUM_MILESTONES.length);

        // 量子升级UI
        const upgLocked = !isQuantumMilestoneUnlocked(1);
        const upgLockEl = document.getElementById("quantum_upgrade_lock");
        const upgContentEl = document.getElementById("quantum_upgrade_content");
        if (upgLockEl) upgLockEl.style.display = upgLocked ? "block" : "none";
        if (upgContentEl) upgContentEl.style.display = upgLocked ? "none" : "block";

        if (!upgLocked) {
            const u6Cost = getUpgrade6Cost();
            const u6Btn = document.getElementById("upgrade6_btn");
            if (u6Btn) {
                u6Btn.disabled = !gte(state.quantumPoints, u6Cost);
                u6Btn.textContent = t("quantum.upgrade6.buy") + toDisplay(u6Cost) + " QP";
            }
            const u6LevelEl = document.getElementById("upgrade6_level");
            if (u6LevelEl) u6LevelEl.textContent = "Lv" + toDisplayNum(state.upgrade6Level);
            const u6EffEl = document.getElementById("upgrade6_eff");
            if (u6EffEl) {
                const delay = getUpgrade6RelativityDelay();
                u6EffEl.textContent = t("quantum.upgrade6.eff") + toDisplayNum(delay);
            }
            // 升级6 最大购买数量
            const u6MaxCountEl = document.getElementById("u6_max_count");
            if (u6MaxCountEl) {
                let u6Max = 0;
                let u6TempQP = { ...state.quantumPoints };
                let u6TempCost = getUpgrade6Cost();
                let u6Iter = 10000;
                while (gte(u6TempQP, u6TempCost) && u6Iter-- > 0) {
                    u6TempQP = minus(u6TempQP, u6TempCost);
                    u6Max++;
                    const savedLv = state.upgrade6Level;
                    state.upgrade6Level += u6Max;
                    u6TempCost = getUpgrade6Cost();
                    state.upgrade6Level = savedLv;
                }
                u6MaxCountEl.textContent = toDisplayNum(u6Max);
            }

            // 升级7 UI
            const u7Cost = getUpgrade7Cost();
            const u7Btn = document.getElementById("upgrade7_btn");
            if (u7Btn) {
                u7Btn.disabled = !gte(state.quantumPoints, u7Cost) || state.upgrade7Level >= UPGRADE7_MAX_LEVEL;
                u7Btn.textContent = t("quantum.upgrade7.buy") + toDisplay(u7Cost) + " QP";
            }
            const u7MaxBtn = document.getElementById("upgrade7_max_btn");
            if (u7MaxBtn) {
                u7MaxBtn.disabled = state.upgrade7Level >= UPGRADE7_MAX_LEVEL;
            }
            const u7LevelEl = document.getElementById("upgrade7_level");
            if (u7LevelEl) u7LevelEl.textContent = "Lv" + toDisplayNum(state.upgrade7Level) + "/" + toDisplayNum(UPGRADE7_MAX_LEVEL);
            const u7EffEl = document.getElementById("upgrade7_eff");
            if (u7EffEl) {
                const mult = getUpgrade7Mult();
                u7EffEl.textContent = t("quantum.upgrade7.eff") + toDisplay(mult);
            }
            // 升级7 最大购买数量
            const u7MaxCountEl = document.getElementById("u7_max_count");
            if (u7MaxCountEl) {
                let u7Max = 0;
                let u7TempQP = { ...state.quantumPoints };
                let u7TempCost = getUpgrade7Cost();
                let u7Iter = 10000;
                while (state.upgrade7Level + u7Max < UPGRADE7_MAX_LEVEL && gte(u7TempQP, u7TempCost) && u7Iter-- > 0) {
                    u7TempQP = minus(u7TempQP, u7TempCost);
                    u7Max++;
                    const savedLv = state.upgrade7Level;
                    state.upgrade7Level += u7Max;
                    u7TempCost = getUpgrade7Cost();
                    state.upgrade7Level = savedLv;
                }
                u7MaxCountEl.textContent = toDisplayNum(u7Max);
            }
        }

        // Snap冲击波显示
        const snapEl = document.getElementById("snap_count");
        const snapSection = document.getElementById("snap_section");
        const snapCount = getSnapCount();
        if (snapEl) {
            snapEl.textContent = snapCount > 0 ? toDisplayNum(snapCount) : "0.000e0";
        }
        if (snapSection) {
            snapSection.style.display = state.quantumMilestones.includes(4) ? "block" : "none";
        }

        // 元素周期表锁定/解锁（量子里程碑7: index 6）
        const elemLocked = !state.quantumMilestones.includes(6);
        const elemLockEl = document.getElementById("element_lock");
        const elemContentEl = document.getElementById("element_content");
        if (elemLockEl) elemLockEl.style.display = elemLocked ? "block" : "none";
        if (elemContentEl) elemContentEl.style.display = elemLocked ? "none" : "block";
        if (!elemLocked) {
            updateElementUI();
        }

        // 量子里程碑6效果显示
        const qm6EffEl = document.getElementById("qm6_eff");
        if (qm6EffEl) {
            if (state.quantumMilestones.includes(5) && state.quantumPoints.man > 0) {
                const qpLog = state.quantumPoints.exp + Math.log10(state.quantumPoints.man);
                const qpNum = Math.pow(10, Math.min(qpLog, 15));
                qm6EffEl.textContent = t("quantum.ms6.eff") + toDisplayNum(qpNum * 0.05) + t("quantum.ms6.effSuffix");
            } else {
                qm6EffEl.textContent = t("quantum.ms6.inactive");
            }
        }
    } else {
        if (lockEl) lockEl.style.display = "block";
        if (contentEl) contentEl.style.display = "none";
        const unlockEl = document.getElementById("quantum_unlock_status");
        const progressBar = document.getElementById("quantum_progress_bar");
        if (unlockEl) {
            const lgBP = state.bp.man > 0 ? state.bp.exp + Math.log10(state.bp.man) : 0;
            const progress = Math.min(100, (Math.max(0, lgBP) / 4) * 100);
            unlockEl.textContent = "BP " + toDisplay(state.bp) + " / " + toDisplay(change(1e4)) + " (" + toDisplayNum(progress) + "%)";
            if (progressBar) progressBar.style.width = progress + "%";
        }
        // 隐藏Snap区域
        const snapSection = document.getElementById("snap_section");
        if (snapSection) snapSection.style.display = "none";
    }
}

// 量子子导航切换
function switchQuantumTab(name, el) {
    document.querySelectorAll("#leap_quantum .quantum-sub").forEach(p => p.classList.remove("active"));
    document.querySelectorAll("#leap_quantum .quantum-sub-btn").forEach(b => b.classList.remove("active"));
    const page = document.getElementById("qpage_" + name);
    if (page) page.classList.add("active");
    if (el) el.classList.add("active");
}

// ---------- 购买升级4 ----------
function buyTP() {
    const cost = getTPCost();
    if (!gte(state.bp, cost)) return;
    state.bp = minus(state.bp, cost);
    state.tpLevel++;
    resetChallenge5T();
    render();
    updateTranscendUI();
    console.log("⬆️ 升级4 升到 Lv" + state.tpLevel);
}

// ---------- 购买升级4(最大) ----------
function buyMaxTP() {
    let bought = 0;
    let maxIter = 10000;
    let cost = getTPCost();
    while (gte(state.bp, cost) && maxIter-- > 0) {
        state.bp = minus(state.bp, cost);
        state.tpLevel++;
        bought++;
        cost = getTPCost();
    }
    if (bought > 0) {
        resetChallenge5T();
        render();
        updateTranscendUI();
        console.log("⬆️ 升级4 最大购买 " + bought + " 次，升到 Lv" + state.tpLevel);
    }
}

// ---------- 碎片系统 ----------
const FRAGMENTS = {
    1: { name: t("trans.frag1.name"), cost: 10, desc: t("trans.frag1.desc") },
    2: { name: t("trans.frag2.name"), cost: 15, desc: t("trans.frag2.desc") },
    3: { name: t("trans.frag3.name"), cost: 1000, desc: t("trans.frag3.desc") },
    4: { name: t("trans.frag4.name"), cost: 1500, desc: t("trans.frag4.desc") },
    5: { name: t("trans.frag5.name"), cost: 5000, desc: t("trans.frag5.desc") },
    6: { name: t("trans.frag6.name"), cost: 40000, desc: t("trans.frag6.desc") }
};

// ==================================================
//          超越里程碑系统
// ==================================================
const MILESTONES = [
    { count: 1,    name: t("trans.ms1.name"),   reward: t("trans.ms1.reward") },
    { count: 2,    name: t("trans.ms2.name"),   reward: t("trans.ms2.reward") },
    { count: 3,    name: t("trans.ms3.name"),   reward: t("trans.ms3.reward") },
    { count: 5,    name: t("trans.ms4.name"),   reward: t("trans.ms4.reward") },
    { count: 7,    name: t("trans.ms5.name"),     reward: t("trans.ms5.reward") },
    { count: 10,   name: t("trans.ms6.name"),   reward: t("trans.ms6.reward") },
    { count: 15,   name: t("trans.ms7.name"),   reward: t("trans.ms7.reward") },
    { count: 20,   name: t("trans.ms8.name"),     reward: t("trans.ms8.reward") },
    { count: 100,  name: t("trans.ms9.name"),   reward: t("trans.ms9.reward") },
    { count: 1000, name: t("trans.ms10.name"),   reward: t("trans.ms10.reward") }
];

// 计算已解锁里程碑带来的 BP 倍率加成
function getMilestoneBPMult() {
    return 1 + state.milestones.length * 0.5;
}

// 里程碑是否解锁了超越升级（第1个里程碑）
function isTranscendUpgradeUnlocked() {
    return state.milestones.includes(0);
}

// 里程碑是否解锁了超越碎片（第5个里程碑 = index 4）
function isTranscendFragmentsUnlocked() {
    return state.milestones.includes(4);
}

// 检查并更新里程碑
function checkMilestones() {
    for (let i = 0; i < MILESTONES.length; i++) {
        if (!state.milestones.includes(i) && state.transcendCount >= MILESTONES[i].count) {
            state.milestones.push(i);
            console.log("🏆 里程碑解锁：" + MILESTONES[i].name);
        }
    }
}

// 更新里程碑 UI
function updateMilestoneUI() {
    const total = MILESTONES.length;
    const unlocked = state.milestones.length;
    const counterEl = document.getElementById("milestone_counter");
    if (counterEl) counterEl.textContent = toDisplayNum(unlocked) + "/" + toDisplayNum(total);

    MILESTONES.forEach((ms, i) => {
        const card = document.getElementById("ms_" + i);
        if (!card) return;
        const done = state.milestones.includes(i);
        card.classList.toggle("unlocked", done);
        const statusEl = card.querySelector(".ach-status");
        if (statusEl) statusEl.textContent = done ? t("trans.ms.unlocked") : t("trans.ms.locked") + toDisplayNum(ms.count) + t("trans.ms.lockedSuffix");
    });
}

function buyFragment(id) {
    const frag = FRAGMENTS[id];
    if (!frag) return;
    if (state["frag" + id]) return;
    const cost = change(frag.cost);
    if (!gte(state.bp, cost)) {
        showToast(t("toast.bpShortNeed") + toDisplayNum(frag.cost) + t("toast.bpShortNeedSuffix"), "error");
        return;
    }
    state.bp = minus(state.bp, cost);
    state["frag" + id] = true;
    resetChallenge5T();

    if (id === 2) {
        document.getElementById("tabbtn_automation").style.display = "";
    }

    render();
    updateTranscendUI();
    console.log("💠 碎片" + id + " 已购买：" + frag.name);
}

// ---------- 自动化系统 ----------
const AUTO_BASE_PRICE = { v: 1, a: 10, j: 25 };

function getAutoInterval(type) {
    const level = state["auto" + type.toUpperCase()].level;
    return Math.max(100, 1000 * Math.pow(0.8, level));
}

function getAutoPrice(type) {
    const level = state["auto" + type.toUpperCase()].level;
    const base = AUTO_BASE_PRICE[type];
    return muil(change(base), power(change(2), change(level)));
}

function buyAutoLevel(type) {
    const price = getAutoPrice(type);
    if (!gte(state.bp, price)) {
        showToast(t("toast.bpShort"), "error");
        return;
    }
    state.bp = minus(state.bp, price);
    state["auto" + type.toUpperCase()].level++;
    updateAutomationUI();
    console.log("🤖 自动" + type + " 加速到 " + getAutoInterval(type) + "ms");
}

function toggleAuto(type) {
    const cb = document.getElementById("auto_" + type + "_enabled");
    if (type === "transcend") {
        state.autoTranscend.enabled = cb ? cb.checked : false;
    } else if (type === "frag") {
        state.autoFrag.enabled = cb ? cb.checked : false;
    } else if (type === "distUpgrade") {
        state.autoDistUpgrade.enabled = cb ? cb.checked : false;
    } else if (type === "transcendUpgrade") {
        state.autoTranscendUpgrade.enabled = cb ? cb.checked : false;
    } else if (type === "quantum") {
        state.autoQuantum.enabled = cb ? cb.checked : false;
    } else {
        state["auto" + type.toUpperCase()].enabled = cb ? cb.checked : false;
    }
    if (currentSlot !== null) saveGameSilent(currentSlot);
}

// ---------- 自动化购买模式 ----------
function setAutoBuyMode(mode) {
    state.autoBuyMode = mode;
    if (currentSlot !== null) saveGameSilent(currentSlot);
}

// ---------- 自动量子条件更新 ----------
function updateAutoQuantum() {
    const condCb = document.getElementById("auto_q_cond_bpamount");
    const amountInput = document.getElementById("auto_q_bpamount_val");
    if (condCb) state.autoQuantum.condBPAmount = condCb.checked;
    if (amountInput) state.autoQuantum.bpAmount = amountInput.value || "10000";
    if (currentSlot !== null) saveGameSilent(currentSlot);
}

function updateAutoTranscend() {
    state.autoTranscend.condInterval = document.getElementById("auto_tc_cond_interval").checked;
    state.autoTranscend.intervalSec = parseInt(document.getElementById("auto_tc_interval_val").value) || 60;
    state.autoTranscend.condBPAmount = document.getElementById("auto_tc_cond_bpamount").checked;
    state.autoTranscend.bpAmount = document.getElementById("auto_tc_bpamount_val").value || "1";
    state.autoTranscend.condBPMult = document.getElementById("auto_tc_cond_bpmult").checked;
    state.autoTranscend.bpMult = parseFloat(document.getElementById("auto_tc_bpmult_val").value) || 2;
}

// ---------- 自动超越检查 ----------
let lastAutoTranscendTime = Date.now();

function checkAutoTranscend() {
    if (!state.autoTranscend.enabled) return;
    if (!state.frag4) return; // 需要碎片4
    if (!transcendUnlocked) return;
    if (!gte(state.v, LIGHT_SPEED)) return;

    const tc = state.autoTranscend;
    const gainedBP = calcGainBP();
    const gainedBPVal = gainedBP.exp + Math.log10(gainedBP.man);
    const currentBPVal = state.bp.man > 0 ? state.bp.exp + Math.log10(state.bp.man) : 0;

    let triggered = false;

    if (tc.condInterval) {
        const elapsed = (Date.now() - lastAutoTranscendTime) / 1000;
        if (elapsed >= tc.intervalSec) triggered = true;
    }
    if (tc.condBPAmount && !triggered) {
        const target = parseFloat(tc.bpAmount);
        if (gainedBPVal >= Math.log10(target)) triggered = true;
    }
    if (tc.condBPMult && !triggered) {
        if (gainedBPVal >= currentBPVal + Math.log10(tc.bpMult)) triggered = true;
    }

    if (triggered) {
        lastAutoTranscendTime = Date.now();
        transcend();
    }
}

// ---------- 自动购买检查 ----------
let lastAutoBuy = { v: 0, a: 0, j: 0 };

function checkAutoBuy() {
    const now = Date.now();
    // 元素10 (氖): 前3个自动购买器可选择购买最大值
    const canBuyMax = state.elementsOwned.includes(10) && state.autoBuyMode === 0;
    ["v", "a", "j"].forEach(type => {
        const auto = state["auto" + type.toUpperCase()];
        if (!auto.enabled) return;
        const interval = getAutoInterval(type);
        if (now - lastAutoBuy[type] >= interval) {
            lastAutoBuy[type] = now;
            const level = type === "v" ? state.vLevel : type === "a" ? state.aLevel : state.jLevel;
            const cost = getUpgradeCost(level, type);
            if (gte(state.s, cost)) {
                if (canBuyMax) {
                    buyMax(type);
                } else {
                    buyAmount(type, 1);
                }
            }
        }
    });
}

// ==================================================
//          离线 tick-by-tick 模拟引擎
// ==================================================
let offlineSim = null;
let simAutoBuyTimers = { v: 0, a: 0, j: 0 };
let simAutoTranscendTimer = 0;
let offlineSimCompleteMsg = t("offline.complete");

function startOfflineSimulation(offlineSec, completeMsg, maxTicksOverride) {
    offlineSimCompleteMsg = completeMsg || t("offline.complete");
    const BASE_TICK = 0.033; // 33ms = 0.033s
    const MAX_TICKS = maxTicksOverride || 100000;

    let totalTicks = Math.ceil(offlineSec / BASE_TICK);
    let tickDt = BASE_TICK;

    if (totalTicks > MAX_TICKS) {
        tickDt = offlineSec / MAX_TICKS;
        totalTicks = MAX_TICKS;
    }

    // 初始化自动化计时器（从上次存档到现在的时间）
    const now = Date.now();
    simAutoBuyTimers = {
        v: (now - lastAutoBuy.v) / 1000,
        a: (now - lastAutoBuy.a) / 1000,
        j: (now - lastAutoBuy.j) / 1000
    };
    simAutoTranscendTimer = (now - lastAutoTranscendTime) / 1000;

    offlineSim = {
        running: true,
        totalTicks: totalTicks,
        currentTick: 0,
        tickDt: tickDt,
        skipMode: false,
        speedMult: 1, // 1=正常, 每次加速*2
        batchSize: 1,
        baseTick: BASE_TICK
    };

    document.getElementById("offline_overlay").classList.add("active");
    updateOfflineUI();
    requestAnimationFrame(offlineSimStep);
}

function offlineSimStep() {
    if (!offlineSim || !offlineSim.running) return;

    const s = offlineSim;
    let batch = s.batchSize;
    let dt = s.tickDt * s.speedMult;

    // 每帧最多执行 5000 个 tick，防卡顿
    let ticksThisFrame = 0;
    const MAX_PER_FRAME = 5000;

    while (ticksThisFrame < MAX_PER_FRAME && s.currentTick < s.totalTicks) {
        for (let b = 0; b < batch && s.currentTick < s.totalTicks; b++) {
            // ---- 物理模拟 ----
            const dtObj = { man: dt, exp: 0 };
            // U2-2: 急动度生产速度（科学计数法）
            const u22Rate = getU2_2ProductionRate();
            if (u22Rate.man > 0) {
                const vProd = muil(state.v, u22Rate);
                state.a = plus(state.a, muil(vProd, dtObj));
            }

            // Snap冲击波: 生产急动度（数量 = √量子超越次数）
            const snapCountSim = getSnapCount();
            if (snapCountSim > 0) {
                state.j = plus(state.j, muil(change(snapCountSim), dtObj));
            }

            // 急动度倍率
            let jMult = plus({ man: 1, exp: 0 }, effectiveLevel(state.jLevel));
            state.a = plus(state.a, muil(state.j, muil(jMult, dtObj)));

            // 加速度倍率
            let aMult = plus({ man: 1, exp: 0 }, effectiveLevel(state.aLevel));
            let aWithMult = muil(state.a, aMult);

            // 速度倍率 + 相对论修正（getTotalSpeedMultiplier 已含 1+level 基础值）
            let speedMult = getTotalSpeedMultiplier();
            // 升级6推迟相对论开始速度
            const u6DelaySim = getUpgrade6RelativityDelay();
            let effectiveCSim = muil(C, change(u6DelaySim));
            let vc2 = muil(dev(state.v, effectiveCSim), dev(state.v, effectiveCSim));
            let relDenom = power(plus({ man: 1, exp: 0 }, vc2), { man: 15, exp: -1 });
            let aEff = muil(dev(aWithMult, relDenom), speedMult);

            state.v = plus(state.v, muil(aEff, dtObj));
            state.s = plus(state.s, muil(state.v, dtObj));
            // 更新历史最大距离
            if (gte(state.s, state.maxDist)) {
                state.maxDist = { ...state.s };
            }

            // ---- 自动化（每个 tick 检查）----
            tickCheckAutoBuy(dt);
            tickCheckAutoTranscend();

            s.currentTick++;
        }
        ticksThisFrame += batch;
    }

    updateOfflineUI();

    if (s.currentTick >= s.totalTicks) {
        finishOfflineSimulation();
        return;
    }

    // 继续下一帧
    requestAnimationFrame(offlineSimStep);
}

function tickCheckAutoBuy(dt) {
    // 元素10 (氖): 前3个自动购买器可选择购买最大值
    const canBuyMax = state.elementsOwned.includes(10) && state.autoBuyMode === 0;
    ["v", "a", "j"].forEach(type => {
        const auto = state["auto" + type.toUpperCase()];
        if (!auto.enabled) return;
        simAutoBuyTimers[type] += dt;
        const interval = getAutoInterval(type) / 1000;
        while (simAutoBuyTimers[type] >= interval) {
            simAutoBuyTimers[type] -= interval;
            const level = type === "v" ? state.vLevel : type === "a" ? state.aLevel : state.jLevel;
            const cost = getUpgradeCost(level, type);
            if (!gte(state.s, cost)) break;
            if (canBuyMax) {
                buyMax(type);
            } else {
                buyAmount(type, 1);
            }
        }
    });
}

function tickCheckAutoTranscend() {
    if (!state.autoTranscend.enabled) return;
    if (!state.frag4) return;
    if (!transcendUnlocked) return;
    if (!gte(state.v, LIGHT_SPEED)) return;

    const tc = state.autoTranscend;
    const gainedBP = calcGainBP();
    const gainedBPVal = gainedBP.exp + Math.log10(gainedBP.man);
    const currentBPVal = state.bp.man > 0 ? state.bp.exp + Math.log10(state.bp.man) : 0;

    let triggered = false;
    if (tc.condInterval) {
        if (simAutoTranscendTimer >= tc.intervalSec) triggered = true;
    }
    if (tc.condBPAmount && !triggered) {
        const target = parseFloat(tc.bpAmount);
        if (gainedBPVal >= Math.log10(target)) triggered = true;
    }
    if (tc.condBPMult && !triggered) {
        if (gainedBPVal >= currentBPVal + Math.log10(tc.bpMult)) triggered = true;
    }

    if (triggered) {
        simAutoTranscendTimer = 0;
        transcend();
    }
}

function updateOfflineUI() {
    if (!offlineSim) return;
    const s = offlineSim;
    const pct = (s.currentTick / s.totalTicks) * 100;
    document.getElementById("offline_progress_bar").style.width = pct + "%";
    document.getElementById("offline_progress_text").textContent =
        toDisplayNum(s.currentTick) + " / " + toDisplayNum(s.totalTicks) + " tick  (" + toDisplayNum(pct) + "%)";
    let ms = s.tickDt * s.speedMult * 1000;
    let mode = s.skipMode ? t("offline.skipModePrefix") + toDisplayNum(s.batchSize) + t("offline.tickPerStepSuffix") : "";
    document.getElementById("offline_speed").textContent =
        t("offline.precision") + toDisplayNum(ms) + "ms/tick" + mode;
}

function offlineSimSpeedUp() {
    if (!offlineSim) return;
    offlineSim.speedMult *= 2;
    offlineSim.batchSize *= 2;
    // 保持总模拟时间不变：剩余 tick 数减半
    const remaining = offlineSim.totalTicks - offlineSim.currentTick;
    const newRemaining = Math.ceil(remaining / 2);
    offlineSim.totalTicks = offlineSim.currentTick + newRemaining;
    updateOfflineUI();
}

function offlineSimSkip() {
    if (!offlineSim) return;
    // 跳过模式：大幅增加每步处理量，快速完成剩余 tick
    offlineSim.skipMode = true;
    offlineSim.batchSize = Math.max(offlineSim.batchSize, 100);
    updateOfflineUI();
}

function finishOfflineSimulation() {
    if (!offlineSim) return;
    const now = Date.now();
    // 把计时器剩余时间转回时间戳
    lastAutoBuy.v = now - simAutoBuyTimers.v * 1000;
    lastAutoBuy.a = now - simAutoBuyTimers.a * 1000;
    lastAutoBuy.j = now - simAutoBuyTimers.j * 1000;
    lastAutoTranscendTime = now - simAutoTranscendTimer * 1000;

    offlineSim.running = false;
    offlineSim = null;
    document.getElementById("offline_overlay").classList.remove("active");
    render();
    updateAchievementUI();
    // 离线模拟完成后立即保存，防止进度丢失
    if (currentSlot !== null) saveGameSilent(currentSlot);
    showToast(offlineSimCompleteMsg, "success");
    console.log(t("offline.completeSaved"));
}

// ---------- 离线流量系统辅助函数 ----------
const SPEED_OPTIONS = [
    { mult: 1,   cost: 0  },
    { mult: 2,   cost: 1  },
    { mult: 3,   cost: 2  },
    { mult: 5,   cost: 4  },
    { mult: 10,  cost: 9  },
    { mult: 30,  cost: 29 },
    { mult: 60,  cost: 59 },
    { mult: 180, cost: 179 },
    { mult: 600, cost: 599 },
];

function getConversionRate() {
    // 转换率 = 60% + 10% * level
    return 0.6 + 0.1 * state.offlineFlow.conversionRateLevel;
}

function getConversionRateCost() {
    // 初始价格 10:00 = 600秒，每次 *2
    return 600 * Math.pow(2, state.offlineFlow.conversionRateLevel);
}

function getStorageLimit() {
    // 初始 36000秒(10:00:00)，每次购买 *2
    return 36000 * Math.pow(2, state.offlineFlow.storageLimitLevel);
}

function getStorageLimitCost() {
    // 初始价格 05:00:00 = 18000秒，每次 *2
    return 18000 * Math.pow(2, state.offlineFlow.storageLimitLevel);
}

function getCurrentSpeedMultiplier() {
    return state.offlineFlow.speedMultiplier || 1;
}

function getSpeedConsumption(mult) {
    const opt = SPEED_OPTIONS.find(o => o.mult === mult);
    return opt ? opt.cost : 0;
}

// 设置速度倍率
function setSpeedMultiplier(mult) {
    if (mult === 1) {
        state.offlineFlow.speedMultiplier = 1;
        updateFlowUI();
        return;
    }
    // 流量为0时除1x外锁定
    if (state.offlineFlow.stored <= 0) {
        showToast(t("toast.flowShort"), "warn");
        return;
    }
    state.offlineFlow.speedMultiplier = mult;
    updateFlowUI();
    if (currentSlot !== null) saveGameSilent(currentSlot);
}

// 购买转换率
function buyConversionRate() {
    const cost = getConversionRateCost();
    if (state.offlineFlow.stored < cost) {
        showToast(t("toast.flowShortNeed") + formatFlowTime(cost), "error");
        return;
    }
    state.offlineFlow.stored -= cost;
    state.offlineFlow.conversionRateLevel++;
    showToast(t("toast.convUpgraded") + (getConversionRate() * 100).toFixed(0) + t("toast.convUpgradedSuffix"), "success");
    updateFlowUI();
    if (currentSlot !== null) saveGameSilent(currentSlot);
}

// 购买存储上限
function buyStorageLimit() {
    const cost = getStorageLimitCost();
    if (state.offlineFlow.stored < cost) {
        showToast(t("toast.flowShortNeed") + formatFlowTime(cost), "error");
        return;
    }
    state.offlineFlow.stored -= cost;
    state.offlineFlow.storageLimitLevel++;
    state.offlineFlow.storageLimit = getStorageLimit();
    showToast(t("toast.storageUpgraded") + formatFlowTime(state.offlineFlow.storageLimit), "success");
    updateFlowUI();
    if (currentSlot !== null) saveGameSilent(currentSlot);
}

// ---------- 主循环 ----------
function update() {
    const now = Date.now();
    let dt = (now - lastTime) / 1000;
    if (dt <= 0 || dt > 1) {
        lastTime = now;
        return;
    }

    // 累计游戏总时间
    state.totalPlayTime += dt;

    // 速度倍率消耗流量
    const flowMult = getCurrentSpeedMultiplier();
    if (flowMult > 1) {
        const consumption = getSpeedConsumption(flowMult) * dt;
        state.offlineFlow.stored -= consumption;
        if (state.offlineFlow.stored <= 0) {
            state.offlineFlow.stored = 0;
            state.offlineFlow.speedMultiplier = 1; // 流量用尽自动切换1x
            updateFlowUI();
        }
    }

    // 转换率超过100%时，即使在线也获得溢出流量
    const convRate = getConversionRate();
    if (convRate > 1) {
        const overflow = (convRate - 1) * dt;
        state.offlineFlow.stored = Math.min(state.offlineFlow.stored + overflow, state.offlineFlow.storageLimit);
    }

    // 应用速度倍率
    const effDt = dt * flowMult;
    const dtObj = { man: effDt, exp: 0 };

    // 挑战1: 获取幂次 (^0.95 挑战中, ^1.04 奖励)
    const vPower = getVPower();
    const aPower = getAPower();
    const jPower = getJPower();

    // U2-2: 急动度生产速度（科学计数法）— 挑战4禁用
    if (!isU2_2Disabled()) {
        const u22Rate = getU2_2ProductionRate();
        if (u22Rate.man > 0) {
            const vProd = muil(applyPower(state.v, vPower), u22Rate);
            state.a = plus(state.a, muil(vProd, dtObj));
        }
    }

    // Snap冲击波: 生产急动度（数量 = √量子超越次数）
    const snapCount = getSnapCount();
    if (snapCount > 0) {
        state.j = plus(state.j, muil(change(snapCount), dtObj));
    }

    // 急动度倍率 = 1 + effectiveLevel(jLevel)
    let jMult = plus({ man: 1, exp: 0 }, effectiveLevel(state.jLevel));
    // 挑战4: 禁用急动度生产加速度; 挑战4奖励: *2
    if (!isJerkToAccelDisabled()) {
        const jerkToAccelMult = getJerkToAccelRewardMult();
        state.a = plus(state.a, muil(applyPower(state.j, jPower), muil(jMult, muil(change(jerkToAccelMult), dtObj))));
    }

    // 加速度倍率 = 1 + effectiveLevel(aLevel)
    let aMult = plus({ man: 1, exp: 0 }, effectiveLevel(state.aLevel));
    // 核反应堆: 复制能量为加速度效果提供加成（默认√能量，元素9改为能量^(2/3)）
    aMult = muil(aMult, change(getReplicationEnergyBonus()));
    let aWithMult = muil(applyPower(state.a, aPower), aMult);

    // 速度倍率（getTotalSpeedMultiplier 已含 1+level 基础值，无需额外 +1）
    let speedMult = getTotalSpeedMultiplier();

    // 相对论修正后的加速度 × 速度倍率（升级6推迟相对论开始速度）
    const u6Delay = getUpgrade6RelativityDelay();
    let effectiveC = muil(C, change(u6Delay));
    const effV = applyPower(state.v, vPower);
    let vc2 = muil(dev(effV, effectiveC), dev(effV, effectiveC));
    let relDenom = power(plus({ man: 1, exp: 0 }, vc2), { man: 15, exp: -1 });
    let aEff = muil(dev(aWithMult, relDenom), speedMult);

    // 挑战5: 收益乘数
    const c5Mult = getChallenge5IncomeMult();

    let ds = muil(effV, dtObj);
    if (c5Mult !== 1) {
        ds = muil(ds, change(c5Mult));
        state.v = plus(state.v, muil(muil(aEff, dtObj), change(c5Mult)));
    } else {
        state.v = plus(state.v, muil(aEff, dtObj));
    }
    state.s = plus(state.s, ds);

    // 核反应堆生产
    updateReactorProduction(effDt);

    // 挑战5: t值增加 (受游戏倍速影响)
    if (state.challenges.activeChallenge === 4) {
        state.challenges.c5_t += effDt;
    }
    // 挑战6: 累积器增加 (受游戏倍速影响)
    if (state.challenges.activeChallenge === 5) {
        state.challenges.c6_accumulator += effDt;
    }

    // 累计总共生产的距离（只增不减）
    state.totalDistanceProduced = plus(state.totalDistanceProduced, ds);

    // 更新历史最大距离
    if (gte(state.s, state.maxDist)) {
        state.maxDist = { ...state.s };
    }

    if (!transcendUnlocked && gte(state.v, LIGHT_SPEED)) transcendUnlocked = true;

    // 自动化
    checkAutoBuy();
    checkAutoTranscend();
    checkAutoFrag();
    checkAutoDistUpgrade();
    checkAutoTranscendUpgrade();
    checkAutoQuantum();

    // 成就检查
    checkAchievements();

    render();
    updateReactorUI();
    updateChallengeUI();
    lastTime = now;
}

// ---------- 自定义计数法：替换数字字符 ----------
function applyCustomNotation(str) {
    const cs = gameSettings.customNotation;
    if (!cs || cs.length < 10) return str;
    // 取前10个不重复字符映射 0-9
    const map = {};
    const seen = new Set();
    let idx = 0;
    for (const ch of cs) {
        if (seen.has(ch)) continue;
        seen.add(ch);
        map[idx.toString()] = ch;
        idx++;
        if (idx >= 10) break;
    }
    if (idx < 10) return str; // 不够10个不重复字符
    return str.replace(/[0-9]/g, d => map[d] || d);
}

// ---------- 显示 ----------
function toDisplay(x) {
    if (x.man === 0) return applyCustomNotation("0." + "0".repeat(gameSettings.sciPrecision) + "e0");
    let e = x.exp;
    let m = x.man;
    while (m >= 10) { m /= 10; e++; }
    while (m < 1) { m *= 10; e--; }
    const prec = Math.max(0, Math.min(20, gameSettings.sciPrecision || 3));
    let result = m.toFixed(prec) + "e" + e;
    return applyCustomNotation(result);
}

// 将普通JS数字转为 aeb 格式显示
function toDisplayNum(n) {
    if (n === 0) return applyCustomNotation("0." + "0".repeat(gameSettings.sciPrecision) + "e0");
    if (!Number.isFinite(n)) return "∞";
    return toDisplay(change(n));
}

// ---------- 流量时间格式化 (秒 → HH:MM:SS) ----------
function formatFlowTime(seconds) {
    if (seconds === Infinity) return "∞";
    if (!Number.isFinite(seconds) || seconds < 0) seconds = 0;
    seconds = Math.floor(seconds);
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    const pad = n => n.toString().padStart(2, "0");
    return pad(h) + ":" + pad(m) + ":" + pad(s);
}

// ---------- 格式化时长（秒 → 可读文本） ----------
function formatDuration(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) seconds = 0;
    seconds = Math.floor(seconds);
    if (seconds < 60) return seconds + t("time.seconds");
    if (seconds < 3600) {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return m + t("time.minSec") + s + t("time.seconds");
    }
    if (seconds < 86400) {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        return h + t("time.hourMin") + m + t("time.minSec");
    }
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    return d + t("time.dayHour") + h + t("time.hourMin");
}

// ---------- 距离增加速率 ----------
function formatDistanceRate() {
    const ratio = dev(state.v, state.s);
    if (!ratio || ratio.man === 0) return "+0/s";
    const isLow = gte({ man: 1.01, exp: 0 }, ratio);
    const isHigh = !gte({ man: 1, exp: 11 }, ratio);
    if (isLow) {
        return "+" + toDisplay(state.v) + "/s";
    } else if (isHigh) {
        const ooms = ratio.exp + Math.log10(ratio.man);
        return "+" + toDisplayNum(ooms) + " OoMs/s";
    } else {
        // 用 log 避免普通数值溢出 (exp≥308 → Infinity)
        const ratioLog = ratio.exp + Math.log10(ratio.man);
        if (ratioLog > 300) {
            return "×" + toDisplay(ratio);
        }
        if (ratioLog < -300) {
            return "×0.000e0";
        }
        const ratioNum = Math.pow(10, ratioLog);
        if (ratioNum < 1000) {
            return "×" + toDisplayNum(ratioNum);
        } else {
            return "×" + toDisplay(ratio);
        }
    }
}

function render() {
    document.getElementById("s_display").textContent = toDisplay(state.s);
    document.getElementById("s_rate_display").textContent = formatDistanceRate();
    document.getElementById("v_display").textContent = toDisplay(state.v);
    document.getElementById("a_display").textContent = toDisplay(state.a);
    const relEl = document.getElementById("a_rel_effect");
    if (relEl) relEl.textContent = formatRelativisticReduction();
    document.getElementById("j_display").textContent = toDisplay(state.j);

    document.getElementById("v_level").textContent = toDisplayNum(state.vLevel);
    document.getElementById("a_level").textContent = toDisplayNum(state.aLevel);
    document.getElementById("j_level").textContent = toDisplayNum(state.jLevel);

    document.getElementById("v_display2").textContent = toDisplay(getTotalSpeedMultiplier());
    document.getElementById("a_display2").textContent = toDisplay(plus({ man: 1, exp: 0 }, effectiveLevel(state.aLevel)));
    document.getElementById("j_display2").textContent = toDisplay(plus({ man: 1, exp: 0 }, effectiveLevel(state.jLevel)));

    refreshUpgradeButtons();
    updateButtonState();
    updateMaxButtons();
    updateSaveSlots();
    updateCountdowns();
    updateTranscendUI();
    updateAutomationUI();
    updateDistUpgradeUI();
    updateQuantumUI();
    updateStatsUI();
    updateFlowUI();

    if (sceneEnabled) {
        renderTrack();
    }
    updateFloatBar();
    updateBPBar();
    updateAchievementUI();
}

// ---------- 统计页面 UI 更新 ----------
function updateStatsUI() {
    // 总共生产的距离
    const totalDistEl = document.getElementById("stat_total_distance");
    if (totalDistEl) totalDistEl.textContent = toDisplay(state.totalDistanceProduced);

    // 游戏总用时
    const totalTimeEl = document.getElementById("stat_total_time");
    if (totalTimeEl) totalTimeEl.textContent = formatDuration(state.totalPlayTime);

    // 超越统计（解锁超越后显示）
    const tcSection = document.getElementById("stat_transcend_section");
    if (tcSection) {
        tcSection.style.display = transcendUnlocked ? "block" : "none";
    }
    if (transcendUnlocked) {
        const curTcTime = state.transcendStartTime > 0 ? (Date.now() - state.transcendStartTime) / 1000 : 0;
        const curEl = document.getElementById("stat_transcend_current");
        if (curEl) curEl.textContent = formatDuration(curTcTime);
        const minEl = document.getElementById("stat_transcend_min");
        if (minEl) minEl.textContent = state.minTranscendTime === Infinity ? "—" : formatDuration(state.minTranscendTime);
        const countEl = document.getElementById("stat_transcend_count");
        if (countEl) countEl.textContent = toDisplayNum(state.transcendCount);
    }

    // 量子统计（解锁量子后显示）
    const qmSection = document.getElementById("stat_quantum_section");
    if (qmSection) {
        qmSection.style.display = state.quantumUnlocked ? "block" : "none";
    }
    if (state.quantumUnlocked) {
        const curQTime = state.quantumStartTime > 0 ? (Date.now() - state.quantumStartTime) / 1000 : 0;
        const curEl = document.getElementById("stat_quantum_current");
        if (curEl) curEl.textContent = formatDuration(curQTime);
        const minEl = document.getElementById("stat_quantum_min");
        if (minEl) minEl.textContent = state.minQuantumTime === Infinity ? "—" : formatDuration(state.minQuantumTime);
        const countEl = document.getElementById("stat_quantum_count");
        if (countEl) countEl.textContent = toDisplayNum(state.quantumCount);
    }
}

// ---------- 离线流量页面 UI 更新 ----------
function updateFlowUI() {
    // 存储流量显示
    const storedEl = document.getElementById("flow_stored");
    if (storedEl) storedEl.textContent = formatFlowTime(state.offlineFlow.stored || 0);
    const limitEl = document.getElementById("flow_limit");
    if (limitEl) limitEl.textContent = formatFlowTime(state.offlineFlow.storageLimit || 36000);
    const pctEl = document.getElementById("flow_pct");
    if (pctEl) {
        const pct = state.offlineFlow.storageLimit > 0 ? ((state.offlineFlow.stored || 0) / state.offlineFlow.storageLimit * 100) : 0;
        pctEl.textContent = pct.toFixed(1) + "%";
    }
    // 进度条
    const barEl = document.getElementById("flow_bar");
    if (barEl) {
        const pct = state.offlineFlow.storageLimit > 0 ? ((state.offlineFlow.stored || 0) / state.offlineFlow.storageLimit * 100) : 0;
        barEl.style.width = Math.min(100, pct) + "%";
    }

    // 转换率
    const convRateEl = document.getElementById("flow_conv_rate");
    if (convRateEl) convRateEl.textContent = (getConversionRate() * 100).toFixed(0) + "%";
    const convCostEl = document.getElementById("flow_conv_cost");
    if (convCostEl) convCostEl.textContent = formatFlowTime(getConversionRateCost());
    const convBtn = document.getElementById("flow_conv_btn");
    if (convBtn) convBtn.disabled = (state.offlineFlow.stored || 0) < getConversionRateCost();

    // 存储上限
    const limitCostEl = document.getElementById("flow_limit_cost");
    if (limitCostEl) limitCostEl.textContent = formatFlowTime(getStorageLimitCost());
    const limitBtn = document.getElementById("flow_limit_btn");
    if (limitBtn) limitBtn.disabled = (state.offlineFlow.stored || 0) < getStorageLimitCost();

    // 速度倍率按钮
    const currentMult = getCurrentSpeedMultiplier();
    SPEED_OPTIONS.forEach(opt => {
        const btn = document.getElementById("flow_speed_" + opt.mult);
        if (!btn) return;
        btn.classList.toggle("active", currentMult === opt.mult);
        // 流量为0时除1x外锁定
        if (opt.mult > 1 && (state.offlineFlow.stored || 0) <= 0) {
            btn.disabled = true;
            btn.classList.add("locked");
        } else {
            btn.disabled = false;
            btn.classList.remove("locked");
        }
    });

    // 当前倍率显示
    const curMultEl = document.getElementById("flow_current_mult");
    if (curMultEl) curMultEl.textContent = currentMult + "x";

    // 离线进度开关状态
    const offlineStatusEl = document.getElementById("flow_offline_status");
    if (offlineStatusEl) {
        offlineStatusEl.textContent = gameSettings.offlineProgress ? t("flow.offlineEnabled") : t("flow.offlineDisabled");
        offlineStatusEl.style.color = gameSettings.offlineProgress ? "#00ff88" : "#ffaa00";
    }
}

// ---------- 应用设置到 UI ----------
function applySettingsToUI() {
    // 语言选择器
    const langSelect = document.getElementById("language_selector");
    if (langSelect) langSelect.value = getLanguage();

    // 科学计数法精度
    const precSlider = document.getElementById("setting_sci_precision");
    const precLabel = document.getElementById("setting_sci_precision_label");
    if (precSlider) precSlider.value = gameSettings.sciPrecision;
    if (precLabel) precLabel.textContent = gameSettings.sciPrecision + " " + t("set.sciPrecisionUnit");

    // 自定义计数法
    const customInput = document.getElementById("setting_custom_notation");
    if (customInput) customInput.value = gameSettings.customNotation;
    const customStatus = document.getElementById("setting_custom_status");
    if (customStatus) {
        customStatus.textContent = gameSettings.customNotation && gameSettings.customNotation.length >= 10 ? t("set.customNotationOn") : t("set.customNotationOff");
        customStatus.style.color = gameSettings.customNotation && gameSettings.customNotation.length >= 10 ? "#00ff88" : "#666";
    }

    // 离线Ticks上限
    const ticksSlider = document.getElementById("setting_offline_ticks");
    const ticksLabel = document.getElementById("setting_offline_ticks_label");
    if (ticksSlider) ticksSlider.value = gameSettings.offlineTicksLimit;
    if (ticksLabel) ticksLabel.textContent = toDisplayNum(gameSettings.offlineTicksLimit);

    // 离线进度开关
    const offlineCb = document.getElementById("setting_offline_progress");
    if (offlineCb) offlineCb.checked = gameSettings.offlineProgress;
    const offlineStatus = document.getElementById("setting_offline_progress_status");
    if (offlineStatus) {
        offlineStatus.textContent = gameSettings.offlineProgress ? t("set.on") : t("set.off");
        offlineStatus.style.color = gameSettings.offlineProgress ? "#00aa66" : "#ff6666";
    }

    // 自动保存间隔
    const autoSaveSlider = document.getElementById("setting_autosave_interval");
    const autoSaveLabel = document.getElementById("setting_autosave_interval_label");
    if (autoSaveSlider) autoSaveSlider.value = autosaveIndexFromSeconds(gameSettings.autoSaveInterval);
    if (autoSaveLabel) {
        autoSaveLabel.textContent = autosaveLabelFromSeconds(gameSettings.autoSaveInterval);
    }

    // 悬浮状态栏
    const fbCb = document.getElementById("setting_float_bar");
    if (fbCb) fbCb.checked = gameSettings.floatBar;
    const fbStatus = document.getElementById("float_bar_status");
    if (fbStatus) {
        fbStatus.textContent = gameSettings.floatBar ? t("set.on") : t("set.off");
        fbStatus.style.color = gameSettings.floatBar ? "#00aa66" : "#ff6666";
    }

    // 场景动画
    const sceneCb = document.getElementById("setting_scene");
    if (sceneCb) sceneCb.checked = gameSettings.scene;
    const sceneStatus = document.getElementById("scene_status");
    if (sceneStatus) {
        sceneStatus.textContent = gameSettings.scene ? t("set.on") : t("set.off");
        sceneStatus.style.color = gameSettings.scene ? "#00aa66" : "#ff6666";
    }
    sceneEnabled = gameSettings.scene;

    // 确认开关 - 超越重置
    const confirmTcCb = document.getElementById("setting_confirm_transcend");
    if (confirmTcCb) confirmTcCb.checked = gameSettings.confirmTranscend;
    const confirmTcStatus = document.getElementById("confirm_transcend_status");
    if (confirmTcStatus) {
        confirmTcStatus.textContent = gameSettings.confirmTranscend ? t("set.on") : t("set.off");
        confirmTcStatus.style.color = gameSettings.confirmTranscend ? "#00aa66" : "#ff6666";
    }

    // 确认开关 - 量子重置
    const confirmQmCb = document.getElementById("setting_confirm_quantum");
    if (confirmQmCb) confirmQmCb.checked = gameSettings.confirmQuantum;
    const confirmQmStatus = document.getElementById("confirm_quantum_status");
    if (confirmQmStatus) {
        confirmQmStatus.textContent = gameSettings.confirmQuantum ? t("set.on") : t("set.off");
        confirmQmStatus.style.color = gameSettings.confirmQuantum ? "#00aa66" : "#ff6666";
    }

    // 确认开关 - 重置游戏
    const confirmRstCb = document.getElementById("setting_confirm_reset");
    if (confirmRstCb) confirmRstCb.checked = gameSettings.confirmReset;
    const confirmRstStatus = document.getElementById("confirm_reset_status");
    if (confirmRstStatus) {
        confirmRstStatus.textContent = gameSettings.confirmReset ? t("set.on") : t("set.off");
        confirmRstStatus.style.color = gameSettings.confirmReset ? "#00aa66" : "#ff6666";
    }
}

// ---------- 刷新按钮价格 ----------
function refreshUpgradeButtons() {
    document.getElementById("v_upgrade_cost").textContent = toDisplay(getUpgradeCost(state.vLevel, "v"));
    document.getElementById("a_upgrade_cost").textContent = toDisplay(getUpgradeCost(state.aLevel, "a"));
    document.getElementById("j_upgrade_cost").textContent = toDisplay(getUpgradeCost(state.jLevel, "j"));
}

// ---------- 按钮禁用 ----------
function updateButtonState() {
    document.getElementById("v_upgrade").disabled = !gte(state.s, getUpgradeCost(state.vLevel, "v"));
    document.getElementById("a_upgrade").disabled = !gte(state.s, getUpgradeCost(state.aLevel, "a"));
    document.getElementById("j_upgrade").disabled = !gte(state.s, getUpgradeCost(state.jLevel, "j"));
}

// ---------- 倒计时 ----------
function formatCountdown(seconds) {
    if (seconds <= 0) return "";
    if (seconds < 60) return seconds.toFixed(1) + t("countdown.seconds");
    if (seconds < 3600) {
        let m = Math.floor(seconds / 60);
        let s = Math.floor(seconds % 60);
        return m + t("time.minSec") + s + t("countdown.seconds");
    }
    let h = Math.floor(seconds / 3600);
    let m = Math.floor((seconds % 3600) / 60);
    return h + t("time.hourMin") + m + t("time.minSec") + t("countdown.minSec");
}

function updateCountdowns() {
    const types = ["v", "a", "j"];
    for (const type of types) {
        let level = type === "v" ? state.vLevel : type === "a" ? state.aLevel : state.jLevel;
        let cost = getUpgradeCost(level, type);
        let el = document.getElementById(type + "_countdown");
        if (!el) continue;
        if (gte(state.s, cost)) {
            el.textContent = t("countdown.canBuy");
            el.style.color = "#00ff88";
        } else {
            let deficit = minus(cost, state.s);
            if (deficit.man <= 0) {
                el.textContent = t("countdown.canBuy");
                el.style.color = "#00ff88";
                continue;
            }
            let v = state.v;
            if (v.man <= 0) {
                el.textContent = t("countdown.noSpeed");
                el.style.color = "#ff6666";
                continue;
            }
            // 直接用 {man,exp} 计算秒数, 避免普通数值溢出
            let secObj = dev(deficit, v);
            if (secObj.man <= 0) {
                el.textContent = t("countdown.calculating");
                el.style.color = "#888";
            } else {
                let secLog = secObj.exp + Math.log10(secObj.man);
                if (secLog > 15) {
                    el.textContent = t("countdown.veryLong");
                    el.style.color = "#ff6666";
                } else if (secLog < -5) {
                    el.textContent = t("countdown.soon");
                    el.style.color = "#00ff88";
                } else {
                    let sec = Math.pow(10, secLog);
                    el.textContent = formatCountdown(sec);
                    el.style.color = "#ffaa00";
                }
            }
        }
    }
}

// ---------- 买最大按钮 ----------
function updateMaxButtons() {
    document.getElementById("v_max").style.display = state.vLevel > 10 ? "inline-block" : "none";
    document.getElementById("a_max").style.display = state.aLevel > 10 ? "inline-block" : "none";
    document.getElementById("j_max").style.display = state.jLevel > 10 ? "inline-block" : "none";
    if (state.vLevel > 10) {
        document.getElementById("v_max_count").textContent = toDisplayNum(getMaxBuyable(state.vLevel, "v"));
    }
    if (state.aLevel > 10) {
        document.getElementById("a_max_count").textContent = toDisplayNum(getMaxBuyable(state.aLevel, "a"));
    }
    if (state.jLevel > 10) {
        document.getElementById("j_max_count").textContent = toDisplayNum(getMaxBuyable(state.jLevel, "j"));
    }
}

// ---------- 超越页 UI ----------
function updateTranscendUI() {
    const unlockEl = document.getElementById("transcend_status");
    const btnEl = document.getElementById("transcend_btn");
    const bpEl = document.getElementById("transcend_bp");
    const gainEl = document.getElementById("transcend_gain");
    const discountEl = document.getElementById("transcend_discount");
    const tpEl = document.getElementById("transcend_tp");
    const tpCostEl = document.getElementById("transcend_tp_cost");
    const tpDescEl = document.getElementById("transcend_tp_desc");
    const tpBtnEl = document.getElementById("transcend_tp_btn");
    const countEl = document.getElementById("transcend_count");
    const lockEl = document.getElementById("transcend_lock");
    const contentEl = document.getElementById("transcend_content");

    if (!unlockEl) return;

    const unlocked = transcendUnlocked;

    if (unlocked) {
        if (lockEl) lockEl.style.display = "none";
        if (contentEl) contentEl.style.display = "block";

        const gainBP = calcGainBP();
        const discount = getBPDiscount();
        const tpCost = getTPCost();

        if (bpEl) bpEl.textContent = toDisplay(state.bp) + " BP";
        if (gainEl) gainEl.textContent = "+ " + toDisplay(gainBP) + t("trans.reset.gainBPSuffix");
        if (gainEl) gainEl.title = t("trans.reset.gainTooltip") + toDisplay(gainBP) + " BP";

        // 碎片6: 显示升级购买次数和BP倍率
        const frag6Info = document.getElementById("transcend_frag6_info");
        if (frag6Info) {
            if (state.frag6 && state.upgradeBuyCount > 0) {
                const logMult = state.upgradeBuyCount * Math.log10(1.001);
                frag6Info.style.display = "";
                frag6Info.textContent = t("trans.frag6.info") + toDisplayNum(state.upgradeBuyCount) + t("trans.frag6.infoMid") + toDisplayNum(Math.pow(10, logMult));
            } else {
                frag6Info.style.display = "none";
            }
        }
        if (discountEl) discountEl.textContent = discount < 1 ? ("×" + toDisplayNum(discount)) : t("status.noDiscount");
        if (discountEl) discountEl.style.color = discount < 1 ? "#ffaa00" : "#00aa66";
        if (btnEl) {
            const canTranscend = gte(state.v, LIGHT_SPEED);
            btnEl.disabled = !canTranscend;
            btnEl.textContent = canTranscend
                ? t("trans.reset.btnGain") + toDisplay(gainBP) + t("trans.upgrade4.btnBP") + ")"
                : t("trans.reset.btnFail") + toDisplay(state.v) + " / " + toDisplayNum(3e8) + ")";
        }

        // 重启超越按钮 (未达条件时显示)
        const restartBtn = document.getElementById("transcend_restart_btn");
        if (restartBtn) {
            const canTranscend = gte(state.v, LIGHT_SPEED);
            restartBtn.style.display = canTranscend ? "none" : "inline-block";
        }

        // 活跃挑战状态显示
        const chStatus = document.getElementById("transcend_challenge_status");
        if (chStatus) {
            if (state.challenges.activeChallenge >= 0) {
                chStatus.style.display = "";
                chStatus.textContent = CHALLENGES[state.challenges.activeChallenge].icon + " " +
                    t("ch.inChallenge") + CHALLENGES[state.challenges.activeChallenge].name +
                    " | " + t("ch.elapsed") + formatTime(getChallengeElapsedGameSec());
            } else {
                chStatus.style.display = "none";
            }
        }

        if (countEl) countEl.textContent = toDisplayNum(state.transcendCount + 1) + t("trans.reset.count");
        if (tpEl) tpEl.textContent = "Lv" + toDisplayNum(state.tpLevel);
        if (tpCostEl) tpCostEl.textContent = toDisplay(tpCost) + " BP";
        if (tpDescEl) tpDescEl.textContent = t("trans.upgrade4.eff") + toDisplay(muil(change(state.tpLevel), change(10))) + t("trans.upgrade4.effSuffix");
        if (tpBtnEl) {
            tpBtnEl.disabled = !gte(state.bp, tpCost);
            tpBtnEl.textContent = t("trans.upgrade4.btn") + toDisplay(tpCost) + t("trans.upgrade4.btnBP");
        }
        // 升级4 最大购买数量
        const tpMaxCountEl = document.getElementById("tp_max_count");
        if (tpMaxCountEl) {
            let tpMax = 0;
            let tpTempBP = { ...state.bp };
            let tpTempCost = getTPCost();
            let tpIter = 10000;
            while (gte(tpTempBP, tpTempCost) && tpIter-- > 0) {
                tpTempBP = minus(tpTempBP, tpTempCost);
                state.tpLevel++;
                tpMax++;
                tpTempCost = getTPCost();
            }
            state.tpLevel -= tpMax; // 还原
            tpMaxCountEl.textContent = toDisplayNum(tpMax);
        }

        // 升级5（元素5解锁）
        const upgrade5Section = document.getElementById("upgrade5_section");
        if (upgrade5Section) {
            upgrade5Section.style.display = state.elementsOwned.includes(5) ? "block" : "none";
        }
        if (state.elementsOwned.includes(5)) {
            const tp5El = document.getElementById("transcend_tp5");
            const tp5CostEl = document.getElementById("transcend_tp5_cost");
            const tp5DescEl = document.getElementById("transcend_tp5_desc");
            const tp5BtnEl = document.getElementById("transcend_tp5_btn");
            const u5Cost = getUpgrade5Cost();
            if (tp5El) tp5El.textContent = "Lv" + toDisplayNum(state.tp5Level);
            if (tp5CostEl) tp5CostEl.textContent = toDisplay(u5Cost) + " BP";
            if (tp5DescEl) tp5DescEl.textContent = t("trans.upgrade5.eff") + toDisplay(muil(change(0.4 * state.tp5Level), change(100))) + t("trans.upgrade5.effSuffix");
            if (tp5BtnEl) {
                tp5BtnEl.disabled = !gte(state.bp, u5Cost);
                tp5BtnEl.textContent = t("trans.upgrade5.btn") + toDisplay(u5Cost) + t("trans.upgrade5.btnBP");
            }
            // 升级5 最大购买数量
            const tp5MaxCountEl = document.getElementById("tp5_max_count");
            if (tp5MaxCountEl) {
                let tp5Max = 0;
                let tp5TempBP = { ...state.bp };
                let tp5TempCost = getUpgrade5Cost();
                let tp5Iter = 10000;
                while (gte(tp5TempBP, tp5TempCost) && tp5Iter-- > 0) {
                    tp5TempBP = minus(tp5TempBP, tp5TempCost);
                    state.tp5Level++;
                    tp5Max++;
                    tp5TempCost = getUpgrade5Cost();
                }
                state.tp5Level -= tp5Max; // 还原
                tp5MaxCountEl.textContent = toDisplayNum(tp5Max);
            }
        }
    } else {
        if (lockEl) lockEl.style.display = "block";
        if (contentEl) contentEl.style.display = "none";
        const lgV = state.v.man > 0 ? state.v.exp + Math.log10(state.v.man) : 0;
        const progress = Math.min(100, (Math.max(0, lgV) / 8.477) * 100);
        if (unlockEl) unlockEl.textContent = t("trans.reset.unlockSpeedLabel") + toDisplay(state.v) + " / " + toDisplayNum(3e8) + " (" + toDisplayNum(progress) + t("trans.reset.logProgressSuffix");
        const bar = document.getElementById("transcend_progress_bar");
        if (bar) bar.style.width = progress + "%";
    }

    // 更新碎片UI
    for (let i = 1; i <= 6; i++) {
        const card = document.getElementById("frag_card_" + i);
        const btn = document.getElementById("frag_btn_" + i);
        if (!card || !btn) continue;
        if (state["frag" + i]) {
            card.classList.add("bought");
            btn.textContent = t("trans.frag.bought");
            btn.disabled = true;
        } else {
            card.classList.remove("bought");
            const cost = change(FRAGMENTS[i].cost);
            btn.textContent = t("trans.frag.buy");
            btn.disabled = !gte(state.bp, cost);
        }
    }

    // 里程碑解锁/锁定超越升级和碎片
    const tcUpgrade = document.getElementById("tc_upgrade");
    const tcFragments = document.getElementById("tc_fragments");
    if (tcUpgrade) {
        tcUpgrade.style.display = isTranscendUpgradeUnlocked() ? "" : "none";
        const lockMsg = tcUpgrade.querySelector(".tc-lock-msg");
        if (lockMsg) lockMsg.style.display = isTranscendUpgradeUnlocked() ? "none" : "block";
    }
    if (tcFragments) {
        tcFragments.style.display = isTranscendFragmentsUnlocked() ? "" : "none";
        const lockMsg = tcFragments.querySelector(".tc-lock-msg");
        if (lockMsg) lockMsg.style.display = isTranscendFragmentsUnlocked() ? "none" : "block";
    }

    // 更新里程碑UI
    updateMilestoneUI();

    // 显示里程碑倍率
    const msMultEl = document.getElementById("milestone_mult");
    if (msMultEl) {
        const mult = getMilestoneBPMult();
        msMultEl.textContent = mult > 1 ? ("×" + toDisplayNum(mult)) : t("status.noBonus");
        msMultEl.style.color = mult > 1 ? "#ffcc00" : "#00aa66";
    }
}

// ---------- 自动化 UI ----------
function updateAutomationUI() {
    ["v", "a", "j"].forEach(type => {
        const auto = state["auto" + type.toUpperCase()];
        const intervalEl = document.getElementById("auto_" + type + "_interval");
        const priceEl = document.getElementById("auto_" + type + "_price");
        const levelEl = document.getElementById("auto_" + type + "_level");
        const cb = document.getElementById("auto_" + type + "_enabled");
        const buyBtn = document.getElementById("auto_" + type + "_buy");

        if (intervalEl) intervalEl.textContent = t("auto.interval") + toDisplayNum(getAutoInterval(type)) + "ms";
        if (priceEl) priceEl.textContent = toDisplay(getAutoPrice(type)) + " BP";
        if (levelEl) levelEl.textContent = toDisplayNum(auto.level);
        if (cb) cb.checked = auto.enabled;
        if (buyBtn) buyBtn.disabled = !gte(state.bp, getAutoPrice(type));
    });

    const tcCb = document.getElementById("auto_transcend_enabled");
    if (tcCb) tcCb.checked = state.autoTranscend.enabled;

    const tcControl = document.getElementById("auto_transcend_control");
    if (tcControl) {
        tcControl.style.display = state.frag4 ? "block" : "none";
    }
}

// ---------- Base64 编码/解码 ----------
function toBase64(str) {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) {
        return String.fromCharCode('0x' + p1);
    }));
}

function fromBase64(str) {
    return decodeURIComponent(atob(str).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
}

// ---------- 存档 ----------
const NUM_SAVE_SLOTS = 10;

// 构建存档数据对象
function buildSaveData() {
    return {
        s: state.s, v: state.v, a: state.a, j: state.j,
        vLevel: state.vLevel, aLevel: state.aLevel, jLevel: state.jLevel,
        bp: state.bp, tpLevel: state.tpLevel, transcendCount: state.transcendCount,
        transcendUnlocked: transcendUnlocked,
        frag1: state.frag1, frag2: state.frag2, frag3: state.frag3, frag4: state.frag4,
        frag5: state.frag5, frag6: state.frag6, upgradeBuyCount: state.upgradeBuyCount,
        autoV: state.autoV, autoA: state.autoA, autoJ: state.autoJ,
        autoTranscend: state.autoTranscend,
        distU1_1: state.distU1_1, distU1_2: state.distU1_2, distU1_3: state.distU1_3,
        distU2_1: state.distU2_1, distU2_1_bonus: state.distU2_1_bonus, distU2_2: state.distU2_2,
        maxDist: state.maxDist,
        milestones: state.milestones,
        achievements: achievements,
        // 量子层级
        quantumPoints: state.quantumPoints,
        quantumCount: state.quantumCount,
        quantumMilestones: state.quantumMilestones,
        upgrade6Level: state.upgrade6Level,
        upgrade7Level: state.upgrade7Level,
        quantumUnlocked: state.quantumUnlocked,
        elementsOwned: state.elementsOwned,
        autoFrag: state.autoFrag,
        autoDistUpgrade: state.autoDistUpgrade,
        autoTranscendUpgrade: state.autoTranscendUpgrade,
        autoQuantum: state.autoQuantum,
        tp5Level: state.tp5Level,
        autoBuyMode: state.autoBuyMode,
        // 统计数据
        totalDistanceProduced: state.totalDistanceProduced,
        gameStartTime: state.gameStartTime,
        totalPlayTime: state.totalPlayTime,
        transcendStartTime: state.transcendStartTime,
        minTranscendTime: state.minTranscendTime,
        quantumStartTime: state.quantumStartTime,
        minQuantumTime: state.minQuantumTime,
        // 离线流量（深拷贝避免引用问题）
        offlineFlow: JSON.parse(JSON.stringify(state.offlineFlow)),
        // 核反应堆
        reactor: JSON.parse(JSON.stringify(state.reactor)),
        // 超越挑战
        challenges: JSON.parse(JSON.stringify(state.challenges)),
        challengeRewards: [...state.challengeRewards],
        distU1_4: state.distU1_4,
        // 设置（每存档独立）
        gameSettings: { ...gameSettings },
        lastAutoTranscendTime: lastAutoTranscendTime,
        lastAutoBuy: lastAutoBuy,
        savedAt: Date.now()
    };
}

// 应用存档数据到 state
function applySaveData(data) {
    state.s = data.s || { man: 1, exp: 0 };
    state.v = data.v || { man: 1, exp: 0 };
    state.a = data.a || { man: 1, exp: -3 };
    state.j = data.j || { man: 1, exp: -6 };
    state.vLevel = data.vLevel || 0;
    state.aLevel = data.aLevel || 0;
    state.jLevel = data.jLevel || 0;
    state.bp = (typeof data.bp === 'number') ? change(data.bp) : (data.bp || { man: 0, exp: 0 });
    state.tpLevel = data.tpLevel || 0;
    state.transcendCount = data.transcendCount || 0;
    transcendUnlocked = data.transcendUnlocked || false;
    state.frag1 = data.frag1 || false;
    state.frag2 = data.frag2 || false;
    state.frag3 = data.frag3 || false;
    state.frag4 = data.frag4 || false;
    state.frag5 = data.frag5 || false;
    state.frag6 = data.frag6 || false;
    state.upgradeBuyCount = data.upgradeBuyCount || 0;
    state.autoV = data.autoV || { enabled: false, level: 0 };
    state.autoA = data.autoA || { enabled: false, level: 0 };
    state.autoJ = data.autoJ || { enabled: false, level: 0 };
    state.autoTranscend = data.autoTranscend || {
        enabled: false,
        condInterval: false, intervalSec: 60,
        condBPAmount: false, bpAmount: "1",
        condBPMult: false, bpMult: 2
    };
    state.distU1_1 = data.distU1_1 || false;
    state.distU1_2 = data.distU1_2 || false;
    state.distU1_3 = data.distU1_3 || false;
    state.distU2_1 = data.distU2_1 || 0;
    state.distU2_1_bonus = data.distU2_1_bonus || 0;
    state.distU2_2 = data.distU2_2 || 0;
    state.maxDist = data.maxDist || { man: 1, exp: 0 };
    state.milestones = data.milestones || [];
    checkMilestones();

    // 量子层级
    state.quantumPoints = data.quantumPoints || { man: 0, exp: 0 };
    if (typeof state.quantumPoints === 'number') state.quantumPoints = change(state.quantumPoints);
    state.quantumCount = data.quantumCount || 0;
    state.quantumMilestones = data.quantumMilestones || [];
    state.upgrade6Level = data.upgrade6Level || 0;
    state.upgrade7Level = data.upgrade7Level || 0;
    state.quantumUnlocked = data.quantumUnlocked || false;
    state.elementsOwned = data.elementsOwned || [];
    state.autoFrag = data.autoFrag || { enabled: false };
    state.autoDistUpgrade = data.autoDistUpgrade || { enabled: false };
    state.autoTranscendUpgrade = data.autoTranscendUpgrade || { enabled: false };
    state.autoQuantum = data.autoQuantum || { enabled: false, condBPAmount: false, bpAmount: "10000" };
    state.tp5Level = data.tp5Level || 0;
    state.autoBuyMode = data.autoBuyMode !== undefined ? data.autoBuyMode : 1;
    checkQuantumMilestones();

    // 核反应堆
    state.reactor = data.reactor ? JSON.parse(JSON.stringify(data.reactor)) : {
        layers: [{quantity:0,efficiency:1,purchaseCount:0},{quantity:0,efficiency:1,purchaseCount:0},{quantity:0,efficiency:1,purchaseCount:0},{quantity:0,efficiency:1,purchaseCount:0},{quantity:0,efficiency:1,purchaseCount:0}],
        replicationEnergy: 1
    };
    // 超越挑战
    state.challenges = data.challenges ? JSON.parse(JSON.stringify(data.challenges)) : {
        activeChallenge: -1, challengeStartTime: 0,
        completed: [false,false,false,false,false,false],
        bestTimes: [1e300,1e300,1e300,1e300,1e300,1e300],
        c5_t: 0, c6_accumulator: 0
    };
    state.challengeRewards = data.challengeRewards || [false,false,false,false,false,false];
    state.distU1_4 = data.distU1_4 || false;

    // 统计数据
    state.totalDistanceProduced = data.totalDistanceProduced || { man: 0, exp: 0 };
    state.gameStartTime = data.gameStartTime || Date.now();
    state.totalPlayTime = data.totalPlayTime || 0;
    state.transcendStartTime = data.transcendTime || data.transcendStartTime || 0;
    state.minTranscendTime = (data.minTranscendTime !== undefined && data.minTranscendTime !== null) ? data.minTranscendTime : Infinity;
    state.quantumStartTime = data.quantumStartTime || 0;
    state.minQuantumTime = (data.minQuantumTime !== undefined && data.minQuantumTime !== null) ? data.minQuantumTime : Infinity;

    // 离线流量（确保所有字段都存在）
    state.offlineFlow = data.offlineFlow ? { ...data.offlineFlow } : {};
    state.offlineFlow.stored = state.offlineFlow.stored !== undefined ? state.offlineFlow.stored : 1800;
    state.offlineFlow.storageLimit = state.offlineFlow.storageLimit || 36000;
    state.offlineFlow.conversionRateLevel = state.offlineFlow.conversionRateLevel || 0;
    state.offlineFlow.storageLimitLevel = state.offlineFlow.storageLimitLevel || 0;
    state.offlineFlow.speedMultiplier = 1; // 加载时倍率重置为1x

    // 设置（每存档独立）
    if (data.gameSettings) {
        gameSettings = { ...gameSettings, ...data.gameSettings };
        applySettingsToUI();
    }
    // 重新设置自动保存定时器（使用加载后的间隔）
    setupAutoSave();

    if (state.frag2) {
        const tabBtn = document.getElementById("tabbtn_automation");
        if (tabBtn) tabBtn.style.display = "";
    }

    achievements = data.achievements || {};
    updateAchievementUI();

    lastAutoTranscendTime = data.lastAutoTranscendTime || Date.now();
    lastAutoBuy = data.lastAutoBuy || { v: 0, a: 0, j: 0 };
}

// 动态生成10个存档槽位卡片
function generateSaveSlots() {
    const grid = document.getElementById("save_grid");
    if (!grid) return;
    let html = "";
    for (let i = 1; i <= NUM_SAVE_SLOTS; i++) {
        html += '<div class="save-slot-card" id="save_slot_card_' + i + '">'
            + '<div class="slot-title">' + t("save.slot") + i + '</div>'
            + '<div class="slot-status">' + t("save.empty") + '</div>'
            + '<div class="slot-btns">'
            + '<button onclick="switchSlot(' + i + ')">' + t("save.switch") + '</button>'
            + '<button onclick="saveGame(' + i + ')">' + t("save.save") + '</button>'
            + '<button class="del-btn" onclick="deleteSave(' + i + ')">' + t("save.delete") + '</button>'
            + '</div>'
            + '</div>';
    }
    grid.innerHTML = html;
}

function updateSaveSlots() {
    for (let i = 1; i <= NUM_SAVE_SLOTS; i++) {
        const hasSave = localStorage.getItem("speedIdle_save_" + i) !== null;
        const slotEl = document.getElementById("save_slot_card_" + i);
        if (!slotEl) continue;
        // 标记当前槽位
        slotEl.classList.toggle("current", currentSlot === i);
        slotEl.classList.toggle("has-save", hasSave);
        const statusEl = slotEl.querySelector(".slot-status");
        if (statusEl) {
            if (currentSlot === i) {
                statusEl.textContent = hasSave ? t("save.current") : t("save.currentEmpty");
                statusEl.style.color = "#00ff88";
            } else if (hasSave) {
                statusEl.textContent = t("save.hasSave");
                statusEl.style.color = "#88aaff";
            } else {
                statusEl.textContent = t("save.empty");
                statusEl.style.color = "#666";
            }
        }
    }
    // 更新当前槽位显示
    const slotDisplay = document.getElementById("current_slot_display");
    if (slotDisplay) {
        slotDisplay.textContent = currentSlot !== null ? (t("save.slot") + currentSlot) : t("save.none");
    }
}

function saveGame(slot) {
    saveGameSilent(slot);
    showToast(t("toast.saved") + slot, "success");
    console.log("✅ 已保存到槽位 " + slot);
}

function saveGameSilent(slot) {
    try {
        const data = buildSaveData();
        const json = JSON.stringify(data);
        const b64 = toBase64(json);
        localStorage.setItem("speedIdle_save_" + slot, b64);
        currentSlot = slot;
        // updateSaveSlots 可能因为 DOM 不可用而失败（如页面卸载时），不应影响保存
        try { updateSaveSlots(); } catch (e2) { /* 忽略 UI 更新错误 */ }
    } catch (e) {
        console.error("❌ 存档保存失败 (槽位 " + slot + "):", e);
    }
}

// 切换存档槽位：先保存当前，再加载目标
function switchSlot(slot) {
    // 先保存当前存档
    if (currentSlot !== null && currentSlot !== slot) {
        saveGameSilent(currentSlot);
    }
    // 如果目标槽有存档则加载，否则在新槽位开始
    const hasSave = localStorage.getItem("speedIdle_save_" + slot) !== null;
    if (hasSave) {
        loadGame(slot);
    } else {
        // 空槽位：重置state并设置当前槽位
        resetStateToDefault();
        state.gameStartTime = Date.now();
        state.transcendStartTime = Date.now();
        currentSlot = slot;
        saveGameSilent(slot);
        lastTime = Date.now();
        render();
        showToast(t("toast.newGame") + slot + t("toast.newGameEnd"), "success");
    }
}

function loadGame(slot) {
    const b64 = localStorage.getItem("speedIdle_save_" + slot);
    if (!b64) {
        // 空槽位：开始新游戏
        switchSlot(slot);
        return;
    }
    let data;
    try {
        data = JSON.parse(fromBase64(b64));
    } catch (e) {
        try {
            data = JSON.parse(b64);
        } catch (e2) {
            showToast(t("toast.loadFail"), "error");
            return;
        }
    }
    applySaveData(data);
    currentSlot = slot;

    if (data.savedAt) {
        const offlineSec = (Date.now() - data.savedAt) / 1000;
        if (offlineSec > 1) {
            // 检查离线进度开关
            if (!gameSettings.offlineProgress) {
                // 离线进度关闭：将离线时间转为存储流量
                const convRate = getConversionRate();
                const flowGain = offlineSec * convRate;
                state.offlineFlow.stored = Math.min(
                    (state.offlineFlow.stored || 0) + flowGain,
                    state.offlineFlow.storageLimit || 36000
                );
                lastTime = Date.now();
                render();
                saveGameSilent(slot);
                updateSaveSlots();
                showToast(t("toast.loadedFlow") + slot + t("toast.loadedFlowMid") + formatFlowTime(flowGain) + t("toast.loadedFlowEnd"), "success");
                return;
            }
            // 限制离线模拟的tick数
            const maxTicks = Math.min(gameSettings.offlineTicksLimit || 100000, 5000000);
            startOfflineSimulation(offlineSec, t("toast.loaded") + slot + t("toast.loadedEnd"), maxTicks);
            return;
        }
    }
    lastTime = Date.now();
    render();
    updateSaveSlots();
    showToast(t("toast.loaded") + slot + t("toast.loadedEnd"), "success");
    console.log("✅ 已从槽位 " + slot + " 读取");
}

// 重置 state 到默认值
function resetStateToDefault() {
    state.s = { man: 1, exp: 0 };
    state.v = { man: 1, exp: 0 };
    state.a = { man: 1, exp: -3 };
    state.j = { man: 1, exp: -6 };
    state.vLevel = 0; state.aLevel = 0; state.jLevel = 0;
    state.bp = { man: 0, exp: 0 }; state.tpLevel = 0; state.transcendCount = 0;
    state.frag1 = false; state.frag2 = false; state.frag3 = false; state.frag4 = false;
    state.frag5 = false; state.frag6 = false; state.upgradeBuyCount = 0;
    state.autoV = { enabled: false, level: 0 };
    state.autoA = { enabled: false, level: 0 };
    state.autoJ = { enabled: false, level: 0 };
    state.autoTranscend = {
        enabled: false,
        condInterval: false, intervalSec: 60,
        condBPAmount: false, bpAmount: "1",
        condBPMult: false, bpMult: 2
    };
    state.distU1_1 = false; state.distU1_2 = false; state.distU1_3 = false;
    state.distU2_1 = 0; state.distU2_1_bonus = 0; state.distU2_2 = 0;
    state.maxDist = { man: 1, exp: 0 };
    state.milestones = [];
    state.quantumPoints = { man: 0, exp: 0 };
    state.quantumCount = 0;
    state.quantumMilestones = [];
    state.upgrade6Level = 0;
    state.upgrade7Level = 0;
    state.quantumUnlocked = false;
    state.elementsOwned = [];
    state.autoFrag = { enabled: false };
    state.autoDistUpgrade = { enabled: false };
    state.autoTranscendUpgrade = { enabled: false };
    state.autoQuantum = { enabled: false, condBPAmount: false, bpAmount: "10000" };
    state.tp5Level = 0;
    state.autoBuyMode = 1;
    // 统计重置
    state.totalDistanceProduced = { man: 0, exp: 0 };
    state.gameStartTime = Date.now();
    state.totalPlayTime = 0;
    state.transcendStartTime = Date.now();
    state.minTranscendTime = Infinity;
    state.quantumStartTime = Date.now();
    state.minQuantumTime = Infinity;
    // 离线流量重置
    state.offlineFlow = {
        stored: 1800, storageLimit: 36000,
        conversionRateLevel: 0, storageLimitLevel: 0,
        speedMultiplier: 1
    };
    // 核反应堆重置
    state.reactor = {
        layers: [{quantity:0,efficiency:1,purchaseCount:0},{quantity:0,efficiency:1,purchaseCount:0},{quantity:0,efficiency:1,purchaseCount:0},{quantity:0,efficiency:1,purchaseCount:0},{quantity:0,efficiency:1,purchaseCount:0}],
        replicationEnergy: 1
    };
    // 超越挑战重置
    state.challenges = {
        activeChallenge: -1, challengeStartTime: 0,
        completed: [false,false,false,false,false,false],
        bestTimes: [1e300,1e300,1e300,1e300,1e300,1e300],
        c5_t: 0, c6_accumulator: 0
    };
    state.challengeRewards = [false,false,false,false,false,false];
    state.distU1_4 = false;
    // 设置重置
    gameSettings = {
        sciPrecision: 3, customNotation: "",
        offlineTicksLimit: 100000, offlineProgress: true,
        autoSaveInterval: 1, floatBar: true, scene: true,
        confirmTranscend: true, confirmQuantum: true, confirmReset: true
    };
    applySettingsToUI();
    achievements = {};
    transcendUnlocked = false;
    lastAutoTranscendTime = Date.now();
    lastAutoBuy = { v: 0, a: 0, j: 0 };
    const tabBtn = document.getElementById("tabbtn_automation");
    if (tabBtn) tabBtn.style.display = "none";
}

function deleteSave(slot) {
    // 第一重确认
    if (!confirm(t("confirm.delete1") + slot + t("confirm.delete1Suffix"))) return;
    // 第二重确认
    if (!confirm(t("confirm.delete2") + slot + t("confirm.delete2Suffix"))) return;
    localStorage.removeItem("speedIdle_save_" + slot);
    if (currentSlot === slot) {
        // 删除当前槽位后，尝试切换到其他有存档的槽位
        let foundSlot = -1;
        for (let i = 1; i <= NUM_SAVE_SLOTS; i++) {
            if (localStorage.getItem("speedIdle_save_" + i)) { foundSlot = i; break; }
        }
        if (foundSlot !== -1) {
            // 加载其他存档
            loadGame(foundSlot);
            showToast(t("toast.deleted") + slot + t("toast.deletedSwitch") + foundSlot, "success");
            return;
        } else {
            // 没有其他存档，在当前槽位开始新游戏
            resetStateToDefault();
            currentSlot = slot;
            state.gameStartTime = Date.now();
            state.transcendStartTime = Date.now();
            state.quantumStartTime = Date.now();
            saveGameSilent(slot);
            lastTime = Date.now();
            render();
            showToast(t("toast.deleted") + slot + t("toast.deletedNew") + slot + t("toast.deletedNewEnd"), "success");
            return;
        }
    }
    render();
    updateSaveSlots();
    showToast(t("toast.deleted") + slot + t("toast.deletedEnd"), "success");
}

// ---------- 买最大 ----------
function buyMax(type) {
    let perLevelAdd;
    if (type === "v") perLevelAdd = null;
    else if (type === "a") perLevelAdd = { man: 1, exp: -1 };
    else perLevelAdd = { man: 1, exp: -2 };

    // 量子里程碑3: 购买速度/加速度/急动度升级时不扣除距离
    const freeUpgrades = state.quantumMilestones.includes(2);

    let cost = getUpgradeCost(
        type === "v" ? state.vLevel : type === "a" ? state.aLevel : state.jLevel, type
    );
    let bought = 0;
    let maxIter = 10000;
    while (gte(state.s, cost) && maxIter-- > 0) {
        if (!freeUpgrades) state.s = minus(state.s, cost);
        bought++;
        if (type === "v") state.vLevel++;
        else if (type === "a") { state.aLevel++; state.a = plus(state.a, perLevelAdd); }
        else { state.jLevel++; state.j = plus(state.j, perLevelAdd); }
        cost = getUpgradeCost(
            type === "v" ? state.vLevel : type === "a" ? state.aLevel : state.jLevel, type
        );
    }
    state.upgradeBuyCount += bought;
    if (bought > 0) resetChallenge5T();
}

// ---------- 按数量购买 ----------
function buyAmount(type, count) {
    // 量子里程碑3: 购买速度/加速度/急动度升级时不扣除距离
    const freeUpgrades = state.quantumMilestones.includes(2);
    let bought = 0;
    for (let i = 0; i < count; i++) {
        let level = type === "v" ? state.vLevel : type === "a" ? state.aLevel : state.jLevel;
        let cost = getUpgradeCost(level, type);
        if (!gte(state.s, cost)) break;
        if (!freeUpgrades) state.s = minus(state.s, cost);
        bought++;
        if (type === "v") state.vLevel++;
        else if (type === "a") { state.aLevel++; state.a = plus(state.a, { man: 1, exp: -1 }); }
        else { state.jLevel++; state.j = plus(state.j, { man: 1, exp: -2 }); }
    }
    state.upgradeBuyCount += bought;
    if (bought > 0) resetChallenge5T();
}

// ---------- 自动保存（使用可配置间隔） ----------
let autoSaveTimer = null;
function setupAutoSave() {
    if (autoSaveTimer) clearInterval(autoSaveTimer);
    const interval = (gameSettings.autoSaveInterval || 1) * 1000;
    autoSaveTimer = setInterval(() => {
        // 安全网：如果 currentSlot 为 null，自动分配槽位1
        if (currentSlot === null) {
            currentSlot = 1;
            console.warn("⚠️ currentSlot 为 null，已自动分配槽位1");
        }
        saveGameSilent(currentSlot);
    }, interval);
}
setupAutoSave();

// ---------- 绑定存档 UI (10个槽位) ----------
// 槽位切换和保存通过 onclick 属性直接调用 switchSlot/saveGame/deleteSave

// ---------- 购买数量选择 ----------
let buyQty = 1;
document.querySelectorAll(".buy-qty-btn").forEach(btn => {
    btn.onclick = () => {
        document.querySelectorAll(".buy-qty-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        buyQty = parseInt(btn.dataset.qty);
    };
});

// ---------- 绑定升级 ----------
document.getElementById("v_upgrade").onclick = () => buyAmount("v", buyQty);
document.getElementById("a_upgrade").onclick = () => buyAmount("a", buyQty);
document.getElementById("j_upgrade").onclick = () => buyAmount("j", buyQty);

// ---------- 绑定买最大 ----------
document.getElementById("v_max").onclick = () => buyMax("v");
document.getElementById("a_max").onclick = () => buyMax("a");
document.getElementById("j_max").onclick = () => buyMax("j");

// ---------- 绑定超越 UI ----------
document.getElementById("transcend_btn").onclick = () => transcend();
document.getElementById("transcend_tp_btn").onclick = () => buyTP();

// ---------- 启动时自动读最近存档 ----------
(function autoLoad() {
    for (let i = 1; i <= NUM_SAVE_SLOTS; i++) {
        if (localStorage.getItem("speedIdle_save_" + i)) {
            loadGame(i);
            console.log("✅ 自动读取槽位 " + i);
            return;
        }
    }
    // 首次进入：自动选择存档位1，开启自动保存
    currentSlot = 1;
    state.gameStartTime = Date.now();
    state.transcendStartTime = Date.now();
    state.quantumStartTime = Date.now();
    saveGameSilent(1);
    updateSaveSlots();
    console.log("📭 没有找到存档，从头开始（已自动选择存档位1）");
})();

// ---------- 退出游戏时倍率自动切换为1x并保存 ----------
// 真正关闭页面时：重置倍率并保存
function saveOnUnload() {
    if (currentSlot === null) currentSlot = 1;
    state.offlineFlow.speedMultiplier = 1;
    saveGameSilent(currentSlot);
}
// 仅切换标签页（不关闭）：只保存，不重置倍率
function saveOnHide() {
    if (currentSlot === null) currentSlot = 1;
    saveGameSilent(currentSlot);
}
window.addEventListener("beforeunload", saveOnUnload);
window.addEventListener("pagehide", saveOnUnload);
document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
        saveOnHide();
    }
});

// ---------- 导出存档文件 ----------
function exportSave() {
    const saves = {};
    for (let i = 1; i <= NUM_SAVE_SLOTS; i++) {
        const b64 = localStorage.getItem("speedIdle_save_" + i);
        if (b64) saves[i] = b64;
    }
    const payload = toBase64(JSON.stringify(saves));
    const blob = new Blob([payload], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "speed_idle_saves.txt"; a.click();
    URL.revokeObjectURL(url);
}

// ---------- 导入存档文件 ----------
function importSave() {
    const input = document.createElement("input");
    input.type = "file"; input.accept = ".txt";
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const payload = ev.target.result.trim();
                const saves = JSON.parse(fromBase64(payload));
                for (const slot in saves) {
                    localStorage.setItem("speedIdle_save_" + slot, saves[slot]);
                }
                render();
                updateSaveSlots();
                showToast(t("toast.importOk"), "success");
            } catch (err) {
                showToast(t("toast.importFail"), "error");
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

// ---------- 导出存档代码 ----------
function exportSaveCode() {
    const data = buildSaveData();
    const b64 = toBase64(JSON.stringify(data));
    const el = document.getElementById("save_code_output");
    if (el) {
        el.value = b64;
        el.select();
        document.execCommand("copy");
        showToast(t("toast.codeGenerated"), "success");
    }
}

// ---------- 导入存档代码 ----------
function importSaveCode() {
    const el = document.getElementById("save_code_input");
    if (!el) return;
    const b64 = el.value.trim();
    if (!b64) {
        showToast(t("toast.codeEmpty"), "warn");
        return;
    }
    let data;
    try {
        data = JSON.parse(fromBase64(b64));
    } catch (e) {
        showToast(t("toast.codeInvalid"), "error");
        return;
    }
    applySaveData(data);

    // 导入后必须分配槽位，否则自动保存和退出保存都会失效
    if (currentSlot === null) {
        // 寻找第一个空槽位
        let targetSlot = -1;
        for (let i = 1; i <= NUM_SAVE_SLOTS; i++) {
            if (!localStorage.getItem("speedIdle_save_" + i)) { targetSlot = i; break; }
        }
        // 没有空槽位则覆盖槽位1
        if (targetSlot === -1) targetSlot = 1;
        currentSlot = targetSlot;
    }
    saveGameSilent(currentSlot);
    updateSaveSlots();

    if (data.savedAt) {
        const offlineSec = (Date.now() - data.savedAt) / 1000;
        if (offlineSec > 1) {
            if (!gameSettings.offlineProgress) {
                const convRate = getConversionRate();
                const flowGain = offlineSec * convRate;
                state.offlineFlow.stored = Math.min(
                    (state.offlineFlow.stored || 0) + flowGain,
                    state.offlineFlow.storageLimit || 36000
                );
                lastTime = Date.now();
                render();
                saveGameSilent(currentSlot);
                el.value = "";
                showToast(t("toast.codeImportedFlow") + formatFlowTime(flowGain) + t("toast.loadedFlowEnd"), "success");
                return;
            }
            const maxTicks = Math.min(gameSettings.offlineTicksLimit || 100000, 5000000);
            startOfflineSimulation(offlineSec, t("toast.codeImported"), maxTicks);
            el.value = "";
            return;
        }
    }

    lastTime = Date.now();
    render();
    el.value = "";
    showToast(t("toast.codeImportedSlot") + currentSlot + t("toast.loadedFlowEnd"), "success");
}

// ==================================================
//          开发者模式
// ==================================================
// 密码以 SHA-256 哈希存储（不存储明文）
const DEV_USERS = {
    roast:    { name: "Roast",    hash: "d5f25bf0df422eb10c31e82eaabd21bbe83ea5f4cd7fd0bf2b30a4a0bb423761" },
    explorer: { name: "explorer", hash: "24cb829ca69b8cf3db4f4852dee62ca3424ba2de7716bb710cd81a16d5d2988a" }
};

let devAuthenticated = false;
let devCurrentUser = null;

// SHA-256 哈希（使用 Web Crypto API）
async function sha256(text) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

// 开发者登录
async function devLogin() {
    const userKey = document.getElementById("dev_user_select").value;
    const password = document.getElementById("dev_password_input").value;
    const msgEl = document.getElementById("dev_login_msg");

    if (!password) {
        msgEl.textContent = t("toast.devEnterPass");
        msgEl.style.color = "#ff6666";
        return;
    }

    const user = DEV_USERS[userKey];
    if (!user) {
        msgEl.textContent = t("toast.devUnknownUser");
        msgEl.style.color = "#ff6666";
        return;
    }

    const inputHash = await sha256(password);
    if (inputHash === user.hash) {
        devAuthenticated = true;
        devCurrentUser = user;
        document.getElementById("dev_login_area").style.display = "none";
        document.getElementById("dev_panel").style.display = "";
        document.getElementById("dev_user_name").textContent = user.name;
        document.getElementById("dev_password_input").value = "";
        msgEl.textContent = "";
        devFillCurrent();
        showToast(t("toast.devEnabled"), "success");
    } else {
        msgEl.textContent = t("toast.devWrongPass");
        msgEl.style.color = "#ff6666";
    }
}

// 开发者退出
function devLogout() {
    devAuthenticated = false;
    devCurrentUser = null;
    document.getElementById("dev_login_area").style.display = "";
    document.getElementById("dev_panel").style.display = "none";
    showToast(t("toast.devDisabled"), "info");
}

// 解析科学计数法字符串
function parseSci(str) {
    str = str.trim();
    const m = str.match(/^([0-9]*\.?[0-9]+)[eE]([+-]?[0-9]+)$/);
    if (m) {
        return { man: parseFloat(m[1]), exp: parseInt(m[2]) };
    }
    const num = parseFloat(str);
    if (isNaN(num)) return null;
    if (num === 0) return { man: 0, exp: 0 };
    let exp = Math.floor(Math.log10(Math.abs(num)));
    let man = num / Math.pow(10, exp);
    return { man, exp };
}

// 设置数值字段
function devSetField(field) {
    if (!devAuthenticated) return;
    const input = document.getElementById("dev_" + field + "_input");
    const val = parseSci(input.value);
    if (!val) {
        showToast(t("toast.devFormatError"), "error");
        return;
    }
    state[field] = val;
    if (field === "s" && gte(state.s, state.maxDist)) {
        state.maxDist = { ...state.s };
    }
    render();
    showToast(field.toUpperCase() + t("toast.devSet") + toDisplay(val), "success");
}

// 设置等级
function devSetLevels() {
    if (!devAuthenticated) return;
    state.vLevel = parseInt(document.getElementById("dev_vLevel_input").value) || 0;
    state.aLevel = parseInt(document.getElementById("dev_aLevel_input").value) || 0;
    state.jLevel = parseInt(document.getElementById("dev_jLevel_input").value) || 0;
    state.tpLevel = parseInt(document.getElementById("dev_tpLevel_input").value) || 0;
    render();
    showToast(t("toast.devLevelsUpdated"), "success");
}

// 设置杂项
function devSetMisc() {
    if (!devAuthenticated) return;
    state.transcendCount = parseInt(document.getElementById("dev_tcCount_input").value) || 0;
    state.distU2_1 = parseInt(document.getElementById("dev_distU2_1_input").value) || 0;
    state.distU2_2 = parseInt(document.getElementById("dev_distU2_2_input").value) || 0;
    checkMilestones();
    render();
    showToast(t("toast.devDataUpdated"), "success");
}

// 设置量子数据
function devSetQuantum() {
    if (!devAuthenticated) return;
    const qpStr = document.getElementById("dev_quantumPoints_input").value;
    const qpVal = parseSci(qpStr);
    if (qpVal) state.quantumPoints = qpVal;
    state.quantumCount = parseInt(document.getElementById("dev_quantumCount_input").value) || 0;
    state.upgrade6Level = parseInt(document.getElementById("dev_upgrade6Level_input").value) || 0;
    const u7Input = document.getElementById("dev_upgrade7Level_input");
    if (u7Input) state.upgrade7Level = parseInt(u7Input.value) || 0;
    checkQuantumMilestones();
    render();
    showToast(t("toast.devQuantumUpdated"), "success");
}

// 解锁全部量子里程碑
function devUnlockAllQuantumMilestones() {
    if (!devAuthenticated) return;
    state.quantumMilestones = [];
    for (let i = 0; i < QUANTUM_MILESTONES.length; i++) {
        state.quantumMilestones.push(i);
    }
    state.quantumCount = Math.max(state.quantumCount, 35);
    state.quantumUnlocked = true;
    checkQuantumMilestones();
    render();
    showToast(t("toast.devAllQms"), "success");
}

// 设置碎片/升级开关
function devSetFlags() {
    if (!devAuthenticated) return;
    state.frag1 = document.getElementById("dev_frag1").checked;
    state.frag2 = document.getElementById("dev_frag2").checked;
    state.frag3 = document.getElementById("dev_frag3").checked;
    state.frag4 = document.getElementById("dev_frag4").checked;
    state.frag5 = document.getElementById("dev_frag5").checked;
    state.frag6 = document.getElementById("dev_frag6").checked;
    state.distU1_1 = document.getElementById("dev_distU1_1").checked;
    state.distU1_2 = document.getElementById("dev_distU1_2").checked;
    state.distU1_3 = document.getElementById("dev_distU1_3").checked;
    // 更新自动化页可见性
    const tabBtn = document.getElementById("tabbtn_automation");
    if (tabBtn) tabBtn.style.display = state.frag2 ? "" : "none";
    render();
    showToast(t("toast.devFlagsApplied"), "success");
}

// 解锁全部里程碑
function devUnlockAllMilestones() {
    if (!devAuthenticated) return;
    state.milestones = [];
    for (let i = 0; i < MILESTONES.length; i++) {
        state.milestones.push(i);
    }
    state.transcendCount = Math.max(state.transcendCount, 1000);
    render();
    showToast(t("toast.devAllMs"), "success");
}

// 解锁全部成就
function devUnlockAllAchievements() {
    if (!devAuthenticated) return;
    Object.keys(ACHIEVEMENTS).forEach(id => achievements[id] = true);
    updateAchievementUI();
    showToast(t("toast.devAllAch"), "success");
}

// 填充当前值到输入框
function devFillCurrent() {
    if (!devAuthenticated) return;
    const fields = ["s", "v", "a", "j", "bp"];
    fields.forEach(f => {
        const el = document.getElementById("dev_" + f + "_input");
        if (el) el.value = toDisplay(state[f]).replace(/\s/g, "");
    });
    const levels = ["vLevel", "aLevel", "jLevel", "tpLevel"];
    levels.forEach(l => {
        const el = document.getElementById("dev_" + l + "_input");
        if (el) el.value = state[l];
    });
    document.getElementById("dev_tcCount_input").value = state.transcendCount;
    document.getElementById("dev_distU2_1_input").value = state.distU2_1;
    document.getElementById("dev_distU2_2_input").value = state.distU2_2;
    document.getElementById("dev_frag1").checked = state.frag1;
    document.getElementById("dev_frag2").checked = state.frag2;
    document.getElementById("dev_frag3").checked = state.frag3;
    document.getElementById("dev_frag4").checked = state.frag4;
    document.getElementById("dev_frag5").checked = state.frag5;
    document.getElementById("dev_frag6").checked = state.frag6;
    document.getElementById("dev_distU1_1").checked = state.distU1_1;
    document.getElementById("dev_distU1_2").checked = state.distU1_2;
    document.getElementById("dev_distU1_3").checked = state.distU1_3;
    // 量子数据
    const qpEl = document.getElementById("dev_quantumPoints_input");
    if (qpEl) qpEl.value = toDisplay(state.quantumPoints).replace(/\s/g, "");
    const qcEl = document.getElementById("dev_quantumCount_input");
    if (qcEl) qcEl.value = state.quantumCount;
    const u6El = document.getElementById("dev_upgrade6Level_input");
    if (u6El) u6El.value = state.upgrade6Level;
    const u7El = document.getElementById("dev_upgrade7Level_input");
    if (u7El) u7El.value = state.upgrade7Level;
}

// ---------- 重置游戏 ----------
function resetGame() {
    if (gameSettings.confirmReset && !confirm(t("confirm.reset"))) return;
    // 删除当前存档
    if (currentSlot !== null) {
        localStorage.removeItem("speedIdle_save_" + currentSlot);
    }
    resetStateToDefault();
    // 重置后在当前槽位开始新游戏，确保自动保存不会失效
    if (currentSlot === null) currentSlot = 1;
    state.gameStartTime = Date.now();
    state.transcendStartTime = Date.now();
    state.quantumStartTime = Date.now();
    saveGameSilent(currentSlot);
    lastTime = Date.now();
    render();
    updateSaveSlots();
    showToast(t("toast.gameReset") + currentSlot + t("toast.gameResetEnd"), "success");
}

setInterval(update, 1000 / 50);
