import React from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { getFullAvatarUrl } from '../../utils/avatar';
import { deriveFinalSettlement, getPlayerLatestScore } from '../../utils/finalSettlement';
import PlayerIdentity from '../common/PlayerIdentity';

const TOTAL_SUBCOLS = 22; // Increased to fit 11 cards with better spacing
const BOARD_SAFE_LEFT = 6;
const BOARD_SAFE_WIDTH = 88;

const ROW_CENTER_Y = {
    2: 20,
    4: 49,
    6: 74
};

const TITLE_CENTER_Y = {
    1: 5,
    3: 34,
    5: 52
};

const MOTION = {
    layout: { duration: 0.66, ease: [0.4, 0, 0.2, 1] },
    detail: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
    exitDown: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
};


const STAGE_OUT_DURATION_MS = 420;
const STAGE_IN_SETTLE_MS = 460;
const STAGE_3_TO_4_DURATION_MS = 800;
const STAGE3_CHALLENGER_TITLE_SCALE = 1.5;


const HERO_SIZE = { width: 150, height: 184 };
const COMPACT_HEIGHT = 82;
const COMPACT_DENSE_HEIGHT = 70;

const FALLBACK_AVATAR = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><rect width="120" height="120" fill="#1f2937"/><circle cx="60" cy="46" r="22" fill="#94a3b8"/><rect x="28" y="78" width="64" height="28" rx="14" fill="#94a3b8"/></svg>')}`;

const handleAvatarError = (event) => {
    event.currentTarget.onerror = null;
    event.currentTarget.src = FALLBACK_AVATAR;
};

const getSlotWidth = (colSpan, safeWidth = BOARD_SAFE_WIDTH) => {
    const slotPercent = (safeWidth / TOTAL_SUBCOLS) * colSpan;
    const gapOffset = 10; // Fixed 10px gap for consistency
    return `calc(${slotPercent}% - ${gapOffset}px)`;
};

const STAGE5_CARD_SIZE = { width: getSlotWidth(2), height: '32%' };
const HERO_STAGE1_SIZE = { width: getSlotWidth(4.2), height: '78%' };
const HERO_STAGE2_SIZE = { width: getSlotWidth(4.6), height: '86%' };
const COMPACT_SIZE = { width: getSlotWidth(2), height: COMPACT_HEIGHT };
const COMPACT_DENSE_SIZE = { width: getSlotWidth(1), height: COMPACT_DENSE_HEIGHT };

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
    // Promoted masters: colSpan=2.5 (1.25x of 8%), spacing=10%, width=8.5%, gap=1.5%
    // Pending zone: colSpan=2, spacing=8%, width=7%, gap=1%
    const colSpan = count <= 5 ? 2.5 : 2;
    return { colSpan, ...COMPACT_DENSE_SIZE };
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
    xCompress = 1,
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
        xCompress,
        minReservedMetaHeight,
        emphasis
    };
};

const toCenterXPct = (col, colSpan, safeLeft = BOARD_SAFE_LEFT, safeWidth = BOARD_SAFE_WIDTH) => {
    const local = ((col - 1) + colSpan / 2) / TOTAL_SUBCOLS;
    return safeLeft + local * safeWidth;
};

const getTitleRows = ({ stage, advancedMasters, pendingMasters }) => {
    if (stage === 1) return [{ key: 's1', text: '大魔王登场', row: 1 }];
    if (stage === 2) return [{ key: 's2', text: '大魔王登场', row: 1 }];
    if (stage === 3) {
        return [
            { key: 's3m', text: '擂主', row: 1, topPct: 5 },
            { key: 's3c', text: '攻擂者', row: 3, topPct: 55 }
        ];
    }

    if (stage === 4) {
        if (advancedMasters.length > 0) {
            if (pendingMasters.length <= 3) {
                return [
                    { key: 's4a', text: '晋级擂主', row: 1, topPct: 5 },
                    { key: 's4-zone', text: '待定区', row: 3, topPct: 50 }
                ];
            }
            return [
                { key: 's4a', text: '晋级擂主', row: 1, topPct: 0 },
                { key: 's4p', text: '待定擂主', row: 3, topPct: 43 },
                { key: 's4c', text: '攻擂者', row: 5, topPct: 74 }
            ];
        }
        return [
            { key: 's4p-only', text: '待定擂主', row: 1, topPct: 5 },
            { key: 's4c-only', text: '攻擂者', row: 3, topPct: 55 }
        ];
    }

    if (stage === 5) {
        return [{ key: 's5-zone', text: '待定区', row: 1 }];
    }

    if (stage === 6) {
        return [
            { key: 's6a', text: '待定区晋级', row: 1, topPct: 5 },
            { key: 's6n', text: '待定区未晋级', row: 3, topPct: 42 }
        ];
    }

    return [{ key: 's7a', text: '最终晋级阵容', row: 1, topPct: 8 }];
};

const getTitleSharedKey = (title) => {
    if (title.text === '攻擂者') return 'title-challenger';
    if (title.text === '大魔王登场') return 'title-demon-entrance';
    return null;
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
    scale = 1,
    xCompress = 1,
    colSpan = null,
    preciseCenter = false
}) => {
    if (!players || players.length === 0) return;

    const density = getDensityForCount(players.length);
    const effectiveColSpan = colSpan ?? density.colSpan;
    const visiblePlayers = players; // Show all players, don't truncate
    const starts = buildCenteredStarts(visiblePlayers.length, effectiveColSpan, TOTAL_SUBCOLS);
    const idealStart = ((TOTAL_SUBCOLS - visiblePlayers.length * effectiveColSpan) / 2) + 1;
    const startShift = preciseCenter && starts.length > 0 ? idealStart - starts[0] : 0;

    visiblePlayers.forEach((player, index) => {
        target.set(player.id, makePlacement({
            row,
            col: starts[index] + startShift,
            colSpan: effectiveColSpan,
            mode: 'compact',
            tone,
            showScore,
            showStatus,
            statusLabel,
            statusTone,
            width: width || getSlotWidth(effectiveColSpan, safeWidth),
            height: height || density.height,
            z,
            topPct,
            safeLeft,
            safeWidth,
            xCompress,
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
    stage5PendingPool,
    stage6PromotedPool,
    stage6NonPromotedPool,
    finalTop10
}) => {
    const placements = new Map();

    if (stage === 1 || stage === 2) {
        const heroCols = [3, 11];
        demonKings.forEach((player, index) => {
            const isAdvanced = advancedDemonKings.some((item) => item.id === player.id);
            const hasDkScore = player.scoreDK !== undefined && player.scoreDK !== null && player.scoreDK !== '';
            const heroSize = stage === 1 ? HERO_STAGE1_SIZE : HERO_STAGE2_SIZE;

            placements.set(player.id, makePlacement({
                row: 4,
                col: heroCols[index] || 3,
                colSpan: 4,
                mode: 'hero',
                tone: 'demon',
                showScore: stage === 2 && hasDkScore,
                showStatus: stage === 2 && hasDkScore,
                statusLabel: isAdvanced ? '晋级' : '待定',
                statusTone: isAdvanced ? 'success' : 'pending',
                width: heroSize.width,
                height: heroSize.height,
                z: 8,
                minReservedMetaHeight: 88
            }));
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
                    width: '10%',
                    height: '35%',
                    z: 6,
                    topPct: 28
                }));

        });

        masterRows.forEach((row, index) => {
            const player = row.challenger;
            if (!player) return;
            const start = strictStarts[index] || 1;
            placements.set(player.id, makePlacement({
                    row: 4,
                    col: start,
                    colSpan: 2,
                    mode: 'compact',
                    tone: 'challenger',
                    showScore: false,
                    showStatus: false,
                    statusLabel: '',
                    statusTone: 'success',
                    width: '10%',
                    height: '35%',
                    z: 5,
                    topPct: 78
                }));
        });

        return placements;
    }

    if (stage === 4) {
        const advancedMasterMap = new Map(advancedMasters.map((player) => [player.id, player]));
        const pendingMasterMap = new Map(pendingMasters.map((player) => [player.id, player]));
        const challengerPairMap = new Map(challengersByPair.map((player) => [player.id, player]));

        const stage4PromotedMasters = masterRows
            .filter((row) => row.winner === 'master')
            .map((row) => advancedMasterMap.get(row.master.id) || {
                ...row.master,
                displayScore: row.masterScore
            });

        const stage4PendingRows = masterRows.filter((row) => row.winner !== 'master');

        const stage4DisplayPendingMasters = stage4PendingRows
            .map((row) => pendingMasterMap.get(row.master.id) || {
                ...row.master,
                displayScore: row.masterScore
            });

        const stage4DisplayChallengers = stage4PendingRows
            .map((row) => row.challenger)
            .filter(Boolean)
            .map((player) => challengerPairMap.get(player.id) || player);

        if (stage4PromotedMasters.length > 0) {
            placeCenteredRow({
                target: placements,
                players: stage4PromotedMasters,
                row: 2,
                tone: 'success',
                showScore: true,
                showStatus: true,
                statusLabel: '晋级',
                statusTone: 'success',
                z: 7,
                width: '8.5%',
                height: '29.75%',
                topPct: 25,
                minReservedMetaHeight: 44,
                scale: 1.04
            });

            if (stage4DisplayPendingMasters.length > 0) {
                placeCenteredRow({
                    target: placements,
                    players: stage4DisplayPendingMasters,
                    row: 4,
                    tone: 'pending',
                    showScore: false,
                    showStatus: false,
                    statusLabel: '',
                    statusTone: 'pending',
                    z: 6,
                    width: '7%',
                    height: '24.5%',
                    topPct: 58,
                    safeLeft: 4.8,
                    safeWidth: 90.4,
                    minReservedMetaHeight: 40
                });
            }

            placeCenteredRow({
                target: placements,
                players: stage4DisplayChallengers,
                row: 6,
                tone: 'challenger',
                showScore: false,
                showStatus: false,
                statusLabel: '',
                statusTone: 'pending',
                z: 4,
                width: '7%',
                height: '24.5%',
                topPct: 89,
                safeLeft: 4.8,
                safeWidth: 90.4,
                minReservedMetaHeight: 38
            });

            return placements;
        }

        placeCenteredRow({
            target: placements,
            players: stage4DisplayPendingMasters,
            row: 2,
            tone: 'pending',
            showScore: false,
            showStatus: false,
            statusLabel: '',
            statusTone: 'pending',
            z: 6,
            width: '8.4%',
            height: '29.4%',
            topPct: 25,
            colSpan: 2.35,
            preciseCenter: true,
            minReservedMetaHeight: 40
        });

        placeCenteredRow({
            target: placements,
            players: stage4DisplayChallengers,
            row: 4,
            tone: 'challenger',
            showScore: false,
            showStatus: false,
            statusLabel: '',
            statusTone: 'pending',
            z: 4,
            width: '8.4%',
            height: '29.4%',
            topPct: 75,
            colSpan: 2.35,
            preciseCenter: true,
            minReservedMetaHeight: 38
        });

        return placements;
    }

    if (stage === 5) {
        placeTwoCenteredRows({
            target: placements,
            players: stage5PendingPool,
            topRowPct: 24,
            bottomRowPct: 49,
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
            width: COMPACT_SIZE.width,
            height: '38%',
            topPct: 16,
            safeLeft: 0,
            safeWidth: 100,
            minReservedMetaHeight: 40,
            scale: 1.04
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
            width: COMPACT_SIZE.width,
            height: '38%',
            topPct: 50,
            safeLeft: 0,
            safeWidth: 100,
            minReservedMetaHeight: 40,
            scale: 1.04
        });

        return placements;
    }

    placeFixedFiveColGrid({
        target: placements,
        players: finalTop10,
        topPercents: [18, 58],
        tone: 'success',
        showScore: true,
        showStatus: true,
        statusLabel: '晋级',
        statusTone: 'success',
        z: 8,
        width: '15.8%',
        height: '76%',
        rowStart: 2,
        minReservedMetaHeight: 88,
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
        challengers,
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
        const isStage3To4 = fromStage === 3 && stageIndex === 4;
        let inTimer = null;

        if (isStage3To4) {
            // Stage 3→4: Simultaneous animations, no sequential phases
            setVisualStage(stageIndex);
            setTransitionState({ phase: 'simultaneous', from: fromStage, to: stageIndex });

            inTimer = window.setTimeout(() => {
                setTransitionState({ phase: 'idle', from: stageIndex, to: stageIndex });
            }, STAGE_3_TO_4_DURATION_MS);
        } else {
            // Other stages: Sequential out/in phases
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
        }

        return () => {
            if (inTimer) window.clearTimeout(inTimer);
        };
    }, [stageIndex, visualStage, transitionState.phase]);


    const activeIds = React.useMemo(() => {
        return new Set([
            ...demonKings.map((player) => player.id),
            ...masterRows.map((row) => row.master.id),
            ...challengers.map((player) => player.id),
            ...challengersByPair.map((player) => player.id),
            ...stage5PendingPool.map((player) => player.id),
            ...finalTop10.map((player) => player.id),
            ...stage6BottomPool.map((player) => player.id),
            ...stage6PromotedPool.map((player) => player.id),
            ...stage6NonPromotedPool.map((player) => player.id),
        ]);
    }, [demonKings, masterRows, challengers, challengersByPair, stage5PendingPool, finalTop10, stage6BottomPool, stage6PromotedPool, stage6NonPromotedPool]);

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
            advancedMasters,
            pendingMasters
        });
    }, [visualStage, advancedMasters, pendingMasters]);

    return (
        <div className="w-full h-full max-w-[1700px] mx-auto mt-0 px-4 md:px-5 pb-1 relative">
            <div className="h-full p-4 md:p-5 relative overflow-hidden">
                <div className="relative h-full min-h-0">

                    <section className="h-full relative">
                        <AnimatePresence mode="popLayout" initial={false}>
                            {rowTitles.map((title) => (
                                (() => {
                                    const isDemonTitle = title.text === '大魔王登场';
                                    const isChallengerTitle = title.text === '攻擂者';
                                    const isStage3ChallengerTitle = visualStage === 3 && isChallengerTitle;
                                    const isStage3MasterTitle = visualStage === 3 && title.text === '擂主';
                                    const disableTitleMotion = isDemonTitle && (visualStage === 1 || visualStage === 2);
                                    const sharedKey = getTitleSharedKey(title);
                                    const titleKey = disableTitleMotion ? 'demon-entrance-title' : (sharedKey || `${visualStage}-${title.key}`);
                                    const titleTop = `${title.topPct ?? TITLE_CENTER_Y[title.row] ?? 9}%`;
                                    const challengerScale = isChallengerTitle
                                        ? (isStage3ChallengerTitle ? STAGE3_CHALLENGER_TITLE_SCALE : 1)
                                        : 1;
                                    const titleInitial = disableTitleMotion
                                        ? false
                                        : { top: titleTop, y: 8, scale: challengerScale };
                                    const fadeOutMasterEarly = transitionState.phase === 'out' && isStage3MasterTitle;
                                    const titleTransition = disableTitleMotion
                                        ? { duration: 0 }
                                        : (fadeOutMasterEarly
                                            ? { duration: 0.2, ease: 'easeOut' }
                                            : (transitionState.phase === 'simultaneous' && transitionState.to === 4
                                                ? { duration: 0.8, ease: [0.4, 0, 0.2, 1] }
                                                : MOTION.detail));
                                    return (
                                <motion.div
                                    key={titleKey}
                                    initial={titleInitial}
                                    animate={{
                                        top: titleTop,
                                        opacity: fadeOutMasterEarly ? 0 : 1,
                                        y: 0,
                                        scale: challengerScale
                                    }}
                                    exit={isStage3MasterTitle
                                        ? { opacity: 0, y: 0, transition: { duration: 0 } }
                                        : (disableTitleMotion ? { opacity: 1, y: 0 } : { opacity: 1, y: -8 })}
                                    transition={titleTransition}
                                    className={`absolute left-1/2 -translate-x-1/2 -translate-y-1/2 text-center whitespace-nowrap ${isDemonTitle
                                        ? 'text-[clamp(1.65rem,3vw,2.25rem)] leading-none font-black text-transparent bg-clip-text bg-[linear-gradient(to_bottom,rgba(255,255,255,0.96),rgba(220,240,255,0.72))] tracking-[0.24em] italic drop-shadow-[0_0_18px_rgba(255,255,255,0.12)]'
                                        : (isStage3MasterTitle
                                            ? 'text-slate-200 text-[clamp(1.11rem,2.325vw,1.8rem)] font-black tracking-[0.1em]'
                                            : 'text-slate-200 text-[clamp(0.74rem,1.55vw,1.2rem)] font-black tracking-[0.1em]')
                                    }`}
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
                            const rawXPct = toCenterXPct(
                                placement.col,
                                placement.colSpan,
                                placement.safeLeft ?? BOARD_SAFE_LEFT,
                                placement.safeWidth ?? BOARD_SAFE_WIDTH
                            );
                            const xCompress = placement.xCompress ?? 1;
                            const xPct = 50 + (rawXPct - 50) * xCompress;
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

                            if (transitionState.phase === 'simultaneous' && transitionState.from === 3 && transitionState.to === 4) {
                                // Stage 3→4: All cards animate simultaneously with longer duration
                                const inNow = !!visiblePlacement;
                                opacity = inNow ? 1 : 0;
                                
                                nodeTransition = {
                                    duration: 0.8,
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

                                nodeTransition = {
                                    ...MOTION.layout,
                                    delay: appearDelay
                                };
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
                                    className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
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
                                    className="absolute bottom-0 left-1/2 -translate-x-1/2 text-white/78 text-[clamp(1rem,1.8vw,1.38rem)] font-black tracking-[0.12em] text-center whitespace-nowrap"
                                >
                                    16强均分 {Number(demonKingThreshold || 0).toFixed(2)}
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

    const isStage2Hero = mode === 'hero' && currentStage === 2;
    const isStage4PromotedCompact = mode === 'compact' && currentStage === 4 && tone === 'success';
    const isStage4MasterCompact = mode === 'compact' && currentStage === 4 && (tone === 'success' || tone === 'pending');
    const isStage4Compact = mode === 'compact' && currentStage === 4;
    const isStage6PromotedCompact = mode === 'compact' && currentStage === 6 && tone === 'success';
    const isStage6NonPromotedCompact = mode === 'compact' && currentStage === 6 && tone === 'pending' && statusLabel === '未晋级';
    const isStageTopPromotedCompact = isStage4PromotedCompact || isStage6PromotedCompact;
    const isStageTopLikeCompact = isStageTopPromotedCompact || isStage6NonPromotedCompact;
    const isStage3Compact = mode === 'compact' && currentStage === 3;
    const isStage6Compact = mode === 'compact' && currentStage === 6;
    const isStage7Compact = mode === 'compact' && currentStage === 7;
    const isStage6LikeCompact = isStage6Compact || isStage4MasterCompact;
    const useLargeHeroIdentity = mode === 'hero' || isStage2Hero;
    const isStage1To2Transition = mode === 'hero' && transitionState.from === 1 && transitionState.to === 2;
    const isStage2OutcomeStable = isStage2Hero && transitionState.phase === 'idle';
    const isPromotedOutcome = isStage2OutcomeStable && statusLabel === '晋级';
    const isPendingOutcome = isStage2OutcomeStable && statusLabel === '待定';
    const heroShellWidthClass = isStage2Hero
        ? 'w-[min(100%,clamp(320px,27vw,400px))]'
        : 'w-[min(100%,clamp(300px,25vw,380px))]';
    const heroAvatarMarginClass = isStage2Hero ? 'mt-[clamp(10px,1.2vh,16px)]' : 'mt-[clamp(12px,1.5vh,20px)]';
    const heroIdentityMarginClass = isStage2Hero ? 'mt-[clamp(12px,1.35vh,18px)]' : 'mt-[clamp(14px,1.6vh,22px)]';
    const heroScoreWrapClass = isStage2Hero
        ? 'mt-[clamp(10px,1.1vh,16px)] min-h-[clamp(56px,6vh,74px)]'
        : 'mt-[clamp(14px,1.6vh,22px)] min-h-[clamp(64px,7vh,86px)]';
    const compactCardPaddingClass = isStage7Compact ? 'px-2.5 py-2.5' : (isStage4PromotedCompact ? 'px-1.75 py-1.25' : ((isStage3Compact || isStage4Compact) ? 'px-2 py-1.5' : (isStage6LikeCompact ? 'px-2 py-1.5' : 'px-1.5 py-1')));
    const compactCardRadiusClass = isStage7Compact ? 'rounded-[28px]' : 'rounded-[24px]';
    const compactAvatarWrapClass = isStage7Compact
        ? 'mt-0 rounded-[18px] p-[2px]'
        : (isStage4PromotedCompact ? 'mt-0 rounded-[15px] p-[1.5px]' : ((noMeta || isStageTopLikeCompact || isStage3Compact || isStage4Compact) ? 'mt-0 rounded-[16px] p-[2px]' : 'mt-0 rounded-[14px] p-[1.5px]'));
    const compactAvatarClass = isStage7Compact
        ? 'w-[4.5rem] h-[4.5rem] rounded-[16px]'
        : isStage4PromotedCompact
            ? 'w-[3.45rem] h-[3.45rem] rounded-[13px]'
            : (isStage3Compact || isStage4Compact)
                ? 'w-[4rem] h-[4rem] rounded-[14px]'
                : (noMeta
                    ? 'w-[3.35rem] h-[3.35rem] rounded-[14px]'
                    : (isStage6LikeCompact
                        ? 'w-[2.7rem] h-[2.7rem] rounded-[12px]'
                        : 'w-9 h-9 rounded-[12px]'));

    if (mode === 'hero') {
        return (
            <motion.div
                initial={false}
                animate={{
                    scale: isPendingOutcome ? 0.95 : (isPromotedOutcome ? 1.05 : cardScale),
                    opacity: transitionState.phase === 'out'
                        ? (isStage1To2Transition ? 1 : 0.84)
                        : 1,
                    y: 0
                }}
                transition={
                    isStage1To2Transition
                        ? { duration: 0.56, ease: [0.22, 1, 0.36, 1] }
                        : (isStage2Hero
                            ? (isStage2OutcomeStable ? { duration: 0 } : { duration: 0.72, ease: [0.22, 1, 0.36, 1] })
                            : MOTION.detail)
                }
                className={`${heroShellWidthClass} h-full mx-auto flex items-center justify-center`}
            >
                <motion.div
                    initial={false}
                    animate={{
                        boxShadow: isPromotedOutcome ? 'inset 0 1px 0 rgba(255,255,255,0.08), 0 28px 56px rgba(2,6,23,0.32)' : (isPendingOutcome ? 'inset 0 1px 0 rgba(255,255,255,0.08), 0 24px 48px rgba(2,6,23,0.24)' : 'inset 0 1px 0 rgba(255,255,255,0.08), 0 24px 48px rgba(2,6,23,0.26)'),
                        borderColor: isPromotedOutcome ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.1)'
                    }}
                    transition={
                        isStage1To2Transition
                            ? { duration: 0.56, ease: [0.22, 1, 0.36, 1] }
                            : (isStage2Hero ? { duration: 0.72, ease: [0.22, 1, 0.36, 1] } : MOTION.detail)
                    }
                    className="w-full h-full rounded-[42px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.014))] backdrop-blur-[8px] px-[clamp(18px,1.8vw,28px)] py-[clamp(18px,2vh,28px)] text-[var(--color-text-main)] flex flex-col items-center overflow-hidden"
                >
                    <div className="text-[clamp(0.95rem,1.25vw,1.15rem)] font-black tracking-[0.28em] uppercase text-white/68 text-center">
                        大魔王
                    </div>

                    <div className={`${heroAvatarMarginClass} rounded-[32px] p-[4px] bg-[linear-gradient(180deg,rgba(255,255,255,0.3),rgba(255,255,255,0.06))] shadow-[0_14px_28px_rgba(2,6,23,0.2)]`}>
                        <img src={getFullAvatarUrl(player.avatar)} alt={player.name} onError={handleAvatarError} className={`${useLargeHeroIdentity ? 'w-[clamp(132px,12vw,172px)] h-[clamp(132px,12vw,172px)]' : 'w-[clamp(108px,10vw,138px)] h-[clamp(108px,10vw,138px)]'} rounded-[28px] border border-white/20 object-cover block`} />
                    </div>

                    <PlayerIdentity
                        player={player}
                        className={`${heroIdentityMarginClass} w-full text-center px-3`}
                        numberPrefix="No."
                        numberClassName="text-[clamp(0.86rem,1vw,1rem)] font-black tracking-[0.22em] text-white/54 uppercase"
                        nameClassName={`${useLargeHeroIdentity ? 'text-[clamp(1.4rem,2vw,1.9rem)]' : 'text-[clamp(1.18rem,1.55vw,1.5rem)]'} mt-2 font-black text-white leading-tight break-words`}
                    />

                    <div className={`${heroScoreWrapClass} flex items-center justify-center w-full text-center`}>
                        {showScore ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.88, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{ duration: 0.24, ease: 'easeOut' }}
                                className={`${isStage2Hero ? 'text-[clamp(2.3rem,4vw,3.8rem)]' : 'text-[clamp(2.1rem,3.4vw,3.3rem)]'} leading-none font-mono font-black text-white`}
                            >
                                {Number(scoreValue || 0).toFixed(2)}
                            </motion.div>
                        ) : (
                            <div className="w-full flex items-center justify-center text-[clamp(2rem,3.2vw,3.2rem)] leading-[0.96] font-black text-white/42 whitespace-nowrap">
                                <div className="inline-flex items-center justify-center gap-[0.12em]" aria-label="Unknown score">
                                    <span className="inline-flex w-[0.62em] justify-center">?</span>
                                    <span className="inline-flex w-[0.62em] justify-center">?</span>
                                    <span className="inline-flex w-[0.62em] justify-center">?</span>
                                </div>
                            </div>
                        )}
                    </div>

                </motion.div>
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
            className={`relative h-full overflow-hidden border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.014))] backdrop-blur-[8px] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_14px_28px_rgba(2,6,23,0.18)] ${compactCardRadiusClass} ${compactCardPaddingClass} text-center flex flex-col items-center ${noMeta ? 'justify-center' : 'justify-start gap-0.5'}`}
        >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-white/10" />
            <div className={`${compactAvatarWrapClass} bg-[linear-gradient(180deg,rgba(255,255,255,0.28),rgba(255,255,255,0.06))] shadow-[0_10px_20px_rgba(2,6,23,0.18)] ${toneClass}`}>
                <img src={getFullAvatarUrl(player.avatar)} alt={player.name} onError={handleAvatarError} className={`${compactAvatarClass} border border-white/20 object-cover flex-shrink-0 block`} />
            </div>
            <PlayerIdentity
                player={player}
                compact
                numberPrefix="No."
                className={`${isStage7Compact ? 'mt-1 min-h-[2.35rem]' : (isStage4PromotedCompact ? 'mt-0.75 min-h-[1.75rem]' : ((isStage3Compact || isStage4Compact) ? 'mt-1 min-h-[2rem]' : (noMeta ? 'mt-1 min-h-[1.7rem]' : (isStageTopLikeCompact ? 'mt-0.5 min-h-[1.6rem]' : (isStage6LikeCompact ? 'mt-0.5 min-h-[1.45rem]' : 'mt-0.5 min-h-[1.3rem]')))))} w-full overflow-visible flex-shrink-0`}
                numberClassName={`${isStage7Compact ? 'text-[10px]' : (isStage4PromotedCompact ? 'text-[10px]' : ((isStage3Compact || isStage4Compact) ? 'text-[12px]' : ((isStage6LikeCompact || noMeta) ? 'text-[8px]' : 'text-[7px]')))} font-black text-white/54 leading-[1.04] tracking-[0.18em] uppercase`}
                nameClassName={`${isStage7Compact ? 'text-[14px]' : (isStage4PromotedCompact ? 'text-[13px]' : ((isStage3Compact || isStage4Compact) ? 'text-[16px]' : ((noMeta || isStageTopLikeCompact) ? 'text-[12px]' : (isStage6LikeCompact ? 'text-[10px]' : 'text-[9px]'))))} font-black text-white leading-[1.08]`}
            />

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
                    className={`${isStage7Compact ? 'mt-0.5 text-[12px]' : (isStage4PromotedCompact ? 'mt-0 text-[13px]' : ((isStage3Compact || isStage4Compact) ? 'mt-0.5 text-[10px]' : (isStageTopLikeCompact ? 'mt-0 text-[10px]' : (isStage6LikeCompact ? 'mt-0 text-[9px]' : 'mt-0 text-[8px]'))))} font-mono font-black text-white/90 flex-shrink-0 ${minReservedMetaHeight ? '' : 'min-h-[8px]'}`}
                    style={minReservedMetaHeight ? { minHeight: `${Math.max(18, minReservedMetaHeight - 42)}px` } : undefined}
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
                    className={`${isStage7Compact ? 'mt-0.5 text-[9px] px-2.5 py-0.5' : (isStage4PromotedCompact ? 'mt-0 text-[13px] px-2 py-0.5' : ((isStage3Compact || isStage4Compact) ? 'mt-0.5 text-[8px] px-2 py-0.5' : (isStageTopLikeCompact ? 'mt-0 text-[8px] px-1.5 py-0.5' : (isStage6LikeCompact ? 'mt-0 text-[8px] px-1.5 py-0.5' : 'mt-0 text-[7px] px-1.5 py-0.5'))))} font-black tracking-[0.04em] rounded-full border backdrop-blur-md flex-shrink-0 ${statusClass}`}
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
        number: PropTypes.string,
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
