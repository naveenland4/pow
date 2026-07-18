// api/pow.js
// SHA-256 PoW solver for Vercel (or any Node.js server)

import crypto from 'crypto';

function leadingZeroBits(buffer) {
    let bits = 0;
    for (const byte of buffer) {
        if (byte === 0) {
            bits += 8;
        } else {
            bits += 8 - Math.clz32(byte);
            break;
        }
    }
    return bits;
}

function powSolve(nonce, difficulty, maxSeconds = 30) {
    const prefix = nonce + ':';
    const start = Date.now();
    let lastLog = 0;
    for (let s = 0; s < 20000000; s++) {
        const now = Date.now();
        if (now - lastLog > 5000) {
            console.log(`PoW progress: ${s} iter, ${(now - start)/1000}s`);
            lastLog = now;
        }
        if (now - start > maxSeconds * 1000) {
            console.log(`PoW timeout after ${s} iterations`);
            break;
        }
        const hash = crypto.createHash('sha256').update(prefix + s).digest();
        const bits = leadingZeroBits(hash);
        if (bits >= difficulty) {
            console.log(`PoW solved: s=${s}, bits=${bits}, time=${(now - start)/1000}s`);
            return String(s);
        }
    }
    console.log(`PoW failed after ${(Date.now() - start)/1000}s`);
    return null;
}

export default async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { nonce, difficulty, timeout = 30 } = req.body;
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

// Vercel max duration (60 seconds)
export const maxDuration = 60;
