import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getFullAvatarUrl } from '../../utils/avatar';

export default function Resurrection({ gameState }) {
    const players = gameState.players || [];

    const getLatestScore = (p) => {
        if (p.scoreDK !== undefined) return p.scoreDK;
        const pkMatch = gameState.pkMatches?.find(m => m.challengerId === p.id || m.masterId === p.id);
        if (pkMatch && pkMatch.status === 'finished') {
            return p.id === pkMatch.challengerId ? pkMatch.challengerScore : pkMatch.masterScore;
        }
        return p.score;
    };

    // 获取各种状态的选手列表，方便展示
    const advanced = players.filter(p => p.status === 'advanced' || p.status === 'top2');
    const pendingOrResurrected = players
        .filter(p => p.status === 'pending' || p.status === 'resurrected')
        .map(p => ({ ...p, latestScore: getLatestScore(p) }))
        .sort((a, b) => b.latestScore - a.latestScore || a.id - b.id);

    const resurrected = players.filter(p => p.status === 'resurrected').sort((a, b) => getLatestScore(b) - getLatestScore(a));

    // 十强占位，不足部分以 null 补齐
    const top10List = [...advanced, ...resurrected];
    while (top10List.length < 10) {
        top10List.push(null);
    }

    const { resurrectionCalculated } = gameState;

    return (
        <div className="flex w-full min-h-[700px] mt-6 gap-12 max-w-[1600px] mx-auto relative z-10 px-8">

            {/* 待定区排行版 (占1/3宽度) */}
            <div className="w-1/3 flex flex-col h-full bg-[var(--color-card-bg)] rounded-3xl border border-[var(--color-card-border)] p-8 backdrop-blur-md shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-teal-600/20 blur-[50px] rounded-full"></div>
                <h2 className="text-3xl font-bold mb-6 text-slate-300 border-l-4 border-teal-500 pl-4 tracking-widest">待定区排行池</h2>

                <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 space-y-3">
                    <AnimatePresence>
                        {pendingOrResurrected.map((p, idx) => {
                            const isRes = p.status === 'resurrected';
                            return (
                                <motion.div
                                    key={p.id}
                                    layout
                                    initial={{ opacity: 0, x: -50 }}
                                    animate={{
                                        opacity: 1, x: 0,
                                        scale: (isRes && resurrectionCalculated) ? 1.05 : 1,
                                        borderColor: (isRes && resurrectionCalculated) ? 'rgba(20, 184, 166, 0.8)' : 'rgba(51, 65, 85, 0.5)'
                                    }}
                                    className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${isRes && resurrectionCalculated ? 'bg-teal-900/50 shadow-md border-teal-500' : 'bg-[var(--color-card-bg)] border-[var(--color-card-border)]'
                                        }`}
                                >
                                    <div className="flex items-center gap-2 bg-black/20 backdrop-blur-sm border border-white/10 rounded-full px-2 py-1 shadow-inner">
                                        <span className={`font-black font-mono w-6 text-center flex-shrink-0 ${idx < 10 && !resurrectionCalculated ? 'text-teal-400' : 'text-slate-500'}`}>{idx + 1}</span>
                                    <div className="rounded-full p-[1px] bg-gradient-to-b from-white/30 to-white/5 shadow-[0_2px_8px_rgba(0,0,0,0.4)] flex-shrink-0">
                                        <img src={getFullAvatarUrl(p.avatar)} alt={p.name} className="w-10 h-10 rounded-full border border-white/15 object-cover block" />
                                    </div>
                                        <span className="font-bold text-lg">{p.name}</span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="font-mono text-xl text-slate-300">{p.latestScore.toFixed(2)}</span>
                                        {isRes && resurrectionCalculated && <span className="text-xs text-teal-300 font-bold tracking-widest bg-teal-900/50 px-2 rounded">复活成功</span>}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            </div>

            {/* 最终十强席位图 (占2/3宽度) */}
            <div className="w-2/3 flex flex-col h-full bg-[var(--color-card-bg)] rounded-3xl border border-[var(--color-card-border)] p-8 backdrop-blur-md shadow-2xl">
                <h2 className="text-5xl font-black mb-10 text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-emerald-400 tracking-[0.3em] text-center border-b border-teal-800/50 pb-6">
                    校园十强 巅峰席位
                </h2>

                <div className="grid grid-cols-5 gap-6 gap-y-12">
                    {top10List.map((p, idx) => (
                        <div key={idx} className="relative flex justify-center">
                            {p ? (
                                <motion.div
                                    layoutId={`player-${p.id}`}
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ type: 'spring', delay: p.status === 'resurrected' ? idx * 0.2 : 0 }}
                                    className={`flex flex-col items-center relative z-10 w-full p-4 rounded-2xl border-2 bg-[var(--color-card-bg)] ${p.status === 'resurrected'
                                        ? 'border-teal-400 shadow-[0_4px_20px_rgba(20,184,166,0.3)] animate-pulse'
                                        : 'border-emerald-400 shadow-md'
                                        }`}
                                >
                                    <div className={`absolute -top-5 w-10 h-10 rounded-full flex items-center justify-center font-black border-2 border-slate-800 ${p.status === 'resurrected' ? 'bg-teal-500 text-white' : 'bg-emerald-400 text-emerald-900'
                                        }`}>
                                        {idx + 1}
                                    </div>

                                    <div className="rounded-full p-[2px] bg-gradient-to-b from-white/35 to-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.5)] mt-2">
                                        <img src={getFullAvatarUrl(p.avatar)} alt={p.name} className="w-28 h-28 rounded-full border-2 border-white/15 object-cover block" />
                                    </div>
                                    <h3 className="mt-4 font-black hidden text-xl truncate w-full text-center sm:block">{p.name}</h3>
                                    <div className="mt-2 flex space-x-2">
                                        {p.status === 'advanced' && <span className="bg-emerald-600 text-[10px] px-2 py-1 rounded-sm text-emerald-100 font-bold tracking-widest">直接晋级</span>}
                                        {p.status === 'resurrected' && <span className="bg-teal-600 text-[10px] px-2 py-1 rounded-sm text-teal-100 font-bold tracking-widest">补位复活</span>}
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="flex flex-col items-center w-full p-4 rounded-2xl border-2 border-dashed border-[var(--color-card-border)] bg-[var(--color-card-bg)] opacity-50 relative">
                                    <div className="absolute -top-5 w-10 h-10 rounded-full flex items-center justify-center font-black border-2 border-slate-800 bg-slate-700 text-slate-500">
                                        {idx + 1}
                                    </div>
                                    <div className="w-28 h-28 rounded-full border-4 border-slate-700 mt-2 bg-slate-800 flex items-center justify-center">
                                        <span className="text-4xl text-slate-600">?</span>
                                    </div>
                                    <h3 className="mt-4 font-bold text-slate-600 w-full text-center">虚席以待</h3>
                                    <div className="mt-2 h-[22px]"></div> {/* 预留标签位保证高度一致 */}

                                    {resurrectionCalculated && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-2xl backdrop-blur-[2px]"
                                        >
                                            <span className="text-rose-500 font-black tracking-widest border-2 border-rose-500 px-3 py-1 -rotate-12">该席位空缺</span>
                                        </motion.div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {!resurrectionCalculated && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm rounded-3xl z-20">
                        <span className="text-6xl mb-6">⏳</span>
                        <h3 className="text-3xl font-black text-slate-300 drop-shadow-md tracking-widest">等待终极演算数据回传</h3>
                    </div>
                )}

                <AnimatePresence>
                    {resurrectionCalculated && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5, y: -50 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ type: 'spring', damping: 15 }}
                            className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-teal-600 text-white font-black px-8 py-3 rounded-full shadow-[0_4px_20px_rgba(20,184,166,0.4)] z-50 text-xl tracking-[0.2em]"
                        >
                            演算完成 · 十强归位！
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
