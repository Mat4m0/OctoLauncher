// Reads the first icon group out of a Windows exe's resources and returns it as an .ico file

const RT_ICON = 3;
const RT_GROUP_ICON = 14;
const IS_DIR = 0x80000000;

export const exeIcon = (exe: Buffer): Buffer | undefined => {
	try {
		const pe = exe.readUInt32LE(0x3c);
		if (exe.readUInt32LE(pe) !== 0x00004550) return undefined;
		const coff = pe + 4;
		const sectionCount = exe.readUInt16LE(coff + 2);
		const optionalSize = exe.readUInt16LE(coff + 16);
		const optional = coff + 20;
		const dataDirs = optional + (exe.readUInt16LE(optional) === 0x20b ? 112 : 96);
		const rsrcRva = exe.readUInt32LE(dataDirs + 2 * 8);
		if (!rsrcRva) return undefined;

		const sections = Array.from({ length: sectionCount }, (_, i) => {
			const s = optional + optionalSize + i * 40;
			return {
				rva: exe.readUInt32LE(s + 12),
				size: Math.max(exe.readUInt32LE(s + 8), exe.readUInt32LE(s + 16)),
				raw: exe.readUInt32LE(s + 20)
			};
		});
		const fileOffset = (rva: number) => {
			const s = sections.find(s => rva >= s.rva && rva < s.rva + s.size);
			return s ? rva - s.rva + s.raw : -1;
		};
		const root = fileOffset(rsrcRva);
		if (root < 0) return undefined;

		const entries = (dir: number) => {
			const count = exe.readUInt16LE(dir + 12) + exe.readUInt16LE(dir + 14);
			return Array.from({ length: count }, (_, i) => ({
				id: exe.readUInt32LE(dir + 16 + i * 8),
				target: exe.readUInt32LE(dir + 20 + i * 8)
			}));
		};
		const subDir = (target: number) => root + (target & ~IS_DIR);
		// follow the first entry of each level (name, then language) down to the data
		const data = (target: number): Buffer | undefined => {
			let t = target;
			while (t & IS_DIR) {
				const first = entries(subDir(t))[0];
				if (!first) return undefined;
				t = first.target;
			}
			const at = fileOffset(exe.readUInt32LE(root + t));
			return at < 0 ? undefined : exe.subarray(at, at + exe.readUInt32LE(root + t + 4));
		};
		const typeDir = (type: number) => entries(root).find(e => e.id === type);

		const groups = typeDir(RT_GROUP_ICON);
		const icons = typeDir(RT_ICON);
		if (!groups || !icons) return undefined;
		const firstGroup = entries(subDir(groups.target))[0];
		const group = firstGroup && data(firstGroup.target);
		if (!group) return undefined;
		const iconById = new Map(entries(subDir(icons.target)).map(e => [e.id, e.target]));

		// group entries are 14 bytes (ends in the RT_ICON id), .ico entries 16 (ends in a file offset)
		const images: { head: Buffer; body: Buffer }[] = [];
		for (let i = 0; i < group.readUInt16LE(4); i++) {
			const e = 6 + i * 14;
			const target = iconById.get(group.readUInt16LE(e + 12));
			const body = target === undefined ? undefined : data(target);
			if (body) images.push({ head: group.subarray(e, e + 8), body });
		}
		if (!images.length) return undefined;

		const header = Buffer.alloc(6);
		header.writeUInt16LE(1, 2);
		header.writeUInt16LE(images.length, 4);
		let offset = 6 + images.length * 16;
		const dir = images.map(({ head, body }) => {
			const d = Buffer.alloc(16);
			head.copy(d, 0);
			d.writeUInt32LE(body.length, 8);
			d.writeUInt32LE(offset, 12);
			offset += body.length;
			return d;
		});
		return Buffer.concat([header, ...dir, ...images.map(i => i.body)]);
	} catch {
		return undefined;
	}
};
