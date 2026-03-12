import React, { useState } from 'react';
import { getFullAvatarUrl } from '../utils/avatar';

export default function AdminRound1({ gameState, updateState }) {
    const [selectedPlayerId, setSelectedPlayerId] = useState(null);
    const [judgeScoreInput, setJudgeScoreInput] = useState("");
    const [publicScoreInput, setPublicScoreInput] = useState("");
    const [history, setHistory] = useState([]); // Undo history
    const [adminGroup, setAdminGroup] = useState(1);

    const handleSelect = (id) => {
        setSelectedPlayerId(id);
        const p = gameState.players.find(p => p.id === id);
        setJudgeScoreInput(p && p.judgeScore !== undefined ? p.judgeScore : "");
        setPublicScoreInput(p && p.publicScore !== undefined ? p.publicScore : "");
    };

    const handleSubmitScore = () => {
        if (!selectedPlayerId) return;
        const judgeScore = parseFloat(judgeScoreInput);
        const publicScore = parseFloat(publicScoreInput);

        if (isNaN(judgeScore) || judgeScore < 0 || judgeScore > 100 || isNaN(publicScore) || publicScore < 0 || publicScore > 100) {
            alert("请输入有效的0-100分数");
            return;
        }

        const finalScore = judgeScore * 0.75 + publicScore * 0.25;

        // Capture history before changing
        setHistory([...history, JSON.stringify(gameState)]);

        const newPlayers = gameState.players.map(p => {
            if (p.id === selectedPlayerId) {
                return { ...p, score: finalScore, judgeScore, publicScore };
            }
            return p;
        });

        updateState({ ...gameState, players: newPlayers });
        setSelectedPlayerId(null);
        setJudgeScoreInput("");
        setPublicScoreInput("");
    };

    const handleUndo = () => {
        if (history.length === 0) return;
        const prevStateStr = history[history.length - 1];
        setHistory(history.slice(0, -1));
        updateState(JSON.parse(prevStateStr));
    };

    const selectedPlayer = gameState.players.find(p => p.id === selectedPlayerId);

    return (
        <div className="mt-8 bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl">
            <div className="flex justify-between items-center mb-6 border-b border-slate-700 pb-4">
                <h2 className="text-2xl font-bold text-teal-400 flex items-center">
                    <span className="bg-teal-600 text-white w-8 h-8 rounded justify-center items-center flex mr-3 text-sm">1</span>
                    第一轮管理：30进18成绩录入
                </h2>
                <button
                    onClick={handleUndo}
                    disabled={history.length === 0}
                    className={`px-4 py-2 rounded font-bold transition-all ${history.length > 0 ? 'bg-red-600 hover:bg-red-500 text-white' : 'bg-slate-700 text-slate-500 cursor-not-allowed border border-slate-600'}`}
                >
                    ↩ 撤销上一步
                </button>
            </div>

            {/* 组别控制和推流操作 */}
            <div className="flex flex-col md:flex-row justify-between items-center bg-slate-900 border border-slate-700 p-4 rounded-xl mb-6">
                <div className="flex space-x-2 mb-4 md:mb-0">
                    {[1, 2, 3, 4, 5, 6].map(g => (
                        <button
                            key={g}
                            onClick={() => setAdminGroup(g)}
                            className={`px-4 py-2 rounded-lg font-bold transition-all ${adminGroup === g ? 'bg-teal-600 text-white shadow-[0_0_10px_rgba(13,148,136,0.6)]' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}
                        >
                            第 {g} 组
                        </button>
                    ))}
                </div>
                <div className="flex space-x-4">
                    <button
                        onClick={() => updateState({ ...gameState, currentGroup: adminGroup, round1Mode: 'group' })}
                        className="bg-emerald-700 hover:bg-emerald-600 border border-emerald-500/50 text-white px-6 py-2 rounded-lg font-bold shadow-md transition-colors flex items-center"
                    >
                        📺 投屏展示【第 {adminGroup} 组】
                    </button>
                    <button
                        onClick={() => updateState({ ...gameState, round1Mode: 'full' })}
                        className="bg-teal-700 hover:bg-teal-600 border border-teal-500/50 text-white px-6 py-2 rounded-lg font-bold shadow-md transition-colors flex items-center"
                    >
                        🏆 投屏展示【当前完整排名】
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* 左侧：选手列表 */}
                <div className="col-span-2">
                    <h3 className="text-lg mb-4 text-slate-300 font-bold border-l-4 border-slate-500 pl-3">第 {adminGroup} 组 选手</h3>
                    <div className="grid grid-cols-4 xl:grid-cols-3 gap-4">
                        {gameState.players.filter(p => (p.group || 1) === adminGroup).map(p => (
                            <button
                                key={p.id}
                                onClick={() => handleSelect(p.id)}
                                className={`py-3 px-2 rounded-lg transition-all border ${selectedPlayerId === p.id ? 'bg-teal-700 text-white shadow-md border-teal-400 scale-105' : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'}`}
                            >
                                <div className="font-bold truncate">{p.name}</div>
                                <div className={`text-xs mt-1 font-mono flex flex-col items-center ${p.score > 0 ? 'text-emerald-300' : 'text-slate-500'}`}>
                                    {p.score > 0 ? (
                                        <>
                                            <span className="text-sm font-bold">{parseFloat(p.score).toFixed(2)}分</span>
                                            <span className="text-[10px] opacity-70">专:{p.judgeScore} 大:{p.publicScore}</span>
                                        </>
                                    ) : '未打分'}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* 右侧：打分操作 */}
                <div className="col-span-1 bg-slate-900 p-6 rounded-2xl border border-slate-700 shadow-xl h-fit sticky top-6">
                    <h3 className="text-lg mb-6 text-teal-300 text-center font-bold tracking-widest bg-teal-900/30 py-2 rounded">打分面板</h3>
                    {selectedPlayer ? (
                        <div className="flex flex-col items-center">
                            <img src={getFullAvatarUrl(selectedPlayer.avatar)} alt="avatar" className="w-28 h-28 rounded-full mb-4 border-4 border-teal-600 shadow-md object-cover" />
                            <h4 className="text-3xl font-black mb-1 text-white">{selectedPlayer.name}</h4>
                            <div className="text-sm text-emerald-400 mb-2 font-bold">当前得分: {selectedPlayer.score > 0 ? selectedPlayer.score.toFixed(2) : '暂无'}</div>
                            {selectedPlayer.score > 0 && (
                                <div className="text-xs text-slate-500 mb-6 flex space-x-4">
                                    <span>专业评委: {selectedPlayer.judgeScore} (75%)</span>
                                    <span>大众评审: {selectedPlayer.publicScore} (25%)</span>
                                </div>
                            )}

                            <div className="w-full flex flex-col space-y-4">
                                <div className="space-y-3">
                                    <div className="relative">
                                        <span className="absolute left-4 top-4 text-sm text-slate-400 font-bold">专业分(75%)</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={judgeScoreInput}
                                            onChange={e => setJudgeScoreInput(e.target.value)}
                                            className="w-full bg-slate-800 border-2 border-slate-600 rounded-xl py-3 pl-24 pr-4 border-l-8 border-l-teal-600 text-2xl font-black text-right text-teal-300 focus:outline-none focus:border-teal-500 transition-colors shadow-inner"
                                            placeholder="0 - 100"
                                            onKeyDown={e => {
                                                if (e.key === 'Enter') document.getElementById('publicScoreInput')?.focus();
                                            }}
                                        />
                                    </div>
                                    <div className="relative">
                                        <span className="absolute left-4 top-4 text-sm text-slate-400 font-bold">大众分(25%)</span>
                                        <input
                                            id="publicScoreInput"
                                            type="number"
                                            step="0.01"
                                            value={publicScoreInput}
                                            onChange={e => setPublicScoreInput(e.target.value)}
                                            className="w-full bg-slate-800 border-2 border-slate-600 rounded-xl py-3 pl-24 pr-4 border-l-8 border-l-emerald-500 text-2xl font-black text-right text-emerald-400 focus:outline-none focus:border-emerald-500 transition-colors shadow-inner"
                                            placeholder="0 - 100"
                                            onKeyDown={e => {
                                                if (e.key === 'Enter') handleSubmitScore();
                                            }}
                                        />
                                    </div>
                                </div>
                                <button
                                    onClick={handleSubmitScore}
                                    className="w-full bg-teal-700 hover:bg-teal-600 border border-teal-500 text-white font-bold py-4 rounded-xl shadow-md transition-all active:scale-[0.98] text-xl tracking-wider uppercase mt-2"
                                >
                                    确认提交
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-slate-500 text-center py-16 flex flex-col items-center border-2 border-dashed border-slate-700 rounded-xl">
                            <span className="text-5xl mb-6 opacity-30">👈</span>
                            <p className="font-bold text-lg">在左侧列表选择</p>
                            <p className="text-sm mt-2 opacity-60">点击需要录入分数的选手</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
