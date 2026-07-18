// api/pow.js
// Works with Next.js (pages/api) or standalone Vercel function

// === ns_hash – exact PHP translation ===
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

    // Primary round
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

    // 8 rounds
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

    // Generate table T
    const T = new Array(512).fill(0);
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

    // Two passes over T
    for (let o = 0; o < 2; o++) {
        for (let s = 0; s < 512; s++) {
            const ts = T[s] >>> 0;
            const idx = ts & 511;
            let d = (ts + T[idx]) >>> 0;
            d = ((d << 13) | (d >>> 19)) >>> 0;
            const b = T[(s + 1) & 511] >>> 0;
            const bh = (b >>> 16) & 0xFFFF;
            const bl = b & 0xFFFF;
            const mul = ((RS_AL * bl) + (((RS_AH * bl + RS_AL * bh) & 0xFFFF) << 16)) >>> 0;
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
            const mul = ((TS_AL * fl) + (((TS_AH * fl + TS_AL * fh) & 0xFFFF) << 16)) >>> 0;
            sv = (sv ^ mul) >>> 0;
        }
        result.push((sv ^ r2) >>> 0);
    }
    return result;
}

function os_bits(words) {
    let total = 0;
    for (let w of words) {
        if (w === 0) total += 32;
        else {
            // clz32
            return total + 32 - Math.clz32(w);
        }
    }
    return total;
}

function powSolve(nonce, difficulty, maxSeconds = 55) {
    const prefix = nonce + ':';
    const start = Date.now();
    for (let s = 0; s < 5000000; s++) {
        if (s % 5000 === 0 && (Date.now() - start) > maxSeconds * 1000) {
            break;
        }
        const hash = ns_hash(prefix + s);
        const bits = os_bits(hash);
        if (bits >= difficulty) {
            return String(s);
        }
    }
    return null;
}

// --- Vercel handler ---
export default async function handler(req, res) {
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
        return res.status(500).json({ error: e.message });
    }
}

// Set Vercel max duration (works for Next.js, not for plain functions – use vercel.json)
export const maxDuration = 60; // seconds
