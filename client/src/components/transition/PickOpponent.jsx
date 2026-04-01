import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { getFullAvatarUrl } from '../../utils/avatar';
import PlayerIdentity from '../common/PlayerIdentity';

const STAGE_TOP_ROW = '14%';
const STAGE_BOTTOM_ROW = '68%';
const SLOT_ROW_TOP = '38%';

export default function PickOpponent({ gameState }) {
    const { players, pickingChallengerId, pkMatches = [] } = gameState;
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

        setStage2ShiftTop18(false);
        const t = window.setTimeout(() => {
            setStage2ShiftTop18(true);
        }, 3200);

        return () => window.clearTimeout(t);
    }, [stage]);

    const renderFace = (player, compact = true) => (
        <div className={`h-full flex flex-col items-center justify-between text-center ${compact ? 'py-0.5 gap-0.5' : 'py-1.5 gap-1.5'}`}>
            <img
                src={getFullAvatarUrl(player.avatar)}
                alt=""
                className={`${compact ? 'w-10 h-10 rounded-xl' : 'w-24 h-24 rounded-2xl'} border border-white/30 object-cover block`}
            />
            <PlayerIdentity
                player={player}
                compact={compact}
                className="w-full"
                numberClassName={compact ? 'text-[9px] text-teal-200 tracking-[0.16em]' : 'text-xs text-teal-200'}
                nameClassName={compact ? 'text-[10px] font-black text-white truncate text-center' : 'text-[30px] font-black text-white'}
            />
            {compact
                ? <div className="text-[13px] font-black text-teal-100 leading-none">{Number(player.score || 0).toFixed(2)}</div>
                : <div className="text-[34px] font-black text-teal-100 leading-none">{Number(player.score || 0).toFixed(2)}</div>
            }
        </div>
    );

    const renderRankCard = (player, mode, flipIndex = 0) => {
        const shouldEliminate = mode === 'stage2-eliminate' && bottom12Ids.has(player.id);
        const cardShell = 'w-[74%] mx-auto aspect-[3/4] rounded-[14px] border p-1.5 backdrop-blur-md shadow-[inset_0_1px_8px_rgba(255,255,255,0.12),0_4px_10px_rgba(2,6,23,0.25)]';

        if (mode === 'stage1-flip') {
            return (
                <motion.div style={{ perspective: 1000 }} className="w-full">
                    <motion.div
                        initial={{ rotateY: 180, y: 8, scale: 0.97 }}
                        animate={{ rotateY: 0, y: 0, scale: 1 }}
                        transition={{
                            rotateY: { duration: 0.76, ease: [0.22, 0.82, 0.28, 1], delay: flipIndex * 0.062 },
                            y: { duration: 0.5, ease: [0.16, 0.84, 0.44, 1], delay: flipIndex * 0.062 },
                            scale: { duration: 0.5, ease: [0.16, 0.84, 0.44, 1], delay: flipIndex * 0.062 }
                        }}
                        style={{ transformStyle: 'preserve-3d' }}
                        className="relative"
                    >
                        <div style={{ backfaceVisibility: 'hidden' }} className={`${cardShell} bg-gradient-to-br from-teal-500/35 to-cyan-900/20 border-teal-300/55`}>
                            {renderFace(player)}
                        </div>
                        <div style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }} className={`absolute inset-0 ${cardShell} bg-gradient-to-br from-slate-700/80 to-slate-900/95 border-slate-400/35`}>
                            <div className="h-full flex flex-col items-center justify-center">
                                <div className="text-lg tracking-[0.25em] font-black text-slate-300">SUPER</div>
                                <div className="text-sm tracking-[0.2em] font-black text-slate-500">SINGER</div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            );
        }

        if (mode === 'stage2-eliminate' && !shouldEliminate) {
            return (
                <div className={`${cardShell} bg-gradient-to-br from-teal-500/35 to-cyan-900/20 border-teal-300/55`}>
                    {renderFace(player)}
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
                className={`${cardShell} bg-gradient-to-br from-teal-500/35 to-cyan-900/20 border-teal-300/55`}
            >
                {renderFace(player)}
            </motion.div>
        );
    };

    const render30Board = (mode) => {
        const rowCounts = [9, 9, 6, 6];
        let cursor = 0;

        return (
            <div className="w-full max-w-[98%] mx-auto flex flex-col items-center justify-center -translate-y-1">
                <div className="w-full max-w-[1500px] grid grid-rows-4 gap-1">
                    {rowCounts.map((count) => {
                        const rowStart = cursor;
                        const rowPlayers = sortedPlayers.slice(rowStart, rowStart + count);
                        cursor += count;

                        return (
                            <div key={`row-${rowStart}`} className={`grid gap-1 ${count === 9 ? 'grid-cols-9' : 'grid-cols-6 w-[66.7%] mx-auto'}`}>
                                {rowPlayers.map((player, colIndex) => {
                                    const flipIndex = rowStart + colIndex;
                                    return <div key={player.id}>{renderRankCard(player, mode, flipIndex)}</div>;
                                })}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderPkCard = (player, toneClass) => (
        <div className={`aspect-[3/4] rounded-[14px] border p-2 bg-gradient-to-br ${toneClass} backdrop-blur-md shadow-[inset_0_1px_8px_rgba(255,255,255,0.12),0_4px_10px_rgba(2,6,23,0.25)]`}>
            {renderFace(player)}
        </div>
    );

    if (stage === 1) {
        return <div className="w-full h-full flex items-center justify-center">{render30Board('stage1-flip')}</div>;
    }

    if (stage === 2) {
        const rowCounts = [9, 9, 6, 6];
        let cursor = 0;

        return (
            <div className="w-full h-full flex items-center justify-center">
                <div className="w-full max-w-[98%] mx-auto flex flex-col items-center justify-center -translate-y-1">
                    <div className="w-full max-w-[1500px] grid grid-rows-4 gap-1">
                        {rowCounts.map((count) => {
                            const rowStart = cursor;
                            const rowPlayers = sortedPlayers.slice(rowStart, rowStart + count);
                            cursor += count;

                            return (
                                <div key={`s2-row-${rowStart}`} className={`grid gap-1 ${count === 9 ? 'grid-cols-9' : 'grid-cols-6 w-[66.7%] mx-auto'}`}>
                                    {rowPlayers.map((player, colIndex) => {
                                        const idx = rowStart + colIndex;
                                        const isTop18 = idx < 18;
                                        const isBottom12 = bottom12Ids.has(player.id);

                                        if (isBottom12) {
                                            return <div key={player.id}>{renderRankCard(player, 'stage2-eliminate', idx)}</div>;
                                        }

                                        return (
                                            <motion.div
                                                key={player.id}
                                                initial={{ y: 0, opacity: 1, scale: 1 }}
                                                animate={{ y: isTop18 && stage2ShiftTop18 ? 72 : 0, opacity: 1, scale: 1 }}
                                                transition={{ duration: isTop18 ? 0.82 : 0.2, ease: [0.22, 1, 0.36, 1] }}
                                            >
                                                {renderRankCard(player, 'stage2-static', idx)}
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }

    if (stage === 3) {
        return (
            <div className="w-full h-full relative">
                <AnimatePresence>
                    {top2[0] && (
                        <motion.div
                            key={`demon-${top2[0].id}`}
                            className="absolute w-[220px]"
                            initial={{ top: '6%', left: '12%', x: '-50%', y: 0, scale: 0.42, opacity: 1 }}
                            animate={{
                                top: '46%',
                                left: '50%',
                                x: '-270px',
                                y: '-50%',
                                scale: 1.04,
                                opacity: 1
                            }}
                            transition={{
                                duration: 1.28,
                                ease: [0.25, 0.1, 0.25, 1],
                            }}
                        >
                            <div className="aspect-[3/4] rounded-[18px] border border-emerald-300/65 bg-gradient-to-br from-emerald-500/34 to-emerald-900/20 backdrop-blur-md p-3 shadow-[0_20px_40px_rgba(16,185,129,0.28),inset_0_2px_12px_rgba(255,255,255,0.18)]">
                                <div className="text-center text-[11px] tracking-[0.25em] font-black text-emerald-100 mb-2">大魔王</div>
                                {renderFace(top2[0], false, false)}
                            </div>
                        </motion.div>
                    )}

                    {top2[1] && (
                        <motion.div
                            key={`demon-${top2[1].id}`}
                            className="absolute w-[220px]"
                            initial={{ top: '6%', left: '23%', x: '-50%', y: 0, scale: 0.42, opacity: 1 }}
                            animate={{
                                top: '46%',
                                left: '50%',
                                x: '50px',
                                y: '-50%',
                                scale: 1.04,
                                opacity: 1
                            }}
                            transition={{
                                duration: 1.28,
                                ease: [0.25, 0.1, 0.25, 1],
                            }}
                        >
                            <div className="aspect-[3/4] rounded-[18px] border border-emerald-300/65 bg-gradient-to-br from-emerald-500/34 to-emerald-900/20 backdrop-blur-md p-3 shadow-[0_20px_40px_rgba(16,185,129,0.28),inset_0_2px_12px_rgba(255,255,255,0.18)]">
                                <div className="text-center text-[11px] tracking-[0.25em] font-black text-emerald-100 mb-2">大魔王</div>
                                {renderFace(top2[1], false, false)}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    if (stage === 4 || stage === 5) {
        const matchByChallengerId = new Map(pkMatches.map((match, index) => [match.challengerId, { match, index }]));
        const matchByMasterId = new Map(pkMatches.map((match) => [match.masterId, match]));
        const slotMatchByMasterIndex = new Map(
            stageRows.masters.map((master, idx) => {
                const match = pkMatches.find((m) => m.masterId === master.id);
                return [idx, match || null];
            })
        );

        const cardTransition = {
            layout: { duration: 0.82, ease: [0.22, 1, 0.36, 1] },
            opacity: { duration: 0.2 }
        };

        return (
            <LayoutGroup id="stage5-pairing-layout">
                <div className="w-full h-full max-w-[98%] mx-auto py-1 relative">
                    <div className="absolute left-[-1%] right-[-1%] rounded-2xl border border-cyan-200/25 bg-cyan-900/10 backdrop-blur-sm h-[18%]" style={{ top: '72%' }} />

                    <div className="absolute left-1/2 -translate-x-1/2 text-[1.6rem] font-black text-amber-100/90 drop-shadow-[0_0_12px_rgba(251,191,36,0.5)]" style={{ top: '33.5%' }}>
                        ⚔️
                    </div>

                    <div className="absolute left-[3%] right-[3%] grid grid-cols-8 gap-2 opacity-100" style={{ top: SLOT_ROW_TOP }}>
                        {Array.from({ length: 8 }).map((_, idx) => {
                            const match = slotMatchByMasterIndex.get(idx);
                            const challenger = match ? players.find((p) => p.id === match.challengerId) : null;

                            return (
                                <div key={`slot-master-${idx}`} className="relative">
                                    <div className="aspect-[3/4] rounded-[14px] border border-cyan-300/15 bg-cyan-900/8 opacity-100" />
                                    {match && challenger && (
                                        <motion.div
                                            layout
                                            layoutId={`stage5-challenger-${challenger.id}`}
                                            transition={cardTransition}
                                            className="absolute inset-0 z-[120]"
                                            style={{ position: 'absolute' }}
                                        >
                                            {renderPkCard(challenger, 'from-cyan-500/40 to-slate-900/28 border-cyan-300/55')}
                                        </motion.div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div className="absolute left-[3%] right-[3%] grid grid-cols-8 gap-2" style={{ top: STAGE_TOP_ROW }}>
                        {stageRows.masters.map((master, idx) => {
                            const matchedInfo = matchByMasterId.get(master.id);

                            return (
                                <motion.div
                                    key={`master-${master.id}`}
                                    initial={{ opacity: 0, y: -24, scale: 0.97 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1], delay: idx * 0.02 }}
                                    className="z-[120]"
                                    style={{ position: 'relative' }}
                                >
                                    {renderPkCard(master, matchedInfo ? 'from-emerald-500/40 to-emerald-900/26 border-emerald-300/60' : 'from-emerald-500/32 to-emerald-900/20 border-emerald-300/50')}
                                </motion.div>
                            );
                        })}
                    </div>

                    <div className="absolute left-[3%] right-[3%] grid grid-cols-8 gap-2" style={{ top: STAGE_BOTTOM_ROW }}>
                        {stageRows.attackers.map((challenger) => {
                            const isMatched = matchByChallengerId.has(challenger.id);
                            const isPicking = pickingChallengerId === challenger.id;
                            if (isMatched) return <div key={`challenger-empty-${challenger.id}`} />;

                            return (
                                <motion.div
                                    key={challenger.id}
                                    layout
                                    layoutId={`stage5-challenger-${challenger.id}`}
                                    initial={false}
                                    animate={{ y: 0, opacity: 1, scale: isPicking ? 1 : 0.92 }}
                                    transition={{
                                        ...cardTransition,
                                        duration: 0.28
                                    }}
                                    className="z-[120]"
                                    style={{ position: 'relative' }}
                                >
                                    {renderPkCard(challenger, isPicking ? 'from-teal-500/52 to-cyan-900/35 border-teal-300/75' : 'from-teal-700/34 to-slate-900/28 border-slate-500/50')}
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </LayoutGroup>
        );
    }

    return null;
}
