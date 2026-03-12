import React, { useState } from 'react';
import { getFullAvatarUrl } from '../utils/avatar';

export default function AdminRound3({ gameState, updateState }) {
    // 计算16入平均分
    const pkMatches = gameState.pkMatches || [];
    let totalPkScore = 0;
    let pkPlayerCount = 0;

    pkMatches.forEach(m => {
        if (m.status === 'finished') {
            totalPkScore += m.challengerScore + m.masterScore;
            pkPlayerCount += 2;
        }
    });

    const averageScore = pkPlayerCount > 0 ? (totalPkScore / pkPlayerCount).toFixed(3) : 0;

    // 大魔王是第一轮排名前 2 的选手
    const sortedPlayers = [...gameState.players].sort((a, b) => b.score - a.score || a.id - b.id);
    const demonKings = sortedPlayers.slice(0, 2);

    const [activeDKId, setActiveDKId] = useState(null);
    const [scoreInput, setScoreInput] = useState("");

    const handleStartDK = (id) => {
        setActiveDKId(id);
        const dk = gameState.players.find(p => p.id === id);
        setScoreInput(dk && dk.scoreDK > 0 ? dk.scoreDK : "");
        updateState({ ...gameState, activeDemonKingId: id, demonKingAvgScore: parseFloat(averageScore) });
    };

    const handleSubmitScore = () => {
        if (!activeDKId) return;
        const dkScore = parseFloat(scoreInput);
        if (isNaN(dkScore)) return;

        const avg = parseFloat(averageScore);
        const newStatus = dkScore > avg ? 'advanced' : 'pending';

        const newPlayers = gameState.players.map(p => {
            if (p.id === activeDKId) {
                return { ...p, scoreDK: dkScore, status: newStatus };
            }
            return p;
        });

        updateState({
            ...gameState,
            players: newPlayers,
            // 可用此标记大魔王计分完成并展示出结果
            dkScoreSubmitted: true
        });
    };

    const handleResetScreen = () => {
        updateState({
            ...gameState,
            dkScoreSubmitted: false
        });
        setScoreInput("");
    };

    const activeDK = gameState.players.find(p => p.id === activeDKId);

    return (
        <div className="mt-8 bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl">
            <h2 className="text-2xl font-bold text-teal-500 border-b border-slate-700 pb-4 mb-6">附加赛管理：大魔王返场</h2>

            <div className="bg-slate-900 p-6 rounded-xl border border-teal-900/50 mb-8 flex justify-between items-center shadow-inner">
                <div>
                    <h3 className="text-lg text-slate-400 mb-1">16强对决选手平均分计算结果</h3>
                    <p className="text-sm text-slate-500">大魔王得分必须<strong>严格大于</strong>此分数才能守擂成功</p>
                </div>
                <div className="text-4xl font-mono font-black text-teal-400 bg-teal-950/40 px-6 py-3 rounded-lg border border-teal-800">
                    {averageScore}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-700">
                    <h3 className="text-xl text-slate-300 font-bold mb-6">选择出场的大魔王</h3>
                    <div className="space-y-4">
                        {demonKings.map(dk => (
                            <div key={dk.id} className={`p-4 rounded-xl border-2 flex items-center justify-between ${activeDKId === dk.id ? 'border-teal-500 bg-teal-900/20' : 'border-slate-700 bg-slate-800'}`}>
                                <div className="flex items-center space-x-4">
                                    <img src={getFullAvatarUrl(dk.avatar)} alt="" className="w-16 h-16 rounded-full border-2 border-teal-500" />
                                    <div>
                                        <div className="font-bold text-xl">{dk.name}</div>
                                        <div className="text-sm text-slate-400">第一轮得分: {dk.score}</div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleStartDK(dk.id)}
                                    className={`py-2 px-6 rounded font-bold ${activeDKId === dk.id ? 'bg-teal-600 text-white shadow-md' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                                >
                                    {activeDKId === dk.id ? '大屏演示中' : '播放大屏'}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-slate-900 p-6 rounded-xl border border-slate-700">
                    {activeDK ? (
                        <div className="flex flex-col items-center">
                            <h3 className="text-xl text-emerald-400 font-bold mb-6">给大魔王打分</h3>
                            <img src={getFullAvatarUrl(activeDK.avatar)} alt="avatar" className="w-24 h-24 rounded-full border-4 border-emerald-500 mb-4 shadow-md" />
                            <div className="text-3xl font-black mb-6">{activeDK.name}</div>

                            <input
                                type="number"
                                step="0.01"
                                value={scoreInput}
                                onChange={e => setScoreInput(e.target.value)}
                                className="w-full bg-slate-800 border-2 border-slate-600 rounded-xl py-4 text-3xl font-black text-center text-emerald-400 focus:outline-none focus:border-emerald-500 mb-4"
                                placeholder="返场表现得分"
                                disabled={gameState.dkScoreSubmitted}
                            />

                            {!gameState.dkScoreSubmitted ? (
                                <button
                                    onClick={handleSubmitScore}
                                    className="w-full bg-emerald-700 hover:bg-emerald-600 text-white text-xl font-bold py-4 rounded-xl shadow-md transition-all transform hover:scale-[1.02]"
                                >
                                    判定结果
                                </button>
                            ) : (
                                <button
                                    onClick={handleResetScreen}
                                    className="w-full bg-slate-700 hover:bg-slate-600 text-white text-xl font-bold py-4 rounded-xl shadow-md transition-all"
                                >
                                    重新打分 (大屏重新演示)
                                </button>
                            )}

                            {gameState.dkScoreSubmitted && (
                                <div className="mt-6 text-xl font-bold">
                                    结果：
                                    <span className={activeDK.scoreDK > parseFloat(averageScore) ? 'text-teal-400' : 'text-slate-400'}>
                                        {activeDK.scoreDK > parseFloat(averageScore) ? '守擂成功 (直接晋级)' : '守擂失败 (落入待定)'}
                                    </span>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full text-slate-500 text-lg">
                            请在左侧选择要评分的大魔王
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
