/**
 * Parse a player name into display lines.
 * If the name contains Chinese characters followed by Latin characters,
 * split into two lines (e.g. "胡梦茜Trezzi Valentina" → ["胡梦茜", "Trezzi Valentina"])
 */
export function parseDisplayName(name) {
    if (!name) return [''];

    // Match: leading CJK/middle-dot block + trailing Latin block
    const match = name.match(/^([\u4e00-\u9fff\u3400-\u4dbf\u00b7·]+)\s*([A-Za-z].+)$/);
    if (match) {
        return [match[1], match[2]];
    }

    return [name];
}

/**
 * Estimate visual width of text in character-width units.
 * Simpler model: CJK ≈ 1, Latin upper ≈ 0.7, Latin lower ≈ 0.55, space/dot ≈ 0.3
 */
function estimateVisualWidth(text) {
    if (!text) return 0;
    return [...text].reduce((acc, ch) => {
        if (/[\u4e00-\u9fff\u3400-\u4dbf]/.test(ch)) return acc + 1;
        if (/[A-Z]/.test(ch)) return acc + 0.7;
        if (/[a-z]/.test(ch)) return acc + 0.55;
        if (/[\u00b7·\s]/.test(ch)) return acc + 0.3;
        return acc + 0.6;
    }, 0);
}

/**
 * Calculate a font-size scale factor to keep text on one line.
 * @param {string} text - The text to measure
 * @param {number} maxWidth - Max visual width in character-width units before shrinking
 * @returns {number} Scale factor (0.65 to 1.0)
 */
export function getNameScale(text, maxWidth = 7) {
    const w = estimateVisualWidth(text);
    if (w <= maxWidth) return 1;
    return Math.max(0.65, maxWidth / w);
}
