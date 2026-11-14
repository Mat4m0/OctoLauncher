import net from 'node:net';

// Passes only when realmd answers a logon challenge; a plain TCP connect can
// succeed through VPNs and local proxies that accept any connection.

export type ProbeKind =
	| 'timeout'
	| 'refused'
	| 'reset'
	| 'unreachable'
	| 'error';

export type ProbeResult = {
	ok: boolean;
	kind?: ProbeKind;
	attempts: number;
	durationMs: number;
	silent?: boolean;
};

// account names are letters and digits only, so realmd answers "unknown account"
const PROBE_ACCOUNT = 'OCTO-PROBE';

export const logonChallenge = (account: string = PROBE_ACCOUNT): Buffer => {
	const name = Buffer.from(account.toUpperCase(), 'ascii');
	const body = Buffer.alloc(30 + name.length);
	body.write('WoW\0', 0, 'ascii'); // game name
	body.writeUInt8(1, 4); // version 1.12.1
	body.writeUInt8(12, 5);
	body.writeUInt8(1, 6);
	body.writeUInt16LE(5875, 7); // build
	body.write('68x\0', 9, 'ascii'); // platform "x86", byte-reversed
	body.write('niW\0', 13, 'ascii'); // os "Win", byte-reversed
	body.write('SUne', 17, 'ascii'); // country "enUS", byte-reversed
	body.writeUInt32LE(0, 21); // timezone bias
	body.writeUInt32LE(0, 25); // client ip
	body.writeUInt8(name.length, 29);
	name.copy(body, 30);
	const head = Buffer.alloc(4);
	head.writeUInt8(0x00, 0); // CMD_AUTH_LOGON_CHALLENGE
	head.writeUInt8(0x03, 1); // protocol version
	head.writeUInt16LE(body.length, 2);
	return Buffer.concat([head, body]);
};

export const PROBE_PORT = 3724;
export const PROBE_ATTEMPT_TIMEOUT_MS = 3_500;
export const PROBE_MAX_ATTEMPTS = 2;
const PROBE_MIN_ATTEMPT_MS = 1_200;

const classify = (e: NodeJS.ErrnoException): ProbeKind => {
	switch (e.code) {
		case 'ECONNREFUSED':
			return 'refused';
		case 'ECONNRESET':
		case 'EPIPE':
			return 'reset';
		case 'EHOSTUNREACH':
		case 'ENETUNREACH':
		case 'EADDRNOTAVAIL':
		case 'ENOTFOUND':
		case 'EAI_AGAIN':
			return 'unreachable';
		case 'ETIMEDOUT':
			return 'timeout';
		default:
			return 'error';
	}
};

type Attempt = { ok: boolean; kind?: ProbeKind; silent?: boolean };

const connectOnce = (
	host: string,
	port: number,
	timeoutMs: number
): Promise<Attempt> =>
	new Promise(resolve => {
		let settled = false;
		let connected = false;
		let got = Buffer.alloc(0);
		const sock = net.connect({ host, port, family: 4 });
		const finish = (r: Attempt) => {
			if (settled) return;
			settled = true;
			clearTimeout(timer);
			sock.destroy();
			resolve(r);
		};
		const timer = setTimeout(
			() => finish({ ok: false, kind: 'timeout', silent: connected }),
			Math.max(1, timeoutMs)
		);
		sock.once('connect', () => {
			connected = true;
			sock.write(logonChallenge());
		});
		sock.on('data', (chunk: Buffer) => {
			got = Buffer.concat([got, chunk]);
			if (got.length >= 3)
				finish(got[0] === 0x00 ? { ok: true } : { ok: false, kind: 'error' });
		});
		sock.once('close', () =>
			finish({ ok: false, kind: 'reset', silent: connected })
		);
		sock.once('error', e =>
			finish({ ok: false, kind: classify(e as NodeJS.ErrnoException) })
		);
	});

// never throws; attempts === 0 means the budget left no time to try
export const probeAuthEdge = async (
	host: string,
	budgetMs: number,
	port: number = PROBE_PORT
): Promise<ProbeResult> => {
	const started = Date.now();
	let attempts = 0;
	let last: Attempt = { ok: false, kind: 'timeout' };
	try {
		while (attempts < PROBE_MAX_ATTEMPTS) {
			const left = budgetMs - (Date.now() - started);
			if (left < PROBE_MIN_ATTEMPT_MS) break;
			attempts++;
			last = await connectOnce(
				host,
				port,
				Math.min(PROBE_ATTEMPT_TIMEOUT_MS, left)
			);
			if (last.ok || last.kind === 'timeout') break;
		}
	} catch {
		last = { ok: false, kind: 'error' };
	}
	return {
		ok: last.ok,
		kind: last.ok ? undefined : last.kind,
		attempts,
		durationMs: Date.now() - started,
		...(last.silent ? { silent: true } : {})
	};
};
