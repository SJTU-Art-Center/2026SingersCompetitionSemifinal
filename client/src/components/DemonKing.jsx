import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getFullAvatarUrl } from '../utils/avatar';

export default function DemonKing({ gameState }) {
    const { activeDemonKingId, demonKingAvgScore, dkScoreSubmitted, players } = gameState;

    const dk = players.find(p => p.id === activeDemonKingId);

    if (!dk) {
        return <div className="text-center mt-32 text-6xl text-slate-700 font-bold loading-dots">等待大魔王登场...</div>;
    }

    const targetScore = parseFloat(demonKingAvgScore);
    const finalScore = dkScoreSubmitted ? dk.scoreDK : 0;
    const isSuccess = dkScoreSubmitted && finalScore >= targetScore;
    const isFailed = dkScoreSubmitted && finalScore < targetScore;

    return (
        <div className="flex flex-col items-center justify-center w-full min-h-[600px] mt-10 relative">
            {/* 晋级全屏光晕 */}
            <AnimatePresence>
                {isSuccess && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 0.2, scale: 2 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5 }}
                        className="absolute inset-0 bg-emerald-500 rounded-full blur-[100px] pointer-events-none -z-10"
                    />
                )}
            </AnimatePresence>

            <motion.h2
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-6xl font-black mb-16 text-transparent bg-clip-text bg-gradient-to-b from-teal-400 to-emerald-700 tracking-[0.5em] italic"
            >
                大魔王降临
            </motion.h2>

            <div className="flex flex-col items-center justify-center w-full relative z-10 max-w-4xl">
                <motion.div
                    animate={{ scale: isSuccess ? 1.05 : 1, y: isSuccess ? -20 : (isFailed ? 20 : 0) }}
                    transition={{ type: 'spring' }}
                    className={`bg-[var(--color-card-bg)] border-4 rounded-[40px] p-12 flex flex-col items-center w-full relative overflow-hidden backdrop-blur-xl ${isSuccess ? 'border-emerald-400 shadow-[0_4px_30px_rgba(16,185,129,0.4)]' : (isFailed ? 'border-slate-600 grayscale brightness-75' : 'border-teal-500 shadow-lg')}`}
                >
                    <img src={getFullAvatarUrl(dk.avatar)} alt={dk.name} className={`w-64 h-64 rounded-full border-[8px] object-cover mt-4 mb-8 ${isSuccess ? 'border-emerald-400' : 'border-teal-500'}`} />
                    <h3 className="text-6xl font-black tracking-widest">{dk.name}</h3>

                    <div className="w-full mt-16 px-12 relative flex flex-col items-center">
                        {/* 目标均分指示线 */}
                        <div className="absolute top-0 right-16 flex flex-col items-end">
                            <div className="text-teal-400 font-bold text-2xl mb-2 flex items-center">
                                <span className="mr-2">🏆 及格线 (16人均分)</span>
                                <span className="font-mono text-3xl">{targetScore.toFixed(3)}</span>
                            </div>
                            <div className="w-[800px] h-[3px] bg-teal-500 relative">
                                <div className="absolute top-[-5px] right-0 w-3 h-3 bg-teal-400 rounded-full shadow-md"></div>
                            </div>
                        </div>

                        <div className="mt-20 w-full flex justify-center pb-8 border-b-2 border-slate-700">
                            {/* 动态分数跳动 */}
                            <div className="text-[8rem] leading-none font-mono font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400">
                                {dkScoreSubmitted ? (
                                    <AnimatedScore value={finalScore} target={targetScore} isSuccess={isSuccess} />
                                ) : (
                                    <span className="text-slate-600 opacity-50">0.000</span>
                                )}
                            </div>
                        </div>

                        <AnimatePresence>
                            {dkScoreSubmitted && (
                                <motion.div
                                    initial={{ opacity: 0, y: 50, scale: 0.8 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ delay: 1.5, type: 'spring' }}
                                    className={`w-[80%] mt-12 py-6 text-center text-5xl font-black tracking-widest text-white rounded-2xl shadow-lg border-4 ${isSuccess ? 'bg-emerald-600 border-emerald-400' : 'bg-slate-700 border-slate-500 text-slate-300'}`}
                                >
                                    {isSuccess ? '👑 守擂成功 · 直接晋级 👑' : '🛡️ 守擂失败 · 落入待定区 🛡️'}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
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
