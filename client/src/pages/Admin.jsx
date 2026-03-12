import React from 'react';
import { useGameState } from '../hooks/useGameState';
import AdminRound1 from '../components/AdminRound1';
import AdminRound2 from '../components/AdminRound2';
import AdminRound3 from '../components/AdminRound3';
import AdminRound4 from '../components/AdminRound4';
import AdminPickOpponent from '../components/AdminPickOpponent';
import PlayerManager from '../components/PlayerManager';

export default function Admin() {
    const { gameState, updateState } = useGameState();

    if (!gameState) return <div className="p-8 text-white flex justify-center items-center min-h-screen text-2xl font-bold bg-slate-900">连接服务器中...</div>;

    const currentTheme = gameState.theme || 'theme-dark';

    return (
        <div className="p-8 text-white bg-slate-900 min-h-screen font-sans">
            <div className="flex justify-between items-center mb-6 border-b border-slate-700 pb-4">
                <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-500">
                    控制中心 | 校园歌手大赛
                </h1>
                <div className="flex space-x-4 items-center">
                    <span className="text-xl text-teal-300 font-bold border-r border-slate-600 pr-4 mt-2">
                        大屏当前: 阶段 {gameState.screenRound}
                    </span>
                    <button
                        onClick={() => updateState({ ...gameState, screenRound: gameState.adminRound })}
                        className="bg-red-600 hover:bg-red-500 text-white font-bold px-6 py-2 rounded-lg shadow-lg animate-pulse"
                    >
                        🚀 强制大屏同步至当前后台阶段
                    </button>
                    <span className="text-sm text-slate-400">实时连接正常 🟢</span>
                </div>
            </div>

            <div className="flex flex-col xl:flex-row gap-6 mb-6">
                <div className="flex-1 bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-700">
                    <h2 className="text-xl mb-4 text-slate-300 font-bold border-l-4 border-teal-500 pl-3">比赛阶段控制 (仅影响本地操作)</h2>
                    <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
                        <button
                            onClick={() => updateState({ ...gameState, adminRound: 0 })}
                            className={`py-3 px-4 rounded-xl font-bold transition-all shadow-md ${gameState.adminRound === 0 ? 'bg-gradient-to-r from-teal-600 to-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.5)] transform scale-[1.02] text-white' : 'bg-slate-700 border border-slate-600 hover:bg-slate-600 text-slate-300'}`}
                        >
                            ⚙️ 赛前设置
                        </button>
                        <button
                            onClick={() => updateState({ ...gameState, adminRound: 1 })}
                            className={`py-3 px-4 rounded-xl font-bold transition-all shadow-md ${gameState.adminRound === 1 ? 'bg-gradient-to-r from-teal-600 to-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.5)] transform scale-[1.02] text-white' : 'bg-slate-700 border border-slate-600 hover:bg-slate-600 text-slate-300'}`}
                        >
                            第一轮: 30进18排位
                        </button>
                        <button
                            onClick={() => updateState({ ...gameState, adminRound: 1.5 })}
                            className={`py-3 px-4 rounded-xl font-bold transition-all shadow-md ${gameState.adminRound === 1.5 ? 'bg-gradient-to-r from-teal-600 to-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.5)] transform scale-[1.02] text-white' : 'bg-slate-700 border border-slate-600 hover:bg-slate-600 text-slate-300'}`}
                        >
                            过渡: 挑选对手
                        </button>
                        <button
                            onClick={() => updateState({ ...gameState, adminRound: 2 })}
                            className={`py-3 px-4 rounded-xl font-bold transition-all shadow-md ${gameState.adminRound === 2 ? 'bg-gradient-to-r from-teal-600 to-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.5)] transform scale-[1.02] text-white' : 'bg-slate-700 border border-slate-600 hover:bg-slate-600 text-slate-300'}`}
                        >
                            第二轮: 16人PK
                        </button>
                        <button
                            onClick={() => updateState({ ...gameState, adminRound: 3 })}
                            className={`py-3 px-4 rounded-xl font-bold transition-all shadow-md ${gameState.adminRound === 3 ? 'bg-gradient-to-r from-teal-600 to-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.5)] transform scale-[1.02] text-white' : 'bg-slate-700 border border-slate-600 hover:bg-slate-600 text-slate-300'}`}
                        >
                            附加赛: 大魔王
                        </button>
                        <button
                            onClick={() => updateState({ ...gameState, adminRound: 4 })}
                            className={`py-3 px-4 rounded-xl font-bold transition-all shadow-md ${gameState.adminRound === 4 ? 'bg-gradient-to-r from-teal-600 to-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.5)] transform scale-[1.02] text-white' : 'bg-slate-700 border border-slate-600 hover:bg-slate-600 text-slate-300'}`}
                        >
                            第三轮: 终极补位
                        </button>
                    </div>
                </div>

                <div className="bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-700 xl:w-80">
                    <h2 className="text-xl mb-4 text-slate-300 font-bold border-l-4 border-pink-500 pl-3">大屏视觉主题</h2>
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => updateState({ ...gameState, theme: 'theme-dark' })}
                            className={`py-2 px-4 rounded-lg font-bold transition-all flex items-center justify-between ${currentTheme === 'theme-dark' ? 'bg-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.5)] border-transparent' : 'bg-slate-700 border border-slate-600 hover:bg-slate-600 text-slate-300'}`}
                        >
                            <span>🌌 科技深色 (默认)</span>
                            {currentTheme === 'theme-dark' && <span className="text-xs bg-white text-indigo-600 px-2 rounded-full">当前</span>}
                        </button>
                        <button
                            onClick={() => updateState({ ...gameState, theme: 'theme-gold' })}
                            className={`py-2 px-4 rounded-lg font-bold transition-all flex items-center justify-between ${currentTheme === 'theme-gold' ? 'bg-amber-600 shadow-[0_0_10px_rgba(217,119,6,0.5)] border-transparent text-white' : 'bg-slate-700 border border-slate-600 hover:bg-slate-600 text-slate-300'}`}
                        >
                            <span>✨ 黑金奢华 (决赛)</span>
                            {currentTheme === 'theme-gold' && <span className="text-xs bg-white text-amber-600 px-2 rounded-full">当前</span>}
                        </button>
                        <button
                            onClick={() => updateState({ ...gameState, theme: 'theme-light' })}
                            className={`py-2 px-4 rounded-lg font-bold transition-all flex items-center justify-between ${currentTheme === 'theme-light' ? 'bg-sky-500 shadow-[0_0_10px_rgba(14,165,233,0.5)] border-transparent text-white' : 'bg-slate-700 border border-slate-600 hover:bg-slate-600 text-slate-300'}`}
                        >
                            <span>🍃 清新浅色 (白天)</span>
                            {currentTheme === 'theme-light' && <span className="text-xs bg-white text-sky-500 px-2 rounded-full">当前</span>}
                        </button>
                    </div>
                </div>
            </div>

            {gameState.adminRound === 0 && <PlayerManager gameState={gameState} updateState={updateState} />}
            {gameState.adminRound === 1 && <AdminRound1 gameState={gameState} updateState={updateState} />}
            {gameState.adminRound === 1.5 && <AdminPickOpponent gameState={gameState} updateState={updateState} />}
            {gameState.adminRound === 2 && <AdminRound2 gameState={gameState} updateState={updateState} />}
            {gameState.adminRound === 3 && <AdminRound3 gameState={gameState} updateState={updateState} />}
            {gameState.adminRound === 4 && <AdminRound4 gameState={gameState} updateState={updateState} />}
        </div>
    );
}
