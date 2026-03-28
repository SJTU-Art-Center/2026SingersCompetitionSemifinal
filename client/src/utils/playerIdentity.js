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
