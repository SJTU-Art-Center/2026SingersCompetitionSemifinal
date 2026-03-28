import React from 'react';
import { getFullAvatarUrl } from '../../utils/avatar';
import { deriveFinalSettlement } from '../../utils/finalSettlement';
import PlayerIdentity from '../common/PlayerIdentity';

const FINAL_STAGES = [
    { value: 1, label: 'Stage 1 · 大魔王亮相', hint: '仅展示2个大魔王，不显示晋级状态' },
    { value: 2, label: 'Stage 2 · 大魔王分数与晋级', hint: '展示大魔王分数与晋级/待定结果' },
    { value: 3, label: 'Stage 3 · 8擂主 + 8攻擂者', hint: '双排展示，不显示晋级标签' },
    { value: 4, label: 'Stage 4 · 8组晋级重排', hint: '晋级擂主/待定擂主/攻擂者三排重排' },
    { value: 5, label: 'Stage 5 · 待定大魔王聚焦', hint: '隐去晋级擂主，转向待定大魔王与待定擂主' },
    { value: 6, label: 'Stage 6 · 待定区补位展示', hint: '待定区分数 + 晋级与未晋级两行' },
    { value: 7, label: 'Stage 7 · 最终阵容', hint: '第一行晋级（前置大魔王/擂主），第二行未晋级' }
];

export default function AdminRound4({ gameState, updateState }) {
    const finalData = React.useMemo(() => deriveFinalSettlement(gameState), [gameState]);

    const {
        demonKingThreshold,
        directAdvanced,
        pendingDemonKings,
        pendingMasters,
        challengersByPair,
        pendingCandidates,
        remainingSpots,
        promotedPending,
        nonPromotedPending,
        finalTop10,
        allPlayerResults
    } = finalData;

    const finalStageIndex = clampStage(gameState.finalStageIndex ?? 1);
    const screenFinalStageIndex = clampStage(gameState.screenFinalStageIndex ?? finalStageIndex);

    const projectedLabel = FINAL_STAGES.find((item) => item.value === screenFinalStageIndex)?.label || 'Stage 1';

    const stagePendingTotal = React.useMemo(() => {
        const merged = [...pendingDemonKings, ...pendingMasters, ...challengersByPair];
        const seen = new Set();
        merged.forEach((player) => {
            if (!player) return;
            seen.add(player.id);
        });
        return seen.size;
    }, [pendingDemonKings, pendingMasters, challengersByPair]);

    const handleSetEditStage = (stage) => {
        updateState({ ...gameState, finalStageIndex: stage, resurrectionCalculated: true });
    };

    const handleProjectStage = (stage) => {
        updateState({
            ...gameState,
            screenRound: 4,
            screenFinalStageIndex: stage,
            finalStageIndex: stage,
            resurrectionCalculated: true
        });
    };

    const handleProjectCurrentEdit = () => {
        handleProjectStage(finalStageIndex);
    };

    const summaryRows = [
        {
            title: '直接晋级（大魔王/擂主）',
            value: `${directAdvanced.length} 人`,
            tone: 'text-emerald-400'
        },
        {
            title: '待定区总人数',
            value: `${stagePendingTotal} 人`,
            tone: 'text-teal-300'
        },
        {
            title: '待定区补位名额',
            value: `${remainingSpots} 人`,
            tone: 'text-amber-300'
        },
        {
            title: '待定区补位成功',
            value: `${promotedPending.length} 人`,
            tone: 'text-cyan-300'
        },
        {
            title: '最终十强人数',
            value: `${finalTop10.length} 人`,
            tone: 'text-teal-200'
        }
    ];

    return (
        <div className="mt-4 bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-xl">
            <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-3">
                <h2 className="text-xl font-bold text-teal-400 flex items-center">
                    <span className="bg-teal-600 text-white w-7 h-7 rounded justify-center items-center flex mr-2 text-xs">4</span>
                    最终结算控制台：分段投屏 + 晋级原因
                </h2>
                <button
                    onClick={handleProjectCurrentEdit}
                    className="bg-amber-600/80 hover:bg-amber-500 text-white font-bold px-5 py-1.5 rounded-lg shadow-lg text-sm border border-amber-500 transition-colors"
                >
                    📺 投屏当前阶段
                </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1.15fr_1fr] gap-4">
                <div className="bg-slate-900 border border-slate-700 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm text-slate-300 font-bold border-l-4 border-teal-500 pl-2">阶段控制（编辑与投屏）</h3>
                        <div className="text-xs text-amber-300 font-bold">大屏当前：{projectedLabel}</div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {FINAL_STAGES.map((stage) => {
                            const isEditing = finalStageIndex === stage.value;
                            const isProjected = screenFinalStageIndex === stage.value && gameState.screenRound === 4;

                            return (
                                <div key={stage.value} className={`rounded-xl border p-3 ${isEditing ? 'border-teal-400 bg-teal-900/30' : 'border-slate-700 bg-slate-800/70'}`}>
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <div className="text-sm font-black text-slate-100">{stage.label}</div>
                                            <div className="text-xs text-slate-400 mt-1">{stage.hint}</div>
                                        </div>
                                        <div className="flex flex-col gap-1 items-end">
                                            {isEditing && <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500 text-white font-black">编辑中</span>}
                                            {isProjected && <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500 text-white font-black">大屏中</span>}
                                        </div>
                                    </div>

                                    <div className="mt-3 flex gap-2">
                                        <button
                                            onClick={() => handleSetEditStage(stage.value)}
                                            className={`flex-1 text-xs font-bold py-1.5 rounded transition-colors ${isEditing ? 'bg-teal-600 text-white' : 'bg-slate-700 text-slate-200 hover:bg-slate-600'}`}
                                        >
                                            设为编辑
                                        </button>
                                        <button
                                            onClick={() => handleProjectStage(stage.value)}
                                            className={`flex-1 text-xs font-bold py-1.5 rounded transition-colors ${isProjected ? 'bg-amber-600 text-white' : 'bg-amber-700/70 text-amber-100 hover:bg-amber-600'}`}
                                        >
                                            立即投屏
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-2">
                        {summaryRows.map((item) => (
                            <div key={item.title} className="rounded-xl border border-slate-700 bg-slate-800/80 p-2 text-center">
                                <div className="text-[11px] text-slate-400 font-bold">{item.title}</div>
                                <div className={`text-base font-black mt-1 ${item.tone}`}>{item.value}</div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-3 text-[11px] text-slate-400 leading-relaxed border-t border-slate-700 pt-3">
                        <div>大魔王守擂线（16人均分）：<span className="font-mono text-teal-300">{demonKingThreshold.toFixed(3)}</span></div>
                        <div>补位规则：待定区按“最新分数”排序，按名额前 {remainingSpots} 名补位。</div>
                    </div>
                </div>

                <div className="bg-slate-900 border border-slate-700 rounded-xl p-4">
                    <h3 className="text-sm text-slate-300 font-bold border-l-4 border-cyan-500 pl-2 mb-3">待定区补位明细</h3>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-xl border border-teal-700 bg-teal-900/20 p-3">
                            <div className="text-xs font-black text-teal-300 mb-2">补位晋级 ({promotedPending.length})</div>
                            <div className="space-y-2 max-h-[220px] overflow-y-auto custom-scrollbar pr-1">
                                {promotedPending.map((player, idx) => (
                                    <div key={player.id} className="flex items-center justify-between text-xs border border-teal-700/60 bg-teal-950/30 rounded-lg px-2 py-1">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <span className="text-teal-300 font-black w-4 text-center">{idx + 1}</span>
                                            <img src={getFullAvatarUrl(player.avatar)} alt="" className="w-6 h-6 rounded-full border border-white/20 object-cover" />
                                            <PlayerIdentity
                                                player={player}
                                                compact
                                                center={false}
                                                className="min-w-0"
                                                numberClassName="text-[9px] text-teal-500"
                                                nameClassName="text-slate-100"
                                            />
                                        </div>
                                        <span className="font-mono text-teal-200">{player.latestScore.toFixed(2)}</span>
                                    </div>
                                ))}
                                {promotedPending.length === 0 && <div className="text-xs text-slate-500">无待定区补位晋级</div>}
                            </div>
                        </div>

                        <div className="rounded-xl border border-slate-700 bg-slate-800/70 p-3">
                            <div className="text-xs font-black text-slate-300 mb-2">待定未晋级 ({nonPromotedPending.length})</div>
                            <div className="space-y-2 max-h-[220px] overflow-y-auto custom-scrollbar pr-1">
                                {nonPromotedPending.map((player, idx) => (
                                    <div key={player.id} className="flex items-center justify-between text-xs border border-slate-700 bg-slate-900/50 rounded-lg px-2 py-1">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <span className="text-slate-400 font-black w-4 text-center">{idx + 1}</span>
                                            <img src={getFullAvatarUrl(player.avatar)} alt="" className="w-6 h-6 rounded-full border border-white/20 object-cover" />
                                            <PlayerIdentity
                                                player={player}
                                                compact
                                                center={false}
                                                className="min-w-0"
                                                numberClassName="text-[9px] text-slate-500"
                                                nameClassName="text-slate-100"
                                            />
                                        </div>
                                        <span className="font-mono text-slate-300">{player.latestScore.toFixed(2)}</span>
                                    </div>
                                ))}
                                {nonPromotedPending.length === 0 && <div className="text-xs text-slate-500">无未晋级待定选手</div>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-4 bg-slate-900 border border-slate-700 rounded-xl p-4">
                <h3 className="text-sm text-slate-300 font-bold border-l-4 border-emerald-500 pl-2 mb-3">全员晋级结果与原因（按第一轮排名）</h3>

                <div className="max-h-[420px] overflow-y-auto custom-scrollbar">
                    <table className="w-full text-sm">
                        <thead className="sticky top-0 bg-slate-900 z-10">
                            <tr className="text-left border-b border-slate-700">
                                <th className="py-2 px-2 text-slate-400 font-bold">R1排名</th>
                                <th className="py-2 px-2 text-slate-400 font-bold">选手</th>
                                <th className="py-2 px-2 text-slate-400 font-bold">角色</th>
                                <th className="py-2 px-2 text-slate-400 font-bold">最新分</th>
                                <th className="py-2 px-2 text-slate-400 font-bold">结果来源</th>
                                <th className="py-2 px-2 text-slate-400 font-bold">最终状态</th>
                                <th className="py-2 px-2 text-slate-400 font-bold">原因</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allPlayerResults.map((row) => {
                                const isAdvanced = row.finalStatus === '晋级';
                                return (
                                    <tr key={row.id} className="border-b border-slate-800/80 hover:bg-slate-800/40">
                                        <td className="py-2 px-2 font-mono text-slate-400">#{row.round1Rank}</td>
                                        <td className="py-2 px-2">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <img src={getFullAvatarUrl(row.avatar)} alt="" className="w-7 h-7 rounded-full border border-white/20 object-cover" />
                                                <PlayerIdentity
                                                    player={row}
                                                    compact
                                                    center={false}
                                                    className="min-w-0"
                                                    numberClassName="text-[9px] text-slate-500"
                                                    nameClassName="font-bold text-slate-100"
                                                />
                                            </div>
                                        </td>
                                        <td className="py-2 px-2 text-slate-300">{row.role}</td>
                                        <td className="py-2 px-2 font-mono text-slate-200">{row.latestScore.toFixed(2)}</td>
                                        <td className="py-2 px-2">
                                            {row.source ? (
                                                <span className={`text-[11px] font-black px-2 py-1 rounded ${row.source === '大魔王' ? 'bg-emerald-900/40 text-emerald-300' : row.source === '擂主' ? 'bg-teal-900/40 text-teal-300' : 'bg-cyan-900/40 text-cyan-300'}`}>
                                                    {row.source}
                                                </span>
                                            ) : (
                                                <span className="text-[11px] text-slate-500">—</span>
                                            )}
                                        </td>
                                        <td className="py-2 px-2">
                                            <span className={`text-[11px] font-black px-2 py-1 rounded ${isAdvanced ? 'bg-emerald-700/40 text-emerald-200' : 'bg-slate-700/60 text-slate-300'}`}>
                                                {row.finalStatus}
                                            </span>
                                        </td>
                                        <td className="py-2 px-2 text-xs text-slate-300 leading-relaxed">{row.finalReason}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function clampStage(value) {
    const stage = Number(value);
    if (!Number.isFinite(stage)) return 1;
    if (stage < 1) return 1;
    if (stage > 7) return 7;
    return Math.floor(stage);
}
