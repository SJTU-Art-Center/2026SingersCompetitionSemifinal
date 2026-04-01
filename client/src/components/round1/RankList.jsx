import { useEffect, useState } from 'react';
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
        if (!isGlobal) return "bg-gradient-to-br from-emerald-500/24 to-cyan-900/10 border-emerald-300/35 text-teal-50 shadow-[inset_0_1px_8px_rgba(255,255,255,0.12),0_4px_10px_rgba(2,6,23,0.22)] border backdrop-blur-md";
        if (index < 2) return "bg-[var(--rank-king-bg)] border-[var(--rank-king-border)] text-[var(--rank-king-text)] shadow-[var(--rank-king-shadow)] border-2";
        if (index < 10) return "bg-[var(--rank-master-bg)] border-[var(--rank-master-border)] text-[var(--rank-master-text)] shadow-[var(--rank-master-shadow)] border";
        if (index < 18) return "bg-[var(--rank-challenger-bg)] border-[var(--rank-challenger-border)] text-[var(--rank-challenger-text)] shadow-[var(--rank-challenger-shadow)] border";
        return "bg-[var(--rank-eliminated-bg)] border-[var(--rank-eliminated-border)] text-[var(--rank-eliminated-text)] opacity-70 border";
    };

    const Card = ({ player, index, isGlobal, large = false, compactGroup = false }) => (
        <motion.div
            key={player.id}
            layout
            initial={{ opacity: 0, y: 20, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20, delay: Math.min(index * 0.02, 0.25) }}
            className={`relative ${compactGroup ? 'rounded-[18px] min-h-[96px]' : 'aspect-[3/4]'} border backdrop-blur-md overflow-hidden transition-all duration-300 shadow-[inset_0_1px_8px_rgba(255,255,255,0.12),0_6px_16px_rgba(2,6,23,0.3)] ${getRankZoneStyle(index, isGlobal)}`}
        >
            <div className={`absolute top-1.5 left-1.5 bg-black/50 ${compactGroup ? 'text-[9px] px-1.5 py-0.5' : 'text-[10px] px-2 py-0.5'} rounded-md font-black text-teal-200 tracking-wide z-10`}>
                {isGlobal ? `NO.${index + 1}` : `G${currentGroup}-${index + 1}`}
            </div>

            <div className={`h-full ${compactGroup ? 'flex items-center gap-3 px-3 py-2 text-left' : 'flex flex-col items-center justify-between text-center p-2.5'}`}>
                <img
                    src={getFullAvatarUrl(player.avatar)}
                    alt={player.name}
                    className={`${compactGroup ? 'w-11 h-11' : large ? 'w-16 h-16' : 'w-12 h-12'} rounded-xl border border-white/25 object-cover block`}
                />

                {compactGroup ? (
                    <>
                        <div className="flex-1 min-w-0 flex flex-col justify-center gap-1.5">
                            <PlayerIdentity
                                player={player}
                                compact
                                center={false}
                                className="w-full"
                                numberClassName="text-[10px] text-slate-300 tracking-[0.16em]"
                                nameClassName="text-[14px] font-black text-white truncate text-left"
                            />
                            <div className="text-[10px] text-slate-300 tracking-[0.16em] uppercase">当前组内排名</div>
                        </div>
                        <div className="text-[22px] font-black font-mono text-teal-100 leading-none shrink-0">
                            <ScoreCounter value={player.score} />
                        </div>
                    </>
                ) : (
                    <>
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
                    </>
                )}
            </div>
        </motion.div>
    );

    return (
        <div className="w-full h-full max-w-[98%] mx-auto py-1.5 flex flex-col">
            {!isGroupMode && (
                <div className="flex justify-between items-end mb-2 px-1">
                    <h2 className="text-[clamp(1.25rem,1.9vw,1.9rem)] font-bold tracking-[0.18em] border-l-4 border-teal-500 pl-3 text-[var(--color-text-main)]">
                        第一轮：30进18 全局排位战
                    </h2>
                </div>
            )}

            {isGroupMode ? (
                <div className="flex-1 min-h-0 flex items-center justify-center">
                    <div className="w-full max-w-[1320px] grid grid-cols-2 gap-4 px-4">
                        <div className="grid grid-cols-1 gap-3">
                            <AnimatePresence mode="popLayout">
                                {displayPlayers.slice(0, 3).map((player, index) => (
                                    <Card key={player.id} player={player} index={index} isGlobal={false} compactGroup />
                                ))}
                            </AnimatePresence>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                            <AnimatePresence mode="popLayout">
                                {displayPlayers.slice(3, 5).map((player, index) => (
                                    <Card key={player.id} player={player} index={index + 3} isGlobal={false} compactGroup />
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex-1 min-h-0 grid grid-cols-6 grid-rows-5 gap-1.5">
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
