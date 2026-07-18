// api/pow.js
// Deploy to Vercel.

// ---- 32-bit unsigned multiplication emulation (matches PHP's 64-bit then mask) ----
function mul32_unsigned(a, b) {
    // Math.imul returns signed 32-bit, convert to unsigned
    return (Math.imul(a, b) >>> 0);
}

// ---- ns_hash – exact PHP translation ----
function ns_hash(input) {
    const RS_AH = 40503, RS_AL = 31153;
    const TS_AH = 34283, TS_AL = 51831;

    const data = [];
    for (let i = 0; i < input.length; i++) {
        data.push(input.charCodeAt(i));
    }
    const len = data.length;

    let r0 = 1779033703 >>> 0, r1 = 3144134277 >>> 0;
    let r2 = 1013904242 >>> 0, r3 = 2773480762 >>> 0;

    // ---- First loop ----
    for (let o = 0; o < len; o++) {
        r0 = (r0 + data[o]) >>> 0;
        r0 = ((r0 << 7) | (r0 >>> 25)) >>> 0;
        r0 = (r0 + r1) >>> 0;
        let v = (r3 ^ r0) >>> 0;
        r3 = ((v << 16) | (v >>> 16)) >>> 0;
        r2 = (r2 + r3) >>> 0;
        v = (r1 ^ r2) >>> 0;
        r1 = ((v << 12) | (v >>> 20)) >>> 0;
        r0 = (r0 + r1) >>> 0;
        v = (r3 ^ r0) >>> 0;
        r3 = ((v << 8) | (v >>> 24)) >>> 0;
        r2 = (r2 + r3) >>> 0;
        v = (r1 ^ r2) >>> 0;
        r1 = ((v << 7) | (v >>> 25)) >>> 0;
    }

    // ---- 8 preliminary rounds ----
    for (let o = 0; o < 8; o++) {
        r0 = (r0 + r1) >>> 0;
        let v = (r3 ^ r0) >>> 0;
        r3 = ((v << 16) | (v >>> 16)) >>> 0;
        r2 = (r2 + r3) >>> 0;
        v = (r1 ^ r2) >>> 0;
        r1 = ((v << 12) | (v >>> 20)) >>> 0;
        r0 = (r0 + r1) >>> 0;
        v = (r3 ^ r0) >>> 0;
        r3 = ((v << 8) | (v >>> 24)) >>> 0;
        r2 = (r2 + r3) >>> 0;
        v = (r1 ^ r2) >>> 0;
        r1 = ((v << 7) | (v >>> 25)) >>> 0;
    }

    // ---- Generate T table ----
    const T = new Array(512);
    for (let o = 0; o < 512; o++) {
        r0 = (r0 + r1) >>> 0;
        let v = (r3 ^ r0) >>> 0;
        r3 = ((v << 16) | (v >>> 16)) >>> 0;
        r2 = (r2 + r3) >>> 0;
        v = (r1 ^ r2) >>> 0;
        r1 = ((v << 12) | (v >>> 20)) >>> 0;
        r0 = (r0 + r1) >>> 0;
        v = (r3 ^ r0) >>> 0;
        r3 = ((v << 8) | (v >>> 24)) >>> 0;
        r2 = (r2 + r3) >>> 0;
        v = (r1 ^ r2) >>> 0;
        r1 = ((v << 7) | (v >>> 25)) >>> 0;
        T[o] = (r0 ^ r2) >>> 0;
    }

    // ---- Two passes over T ----
    for (let o = 0; o < 2; o++) {
        for (let s = 0; s < 512; s++) {
            const ts = T[s] >>> 0;
            const idx = (ts & 511) >>> 0;
            let d = (ts + T[idx]) >>> 0;
            d = ((d << 13) | (d >>> 19)) >>> 0;
            const b = T[(s + 1) & 511] >>> 0;
            const bh = (b >>> 16) & 0xFFFF;
            const bl = b & 0xFFFF;

            // ---- CORRECTED MULTIPLICATION ----
            const mul1 = mul32_unsigned(RS_AL, bl);
            const sum  = (mul32_unsigned(RS_AH, bl) + mul32_unsigned(RS_AL, bh)) >>> 0;
            const mul2 = ((sum & 0xFFFF) << 16) >>> 0;
            const mul  = (mul1 + mul2) >>> 0;

            d = (d ^ mul) >>> 0;
            T[s] = d;

            r0 = (r0 ^ d) >>> 0;
            r0 = (r0 + r1) >>> 0;
            let v = (r3 ^ r0) >>> 0;
            r3 = ((v << 16) | (v >>> 16)) >>> 0;
            r2 = (r2 + r3) >>> 0;
            v = (r1 ^ r2) >>> 0;
            r1 = ((v << 12) | (v >>> 20)) >>> 0;
            r0 = (r0 + r1) >>> 0;
            v = (r3 ^ r0) >>> 0;
            r3 = ((v << 8) | (v >>> 24)) >>> 0;
            r2 = (r2 + r3) >>> 0;
            v = (r1 ^ r2) >>> 0;
            r1 = ((v << 7) | (v >>> 25)) >>> 0;
        }
    }

    // ---- Final 8 rounds ----
    const result = [];
    for (let o = 0; o < 8; o++) {
        r0 = (r0 + r1) >>> 0;
        let v = (r3 ^ r0) >>> 0;
        r3 = ((v << 16) | (v >>> 16)) >>> 0;
        r2 = (r2 + r3) >>> 0;
        v = (r1 ^ r2) >>> 0;
        r1 = ((v << 12) | (v >>> 20)) >>> 0;
        r0 = (r0 + r1) >>> 0;
        v = (r3 ^ r0) >>> 0;
        r3 = ((v << 8) | (v >>> 24)) >>> 0;
        r2 = (r2 + r3) >>> 0;
        v = (r1 ^ r2) >>> 0;
        r1 = ((v << 7) | (v >>> 25)) >>> 0;
        let sv = r0 >>> 0;
        const cb = o * 64;
        for (let d = 0; d < 64; d++) {
            const f = T[cb + d] >>> 0;
            sv = (sv + f) >>> 0;
            sv = ((sv << 5) | (sv >>> 27)) >>> 0;
            const fh = (f >>> 16) & 0xFFFF;
            const fl = f & 0xFFFF;

            // ---- CORRECTED MULTIPLICATION (TS) ----
            const mul1 = mul32_unsigned(TS_AL, fl);
            const sum  = (mul32_unsigned(TS_AH, fl) + mul32_unsigned(TS_AL, fh)) >>> 0;
            const mul2 = ((sum & 0xFFFF) << 16) >>> 0;
            const mul  = (mul1 + mul2) >>> 0;

            sv = (sv ^ mul) >>> 0;
        }
        result.push((sv ^ r2) >>> 0);
    }
    return result;
}

// ---- os_bits ----
function os_bits(words) {
    let total = 0;
    for (const w of words) {
        if (w === 0) total += 32;
        else {
            return total + 32 - Math.clz32(w);
        }
    }
    return total;
}

// ---- powSolve ----
function powSolve(nonce, difficulty, maxSeconds = 55) {
    const prefix = nonce + ':';
    const start = Date.now();
    let lastLog = 0;
    for (let s = 0; s < 5000000; s++) {
        const now = Date.now();
        if (now - lastLog > 5000) {
            console.log(`PoW progress: ${s} iter, ${(now-start)/1000}s`);
            lastLog = now;
        }
        if (s > 0 && (now - start) > maxSeconds * 1000) {
            console.log(`PoW timeout after ${s} iter`);
            break;
        }
        const hash = ns_hash(prefix + s);
        const bits = os_bits(hash);
        if (bits >= difficulty) {
            console.log(`PoW solved: s=${s}, bits=${bits}, time=${(now-start)/1000}s`);
            return String(s);
        }
    }
    console.log(`PoW failed after ${(Date.now()-start)/1000}s`);
    return null;
}

// ---- Vercel handler ----
export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // --- GET: debug endpoints ---
    if (req.method === 'GET') {
        if (req.query && req.query.compare === '1' && req.query.input) {
            const input = req.query.input;
            const hash = ns_hash(input);
            return res.status(200).json({ input, hash });
        }
        if (req.query && req.query.test === '1') {
            const nonce = req.query.nonce || '336a0283ab9ec4c9bc465782e28e8a78';
            const hash0 = ns_hash(nonce + ':0');
            const bits0 = os_bits(hash0);
            return res.status(200).json({ nonce, hash0, bits0 });
        }
        return res.status(400).json({ 
            error: 'Use POST for solving, or GET with ?test=1&nonce=... or ?compare=1&input=...'
        });
    }

    // --- POST: solve ----
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { nonce, difficulty, timeout = 55 } = req.body;
        if (!nonce || !difficulty) {
            return res.status(400).json({ error: 'Missing nonce or difficulty' });
        }
        const solution = powSolve(nonce, difficulty, timeout);
        return res.status(200).json({ solution });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: e.message });
    }
}

export const maxDuration = 60;
