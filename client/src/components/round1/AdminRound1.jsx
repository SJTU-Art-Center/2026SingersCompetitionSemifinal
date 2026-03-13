import React, { useState } from 'react';
import { getFullAvatarUrl } from '../../utils/avatar';

export default function AdminRound1({ gameState, updateState, adminGroup }) {
    const [selectedPlayerId, setSelectedPlayerId] = useState(null);
    const [judgeScoreInput, setJudgeScoreInput] = useState("");
    const [publicScoreInput, setPublicScoreInput] = useState("");
    const [history, setHistory] = useState([]); // Undo history


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

    const handleSeedData = () => {
        if (!window.confirm('⚠️ 一键填入测试数据？\n这将为所有30名选手随机生成第一轮分数，覆盖现有成绩。')) return;
        const newPlayers = gameState.players.map(p => {
            const j = parseFloat((60 + Math.random() * 40).toFixed(1));
            const pub = parseFloat((60 + Math.random() * 40).toFixed(1));
            const finalScore = parseFloat((j * 0.75 + pub * 0.25).toFixed(2));
            return { ...p, judgeScore: j, publicScore: pub, score: finalScore };
        });
        updateState({ ...gameState, players: newPlayers });
    };

    const selectedPlayer = gameState.players.find(p => p.id === selectedPlayerId);

    return (
        <div className="mt-4 bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-xl">
            <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-3">
                <h2 className="text-xl font-bold text-teal-400 flex items-center">
                    <span className="bg-teal-600 text-white w-7 h-7 rounded justify-center items-center flex mr-2 text-xs">1</span>
                    第一轮管理：30进18成绩录入
                </h2>
                <div className="flex gap-2">
                    <button
                        onClick={handleSeedData}
                        className="px-4 py-2 rounded font-bold transition-all bg-violet-600/80 hover:bg-violet-500 text-white border border-violet-400/50 text-sm"
                    >
                        🧪 填入测试数据
                    </button>
                    <button
                        onClick={handleUndo}
                        disabled={history.length === 0}
                        className={`px-4 py-2 rounded font-bold transition-all ${history.length > 0 ? 'bg-red-600 hover:bg-red-500 text-white' : 'bg-slate-700 text-slate-500 cursor-not-allowed border border-slate-600'}`}
                    >
                        ↩ 撤销上一步
                    </button>
                </div>
            </div>



        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 左侧：选手列表 */}
                <div className="col-span-2">
                    <h3 className="text-sm mb-2 text-slate-300 font-bold border-l-4 border-slate-500 pl-2">第 {adminGroup || 1} 组 选手</h3>
                    <div className="grid grid-cols-5 gap-2">
                        {gameState.players.filter(p => (p.group || 1) === (adminGroup || 1)).map(p => (
                            <button
                                key={p.id}
                                onClick={() => handleSelect(p.id)}
                                className={`py-1.5 px-1.5 rounded-xl transition-all border flex flex-col items-center gap-1 ${selectedPlayerId === p.id ? 'bg-teal-700/60 text-white shadow-[0_0_12px_rgba(20,184,166,0.4)] border-teal-400 scale-105 backdrop-blur-sm' : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 backdrop-blur-sm shadow-inner'}`}
                            >
                                <img src={getFullAvatarUrl(p.avatar)} alt={p.name} className="w-8 h-8 rounded-full border border-white/20 object-cover shadow" />
                                <div className="font-bold truncate text-xs w-full text-center">{p.name}</div>
                                <div className={`text-[10px] font-mono flex flex-col items-center ${p.score > 0 ? 'text-emerald-300' : 'text-slate-500'}`}>
                                    {p.score > 0 ? (
                                        <>
                                            <span className="text-xs font-bold">{parseFloat(p.score).toFixed(2)}</span>
                                            <span className="text-[9px] opacity-70">专:{p.judgeScore} 大:{p.publicScore}</span>
                                        </>
                                    ) : '未打分'}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* 右侧：打分操作 */}
                <div className="col-span-1 bg-slate-900 p-3 rounded-xl border border-slate-700 shadow-xl h-fit sticky top-4">
                    <h3 className="text-xs mb-2 text-teal-300 text-center font-bold tracking-widest bg-teal-900/30 py-1 rounded">打分面板</h3>
                    {selectedPlayer ? (
                        <div>
                            {/* 左右布局：左=选手信息，右=打分输入 */}
                            <div className="flex gap-3 items-center mb-3">
                                <div className="flex flex-col items-center flex-shrink-0">
                                    <img src={getFullAvatarUrl(selectedPlayer.avatar)} alt="avatar" className="w-12 h-12 rounded-full border-2 border-teal-500 object-cover shadow" />
                                    <div className="text-sm font-black mt-1 text-white text-center">{selectedPlayer.name}</div>
                                    {selectedPlayer.score > 0 ? (
                                        <div className="text-[10px] text-emerald-400 text-center font-bold">{selectedPlayer.score.toFixed(2)}</div>
                                    ) : (
                                        <div className="text-[10px] text-slate-500">未打分</div>
                                    )}
                                    {selectedPlayer.score > 0 && (
                                        <div className="text-[9px] text-slate-500 text-center">专:{selectedPlayer.judgeScore} 大:{selectedPlayer.publicScore}</div>
                                    )}
                                </div>
                                <div className="flex-1 flex flex-col gap-1.5">
                                    <div className="relative">
                                        <span className="absolute left-2 top-1.5 text-[10px] text-slate-400 font-bold leading-none">专业分<br/>75%</span>
                                        <input
                                            type="number" step="0.01"
                                            value={judgeScoreInput}
                                            onChange={e => setJudgeScoreInput(e.target.value)}
                                            className="w-full bg-slate-800 border border-slate-600 rounded-lg py-1.5 pl-10 pr-2 border-l-4 border-l-teal-600 text-sm font-black text-right text-teal-300 focus:outline-none focus:border-teal-500 transition-colors"
                                            placeholder="0-100"
                                            onKeyDown={e => { if (e.key === 'Enter') document.getElementById('r1publicInput')?.focus(); }}
                                        />
                                    </div>
                                    <div className="relative">
                                        <span className="absolute left-2 top-1.5 text-[10px] text-slate-400 font-bold leading-none">大众分<br/>25%</span>
                                        <input
                                            id="r1publicInput"
                                            type="number" step="0.01"
                                            value={publicScoreInput}
                                            onChange={e => setPublicScoreInput(e.target.value)}
                                            className="w-full bg-slate-800 border border-slate-600 rounded-lg py-1.5 pl-10 pr-2 border-l-4 border-l-emerald-500 text-sm font-black text-right text-emerald-400 focus:outline-none focus:border-emerald-500 transition-colors"
                                            placeholder="0-100"
                                            onKeyDown={e => { if (e.key === 'Enter') handleSubmitScore(); }}
                                        />
                                    </div>
                                    <button
                                        onClick={handleSubmitScore}
                                        className="w-full bg-teal-700 hover:bg-teal-600 border border-teal-500 text-white font-bold py-1.5 rounded-lg text-xs tracking-wider transition-all active:scale-[0.98]"
                                    >确认提交</button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-slate-500 text-center py-6 flex flex-col items-center border border-dashed border-slate-700 rounded-xl">
                            <span className="text-2xl mb-2 opacity-30">👈</span>
                            <p className="text-xs">在左侧选择选手</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
