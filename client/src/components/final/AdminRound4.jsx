import React, { useState } from 'react';

export default function AdminRound4({ gameState, updateState }) {
    const players = gameState.players || [];

    const getLatestScore = (p) => {
        if (p.scoreDK !== undefined) return p.scoreDK;
        // 查找他在 PK 赛里的成绩
        const pkMatch = gameState.pkMatches?.find(m => m.challengerId === p.id || m.masterId === p.id);
        if (pkMatch && pkMatch.status === 'finished') {
            return p.id === pkMatch.challengerId ? pkMatch.challengerScore : pkMatch.masterScore;
        }
        return p.score; // Fallback to Round 1 score
    };

    const advancedPlayers = players.filter(p => p.status === 'advanced');
    const remainingSpots = Math.max(0, 10 - advancedPlayers.length);

    const pendingPlayers = players
        .filter(p => p.status === 'pending')
        .map(p => ({ ...p, latestScore: getLatestScore(p) }))
        .sort((a, b) => b.latestScore - a.latestScore || b.score - a.score || a.id - b.id);

    const [simulated, setSimulated] = useState(false);

    const handleCalculateResurrection = () => {
        // Top N of pending becomes resurrected
        const resurrectedIds = pendingPlayers.slice(0, remainingSpots).map(p => p.id);

        const newPlayers = players.map(p => {
            if (resurrectedIds.includes(p.id)) {
                return { ...p, status: 'resurrected' };
            }
            return p;
        });

        updateState({
            ...gameState,
            players: newPlayers,
            resurrectionCalculated: true
        });
        setSimulated(true);
    };

    const handleResetResurrection = () => {
        // 把 resurrected 变回 pending
        const newPlayers = players.map(p => {
            if (p.status === 'resurrected') {
                return { ...p, status: 'pending' };
            }
            return p;
        });

        updateState({
            ...gameState,
            players: newPlayers,
            resurrectionCalculated: false
        });
        setSimulated(false);
    };

    const handleSeedData = () => {
        if (!window.confirm('⚠️ 一键执行补位计算？\n将把待定区排名前 ' + remainingSpots + ' 名选手提升为复活状态，覆盖现有计算结果。')) return;
        handleCalculateResurrection();
    };

    return (
        <div className="mt-8 bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl">
            <div className="flex justify-between items-center border-b border-slate-700 pb-4 mb-6">
                <h2 className="text-2xl font-bold text-teal-400">最终决选：十强名额补位</h2>
                <button
                    onClick={handleSeedData}
                    disabled={remainingSpots === 0}
                    className={`px-4 py-2 rounded font-bold transition-all text-sm ${remainingSpots === 0 ? 'bg-slate-700 text-slate-500 cursor-not-allowed border border-slate-600' : 'bg-violet-600/80 hover:bg-violet-500 text-white border border-violet-400/50'}`}
                >
                    🧪 一键计算补位
                </button>
            </div>
            <div className="grid grid-cols-3 gap-6">
                <div className="col-span-1 border-r border-slate-700 pr-6">
                    <div className="bg-slate-900 border border-slate-700 p-6 rounded-xl text-center mb-6">
                        <div className="text-slate-400 text-sm mb-2">已直通名额</div>
                        <div className="text-4xl font-black text-emerald-400 mb-4">{advancedPlayers.length} 人</div>

                        <div className="text-slate-400 text-sm mb-2">剩余待补齐席位</div>
                        <div className="text-5xl font-black text-teal-400">{remainingSpots} 个</div>
                    </div>

                    <div className="bg-slate-900 border border-slate-700 p-6 rounded-xl">
                        <h3 className="text-lg text-slate-300 font-bold mb-4">待定区池 ({pendingPlayers.length}人)</h3>
                        <ul className="text-sm space-y-2 h-[300px] overflow-y-auto custom-scrollbar">
                            {pendingPlayers.map((p, idx) => (
                                <li key={p.id} className="flex justify-between border-b border-slate-700 pb-1">
                                    <span>{idx + 1}. {p.name}</span>
                                    <span className="text-slate-400 font-mono">{p.latestScore.toFixed(3)}分</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="col-span-2 flex flex-col justify-center items-center">
                    <h3 className="text-3xl font-black text-slate-300 mb-8">执行系统演算</h3>

                    <img src="https://api.dicebear.com/7.x/shapes/svg?seed=compute" alt="AI core" className="w-48 h-48 opacity-50 block mb-12 animate-[spin_10s_linear_infinite]" />

                    {!gameState.resurrectionCalculated ? (
                        <button
                            onClick={handleCalculateResurrection}
                            className="bg-teal-700 hover:bg-teal-600 text-white font-black text-2xl py-6 px-16 rounded-2xl shadow-lg hover:scale-[1.02] transition-transform"
                        >
                            启动席位自动推演并在大屏公布
                        </button>
                    ) : (
                        <div className="text-center">
                            <div className="text-emerald-400 text-3xl font-black mb-8">✅ 最终十强已产生</div>
                            <button
                                onClick={handleResetResurrection}
                                className="bg-slate-700 text-white font-bold py-3 px-8 rounded-lg shadow-md hover:bg-slate-600 transition-colors"
                            >
                                撤销并重跑动画
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
