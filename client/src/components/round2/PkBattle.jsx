import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getFullAvatarUrl } from '../../utils/avatar';

export default function PkBattle({ gameState }) {
    const pkMatches = gameState.pkMatches || [];
    // 使用 screenMatchIndex 精确选择大屏展示的对战，该字段由管理后台独立控制
    const screenIdx = gameState.screenMatchIndex ?? 0;
    const activeMatch = pkMatches[screenIdx] || null;

    if (!activeMatch) {
        return <div className="text-center mt-32 text-6xl text-slate-700 font-bold loading-dots">16强对战初始化中...</div>;
    }

    const cInfo = gameState.players.find(p => p.id === activeMatch.challengerId);
    const mInfo = gameState.players.find(p => p.id === activeMatch.masterId);

    const isFinished = activeMatch.status === 'finished';
    const winner = activeMatch.winner; // 'master', 'both_pending'
    const isMasterWin = winner === 'master';
    const isBothPending = winner === 'both_pending';
    const pairResultText = isMasterWin ? '晋级 & 淘汰' : isBothPending ? '待定 & 待定' : '结果待确认';

    // Animation variants
    const getCardVariant = (role) => {
        if (!isFinished) return { scale: 1, opacity: 1, filter: 'grayscale(0%)' };

        if (winner === 'both_pending') {
            // 情形B: 两人都待定
            return {
                scale: 0.9,
                opacity: 0.8,
                y: 80,
                filter: 'grayscale(60%)',
                transition: { type: 'spring', stiffness: 100 }
            };
        }

        if (winner === 'master') {
            if (role === 'master') {
                // 擂主晋级 (情形A)
                return {
                    scale: 1.15,
                    y: -40,
                    boxShadow: "0 0 80px rgba(251, 191, 36, 0.8)",
                    borderColor: "rgba(251, 191, 36, 1)",
                    zIndex: 10,
                    transition: { duration: 0.8, type: 'spring' }
                };
            } else {
                // 挑战者淘汰 (情形A)
                return {
                    scale: 0.7,
                    opacity: 0.4,
                    y: 180,
                    filter: 'grayscale(100%) blur(4px)',
                    transition: { duration: 0.8 }
                };
            }
        }
        return {};
    };

    return (
        <div className="flex flex-col items-center justify-center w-full min-h-[600px] mt-2 relative">
            {/* 晋级全屏光晕 */}
            <AnimatePresence>
                {isFinished && isMasterWin && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 0.15, scale: 2 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5 }}
                        className="absolute inset-0 bg-emerald-500 rounded-full blur-[100px] pointer-events-none -z-10 right-[-30%]"
                    />
                )}
                {isFinished && isBothPending && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 0.2, scale: 2 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.2 }}
                        className="absolute inset-0 bg-cyan-500 rounded-full blur-[100px] pointer-events-none -z-10"
                    />
                )}
            </AnimatePresence>

            <h2 className="text-5xl font-black mb-16 text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-emerald-400 tracking-[0.5em] italic">1V1 BATTLE</h2>

            <AnimatePresence>
                {isFinished && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 140, damping: 12 }}
                        className={`mb-10 px-10 py-3 rounded-2xl border-2 text-4xl font-black tracking-widest ${isMasterWin ? 'bg-emerald-600/30 border-emerald-400 text-emerald-100 shadow-[0_0_25px_rgba(16,185,129,0.5)]' : isBothPending ? 'bg-cyan-700/30 border-cyan-300 text-cyan-100 shadow-[0_0_25px_rgba(34,211,238,0.45)]' : 'bg-amber-700/30 border-amber-300 text-amber-100 shadow-[0_0_25px_rgba(245,158,11,0.45)]'}`}
                    >
                        结果：{pairResultText}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex items-center justify-center space-x-20 w-full relative z-10">
                {/* 挑战者卡片 */}
                <motion.div
                    animate={getCardVariant('challenger')}
                    className="bg-[var(--color-card-bg)] border-2 border-teal-500/50 rounded-3xl p-8 flex flex-col items-center w-[420px] relative overflow-hidden backdrop-blur-xl text-[var(--color-text-main)]"
                >
                    <div className="absolute top-0 w-full h-2 bg-teal-500"></div>
                    <div className="absolute top-4 left-4 bg-teal-600 text-white px-3 py-1 rounded text-sm font-bold tracking-widest shadow-md">挑战者</div>
                    <div className="rounded-full p-[3px] bg-gradient-to-b from-white/40 to-white/5 shadow-[0_6px_24px_rgba(0,0,0,0.6),0_0_20px_rgba(20,184,166,0.25)] mt-6">
                        <img src={getFullAvatarUrl(cInfo?.avatar)} alt={cInfo?.name} className="w-56 h-56 rounded-full border-[3px] border-teal-400/50 object-cover block" />
                    </div>
                    <h3 className="text-5xl font-black mt-8 tracking-wider">{cInfo?.name || "未知选手"}</h3>

                    <div className="mt-8 text-center min-h-[120px] flex items-center justify-center w-full">
                        {isFinished ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{ type: 'spring', damping: 10, stiffness: 100 }}
                                className={`text-[5.5rem] leading-none font-mono font-black ${isMasterWin ? 'text-slate-500' : 'text-transparent bg-clip-text bg-gradient-to-b from-white to-teal-300'}`}
                            >
                                {activeMatch.challengerScore?.toFixed(2)}
                            </motion.div>
                        ) : (
                            <div className="text-4xl text-teal-300 font-bold opacity-60 animate-pulse">演唱中...</div>
                        )}
                    </div>

                    <AnimatePresence>
                        {isFinished && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`w-full mt-6 py-4 text-center text-3xl font-black tracking-widest text-white rounded-xl shadow-md border-2 ${isBothPending ? 'bg-slate-700 border-slate-500 text-teal-200' : isMasterWin ? 'bg-slate-800 border-slate-700 text-slate-500' : 'bg-amber-800/60 border-amber-500 text-amber-100'}`}
                            >
                                {isBothPending ? '🛡️ 待定池' : isMasterWin ? '❌ 直接淘汰' : '⚠️ 结果待确认'}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* VS 图标 */}
                <motion.div
                    animate={{
                        scale: isFinished ? 0.6 : 1.2,
                        opacity: isFinished ? 0.3 : 1
                    }}
                    transition={{ type: 'spring' }}
                    className="text-[8rem] font-black text-transparent bg-clip-text bg-gradient-to-b from-emerald-400 to-emerald-700 italic drop-shadow-lg z-20"
                >
                    VS
                </motion.div>

                {/* 擂主卡片 */}
                <motion.div
                    animate={getCardVariant('master')}
                    className="bg-[var(--color-card-bg)] border-2 border-emerald-500/50 rounded-3xl p-8 flex flex-col items-center w-[420px] relative overflow-hidden backdrop-blur-xl text-[var(--color-text-main)]"
                >
                    <div className="absolute top-0 w-full h-2 bg-emerald-500"></div>
                    <div className="absolute top-4 right-4 bg-emerald-600 text-white px-3 py-1 rounded text-sm font-bold tracking-widest shadow-md">擂主</div>
                    <div className="rounded-full p-[3px] bg-gradient-to-b from-white/40 to-white/5 shadow-[0_6px_24px_rgba(0,0,0,0.6),0_0_20px_rgba(16,185,129,0.25)] mt-6">
                        <img src={getFullAvatarUrl(mInfo?.avatar)} alt={mInfo?.name} className="w-56 h-56 rounded-full border-[3px] border-emerald-400/50 object-cover block" />
                    </div>
                    <h3 className="text-5xl font-black mt-8 tracking-wider">{mInfo?.name || "未知擂主"}</h3>

                    <div className="mt-8 text-center min-h-[120px] flex items-center justify-center w-full">
                        {isFinished ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{ type: 'spring', damping: 10, stiffness: 100, delay: 0.1 }}
                                className={`text-[5.5rem] leading-none font-mono font-black ${isMasterWin ? 'text-transparent bg-clip-text bg-gradient-to-b from-white to-emerald-300' : 'text-slate-400'}`}
                            >
                                {activeMatch.masterScore?.toFixed(2)}
                            </motion.div>
                        ) : (
                            <div className="text-4xl text-emerald-300 font-bold opacity-60 animate-pulse">演唱中...</div>
                        )}
                    </div>

                    <AnimatePresence>
                        {isFinished && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`w-full mt-6 py-4 text-center text-3xl font-black tracking-widest text-white rounded-xl shadow-md border-2 ${isBothPending ? 'bg-slate-700 border-slate-500 text-teal-200' : isMasterWin ? 'bg-emerald-600 border-emerald-400 shadow-[0_4px_20px_rgba(16,185,129,0.4)]' : 'bg-amber-800/60 border-amber-500 text-amber-100'}`}
                            >
                                {isBothPending ? '🛡️ 待定池' : isMasterWin ? '🏆 直接晋级十强' : '⚠️ 结果待确认'}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    );
}
