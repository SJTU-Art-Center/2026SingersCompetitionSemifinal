import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getFullAvatarUrl } from '../../utils/avatar';

export default function RankList({ gameState }) {
    const { players, currentGroup, round1Mode } = gameState;

    const isGroupMode = round1Mode === 'group';

    // If group mode, just show current group without sorting by score heavily if they haven't finished,
    // actually sorting by score is fine, or sorting by ID. Let's sort by score if they have one, else ID.
    const displayPlayers = isGroupMode 
        ? players.filter(p => (p.group || 1) === currentGroup)
        : [...players].sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return a.id - b.id;
        });

    const getRankZoneStyle = (index, isGlobal) => {
        if (!isGlobal) return "bg-[var(--rank-challenger-bg)] border-[var(--rank-challenger-border)] text-[var(--rank-challenger-text)] shadow-lg border";
        if (index < 2) return "bg-[var(--rank-king-bg)] border-[var(--rank-king-border)] text-[var(--rank-king-text)] shadow-[var(--rank-king-shadow)] border-2";
        if (index < 10) return "bg-[var(--rank-master-bg)] border-[var(--rank-master-border)] text-[var(--rank-master-text)] shadow-[var(--rank-master-shadow)] border";
        if (index < 18) return "bg-[var(--rank-challenger-bg)] border-[var(--rank-challenger-border)] text-[var(--rank-challenger-text)] shadow-[var(--rank-challenger-shadow)] border";
        return "bg-[var(--rank-eliminated-bg)] border-[var(--rank-eliminated-border)] text-[var(--rank-eliminated-text)] opacity-70 border";
    };

    const getRankLabel = (index, isGlobal) => {
        if (!isGlobal) return "本组展示";
        if (index < 2) return "大魔王区";
        if (index < 10) return "擂主区";
        if (index < 18) return "挑战者区";
        return "淘汰区";
    };

    if (isGroupMode) {
        const orderedGroupPlayers = [...displayPlayers].sort((a, b) => a.id - b.id);
        const revealTick = Number(gameState.round1RevealTick ?? 0);

        return (
            <div className="w-full h-full max-w-[96%] mx-auto py-1">
                <div className="h-full grid grid-rows-5 gap-2">
                        <AnimatePresence mode="popLayout">
                            {orderedGroupPlayers.map((player, index) => (
                                <motion.div
                                    key={player.id}
                                    layout
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ type: 'spring', stiffness: 190, damping: 20 }}
                                    className="rounded-[22px] px-4 py-2 flex items-center justify-between backdrop-blur-md relative overflow-hidden transition-all duration-300 bg-gradient-to-br from-teal-500/35 to-cyan-900/20 border border-teal-300/55 shadow-[inset_0_1px_10px_rgba(255,255,255,0.14),0_8px_20px_rgba(2,6,23,0.34)]"
                                >
                                    <div className="absolute top-1.5 left-3 bg-black/45 text-[10px] px-2 py-0.5 rounded-full font-black text-teal-100 tracking-wider z-10">
                                        第{index + 1}位出场
                                    </div>

                                    <div className="flex items-center space-x-3 mt-2 bg-black/15 backdrop-blur-sm border border-white/10 rounded-full px-3 py-1.5 shadow-inner min-w-0 max-w-[72%]">
                                        <div className="rounded-full p-[2px] bg-gradient-to-b from-white/30 to-white/5 shadow-[0_3px_12px_rgba(0,0,0,0.45)] flex-shrink-0">
                                            <img src={getFullAvatarUrl(player.avatar)} alt={player.name} className="w-12 h-12 rounded-full border border-white/20 shadow-inner object-cover block" />
                                        </div>
                                        <div className="relative z-10 min-w-0">
                                            <h3 className="text-xl font-black tracking-wide truncate">{player.name}</h3>
                                        </div>
                                    </div>

                                    <div className="text-5xl font-black font-mono tracking-tighter pr-2 relative z-10 leading-none">
                                        <ScoreCounter value={player.score} replayKey={revealTick} />
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-7xl mx-auto pb-12">
            <div className="flex justify-between items-end mb-8 mt-12 px-2">
                <h2 className="text-3xl font-bold tracking-widest border-l-4 border-teal-500 pl-4 text-[var(--color-text-main)]">
                    {isGroupMode ? `第一轮：第 ${currentGroup} 组` : "第一轮：30进18 全局排位战"}
                </h2>
                {!isGroupMode && (
                    <div className="flex space-x-6 text-sm font-bold text-[var(--color-text-main)]">
                        <div className="flex items-center"><div className="w-3 h-3 rounded-full mr-2" style={{ background: 'var(--rank-king-border)' }}></div> 大魔王 (2名)</div>
                        <div className="flex items-center"><div className="w-3 h-3 rounded-full mr-2" style={{ background: 'var(--rank-master-border)' }}></div> 擂主 (8名)</div>
                        <div className="flex items-center"><div className="w-3 h-3 rounded-full mr-2" style={{ background: 'var(--rank-challenger-border)' }}></div> 挑战者 (8名)</div>
                    </div>
                )}
            </div>

            <div className={`grid gap-6 ${isGroupMode ? 'grid-cols-1 max-w-3xl mx-auto' : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'}`}>
                <AnimatePresence mode="popLayout">
                    {displayPlayers.map((player, index) => (
                        <motion.div
                            key={player.id}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                            className={`rounded-xl p-4 flex items-center justify-between backdrop-blur-md relative overflow-hidden transition-all duration-300 ${getRankZoneStyle(index, !isGroupMode)}`}
                        >
                            {/* Rank Badge */}
                            <div className="absolute top-0 left-0 bg-black/60 text-xs px-3 py-1 rounded-br-xl font-black text-teal-200 tracking-wider z-10">
                                {isGroupMode ? 'GROUP' : `NO.${index + 1}`} | {getRankLabel(index, !isGroupMode)}
                            </div>

                            <div className="flex items-center space-x-3 mt-2 bg-black/20 backdrop-blur-sm border border-white/10 rounded-full px-3 py-1.5 shadow-inner">
                                <div className="rounded-full p-[2px] bg-gradient-to-b from-white/30 to-white/5 shadow-[0_4px_16px_rgba(0,0,0,0.5)] flex-shrink-0">
                                    <img src={getFullAvatarUrl(player.avatar)} alt={player.name} className="w-14 h-14 rounded-full border border-white/20 shadow-inner object-cover block" />
                                </div>
                                <div className="relative z-10">
                                    <h3 className="text-xl font-bold tracking-wide">{player.name}</h3>
                                </div>
                            </div>
                            <div className={`${isGroupMode ? 'text-6xl' : 'text-5xl'} font-black font-mono tracking-tighter pr-2 relative z-10`}>
                                <ScoreCounter value={player.score} />
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}

// 动态数字滚动组件
function ScoreCounter({ value, replayKey = 0 }) {
    const [displayValue, setDisplayValue] = useState(value);

    useEffect(() => {
        let start = replayKey > 0 ? 0 : displayValue;
        const end = value;
        if (replayKey <= 0 && start === end) return;

        // 如果是 0，跳过缓慢动画直接置零
        if (end === 0) {
            setDisplayValue(0);
            return;
        }

        const duration = replayKey > 0 ? 1200 : 1500;
        const startTime = performance.now();

        const tick = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // easeOutExpo function for cool deceleration
            const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            const current = start + (end - start) * easeProgress;

            setDisplayValue(current);

            if (progress < 1) {
                requestAnimationFrame(tick);
            } else {
                setDisplayValue(end);
            }
        };

        requestAnimationFrame(tick);
    }, [value, replayKey]);

    return <span>{displayValue.toFixed(2)}</span>;
}
