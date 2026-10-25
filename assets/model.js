export function normalize(value) {
  return String(value ?? '').normalize('NFKC').toLocaleLowerCase('ja').replace(/[\u3041-\u3096]/g, c => String.fromCharCode(c.charCodeAt(0) + 0x60)).trim();
}
export function colorCodes(hex) {
  if (!/^#[0-9a-f]{6}$/i.test(hex ?? '')) return null;
  const rgb = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
  const k = 1 - Math.max(...rgb) / 255;
  const cmyk = [...rgb.map(v => k === 1 ? 0 : (1 - v / 255 - k) / (1 - k)), k].map(v => Math.round(v * 100));
  return { hex: hex.toUpperCase(), rgb: rgb.join(', '), cmyk: cmyk.map(v => `${v}%`).join(', ') };
}
export function filterItems(items, { query = '', category = '', color = '' } = {}) {
  const q = normalize(query);
  if (!q && !category && !color) return items;
  return items.filter(item => {
    const codes = colorCodes(item.colorHex);
    const text = normalize([...Object.values(item).flat(), ...Object.values(codes ?? {})].join(' '));
    return Boolean((q && text.includes(q)) || (category && item.category === category) || (color && item.colorGroup === color));
  });
}
export function httpsUrl(value) {
  try { const url = new URL(value); return url.protocol === 'https:' ? url.href : null; } catch { return null; }
}
