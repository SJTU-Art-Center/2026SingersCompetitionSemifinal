import React, { useState } from 'react';
import { getFullAvatarUrl } from '../../utils/avatar';

export default function AdminRound3({ gameState, updateState }) {
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

    const sortedPlayers = [...gameState.players].sort((a, b) => b.score - a.score || a.id - b.id);
    const demonKings = sortedPlayers.slice(0, 2);

    const [selectedDKId, setSelectedDKId] = useState(gameState.activeDemonKingId ?? null);
    const [scoreInput, setScoreInput] = useState('');

    const handleSelect = (id) => {
        setSelectedDKId(id);
        const dk = gameState.players.find(p => p.id === id);
        setScoreInput(dk && dk.scoreDK > 0 ? dk.scoreDK : '');
    };

    const handleSubmitScore = () => {
        if (!selectedDKId) return;
        const dkScore = parseFloat(scoreInput);
        if (isNaN(dkScore)) return alert('请输入有效分数');
        const avg = parseFloat(averageScore);
        const newStatus = dkScore > avg ? 'advanced' : 'pending';
        const newPlayers = gameState.players.map(p =>
            p.id === selectedDKId ? { ...p, scoreDK: dkScore, status: newStatus } : p
        );
        updateState({ ...gameState, players: newPlayers, dkScoreSubmitted: true });
    };

    const handleResetScore = () => {
        const selected = gameState.players.find(p => p.id === selectedDKId);
        const projected = gameState.projectedDemonKing;
        const shouldResetProjected = projected && selected && projected.id === selected.id;

        updateState({
            ...gameState,
            dkScoreSubmitted: false,
            ...(shouldResetProjected ? {
                projectedDemonKing: {
                    ...projected,
                    scoreDK: 0,
                    submitted: false
                }
            } : {})
        });
        setScoreInput('');
    };

    const handleSeedData = () => {
        if (!window.confirm('⚠️ 一键填入大魔王测试数据？\n将为两位大魔王随机生成得分并按高于平均分判定守擂结果。')) return;
        const avg = parseFloat(averageScore);
        const newPlayers = gameState.players.map(p => {
            const dk = demonKings.find(d => d.id === p.id);
            if (!dk) return p;
            const dkScore = parseFloat((avg - 3 + Math.random() * 10).toFixed(1));
            const newStatus = dkScore > avg ? 'advanced' : 'pending';
            return { ...p, scoreDK: dkScore, status: newStatus };
        });
        updateState({
            ...gameState,
            players: newPlayers,
            dkScoreSubmitted: true,
            projectedDemonKing: null,
            projectedDemonKingAvgScore: null
        });
    };

    const selectedDK = gameState.players.find(p => p.id === selectedDKId);
    return (
        <div className="mt-4 bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-xl">
            <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-3">
                <h2 className="text-xl font-bold text-teal-400 flex items-center">
                    <span className="bg-teal-600 text-white w-7 h-7 rounded justify-center items-center flex mr-2 text-xs">3</span>
                    大魔王管理：守擂判定
                </h2>
                <div className="flex gap-2 items-center">
                    <div className="text-sm text-slate-400 bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-lg font-mono">
                        16强平均分：<span className="text-teal-400 font-black">{averageScore}</span>
                    </div>
                    <button
                        onClick={handleSeedData}
                        className="px-4 py-2 rounded font-bold transition-all bg-violet-600/80 hover:bg-violet-500 text-white border border-violet-400/50 text-sm"
                    >
                        🧪 填入测试数据
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 左侧：大魔王列表 */}
                <div className="col-span-2">
                    <h3 className="text-sm mb-2 text-slate-300 font-bold border-l-4 border-slate-500 pl-2">大魔王选手</h3>
                    <div className="grid grid-cols-2 gap-2">
                        {demonKings.map(dk => (
                            <button
                                key={dk.id}
                                onClick={() => handleSelect(dk.id)}
                                className={`py-3 px-3 rounded-xl transition-all border flex items-center gap-3 ${selectedDKId === dk.id ? 'bg-teal-700/60 text-white shadow-[0_0_12px_rgba(20,184,166,0.4)] border-teal-400 scale-[1.02] backdrop-blur-sm' : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 backdrop-blur-sm shadow-inner'}`}
                            >
                                <img src={getFullAvatarUrl(dk.avatar)} alt={dk.name} className="w-12 h-12 rounded-full border border-white/20 object-cover shadow flex-shrink-0" />
                                <div className="flex flex-col items-start">
                                    <div className="font-black text-sm">{dk.name}</div>
                                    <div className="text-xs text-slate-400">第一轮: {dk.score}</div>
                                    {dk.scoreDK > 0 && (
                                        <div className={`text-xs font-bold mt-0.5 ${dk.scoreDK > parseFloat(averageScore) ? 'text-emerald-400' : 'text-red-400'}`}>
                                            大魔王分: {dk.scoreDK} {dk.scoreDK > parseFloat(averageScore) ? '✅守擂成功' : '❌守擂失败'}
                                        </div>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* 右侧：打分面板 */}
                <div className="col-span-1 w-full min-w-0 bg-slate-900 p-3 rounded-xl border border-slate-700 shadow-xl h-fit sticky top-4">
                    <h3 className="text-xs mb-2 text-teal-300 text-center font-bold tracking-widest bg-teal-900/30 py-1 rounded">打分面板</h3>
                    {selectedDK ? (
                        <div>
                            <div className="flex gap-3 items-center mb-3">
                                <div className="flex flex-col items-center flex-shrink-0 w-16">
                                    <img src={getFullAvatarUrl(selectedDK.avatar)} alt="avatar" className="w-12 h-12 rounded-full border-2 border-teal-500 object-cover shadow" />
                                    <div className="text-sm font-black mt-1 text-white text-center">{selectedDK.name}</div>
                                    {selectedDK.scoreDK > 0 ? (
                                        <div className={`text-[10px] font-bold text-center ${selectedDK.scoreDK > parseFloat(averageScore) ? 'text-emerald-400' : 'text-red-400'}`}>
                                            {selectedDK.scoreDK}
                                        </div>
                                    ) : (
                                        <div className="text-[10px] text-slate-500">未打分</div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                                    <div className="relative">
                                        <span className="absolute left-2 top-1.5 text-[10px] text-slate-400 font-bold leading-none">返场<br/>得分</span>
                                        <input
                                            type="number" step="0.01"
                                            value={scoreInput}
                                            onChange={e => setScoreInput(e.target.value)}
                                            disabled={gameState.dkScoreSubmitted}
                                            className="w-full bg-slate-800 border border-slate-600 rounded-lg py-1.5 pl-10 pr-2 border-l-4 border-l-teal-600 text-sm font-black text-right text-teal-300 focus:outline-none focus:border-teal-500 transition-colors disabled:opacity-50"
                                            placeholder="0-100"
                                            onKeyDown={e => { if (e.key === 'Enter') handleSubmitScore(); }}
                                        />
                                    </div>
                                    {!gameState.dkScoreSubmitted ? (
                                        <button
                                            onClick={handleSubmitScore}
                                            className="w-full bg-teal-700 hover:bg-teal-600 border border-teal-500 text-white font-bold py-1.5 rounded-lg text-xs tracking-wider transition-all active:scale-[0.98]"
                                        >确认提交</button>
                                    ) : (
                                        <button
                                            onClick={handleResetScore}
                                            className="w-full bg-slate-700 hover:bg-slate-600 border border-slate-500 text-white font-bold py-1.5 rounded-lg text-xs transition-all"
                                        >重新打分</button>
                                    )}
                                </div>
                            </div>
                            {gameState.dkScoreSubmitted && selectedDK.scoreDK > 0 && (
                                <div className={`text-xs text-center py-1.5 rounded border font-bold ${selectedDK.scoreDK > parseFloat(averageScore) ? 'border-emerald-700 text-emerald-400 bg-emerald-900/20' : 'border-red-800 text-red-400 bg-red-900/20'}`}>
                                    {selectedDK.scoreDK > parseFloat(averageScore) ? '✅ 守擂成功（直接晋级）' : '❌ 守擂失败（落入待定）'}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-slate-500 text-center py-6 flex flex-col items-center border border-dashed border-slate-700 rounded-xl">
                            <span className="text-2xl mb-2 opacity-30">👈</span>
                            <p className="text-xs">在左侧选择大魔王</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
