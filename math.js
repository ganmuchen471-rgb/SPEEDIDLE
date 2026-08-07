// ==================================================
//          EE308 数学引擎 — 防溢出版
// ==================================================
// 所有运算直接在 {man, exp} 上进行，彻底避免大数溢出
// exp 上限封顶为 EXP_CAP = 1e15，防止 Infinity/NaN 传播
// ==================================================

const EXP_CAP = 1e15;

function safeExp(e) {
    if (!Number.isFinite(e)) return EXP_CAP;
    return Math.max(-EXP_CAP, Math.min(EXP_CAP, e));
}

function plus(x, y) {
    if (!x || !y) return { man: 0, exp: 0 };
    // 非有限 exp 防护
    const xFin = Number.isFinite(x.exp);
    const yFin = Number.isFinite(y.exp);
    if (!xFin || !yFin) {
        if (!xFin && !yFin) return { man: 9.9, exp: EXP_CAP };
        return xFin ? { ...y } : { ...x };
    }
    if (Math.abs(x.exp - y.exp) >= 15) {
        return x.exp >= y.exp ? { ...x } : { ...y };
    }
    let biggerexp = Math.max(x.exp, y.exp);
    let manx = x.man / Math.pow(10, biggerexp - x.exp);
    let many = y.man / Math.pow(10, biggerexp - y.exp);
    let man = manx + many;
    let exp = biggerexp;
    if (man === 0) return { man: 0, exp: 0 };
    while (Math.abs(man) < 1) { man *= 10; exp -= 1; }
    while (Math.abs(man) >= 10) { man /= 10; exp += 1; }
    return { man, exp: safeExp(exp) };
}

function muil(x, y) {
    if (!x || !y || x.man === 0 || y.man === 0) return { man: 0, exp: 0 };
    let man = x.man * y.man;
    let exp = x.exp + y.exp;
    if (!Number.isFinite(exp)) return { man: 9.9, exp: EXP_CAP };
    while (Math.abs(man) < 1) { man *= 10; exp -= 1; }
    while (Math.abs(man) >= 10) { man /= 10; exp += 1; }
    return { man, exp: safeExp(exp) };
}

function dev(x, y) {
    if (!x || !y || y.man === 0 || x.man === 0) return { man: 0, exp: 0 };
    let man = x.man / y.man;
    let exp = x.exp - y.exp;
    if (!Number.isFinite(exp)) return { man: 9.9, exp: safeExp(exp) };
    while (Math.abs(man) < 1) { man *= 10; exp -= 1; }
    while (Math.abs(man) >= 10) { man /= 10; exp += 1; }
    return { man, exp: safeExp(exp) };
}

function change(x) {
    if (x === 0) return { man: 0, exp: 0 };
    if (!Number.isFinite(x)) return { man: 0, exp: 0 };
    let absX = Math.abs(x);
    if (absX < 1e-308) return { man: 0, exp: 0 };
    let exp = Math.floor(Math.log10(absX));
    let man = x / Math.pow(10, exp);
    return { man, exp };
}

// 所有计算直接在 {man,exp} 上操作，避免大数溢出

function root(x, y) {
    if (!x || !y) return { man: 0, exp: 0 };
    let deman = Math.log10(Math.abs(x.man));
    let expPart = dev(change(x.exp), y);
    let manPart = dev(change(deman), y);
    let expNum = expPart.man * Math.pow(10, Math.min(expPart.exp, 15));
    let manNum = manPart.man * Math.pow(10, Math.min(manPart.exp, 15));
    let exp1 = expNum - Math.floor(expNum);
    let exp = Math.floor(expNum);
    let man = Math.pow(10, manNum) * Math.pow(10, exp1);
    if (man >= 10 || man < 1) {
        let down = Math.floor(Math.log10(man));
        exp += down;
        man /= Math.pow(10, down);
    }
    return { man, exp: safeExp(exp) };
}

function power(x, y) {
    if (!x || !y || x.man === 0) return { man: 0, exp: 0 };
    if (x.man < 0) return { man: 0, exp: 0 };
    if (y.man === 0) return { man: 1, exp: 0 };
    let totalLog = plus(change(Math.log10(x.man)), change(x.exp));
    let resultLog = muil(totalLog, y);
    let m = resultLog.man;
    let e = resultLog.exp;
    let finalExp, finalMan;
    if (e < 0) {
        let val = m * Math.pow(10, e);
        finalExp = 0;
        finalMan = Math.pow(10, val);
    } else if (e <= 15) {
        let val = m * Math.pow(10, e);
        finalExp = Math.floor(val);
        finalMan = Math.pow(10, val - finalExp);
    } else {
        // e > 15: 用 log10 避免 m * Math.pow(10, e) 溢出
        let logBig = Math.log10(m) + e;
        if (!Number.isFinite(logBig)) {
            finalMan = 1;
            finalExp = EXP_CAP;
        } else {
            finalExp = Math.floor(logBig);
            finalMan = Math.pow(10, logBig - finalExp);
        }
    }
    if (finalMan >= 10 || finalMan < 1) {
        let down = Math.floor(Math.log10(finalMan));
        finalExp += down;
        finalMan /= Math.pow(10, down);
    }
    return { man: finalMan, exp: safeExp(finalExp) };
}

function lg(x) {
    if (!x || x.man <= 0) return { man: 0, exp: 0 };
    return change(x.exp + Math.log10(x.man));
}

function log(x, y) {
    if (!x || x.man <= 0) return { man: 0, exp: 0 };
    if (!y || y.man <= 0) return { man: 0, exp: 0 };
    return dev(lg(x), lg(y));
}

function minus(x, y) {
    if (!x || !y) return { man: 0, exp: 0 };
    const xFin = Number.isFinite(x.exp);
    const yFin = Number.isFinite(y.exp);
    if (!xFin || !yFin) {
        if (!xFin && !yFin) return { man: 0, exp: 0 };
        if (!xFin) return { ...y, man: -y.man };
        return { ...x };
    }
    let biggerexp = Math.max(x.exp, y.exp);
    let manx = x.man / Math.pow(10, biggerexp - x.exp);
    let many = y.man / Math.pow(10, biggerexp - y.exp);
    let man = manx - many;
    let exp = biggerexp;
    if (man === 0) return { man: 0, exp: 0 };
    while (Math.abs(man) < 1) { man *= 10; exp -= 1; }
    while (Math.abs(man) >= 10) { man /= 10; exp += 1; }
    return { man, exp: safeExp(exp) };
}

// ==================================================
//          安全工具函数
// ==================================================
function slog(x) {
    if (!x || x.man <= 0) return { man: 0, exp: 0 };
    return lg(plus(x, { man: 1, exp: 0 }));
}

function smul(x, y) {
    return muil(x, plus(y, { man: 1, exp: 0 }));
}
