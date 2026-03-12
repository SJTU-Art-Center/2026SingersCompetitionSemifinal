import React, { useState, useEffect } from 'react';
import { getFullAvatarUrl } from '../utils/avatar';

export default function AdminRound2({ gameState, updateState }) {
    // 分离出挑战者(11-18) 和 擂主(3-10)
    // 此处根据第一轮的分数自动推导
    const sortedPlayers = [...gameState.players].sort((a, b) => b.score - a.score || a.id - b.id);
    const masters = sortedPlayers.slice(2, 10);
    const challengers = sortedPlayers.slice(10, 18);

    // 匹配数据结构: gameState.pkMatches: [{ challengerId, masterId, challengerScore, masterScore, winner: null|'master'|'challenger'|'both_pending', status: 'pending'|'active'|'finished' }]
    // 在 Server 中初始化时有 pkMatches
    const pkMatches = gameState.pkMatches || [];

    const [activeMatchIndex, setActiveMatchIndex] = useState(
        pkMatches.findIndex(m => m.status === 'active') >= 0
            ? pkMatches.findIndex(m => m.status === 'active')
            : 0
    );

    const [cScore, setCScore] = useState("");
    const [mScore, setMScore] = useState("");

    const handleStartMatch = (index) => {
        const newMatches = [...pkMatches];
        newMatches.forEach(m => { if (m.status === 'active') m.status = 'finished' });
        newMatches[index].status = 'active';
        updateState({ ...gameState, pkMatches: newMatches });
        setActiveMatchIndex(index);
        setCScore("");
        setMScore("");
    };

    const handleSubmitScore = () => {
        const match = pkMatches[activeMatchIndex];
        if (!match) return;

        const cs = parseFloat(cScore);
        const ms = parseFloat(mScore);
        if (isNaN(cs) || isNaN(ms)) return alert("请输入有效分数");

        let winner = null;
        let newPlayersState = [...gameState.players];

        if (ms > cs) {
            // 擂主胜
            winner = 'master';
            newPlayersState = newPlayersState.map(p => {
                if (p.id === match.masterId) return { ...p, status: 'advanced' };
                if (p.id === match.challengerId) return { ...p, status: 'eliminated' };
                return p;
            });
        } else {
            // 挑战者赢或平局（都掉入待定）
            winner = 'both_pending';
            newPlayersState = newPlayersState.map(p => {
                if (p.id === match.masterId) return { ...p, status: 'pending' };
                if (p.id === match.challengerId) return { ...p, status: 'pending' };
                return p;
            });
        }

        const newMatches = [...pkMatches];
        newMatches[activeMatchIndex] = {
            ...match,
            challengerScore: cs,
            masterScore: ms,
            winner,
            status: 'finished'
        };

        updateState({ ...gameState, pkMatches: newMatches, players: newPlayersState });
    };

    return (
        <div className="mt-8 bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl">
            <h2 className="text-2xl font-bold text-teal-400 border-b border-slate-700 pb-4 mb-6">第二轮管理：1v1 PK配置</h2>

            {/* 比赛列表与打分 */}
            <div className="grid grid-cols-3 gap-6">
                <div className="col-span-1 border-r border-slate-700 pr-6 h-[500px] overflow-auto custom-scrollbar">
                    <h3 className="text-xl mb-4 text-slate-300">对战列表 ({pkMatches.length}/8)</h3>
                    {pkMatches.map((m, idx) => {
                        const cInfo = gameState.players.find(p => p.id === m.challengerId);
                        const mInfo = gameState.players.find(p => p.id === m.masterId);
                        return (
                            <div key={idx} className={`p-3 mb-3 border rounded-lg ${m.status === 'active' ? 'border-emerald-500 bg-emerald-900/30' : 'border-slate-700 bg-slate-800'}`}>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-teal-400">{cInfo?.name}</span>
                                    <span className="text-emerald-500 font-bold">VS</span>
                                    <span className="text-green-400">{mInfo?.name}</span>
                                </div>
                                {m.status === 'pending' && (
                                    <button onClick={() => handleStartMatch(idx)} className="mt-2 text-xs bg-teal-600 px-3 py-1 rounded w-full text-white">播放到大屏</button>
                                )}
                                {m.status === 'finished' && (
                                    <div className="text-xs text-center mt-2 text-slate-500">已完赛</div>
                                )}
                            </div>
                        )
                    })}
                </div>

                <div className="col-span-2 pl-4">
                    {activeMatchIndex >= 0 && pkMatches[activeMatchIndex] && pkMatches[activeMatchIndex].status === 'active' ? (() => {
                        const m = pkMatches[activeMatchIndex];
                        const cInfo = gameState.players.find(p => p.id === m.challengerId);
                        const mInfo = gameState.players.find(p => p.id === m.masterId);
                        return (
                            <div className="text-center">
                                <h3 className="text-3xl font-black mb-8 text-teal-400">正在进行 PK 打分</h3>
                                <div className="flex justify-center items-center space-x-12 mb-10">
                                    <div className="flex flex-col items-center">
                                        <img src={getFullAvatarUrl(cInfo?.avatar)} alt="" className="w-24 h-24 rounded-full border-4 border-teal-500 mb-3" />
                                        <span className="text-xl font-bold bg-teal-600 px-3 rounded text-white">{cInfo?.name} (挑战者)</span>
                                        <input type="number" step="0.01" value={cScore} onChange={e => setCScore(e.target.value)} className="mt-4 bg-slate-800 border p-2 text-center text-2xl w-32 outline-none border-teal-500 rounded text-teal-300" placeholder="本轮得分" />
                                    </div>
                                    <div className="text-6xl font-black text-emerald-600 italic">VS</div>
                                    <div className="flex flex-col items-center">
                                        <img src={getFullAvatarUrl(mInfo?.avatar)} alt="" className="w-24 h-24 rounded-full border-4 border-emerald-500 mb-3" />
                                        <span className="text-xl font-bold bg-emerald-600 px-3 rounded text-white">{mInfo?.name} (擂主)</span>
                                        <input type="number" step="0.01" value={mScore} onChange={e => setMScore(e.target.value)} className="mt-4 bg-slate-800 border p-2 text-center text-2xl w-32 outline-none border-emerald-500 rounded text-emerald-300" placeholder="本轮得分" />
                                    </div>
                                </div>
                                <button onClick={handleSubmitScore} className="bg-emerald-700 text-white text-2xl font-bold py-4 px-16 rounded-xl shadow-lg transform hover:scale-105 transition-all">
                                    判定并展示特效
                                </button>
                            </div>
                        )
                    })() : (
                        <div className="flex items-center justify-center h-full text-slate-500">
                            请从左侧选择一个未进行的对局点击“播放到大屏”
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
