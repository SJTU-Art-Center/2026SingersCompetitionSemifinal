import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getFullAvatarUrl } from '../../utils/avatar';
import PlayerIdentity from '../common/PlayerIdentity';

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

    const Card = ({ player, index, isGlobal, large = false }) => (
        <motion.div
            key={player.id}
            layout
            initial={{ opacity: 0, y: 20, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20, delay: Math.min(index * 0.02, 0.25) }}
            className={`relative aspect-[3/4] rounded-[16px] border backdrop-blur-md overflow-hidden transition-all duration-300 shadow-[inset_0_1px_8px_rgba(255,255,255,0.12),0_6px_16px_rgba(2,6,23,0.3)] ${getRankZoneStyle(index, isGlobal)}`}
        >
            <div className="absolute top-1.5 left-1.5 bg-black/50 text-[10px] px-2 py-0.5 rounded-md font-black text-teal-200 tracking-wide z-10">
                {isGlobal ? `NO.${index + 1}` : `G${currentGroup}-${index + 1}`}
            </div>

            <div className="h-full flex flex-col items-center justify-between text-center p-2.5">
                <img
                    src={getFullAvatarUrl(player.avatar)}
                    alt={player.name}
                    className={`${large ? 'w-16 h-16' : 'w-12 h-12'} rounded-xl border border-white/25 object-cover block`}
                />

                <PlayerIdentity
                    player={player}
                    compact
                    className="w-full"
                    numberClassName="text-[10px] text-slate-300"
                    nameClassName={`${large ? 'text-[15px]' : 'text-[12px]'} font-black text-white truncate text-center`}
                />

                {isGlobal && (
                    <div className="text-[10px] text-slate-300">
                        {index < 2 ? '大魔王区' : index < 10 ? '擂主区' : index < 18 ? '挑战者区' : '淘汰区'}
                    </div>
                )}
                <div className={`${large ? 'text-[34px]' : 'text-[18px]'} font-black font-mono text-teal-100 leading-none`}>
                    <ScoreCounter value={player.score} />
                </div>
            </div>
        </motion.div>
    );

    return (
        <div className="w-full h-full max-w-[96%] mx-auto py-2 flex flex-col">
            {!isGroupMode && (
                <div className="flex justify-between items-end mb-3 px-1">
                    <h2 className="text-2xl font-bold tracking-widest border-l-4 border-teal-500 pl-3 text-[var(--color-text-main)]">
                        第一轮：30进18 全局排位战
                    </h2>
                </div>
            )}

            {isGroupMode ? (
                <div className="flex-1 min-h-0 grid grid-cols-5 gap-2.5 items-center">
                    <AnimatePresence mode="popLayout">
                        {displayPlayers.map((player, index) => (
                            <Card key={player.id} player={player} index={index} isGlobal={false} large />
                        ))}
                    </AnimatePresence>
                </div>
            ) : (
                <div className="flex-1 min-h-0 grid grid-cols-6 grid-rows-5 gap-2">
                    <AnimatePresence mode="popLayout">
                        {displayPlayers.map((player, index) => (
                            <Card key={player.id} player={player} index={index} isGlobal />
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}

// 动态数字滚动组件
function ScoreCounter({ value }) {
    const [displayValue, setDisplayValue] = useState(value);

    useEffect(() => {
        let start = displayValue;
        const end = value;
        if (start === end) return;

        // 如果是 0，跳过缓慢动画直接置零
        if (end === 0) {
            setDisplayValue(0);
            return;
        }

        const duration = 1500;
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
    }, [value]);

    return <span>{displayValue.toFixed(2)}</span>;
}
