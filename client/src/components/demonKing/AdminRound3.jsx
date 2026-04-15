import React, { useState } from 'react';
import { getFullAvatarUrl } from '../../utils/avatar';
import PlayerIdentity from '../common/PlayerIdentity';
import { getPlayerSingleLine } from '../../utils/playerIdentity';

export default function AdminRound3({ gameState, updateState }) {
    const players = Array.isArray(gameState.players) ? gameState.players : [];
    const sortedPlayers = [...players].sort((a, b) => b.score - a.score || a.id - b.id);
    const demonKings = sortedPlayers.slice(0, 2);
    const dk1 = demonKings[0] ?? null;
    const dk2 = demonKings[1] ?? null;
    const referencePlayers = sortedPlayers.slice(2, 18);
    const referencePlayersWithScore = referencePlayers.filter(p => Number.isFinite(Number(p.round2Score)) && Number(p.round2Score) > 0);
    const referenceAverage = referencePlayersWithScore.length > 0
        ? referencePlayersWithScore.reduce((sum, player) => sum + Number(player.round2Score), 0) / referencePlayersWithScore.length
        : 0;
    const averageValue = Number.isFinite(referenceAverage) ? referenceAverage : 0;
    const averageScore = averageValue.toFixed(3);

    const [score1Input, setScore1Input] = useState('');
    const [score2Input, setScore2Input] = useState('');

    const hasValidScore = (player) => {
        const score = Number(player?.scoreDK);
        return Number.isFinite(score) && score > 0;
    };

    const dk1Submitted = hasValidScore(dk1);
    const dk2Submitted = hasValidScore(dk2);

    const projectedDK = players.find(p => p.id === gameState.activeDemonKingId);

    const handleProjectDK = (id) => {
        updateState({
            ...gameState,
            screenRound: 3,
            activeDemonKingId: id,
            selectedDemonKingId: id,
            demonKingAvgScore: averageValue,
            screenDisplayMode: 'live'
        });
    };

    const handleSubmitBoth = () => {
        // 收集需要提交的分数
        const updates = [];
        if (dk1 && !dk1Submitted && score1Input) {
            const s = parseFloat(score1Input);
            if (!isNaN(s)) updates.push({ id: dk1.id, score: s });
        }
        if (dk2 && !dk2Submitted && score2Input) {
            const s = parseFloat(score2Input);
            if (!isNaN(s)) updates.push({ id: dk2.id, score: s });
        }
        if (updates.length === 0) return alert('请至少输入一个有效分数');

        const updateIds = new Set(updates.map(u => u.id));
        const scoreMap = Object.fromEntries(updates.map(u => [u.id, u.score]));
        const newPlayers = players.map(p => {
            if (!updateIds.has(p.id)) return p;
            const dkScore = scoreMap[p.id];
            return { ...p, scoreDK: dkScore, status: dkScore >= averageValue ? 'advanced' : 'pending' };
        });
        updateState({
            ...gameState,
            players: newPlayers,
            dkScoreSubmitted: newPlayers.some(hasValidScore),
            demonKingAvgScore: averageValue
        });
    };

    const handleResetScore = (dkId) => {
        if (!dkId) return;
        if (!window.confirm('确定清空该大魔王的分数吗？')) return;
        const newPlayers = players.map((p) =>
            p.id === dkId ? { ...p, scoreDK: undefined, status: 'top2' } : p
        );
        updateState({
            ...gameState,
            players: newPlayers,
            dkScoreSubmitted: newPlayers.some(hasValidScore)
        });
        if (dkId === dk1?.id) setScore1Input('');
        if (dkId === dk2?.id) setScore2Input('');
    };

    const handleSeedData = () => {
        if (!window.confirm('⚠️ 一键填入大魔王测试数据？\n将为两位大魔王随机生成得分并按高于平均分判定守擂结果。')) return;
        const avg = averageValue;
        const newPlayers = players.map(p => {
            const dk = demonKings.find(d => d.id === p.id);
            if (!dk) return p;
            const dkScore = parseFloat((avg - 3 + Math.random() * 10).toFixed(1));
            const newStatus = dkScore >= avg ? 'advanced' : 'pending';
            return { ...p, scoreDK: dkScore, status: newStatus };
        });
        updateState({
            ...gameState,
            players: newPlayers,
            dkScoreSubmitted: true,
            demonKingAvgScore: averageValue
        });
    };

    // 单侧 DK 面板
    const renderDkPanel = (dk, scoreInput, setScoreInput, colorScheme) => {
        if (!dk) return null;
        const submitted = hasValidScore(dk);
        const passed = submitted && dk.scoreDK >= averageValue;
        const borderColor = colorScheme === 'amber' ? 'border-amber-800/50' : 'border-rose-800/50';
        const bgColor = colorScheme === 'amber' ? 'bg-amber-900/20' : 'bg-rose-900/20';
        const accentText = colorScheme === 'amber' ? 'text-amber-500' : 'text-rose-500';
        const accentName = colorScheme === 'amber' ? 'text-amber-300' : 'text-rose-300';
        const accentBorder = colorScheme === 'amber' ? 'border-amber-500' : 'border-rose-500';
        const inputBorderL = colorScheme === 'amber' ? 'border-l-amber-600' : 'border-l-rose-600';
        const inputText = colorScheme === 'amber' ? 'text-amber-300' : 'text-rose-300';

        return (
            <div className={`flex-1 flex flex-col items-center ${bgColor} border ${borderColor} rounded-lg py-2 px-1`}>
                <img src={getFullAvatarUrl(dk.avatar)} alt="" className={`w-10 h-10 rounded-full border-2 ${accentBorder} object-cover shadow mb-1`} />
                <PlayerIdentity
                    player={dk}
                    compact
                    className="mt-0.5"
                    numberClassName={`text-[9px] ${accentText}`}
                    nameClassName={`text-xs font-black ${accentName}`}
                />
                <div className={`text-[10px] ${accentText}`}>
                    {colorScheme === 'amber' ? '大魔王 壹' : '大魔王 贰'}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">第一轮: {dk.score}</div>
                {submitted && (
                    <div className={`text-sm font-black mt-1 ${passed ? 'text-emerald-400' : 'text-red-400'}`}>
                        {dk.scoreDK}
                    </div>
                )}
            </div>
        );
    };

    const renderScoreInput = (dk, scoreInput, setScoreInput, label, inputId, colorScheme) => {
        if (!dk) return null;
        const submitted = hasValidScore(dk);
        const inputBorderL = colorScheme === 'amber' ? 'border-l-amber-600' : 'border-l-rose-600';
        const inputText = colorScheme === 'amber' ? 'text-amber-300' : 'text-rose-300';
        const labelColor = colorScheme === 'amber' ? 'text-amber-400' : 'text-rose-400';

        return (
            <div className="relative flex-1 min-w-0">
                <span className={`absolute left-1.5 top-1.5 text-[9px] ${labelColor} font-bold leading-none`}>{label}</span>
                <input
                    id={inputId}
                    type="number" step="0.01"
                    value={submitted ? (scoreInput || dk.scoreDK?.toString() || '') : scoreInput}
                    onChange={e => setScoreInput(e.target.value)}
                    disabled={submitted}
                    className={`w-full bg-slate-800 border border-slate-600 rounded-lg py-1.5 pl-8 pr-1 border-l-4 ${inputBorderL} text-sm font-black text-right ${inputText} focus:outline-none focus:border-teal-500 disabled:opacity-50`}
                    placeholder="0-100"
                />
            </div>
        );
    };

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
                {/* 左侧：大魔王状态总览 */}
                <div className="col-span-2">
                    <h3 className="text-sm mb-2 text-slate-300 font-bold border-l-4 border-slate-500 pl-2">大魔王状态</h3>
                    <div className="grid grid-cols-2 gap-2">
                        {demonKings.map(dk => {
                            const submitted = hasValidScore(dk);
                            const passed = submitted && dk.scoreDK >= averageValue;
                            return (
                                <div
                                    key={dk.id}
                                    className="py-3 px-3 rounded-xl border flex items-center gap-3 bg-white/5 border-white/10 text-slate-300 backdrop-blur-sm shadow-inner"
                                >
                                    <img src={getFullAvatarUrl(dk.avatar)} alt={dk.name} className="w-12 h-12 rounded-full border border-white/20 object-cover shadow flex-shrink-0" />
                                    <div className="flex flex-col items-start flex-1 min-w-0">
                                        <PlayerIdentity
                                            player={dk}
                                            compact
                                            center={false}
                                            numberClassName="text-[9px] text-slate-500"
                                            nameClassName="font-black text-sm"
                                        />
                                        <div className="text-xs text-slate-400">第一轮: {dk.score}</div>
                                        {submitted && (
                                            <div className={`text-xs font-bold mt-0.5 ${passed ? 'text-emerald-400' : 'text-red-400'}`}>
                                                大魔王分: {dk.scoreDK} {passed ? '✅守擂成功' : '❌守擂失败'}
                                            </div>
                                        )}
                                        {!submitted && (
                                            <div className="text-xs text-slate-500 mt-0.5">待打分</div>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => handleProjectDK(dk.id)}
                                        className={`px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all flex-shrink-0 ${gameState.activeDemonKingId === dk.id ? 'bg-amber-600 text-white border border-amber-400' : 'bg-slate-700 text-slate-300 border border-slate-600 hover:bg-slate-600'}`}
                                    >
                                        📺 投屏
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 右侧：打分面板 */}
                <div className="col-span-1 w-full min-w-0 bg-slate-900 p-3 rounded-xl border border-slate-700 shadow-xl h-fit sticky top-4">
                    <h3 className="text-xs mb-2 text-teal-300 text-center font-bold tracking-widest bg-teal-900/30 py-1 rounded">打分面板</h3>
                    <div className="mb-2 text-[11px] text-slate-400 text-center">
                        当前上屏：<span className="text-cyan-300 font-bold">{projectedDK ? getPlayerSingleLine(projectedDK) : '未投屏'}</span>
                    </div>

                    {/* 两位大魔王信息并排 */}
                    <div className="flex gap-2 mb-2">
                        {renderDkPanel(dk1, score1Input, setScore1Input, 'amber')}
                        <div className="flex items-center text-slate-500 font-black text-sm">VS</div>
                        {renderDkPanel(dk2, score2Input, setScore2Input, 'rose')}
                    </div>

                    {/* 分数输入区 */}
                    <div className="flex flex-col gap-1.5">
                        <div className="flex gap-1.5">
                            {renderScoreInput(dk1, score1Input, setScore1Input, '壹号\n得分', 'dk1Score', 'amber')}
                            {renderScoreInput(dk2, score2Input, setScore2Input, '贰号\n得分', 'dk2Score', 'rose')}
                        </div>

                        {/* 提交按钮 */}
                        <button
                            onClick={handleSubmitBoth}
                            disabled={dk1Submitted && dk2Submitted}
                            className="w-full bg-teal-700 hover:bg-teal-600 disabled:opacity-40 disabled:cursor-not-allowed border border-teal-500 text-white font-bold py-1.5 rounded-lg text-xs tracking-wider transition-all active:scale-[0.98]"
                        >确认提交</button>

                        {/* 已提交后的结果 + 操作 */}
                        {(dk1Submitted || dk2Submitted) && (
                            <>
                                {dk1Submitted && (
                                    <div className={`text-[10px] text-center py-1 rounded border font-bold ${dk1.scoreDK >= averageValue ? 'border-emerald-700 text-emerald-400 bg-emerald-900/20' : 'border-red-800 text-red-400 bg-red-900/20'}`}>
                                        壹号: {dk1.scoreDK >= averageValue ? '✅ 守擂成功（直接晋级）' : '❌ 守擂失败（落入待定）'}
                                    </div>
                                )}
                                {dk2Submitted && (
                                    <div className={`text-[10px] text-center py-1 rounded border font-bold ${dk2.scoreDK >= averageValue ? 'border-emerald-700 text-emerald-400 bg-emerald-900/20' : 'border-red-800 text-red-400 bg-red-900/20'}`}>
                                        贰号: {dk2.scoreDK >= averageValue ? '✅ 守擂成功（直接晋级）' : '❌ 守擂失败（落入待定）'}
                                    </div>
                                )}
                                <div className="flex gap-1.5">
                                    {dk1Submitted && (
                                        <button
                                            onClick={() => handleResetScore(dk1.id)}
                                            className="flex-1 bg-slate-700 hover:bg-slate-600 border border-slate-500 text-white font-bold py-1.5 rounded-lg text-[10px] transition-all"
                                        >重置壹号分数</button>
                                    )}
                                    {dk2Submitted && (
                                        <button
                                            onClick={() => handleResetScore(dk2.id)}
                                            className="flex-1 bg-slate-700 hover:bg-slate-600 border border-slate-500 text-white font-bold py-1.5 rounded-lg text-[10px] transition-all"
                                        >重置贰号分数</button>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
