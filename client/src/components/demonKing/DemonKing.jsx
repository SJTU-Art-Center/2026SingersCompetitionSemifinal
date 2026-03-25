import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getFullAvatarUrl } from '../../utils/avatar';

export default function DemonKing({ gameState }) {
    const { projectedDemonKing, projectedDemonKingAvgScore } = gameState;

    const dk = projectedDemonKing || null;

    if (!dk) {
        return <div className="text-center mt-32 text-6xl text-slate-700 font-bold loading-dots">等待大魔王登场...</div>;
    }

    const targetScore = parseFloat(projectedDemonKingAvgScore ?? 0);
    const isSubmitted = !!projectedDemonKing?.submitted;
    const finalScore = isSubmitted ? (dk.scoreDK || 0) : 0;
    const isSuccess = isSubmitted && finalScore >= targetScore;
    const isFailed = isSubmitted && finalScore < targetScore;

    return (
        <div className="flex flex-col items-center justify-start w-full h-full pt-[clamp(6px,1.2vh,14px)] pb-[clamp(8px,1.4vh,18px)] overflow-hidden">
            <motion.h2
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-[clamp(2.05rem,4vw,2.8rem)] font-black mt-[clamp(18px,4vh,46px)] mb-[clamp(6px,1.3vh,14px)] text-transparent bg-clip-text bg-gradient-to-b from-teal-400 to-emerald-700 tracking-[0.26em] italic"
            >
                大魔王降临
            </motion.h2>

            <div className="w-full flex-1 min-h-0 relative z-10 flex items-center justify-center overflow-hidden">
                <div className="w-full max-w-[clamp(520px,62vw,680px)]">
                    <AnimatePresence mode="wait" initial={false}>
                        <motion.div
                            key={dk.id}
                            initial={{ opacity: 0, y: 14, scale: 0.98 }}
                            animate={{
                                opacity: isFailed ? 0.9 : 1,
                                y: isSuccess ? -8 : 0,
                                scale: isSuccess ? 1.03 : (isFailed ? 0.9 : 1),
                                filter: isFailed ? 'grayscale(60%)' : 'grayscale(0%)'
                            }}
                            exit={{ opacity: 0, y: -10, scale: 0.98 }}
                            transition={{ duration: 0.28, ease: 'easeOut' }}
                            className={`bg-transparent border-2 rounded-3xl px-[clamp(12px,1.7vw,20px)] pt-[clamp(10px,1.4vh,18px)] pb-[clamp(10px,1.4vh,16px)] flex flex-col items-center w-full overflow-hidden ${isSuccess ? 'border-emerald-400 shadow-[0_4px_20px_rgba(16,185,129,0.35)]' : (isFailed ? 'border-slate-500 shadow-[0_0_14px_rgba(34,211,238,0.25)]' : 'border-teal-500 shadow-lg')}`}
                        >
                            <div className="rounded-full p-[3px] bg-gradient-to-b from-white/40 to-white/5 shadow-[0_6px_24px_rgba(0,0,0,0.65),0_0_24px_rgba(20,184,166,0.18)] mt-[clamp(6px,1.1vh,12px)] mb-[clamp(8px,1.4vh,14px)]">
                                <img src={getFullAvatarUrl(dk.avatar)} alt={dk.name} className={`w-[clamp(96px,11vw,128px)] h-[clamp(96px,11vw,128px)] rounded-full border-[3px] object-cover block ${isSuccess ? 'border-emerald-400/60' : 'border-teal-500/40'}`} />
                            </div>
                            <h3 className="text-[clamp(1.15rem,2.1vw,1.7rem)] font-black tracking-wide text-center">{dk.name}</h3>

                            <div className="w-full mt-[clamp(8px,1.4vh,14px)] px-[clamp(4px,0.8vw,10px)] flex flex-col items-center">
                                <div className="w-full flex flex-col items-end">
                                    <div className="text-teal-400 font-bold text-[clamp(0.72rem,1vw,0.9rem)] mb-1 flex items-center">
                                        <span className="mr-2">🏆 及格线 (16人均分)</span>
                                        <span className="font-mono text-[clamp(0.95rem,1.4vw,1.2rem)]">{targetScore.toFixed(3)}</span>
                                    </div>
                                    <div className="w-full h-[2px] bg-teal-500/80 relative">
                                        <div className="absolute top-[-4px] right-0 w-2.5 h-2.5 bg-teal-400 rounded-full shadow-md"></div>
                                    </div>
                                </div>

                                <div className="mt-[clamp(8px,1.4vh,14px)] w-full flex justify-center pb-[clamp(8px,1.2vh,14px)] border-b border-slate-700/80">
                                    <div className="text-[clamp(1.9rem,4.2vw,3.7rem)] leading-none font-mono font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400">
                                        {isSubmitted ? (
                                            <AnimatedScore value={finalScore} target={targetScore} isSuccess={isSuccess} />
                                        ) : (
                                            <span className="text-3xl text-teal-300 font-bold opacity-60 animate-pulse">演唱中...</span>
                                        )}
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {isSubmitted && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 50, scale: 0.8 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            transition={{ delay: 1.5, type: 'spring' }}
                                            className={`w-[88%] mt-[clamp(8px,1.2vh,14px)] py-[clamp(8px,1.2vh,12px)] text-center text-[clamp(0.9rem,1.7vw,1.45rem)] font-black tracking-[0.08em] text-white rounded-xl shadow-lg border-2 ${isSuccess ? 'bg-emerald-600 border-emerald-400' : 'bg-slate-700 border-slate-500 text-teal-200'}`}
                                        >
                                            {isSuccess ? '👑 守擂成功 · 直接晋级 👑' : '🛡️ 守擂失败 · 落入待定区 🛡️'}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

// 带颜色渐变和音效节奏的分数跳动组件
function AnimatedScore({ value, target, isSuccess }) {
    const [displayValue, setDisplayValue] = useState(0);
    const [colorClass, setColorClass] = useState("from-white to-slate-400");

    useEffect(() => {
        setDisplayValue(0);
        setColorClass("from-white to-slate-400");

        let start = 0;
        const end = value;
        const duration = 2500; // 长时间滚动营造紧张感
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
            }
        };

        requestAnimationFrame(tick);
    }, [value, target, isSuccess]);

    return <span className={`text-transparent bg-clip-text bg-gradient-to-b ${colorClass}`}>{displayValue.toFixed(3)}</span>;
}
