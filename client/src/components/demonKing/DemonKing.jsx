import PropTypes from 'prop-types';
import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getFullAvatarUrl } from '../../utils/avatar';
import PlayerIdentity from '../common/PlayerIdentity';

export default function DemonKing({ gameState }) {
    const activeDemonKingId = gameState?.activeDemonKingId ?? null;
    const players = Array.isArray(gameState?.players) ? gameState.players : [];
    const rawTargetScore = Number(gameState?.demonKingAvgScore);
    const targetScore = Number.isFinite(rawTargetScore) ? rawTargetScore : 0;

    const dk = players.find(p => p.id === activeDemonKingId);

    const rawFinalScore = Number(dk?.scoreDK);
    const hasDkScore = Number.isFinite(rawFinalScore) && rawFinalScore > 0;
    const finalScore = hasDkScore ? rawFinalScore : 0;
    const isSuccess = hasDkScore && finalScore > targetScore;
    const isFailed = hasDkScore && finalScore <= targetScore;
    const [isScoreSettled, setIsScoreSettled] = useState(false);
    const [showOutcome, setShowOutcome] = useState(false);

    const revealedIsSuccess = showOutcome && isSuccess;
    const revealedIsFailed = showOutcome && isFailed;

    const handleScoreComplete = useCallback(() => {
        setIsScoreSettled(true);
        window.setTimeout(() => {
            setShowOutcome(true);
        }, 500);
    }, []);

    useEffect(() => {
        setIsScoreSettled(!hasDkScore);
        setShowOutcome(false);
    }, [hasDkScore, finalScore]);

    if (!dk) {
        return <div className="text-center mt-32 text-6xl text-slate-700 font-bold loading-dots">等待大魔王登场...</div>;
    }

    return (
        <div className="flex flex-col items-center justify-start w-full h-full pt-[clamp(4px,0.8vh,10px)] pb-[clamp(6px,1vh,12px)] overflow-hidden">
            <motion.h2
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-[clamp(1.65rem,3vw,2.25rem)] font-black mt-[clamp(4px,0.8vh,12px)] mb-[clamp(4px,0.8vh,10px)] text-transparent bg-clip-text bg-[linear-gradient(to_bottom,rgba(255,255,255,0.96),rgba(220,240,255,0.72))] tracking-[0.24em] italic drop-shadow-[0_0_18px_rgba(255,255,255,0.12)]"
            >
                大魔王降临
            </motion.h2>

            <div className="w-full flex-1 min-h-0 relative z-10 flex items-center justify-center overflow-hidden">
                <div className="w-full max-w-[clamp(820px,82vw,1220px)]">
                    <motion.div
                        animate={{
                            scale: revealedIsSuccess ? 1.03 : (revealedIsFailed ? 0.9 : 1),
                            y: revealedIsSuccess ? -8 : 0,
                            opacity: revealedIsFailed ? 0.9 : 1,
                            filter: revealedIsFailed ? 'grayscale(60%)' : 'grayscale(0%)'
                        }}
                        transition={{ type: 'spring' }}
                        className={`min-h-[clamp(330px,44vh,470px)] bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.018))] border rounded-[34px] px-[clamp(28px,3vw,42px)] py-[clamp(24px,3vh,34px)] flex items-stretch gap-[clamp(26px,3vw,48px)] w-full overflow-hidden backdrop-blur-[10px] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_24px_48px_rgba(2,6,23,0.26)] ${revealedIsSuccess ? 'border-white/20' : (revealedIsFailed ? 'border-white/10 opacity-92' : 'border-white/14')}`}
                    >
                        <div className="shrink-0 w-[clamp(220px,24vw,310px)] flex flex-col items-center justify-center gap-[clamp(18px,2.3vh,26px)] py-[clamp(8px,1vh,14px)]">
                            <div className="rounded-[2.1rem] p-[4px] bg-[linear-gradient(180deg,rgba(255,255,255,0.32),rgba(255,255,255,0.08))] shadow-[0_12px_24px_rgba(2,6,23,0.18)]">
                                <img src={getFullAvatarUrl(dk.avatar)} alt={dk.name} className="w-[clamp(126px,12.8vw,170px)] h-[clamp(126px,12.8vw,170px)] rounded-[1.8rem] border-[3px] border-white/18 object-cover block" />
                            </div>
                            <PlayerIdentity
                                player={dk}
                                className="text-center"
                                numberPrefix="No."
                                numberClassName="text-[clamp(0.9rem,1.15vw,1.05rem)] text-white/56 tracking-[0.18em]"
                                nameClassName="text-[clamp(1.5rem,2vw,2rem)] font-black tracking-[0.08em] text-white"
                            />
                        </div>

                        <div className="w-full min-w-0 flex-1 flex flex-col justify-between gap-[clamp(22px,2.8vh,34px)] py-[clamp(6px,0.8vh,12px)]">
                            <div className="w-full flex flex-col items-end gap-[clamp(10px,1.2vh,14px)]">
                                <div className="flex items-center gap-3 text-white/72 font-bold text-[clamp(0.84rem,1vw,0.96rem)] tracking-[0.14em]">
                                    <span>🏆 及格线 (16人均分)</span>
                                    <span className="font-mono text-[clamp(1.08rem,1.45vw,1.34rem)] text-white/88">{targetScore.toFixed(2)}</span>
                                </div>
                                <div className="w-full h-[2px] bg-white/34 relative overflow-hidden rounded-full">
                                    <div className="absolute top-1/2 right-0 -translate-y-1/2 w-3 h-3 bg-white/82 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.45)]"></div>
                                </div>
                            </div>

                            <div className="w-full flex-1 min-h-0 flex flex-col items-center justify-center rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.012))] px-[clamp(20px,2vw,28px)] py-[clamp(22px,3vh,32px)] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                                <div className="text-white/55 font-bold text-[clamp(0.84rem,1vw,0.96rem)] tracking-[0.2em] mb-[clamp(8px,1vh,12px)]">大魔王第二轮得分</div>
                                <div className="text-[clamp(2.6rem,4.6vw,4.35rem)] leading-none font-mono font-black text-transparent bg-clip-text bg-[linear-gradient(to_bottom,rgba(255,255,255,0.96),rgba(255,255,255,0.58))] text-center">
                                    {hasDkScore ? (
                                        <AnimatedScore value={finalScore} target={targetScore} isSuccess={isSuccess} onComplete={handleScoreComplete} />
                                    ) : (
                                        <span className="text-white/28">???</span>
                                    )}
                                </div>
                                <div className="mt-[clamp(14px,1.8vh,20px)] text-[clamp(0.86rem,1vw,0.96rem)] tracking-[0.16em] text-white/42 text-center">
                                    分数公布后将自动判定是否直接晋级十强
                                </div>
                            </div>

                            <AnimatePresence>
                                {hasDkScore && isScoreSettled && showOutcome && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 50, scale: 0.8 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        transition={{ type: 'spring' }}
                                        className={`w-full min-h-[clamp(62px,8vh,84px)] px-[clamp(18px,2vw,28px)] py-[clamp(14px,1.8vh,18px)] flex items-center justify-center text-center text-[clamp(1.04rem,1.5vw,1.32rem)] font-black tracking-[0.12em] rounded-[24px] shadow-lg border backdrop-blur-[8px] ${revealedIsSuccess ? 'bg-white/10 border-white/18 text-white shadow-[0_0_28px_rgba(255,255,255,0.14)]' : 'bg-white/6 border-white/12 text-white/82 shadow-[0_0_18px_rgba(255,255,255,0.08)]'}`}
                                    >
                                        {revealedIsSuccess ? '👑 守擂成功 · 直接晋级 👑' : '🛡️ 守擂失败 · 落入待定区 🛡️'}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

function AnimatedScore({ value, target, isSuccess, onComplete }) {
    const [displayValue, setDisplayValue] = useState(0);
    const [colorClass, setColorClass] = useState("from-white to-slate-400");

    useEffect(() => {
        setDisplayValue(0);
        setColorClass("from-white to-slate-400");

        const start = 0;
        const end = value;
        const duration = 1000;
        const startTime = performance.now();

        const tick = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // 缓动函数
            const easeProgress = progress < 0.5
                ? 4 * progress * progress * progress
                : 1 - Math.pow(-2 * progress + 2, 3) / 2;

            const current = start + (end - start) * easeProgress;

            setDisplayValue(current);

            // 当突破红线瞬间，绿色
            if (current >= target) {
                setColorClass("from-teal-200 to-emerald-400");
            }

            if (progress < 1) {
                requestAnimationFrame(tick);
            } else {
                setDisplayValue(end);
                if (!isSuccess) {
                    setColorClass("from-slate-400 to-slate-600");
                }
                onComplete();
            }
        };

        requestAnimationFrame(tick);
    }, [value, target, isSuccess, onComplete]);

    return <span className={`text-transparent bg-clip-text bg-gradient-to-b ${colorClass}`}>{displayValue.toFixed(2)}</span>;
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
        })),
    }).isRequired,
};

AnimatedScore.propTypes = {
    value: PropTypes.number.isRequired,
    target: PropTypes.number.isRequired,
    isSuccess: PropTypes.bool.isRequired,
    onComplete: PropTypes.func.isRequired,
};
