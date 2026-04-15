import { useState } from 'react';
import { getFullAvatarUrl } from '../../utils/avatar';
import PlayerIdentity from '../common/PlayerIdentity';
import { getPlayerSingleLine } from '../../utils/playerIdentity';

export default function AdminPickOpponent({ gameState, updateState }) {
    const stageDefs = [
        { value: 1, label: 'Stage 1 · 30人卡牌排名' },
        { value: 2, label: 'Stage 2 · 12名淡汰展示' },
        { value: 3, label: 'Stage 3 · 18名晋级展示' },
        { value: 4, label: 'Stage 4 · 大魔王金色降临' },
        { value: 5, label: 'Stage 5 · 擂主固定+攻擂入槽' }
    ];

    const pkMatches = gameState.pkMatches || [];

    // score = 第一轮总分，永不修改，直接用于排序
    const sortedPlayers = [...gameState.players].sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        if ((b.judgeScore ?? 0) !== (a.judgeScore ?? 0)) return (b.judgeScore ?? 0) - (a.judgeScore ?? 0);
        return a.id - b.id;
    });

    const masters = sortedPlayers.slice(2, 10).sort((a, b) => a.score - b.score);
    const challengers = sortedPlayers.slice(10, 18).sort((a, b) => a.score - b.score);

    const [selChallenger, setSelChallenger] = useState("");
    const [selMaster, setSelMaster] = useState("");

    const handleConfirmMatch = (challengerId, masterId) => {
        if (!challengerId || !masterId) return;
        const newMatches = [...pkMatches, {
            challengerId, masterId,
            challengerScore: 0,
            masterScore: 0,
            status: 'pending'
        }];
        updateState({
            ...gameState,
            pkMatches: newMatches,
            pickingChallengerId: null,
            screenRound: 1.5,
            screenTransitionStage: 5,
            transitionStage: Math.max(5, Number(gameState.transitionStage ?? 1)),
            screenDisplayMode: 'live'
        });
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

    const handleSeedData = () => {
        if (!window.confirm('⚠️ 一键填入测试配对？\n将自动把挑战者和守播区选手一一配对，覆盖现有配对列表。')) return;
        const newMatches = challeners.map((c, i) => ({
            challengerId: c.id,
            masterId: masters[i].id,
            challengerScore: 0,
            masterScore: 0,
            status: 'pending'
        }));
        updateState({ ...gameState, pkMatches: newMatches, pickingChallengerId: null });
    };

    const editStage = Number(gameState.transitionStage ?? 1);
    const screenStage = Number(gameState.screenTransitionStage ?? editStage);
    const handleProjectStage = (stage) => {
        updateState({ ...gameState, screenRound: 1.5, transitionStage: stage, screenTransitionStage: stage, screenDisplayMode: 'live' });
    };

    // score = 第一轮总分，永不修改，直接用于排序
    const sortedForRank = [...gameState.players].sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        if ((b.judgeScore ?? 0) !== (a.judgeScore ?? 0)) return (b.judgeScore ?? 0) - (a.judgeScore ?? 0);
        return a.id - b.id;
    });
    // Stage 1 展示用：晋级18人按分数排序，淘汰12人按序号排序
    const displayForRank = [
        ...sortedForRank.slice(0, 18),
        ...sortedForRank.slice(18).sort((a, b) => (a.number ?? a.id) - (b.number ?? b.id))
    ];
    const getRank1Score = (p) => p.score;

    // 判断每个选手的同分类型：'scoreAndJudge' | 'scoreOnly' | null
    const getTieType = (player, index) => {
        const prev = sortedForRank[index - 1];
        const next = sortedForRank[index + 1];
        const ps = getRank1Score(player);
        const scoreTiedWithPrev = prev && getRank1Score(prev) === ps;
        const scoreTiedWithNext = next && getRank1Score(next) === ps;
        if (!scoreTiedWithPrev && !scoreTiedWithNext) return null;
        const judgeTied = (
            (scoreTiedWithPrev && (prev.judgeScore ?? 0) === (player.judgeScore ?? 0)) ||
            (scoreTiedWithNext && (next.judgeScore ?? 0) === (player.judgeScore ?? 0))
        );
        return judgeTied ? 'scoreAndJudge' : 'scoreOnly';
    };

    const zoneLabel = (index) => {
        if (index < 2) return { label: '大魔王区', color: 'text-amber-300' };
        if (index < 10) return { label: '擂主区', color: 'text-teal-300' };
        if (index < 18) return { label: '挑战者区', color: 'text-sky-300' };
        return { label: '淘汰区', color: 'text-slate-500' };
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
                </div>
            </div>

            <div className="mb-6 bg-slate-900 border border-slate-700 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                    <div className="text-sm font-bold text-slate-300">过渡动画阶段控制</div>
                    <div className="text-xs font-bold text-slate-400">✏️ 编辑 Stage {editStage} / 📺 播放 Stage {screenStage}</div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-2">
                    {stageDefs.map((stage) => (
                        <button
                            key={stage.value}
                            onClick={() => updateState({ ...gameState, transitionStage: stage.value })}
                            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all border ${editStage === stage.value ? 'bg-teal-600 text-white border-teal-400 shadow-[0_0_10px_rgba(20,184,166,0.5)]' : 'bg-slate-800 text-slate-300 border-slate-600 hover:bg-slate-700'}`}
                        >
                            {stage.label}
                        </button>
                    ))}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                    <button
                        onClick={() => handleProjectStage(Math.max(1, editStage - 1))}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-700 hover:bg-slate-600 text-slate-200"
                    >
                        ◀ 投屏上一步
                    </button>
                    <button
                        onClick={() => handleProjectStage(editStage)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white"
                    >
                        📺 投屏当前编辑Stage
                    </button>
                    <button
                        onClick={() => handleProjectStage(Math.min(5, editStage + 1))}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-700 hover:bg-slate-600 text-slate-200"
                    >
                        投屏下一步 ►
                    </button>
                </div>
            </div>

            {/* ── Stage 1：30人成绩排名 + 同分警报 ── */}
            {editStage === 1 && (() => {
                // 按分数值扫描连续同分区间，每个区间生成一个警报组
                const tieGroups = [];
                let gi = 0;
                while (gi < sortedForRank.length) {
                    let gj = gi + 1;
                    while (gj < sortedForRank.length && getRank1Score(sortedForRank[gj]) === getRank1Score(sortedForRank[gi])) gj++;
                    if (gj - gi > 1) {
                        const members = sortedForRank.slice(gi, gj).map((p, k) => ({ player: p, rankIndex: gi + k }));
                        // 判断该组类型：看组内是否存在两个评委分也相同的选手
                        const judgeSet = new Set(members.map(m => m.player.judgeScore ?? 0));
                        const hasJudgeTie = judgeSet.size < members.length; // 有重复评委分 → 完全并列
                        tieGroups.push({
                            members,
                            type: hasJudgeTie ? 'scoreAndJudge' : 'scoreOnly',
                            score: getRank1Score(sortedForRank[gi])
                        });
                    }
                    gi = gj;
                }
                const hasTies = tieGroups.length > 0;

                return (
                    <div className="flex gap-5">
                        {/* ── 左：5行6列卡片网格 ── */}
                        <div className="flex-1 min-w-0 bg-slate-900 p-4 rounded-xl border border-slate-700">
                            <h3 className="text-sm font-bold text-slate-300 border-l-4 border-teal-500 pl-2 mb-3">30人成绩总排名</h3>
                            {/* 以 tieGroups 建立 player.id → tieType 的快查 Map */}
                            {(() => {
                                const playerTieMap = new Map();
                                tieGroups.forEach(group => {
                                    group.members.forEach(({ player }) => playerTieMap.set(player.id, group.type));
                                });
                                return (
                                    <div className="grid grid-cols-6 gap-2">
                                        {displayForRank.map((player) => {
                                            const rankIndex = sortedForRank.findIndex(p => p.id === player.id);
                                            const tieType = playerTieMap.get(player.id) ?? null;
                                            const r1Score = getRank1Score(player);
                                            const hasScore = r1Score > 0;
                                            // 卡片边框色
                                            const cardBorder =
                                                tieType === 'scoreAndJudge' ? 'border-amber-500/60 bg-amber-500/8'
                                                    : tieType === 'scoreOnly' ? 'border-yellow-400/45 bg-yellow-400/6'
                                                        : rankIndex < 2 ? 'border-amber-400/40 bg-amber-400/5'
                                                            : rankIndex < 10 ? 'border-teal-500/30 bg-teal-500/5'
                                                                : rankIndex < 18 ? 'border-sky-500/25 bg-sky-500/4'
                                                                    : 'border-slate-700/50 bg-slate-800/40 opacity-55';
                                            const rankColor = rankIndex < 2 ? 'text-amber-300' : rankIndex < 18 ? 'text-slate-400' : 'text-slate-600';
                                            return (
                                                <div
                                                    key={player.id}
                                                    className={`rounded-lg border p-2 flex flex-col items-center gap-1 text-center transition-colors ${cardBorder}`}
                                                >
                                                    <div className={`text-[10px] font-black tabular-nums ${rankColor}`}>#{rankIndex + 1}</div>
                                                    <img
                                                        src={getFullAvatarUrl(player.avatar)}
                                                        alt=""
                                                        className="w-9 h-9 rounded-full border border-white/15 object-cover"
                                                    />
                                                    <div className="w-full">
                                                        <PlayerIdentity
                                                            player={player}
                                                            compact
                                                            center={true}
                                                            numberClassName="text-[8px] text-slate-500 leading-none"
                                                            nameClassName="text-[11px] font-bold text-slate-200 leading-tight truncate"
                                                        />
                                                    </div>
                                                    <div className="text-[13px] font-black text-white font-mono tabular-nums leading-none">
                                                        {hasScore ? Number(r1Score).toFixed(2) : <span className="text-slate-600 text-[10px]">—</span>}
                                                    </div>
                                                    {hasScore && (
                                                        <div className="text-[9px] text-slate-500 font-mono leading-none">
                                                            专{player.judgeScore?.toFixed(1) ?? '—'} / 大{player.publicScore?.toFixed(1) ?? '—'}
                                                        </div>
                                                    )}
                                                    {tieType === 'scoreAndJudge' && (
                                                        <span className="text-[8px] font-black text-amber-300 bg-amber-500/20 border border-amber-500/40 rounded-full px-1.5 py-0.5 leading-none">⚠️ 完全并列</span>
                                                    )}
                                                    {tieType === 'scoreOnly' && (
                                                        <span className="text-[8px] font-black text-yellow-300 bg-yellow-400/15 border border-yellow-400/35 rounded-full px-1.5 py-0.5 leading-none">△ 总分并列</span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })()}
                        </div>

                        {/* ── 右：同分警报区 ── */}
                        <div className="w-72 flex-shrink-0 bg-slate-900 p-4 rounded-xl border border-slate-700 flex flex-col gap-3 overflow-y-auto max-h-[640px]">
                            <h3 className="text-sm font-bold text-slate-300 border-l-4 border-red-500 pl-2 flex-shrink-0">同分警报</h3>
                            {!hasTies && (
                                <div className="flex-1 flex flex-col items-center justify-center text-center gap-2 py-12">
                                    <div className="text-2xl">✅</div>
                                    <div className="text-xs text-slate-500">无同分情况<br />排名已确定</div>
                                </div>
                            )}

                            {tieGroups.map((group, gi) => {
                                const isJudgeTie = group.type === 'scoreAndJudge';
                                return (
                                    <div
                                        key={`tie-group-${gi}`}
                                        className={`rounded-lg border p-3 flex flex-col gap-2 flex-shrink-0 ${isJudgeTie
                                                ? 'border-amber-500/50 bg-amber-500/8'
                                                : 'border-yellow-400/40 bg-yellow-400/6'
                                            }`}
                                    >
                                        <div className={`text-xs font-black flex items-center gap-1.5 ${isJudgeTie ? 'text-amber-300' : 'text-yellow-300'
                                            }`}>
                                            <span>{isJudgeTie ? '⚠️' : '△'}</span>
                                            <span>
                                                {group.members.length}人并列
                                                {isJudgeTie ? '（需人工裁定）' : '（评委分已拉开）'}
                                            </span>
                                        </div>
                                        <div className={`text-[10px] mb-0.5 ${isJudgeTie ? 'text-amber-200/55' : 'text-yellow-200/50'
                                            }`}>
                                            总分 {Number(group.score).toFixed(2)}
                                            {isJudgeTie ? '，评委分也相同' : '，评委分有差异'}
                                        </div>
                                        {group.members.map(({ player, rankIndex }) => (
                                            <div
                                                key={player.id}
                                                className={`flex items-center gap-2 rounded-lg px-2 py-1.5 ${isJudgeTie ? 'bg-amber-500/10' : 'bg-yellow-400/8'
                                                    }`}
                                            >
                                                <div className={`text-[10px] font-black w-5 text-center ${isJudgeTie ? 'text-amber-400' : 'text-yellow-400'
                                                    }`}>#{rankIndex + 1}</div>
                                                <img
                                                    src={getFullAvatarUrl(player.avatar)}
                                                    alt=""
                                                    className={`w-6 h-6 rounded-full object-cover flex-shrink-0 border ${isJudgeTie ? 'border-amber-400/30' : 'border-yellow-400/30'
                                                        }`}
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <PlayerIdentity
                                                        player={player}
                                                        compact
                                                        center={false}
                                                        numberClassName={`text-[8px] ${isJudgeTie ? 'text-amber-500/70' : 'text-yellow-500/70'}`}
                                                        nameClassName={`text-xs font-bold truncate ${isJudgeTie ? 'text-amber-200' : 'text-yellow-200'}`}
                                                    />
                                                </div>
                                                <div className="text-right flex-shrink-0">
                                                    <div className="text-xs font-black text-white font-mono tabular-nums">
                                                        {Number(getRank1Score(player)).toFixed(2)}
                                                    </div>
                                                    {!isJudgeTie && (
                                                        <div className="text-[9px] text-yellow-400/70 font-mono">
                                                            专{player.judgeScore?.toFixed(1) ?? '—'}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })()}

            {/* ── Stage 2-5：配对控制 ── */}
            {editStage > 1 && (
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
                                    onClick={() => handleConfirmMatch(parseInt(selChallenger), parseInt(selMaster))}
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
            )}
        </div>
    );
}
