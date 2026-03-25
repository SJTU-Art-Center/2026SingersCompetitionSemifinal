import React, { useState } from 'react';
import { getFullAvatarUrl } from '../../utils/avatar';
import PlayerIdentity from '../common/PlayerIdentity';
import { getPlayerSingleLine } from '../../utils/playerIdentity';

export default function AdminRound2({ gameState, updateState, adminMatchIndex, setAdminMatchIndex }) {
    const pkMatches = gameState.pkMatches || [];
    const activeMatchIndex = adminMatchIndex ?? 0;

    const [cScore, setCScore] = useState('');
    const [mScore, setMScore] = useState('');

    const syncScreenToMatch = (index) => {
        updateState({
            ...gameState,
            screenRound: 2,
            screenMatchIndex: index
        });
    };

    const handleSelectMatch = (index) => {
        const match = pkMatches[index];
        setAdminMatchIndex(index);
        if (match?.status === 'finished') {
            setCScore(match.challengerScore?.toString() || '');
            setMScore(match.masterScore?.toString() || '');
            return;
        }
        setCScore('');
        setMScore('');
    };

    const handleStartMatch = (index) => {
        const newMatches = [...pkMatches];
        newMatches.forEach(m => { if (m.status === 'active') m.status = 'finished'; });
        newMatches[index].status = 'active';
        setAdminMatchIndex(index);
        updateState({ ...gameState, pkMatches: newMatches });
        setCScore('');
        setMScore('');
    };

    const handleProjectSelectedMatch = () => {
        if (!activeMatch) return;
        syncScreenToMatch(activeMatchIndex);
    };

    const handleSubmitScore = () => {
        const match = pkMatches[activeMatchIndex];
        if (!match) return;
        const cs = parseFloat(cScore);
        const ms = parseFloat(mScore);
        if (isNaN(cs) || isNaN(ms)) return alert('请输入有效分数');
        if (cs < 0 || cs > 100 || ms < 0 || ms > 100) return alert('分数必须在 0 到 100 之间');

        let winner = null;
        let newPlayersState = [...gameState.players];

        if (ms > cs) {
            winner = 'master';
            newPlayersState = newPlayersState.map(p => {
                if (p.id === match.masterId) return { ...p, status: 'advanced' };
                if (p.id === match.challengerId) return { ...p, status: 'eliminated' };
                return p;
            });
        } else {
            winner = 'both_pending';
            newPlayersState = newPlayersState.map(p => {
                if (p.id === match.masterId) return { ...p, status: 'pending' };
                if (p.id === match.challengerId) return { ...p, status: 'pending' };
                return p;
            });
        }

        const newMatches = [...pkMatches];
        newMatches[activeMatchIndex] = { ...match, challengerScore: cs, masterScore: ms, winner, status: 'finished' };
        updateState({
            ...gameState,
            pkMatches: newMatches,
            players: newPlayersState
        });
        setCScore(cs.toString());
        setMScore(ms.toString());
    };

    const handleEditFinishedScore = () => {
        const match = pkMatches[activeMatchIndex];
        if (!match || match.status !== 'finished') return;
        handleSubmitScore();
    };

    const handleSeedData = () => {
        if (!window.confirm('⚠️ 一键填入第二轮测试数据？\n将为所有8场对战随机生成分数并自动判定胜负，覆盖所有对战状态。')) return;
        let newPlayers = [...gameState.players];
        const newMatches = pkMatches.map(match => {
            const cs = parseFloat((70 + Math.random() * 25).toFixed(1));
            const ms = parseFloat((70 + Math.random() * 25).toFixed(1));
            let winner;
            if (ms > cs) {
                winner = 'master';
                newPlayers = newPlayers.map(p => {
                    if (p.id === match.masterId) return { ...p, status: 'advanced' };
                    if (p.id === match.challengerId) return { ...p, status: 'eliminated' };
                    return p;
                });
            } else {
                winner = 'both_pending';
                newPlayers = newPlayers.map(p => {
                    if (p.id === match.masterId) return { ...p, status: 'pending' };
                    if (p.id === match.challengerId) return { ...p, status: 'pending' };
                    return p;
                });
            }
            return { ...match, challengerScore: cs, masterScore: ms, winner, status: 'finished' };
        });
        updateState({ ...gameState, pkMatches: newMatches, players: newPlayers });
    };

    const activeMatch = pkMatches[activeMatchIndex];
    const cInfo = activeMatch ? gameState.players.find(p => p.id === activeMatch.challengerId) : null;
    const mInfo = activeMatch ? gameState.players.find(p => p.id === activeMatch.masterId) : null;
    const isActive = activeMatch?.status === 'active';
    const isFinished = activeMatch?.status === 'finished';

    return (
        <div className="mt-4 bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-xl">
            <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-3">
                <h2 className="text-xl font-bold text-teal-400 flex items-center">
                    <span className="bg-teal-600 text-white w-7 h-7 rounded justify-center items-center flex mr-2 text-xs">2</span>
                    第二轮管理：1v1 PK成绩录入
                </h2>
                <div className="flex gap-2">
                    <button
                        onClick={handleSeedData}
                        className="px-4 py-2 rounded font-bold transition-all bg-violet-600/80 hover:bg-violet-500 text-white border border-violet-400/50 text-sm"
                    >
                        🧪 填入测试数据
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 左侧：对战列表 */}
                <div className="col-span-2">
                    <h3 className="text-sm mb-2 text-slate-300 font-bold border-l-4 border-slate-500 pl-2">对战列表 ({pkMatches.length}/8)</h3>
                    <div className="grid grid-cols-4 gap-2">
                        {pkMatches.map((m, idx) => {
                            const c = gameState.players.find(p => p.id === m.challengerId);
                            const master = gameState.players.find(p => p.id === m.masterId);
                            const isSelected = activeMatchIndex === idx;
                            const isAct = m.status === 'active';
                            const isFin = m.status === 'finished';
                            return (
                                <button
                                    key={idx}
                                    onClick={() => handleSelectMatch(idx)}
                                    className={`py-1.5 px-1.5 rounded-xl transition-all border flex flex-col items-center gap-1 ${isSelected ? 'bg-teal-700/60 text-white shadow-[0_0_12px_rgba(20,184,166,0.4)] border-teal-400 scale-105 backdrop-blur-sm' : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 backdrop-blur-sm shadow-inner'}`}
                                >
                                    <div className="flex gap-1 items-center">
                                        <img src={getFullAvatarUrl(c?.avatar)} alt="" className="w-5 h-5 rounded-full border border-teal-500/50 object-cover" />
                                        <img src={getFullAvatarUrl(master?.avatar)} alt="" className="w-5 h-5 rounded-full border border-emerald-500/50 object-cover" />
                                    </div>
                                    <div className="text-[10px] font-bold w-full text-center leading-tight">
                                        <span className="text-teal-300">{getPlayerSingleLine(c, '?')}</span>
                                        <span className="text-slate-500 mx-0.5">vs</span>
                                        <span className="text-emerald-300">{getPlayerSingleLine(master, '?')}</span>
                                    </div>
                                <div className={`text-[10px] font-mono ${isFin ? 'text-emerald-300' : isAct ? 'text-yellow-400' : 'text-slate-500'}`}>
                                    {isFin ? `${m.challengerScore?.toFixed(1)}:${m.masterScore?.toFixed(1)}` : isAct ? '打分中' : `#${idx + 1}`}
                                </div>
                            </button>
                        );
                        })}
                    </div>
                </div>

                {/* 右侧：打分面板 */}
                <div className="col-span-1 w-full min-w-0 bg-slate-900 p-3 rounded-xl border border-slate-700 shadow-xl h-fit sticky top-4">
                    <h3 className="text-xs mb-2 text-teal-300 text-center font-bold tracking-widest bg-teal-900/30 py-1 rounded">打分面板</h3>
                    {activeMatch ? (
                        <div>
                            <div className="mb-2">
                                <button
                                    onClick={handleProjectSelectedMatch}
                                    className="w-full bg-indigo-700 hover:bg-indigo-600 border border-indigo-400 text-white font-bold py-1.5 rounded-lg text-xs tracking-wider transition-all active:scale-[0.98]"
                                >📺 投屏当前对战</button>
                                <div className="text-[10px] text-slate-400 text-center mt-1">
                                    当前大屏：第 {(gameState.screenMatchIndex ?? 0) + 1} 场
                                </div>
                            </div>

                            {/* 两名选手信息 + 打分区并排 */}
                            <div className="flex gap-2 mb-2">
                                {/* 挑战者 */}
                                <div className="flex-1 flex flex-col items-center bg-teal-900/20 border border-teal-800/50 rounded-lg py-2 px-1">
                                    <img src={getFullAvatarUrl(cInfo?.avatar)} alt="" className="w-10 h-10 rounded-full border-2 border-teal-500 object-cover shadow mb-1" />
                                    <PlayerIdentity
                                        player={cInfo}
                                        fallbackName="?"
                                        compact
                                        className="mt-0.5"
                                        numberClassName="text-[9px] text-teal-500"
                                        nameClassName="text-xs font-black text-teal-300"
                                    />
                                    <div className="text-[10px] text-teal-500">挑战者</div>
                                    {isFinished && <div className="text-sm font-black text-teal-200 mt-1">{activeMatch.challengerScore?.toFixed(1)}</div>}
                                </div>
                                <div className="flex items-center text-slate-500 font-black text-sm">VS</div>
                                {/* 擂主 */}
                                <div className="flex-1 flex flex-col items-center bg-emerald-900/20 border border-emerald-800/50 rounded-lg py-2 px-1">
                                    <img src={getFullAvatarUrl(mInfo?.avatar)} alt="" className="w-10 h-10 rounded-full border-2 border-emerald-500 object-cover shadow mb-1" />
                                    <PlayerIdentity
                                        player={mInfo}
                                        fallbackName="?"
                                        compact
                                        className="mt-0.5"
                                        numberClassName="text-[9px] text-emerald-500"
                                        nameClassName="text-xs font-black text-emerald-300"
                                    />
                                    <div className="text-[10px] text-emerald-500">擂主</div>
                                    {isFinished && <div className="text-sm font-black text-emerald-200 mt-1">{activeMatch.masterScore?.toFixed(1)}</div>}
                                </div>
                            </div>

                            {/* 状态/操作区 */}
                            {isFinished ? (
                                <div className="flex flex-col gap-2">
                                    <div className="text-center py-2 text-xs text-slate-400 border border-slate-700 rounded-lg">
                                        {activeMatch.winner === 'master' ? `${getPlayerSingleLine(mInfo)} 擂主胜（晋级十强）` : '擂主未胜（含同分）→ 两人进入待定池'}
                                    </div>
                                    <div className="text-[10px] text-slate-400 text-center">可按现场情况修改分数并重新结算</div>
                                    <div className="flex gap-1.5">
                                        <div className="relative flex-1 min-w-0">
                                            <span className="absolute left-1.5 top-1.5 text-[9px] text-teal-400 font-bold leading-none">挑战<br/>者分</span>
                                            <input
                                                type="number" step="0.01"
                                                value={cScore}
                                                onChange={e => setCScore(e.target.value)}
                                                className="w-full bg-slate-800 border border-slate-600 rounded-lg py-1.5 pl-8 pr-1 border-l-4 border-l-teal-600 text-sm font-black text-right text-teal-300 focus:outline-none focus:border-teal-500"
                                                placeholder="0-100"
                                                onKeyDown={e => { if (e.key === 'Enter') document.getElementById('r2mScoreEdit')?.focus(); }}
                                            />
                                        </div>
                                        <div className="relative flex-1 min-w-0">
                                            <span className="absolute left-1.5 top-1.5 text-[9px] text-emerald-400 font-bold leading-none">擂主<br/>分</span>
                                            <input
                                                id="r2mScoreEdit"
                                                type="number" step="0.01"
                                                value={mScore}
                                                onChange={e => setMScore(e.target.value)}
                                                className="w-full bg-slate-800 border border-slate-600 rounded-lg py-1.5 pl-8 pr-1 border-l-4 border-l-emerald-500 text-sm font-black text-right text-emerald-300 focus:outline-none focus:border-emerald-500"
                                                placeholder="0-100"
                                                onKeyDown={e => { if (e.key === 'Enter') handleEditFinishedScore(); }}
                                            />
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleEditFinishedScore}
                                        className="w-full bg-amber-700 hover:bg-amber-600 border border-amber-500 text-white font-bold py-1.5 rounded-lg text-xs tracking-wider transition-all active:scale-[0.98]"
                                    >保存修改并重新结算</button>
                                </div>
                            ) : isActive ? (
                                <div className="flex flex-col gap-1.5">
                                    <div className="flex gap-1.5">
                                        <div className="relative flex-1 min-w-0">
                                            <span className="absolute left-1.5 top-1.5 text-[9px] text-teal-400 font-bold leading-none">挑战<br/>者分</span>
                                            <input
                                                type="number" step="0.01"
                                                value={cScore}
                                                onChange={e => setCScore(e.target.value)}
                                                className="w-full bg-slate-800 border border-slate-600 rounded-lg py-1.5 pl-8 pr-1 border-l-4 border-l-teal-600 text-sm font-black text-right text-teal-300 focus:outline-none focus:border-teal-500"
                                                placeholder="0-100"
                                                onKeyDown={e => { if (e.key === 'Enter') document.getElementById('r2mScore')?.focus(); }}
                                            />
                                        </div>
                                        <div className="relative flex-1 min-w-0">
                                            <span className="absolute left-1.5 top-1.5 text-[9px] text-emerald-400 font-bold leading-none">擂主<br/>分</span>
                                            <input
                                                id="r2mScore"
                                                type="number" step="0.01"
                                                value={mScore}
                                                onChange={e => setMScore(e.target.value)}
                                                className="w-full bg-slate-800 border border-slate-600 rounded-lg py-1.5 pl-8 pr-1 border-l-4 border-l-emerald-500 text-sm font-black text-right text-emerald-300 focus:outline-none focus:border-emerald-500"
                                                placeholder="0-100"
                                                onKeyDown={e => { if (e.key === 'Enter') handleSubmitScore(); }}
                                            />
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleSubmitScore}
                                        className="w-full bg-teal-700 hover:bg-teal-600 border border-teal-500 text-white font-bold py-1.5 rounded-lg text-xs tracking-wider transition-all active:scale-[0.98]"
                                    >确认提交</button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => handleStartMatch(activeMatchIndex)}
                                    className="w-full bg-teal-700 hover:bg-teal-600 text-white font-bold py-1.5 rounded-lg text-xs border border-teal-500 transition-all"
                                >
                                    ▶ 开始打分
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="text-slate-500 text-center py-6 flex flex-col items-center border border-dashed border-slate-700 rounded-xl">
                            <span className="text-2xl mb-2 opacity-30">👈</span>
                            <p className="text-xs">在左侧选择对战</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
