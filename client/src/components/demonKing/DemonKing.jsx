import PropTypes from 'prop-types';
import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getFullAvatarUrl } from '../../utils/avatar';
import { formatPlayerNumber } from '../../utils/playerIdentity';
import { parseDisplayName } from '../../utils/playerName';

// ── 滚动分数动画 ──
function AnimatedScore({ value, targetScore, onComplete }) {
    const [displayValue, setDisplayValue] = useState(0);
    const [passed, setPassed] = useState(false);
    const frameRef = useRef(null);

    useEffect(() => {
        if (frameRef.current) cancelAnimationFrame(frameRef.current);
        setDisplayValue(0);
        setPassed(false);

        const end = Number(value || 0);
        const duration = 1200;
        const startTime = performance.now();

        const tick = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = progress < 0.5
                ? 4 * progress * progress * progress
                : 1 - Math.pow(-2 * progress + 2, 3) / 2;
            const current = end * eased;
            setDisplayValue(current);
            if (current >= targetScore) setPassed(true);
            if (progress < 1) {
                frameRef.current = requestAnimationFrame(tick);
            } else {
                setDisplayValue(end);
                onComplete?.();
            }
        };
        frameRef.current = requestAnimationFrame(tick);
        return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
    }, [value, targetScore, onComplete]);

    return (
        <span style={{ color: passed ? '#6ee7b7' : 'white' }}>
            {displayValue.toFixed(2)}
        </span>
    );
}

// ── 单张大魔王卡片 ──
function DkCard({ dk, targetScore, label }) {
    const rawScore = Number(dk?.scoreDK);
    const hasScore = Number.isFinite(rawScore) && rawScore > 0;
    const isSuccess = hasScore && rawScore > targetScore;
    const isFailed = hasScore && rawScore <= targetScore;

    const [settled, setSettled] = useState(!hasScore);
    const [showOutcome, setShowOutcome] = useState(false);

    const handleComplete = useCallback(() => {
        setSettled(true);
        setTimeout(() => setShowOutcome(true), 500);
    }, []);

    // reset when score changes
    useEffect(() => {
        setSettled(!hasScore);
        setShowOutcome(false);
    }, [hasScore, rawScore]);

    const cardAnimate = showOutcome
        ? (isSuccess
            ? { scale: 1.03, y: -8, opacity: 1 }
            : isFailed
                ? { scale: 0.93, y: 0, opacity: 0.88, filter: 'grayscale(50%)' }
                : { scale: 1, y: 0, opacity: 1 })
        : { scale: 1, y: 0, opacity: 1 };

    const nameLines = parseDisplayName(dk?.name || '');

    return (
        <motion.div
            animate={cardAnimate}
            transition={{ type: 'spring', stiffness: 160, damping: 20 }}
            className="w-[clamp(273px,26.4vw,370px)] min-h-[clamp(354px,44vh,480px)] rounded-[24px] border border-white/20 bg-white/10 backdrop-blur-[20px] shadow-[0_8px_32px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.1)] px-[clamp(18px,1.8vw,28px)] py-[clamp(18px,2vh,28px)] flex flex-col items-center justify-center overflow-hidden"
        >
            {/* 角色标签 */}
            <div className="text-[clamp(0.95rem,1.25vw,1.15rem)] font-black tracking-[0.28em] uppercase text-white/68 text-center">
                {label}
            </div>

            {/* 头像 */}
            <div className="mt-[clamp(14px,1.8vh,22px)] rounded-[24px] p-[3px] bg-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.1)]">
                <img
                    src={getFullAvatarUrl(dk?.avatar)}
                    alt={dk?.name}
                    className="w-[clamp(132px,12vw,172px)] h-[clamp(132px,12vw,172px)] rounded-[20px] border border-white/20 object-cover block"
                />
            </div>

            {/* 名字 */}
            <div className="mt-[clamp(16px,1.8vh,24px)] w-full text-center px-3">
                <div className="text-[clamp(0.86rem,1vw,1rem)] font-black tracking-[0.22em] text-white/54 uppercase">
                    No.{formatPlayerNumber(dk)}
                </div>
                <div className="mt-2 text-center">
                    {nameLines.map((line, i) => (
                        <div
                            key={i}
                            className={i === 0
                                ? 'text-[clamp(1.4rem,2vw,1.9rem)] font-black text-white leading-tight whitespace-nowrap'
                                : 'text-[clamp(0.85rem,1.1vw,1.1rem)] font-black text-white/80 leading-tight mt-0.5 tracking-wide whitespace-nowrap'
                            }
                        >
                            {line}
                        </div>
                    ))}
                </div>
            </div>

            {hasScore && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.88, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.24, ease: 'easeOut' }}
                    className="mt-[clamp(18px,2vh,28px)] text-[clamp(2.3rem,4vw,3.8rem)] leading-none font-mono font-black"
                >
                    <AnimatedScore value={rawScore} targetScore={targetScore} onComplete={handleComplete} />
                </motion.div>
            )}

            {/* 结果徽章 */}
            <AnimatePresence>
                {settled && showOutcome && hasScore && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.85 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ type: 'spring' }}
                        className={`mt-auto w-full py-3 px-4 rounded-[16px] border text-center font-black tracking-[0.1em] text-[clamp(0.9rem,1.2vw,1.1rem)] bg-white/10 backdrop-blur-[20px] ${
                            isSuccess ? 'border-white/20 text-white' : 'border-white/12 text-white/75'
                        }`}
                    >
                        {isSuccess ? '👑 守擂成功 · 直接晋级 👑' : '🛡️ 守擂失败 · 落入待定区 🛡️'}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

// ── 主组件 ──
export default function DemonKing({ gameState }) {
    const players = Array.isArray(gameState?.players) ? gameState.players : [];
    const sortedPlayers = [...players].sort((a, b) => b.score - a.score || a.id - b.id);
    const demonKings = sortedPlayers.slice(0, 2);
    const dk1 = demonKings[0] ?? null;
    const dk2 = demonKings[1] ?? null;

    const referencePlayers = sortedPlayers.slice(2, 18);
    const referencePlayersWithScore = referencePlayers.filter(p => Number.isFinite(Number(p.round2Score)) && Number(p.round2Score) > 0);
    const referenceAverage = referencePlayersWithScore.length > 0
        ? referencePlayersWithScore.reduce((sum, p) => sum + Number(p.round2Score), 0) / referencePlayersWithScore.length
        : 0;
    const targetScore = Number.isFinite(Number(gameState?.demonKingAvgScore))
        ? Number(gameState.demonKingAvgScore)
        : referenceAverage;

    if (!dk1 && !dk2) {
        return <div className="text-center mt-32 text-6xl text-slate-700 font-bold loading-dots">等待大魔王登场...</div>;
    }

    return (
        <div className="flex flex-col items-center justify-start w-full h-full pt-[clamp(4px,0.8vh,10px)] pb-[clamp(6px,1vh,12px)] overflow-hidden">
            {/* 标题 */}
            <h2
                className="text-[clamp(2rem,3.5vw,2.8rem)] font-black mt-[clamp(4px,0.8vh,12px)] mb-[clamp(4px,0.8vh,10px)] text-white tracking-[0.24em]"
                style={{ fontFamily: "'FZHENGFSJW', sans-serif", fontWeight: 900 }}
            >
                大魔王降临
            </h2>

            {/* 两卡 + 中间区域 */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="w-full max-w-[1480px] px-[clamp(12px,1.4vw,20px)] flex-1 min-h-0 grid grid-cols-[minmax(0,1fr)_clamp(120px,10vw,160px)_minmax(0,1fr)] items-start justify-items-center gap-[clamp(4px,0.6vw,10px)] mt-[clamp(0px,0.3vh,4px)] -translate-y-[clamp(12px,1.8vh,24px)]"
            >
                {/* DK 1 */}
                <DkCard dk={dk1} targetScore={targetScore} label="大魔王 壹" />

                {/* 中间分隔 */}
                <div className="flex flex-col items-center justify-end gap-3 h-full pb-[clamp(40px,6vh,70px)]">
                    <div className="translate-y-[clamp(30px,3.8vh,58px)] text-[clamp(1.5rem,1.8vw,1.76rem)] font-black tracking-[0.18em] text-white/42 text-center uppercase">
                        及格线<br />
                        <span className="font-mono text-white/60 text-[clamp(1.7rem,2vw,2rem)]">{targetScore.toFixed(2)}</span>
                    </div>
                </div>

                {/* DK 2 */}
                <DkCard dk={dk2} targetScore={targetScore} label="大魔王 贰" />
            </motion.div>
        </div>
    );
}

DemonKing.propTypes = {
    gameState: PropTypes.shape({
        activeDemonKingId: PropTypes.number,
        demonKingAvgScore: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        players: PropTypes.arrayOf(PropTypes.shape({
            id: PropTypes.number.isRequired,
            name: PropTypes.string,
            avatar: PropTypes.string,
            number: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
            scoreDK: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
            score: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        })),
    }).isRequired,
};

DkCard.propTypes = {
    dk: PropTypes.object,
    targetScore: PropTypes.number.isRequired,
    label: PropTypes.string.isRequired,
};

AnimatedScore.propTypes = {
    value: PropTypes.number.isRequired,
    targetScore: PropTypes.number.isRequired,
    onComplete: PropTypes.func,
};
