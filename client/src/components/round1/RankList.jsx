import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';
import { getFullAvatarUrl } from '../../utils/avatar';
import { formatPlayerNumber } from '../../utils/playerIdentity';
import { parseDisplayName, getNameScale } from '../../utils/playerName';
import PlayerIdentity from '../common/PlayerIdentity';

const GROUP_CARD_CLASS = 'rounded-[24px] border border-white/20 bg-white/10 backdrop-blur-[20px] shadow-[0_8px_32px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.1)] transition-all duration-300 hover:translate-y-[-4px] hover:shadow-[0_12px_40px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.15)]';

// ─── 提取为顶层函数：避免定义在 RankList 内部时每次父渲染生成新引用，
//     导致 React 视为不同组件类型而卸载/重挂载所有卡片，产生入场动画闪烁 ───

function getRankZoneStyle(index, isGlobal) {
    if (!isGlobal) return "bg-gradient-to-br from-emerald-500/20 via-cyan-900/10 to-slate-950/18 border-emerald-300/35 text-teal-50 shadow-[inset_0_1px_10px_rgba(255,255,255,0.12),0_10px_22px_rgba(2,6,23,0.22)] border backdrop-blur-xl";
    if (index < 2) return "bg-[var(--rank-king-bg)] border-[var(--rank-king-border)] text-[var(--rank-king-text)] shadow-[var(--rank-king-shadow)] border-2";
    if (index < 10) return "bg-[var(--rank-master-bg)] border-[var(--rank-master-border)] text-[var(--rank-master-text)] shadow-[var(--rank-master-shadow)] border";
    if (index < 18) return "bg-[var(--rank-challenger-bg)] border-[var(--rank-challenger-border)] text-[var(--rank-challenger-text)] shadow-[var(--rank-challenger-shadow)] border";
    return "bg-[var(--rank-eliminated-bg)] border-[var(--rank-eliminated-border)] text-[var(--rank-eliminated-text)] opacity-70 border";
}

function Card({ player, index, isGlobal, large = false, compactGroup = false, round1ShowScore = true }) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -18, scale: 0.96, transition: { duration: 0.24, ease: 'easeInOut' } }}
            transition={{ type: 'spring', stiffness: 200, damping: 20, delay: Math.min(index * 0.03, 0.25) }}
            className={`relative ${compactGroup ? `${GROUP_CARD_CLASS} h-[360px] px-7 py-5 overflow-hidden` : 'aspect-[3/4]'} ${compactGroup ? '' : `border backdrop-blur-xl overflow-hidden transition-all duration-300 shadow-[inset_0_1px_10px_rgba(255,255,255,0.12),0_12px_26px_rgba(2,6,23,0.28)] ${getRankZoneStyle(index, isGlobal)}`}`}
        >
            <div className={`h-full ${compactGroup ? 'flex flex-col items-center justify-center text-center px-2 gap-4' : 'flex flex-col items-center justify-between text-center p-3'}`}>
                <img
                    src={getFullAvatarUrl(player.avatar)}
                    alt={player.name}
                    className={`${compactGroup ? 'w-[132px] h-[128px]' : large ? 'w-16 h-16' : 'w-12 h-12'} rounded-[30px] border border-white/25 object-cover block shadow-[0_8px_18px_rgba(2,6,23,0.18)]`}
                />

                {compactGroup ? (
                    <>
                        <div className="min-w-0 w-full flex flex-col items-center justify-center px-2 gap-2">
                            <div className="text-[12px] font-black tracking-[0.2em] text-white/58 uppercase text-center">
                                No.{formatPlayerNumber(player)}
                            </div>
                            <div className="font-black text-white leading-snug text-center max-w-full">
                                {(() => {
                                    const baseFontSize = 21;
                                    const lines = parseDisplayName(player.name);
                                    return lines.map((line, i) => {
                                        const scale = getNameScale(line, 5);
                                        const fontSize = scale < 1 ? Math.round(baseFontSize * scale) : baseFontSize;
                                        return <div key={i} style={{ fontSize: `${fontSize}px` }} className="text-center">{line}</div>;
                                    });
                                })()}
                            </div>
                        </div>
                        {/* opacity 过渡淡入；key 随 round1ShowScore 变化，使 ScoreCounter 在显示时重新挂载并重放滚动动画 */}
                        <div
                            className="text-[38px] font-black font-mono text-teal-100 leading-none shrink-0 text-center"
                            style={{ opacity: round1ShowScore ? 1 : 0, transition: 'opacity 0.5s ease' }}
                        >
                            {player.score > 0 && <ScoreCounter key={`score-${player.id}-${round1ShowScore}`} value={player.score} />}
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
                            {player.score > 0 && <ScoreCounter value={player.score} />}
                        </div>
                    </>
                )}
            </div>
        </motion.div>
    );
}

Card.propTypes = {
    player: PropTypes.shape({
        id: PropTypes.number.isRequired,
        number: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        name: PropTypes.string.isRequired,
        avatar: PropTypes.string,
        score: PropTypes.number
    }).isRequired,
    index: PropTypes.number.isRequired,
    isGlobal: PropTypes.bool.isRequired,
    large: PropTypes.bool,
    compactGroup: PropTypes.bool,
    round1ShowScore: PropTypes.bool
};

export default function RankList({ gameState }) {
    const { players, currentGroup, round1Mode, round1ShowScore } = gameState;

    const isGroupMode = round1Mode === 'group';

    // If group mode, just show current group without sorting by score heavily if they haven't finished,
    // actually sorting by score is fine, or sorting by ID. Let's sort by score if they have one, else ID.
    const displayPlayers = isGroupMode
        ? [...players.filter(p => (p.group || 1) === currentGroup)].reverse()
        : [...players].sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            if ((b.judgeScore ?? 0) !== (a.judgeScore ?? 0)) return (b.judgeScore ?? 0) - (a.judgeScore ?? 0);
            return a.id - b.id;
        });

    return (
        <div className="w-full h-full max-w-[98%] mx-auto py-1.5 flex flex-col">
            {!isGroupMode && (
                <div className="flex justify-between items-end mb-2.5 px-1">
                    <h2 className="text-[clamp(1.25rem,1.9vw,1.9rem)] font-bold tracking-[0.18em] border-l-4 border-teal-500 pl-3 text-[var(--color-text-main)]">
                        第一轮：30进18 全局排位战
                    </h2>
                </div>
            )}

            {isGroupMode ? (
                <div className="flex-1 min-h-0 flex items-center justify-center">
                    <div className="w-full max-w-[1480px] px-14 py-2 -mt-10">
                        <div className="grid grid-cols-5 gap-7">
                            <AnimatePresence mode="popLayout">
                                {displayPlayers.map((player, index) => (
                                    <Card
                                        key={`group-row-${player.id}`}
                                        player={player}
                                        index={index}
                                        isGlobal={false}
                                        compactGroup
                                        round1ShowScore={round1ShowScore}
                                    />
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex-1 min-h-0 grid grid-cols-6 grid-rows-5 gap-2">
                    <AnimatePresence mode="popLayout">
                        {displayPlayers.map((player, index) => (
                            <Card
                                key={`global-${player.id}`}
                                player={player}
                                index={index}
                                isGlobal
                                round1ShowScore={round1ShowScore}
                            />
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}

RankList.propTypes = {
    gameState: PropTypes.shape({
        players: PropTypes.arrayOf(PropTypes.shape({
            id: PropTypes.number.isRequired,
            number: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
            name: PropTypes.string.isRequired,
            avatar: PropTypes.string,
            score: PropTypes.number,
            group: PropTypes.number
        })).isRequired,
        currentGroup: PropTypes.number,
        round1Mode: PropTypes.string,
        round1ShowScore: PropTypes.bool
    }).isRequired
};

// 动态数字滚动组件
function ScoreCounter({ value }) {
    const [displayValue, setDisplayValue] = useState(0);
    const displayValueRef = useRef(0);
    const frameRef = useRef(null);

    useEffect(() => {
        if (frameRef.current) {
            cancelAnimationFrame(frameRef.current);
        }

        let start = displayValueRef.current;
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

            displayValueRef.current = current;
            setDisplayValue(current);

            if (progress < 1) {
                frameRef.current = requestAnimationFrame(tick);
            } else {
                displayValueRef.current = end;
                setDisplayValue(end);
            }
        };

        frameRef.current = requestAnimationFrame(tick);

        return () => {
            if (frameRef.current) {
                cancelAnimationFrame(frameRef.current);
            }
        };
    }, [value]);

    return <span>{displayValue.toFixed(2)}</span>;
}

ScoreCounter.propTypes = {
    value: PropTypes.number.isRequired
};
