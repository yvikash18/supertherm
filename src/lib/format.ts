// Source data writes units as "KW" / "KHz"; render them with correct SI casing.
export const si = (s: string) => s.replace(/\bKW\b/g, 'kW').replace(/\bKHz\b/g, 'kHz');
export const tel = (s: string) => s.replace(/[^0-9+]/g, '');
