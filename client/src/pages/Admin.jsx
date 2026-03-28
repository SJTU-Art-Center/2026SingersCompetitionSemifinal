import React, { useState } from 'react';
import { useGameState } from '../hooks/useGameState';
import AdminRound1 from '../components/round1/AdminRound1';
import AdminRound2 from '../components/round2/AdminRound2';
import AdminRound3 from '../components/demonKing/AdminRound3';
import AdminRound4 from '../components/final/AdminRound4';
import AdminPickOpponent from '../components/transition/AdminPickOpponent';
import PlayerManager from '../components/PlayerManager';
import { getPlayerSingleLine } from '../utils/playerIdentity';

export default function Admin() {
    const { gameState, updateState, connectionError, activeServerUrl } = useGameState();
    const [adminMatchIndex, setAdminMatchIndex] = useState(0);
    const [adminGroup, setAdminGroup] = useState(gameState?.currentGroup || 1);
    const [adminRound1Mode, setAdminRound1Mode] = useState(gameState?.round1Mode || 'group');

    const finalStageLabels = {
        1: '大魔王亮相',
        2: '大魔王分数与晋级',
        3: '8擂主+8攻擂者',
        4: '8组晋级重排',
        5: '待定大魔王聚焦',
        6: '待定区补位展示',
        7: '最终阵容'
    };

    if (!gameState) {
        return (
            <div className="p-8 text-white flex flex-col justify-center items-center min-h-screen text-2xl font-bold bg-slate-900 gap-4">
                <div className="animate-pulse">连接服务器中...</div>
                {connectionError && <div className="text-sm text-red-300 bg-red-900/30 border border-red-600/40 px-4 py-2 rounded-xl">{connectionError}</div>}
                {activeServerUrl && <div className="text-xs text-slate-400 font-mono">已连接：{activeServerUrl}</div>}
            </div>
        );
    }

    const currentTheme = gameState.theme || 'theme-dark';

    const phases = [
        { value: 0,   label: '赛前设置',  icon: '⚙️' },
        { value: 1,   label: '第一轮',    icon: '🎤' },
        { value: 1.5, label: '过渡挑选',  icon: '⚔️' },
        { value: 2,   label: '第二轮',    icon: '🥊' },
        { value: 3,   label: '大魔王',    icon: '👑' },
        { value: 4,   label: '终极补位',  icon: '🏆' },
    ];
    const phaseIndex = (v) => phases.findIndex(p => p.value === v);
    const adminIdx = phaseIndex(gameState.adminRound);
    const screenIdx = phaseIndex(gameState.screenRound);

    const screenPinLabel = (() => {
        const sr = gameState.screenRound;
        if (sr === 1) {
            if (gameState.round1Mode === 'full') return '第一轮【完整排名】';
            if (gameState.round1Mode === 'groupIntro') return '第一轮【分组介绍】';
            return `第一轮【第${gameState.currentGroup ?? 1}组】`;
        }
        if (sr === 2) {
            const idx = gameState.screenMatchIndex ?? 0;
            const m = (gameState.pkMatches || [])[idx];
            const cPlayer = m ? gameState.players.find(p => p.id === m.challengerId) : null;
            const mPlayer = m ? gameState.players.find(p => p.id === m.masterId) : null;
            const c = cPlayer ? getPlayerSingleLine(cPlayer) : null;
            const ms = mPlayer ? getPlayerSingleLine(mPlayer) : null;
            return `第二轮【第${idx + 1}场${c && ms ? ` ${c}vs${ms}` : ''}】`;
        }
        if (sr === 4) {
            const stage = Number(gameState.screenFinalStageIndex ?? gameState.finalStageIndex ?? 1);
            return `终极补位【Stage ${stage} · ${finalStageLabels[stage] || '最终阵容'}】`;
        }
        return phases[screenIdx]?.label;
    })();

    return (
        <div className="min-h-screen text-white bg-slate-900 font-sans p-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-6 border-b border-slate-700 pb-4">
                <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-500">
                    控制中心 | 校园歌手大赛
                </h1>
                <div className="flex space-x-4 items-center">
                    <span className="text-sm text-slate-400">实时连接正常 🟢</span>
                </div>
            </div>

            {/* ═══ UNIFIED PHASE CONTROL + THEME ═══ */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 shadow-xl mb-6 flex gap-5">

                {/* LEFT: Phase track + sub-panel */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-base font-bold text-slate-300 border-l-4 border-teal-500 pl-3">比赛阶段控制</h2>
                        <button
                            onClick={() => {
                                if (gameState.adminRound === 1) {
                                    // R1: also commit the currently editing group/mode to screen
                                    updateState({ ...gameState, screenRound: gameState.adminRound, currentGroup: adminGroup, round1Mode: adminRound1Mode });
                                } else if (gameState.adminRound === 1.5) {
                                    const stage = Number(gameState.transitionStage ?? 1);
                                    updateState({ ...gameState, screenRound: 1.5, transitionStage: stage, screenTransitionStage: stage });
                                } else if (gameState.adminRound === 2) {
                                    updateState({ ...gameState, screenRound: gameState.adminRound, screenMatchIndex: adminMatchIndex });
                                } else if (gameState.adminRound === 3) {
                                    const selectedId = gameState.selectedDemonKingId ?? gameState.activeDemonKingId ?? null;
                                    updateState({
                                        ...gameState,
                                        screenRound: gameState.adminRound,
                                        activeDemonKingId: selectedId
                                    });
                                } else if (gameState.adminRound === 4) {
                                    const stage = Number(gameState.finalStageIndex ?? 1);
                                    updateState({ ...gameState, screenRound: gameState.adminRound, screenFinalStageIndex: stage, finalStageIndex: stage, resurrectionCalculated: true });
                                } else {
                                    updateState({ ...gameState, screenRound: gameState.adminRound });
                                }
                            }}
                            className="bg-amber-600/80 hover:bg-amber-500 text-white font-bold px-5 py-1.5 rounded-lg shadow-lg text-sm border border-amber-500 transition-colors"
                        >
                            📺 投屏
                        </button>
                    </div>

                    {/* Phase buttons */}
                    <div className="grid grid-cols-6 gap-2">
                        {phases.map((ph) => (
                            <button
                                key={ph.value}
                                onClick={() => updateState({ ...gameState, adminRound: ph.value })}
                                className={`relative py-3 px-2 rounded-xl font-bold text-sm transition-all shadow-md flex flex-col items-center gap-1 overflow-hidden ${
                                    gameState.adminRound === ph.value
                                        ? 'bg-gradient-to-b from-teal-600 to-teal-800 text-white shadow-[0_0_14px_rgba(20,184,166,0.6)] scale-[1.03]'
                                        : 'bg-slate-700/80 border border-slate-600 hover:bg-slate-600 text-slate-300'
                                }`}
                            >
                                <span className="text-xl">{ph.icon}</span>
                                <span className="text-xs leading-tight text-center">{ph.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Pin rail */}
                    <div className="mt-3 relative h-12 select-none">
                        <div className="absolute inset-y-[18px] inset-x-0 h-1.5 bg-slate-700 rounded-full" />
                        {[0,1,2,3,4,5].map(i => (
                            <div key={i} className="absolute top-[14px] w-0.5 h-4 bg-slate-600 rounded-full" style={{left: `calc(${i}/5 * (100% - 8.33%) + 4.17%)`}} />
                        ))}
                        {/* Admin (edit) pin — teal */}
                        <div
                            className="absolute transition-all duration-300 flex flex-col items-center"
                            style={{left: `calc(${adminIdx}/5 * (100% - 8.33%) + 4.17%)`, transform: 'translateX(-50%)', bottom: 0}}
                        >
                            <div className="bg-teal-500 text-white rounded-full px-2.5 py-0.5 text-[11px] font-black shadow-[0_0_8px_rgba(20,184,166,0.8)] whitespace-nowrap flex items-center gap-1">
                                <span>✏️</span><span>编辑中</span>
                            </div>
                            <div className="w-0.5 h-3 bg-teal-400" />
                            <div className="w-3 h-3 bg-teal-400 rounded-full shadow-[0_0_6px_rgba(20,184,166,0.9)] ring-2 ring-teal-300" />
                        </div>
                        {/* Screen (display) pin — amber */}
                        <div
                            className="absolute transition-all duration-300 flex flex-col items-center"
                            style={{left: `calc(${screenIdx}/5 * (100% - 8.33%) + 4.17%)`, transform: 'translateX(-50%)', top: 0}}
                        >
                            <div className="w-3 h-3 bg-amber-400 rounded-full shadow-[0_0_6px_rgba(251,191,36,0.9)] ring-2 ring-amber-300" />
                            <div className="w-0.5 h-3 bg-amber-400" />
                            <div className="bg-amber-500 text-white rounded-full px-2.5 py-0.5 text-[11px] font-black shadow-[0_0_8px_rgba(251,191,36,0.8)] whitespace-nowrap flex items-center gap-1">
                                <span>📺</span><span>大屏中</span>
                            </div>
                        </div>
                    </div>

                    {/* Status label row */}
                    <div className="mt-1 flex justify-between px-1 mb-4">
                        <span className="text-xs text-teal-400 font-bold">✏️ 编辑: {phases[adminIdx]?.label}</span>
                        <span className="text-xs text-amber-400 font-bold">📺 大屏: {screenPinLabel}</span>
                    </div>

                    {/* ── Per-phase sub-panel ── */}

                    {/* Round 1: group selector + broadcast */}
                    {gameState.adminRound === 1 && (
                        <div className="flex flex-wrap gap-2 bg-slate-900 border border-slate-700 p-4 rounded-xl">
                            <button
                                onClick={() => { setAdminRound1Mode('groupIntro'); }}
                                className={`px-4 py-2 rounded-lg font-bold transition-all text-sm ${adminRound1Mode === 'groupIntro' ? 'bg-pink-600 text-white shadow-[0_0_10px_rgba(219,39,119,0.6)]' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}
                            >
                                📋 分组介绍
                            </button>
                            {[1, 2, 3, 4, 5, 6].map(g => (
                                <button
                                    key={g}
                                    onClick={() => { setAdminGroup(g); setAdminRound1Mode('group'); }}
                                    className={`px-4 py-2 rounded-lg font-bold transition-all ${adminGroup === g && adminRound1Mode === 'group' ? 'bg-teal-600 text-white shadow-[0_0_10px_rgba(13,148,136,0.6)]' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}
                                >
                                    第 {g} 组
                                </button>
                            ))}
                        </div>
                    )}

                </div>


                {/* RIGHT: Compact theme selector */}
                <div className="flex-shrink-0 w-44 flex flex-col gap-2 border-l border-slate-700 pl-5">
                    <div className="text-xs font-bold text-slate-400 mb-1 border-l-4 border-pink-500 pl-2">大屏主题</div>
                    <button
                        onClick={() => updateState({ ...gameState, theme: 'theme-dark' })}
                        className={`py-2 px-3 rounded-lg font-bold transition-all text-sm text-left flex items-center gap-2 ${
                            currentTheme === 'theme-dark'
                                ? 'bg-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.5)] text-white'
                                : 'bg-slate-700 border border-slate-600 hover:bg-slate-600 text-slate-300'
                        }`}
                    >
                        🌌 <span className="truncate">科技深色</span>
                        {currentTheme === 'theme-dark' && <span className="ml-auto text-[10px] bg-white text-indigo-600 px-1.5 rounded-full">当前</span>}
                    </button>
                    <button
                        onClick={() => updateState({ ...gameState, theme: 'theme-gold' })}
                        className={`py-2 px-3 rounded-lg font-bold transition-all text-sm text-left flex items-center gap-2 ${
                            currentTheme === 'theme-gold'
                                ? 'bg-amber-600 shadow-[0_0_10px_rgba(217,119,6,0.5)] text-white'
                                : 'bg-slate-700 border border-slate-600 hover:bg-slate-600 text-slate-300'
                        }`}
                    >
                        ✨ <span className="truncate">黑金奢华</span>
                        {currentTheme === 'theme-gold' && <span className="ml-auto text-[10px] bg-white text-amber-600 px-1.5 rounded-full">当前</span>}
                    </button>
                    <button
                        onClick={() => updateState({ ...gameState, theme: 'theme-light' })}
                        className={`py-2 px-3 rounded-lg font-bold transition-all text-sm text-left flex items-center gap-2 ${
                            currentTheme === 'theme-light'
                                ? 'bg-sky-500 shadow-[0_0_10px_rgba(14,165,233,0.5)] text-white'
                                : 'bg-slate-700 border border-slate-600 hover:bg-slate-600 text-slate-300'
                        }`}
                    >
                        🍃 <span className="truncate">清新浅色</span>
                        {currentTheme === 'theme-light' && <span className="ml-auto text-[10px] bg-white text-sky-500 px-1.5 rounded-full">当前</span>}
                    </button>
                </div>
            </div>

            {/* ═══ Phase component panels ═══ */}
            {gameState.adminRound === 0 && <PlayerManager gameState={gameState} updateState={updateState} />}
            {gameState.adminRound === 1 && <AdminRound1 gameState={gameState} updateState={updateState} adminGroup={adminGroup} />}
            {gameState.adminRound === 1.5 && <AdminPickOpponent gameState={gameState} updateState={updateState} />}
            {gameState.adminRound === 2 && <AdminRound2 gameState={gameState} updateState={updateState} adminMatchIndex={adminMatchIndex} setAdminMatchIndex={setAdminMatchIndex} />}
            {gameState.adminRound === 3 && <AdminRound3 gameState={gameState} updateState={updateState} />}
            {gameState.adminRound === 4 && <AdminRound4 gameState={gameState} updateState={updateState} />}
        </div>
    );
}
