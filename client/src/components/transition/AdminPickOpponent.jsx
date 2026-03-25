import React, { useState } from 'react';
import { getFullAvatarUrl } from '../../utils/avatar';
import PlayerIdentity from '../common/PlayerIdentity';
import { getPlayerSingleLine } from '../../utils/playerIdentity';

export default function AdminPickOpponent({ gameState, updateState }) {
    const sortedPlayers = [...gameState.players].sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.id - b.id;
    });
    
    // Masters 3-10, Challengers 11-18
    const masters = sortedPlayers.slice(2, 10);
    const challengers = sortedPlayers.slice(10, 18);

    const pkMatches = gameState.pkMatches || [];

    const [selChallenger, setSelChallenger] = useState("");
    const [selMaster, setSelMaster] = useState("");

    const handleCreatePairing = (challengerId, masterId) => {
        if (!challengerId || !masterId) return;
        const newMatches = [...pkMatches, {
            challengerId, masterId,
            challengerScore: 0,
            masterScore: 0,
            status: 'pending'
        }];
        updateState({ ...gameState, pkMatches: newMatches, pickingChallengerId: null });
        setSelChallenger("");
        setSelMaster("");
    };

    const handleUnpair = (index) => {
        const newMatches = [...pkMatches];
        newMatches.splice(index, 1);
        updateState({ ...gameState, pkMatches: newMatches });
    };

    const handleSetPicking = (id) => {
        setSelChallenger(id.toString());
        updateState({ ...gameState, pickingChallengerId: id });
    };

    const handleClearPicking = () => {
        setSelChallenger("");
        updateState({ ...gameState, pickingChallengerId: null });
    };

    const handleSeedData = () => {
        if (!window.confirm('⚠️ 一键填入测试配对？\n将自动把挑战者和守播区选手一一配对，覆盖现有配对列表。')) return;
        const newMatches = challengers.map((c, i) => ({
            challengerId: c.id,
            masterId: masters[i].id,
            challengerScore: 0,
            masterScore: 0,
            status: 'pending'
        }));
        updateState({ ...gameState, pkMatches: newMatches, pickingChallengerId: null });
    };

    return (
        <div className="mt-8 bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl">
            <div className="flex justify-between items-center border-b border-slate-700 pb-4 mb-6">
                <h2 className="text-2xl font-bold text-teal-400 flex items-center">
                    过渡阶段：挑选对手
                </h2>
                <div className="flex gap-2">
                    <button
                        onClick={handleSeedData}
                        className="px-4 py-2 rounded font-bold transition-all bg-violet-600/80 hover:bg-violet-500 text-white border border-violet-400/50 text-sm"
                    >
                        🧪 填入测试配对
                    </button>
                    <button
                        onClick={() => updateState({ ...gameState, screenRound: 1.5 })}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-6 rounded-lg shadow-lg transition-colors"
                    >
                        📺 投屏展示挑选环节
                    </button>
                    <button
                        onClick={handleClearPicking}
                        className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                    >
                        清除大屏选中状态
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* 结对操作 */}
                <div className="bg-slate-900 p-6 rounded-xl border border-slate-700">
                    <h3 className="text-xl mb-6 text-slate-300 font-bold border-l-4 border-emerald-500 pl-3">配对控制</h3>
                    <div className="flex flex-col space-y-6">
                        <div>
                            <label className="block text-slate-400 text-sm mb-2 font-bold">上屏选中(点名)挑战者：</label>
                            <div className="flex flex-col space-y-2">
                                {challengers.map(c => {
                                    const isAssigned = pkMatches.some(m => m.challengerId === c.id);
                                    if (isAssigned) return null;
                                    return (
                                        <button
                                            key={c.id}
                                            onClick={() => handleSetPicking(c.id)}
                                            className={`w-full text-left p-2 rounded-2xl flex items-center gap-3 transition-all shadow-inner backdrop-blur-sm border ${gameState.pickingChallengerId === c.id ? 'bg-emerald-600/70 text-white shadow-[0_0_10px_rgba(16,185,129,0.5)] border-emerald-400' : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'}`}
                                        >
                                            <img src={getFullAvatarUrl(c.avatar)} alt="" className="w-9 h-9 rounded-full border border-white/20 object-cover flex-shrink-0" />
                                            <div className="min-w-0 flex-1">
                                                <PlayerIdentity
                                                    player={c}
                                                    compact
                                                    center={false}
                                                    numberClassName="text-[9px] text-slate-400"
                                                    nameClassName="font-bold text-sm"
                                                />
                                                <div className="text-[10px] text-slate-400">第{sortedPlayers.findIndex(x => x.id === c.id) + 1}名</div>
                                            </div>
                                            {gameState.pickingChallengerId === c.id && <span className="ml-auto text-xs font-bold bg-white text-emerald-600 px-2 rounded-full">正在挑选</span>}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        <div className="flex items-end space-x-4">
                            <div className="flex-1">
                                <label className="block text-slate-400 text-sm mb-2 font-bold">最终确认擂主并生成对决</label>
                                <select
                                    value={selMaster}
                                    onChange={e => setSelMaster(e.target.value)}
                                    className="w-full bg-slate-800 border-2 border-slate-600 rounded-lg p-3 text-white focus:border-emerald-500 outline-none"
                                >
                                    <option value="">-- 选择目标擂主 --</option>
                                    {masters.filter(m => !pkMatches.find(x => x.masterId === m.id)).map(m => (
                                        <option key={m.id} value={m.id}>{getPlayerSingleLine(m)} (第{sortedPlayers.findIndex(x => x.id === m.id) + 1}名)</option>
                                    ))}
                                </select>
                            </div>
                            <button
                                onClick={() => handleCreatePairing(parseInt(selChallenger), parseInt(selMaster))}
                                disabled={!selChallenger || !selMaster}
                                className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-lg shadow-lg"
                            >
                                确认配对 ⚔️
                            </button>
                        </div>
                    </div>
                </div>

                {/* 已匹配列表 */}
                <div className="bg-slate-900 p-6 rounded-xl border border-slate-700 h-[500px] overflow-auto custom-scrollbar">
                    <h3 className="text-xl mb-6 text-slate-300 font-bold border-l-4 border-teal-500 pl-3">配对结果 ({pkMatches.length}/8)</h3>
                    {pkMatches.map((m, idx) => {
                        const cInfo = gameState.players.find(p => p.id === m.challengerId);
                        const mInfo = gameState.players.find(p => p.id === m.masterId);
                        return (
                            <div key={idx} className="p-3 mb-3 border border-white/10 bg-white/5 backdrop-blur-sm rounded-2xl flex items-center justify-between shadow-inner">
                                <div className="flex items-center space-x-3 flex-1">
                                    <div className="flex items-center gap-2 bg-teal-600/20 border border-teal-500/30 rounded-full px-2 py-1 w-1/3">
                                        <img src={getFullAvatarUrl(cInfo?.avatar)} alt="" className="w-8 h-8 rounded-full border border-teal-500/50 object-cover flex-shrink-0" />
                                        <PlayerIdentity
                                            player={cInfo}
                                            compact
                                            center={false}
                                            className="min-w-0"
                                            numberClassName="text-[9px] text-teal-500"
                                            nameClassName="text-sm text-teal-300"
                                        />
                                    </div>
                                    <div className="text-base font-black text-slate-500 italic flex-1 text-center">VS</div>
                                    <div className="flex items-center gap-2 bg-emerald-600/20 border border-emerald-500/30 rounded-full px-2 py-1 w-1/3 justify-end flex-row-reverse">
                                        <img src={getFullAvatarUrl(mInfo?.avatar)} alt="" className="w-8 h-8 rounded-full border border-emerald-500/50 object-cover flex-shrink-0" />
                                        <PlayerIdentity
                                            player={mInfo}
                                            compact
                                            center={false}
                                            className="min-w-0"
                                            numberClassName="text-[9px] text-emerald-500"
                                            nameClassName="text-sm text-emerald-300"
                                        />
                                    </div>
                                </div>
                                <div className="ml-3">
                                    <button onClick={() => handleUnpair(idx)} className="text-xs bg-red-600/20 text-red-500 hover:bg-red-600 hover:text-white border border-red-600 p-2 rounded transition-colors" title="撤销配对">
                                        ✕
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                    {pkMatches.length === 0 && (
                        <div className="text-center text-slate-500 mt-20">暂未产生配对组合</div>
                    )}
                </div>
            </div>
        </div>
    );
}
