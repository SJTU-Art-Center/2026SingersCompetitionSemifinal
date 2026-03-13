import React from 'react';
import { getFullAvatarUrl } from '../../utils/avatar';

const GROUP_COLORS = [
    { ring: 'from-teal-400/60 to-teal-800/20', label: 'bg-teal-600/80 text-teal-100', title: 'text-teal-300', border: 'border-teal-500/30' },
    { ring: 'from-indigo-400/60 to-indigo-800/20', label: 'bg-indigo-600/80 text-indigo-100', title: 'text-indigo-300', border: 'border-indigo-500/30' },
    { ring: 'from-amber-400/60 to-amber-800/20', label: 'bg-amber-600/80 text-amber-100', title: 'text-amber-300', border: 'border-amber-500/30' },
    { ring: 'from-rose-400/60 to-rose-800/20', label: 'bg-rose-600/80 text-rose-100', title: 'text-rose-300', border: 'border-rose-500/30' },
    { ring: 'from-cyan-400/60 to-cyan-800/20', label: 'bg-cyan-600/80 text-cyan-100', title: 'text-cyan-300', border: 'border-cyan-500/30' },
    { ring: 'from-purple-400/60 to-purple-800/20', label: 'bg-purple-600/80 text-purple-100', title: 'text-purple-300', border: 'border-purple-500/30' },
];

export default function GroupIntro({ gameState }) {
    const groups = [1, 2, 3, 4, 5, 6].map(g => ({
        id: g,
        players: gameState.players.filter(p => (p.group || 1) === g),
        color: GROUP_COLORS[g - 1],
    }));

    return (
        <div className="w-full h-full flex flex-col bg-slate-950 text-white overflow-hidden">
            {/* Header */}
            <div className="flex-shrink-0 pt-5 pb-3 text-center">
                <h1 className="text-3xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-indigo-400 drop-shadow-lg">
                    第一轮 · 分组介绍
                </h1>
                <p className="text-slate-500 text-xs mt-1 tracking-wider">共 6 组 · 每组 5 位选手</p>
            </div>

            {/* 6-group grid */}
            <div className="flex-1 grid grid-cols-3 grid-rows-2 gap-3 px-4 pb-4 min-h-0">
                {groups.map(({ id, players, color }) => (
                    <div
                        key={id}
                        className={`flex flex-col rounded-2xl border ${color.border} bg-slate-900/60 backdrop-blur-sm overflow-hidden`}
                    >
                        {/* Group label */}
                        <div className={`flex-shrink-0 flex items-center justify-center gap-2 py-1.5 ${color.label} text-sm font-black tracking-widest`}>
                            <span>第 {id} 组</span>
                        </div>

                        {/* Players row */}
                        <div className="flex-1 flex items-center justify-around px-2 py-2 gap-1 min-h-0">
                            {players.map(p => (
                                <div key={p.id} className="flex flex-col items-center gap-1 flex-1 min-w-0">
                                    {/* Bubble avatar */}
                                    <div className={`rounded-full p-[2px] bg-gradient-to-b ${color.ring} shadow-[0_4px_16px_rgba(0,0,0,0.5)] flex-shrink-0`}>
                                        <img
                                            src={getFullAvatarUrl(p.avatar)}
                                            alt={p.name}
                                            className="w-14 h-14 rounded-full border border-white/10 object-cover block"
                                        />
                                    </div>
                                    {/* Name */}
                                    <span className={`text-xs font-bold ${color.title} truncate max-w-full text-center leading-tight`}>
                                        {p.name}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
