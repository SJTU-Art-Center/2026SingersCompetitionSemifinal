import React from 'react';
import { getFullAvatarUrl } from '../../utils/avatar';
import PlayerIdentity from '../common/PlayerIdentity';

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
            <div className="flex-1 grid grid-cols-3 grid-rows-2 gap-3 px-4 pt-2 pb-4 min-h-0">
                {groups.map(({ id, players, color }) => (
                    <div
                        key={id}
                        className={`flex flex-col rounded-2xl border ${color.border} bg-slate-900/60 backdrop-blur-sm overflow-hidden`}
                    >
                        <div className={`flex-shrink-0 flex items-center justify-center gap-2 py-1.5 ${color.label} text-sm font-black tracking-widest`}>
                            <span>第 {id} 组</span>
                        </div>

                        <div className="flex-1 px-2 py-2 min-h-0 flex flex-col gap-1.5">
                            <div className="grid grid-cols-3 gap-1.5">
                                {players.slice(0, 3).map(p => (
                                    <div key={p.id} className="aspect-[3/4] rounded-[14px] border border-white/15 bg-gradient-to-br from-slate-800/70 to-slate-900/50 p-1 backdrop-blur-md shadow-[inset_0_1px_8px_rgba(255,255,255,0.1),0_4px_12px_rgba(2,6,23,0.3)] flex flex-col items-center justify-center text-center min-w-0 gap-1">
                                        <div className={`rounded-xl p-[2px] bg-gradient-to-b ${color.ring} shadow-[0_4px_16px_rgba(0,0,0,0.5)] flex-shrink-0`}>
                                            <img
                                                src={getFullAvatarUrl(p.avatar)}
                                                alt={p.name}
                                                className="w-8 h-8 rounded-lg border border-white/10 object-cover block"
                                            />
                                        </div>
                                        <PlayerIdentity
                                            player={p}
                                            compact
                                            className="max-w-full"
                                            numberClassName="hidden"
                                            nameClassName={`text-[10px] ${color.title} text-center`}
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-2 gap-1.5 w-[66.7%] mx-auto">
                                {players.slice(3, 5).map(p => (
                                    <div key={p.id} className="aspect-[3/4] rounded-[14px] border border-white/15 bg-gradient-to-br from-slate-800/70 to-slate-900/50 p-1 backdrop-blur-md shadow-[inset_0_1px_8px_rgba(255,255,255,0.1),0_4px_12px_rgba(2,6,23,0.3)] flex flex-col items-center justify-center text-center min-w-0 gap-1">
                                        <div className={`rounded-xl p-[2px] bg-gradient-to-b ${color.ring} shadow-[0_4px_16px_rgba(0,0,0,0.5)] flex-shrink-0`}>
                                            <img
                                                src={getFullAvatarUrl(p.avatar)}
                                                alt={p.name}
                                                className="w-8 h-8 rounded-lg border border-white/10 object-cover block"
                                            />
                                        </div>
                                        <PlayerIdentity
                                            player={p}
                                            compact
                                            className="max-w-full"
                                            numberClassName="hidden"
                                            nameClassName={`text-[10px] ${color.title} text-center`}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
