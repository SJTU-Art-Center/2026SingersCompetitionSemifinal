import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getFullAvatarUrl } from '../utils/avatar';

export default function PickOpponent({ gameState }) {
    const { players, pickingChallengerId, pkMatches = [] } = gameState;

    const sortedPlayers = [...players].sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.id - b.id;
    });

    // 擂主 3-10
    const masters = sortedPlayers.slice(2, 10);
    // 挑战者 11-18
    const challengers = sortedPlayers.slice(10, 18);

    const getMatchForMaster = (masterId) => pkMatches.find(m => m.masterId === masterId);
    const isChallengerMatched = (challengerId) => pkMatches.some(m => m.challengerId === challengerId);

    return (
        <div className="w-full max-w-7xl mx-auto pb-12 pt-6">
            <h2 className="text-4xl font-bold tracking-widest text-center text-teal-400 mb-12 drop-shadow-[0_0_15px_rgba(20,184,166,0.5)]">
                对手挑选阶段
            </h2>

            {/* 上方：守擂区（8个位置） */}
            <div className="mb-16">
                <div className="flex items-center space-x-4 mb-6">
                    <div className="h-1 flex-1 bg-gradient-to-r from-transparent to-emerald-500/50"></div>
                    <h3 className="text-2xl font-black text-emerald-400 tracking-widest">守擂区 (擂主)</h3>
                    <div className="h-1 flex-1 bg-gradient-to-l from-transparent to-emerald-500/50"></div>
                </div>
                
                <div className="grid grid-cols-4 gap-6">
                    {masters.map(master => {
                        const match = getMatchForMaster(master.id);
                        const matchedChallenger = match ? players.find(p => p.id === match.challengerId) : null;

                        return (
                            <div key={master.id} className="relative bg-slate-800/80 border border-slate-600 rounded-2xl p-4 flex flex-col items-center">
                                {/* 擂主形象 */}
                                <div className="absolute top-2 left-2 bg-emerald-600 text-white text-xs font-bold px-2 py-1 rounded-br-lg rounded-tl-lg shadow-lg z-10">擂主</div>
                                <img src={getFullAvatarUrl(master.avatar)} alt="" className="w-20 h-20 rounded-full border-2 border-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.3)] object-cover z-0" />
                                <div className="text-lg font-bold text-white mt-2">{master.name}</div>
                                <div className="text-xs text-slate-400">排名: NO.{sortedPlayers.findIndex(x => x.id === master.id) + 1}</div>

                                {/* 配对槽位 */}
                                <div className={`mt-4 w-full rounded-xl flex items-center p-2 border-t border-slate-700 ${matchedChallenger ? 'bg-teal-900/50' : 'bg-slate-900/50 border-dashed border-slate-600'}`}>
                                    {matchedChallenger ? (
                                        <motion.div 
                                            initial={{ opacity: 0, scale: 0.8, y: 20 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            className="w-full flex items-center justify-between"
                                        >
                                            <div className="flex items-center space-x-2">
                                                <img src={getFullAvatarUrl(matchedChallenger.avatar)} alt="" className="w-8 h-8 rounded-full border border-teal-400" />
                                                <span className="text-sm font-bold text-teal-300">{matchedChallenger.name}</span>
                                            </div>
                                            <span className="text-[10px] text-red-400 font-bold border border-red-500/50 px-1 rounded">VS</span>
                                        </motion.div>
                                    ) : (
                                        <div className="w-full text-center text-xs text-slate-500 italic py-2">等待挑选...</div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* 下方：挑战者选拔区（8个位置） */}
            <div>
                <div className="flex items-center space-x-4 mb-6">
                    <div className="h-1 flex-1 bg-gradient-to-r from-transparent to-teal-500/50"></div>
                    <h3 className="text-2xl font-black text-teal-400 tracking-widest">待定区 (挑战者)</h3>
                    <div className="h-1 flex-1 bg-gradient-to-l from-transparent to-teal-500/50"></div>
                </div>

                <div className="grid grid-cols-8 gap-4">
                    <AnimatePresence>
                        {challengers.map(challenger => {
                            const isMatched = isChallengerMatched(challenger.id);
                            const isPicking = pickingChallengerId === challenger.id;

                            // If matched, don't show here anymore
                            if (isMatched) return null;

                            return (
                                <motion.div 
                                    key={challenger.id}
                                    layout
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1, scale: isPicking ? 1.05 : 1 }}
                                    exit={{ opacity: 0, scale: 0.5, y: -50 }}
                                    transition={{ duration: 0.3 }}
                                    className={`relative rounded-xl p-3 flex flex-col items-center border transition-all duration-300
                                        ${isPicking ? 'bg-teal-900/80 border-teal-400 shadow-[0_0_20px_rgba(20,184,166,0.6)] z-20' : 'bg-slate-800/40 border-slate-700 opacity-60 grayscale filter hover:grayscale-0 hover:opacity-100'}`}
                                >
                                    {isPicking && (
                                        <div className="absolute -top-3 bg-teal-500 text-white text-[10px] px-2 py-0.5 rounded-full shadow-lg font-bold animate-pulse">正在挑选</div>
                                    )}
                                    <img src={getFullAvatarUrl(challenger.avatar)} alt="" className={`w-14 h-14 rounded-full border object-cover mb-2 ${isPicking ? 'border-teal-300' : 'border-slate-600'}`} />
                                    <span className={`text-xs font-bold text-center w-full truncate ${isPicking ? 'text-teal-200' : 'text-slate-400'}`}>{challenger.name}</span>
                                </motion.div>
                            )
                        })}
                    </AnimatePresence>
                    {challengers.filter(c => !isChallengerMatched(c.id)).length === 0 && (
                        <div className="col-span-8 text-center text-teal-600 text-2xl font-bold py-8 tracking-widest bg-teal-900/10 rounded-xl border border-teal-900/30">
                            所有挑战者挑选完毕 🎉
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
