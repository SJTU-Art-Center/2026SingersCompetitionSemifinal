import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { formatPlayerNumber, comparePlayersByContestantNumber } from '../../utils/playerIdentity';

function PlayerChip({ player }) {
    return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 border border-slate-600 text-xs text-white font-bold whitespace-nowrap">
            <span className="text-slate-400 font-mono">{formatPlayerNumber(player)}</span>
            {player.name}
        </span>
    );
}

PlayerChip.propTypes = { player: PropTypes.object.isRequired };

function StatusOverviewBlock({ players, round1Sorted, pkMatches, top10Ids }) {
    const top18 = round1Sorted.slice(0, 18);
    const challengerIds = new Set(pkMatches.map(m => m.challengerId));

    const pendingList = useMemo(() =>
        [...players.filter(p => p.status === 'pending')].sort(comparePlayersByContestantNumber),
        [players]
    );

    const eliminatedChallengerList = useMemo(() =>
        [...top18.filter(p => {
            const r1Rank = round1Sorted.findIndex(s => s.id === p.id) + 1;
            return r1Rank > 10 && p.status === 'eliminated' && challengerIds.has(p.id);
        })].sort(comparePlayersByContestantNumber),
        [top18, round1Sorted, challengerIds]
    );

    const top10List = useMemo(() =>
        [...players.filter(p => top10Ids.has(p.id))].sort(comparePlayersByContestantNumber),
        [players, top10Ids]
    );

    const sections = [
        {
            label: '18人中待定区名单',
            color: 'text-amber-300',
            border: 'border-amber-500/40',
            count: pendingList.length,
            list: pendingList,
        },
        {
            label: '18人中输的挑战者名单',
            color: 'text-red-300',
            border: 'border-red-500/40',
            count: eliminatedChallengerList.length,
            list: eliminatedChallengerList,
        },
        {
            label: '十强名单',
            color: 'text-emerald-300',
            border: 'border-emerald-500/40',
            count: top10List.length,
            list: top10List,
        },
    ];

    return (
        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
            <h3 className="text-slate-300 font-bold mb-4 flex items-center gap-2 text-sm">
                <span className="opacity-80">分类名单速览</span>
            </h3>
            <div className="flex flex-col gap-4">
                {sections.map(({ label, color, border, count, list }) => (
                    <div key={label} className={`border ${border} rounded-lg p-3 bg-slate-800/50`}>
                        <div className={`text-xs font-bold mb-2 ${color} flex items-center gap-2`}>
                            <span>{label}</span>
                            <span className="bg-slate-700 text-slate-300 rounded px-1.5 py-0.5">{count} 人</span>
                        </div>
                        {list.length === 0 ? (
                            <span className="text-slate-500 text-xs">暂无</span>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {list.map(p => <PlayerChip key={p.id} player={p} />)}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

StatusOverviewBlock.propTypes = {
    players: PropTypes.array.isRequired,
    round1Sorted: PropTypes.array.isRequired,
    pkMatches: PropTypes.array.isRequired,
    top10Ids: PropTypes.instanceOf(Set).isRequired,
};

export default function AdminRound4({ gameState, updateState }) {
    const players = Array.isArray(gameState?.players) ? gameState.players : [];
    const pendingPlayers = players.filter(p => p.status === 'pending');
    const advancedPlayers = players.filter(p => p.status === 'advanced');
    const remainingSpots = Math.max(0, 10 - advancedPlayers.length);
    const finalStageIndex = Number(gameState.finalStageIndex ?? 1);

    const stages = [
        { id: 1, label: '晋级大魔王展示', icon: '👑' },
        { id: 2, label: '晋级擂主', icon: '🥇' },
        { id: 3, label: '待定区展示', icon: '👥' },
        { id: 4, label: '晋级分流', icon: '⚖️' },
        { id: 5, label: '第二轮淘汰选手', icon: '💔' },
        { id: 6, label: '十强诞生', icon: '🏆' },
    ];

    const top10Ids = useMemo(() => {
        const pendingSorted = [...pendingPlayers].sort((a, b) => {
            const aR2 = a.round2Score ?? a.scoreDK ?? 0;
            const bR2 = b.round2Score ?? b.scoreDK ?? 0;
            if (bR2 !== aR2) return bR2 - aR2;
            if ((b.score ?? 0) !== (a.score ?? 0)) return (b.score ?? 0) - (a.score ?? 0);
            return (b.judgeScore ?? 0) - (a.judgeScore ?? 0);
        });
        const advancedFromPending = pendingSorted.slice(0, remainingSpots);
        return new Set([
            ...advancedPlayers.map(p => p.id),
            ...advancedFromPending.map(p => p.id)
        ]);
    }, [pendingPlayers, advancedPlayers, remainingSpots]);

    const round1Sorted = useMemo(() => {
        return [...players].sort((a, b) => {
            if ((b.score ?? 0) !== (a.score ?? 0)) return (b.score ?? 0) - (a.score ?? 0);
            if ((b.judgeScore ?? 0) !== (a.judgeScore ?? 0)) return (b.judgeScore ?? 0) - (a.judgeScore ?? 0);
            return a.id - b.id;
        });
    }, [players]);

    const round2Players = useMemo(() => {
        const top18 = round1Sorted.slice(0, 18);
        return top18.map(p => {
            const r1Rank = round1Sorted.findIndex(s => s.id === p.id) + 1;
            const isDemonKing = r1Rank <= 2;
            const isMaster = r1Rank > 2 && r1Rank <= 10;
            const isChallenger = r1Rank > 10 && r1Rank <= 18;

            const roleName = isDemonKing ? '大魔王' : isMaster ? '擂主' : '攻擂者';
            let opponentName = '-';
            if (isDemonKing) {
                opponentName = '本身是大魔王';
            } else {
                const pkMatches = gameState.pkMatches || [];
                const match = isMaster ? pkMatches.find(m => m.masterId === p.id) : pkMatches.find(m => m.challengerId === p.id);
                if (match) {
                    const oppId = isMaster ? match.challengerId : match.masterId;
                    const opp = players.find(x => x.id === oppId);
                    opponentName = opp ? `PK对象：${opp.name}` : '未知对象';
                }
            }

            let outcomeLabel = '状态未知';
            if (isDemonKing) {
                outcomeLabel = p.status === 'advanced' ? '大魔王晋级' : '大魔王落入待定区';
            } else if (isMaster) {
                outcomeLabel = p.status === 'advanced' ? '擂主晋级' : '擂主落入待定区';
            } else if (isChallenger) {
                outcomeLabel = p.status === 'eliminated' ? '攻擂者淘汰' : '攻擂者进入待定区';
            }

            const r2Score = p.round2Score ?? p.scoreDK ?? 0;
            return { ...p, roleName, opponentName, outcomeLabel, r2Score, r1Rank, isTop10: top10Ids.has(p.id) };
        }).sort((a, b) => {
            if (b.r2Score !== a.r2Score) return b.r2Score - a.r2Score;
            if ((b.score ?? 0) !== (a.score ?? 0)) return (b.score ?? 0) - (a.score ?? 0);
            return (b.judgeScore ?? 0) - (a.judgeScore ?? 0);
        });
    }, [round1Sorted, players, gameState.pkMatches, top10Ids]);

    return (
        <div className="mt-4 bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-xl">
            <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-3">
                <h2 className="text-xl font-bold text-amber-400 flex items-center">
                    <span className="bg-amber-600 text-white w-7 h-7 rounded justify-center items-center flex mr-2 text-xs">4</span>
                    终极补位阶段控制
                </h2>
                <div className="flex gap-4 items-center">
                    <div className="text-sm text-slate-400 bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-lg">
                        待定区总计: <span className="text-white font-bold">{pendingPlayers.length}</span> 人
                    </div>
                    <div className="text-sm text-slate-400 bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-lg">
                        剩余名额: <span className="text-amber-400 font-bold">{remainingSpots}</span> / 10
                    </div>
                </div>
            </div>

            <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-700">
                <div className="mb-4 text-sm text-slate-400 border-l-4 border-amber-500 pl-2 font-bold tracking-widest">呈现阶段</div>
                <div className="mb-2 text-xs text-amber-300/80 bg-amber-900/10 border border-amber-600/20 px-3 py-1.5 rounded flex items-center gap-2 w-fit">
                    <span>💡 选择阶段后请点击顶部「📺 投屏」按钮同步至大屏幕</span>
                </div>
                
                <div className="flex gap-4 mt-6">
                    {stages.map((stage) => {
                        const isSelected = finalStageIndex === stage.id;
                        return (
                            <button
                                key={stage.id}
                                onClick={() => updateState({ ...gameState, finalStageIndex: stage.id })}
                                className={`flex-1 py-4 px-4 rounded-xl flex flex-col items-center justify-center gap-2 border-2 transition-all ${
                                    isSelected 
                                    ? 'bg-amber-600/20 border-amber-400 text-amber-300 ring-4 ring-amber-500/20 shadow-[0_0_20px_rgba(251,191,36,0.3)]' 
                                    : 'bg-slate-800 border-slate-600 text-slate-400 hover:border-slate-500 hover:bg-slate-700'
                                }`}
                            >
                                <span className="text-2xl">{stage.icon}</span>
                                <span className="font-bold">Stage {stage.id}</span>
                                <span className={`text-xs ${isSelected ? 'opacity-100' : 'opacity-60'}`}>{stage.label}</span>
                            </button>
                        );
                    })}
                </div>

                {finalStageIndex === 6 && (
                    <div className="mt-4 flex justify-center">
                        <button
                            onClick={() => updateState({ ...gameState, confettiTrigger: Date.now() })}
                            className="px-8 py-3 rounded-xl font-bold text-lg transition-all bg-gradient-to-r from-amber-500 to-pink-500 hover:from-amber-400 hover:to-pink-400 text-white border border-amber-300/50 shadow-[0_0_20px_rgba(251,191,36,0.3)] active:scale-95"
                        >
                            🎆 播放礼花特效
                        </button>
                    </div>
                )}
            </div>

            {/* 完整分数展示大盘 */}
            <div className="mt-8 flex flex-col gap-4">
                {/* 模块 1：第一轮 30人 */}
                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                    <h3 className="text-teal-400 font-bold mb-4 flex items-center gap-2 text-sm">
                        <span className="opacity-80">第一轮：30人总成绩排名</span>
                    </h3>
                    <div className="grid grid-rows-5 grid-flow-col gap-x-3 gap-y-1.5">
                        {round1Sorted.map((p, index) => (
                            <div key={p.id} className={`text-xs p-1.5 rounded flex justify-between items-center gap-2 border transition-colors ${
                                index < 2 ? 'bg-amber-900/20 border-amber-500/30' : 
                                index < 10 ? 'bg-teal-900/20 border-teal-500/30' : 
                                index < 18 ? 'bg-blue-900/20 border-blue-500/30' : 'bg-slate-800/80 border-slate-700/50 opacity-60'
                            }`}>
                                <span className="text-slate-500 font-mono w-4 shrink-0 px-0.5">{(index+1)}</span>
                                <span className="text-slate-400 font-mono shrink-0">{formatPlayerNumber(p)}</span>
                                <span className="text-white font-bold truncate flex-1">{p.name}</span>
                                <span className="text-slate-300 font-mono">{(p.score ?? 0).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                </div>
                
                {/* 模块 2：第二轮 18人成绩明细 */}
                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                    <h3 className="text-amber-400 font-bold mb-4 flex items-center gap-2 text-sm">
                        <span className="opacity-80">第二轮：18人成绩与状态明细</span>
                    </h3>
                    <div className="grid grid-rows-6 grid-flow-col gap-x-4 gap-y-2">
                        {round2Players.map((p, index) => (
                            <div key={p.id} className={`text-xs p-2 rounded flex flex-col gap-1.5 transition-all ${
                                p.isTop10 
                                ? 'bg-gradient-to-r from-amber-900/60 to-orange-950/40 border border-amber-500/50 shadow-[0_0_12px_rgba(251,191,36,0.15)] hover:border-amber-400' 
                                : 'bg-slate-800 border border-slate-700 hover:bg-slate-750'
                            }`}>
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <span className={`font-mono w-4 shrink-0 ${p.isTop10 ? 'text-amber-500' : 'text-slate-500'}`}>{(index+1)}</span>
                                        <span className="text-slate-400 font-mono shrink-0">{formatPlayerNumber(p)}</span>
                                        <span className={`font-bold text-[13px] truncate ${p.isTop10 ? 'text-amber-200' : 'text-white'}`}>
                                            {p.isTop10 && <span className="mr-1">🏆</span>}
                                            {p.name}
                                        </span>
                                        <span className={`px-1.5 py-0.5 rounded text-[10px] shrink-0 ${
                                            p.roleName === '大魔王' ? 'bg-amber-900/40 text-amber-300' :
                                            p.roleName === '擂主' ? 'bg-teal-900/40 text-teal-300' : 'bg-blue-900/40 text-blue-300'
                                        }`}>
                                            {p.roleName} (R1第{p.r1Rank})
                                        </span>
                                    </div>
                                    <span className="text-amber-300 font-mono font-bold text-sm tracking-wider shrink-0 ml-2">
                                        {p.r2Score > 0 ? p.r2Score.toFixed(2) : '-'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-400 truncate flex-1">{p.opponentName}</span>
                                    <span className={`font-bold tracking-widest shrink-0 ml-2 ${
                                        p.roleName === '大魔王' && p.outcomeLabel.includes('晋级') ? 'text-purple-400' :
                                        p.roleName === '大魔王' ? 'text-blue-400' :
                                        p.outcomeLabel.includes('晋级') ? 'text-emerald-400' :
                                        p.outcomeLabel.includes('淘汰') ? 'text-red-400' : 'text-amber-400'
                                    }`}>{p.outcomeLabel}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 模块 3：分类名单速览 */}
                <StatusOverviewBlock
                    players={players}
                    round1Sorted={round1Sorted}
                    pkMatches={gameState.pkMatches || []}
                    top10Ids={top10Ids}
                />
            </div>
        </div>
    );
}

AdminRound4.propTypes = {
    gameState: PropTypes.object.isRequired,
    updateState: PropTypes.func.isRequired
};
