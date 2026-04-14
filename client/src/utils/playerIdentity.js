const normalizeDigits = (value) => {
    if (value === null || value === undefined) return '';
    return String(value).replace(/\D/g, '');
};

export const formatPlayerNumber = (player) => {
    const rawNumber = normalizeDigits(player?.number);
    if (rawNumber.length > 0) {
        return rawNumber.slice(-3).padStart(3, '0');
    }

    const fallbackId = normalizeDigits(player?.id);
    if (fallbackId.length > 0) {
        return fallbackId.slice(-3).padStart(3, '0');
    }

    return '---';
};

/**
 * 按选手序号升序：优先使用 player.number（数字），无则退回 id。
 * 与 {@link formatPlayerNumber} 的取值优先级一致。
 */
export function comparePlayersByContestantNumber(a, b) {
    const na = normalizeDigits(a?.number);
    const nb = normalizeDigits(b?.number);
    const keyA = na.length > 0 ? parseInt(na, 10) : a.id;
    const keyB = nb.length > 0 ? parseInt(nb, 10) : b.id;
    if (keyA !== keyB) return keyA - keyB;
    return a.id - b.id;
}

export const getPlayerName = (player, fallback = '未知选手') => {
    const name = player?.name;
    if (typeof name === 'string' && name.trim()) {
        return name.trim();
    }
    return fallback;
};

export const getPlayerSingleLine = (player, fallback = '未知选手') => {
    return `${formatPlayerNumber(player)} ${getPlayerName(player, fallback)}`;
};
