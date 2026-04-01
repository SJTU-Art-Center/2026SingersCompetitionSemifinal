import { getFullAvatarUrl } from '../../utils/avatar';
import PlayerIdentity from '../common/PlayerIdentity';

const GROUP_COLORS = [
    { ring: 'from-emerald-300/35 to-cyan-800/15', label: 'bg-emerald-700/55 text-emerald-100', title: 'text-white', border: 'border-emerald-300/35', card: 'from-emerald-500/34 to-emerald-900/20 border-emerald-300/50' },
    { ring: 'from-emerald-300/35 to-cyan-800/15', label: 'bg-teal-700/55 text-teal-100', title: 'text-slate-100', border: 'border-teal-300/35', card: 'from-emerald-500/34 to-emerald-900/20 border-emerald-300/50' },
    { ring: 'from-emerald-300/35 to-cyan-800/15', label: 'bg-cyan-700/55 text-cyan-100', title: 'text-slate-100', border: 'border-cyan-300/35', card: 'from-emerald-500/34 to-emerald-900/20 border-emerald-300/50' },
    { ring: 'from-cyan-300/35 to-emerald-800/15', label: 'bg-emerald-800/55 text-emerald-100', title: 'text-slate-100', border: 'border-emerald-300/35', card: 'from-cyan-500/36 to-slate-900/24 border-cyan-300/55' },
    { ring: 'from-cyan-300/35 to-emerald-800/15', label: 'bg-teal-800/55 text-teal-100', title: 'text-slate-100', border: 'border-teal-300/35', card: 'from-cyan-500/36 to-slate-900/24 border-cyan-300/55' },
    { ring: 'from-cyan-300/35 to-emerald-800/15', label: 'bg-cyan-800/55 text-cyan-100', title: 'text-slate-100', border: 'border-cyan-300/35', card: 'from-cyan-500/36 to-slate-900/24 border-cyan-300/55' },
];

export default function GroupIntro({ gameState }) {
    const groups = [1, 2, 3, 4, 5, 6].map(g => ({
        id: g,
        players: gameState.players.filter(p => (p.group || 1) === g),
        color: GROUP_COLORS[g - 1],
    }));

    const renderPlayerCard = (player, color, isBottomRow = false) => (
        <div
            key={player.id}
            className={`rounded-[14px] border p-1.5 bg-gradient-to-br ${color.card} backdrop-blur-md shadow-[inset_0_1px_8px_rgba(255,255,255,0.12),0_4px_10px_rgba(2,6,23,0.25)] flex items-center gap-2 min-w-0 ${isBottomRow ? 'px-2 py-1.5' : ''}`}
        >
            <div className={`rounded-xl p-[2px] bg-gradient-to-b ${color.ring} shadow-[0_4px_16px_rgba(0,0,0,0.5)] flex-shrink-0`}>
                <img
                    src={getFullAvatarUrl(player.avatar)}
                    alt={player.name}
                    className={`${isBottomRow ? 'w-10 h-10' : 'w-9 h-9'} rounded-lg border border-white/10 object-cover block`}
                />
            </div>
            <PlayerIdentity
                player={player}
                compact
                center={false}
                className="flex-1 min-w-0"
                numberClassName="text-[10px] text-slate-300 tracking-[0.18em]"
                nameClassName={`text-[11px] ${color.title} text-left leading-tight`}
            />
        </div>
    );

    return (
        <div className="w-full h-full flex flex-col bg-transparent text-white overflow-hidden">
            <div className="flex-1 grid grid-cols-3 grid-rows-2 gap-3 px-4 pt-2 pb-3 min-h-0">
                {groups.map(({ id, players, color }) => (
                    <div
                        key={id}
                        className={`flex flex-col rounded-2xl border ${color.border} bg-slate-900/35 backdrop-blur-sm overflow-hidden min-h-0`}
                    >
                        <div className={`flex-shrink-0 flex items-center justify-center gap-2 py-1.5 ${color.label} text-[13px] font-black tracking-[0.22em]`}>
                            <span>第 {id} 组</span>
                        </div>

                        <div className="flex-1 px-2.5 py-2 min-h-0 flex flex-col gap-2 justify-center">
                            <div className="grid grid-cols-3 gap-2">
                                {players.slice(0, 3).map(p => renderPlayerCard(p, color))}
                            </div>

                            <div className="grid grid-cols-2 gap-2 w-[72%] mx-auto">
                                {players.slice(3, 5).map(p => renderPlayerCard(p, color, true))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
