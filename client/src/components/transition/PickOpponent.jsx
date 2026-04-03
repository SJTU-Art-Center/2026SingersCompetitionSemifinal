import PropTypes from 'prop-types';
import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { getFullAvatarUrl } from '../../utils/avatar';
import { formatPlayerNumber } from '../../utils/playerIdentity';
import PlayerIdentity from '../common/PlayerIdentity';

const STAGE_TOP_ROW = '4%';
const SLOT_ROW_TOP = '37%';
const STAGE_BOTTOM_ROW = '74%';

export default function PickOpponent({ gameState }) {
    const { players, pkMatches = [] } = gameState;
    const stage = Number(gameState.screenTransitionStage ?? gameState.transitionStage ?? 1);

    const [stage2ShiftTop18, setStage2ShiftTop18] = useState(false);

    const sortedPlayers = [...players].sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.id - b.id;
    });
    const top18 = sortedPlayers.slice(0, 18);
    const top2 = top18.slice(0, 2);
    const bottom12Ids = new Set(sortedPlayers.slice(18, 30).map((p) => p.id));

    const stageRows = useMemo(() => {
        const row1 = top18.slice(0, 9);
        const row2 = top18.slice(9, 18);
        const masters = [...top18.slice(2, 9), top18[10]].filter(Boolean);
        const attackers = [...top18.slice(11, 18), top18[9]].filter(Boolean);
        return { row1, row2, masters, attackers };
    }, [top18]);

    useEffect(() => {
        if (stage !== 2) {
            setStage2ShiftTop18(false);
            return;
        }

        setStage2ShiftTop18(true);
    }, [stage]);

    const renderFace = (player, compact = true, compactScale = 'normal') => (
        <div className={`h-full ${compact ? `flex flex-col items-center justify-center text-center ${compactScale === 'hero' ? 'px-5 py-5 gap-5' : compactScale === 'large' ? 'px-2.5 py-3 gap-3' : 'px-2 py-2.5 gap-2.5'}` : 'flex flex-col items-center justify-between text-center py-1.5 gap-1.5'}`}>
            <img
                src={getFullAvatarUrl(player.avatar)}
                alt=""
                className={`${compact ? (compactScale === 'hero' ? 'w-[184px] h-[184px] rounded-[28px]' : compactScale === 'large' ? 'w-[70px] h-[70px] rounded-[12px]' : 'w-[60px] h-[60px] rounded-[12px]') : 'w-24 h-24 rounded-2xl'} border border-white/20 object-cover block shadow-[0_8px_18px_rgba(2,6,23,0.18)]`}
            />
            {compact ? (
                <div className={`w-full min-h-0 flex flex-col items-center justify-center ${compactScale === 'hero' ? 'gap-4' : compactScale === 'large' ? 'gap-2' : 'gap-1.5'}`}>
                    <div className={`${compactScale === 'hero' ? 'text-[22px]' : compactScale === 'large' ? 'text-[9px]' : 'text-[8px]'} text-white/58 tracking-[0.2em] font-black leading-none whitespace-nowrap uppercase`}>No.{formatPlayerNumber(player)}</div>
                    <div className={`${compactScale === 'hero' ? 'text-[32px]' : compactScale === 'large' ? 'text-[12px]' : 'text-[11px]'} font-black text-white leading-tight max-w-full text-center break-words line-clamp-2`}>{player.name}</div>
                </div>
            ) : (
                <PlayerIdentity
                    player={player}
                    compact={compact}
                    className="w-full"
                    numberClassName="text-xs text-teal-200 tracking-[0.18em]"
                    nameClassName="text-[30px] font-black text-white"
                />
            )}
            {compact
                ? <div className={`${compactScale === 'hero' ? 'text-[52px]' : compactScale === 'large' ? 'text-[18px]' : 'text-[16px]'} font-black text-white/90 leading-none text-center`}>{Number(player.score || 0).toFixed(2)}</div>
                : <div className="text-[34px] font-black text-teal-100 leading-none">{Number(player.score || 0).toFixed(2)}</div>
            }
        </div>
    );

    const renderRankCard = (player, mode, flipIndex = 0, compactScale = 'normal', flipDelay = null, cardVariant = 'default') => {
        const shouldEliminate = mode === 'stage2-eliminate' && bottom12Ids.has(player.id);
        const cardShell = cardVariant === 'demon'
            ? 'w-full mx-auto aspect-[3/4] rounded-[45px] border border-white/12 p-6 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.014))] backdrop-blur-[6px] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_24px_48px_rgba(2,6,23,0.26)]'
            : 'w-full mx-auto aspect-[3/4] rounded-[20px] border border-white/10 p-2.5 bg-[linear-gradient(180deg,rgba(255,255,255,0.024),rgba(255,255,255,0.01))] backdrop-blur-[4px] shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_14px_30px_rgba(2,6,23,0.22)]';

        if (mode === 'stage1-flip') {
            return (
                <motion.div style={{ perspective: 1000 }} className="w-full">
                    <motion.div
                        initial={{ rotateY: 180, y: 8, scale: 0.97 }}
                        animate={{ rotateY: 0, y: 0, scale: 1 }}
                        transition={{
                            rotateY: { duration: 0.76, ease: [0.22, 0.82, 0.28, 1], delay: flipDelay ?? (flipIndex * 0.062) },
                            y: { duration: 0.5, ease: [0.16, 0.84, 0.44, 1], delay: flipDelay ?? (flipIndex * 0.062) },
                            scale: { duration: 0.5, ease: [0.16, 0.84, 0.44, 1], delay: flipDelay ?? (flipIndex * 0.062) }
                        }}
                        style={{ transformStyle: 'preserve-3d' }}
                        className="relative"
                    >
                        <div style={{ backfaceVisibility: 'hidden' }} className={cardShell}>
                            {renderFace(player, true, compactScale)}
                        </div>
                        <div style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }} className={`absolute inset-0 ${cardShell} bg-[linear-gradient(180deg,rgba(255,255,255,0.028),rgba(255,255,255,0.012))] border-white/10`}>
                            <div className="h-full" />
                        </div>
                    </motion.div>
                </motion.div>
            );
        }

        if (mode === 'stage2-eliminate' && !shouldEliminate) {
            return (
                <div className={cardShell}>
                    {renderFace(player, true, compactScale)}
                </div>
            );
        }

        return (
            <motion.div
                initial={shouldEliminate ? { opacity: 1, y: 0, scale: 1 } : false}
                animate={shouldEliminate
                    ? { opacity: [1, 0.9, 0.48, 0], y: [0, 0, 20, 72], scale: [1, 1, 0.96, 0.9] }
                    : { opacity: 1, y: 0, scale: 1 }
                }
                transition={shouldEliminate
                    ? { delay: 0.15, duration: 2.3, ease: [0.25, 0.1, 0.25, 1], times: [0, 0.35, 0.73, 1] }
                    : { duration: 0.2 }
                }
                className={cardShell}
            >
                {renderFace(player, true, compactScale)}
            </motion.div>
        );
    };

    const render30Board = (mode) => {
        const rowCounts = [10, 10, 10];
        let cursor = 0;

        return (
            <div className="w-full max-w-[98%] mx-auto flex flex-col items-center justify-center -translate-y-8">
                <div className="w-full max-w-[1500px] grid grid-rows-3 gap-4">
                    {rowCounts.map((count) => {
                        const rowStart = cursor;
                        const rowPlayers = sortedPlayers.slice(rowStart, rowStart + count);
                        cursor += count;

                        return (
                            <div key={`row-${rowStart}`} className="grid grid-cols-10 gap-4">
                                {rowPlayers.map((player, colIndex) => {
                                    const flipIndex = rowStart + colIndex;
                                    const rowIndex = Math.floor(rowStart / 10);
                                    const rowBaseDelay = rowIndex * 0.1;
                                    const rowSpanDelay = (colIndex / 9) * 0.8;
                                    const flipDelay = rowBaseDelay + rowSpanDelay;

                                    return <div key={player.id}>{renderRankCard(player, mode, flipIndex, 'normal', flipDelay)}</div>;
                                })}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderPkCard = (player) => (
        <div className="aspect-[5/6] rounded-[20px] border border-white/10 p-2.5 bg-[linear-gradient(180deg,rgba(255,255,255,0.024),rgba(255,255,255,0.01))] backdrop-blur-[4px] shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_14px_30px_rgba(2,6,23,0.22)]">
            {renderFace(player)}
        </div>
    );

    if (stage === 1) {
        return <div className="w-full h-full flex items-center justify-center">{render30Board('stage1-flip')}</div>;
    }

    if (stage === 2 || stage === 3) {
        const top18Players = sortedPlayers.slice(0, 18);
        const isStage3 = stage === 3;
        const stage2Players = isStage3 ? top18Players : (stage2ShiftTop18 ? top18Players : sortedPlayers);

        return (
            <div className="w-full h-full flex items-center justify-center">
                <LayoutGroup id="pick-opponent-stage-flow">
                    <div className="w-full max-w-[98%] mx-auto flex flex-col items-center justify-center -translate-y-8">
                        {isStage3 ? (
                            <div className="relative w-full max-w-[1500px] h-[520px]">
                                <motion.div
                                    layout
                                    className="absolute inset-x-0 top-1/2 -translate-y-1/2 w-full max-w-[1380px] mx-auto grid grid-cols-9 grid-rows-2 gap-4"
                                    transition={{ layout: { duration: 1.8, ease: [0.22, 1, 0.36, 1] } }}
                                >
                                    {top18Players.map((player, idx) => {
                                        const isTop2 = idx < 2;

                                        if (isTop2) {
                                            return <div key={`stage3-gap-${player.id}`} className="aspect-[3/4] rounded-[20px] border border-white/6 bg-white/[0.02] backdrop-blur-[2px]" />;
                                        }

                                        return (
                                            <motion.div
                                                key={player.id}
                                                layout
                                                layoutId={`stage2-card-${player.id}`}
                                                transition={{ layout: { duration: 1.8, ease: [0.22, 1, 0.36, 1] } }}
                                                initial={false}
                                                animate={{ opacity: 0, y: 32, scale: 0.92 }}
                                            >
                                                {renderRankCard(player, 'stage2-static', idx, 'normal')}
                                            </motion.div>
                                        );
                                    })}
                                </motion.div>

                                {top2[0] && (
                                    <motion.div
                                        layout
                                        layoutId={`stage2-card-${top2[0].id}`}
                                        transition={{ layout: { duration: 1.28, ease: [0.25, 0.1, 0.25, 1] } }}
                                        className="absolute top-1/2 left-1/2 w-[372px] -translate-x-[132%] -translate-y-1/2 z-20"
                                    >
                                        {renderRankCard(top2[0], 'stage2-static', 0, 'hero', null, 'demon')}
                                    </motion.div>
                                )}

                                {top2[1] && (
                                    <motion.div
                                        layout
                                        layoutId={`stage2-card-${top2[1].id}`}
                                        transition={{ layout: { duration: 1.28, ease: [0.25, 0.1, 0.25, 1] } }}
                                        className="absolute top-1/2 left-1/2 w-[372px] translate-x-[32%] -translate-y-1/2 z-20"
                                    >
                                        {renderRankCard(top2[1], 'stage2-static', 1, 'hero', null, 'demon')}
                                    </motion.div>
                                )}
                            </div>
                        ) : (
                            <motion.div
                                layout
                                className={`w-full ${stage2ShiftTop18 ? 'max-w-[1380px] grid grid-cols-9 grid-rows-2 gap-4' : 'max-w-[1500px] grid grid-cols-10 grid-rows-3 gap-4'}`}
                                transition={{ layout: { duration: 1.8, ease: [0.22, 1, 0.36, 1] } }}
                            >
                                <AnimatePresence mode="popLayout">
                                    {stage2Players.map((player, idx) => {
                                        const isBottom12 = bottom12Ids.has(player.id);

                                        return (
                                            <motion.div
                                                key={player.id}
                                                layout
                                                layoutId={`stage2-card-${player.id}`}
                                                transition={{ layout: { duration: 1.8, ease: [0.22, 1, 0.36, 1] } }}
                                                exit={isBottom12 ? {
                                                    opacity: [1, 0.9, 0.48, 0],
                                                    y: [0, 0, 20, 72],
                                                    scale: [1, 1, 0.96, 0.9],
                                                    transition: { delay: 0, duration: 0.8, ease: [0.25, 0.1, 0.25, 1], times: [0, 0.34, 0.7, 1] }
                                                } : undefined}
                                            >
                                                {renderRankCard(player, 'stage2-static', idx, stage2ShiftTop18 ? 'large' : 'normal')}
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            </motion.div>
                        )}
                    </div>
                </LayoutGroup>
            </div>
        );
    }

    if (stage === 4 || stage === 5) {
        const isStage4 = stage === 4;
        const matchByChallengerId = new Map(pkMatches.map((match, index) => [match.challengerId, { match, index }]));
        const slotMatchByMasterIndex = new Map(
            stageRows.masters.map((master, idx) => {
                const match = pkMatches.find((m) => m.masterId === master.id);
                return [idx, match || null];
            })
        );

        const slotTransition = {
            layout: { duration: 0.68, ease: [0.22, 1, 0.36, 1] },
            opacity: { duration: 0.18 },
            scale: { duration: 0.68, ease: [0.22, 1, 0.36, 1] },
            y: { duration: 0.68, ease: [0.22, 1, 0.36, 1] }
        };

        return (
            <LayoutGroup id="pick-opponent-stage-flow">
                <div className="w-full h-full max-w-[98%] mx-auto py-1 relative">
                    <motion.div
                        initial={isStage4 ? { scale: 0.9, opacity: 0.98 } : false}
                        animate={{ scale: 0.9, opacity: 1 }}
                        transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute inset-0 origin-center"
                    >
                    {isStage4 && top2[0] && (
                        <motion.div
                            layout
                            layoutId={`stage2-card-${top2[0].id}`}
                            className="absolute top-1/2 left-1/2 w-[372px] -translate-x-[132%] -translate-y-1/2 z-20"
                            initial={false}
                            animate={{ opacity: 0, y: -18, scale: 0.92 }}
                            transition={{ duration: 0.62, ease: [0.25, 0.1, 0.25, 1] }}
                        >
                            {renderRankCard(top2[0], 'stage2-static', 0, 'hero', null, 'demon')}
                        </motion.div>
                    )}

                    {isStage4 && top2[1] && (
                        <motion.div
                            layout
                            layoutId={`stage2-card-${top2[1].id}`}
                            className="absolute top-1/2 left-1/2 w-[372px] translate-x-[32%] -translate-y-1/2 z-20"
                            initial={false}
                            animate={{ opacity: 0, y: -18, scale: 0.92 }}
                            transition={{ duration: 0.62, ease: [0.25, 0.1, 0.25, 1] }}
                        >
                            {renderRankCard(top2[1], 'stage2-static', 1, 'hero', null, 'demon')}
                        </motion.div>
                    )}

                    <motion.div
                        initial={isStage4 ? { opacity: 0, y: 16 } : false}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1], delay: isStage4 ? 0.18 : 0 }}
                        className="absolute left-[4%] right-[4%] grid grid-cols-8 gap-4 opacity-100 z-10"
                        style={{ top: SLOT_ROW_TOP }}
                    >
                        {Array.from({ length: 8 }).map((_, idx) => {
                            const match = slotMatchByMasterIndex.get(idx);
                            const challenger = match ? players.find((p) => p.id === match.challengerId) : null;

                            return (
                                <div key={`slot-master-${idx}`} className="relative">
                                    <div className="aspect-[5/6] rounded-[20px] border border-white/12 shadow-[0_0_5px_rgba(255,255,255,0.22)] opacity-100" />
                                    {match && challenger && (
                                        <motion.div
                                            layout
                                            layoutId={`pk-challenger-${challenger.id}`}
                                            transition={slotTransition}
                                            className="absolute inset-0 z-[120]"
                                            style={{ position: 'absolute' }}
                                        >
                                            {renderPkCard(challenger)}
                                        </motion.div>
                                    )}
                                </div>
                            );
                        })}
                    </motion.div>

                    <div className="absolute left-[4%] right-[4%] grid grid-cols-8 gap-4" style={{ top: STAGE_TOP_ROW }}>
                        {stageRows.masters.map((master, idx) => {
                            return (
                                <motion.div
                                    key={`master-${master.id}`}
                                    layout
                                    layoutId={isStage4 ? `stage2-card-${master.id}` : undefined}
                                    initial={isStage4 ? { opacity: 0, y: -28, scale: 0.95 } : { opacity: 0, y: -24, scale: 0.97 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1], delay: isStage4 ? 0.16 + idx * 0.03 : idx * 0.02 }}
                                    className="z-[120]"
                                    style={{ position: 'relative' }}
                                >
                                    {renderPkCard(master)}
                                </motion.div>
                            );
                        })}
                    </div>

                    <div className="absolute left-[4%] right-[4%] grid grid-cols-8 gap-4" style={{ top: STAGE_BOTTOM_ROW }}>
                        {stageRows.attackers.map((challenger) => {
                            const matchInfo = matchByChallengerId.get(challenger.id);
                            const isMatched = Boolean(matchInfo);

                            if (isMatched) {
                                return <div key={`challenger-empty-${challenger.id}`} />;
                            }

                            return (
                                <motion.div
                                    key={challenger.id}
                                    layout
                                    layoutId={`pk-challenger-${challenger.id}`}
                                    initial={isStage4 ? { opacity: 0, y: 28, scale: 0.9 } : false}
                                    animate={{ y: 0, opacity: 1, scale: 1 }}
                                    transition={{
                                        ...slotTransition,
                                        duration: isStage4 ? 0.42 : 0.68,
                                        delay: isStage4 ? 0.2 : 0
                                    }}
                                    className="z-[120]"
                                    style={{ position: 'relative' }}
                                >
                                    {renderPkCard(challenger)}
                                </motion.div>
                            );
                        })}
                    </div>
                    </motion.div>
                </div>
            </LayoutGroup>
        );
    }

    return null;
}

PickOpponent.propTypes = {
    gameState: PropTypes.shape({
        players: PropTypes.arrayOf(PropTypes.shape({
            id: PropTypes.number.isRequired,
            name: PropTypes.string.isRequired,
            avatar: PropTypes.string,
            score: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
        })).isRequired,
        pickingChallengerId: PropTypes.number,
        pkMatches: PropTypes.arrayOf(PropTypes.shape({
            challengerId: PropTypes.number,
            masterId: PropTypes.number
        })),
        screenTransitionStage: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        transitionStage: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
    }).isRequired
};
