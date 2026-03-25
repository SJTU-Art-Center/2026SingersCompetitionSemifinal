import React from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { getFullAvatarUrl } from '../../utils/avatar';
import { deriveFinalSettlement, getPlayerLatestScore } from '../../utils/finalSettlement';

const TOTAL_SUBCOLS = 16;
const BOARD_SAFE_LEFT = 6;
const BOARD_SAFE_WIDTH = 88;

const ROW_CENTER_Y = {
    2: 25,
    4: 56,
    6: 82
};

const TITLE_CENTER_Y = {
    1: 10,
    3: 55,
    5: 69
};

const MOTION = {
    layout: { duration: 0.66, ease: [0.4, 0, 0.2, 1] },
    detail: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
    exitDown: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
};


const STAGE_OUT_DURATION_MS = 420;
const STAGE_IN_SETTLE_MS = 460;

const HERO_SIZE = { width: 186, height: 232 };
const COMPACT_HEIGHT = 106;
const COMPACT_DENSE_HEIGHT = 92;

const FALLBACK_AVATAR = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><rect width="120" height="120" fill="#1f2937"/><circle cx="60" cy="46" r="22" fill="#94a3b8"/><rect x="28" y="78" width="64" height="28" rx="14" fill="#94a3b8"/></svg>')}`;

const handleAvatarError = (event) => {
    event.currentTarget.onerror = null;
    event.currentTarget.src = FALLBACK_AVATAR;
};

const getSlotWidth = (colSpan, dense = false) => {
    const slotPercent = (BOARD_SAFE_WIDTH / TOTAL_SUBCOLS) * colSpan;
    const gapOffset = dense ? 6 : 10;
    return `calc(${slotPercent}% - ${gapOffset}px)`;
};

const HERO_STAGE1_SIZE = { width: getSlotWidth(5), height: '50%' };
const HERO_STAGE2_SIZE = { width: getSlotWidth(5.5), height: '60%' };
const STAGE5_CARD_SIZE = { width: getSlotWidth(2), height: '20%' };
const STAGE6_CARD_SIZE = { width: getSlotWidth(3), height: 94 };
const STAGE7_CARD_SIZE = { width: getSlotWidth(3), height: 102 };
const COMPACT_SIZE = { width: getSlotWidth(2), height: COMPACT_HEIGHT };
const COMPACT_DENSE_SIZE = { width: getSlotWidth(1, true), height: COMPACT_DENSE_HEIGHT };

const clampStage = (value) => {
    const stage = Number(value);
    if (!Number.isFinite(stage)) return 1;
    if (stage < 1) return 1;
    if (stage > 7) return 7;
    return Math.floor(stage);
};

const toneToClass = (tone) => {
    if (tone === 'demon') return 'border-cyan-500/80 bg-cyan-900/25';
    if (tone === 'master') return 'border-emerald-600/80 bg-emerald-900/25';
    if (tone === 'challenger') return 'border-teal-700/80 bg-teal-900/20';
    if (tone === 'pending') return 'border-slate-600/90 bg-slate-900/55';
    return 'border-teal-600/85 bg-teal-900/25';
};

const statusToClass = (statusTone) => {
    if (statusTone === 'pending') return 'bg-slate-700/60 border-slate-500 text-teal-200';
    return 'bg-emerald-600/55 border-emerald-400 text-emerald-100';
};

const buildCenteredStarts = (count, colSpan, totalCols = TOTAL_SUBCOLS) => {
    if (count <= 0) return [];

    const maxSlots = Math.floor(totalCols / colSpan);
    const clampedCount = Math.min(count, maxSlots);
    const totalSpan = clampedCount * colSpan;
    const start = Math.floor((totalCols - totalSpan) / 2) + 1;

    return Array.from({ length: clampedCount }, (_, index) => start + index * colSpan);
};

const getDensityForCount = (count) => {
    if (count > 12) {
        return { colSpan: 1, width: COMPACT_DENSE_SIZE.width, height: COMPACT_DENSE_SIZE.height };
    }

    if (count > 8) {
        return { colSpan: 1, width: COMPACT_DENSE_SIZE.width, height: COMPACT_DENSE_SIZE.height };
    }

    return { colSpan: 2, width: COMPACT_SIZE.width, height: COMPACT_SIZE.height };
};

const makePlacement = ({
    row,
    col,
    colSpan,
    mode,
    tone,
    showScore,
    showStatus,
    statusLabel,
    statusTone,
    width,
    height,
    z,
    scale = 1,
    appearDelay = 0,
    topPct = null,
    safeLeft = BOARD_SAFE_LEFT,
    safeWidth = BOARD_SAFE_WIDTH,
    minReservedMetaHeight = null,
    emphasis = 1
}) => {
    return {
        row,
        col,
        colSpan,
        mode,
        tone,
        showScore,
        showStatus,
        statusLabel,
        statusTone,
        width,
        height,
        z,
        scale,
        appearDelay,
        topPct,
        safeLeft,
        safeWidth,
        minReservedMetaHeight,
        emphasis
    };
};

const toCenterXPct = (col, colSpan) => {
    const local = ((col - 1) + colSpan / 2) / TOTAL_SUBCOLS;
    return BOARD_SAFE_LEFT + local * BOARD_SAFE_WIDTH;
};

const buildEvenTopPercents = (rowCount, minTop = 22, maxTop = 84) => {
    if (rowCount <= 1) return [(minTop + maxTop) / 2];
    const step = (maxTop - minTop) / (rowCount - 1);
    return Array.from({ length: rowCount }, (_, index) => minTop + index * step);
};

const getTitleRows = ({ stage, advancedMasters }) => {
    if (stage === 1) return [{ key: 's1', text: '大魔王登场', row: 1 }];
    if (stage === 2) return [{ key: 's2', text: '大魔王登场', row: 1 }];
    if (stage === 3) {
        return [
            { key: 's3m', text: '擂主', row: 1 },
            { key: 's3c', text: '攻擂者', row: 3 }
        ];
    }

    if (stage === 4) {
        if (advancedMasters.length > 0) {
            return [
                { key: 's4a', text: '晋级擂主', row: 1, topPct: 2 },
                { key: 's4p', text: '待定擂主', row: 3, topPct: 43 },
                { key: 's4c', text: '攻擂者', row: 5, topPct: 74 }
            ];
        }
        return [
            { key: 's4p-only', text: '待定擂主', row: 1, topPct: 43 },
            { key: 's4c-only', text: '攻擂者', row: 3, topPct: 74 }
        ];
    }

    if (stage === 5) {
        return [{ key: 's5-zone', text: '待定区', row: 1 }];
    }

    if (stage === 6) {
        return [
            { key: 's6a', text: '待定区晋级', row: 1, topPct: 5 },
            { key: 's6n', text: '待定区未晋级', row: 3, topPct: 50 }
        ];
    }

    return [{ key: 's7a', text: '最终晋级阵容', row: 1, topPct: 8 }];
};

const placeCenteredRow = ({
    target,
    players,
    row,
    tone,
    showScore,
    showStatus,
    statusLabel,
    statusTone,
    z,
    width,
    height,
    topPct,
    safeLeft,
    safeWidth,
    minReservedMetaHeight = null,
    scale = 1
}) => {
    if (!players || players.length === 0) return;

    const density = getDensityForCount(players.length);
    const visiblePlayers = players.slice(0, Math.floor(TOTAL_SUBCOLS / density.colSpan));
    const starts = buildCenteredStarts(visiblePlayers.length, density.colSpan, TOTAL_SUBCOLS);

    visiblePlayers.forEach((player, index) => {
        target.set(player.id, makePlacement({
            row,
            col: starts[index],
            colSpan: density.colSpan,
            mode: 'compact',
            tone,
            showScore,
            showStatus,
            statusLabel,
            statusTone,
            width: width || density.width,
            height: height || density.height,
            z,
            topPct,
            safeLeft,
            safeWidth,
            minReservedMetaHeight,
            scale,
            appearDelay: index * 0.022
        }));
    });
};

const placeFixedFiveColGrid = ({
    target,
    players,
    topPercents,
    colSpan = 3,
    tone,
    showScore,
    showStatus,
    statusLabel,
    statusTone,
    z,
    width,
    height,
    rowStart = 2,
    minReservedMetaHeight = null,
    scale = 1
}) => {
    if (!players || players.length === 0 || !topPercents || topPercents.length === 0) return;

    const starts = buildCenteredStarts(5, colSpan, TOTAL_SUBCOLS);
    const maxCount = topPercents.length * starts.length;
    const visiblePlayers = players.slice(0, maxCount);

    visiblePlayers.forEach((player, index) => {
        const rowIndex = Math.floor(index / starts.length);
        const colIndex = index % starts.length;
        target.set(player.id, makePlacement({
            row: rowStart + rowIndex,
            col: starts[colIndex],
            colSpan,
            mode: 'compact',
            tone,
            showScore,
            showStatus,
            statusLabel,
            statusTone,
            width,
            height,
            z: Math.max(1, z - rowIndex),
            topPct: topPercents[rowIndex],
            minReservedMetaHeight,
            scale,
            appearDelay: index * 0.018
        }));
    });
};

const placeTwoCenteredRows = ({
    target,
    players,
    topRowPct,
    bottomRowPct,
    tone,
    showScore,
    showStatus,
    statusLabel,
    statusTone,
    z,
    colSpan,
    width,
    height,
    minReservedMetaHeight = null,
    scale = 1
}) => {
    if (!players || players.length === 0) return;

    const total = players.length;
    const topCount = Math.ceil(total / 2);
    const bottomCount = total - topCount;
    const topPlayers = players.slice(0, topCount);
    const bottomPlayers = players.slice(topCount);

    const placeRow = (rowPlayers, topPct, rowZ, row) => {
        if (rowPlayers.length === 0) return;
        const starts = buildCenteredStarts(rowPlayers.length, colSpan, TOTAL_SUBCOLS);
        rowPlayers.forEach((player, index) => {
            target.set(player.id, makePlacement({
                row,
                col: starts[index],
                colSpan,
                mode: 'compact',
                tone,
                showScore,
                showStatus,
                statusLabel,
                statusTone,
                width,
                height,
                z: rowZ,
                topPct,
                minReservedMetaHeight,
                scale,
                appearDelay: index * 0.02
            }));
        });
    };

    placeRow(topPlayers, topRowPct, z, 4);
    placeRow(bottomPlayers, bottomRowPct, Math.max(1, z - 1), 6);
};

const getStagePlacements = ({
    stage,
    demonKings,
    advancedDemonKings,
    masterRows,
    advancedMasters,
    pendingMasters,
    challengersByPair,
    pendingCandidates,
    stage5PendingPool,
    stage6PromotedPool,
    stage6NonPromotedPool,
    finalTop10,
    stage6BottomPool
}) => {
    const placements = new Map();

    const setHero = (player, col, heroSize = HERO_SIZE, heroColSpan = 4) => {
        if (!player) return;
        placements.set(player.id, makePlacement({
            row: 4,
            col,
            colSpan: heroColSpan,
            mode: 'hero',
            tone: 'demon',
            showScore: false,
            showStatus: false,
            statusLabel: '',
            statusTone: 'success',
            width: heroSize.width,
            height: heroSize.height,
            z: 8
        }));
    };

    if (stage === 1 || stage === 2) {
        const heroCols = [3, 10];
        demonKings.forEach((player, index) => {
            const isAdvanced = advancedDemonKings.some((item) => item.id === player.id);
            const hasDkScore = player.scoreDK !== undefined && player.scoreDK !== null && player.scoreDK !== '';

            const heroSize = stage === 1 ? HERO_STAGE1_SIZE : HERO_STAGE2_SIZE;
            setHero(player, heroCols[index] || (stage === 1 ? 3 : 3), heroSize, 5);
            const existing = placements.get(player.id);
            placements.set(player.id, {
                ...existing,
                showScore: stage >= 2 && hasDkScore,
                showStatus: stage >= 2 && hasDkScore,
                statusLabel: isAdvanced ? '晋级' : '待定',
                statusTone: isAdvanced ? 'success' : 'pending'
            });
        });

        return placements;
    }

    if (stage === 3) {
        const strictStarts = Array.from({ length: 8 }, (_, index) => index * 2 + 1);
        masterRows.forEach((row, index) => {
            const start = strictStarts[index] || 1;

                placements.set(row.master.id, makePlacement({
                row: 2,
                col: start,
                colSpan: 2,
                mode: 'compact',
                tone: 'master',
                showScore: false,
                showStatus: false,
                statusLabel: '',
                statusTone: 'success',
                    width: COMPACT_SIZE.width,
                    height: '18%',
                    z: 6
                }));

            if (row.challenger) {
                placements.set(row.challenger.id, makePlacement({
                    row: 4,
                    col: start,
                    colSpan: 2,
                    mode: 'compact',
                    tone: 'challenger',
                    showScore: false,
                    showStatus: false,
                    statusLabel: '',
                    statusTone: 'success',
                    width: COMPACT_SIZE.width,
                    height: '18%',
                    z: 5,
                    topPct: 70
                }));
            }
        });

        return placements;
    }

    if (stage === 4) {
        if (advancedMasters.length > 0) {
            placeCenteredRow({
                target: placements,
                players: advancedMasters,
                row: 2,
                tone: 'success',
                showScore: true,
                showStatus: true,
                statusLabel: '晋级',
                statusTone: 'success',
                z: 7,
                width: COMPACT_SIZE.width,
                height: '25%',
                topPct: 22,
                minReservedMetaHeight: 44,
                scale: 1.08
            });

            if (pendingMasters.length > 0) {
                placeCenteredRow({
                    target: placements,
                    players: pendingMasters,
                    row: 4,
                    tone: 'pending',
                    showScore: false,
                    showStatus: false,
                    statusLabel: '',
                    statusTone: 'pending',
                    z: 6,
                    width: COMPACT_SIZE.width,
                    height: '18%',
                    topPct: 58,
                    minReservedMetaHeight: 44
                });
            }

            placeCenteredRow({
                target: placements,
                players: challengersByPair,
                row: 6,
                tone: 'challenger',
                showScore: false,
                showStatus: false,
                statusLabel: '',
                statusTone: 'pending',
                z: 4,
                width: COMPACT_SIZE.width,
                height: '18%',
                topPct: 89,
                minReservedMetaHeight: 42
            });

            return placements;
        }

        placeCenteredRow({
            target: placements,
            players: pendingMasters,
            row: 2,
            tone: 'pending',
            showScore: false,
            showStatus: false,
            statusLabel: '',
            statusTone: 'pending',
            z: 6,
            width: COMPACT_SIZE.width,
            height: '18%',
            topPct: 58,
            minReservedMetaHeight: 44
        });

        placeCenteredRow({
            target: placements,
            players: challengersByPair,
            row: 4,
            tone: 'challenger',
            showScore: false,
            showStatus: false,
            statusLabel: '',
            statusTone: 'pending',
            z: 4,
            width: COMPACT_SIZE.width,
            height: '18%',
            topPct: 89,
            minReservedMetaHeight: 42
        });

        return placements;
    }

    if (stage === 5) {
        placeTwoCenteredRows({
            target: placements,
            players: stage5PendingPool,
            topRowPct: 35,
            bottomRowPct: 65,
            tone: 'pending',
            showScore: false,
            showStatus: false,
            statusLabel: '',
            statusTone: 'pending',
            z: 7,
            colSpan: 2,
            width: STAGE5_CARD_SIZE.width,
            height: STAGE5_CARD_SIZE.height,
            minReservedMetaHeight: null
        });

        return placements;
    }

    if (stage === 6) {
        placeCenteredRow({
            target: placements,
            players: stage6PromotedPool,
            row: 2,
            tone: 'success',
            showScore: true,
            showStatus: true,
            statusLabel: '晋级',
            statusTone: 'success',
            z: 8,
            width: '10%',
            height: '25%',
            topPct: 25,
            safeLeft: 0,
            safeWidth: 100,
            minReservedMetaHeight: 42,
            scale: 1.03
        });

        placeCenteredRow({
            target: placements,
            players: stage6NonPromotedPool,
            row: 4,
            tone: 'pending',
            showScore: true,
            showStatus: true,
            statusLabel: '未晋级',
            statusTone: 'pending',
            z: 6,
            width: '10%',
            height: '25%',
            topPct: 70,
            safeLeft: 0,
            safeWidth: 100,
            minReservedMetaHeight: 42
        });

        return placements;
    }

    placeFixedFiveColGrid({
        target: placements,
        players: finalTop10,
        topPercents: [32, 71],
        tone: 'success',
        showScore: true,
        showStatus: true,
        statusLabel: '晋级',
        statusTone: 'success',
        z: 8,
        width: '14%',
        height: '35%',
        rowStart: 2,
        minReservedMetaHeight: 42,
        scale: 1.03
    });

    return placements;
};

const normalizePlacements = (placementMap) => {
    const occupied = new Set();
    const normalized = new Map();

    const occupy = (row, col, colSpan) => {
        for (let i = 0; i < colSpan; i += 1) {
            occupied.add(`${row}:${col + i}`);
        }
    };

    const canOccupy = (row, col, colSpan) => {
        if (col < 1 || col + colSpan - 1 > TOTAL_SUBCOLS) return false;
        for (let i = 0; i < colSpan; i += 1) {
            if (occupied.has(`${row}:${col + i}`)) return false;
        }
        return true;
    };

    placementMap.forEach((placement, id) => {
        let targetCol = placement.col;
        if (targetCol === undefined || targetCol === null) return;

        if (!canOccupy(placement.row, targetCol, placement.colSpan)) {
            const step = placement.colSpan;
            for (let col = 1; col <= TOTAL_SUBCOLS - placement.colSpan + 1; col += step) {
                if (canOccupy(placement.row, col, placement.colSpan)) {
                    targetCol = col;
                    break;
                }
            }
        }

        if (!canOccupy(placement.row, targetCol, placement.colSpan)) return;

        const safePlacement = { ...placement, col: targetCol };
        normalized.set(id, safePlacement);
        occupy(safePlacement.row, safePlacement.col, safePlacement.colSpan);
    });

    return normalized;
};

const buildBasePlacementMap = ({ demonKings, masterRows, pendingCandidates }) => {
    const map = new Map();

    const heroCols = buildCenteredStarts(2, 4, TOTAL_SUBCOLS);
    demonKings.forEach((player, index) => {
        map.set(player.id, makePlacement({
            row: 4,
            col: heroCols[index] || 4,
            colSpan: 4,
            mode: 'hero',
            tone: 'demon',
            showScore: false,
            showStatus: false,
            statusLabel: '',
            statusTone: 'success',
            width: HERO_SIZE.width,
            height: HERO_SIZE.height,
            z: 5
        }));
    });

    const strictStarts = Array.from({ length: 8 }, (_, index) => index * 2 + 1);
    masterRows.forEach((row, index) => {
        const start = strictStarts[index] || 1;
        map.set(row.master.id, makePlacement({
            row: 2,
            col: start,
            colSpan: 2,
            mode: 'compact',
            tone: 'master',
            showScore: false,
            showStatus: false,
            statusLabel: '',
            statusTone: 'success',
            width: COMPACT_SIZE.width,
            height: COMPACT_SIZE.height,
            z: 4
        }));

        if (row.challenger) {
            map.set(row.challenger.id, makePlacement({
                row: 4,
                col: start,
                colSpan: 2,
                mode: 'compact',
                tone: 'challenger',
                showScore: false,
                showStatus: false,
                statusLabel: '',
                statusTone: 'success',
                width: COMPACT_SIZE.width,
                height: COMPACT_SIZE.height,
                z: 3
            }));
        }
    });

    placeCenteredRow({
        target: map,
        players: pendingCandidates,
        row: 6,
        tone: 'pending',
        showScore: false,
        showStatus: false,
        statusLabel: '',
        statusTone: 'pending',
        z: 1
    });

    return normalizePlacements(map);
};

export default function Resurrection({ gameState }) {
    const stageIndex = clampStage(gameState.screenFinalStageIndex ?? gameState.finalStageIndex ?? 1);
    const pkMatches = gameState.pkMatches || [];

    const {
        sortedByRound1,
        demonKingThreshold,
        demonKings,
        advancedDemonKings,
        masterRows,
        advancedMasters,
        pendingMasters,
        pendingDemonKings,
        challengersByPair,
        pendingCandidates,
        finalTop10
    } = React.useMemo(() => deriveFinalSettlement(gameState), [gameState]);

    const playerById = React.useMemo(() => {
        return new Map(sortedByRound1.map((player) => [player.id, player]));
    }, [sortedByRound1]);

    const stage5PendingPool = React.useMemo(() => {
        const merged = [...pendingDemonKings, ...pendingMasters, ...challengersByPair];
        const seen = new Set();
        const deduped = [];
        merged.forEach((player) => {
            if (!player || seen.has(player.id)) return;
            seen.add(player.id);
            deduped.push(player);
        });
        return deduped;
    }, [pendingDemonKings, pendingMasters, challengersByPair]);

    const stage6BottomPool = React.useMemo(() => {
        const topSet = new Set(finalTop10.map((player) => player.id));
        return sortedByRound1.filter((player) => !topSet.has(player.id)).slice(0, 20);
    }, [finalTop10, sortedByRound1]);

    const stage6PromotedPool = React.useMemo(() => {
        const topSet = new Set(finalTop10.map((player) => player.id));
        return stage5PendingPool.filter((player) => topSet.has(player.id));
    }, [stage5PendingPool, finalTop10]);

    const stage6NonPromotedPool = React.useMemo(() => {
        const promotedSet = new Set(stage6PromotedPool.map((player) => player.id));
        return stage5PendingPool.filter((player) => !promotedSet.has(player.id));
    }, [stage5PendingPool, stage6PromotedPool]);

    const [visualStage, setVisualStage] = React.useState(stageIndex);
    const [transitionState, setTransitionState] = React.useState({
        phase: 'idle',
        from: stageIndex,
        to: stageIndex
    });

    React.useEffect(() => {
        if (stageIndex === visualStage) {
            if (transitionState.phase !== 'idle') {
                setTransitionState({ phase: 'idle', from: stageIndex, to: stageIndex });
            }
            return;
        }

        const fromStage = visualStage;
        let inTimer = null;
        setTransitionState({ phase: 'out', from: fromStage, to: stageIndex });

        const outTimer = window.setTimeout(() => {
            setVisualStage(stageIndex);
            setTransitionState({ phase: 'in', from: fromStage, to: stageIndex });

            inTimer = window.setTimeout(() => {
                setTransitionState({ phase: 'idle', from: stageIndex, to: stageIndex });
            }, STAGE_IN_SETTLE_MS);
        }, STAGE_OUT_DURATION_MS);

        return () => {
            window.clearTimeout(outTimer);
            if (inTimer) window.clearTimeout(inTimer);
        };
    }, [stageIndex, visualStage, transitionState.phase]);

    const activeIds = React.useMemo(() => {
        return new Set([
            ...demonKings.map((player) => player.id),
            ...masterRows.map((row) => row.master.id),
            ...challengersByPair.map((player) => player.id),
            ...stage5PendingPool.map((player) => player.id),
            ...finalTop10.map((player) => player.id),
            ...stage6BottomPool.map((player) => player.id),
            ...stage6PromotedPool.map((player) => player.id),
            ...stage6NonPromotedPool.map((player) => player.id),
        ]);
    }, [demonKings, masterRows, challengersByPair, stage5PendingPool, finalTop10, stage6BottomPool, stage6PromotedPool, stage6NonPromotedPool]);

    const basePlacementMap = React.useMemo(() => {
        return buildBasePlacementMap({ demonKings, masterRows, pendingCandidates });
    }, [demonKings, masterRows, pendingCandidates]);

    const visualPlacementMap = React.useMemo(() => {
        const raw = getStagePlacements({
            stage: visualStage,
            demonKings,
            advancedDemonKings,
            masterRows,
            advancedMasters,
            pendingMasters,
            challengersByPair,
            pendingCandidates,
            stage5PendingPool,
            stage6PromotedPool,
            stage6NonPromotedPool,
            finalTop10,
            stage6BottomPool
        });
        return normalizePlacements(raw);
    }, [
        visualStage,
        demonKings,
        advancedDemonKings,
        masterRows,
        advancedMasters,
        pendingMasters,
        challengersByPair,
        pendingCandidates,
        stage5PendingPool,
        stage6PromotedPool,
        stage6NonPromotedPool,
        finalTop10,
        stage6BottomPool
    ]);

    const targetPlacementMap = React.useMemo(() => {
        const raw = getStagePlacements({
            stage: stageIndex,
            demonKings,
            advancedDemonKings,
            masterRows,
            advancedMasters,
            pendingMasters,
            challengersByPair,
            pendingCandidates,
            stage5PendingPool,
            stage6PromotedPool,
            stage6NonPromotedPool,
            finalTop10,
            stage6BottomPool
        });
        return normalizePlacements(raw);
    }, [
        stageIndex,
        demonKings,
        advancedDemonKings,
        masterRows,
        advancedMasters,
        pendingMasters,
        challengersByPair,
        pendingCandidates,
        stage5PendingPool,
        stage6PromotedPool,
        stage6NonPromotedPool,
        finalTop10,
        stage6BottomPool
    ]);

    const lastPlacementRef = React.useRef(new Map());

    React.useEffect(() => {
        activeIds.forEach((id) => {
            if (!lastPlacementRef.current.has(id) && basePlacementMap.has(id)) {
                lastPlacementRef.current.set(id, basePlacementMap.get(id));
            }
        });

        visualPlacementMap.forEach((placement, id) => {
            lastPlacementRef.current.set(id, placement);
        });
    }, [activeIds, basePlacementMap, visualPlacementMap]);

    const parkingPlacement = React.useMemo(() => {
        return makePlacement({
            row: 6,
            col: 8,
            colSpan: 2,
            mode: 'compact',
            tone: 'pending',
            showScore: false,
            showStatus: false,
            statusLabel: '',
            statusTone: 'pending',
            width: COMPACT_DENSE_SIZE.width,
            height: COMPACT_DENSE_SIZE.height,
            z: 0
        });
    }, []);

    const rowTitles = React.useMemo(() => {
        return getTitleRows({
            stage: visualStage,
            advancedMasters
        });
    }, [visualStage, advancedMasters]);

    return (
        <div className="w-full h-full max-w-[1600px] mx-auto mt-4 px-4 md:px-6 pb-4 relative">
            <div className="h-full rounded-3xl border border-[var(--color-card-border)] bg-[var(--color-card-bg)] backdrop-blur-md p-5 md:p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-72 h-72 bg-teal-600/20 blur-[80px] rounded-full pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-600/20 blur-[70px] rounded-full pointer-events-none"></div>

                <div className="relative h-[min(76vh,700px)]">

                    <section className="h-full relative">
                        <AnimatePresence mode="popLayout" initial={false}>
                            {rowTitles.map((title) => (
                                (() => {
                                    const isDemonTitle = title.text === '大魔王登场';
                                    const disableTitleMotion = isDemonTitle && (visualStage === 1 || visualStage === 2);
                                    const titleKey = disableTitleMotion ? 'demon-entrance-title' : `${visualStage}-${title.key}`;
                                    return (
                                <motion.div
                                    key={titleKey}
                                    initial={disableTitleMotion ? false : { opacity: 0, y: 8 }}
                                    animate={{
                                        top: `${title.topPct || TITLE_CENTER_Y[title.row] || 9}%`,
                                        opacity: disableTitleMotion ? 1 : (transitionState.phase === 'out' ? 0.35 : 1),
                                        y: 0
                                    }}
                                    exit={disableTitleMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -8 }}
                                    transition={disableTitleMotion ? { duration: 0 } : MOTION.detail}
                                    className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-slate-200 text-[clamp(1rem,2.5vw,2.3rem)] font-black tracking-[0.14em] whitespace-nowrap"
                                >
                                    {title.text}
                                </motion.div>
                                    );
                                })()
                            ))}
                        </AnimatePresence>

                        {[...activeIds].map((id) => {
                            const player = playerById.get(id);
                            if (!player) return null;

                            const visiblePlacement = visualPlacementMap.get(id);
                            const targetPlacement = targetPlacementMap.get(id);
                            const fallbackPlacement = lastPlacementRef.current.get(id) || basePlacementMap.get(id) || parkingPlacement;
                            const placement = visiblePlacement || fallbackPlacement;
                            const isVisible = !!visiblePlacement;
                            const xPct = toCenterXPct(
                                placement.col,
                                placement.colSpan,
                                placement.safeLeft ?? BOARD_SAFE_LEFT,
                                placement.safeWidth ?? BOARD_SAFE_WIDTH
                            );
                            const yPct = placement.topPct || (placement.mode === 'hero' ? 50 : (ROW_CENTER_Y[placement.row] || 53));
                            const scoreValue = getPlayerLatestScore(player, pkMatches);

                            let opacity = isVisible ? 1 : 0;
                            let nodeScale = placement.scale || 1;
                            let nodeTransition = MOTION.layout;
                            let exitY = 0;


                            if (transitionState.phase === 'out') {
                                const inFrom = !!visiblePlacement;
                                const inTo = !!targetPlacement;
                                if (inFrom && !inTo) {
                                    opacity = 0;
                                    exitY = 80;
                                }
                                if (!inFrom && inTo) opacity = 0;
                                nodeTransition = {
                                    ...MOTION.layout,
                                    duration: STAGE_OUT_DURATION_MS / 1000,
                                    ease: [0.4, 0, 0.2, 1],
                                    delay: 0
                                };
                            }


                            if (transitionState.phase === 'in') {
                                const inNow = !!visiblePlacement;
                                opacity = inNow ? 1 : 0;

                                let appearDelay = inNow ? (visiblePlacement?.appearDelay || 0) : 0;

                                if (transitionState.from === 2 && transitionState.to === 3 && inNow) {
                                    const rowDelay = visiblePlacement.row === 4 ? 0.12 : 0;
                                    appearDelay = rowDelay + ((id % 8) * 0.03);
                                }

                                if (transitionState.from === 1 && transitionState.to === 2 && inNow && visiblePlacement.mode === 'hero' && visiblePlacement.statusLabel === '晋级') {
                                    nodeScale = 1.1;
                                }

                                nodeTransition = {
                                    ...MOTION.layout,
                                    delay: appearDelay
                                };
                            }

                            if (transitionState.phase === 'idle' && visualStage === 2 && isVisible && placement.mode === 'hero' && placement.statusLabel === '晋级') {
                                nodeScale = 1.03;
                            }

                            const movementOnly = transitionState.phase !== 'idle';
                            const hideScoreForMovement = movementOnly && visualStage >= 3 && visualStage <= 5;
                            const hideStatusForMovement = movementOnly && visualStage >= 3 && visualStage <= 5;

                            return (
                                <motion.div
                                    key={`node-${id}`}
                                    initial={false}
                                    animate={{
                                        left: `${xPct}%`,
                                        top: `${yPct}%`,
                                        width: placement.width,
                                        height: placement.height,
                                        opacity,
                                        y: exitY
                                    }}

                                    transition={nodeTransition}
                                    style={{ zIndex: placement.z }}
                                    className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none will-change-[left,top,width,height,opacity]"
                                >
                                    <PlayerCard
                                        player={player}
                                        mode={placement.mode}
                                        tone={placement.tone}
                                        showScore={isVisible && !hideScoreForMovement ? placement.showScore : false}
                                        showStatus={isVisible && !hideStatusForMovement ? placement.showStatus : false}
                                        statusLabel={placement.statusLabel}
                                        statusTone={placement.statusTone}
                                        scoreValue={scoreValue}
                                        cardScale={nodeScale}
                                        transitionState={transitionState}
                                        currentStage={visualStage}
                                        minReservedMetaHeight={placement.minReservedMetaHeight || null}
                                    />
                                </motion.div>
                            );
                        })}

                        <AnimatePresence initial={false}>
                            {visualStage === 2 && (
                                <motion.div
                                    key="stage2-average"
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: transitionState.phase === 'out' ? 0.4 : 1, y: 0 }}
                                    exit={{ opacity: 0, y: 8 }}
                                    transition={MOTION.detail}
                                    className="absolute bottom-7 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full border border-teal-400/35 bg-slate-900/55 text-teal-200 text-[clamp(1rem,2.5vw,2.3rem)] font-black tracking-[0.14em]"
                                >
                                    16强均分：{Number(demonKingThreshold || 0).toFixed(2)}
                                </motion.div>
                            )}
                        </AnimatePresence>


                    </section>
                </div>
            </div>
        </div>
    );
}

function PlayerCard({
    player,
    mode,
    tone,
    showScore,
    showStatus,
    statusLabel,
    statusTone,
    scoreValue,
    cardScale,
    transitionState,
    currentStage,
    minReservedMetaHeight
}) {
    const toneClass = toneToClass(tone);
    const statusClass = statusToClass(statusTone);

    const noMeta = !showScore && !showStatus;
    const isStage1HeroNoMeta = mode === 'hero' && currentStage === 1 && noMeta;
    const isStage2Hero = mode === 'hero' && currentStage === 2;
    const isStage4PromotedCompact = mode === 'compact' && currentStage === 4 && tone === 'success';
    const isStage4MasterCompact = mode === 'compact' && currentStage === 4 && (tone === 'success' || tone === 'pending');
    const isStage6PromotedCompact = mode === 'compact' && currentStage === 6 && tone === 'success';
    const isStage6Compact = mode === 'compact' && currentStage === 6;
    const isStage7Compact = mode === 'compact' && currentStage === 7;
    const isStage6LikeCompact = isStage6Compact || isStage4MasterCompact;
    const useLargeHeroIdentity = noMeta || isStage2Hero;
    const isStage1To2Transition = mode === 'hero' && transitionState.from === 1 && transitionState.to === 2;
    const isStage2OutcomeStable = isStage2Hero && transitionState.phase === 'idle';
    const isPromotedOutcome = isStage2OutcomeStable && statusLabel === '晋级';
    const isPendingOutcome = isStage2OutcomeStable && statusLabel === '待定';
    const stage2OutcomeDelay = isStage2OutcomeStable ? 1 : 0;

    if (mode === 'hero') {
        return (
            <motion.div
                initial={false}
                animate={{
                    scale: isPendingOutcome ? cardScale * 0.8 : (isPromotedOutcome ? cardScale * 1.02 : cardScale),
                    opacity: transitionState.phase === 'out'
                        ? (isStage1To2Transition ? 0.9 : 0.84)
                        : (isPendingOutcome ? 0.92 : 1),
                    y: isPendingOutcome ? 16 : (isPromotedOutcome ? -6 : 0),
                    filter: isPendingOutcome ? 'grayscale(52%)' : 'grayscale(0%)',
                    boxShadow: isPromotedOutcome ? '0 0 48px rgba(251, 191, 36, 0.52)' : 'none'
                }}
                transition={
                    isStage1To2Transition
                        ? { duration: 0.42, ease: [0.33, 1, 0.68, 1] }
                        : (isStage2Hero ? { duration: 0.34, ease: [0.22, 1, 0.36, 1], delay: stage2OutcomeDelay } : MOTION.detail)
                }
                className={`h-full rounded-3xl border ${toneClass} px-4 py-4 text-center flex flex-col items-center ${noMeta ? (isStage1HeroNoMeta ? 'justify-center' : 'justify-start') : 'justify-between'}`}
            >
                <div className={`rounded-full p-[2px] bg-gradient-to-b from-white/35 to-white/10 mx-auto w-fit ${isStage1HeroNoMeta ? 'mt-2' : ''}`}>
                    <img src={getFullAvatarUrl(player.avatar)} alt={player.name} onError={handleAvatarError} className={`${useLargeHeroIdentity ? 'w-44 h-44' : 'w-30 h-30'} rounded-full border border-white/20 object-cover`} />
                </div>

                <div className={`${useLargeHeroIdentity ? 'text-[clamp(1.45rem,2.45vw,2rem)]' : 'text-[1.2rem]'} ${noMeta ? (isStage1HeroNoMeta ? 'mt-4' : 'mt-3') : (isStage2Hero ? 'mt-4' : 'mt-2')} font-black text-slate-100 truncate w-full`}>{player.name}</div>

                {!noMeta && (
                    <motion.div
                        initial={false}
                        animate={{
                            opacity: showScore ? 1 : 0,
                            y: showScore ? 0 : 8,
                            scale: showScore ? 1 : 0.9
                        }}
                        transition={
                            isStage2Hero
                                ? { duration: 0.28, ease: [0.22, 1, 0.36, 1], delay: showScore ? 0.04 : 0 }
                                : { ...MOTION.detail, duration: 0.34, ease: 'easeOut' }
                        }
                        className={`${isStage2Hero ? 'mt-3 min-h-[40px] text-4xl' : 'mt-2 min-h-[34px] text-[2rem]'} font-mono font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-teal-300`}
                    >
                        {showScore ? Number(scoreValue || 0).toFixed(2) : ''}
                    </motion.div>
                )}

                {!noMeta && (
                    <motion.div
                        initial={false}
                        animate={{
                            opacity: showStatus ? 1 : 0,
                            y: showStatus ? 0 : 10,
                            scale: showStatus ? 1 : 0.72
                        }}
                        transition={
                            isStage2Hero
                                ? { duration: 0.3, ease: [0.22, 1, 0.36, 1], delay: showStatus ? 0.08 : 0 }
                                : { ...MOTION.detail, duration: 0.32, delay: showStatus ? 0.08 : 0, ease: 'easeOut' }
                        }
                        className={`${isStage2Hero ? 'mt-2 text-[15px] px-4.5 py-1.5' : 'mt-1.5 text-[12px] px-3 py-1'} font-black tracking-[0.06em] rounded-full border ${statusClass}`}
                    >
                        {showStatus ? statusLabel : ''}
                    </motion.div>
                )}
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={false}
            animate={{
                scale: cardScale,
                opacity: transitionState.phase === 'out' ? 0.88 : 1
            }}
            transition={MOTION.detail}
            className={`h-full rounded-2xl border ${toneClass} ${isStage7Compact ? 'px-4 py-3' : (isStage6LikeCompact ? 'px-3 py-2.5' : 'px-2.5 py-2')} text-center flex flex-col items-center ${noMeta ? 'justify-center' : 'justify-between'}`}
        >
            <img src={getFullAvatarUrl(player.avatar)} alt={player.name} onError={handleAvatarError} className={`${isStage7Compact ? 'w-[6rem] h-[6rem]' : (noMeta ? 'w-[4.5rem] h-[4.5rem]' : (isStage6LikeCompact ? 'w-[3.75rem] h-[3.75rem]' : 'w-12 h-12'))} rounded-full border border-white/20 object-cover flex-shrink-0`} />
            <div className={`${isStage7Compact ? 'mt-3 text-[20px]' : (noMeta ? 'mt-2.5 text-sm' : (isStage6LikeCompact ? 'mt-1.5 text-[11px]' : 'mt-1 text-[10px]'))} leading-tight font-black text-slate-100 truncate w-full min-h-[1.1rem]`}>{player.name}</div>

            {!noMeta && (
                <motion.div
                    initial={false}
                    animate={{
                        opacity: showScore ? 1 : 0,
                        y: showScore ? 0 : ((isStage4PromotedCompact || isStage6PromotedCompact) ? 16 : 4),
                        scale: showScore ? 1 : ((isStage4PromotedCompact || isStage6PromotedCompact) ? 0.52 : 0.9)
                    }}
                    transition={
                        (isStage4PromotedCompact || isStage6PromotedCompact)
                            ? { duration: 0.44, ease: [0.22, 1, 0.36, 1], delay: showScore ? 0.08 : 0 }
                            : { ...MOTION.detail, duration: 0.3 }
                    }
                    className={`${isStage7Compact ? 'mt-2 text-[18px]' : (isStage6LikeCompact ? 'mt-1 text-[13px]' : 'mt-0.5 text-xs')} font-mono font-black text-teal-200 ${minReservedMetaHeight ? '' : 'min-h-[16px]'}`}
                    style={minReservedMetaHeight ? { minHeight: `${Math.max(14, minReservedMetaHeight - 20)}px` } : undefined}
                >
                    {showScore ? Number(scoreValue || 0).toFixed(2) : ''}
                </motion.div>
            )}

            {!noMeta && (
                <motion.div
                    initial={false}
                    animate={{
                        opacity: showStatus ? 1 : 0,
                        y: showStatus ? 0 : ((isStage4PromotedCompact || isStage6PromotedCompact) ? 14 : 4),
                        scale: showStatus ? 1 : ((isStage4PromotedCompact || isStage6PromotedCompact) ? 0.66 : 0.9)
                    }}
                    transition={
                        (isStage4PromotedCompact || isStage6PromotedCompact)
                            ? { duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: showStatus ? 0.18 : 0 }
                            : { ...MOTION.detail, duration: 0.28, delay: showStatus ? 0.05 : 0 }
                    }
                    className={`${isStage7Compact ? 'mt-2 text-[13px] px-3 py-1' : (isStage6LikeCompact ? 'mt-1 text-[11px] px-2 py-0.5' : 'mt-0.5 text-[10px] px-1.5 py-0.5')} font-black tracking-[0.04em] rounded border ${statusClass}`}
                >
                    {showStatus ? statusLabel : ''}
                </motion.div>
            )}
        </motion.div>
    );
}

Resurrection.propTypes = {
    gameState: PropTypes.shape({
        finalStageIndex: PropTypes.number,
        screenFinalStageIndex: PropTypes.number,
        pkMatches: PropTypes.arrayOf(PropTypes.shape({
            challengerId: PropTypes.number,
            masterId: PropTypes.number,
            status: PropTypes.string,
            winner: PropTypes.string,
            challengerScore: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
            masterScore: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
        })),
        players: PropTypes.array
    }).isRequired
};

PlayerCard.propTypes = {
    player: PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        avatar: PropTypes.string
    }).isRequired,
    mode: PropTypes.oneOf(['hero', 'compact']).isRequired,
    tone: PropTypes.oneOf(['pending', 'challenger', 'master', 'demon', 'success']).isRequired,
    showScore: PropTypes.bool.isRequired,
    showStatus: PropTypes.bool.isRequired,
    statusLabel: PropTypes.string.isRequired,
    statusTone: PropTypes.oneOf(['pending', 'success']).isRequired,
    scoreValue: PropTypes.number.isRequired,
    cardScale: PropTypes.number.isRequired,
    currentStage: PropTypes.number.isRequired,
    minReservedMetaHeight: PropTypes.number,
    transitionState: PropTypes.shape({
        phase: PropTypes.oneOf(['idle', 'out', 'in']).isRequired,
        from: PropTypes.number.isRequired,
        to: PropTypes.number.isRequired
    }).isRequired
};
