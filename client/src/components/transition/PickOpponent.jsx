import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { getFullAvatarUrl } from '../../utils/avatar';
import PlayerIdentity from '../common/PlayerIdentity';

const STAGE_TOP_ROW = '4%';
const STAGE_BOTTOM_ROW = '80%';
const PK_MASTER_TOP = '31%';
const PK_ATTACKER_TOP = '55%';

export default function PickOpponent({ gameState }) {
    const { players, pickingChallengerId, pkMatches = [] } = gameState;
    const stage = Number(gameState.screenTransitionStage ?? gameState.transitionStage ?? 1);

    const [stage3Phase, setStage3Phase] = useState('arrive');

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
        if (stage !== 3) {
            setStage3Phase('arrive');
            return;
        }

        setStage3Phase('arrive');
        const t = window.setTimeout(() => {
            setStage3Phase('exit');
        }, 2200);

        return () => window.clearTimeout(t);
    }, [stage]);

    const isChallengerMatched = (challengerId) => pkMatches.some((m) => m.challengerId === challengerId);

    const renderFace = (player, compact = true, gold = false) => (
        <div className={`h-full flex flex-col items-center justify-between text-center ${compact ? 'py-1 gap-1' : 'py-3 gap-3'}`}>
            <img
                src={getFullAvatarUrl(player.avatar)}
                alt=""
                className={`${compact ? 'w-11 h-11 rounded-xl' : 'w-24 h-24 rounded-2xl'} border ${gold ? 'border-amber-200/80' : 'border-white/30'} object-cover block`}
            />
            <PlayerIdentity
                player={player}
                compact={compact}
                className="w-full"
                numberClassName={compact ? 'hidden' : 'text-xs text-amber-200'}
                nameClassName={compact ? 'text-[12px] font-black text-white truncate text-center' : 'text-2xl font-black text-white'}
            />
            {compact && <div className="text-[14px] font-black text-teal-100 leading-none">{Number(player.score || 0).toFixed(2)}</div>}
        </div>
    );

    const renderRankCard = (player, mode, flipIndex = 0) => {
        const shouldEliminate = mode === 'stage2-eliminate' && bottom12Ids.has(player.id);
        const cardShell = 'w-[80%] mx-auto aspect-[3/4] rounded-[14px] border p-2 backdrop-blur-md shadow-[inset_0_1px_8px_rgba(255,255,255,0.12),0_4px_10px_rgba(2,6,23,0.25)]';

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
                    ? { opacity: [1, 0.9, 0.48, 0], y: [0, 0, 18, 64], scale: [1, 1, 0.96, 0.9] }
                    : { opacity: 1, y: 0, scale: 1 }
                }
                transition={shouldEliminate
                    ? { delay: 0.15, duration: 2.2, ease: [0.25, 0.1, 0.25, 1], times: [0, 0.35, 0.73, 1] }
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
            <div className="w-full max-w-[96%] mx-auto flex flex-col items-center justify-center">
                <div className="w-full max-w-[1240px] grid grid-rows-4 gap-0.5">
                    {rowCounts.map((count) => {
                        const rowStart = cursor;
                        const rowPlayers = sortedPlayers.slice(rowStart, rowStart + count);
                        cursor += count;

                        return (
                            <div key={`row-${rowStart}`} className={`grid gap-0.5 ${count === 9 ? 'grid-cols-9' : 'grid-cols-6 w-[66.7%] mx-auto'}`}>
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
        return <div className="w-full h-full flex items-center justify-center">{render30Board('stage2-eliminate')}</div>;
    }

    if (stage === 3) {
        return (
            <div className="w-full h-full relative">
                <AnimatePresence>
                    {top2[0] && (
                        <motion.div
                            key={`demon-${top2[0].id}`}
                            className="absolute w-[250px]"
                            initial={{ top: '4%', left: '5.5%', x: '-50%', y: 0, scale: 0.44, opacity: 1 }}
                            animate={stage3Phase === 'exit'
                                ? { top: '50%', left: '50%', x: '-980px', y: '-50%', scale: 1.03, opacity: 0 }
                                : {
                                    top: '50%',
                                    left: '50%',
                                    x: '-325px',
                                    y: '-50%',
                                    scale: 1.16,
                                    opacity: 1
                                }
                            }
                            transition={stage3Phase === 'exit'
                                ? { duration: 0.68, ease: [0.32, 0.72, 0, 1] }
                                : {
                                    duration: 1.28,
                                    ease: [0.25, 0.1, 0.25, 1],
                                }
                            }
                        >
                            <div className="aspect-[3/4] rounded-[18px] border border-amber-300/75 bg-gradient-to-br from-amber-400/58 via-yellow-500/40 to-yellow-900/25 backdrop-blur-md p-4 shadow-[0_24px_48px_rgba(245,158,11,0.45),inset_0_2px_12px_rgba(255,255,255,0.22)]">
                                <div className="text-center text-[11px] tracking-[0.25em] font-black text-amber-100 mb-2">大魔王</div>
                                {renderFace(top2[0], false, true)}
                            </div>
                        </motion.div>
                    )}

                    {top2[1] && (
                        <motion.div
                            key={`demon-${top2[1].id}`}
                            className="absolute w-[250px]"
                            initial={{ top: '4%', left: '16.5%', x: '-50%', y: 0, scale: 0.44, opacity: 1 }}
                            animate={stage3Phase === 'exit'
                                ? { top: '50%', left: '50%', x: '980px', y: '-50%', scale: 1.03, opacity: 0 }
                                : {
                                    top: '50%',
                                    left: '50%',
                                    x: '75px',
                                    y: '-50%',
                                    scale: 1.16,
                                    opacity: 1
                                }
                            }
                            transition={stage3Phase === 'exit'
                                ? { duration: 0.68, ease: [0.32, 0.72, 0, 1] }
                                : {
                                    duration: 1.28,
                                    ease: [0.25, 0.1, 0.25, 1],
                                }
                            }
                        >
                            <div className="aspect-[3/4] rounded-[18px] border border-amber-300/75 bg-gradient-to-br from-amber-400/58 via-yellow-500/40 to-yellow-900/25 backdrop-blur-md p-4 shadow-[0_24px_48px_rgba(245,158,11,0.45),inset_0_2px_12px_rgba(255,255,255,0.22)]">
                                <div className="text-center text-[11px] tracking-[0.25em] font-black text-amber-100 mb-2">大魔王</div>
                                {renderFace(top2[1], false, true)}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    if (stage === 4) {
        return (
            <div className="w-full h-full max-w-[96%] mx-auto py-2 relative">
                <div className="absolute left-0 right-0 grid grid-cols-8 gap-2" style={{ top: STAGE_TOP_ROW }}>
                    {stageRows.masters.map((master, idx) => (
                        <motion.div
                            key={`stage4-master-${master.id}`}
                            initial={{ opacity: 0, x: -84, y: -20, scale: 0.97 }}
                            animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                            transition={{ duration: 0.46, ease: [0.22, 1, 0.36, 1], delay: idx * 0.028 }}
                        >
                            {renderPkCard(master, 'from-emerald-500/34 to-emerald-900/20 border-emerald-300/50')}
                        </motion.div>
                    ))}
                </div>

                <div className="absolute left-[6%] right-[6%] grid grid-cols-8 gap-2" style={{ top: PK_MASTER_TOP }}>
                    {Array.from({ length: 8 }).map((_, idx) => (
                        <div key={`stage4-gap-top-${idx}`} className="aspect-[3/4] rounded-[14px] border border-emerald-300/15 bg-emerald-900/8" />
                    ))}
                </div>

                <div className="absolute left-[6%] right-[6%] grid grid-cols-8 gap-2" style={{ top: PK_ATTACKER_TOP }}>
                    {Array.from({ length: 8 }).map((_, idx) => (
                        <div key={`stage4-gap-bottom-${idx}`} className="aspect-[3/4] rounded-[14px] border border-cyan-300/15 bg-cyan-900/8" />
                    ))}
                </div>

                <div className="absolute left-0 right-0 grid grid-cols-8 gap-2" style={{ top: STAGE_BOTTOM_ROW }}>
                    {stageRows.attackers.map((challenger, idx) => (
                        <motion.div
                            key={`stage4-challenger-${challenger.id}`}
                            initial={{ opacity: 0, x: 84, y: 20, scale: 0.97 }}
                            animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                            transition={{ duration: 0.46, ease: [0.22, 1, 0.36, 1], delay: idx * 0.028 }}
                        >
                            {renderPkCard(challenger, 'from-cyan-500/36 to-slate-900/24 border-cyan-300/55')}
                        </motion.div>
                    ))}
                </div>
            </div>
        );
    }

    if (stage === 5) {
        const matchByMasterId = new Map(pkMatches.map((match, index) => [match.masterId, { match, index }]));
        const matchByChallengerId = new Map(pkMatches.map((match, index) => [match.challengerId, { match, index }]));

        const cardTransition = {
            layout: { duration: 0.82, ease: [0.22, 1, 0.36, 1] },
            opacity: { duration: 0.2 }
        };

        return (
            <LayoutGroup id="stage5-pairing-layout">
                <div className="w-full h-full max-w-[96%] mx-auto py-2 relative">
                    <div className="absolute left-[6%] right-[6%] grid grid-cols-8 gap-2 opacity-100" style={{ top: PK_MASTER_TOP }}>
                        {Array.from({ length: 8 }).map((_, idx) => {
                            const match = pkMatches[idx];
                            const master = match ? players.find((p) => p.id === match.masterId) : null;

                            return (
                                <div key={`slot-master-${idx}`} className="relative">
                                    <div className="aspect-[3/4] rounded-[14px] border border-emerald-300/15 bg-emerald-900/8 opacity-100" />
                                    {match && master && (
                                        <motion.div
                                            layout
                                            layoutId={`stage5-master-${master.id}`}
                                            transition={cardTransition}
                                            className="absolute inset-0 z-[120]"
                                            style={{ position: 'absolute' }}
                                        >
                                            {renderPkCard(master, 'from-emerald-500/42 to-emerald-900/28 border-emerald-300/60')}
                                        </motion.div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div className="absolute left-[6%] right-[6%] grid grid-cols-8 gap-2 opacity-100" style={{ top: PK_ATTACKER_TOP }}>
                        {Array.from({ length: 8 }).map((_, idx) => {
                            const match = pkMatches[idx];
                            const challenger = match ? players.find((p) => p.id === match.challengerId) : null;

                            return (
                                <div key={`slot-challenger-${idx}`} className="relative">
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

                    <div className="absolute left-0 right-0 grid grid-cols-8 gap-2" style={{ top: STAGE_TOP_ROW }}>
                        {stageRows.masters.map((master) => {
                            const matchedInfo = matchByMasterId.get(master.id);
                            if (matchedInfo) return <div key={`master-empty-${master.id}`} />;

                            return (
                                <motion.div
                                    key={`master-${master.id}`}
                                    layout
                                    layoutId={`stage5-master-${master.id}`}
                                    transition={cardTransition}
                                    className="z-[120]"
                                    style={{ position: 'relative' }}
                                >
                                    {renderPkCard(master, 'from-emerald-500/32 to-emerald-900/20 border-emerald-300/50')}
                                </motion.div>
                            );
                        })}
                    </div>

                    <div className="absolute left-0 right-0 grid grid-cols-8 gap-2" style={{ top: STAGE_BOTTOM_ROW }}>
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
                                    animate={{ y: 0, opacity: 1, scale: isPicking ? 1.05 : 1 }}
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
