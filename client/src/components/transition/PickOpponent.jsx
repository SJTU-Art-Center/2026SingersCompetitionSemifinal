import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getFullAvatarUrl } from '../../utils/avatar';

export default function PickOpponent({ gameState }) {
    const { players, pickingChallengerId, pkMatches = [] } = gameState;
    const stage = Number(gameState.screenTransitionStage ?? gameState.transitionStage ?? 1);

    const sortedPlayers = [...players].sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.id - b.id;
    });

    const orderedById = [...players].sort((a, b) => a.id - b.id);
    const top2 = sortedPlayers.slice(0, 2);
    const top3To10 = sortedPlayers.slice(2, 10);
    const top11To18 = sortedPlayers.slice(10, 18);
    const bottom12Ids = new Set(sortedPlayers.slice(18).map((p) => p.id));

    const getMatchForMaster = (masterId) => pkMatches.find((m) => m.masterId === masterId);
    const isChallengerMatched = (challengerId) => pkMatches.some((m) => m.challengerId === challengerId);

    const getRankLabel = (rank) => {
        if (rank <= 2) return '大魔王';
        if (rank <= 10) return '擂主';
        if (rank <= 18) return '挑战者';
        return '淘汰';
    };

    const getToneByRank = (rank) => {
        if (rank <= 2) return 'from-amber-500/45 to-yellow-700/25 border-amber-300/65';
        if (rank <= 10) return 'from-emerald-500/40 to-emerald-800/25 border-emerald-300/60';
        if (rank <= 18) return 'from-teal-500/35 to-cyan-900/20 border-teal-300/55';
        return 'from-slate-500/25 to-slate-900/40 border-slate-500/45';
    };

    const renderTwoColumnRow = (player, mode, orderIndex) => {
        const rank = sortedPlayers.findIndex((x) => x.id === player.id) + 1;
        const rankLabel = getRankLabel(rank);
        const showMeta = mode !== 'uniform';
        const isStage2Bottom = mode === 'fadeOutBottom12' && bottom12Ids.has(player.id);

        let tone = 'from-teal-500/35 to-cyan-900/20 border-teal-300/55';
        if (mode !== 'uniform') {
            tone = getToneByRank(rank);
        }

        return (
            <motion.div
                key={player.id}
                layout
                initial={mode === 'uniform' ? { opacity: 0, scale: 0.9, y: 14 } : false}
                animate={isStage2Bottom
                    ? {
                        opacity: [1, 0.38, 0],
                        y: [0, 4, 20],
                        scale: [1, 0.985, 0.95]
                    }
                    : { opacity: 1, y: 0, scale: 1 }
                }
                transition={isStage2Bottom
                    ? {
                        duration: 1.45,
                        ease: [0.25, 0.1, 0.25, 1],
                        times: [0, 0.42, 1]
                    }
                    : mode === 'uniform'
                        ? {
                            type: 'spring',
                            stiffness: 165,
                            damping: 19,
                            delay: Math.min(orderIndex * 0.018, 0.25)
                        }
                        : { type: 'spring', stiffness: 170, damping: 20 }
                }
                className={`h-full rounded-[16px] border px-2 py-1 bg-gradient-to-br ${tone} backdrop-blur-md shadow-[inset_0_1px_8px_rgba(255,255,255,0.12),0_4px_10px_rgba(2,6,23,0.25)]`}
            >
                <motion.div
                    className="h-full flex items-center gap-2"
                    animate={isStage2Bottom
                        ? {
                            opacity: [1, 1, 0],
                            y: [0, 2, 26],
                            scale: [1, 0.99, 0.94]
                        }
                        : { opacity: 1, y: 0, scale: 1 }
                    }
                    transition={isStage2Bottom
                        ? {
                            duration: 1.45,
                            ease: [0.25, 0.1, 0.25, 1],
                            times: [0, 0.36, 1]
                        }
                        : { duration: 0.22 }
                    }
                >
                    <img src={getFullAvatarUrl(player.avatar)} alt="" className="w-7 h-7 rounded-full border border-white/25 object-cover block" />
                    <div className="min-w-0 flex-1 flex items-center gap-3.5">
                        <div className="min-w-0 flex-1 text-[14px] leading-[1.05rem] font-black truncate text-white">{player.name}</div>
                        {showMeta && (
                            <>
                                <div className="w-[74px] text-[13px] leading-[1rem] text-slate-200 font-bold text-center shrink-0">{rankLabel}</div>
                                <div className="w-[60px] text-[13px] leading-[1rem] text-slate-100 font-black text-right shrink-0">NO.{rank}</div>
                            </>
                        )}
                    </div>
                    <div className="ml-auto font-black text-teal-200 text-[15px]">{Number(player.score || 0).toFixed(2)}</div>
                </motion.div>
            </motion.div>
        );
    };

    const renderTwoColumnBoard = (mode) => {
        const boardPlayers = mode === 'ranked' ? sortedPlayers.slice(0, 18) : orderedById;
        const columnSize = mode === 'ranked' ? 9 : 15;
        const left = boardPlayers.slice(0, columnSize);
        const right = boardPlayers.slice(columnSize, columnSize * 2);

        const itemMode = mode === 'uniform'
            ? 'uniform'
            : mode === 'ranked'
                ? 'ranked'
                : 'fadeOutBottom12';

        return (
            <div className="w-full h-full max-w-[96%] mx-auto py-1">
                <div className="h-full grid grid-cols-2 gap-2">
                    <motion.div layout className="rounded-2xl border border-slate-700/70 bg-slate-900/40 p-2 overflow-hidden">
                        <div className="h-full grid gap-1" style={{ gridTemplateRows: `repeat(${columnSize}, minmax(0, 1fr))` }}>
                            {left.map((player, index) => renderTwoColumnRow(player, itemMode, index))}
                        </div>
                    </motion.div>
                    <motion.div layout className="rounded-2xl border border-slate-700/70 bg-slate-900/40 p-2 overflow-hidden">
                        <div className="h-full grid gap-1" style={{ gridTemplateRows: `repeat(${columnSize}, minmax(0, 1fr))` }}>
                            {right.map((player, index) => renderTwoColumnRow(player, itemMode, columnSize + index))}
                        </div>
                    </motion.div>
                </div>
            </div>
        );
    };

    if (stage === 1) {
        return renderTwoColumnBoard('uniform');
    }

    if (stage === 2) {
        return renderTwoColumnBoard('fadeOutBottom12');
    }

    if (stage === 3) {
        return renderTwoColumnBoard('ranked');
    }

    if (stage === 4) {
        return (
            <div className="w-full h-full max-w-[96%] mx-auto py-2 flex items-center justify-center">
                <div className="flex justify-center gap-6 w-full">
                    {top2.map((p) => (
                        <motion.div
                            key={p.id}
                            layoutId={`king-focus-${p.id}`}
                            initial={{ opacity: 0, scale: 0.75, y: 20 }}
                            animate={{ opacity: 1, scale: 1.03, y: 0 }}
                            className="w-[280px] rounded-[30px] border border-amber-300/70 bg-gradient-to-br from-amber-400/45 to-yellow-900/25 backdrop-blur-md p-5 shadow-[0_16px_36px_rgba(245,158,11,0.34),inset_0_2px_12px_rgba(255,255,255,0.2)]"
                        >
                            <div className="text-center text-[10px] tracking-[0.25em] font-black text-amber-100 mb-2">大魔王</div>
                            <div className="flex flex-col items-center">
                                <img src={getFullAvatarUrl(p.avatar)} alt="" className="w-20 h-20 rounded-full border-2 border-amber-200/80 object-cover" />
                                <div className="mt-2.5 text-xl font-black text-white text-center leading-tight">{p.name}</div>
                                <div className="text-amber-100 font-bold mt-1 text-sm">NO.{sortedPlayers.findIndex((x) => x.id === p.id) + 1}</div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        );
    }

    if (stage === 5) {
        const showPairing = true;

        return (
            <div className="w-full h-full max-w-[96%] mx-auto pb-2 pt-1 flex flex-col">
                <div className="mb-4">
                    <div className="grid grid-cols-4 gap-3">
                        {top3To10.map((master) => {
                            const match = getMatchForMaster(master.id);
                            const matchedChallenger = showPairing && match ? players.find((p) => p.id === match.challengerId) : null;

                            return (
                                <motion.div
                                    key={master.id}
                                    layout
                                    initial={{ opacity: 0, y: 16, scale: 0.94 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 170, damping: 18 }}
                                    className="relative rounded-[26px] border border-emerald-300/50 bg-gradient-to-br from-emerald-500/30 to-emerald-900/20 p-4 backdrop-blur-md shadow-[0_16px_36px_rgba(16,185,129,0.26),inset_0_2px_10px_rgba(255,255,255,0.12)]"
                                >
                                    <div className="absolute top-2 left-2 bg-emerald-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">擂主</div>
                                    <div className="flex flex-col items-center pt-2">
                                        <img src={getFullAvatarUrl(master.avatar)} alt="" className="w-16 h-16 rounded-full border border-emerald-300/60 object-cover block" />
                                        <div className="text-base font-black text-white mt-2">{master.name}</div>
                                        <div className="text-[11px] text-emerald-200">NO.{sortedPlayers.findIndex((x) => x.id === master.id) + 1}</div>
                                    </div>

                                    <div className={`mt-4 w-full rounded-2xl flex items-center p-2 border ${matchedChallenger ? 'bg-teal-900/50 border-teal-500/40' : 'bg-slate-900/45 border-dashed border-slate-600'}`}>
                                        {matchedChallenger ? (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.82, y: 14 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                transition={{ type: 'spring', stiffness: 180, damping: 18 }}
                                                className="w-full flex items-center justify-between"
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <img src={getFullAvatarUrl(matchedChallenger.avatar)} alt="" className="w-7 h-7 rounded-full border border-teal-300/40 object-cover block" />
                                                    <span className="text-xs font-bold text-teal-200 truncate max-w-[98px]">{matchedChallenger.name}</span>
                                                </div>
                                                <span className="text-[10px] text-red-300 font-bold border border-red-400/50 px-1 rounded">VS</span>
                                            </motion.div>
                                        ) : (
                                            <div className="w-full text-center text-xs text-slate-500 italic py-2">等待挑选...</div>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                <div>
                    <div className="grid grid-cols-8 gap-2.5">
                        <AnimatePresence>
                            {top11To18.map((challenger) => {
                                const isMatched = isChallengerMatched(challenger.id);
                                const isPicking = pickingChallengerId === challenger.id;

                                if (showPairing && isMatched) return null;

                                return (
                                    <motion.div
                                        key={challenger.id}
                                        layout
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1, scale: isPicking ? 1.05 : 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.5, y: -50 }}
                                        transition={{ duration: 0.28 }}
                                        className={`relative rounded-[24px] p-3 flex flex-col items-center border transition-all duration-300 bg-gradient-to-br backdrop-blur-md shadow-[inset_0_1px_8px_rgba(255,255,255,0.1),0_6px_18px_rgba(2,6,23,0.3)] ${isPicking ? 'from-teal-500/50 to-cyan-900/30 border-teal-300 z-20' : 'from-teal-700/30 to-slate-900/35 border-slate-600 opacity-85'}`}
                                    >
                                        {isPicking && (
                                            <div className="absolute -top-3 bg-teal-400 text-teal-900 text-[10px] px-2 py-0.5 rounded-full shadow-lg font-black">正在挑选</div>
                                        )}
                                        <img src={getFullAvatarUrl(challenger.avatar)} alt="" className={`w-14 h-14 rounded-full border object-cover block ${isPicking ? 'border-teal-100/70' : 'border-slate-500/60'}`} />
                                        <span className={`text-xs font-bold text-center w-full truncate mt-1 ${isPicking ? 'text-teal-100' : 'text-slate-300'}`}>{challenger.name}</span>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>

                        {showPairing && top11To18.filter((c) => !isChallengerMatched(c.id)).length === 0 && (
                            <div className="col-span-8 text-center text-teal-200 text-2xl font-black py-8 tracking-widest bg-teal-900/25 rounded-2xl border border-teal-600/40">
                                所有挑战者挑选完成 🎉
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return null;
}
