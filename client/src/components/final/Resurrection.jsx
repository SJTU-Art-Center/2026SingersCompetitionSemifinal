import PropTypes from 'prop-types';
import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getFullAvatarUrl } from '../../utils/avatar';
import { formatPlayerNumber, comparePlayersByContestantNumber } from '../../utils/playerIdentity';
import { parseDisplayName, getNameScale } from '../../utils/playerName';
import confetti from 'canvas-confetti';

function RollingScore({ value, active }) {
    const [displayValue, setDisplayValue] = useState(active ? 0 : Number(value || 0));
    const frameRef = useRef(null);

    useEffect(() => {
        if (frameRef.current) cancelAnimationFrame(frameRef.current);
        if (!active) {
            setDisplayValue(Number(value || 0));
            return;
        }

        const target = Number(value || 0);
        const duration = 1500;
        let startTime = null;

        setDisplayValue(0);

        const tick = (timestamp) => {
            if (startTime === null) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(2, -10 * progress);
            const current = target * eased;

            setDisplayValue(current);

            if (progress < 1) {
                frameRef.current = requestAnimationFrame(tick);
            } else {
                setDisplayValue(target);
            }
        };

        frameRef.current = requestAnimationFrame(tick);

        return () => {
            if (frameRef.current) cancelAnimationFrame(frameRef.current);
        };
    }, [active, value]);

    return <span>{displayValue.toFixed(2)}</span>;
}

RollingScore.propTypes = {
    value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    active: PropTypes.bool.isRequired,
};

const PlayerCard = ({ player, layoutId, showScore, scoreRollActive, scoreValue, isAdvancedNode, isEliminatedNode, xsmall = false, compact = false, small = false, medium = false, large = false, mlarge = false, xlarge = false, extraScale = false, slowTransition = false }) => {
    let targetScale = 1;
    if (isAdvancedNode) targetScale = 1.05;
    else if (isEliminatedNode) targetScale = 0.85;
    else if (extraScale) targetScale = 1.05;

    const displayScore = scoreValue !== undefined ? scoreValue : (player.round2Score ?? player.scoreDK ?? player.score);

    return (
        <motion.div
            layoutId={layoutId}
            animate={{
                scale: targetScale,
                opacity: isEliminatedNode ? 0.6 : 1,
                y: 0,
            }}
            transition={slowTransition
                ? {
                    layout: { type: 'tween', ease: [0.22, 1, 0.36, 1], duration: 0.95 },
                    opacity: { type: 'tween', ease: 'easeOut', duration: 0.7 },
                    scale: { type: 'tween', ease: [0.22, 1, 0.36, 1], duration: 0.95 },
                    y: { type: 'tween', ease: [0.22, 1, 0.36, 1], duration: 0.95 },
                }
                : { type: 'spring', stiffness: 200, damping: 25 }}
            className={`flex flex-col items-center justify-center rounded-[24px] border border-white/20 bg-white/10 backdrop-blur-[20px] shadow-[0_8px_32px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.1)] overflow-hidden shrink-0 transition-all duration-300 hover:translate-y-[-4px] hover:shadow-[0_12px_40px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.15)] ${xsmall ? 'w-[98px] h-[142px] p-2 gap-1'
                : compact ? 'w-[110px] h-[155px] p-2 gap-1'
                    : xlarge ? 'w-[280px] h-[390px] p-6 gap-3'
                        : mlarge ? 'w-[200px] h-[290px] p-4 gap-2'
                            : large ? 'w-[148px] h-[210px] p-3 gap-2'
                                : medium ? 'w-[145px] h-[204px] p-2.5 gap-1.5'
                                    : small ? 'w-[122px] h-[172px] p-2 gap-1.5'
                                        : 'w-[135px] h-[190px] p-3 gap-2'
                }`}
        >
            <img
                src={getFullAvatarUrl(player.avatar)}
                alt={player.name}
                className={`${xsmall ? 'w-[56px] h-[56px]'
                    : compact ? 'w-[64px] h-[64px]'
                        : xlarge ? 'w-[150px] h-[150px]'
                            : mlarge ? 'w-[110px] h-[110px]'
                                : large ? 'w-[88px] h-[88px]'
                                    : medium ? 'w-[75px] h-[75px]'
                                        : small ? 'w-[70px] h-[70px]'
                                            : 'w-[80px] h-[80px]'
                    } rounded-[20px] border border-white/25 object-cover shadow-[0_8px_18px_rgba(2,6,23,0.18)] mb-1 shrink-0`}
            />
            <div className="flex flex-col items-center text-center w-full px-1 min-h-0">
                <div className={`text-white/50 tracking-widest font-black uppercase ${xsmall ? 'text-[8px]' : compact ? 'text-[9px]' : xlarge ? 'text-[16px]' : mlarge ? 'text-[13px]' : large ? 'text-[11px]' : medium ? 'text-[9px]' : small ? 'text-[9px]' : 'text-[10px]'}`}>
                    No.{formatPlayerNumber(player)}
                </div>
                <div className="font-black text-white w-full">
                    {(() => {
                        const baseFontSize = xsmall ? 11 : compact ? 13 : xlarge ? 26 : mlarge ? 20 : large ? 17 : medium ? 14 : small ? 13 : 15;
                        const lines = parseDisplayName(player.name);
                        const maxW = xlarge ? 6 : mlarge ? 6 : large ? 5 : 5;
                        return lines.map((line, i) => {
                            const scale = getNameScale(line, maxW);
                            const fontSize = scale < 1 ? Math.round(baseFontSize * scale) : baseFontSize;
                            return <div key={i} style={{ fontSize: `${fontSize}px` }} className="text-center whitespace-nowrap">{line}</div>;
                        });
                    })()}
                </div>
            </div>
            {showScore && (
                <div className={`font-mono font-black text-teal-100 mt-auto ${xsmall ? 'text-[14px]' : compact ? 'text-[16px]' : xlarge ? 'text-[36px]' : mlarge ? 'text-[26px]' : large ? 'text-[22px]' : medium ? 'text-[18px]' : small ? 'text-[17px]' : 'text-[20px]'}`}>
                    <RollingScore value={displayScore} active={scoreRollActive} />
                </div>
            )}
        </motion.div>
    );
};

PlayerCard.propTypes = {
    player: PropTypes.object.isRequired,
    layoutId: PropTypes.string.isRequired,
    showScore: PropTypes.bool.isRequired,
    scoreRollActive: PropTypes.bool.isRequired,
    scoreValue: PropTypes.number,
    isAdvancedNode: PropTypes.bool,
    isEliminatedNode: PropTypes.bool,
    xsmall: PropTypes.bool,
    compact: PropTypes.bool,
    small: PropTypes.bool,
    medium: PropTypes.bool,
    large: PropTypes.bool,
    mlarge: PropTypes.bool,
    xlarge: PropTypes.bool,
    extraScale: PropTypes.bool,
    slowTransition: PropTypes.bool,
};

export default function Resurrection({ gameState }) {
    const stage = Number(gameState.screenFinalStageIndex ?? 1);
    const players = Array.isArray(gameState.players) ? gameState.players : [];

    // Stage 4 动画相位（原 s2Phase）
    const [s4Phase, setS4Phase] = useState(0);
    // Stage 6 动画相位（十强诞生）
    const [s6Phase, setS6Phase] = useState(0);
    // 礼花特效 — 初始化为当前值，防止页面加载时误触发
    const lastConfettiRef = useRef(gameState.confettiTrigger ?? null);

    const fireConfetti = useCallback(() => {
        const duration = 4000;
        const end = Date.now() + duration;
        const colors = ['#fbbf24', '#f472b6', '#60a5fa', '#34d399', '#a78bfa', '#fb923c'];

        const frame = () => {
            confetti({
                particleCount: 4,
                angle: 60,
                spread: 55,
                origin: { x: 0, y: 0.7 },
                colors,
                zIndex: 9999,
            });
            confetti({
                particleCount: 4,
                angle: 120,
                spread: 55,
                origin: { x: 1, y: 0.7 },
                colors,
                zIndex: 9999,
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        };
        frame();

        // 中间大爆发
        setTimeout(() => {
            confetti({ particleCount: 120, spread: 100, origin: { y: 0.6 }, colors, zIndex: 9999 });
        }, 300);
        setTimeout(() => {
            confetti({ particleCount: 80, spread: 120, origin: { x: 0.3, y: 0.5 }, colors, zIndex: 9999 });
            confetti({ particleCount: 80, spread: 120, origin: { x: 0.7, y: 0.5 }, colors, zIndex: 9999 });
        }, 1200);
        setTimeout(() => {
            confetti({ particleCount: 150, spread: 160, origin: { y: 0.55 }, colors, zIndex: 9999 });
        }, 2400);
    }, []);

    useEffect(() => {
        const trigger = gameState.confettiTrigger;
        if (trigger && trigger !== lastConfettiRef.current && stage === 6) {
            lastConfettiRef.current = trigger;
            fireConfetti();
        }
    }, [gameState.confettiTrigger, stage, fireConfetti]);

    useEffect(() => {
        if (stage === 4) {
            setS4Phase(0);
            const t1 = setTimeout(() => setS4Phase(1), 2500);
            const t2 = setTimeout(() => setS4Phase(2), 4100);
            return () => { clearTimeout(t1); clearTimeout(t2); };
        } else {
            setS4Phase(0);
        }
    }, [stage]);

    useEffect(() => {
        if (stage === 6) {
            setS6Phase(0);
            const t = setTimeout(() => setS6Phase(1), 800);
            return () => clearTimeout(t);
        } else {
            setS6Phase(0);
        }
    }, [stage]);

    // ── 数据派生 ──

    // 大魔王：第一轮总分最高的2人（与 scoreDK 字段无关）
    const demonKings = useMemo(() => {
        return [...players]
            .sort((a, b) => {
                if (b.score !== a.score) return b.score - a.score;
                if ((b.judgeScore ?? 0) !== (a.judgeScore ?? 0)) return (b.judgeScore ?? 0) - (a.judgeScore ?? 0);
                return a.id - b.id;
            })
            .slice(0, 2);
    }, [players]);

    const demonKingIds = useMemo(() => new Set(demonKings.map(p => p.id)), [demonKings]);

    // 晋级擂主：status='advanced' 且不是大魔王（第二轮PK赢了的擂主）
    const advancedMasters = useMemo(() => {
        return players
            .filter(p => p.status === 'advanced' && !demonKingIds.has(p.id))
            .sort(comparePlayersByContestantNumber);
    }, [players, demonKingIds]);

    // 待定区（按编号顺序展示）
    const pendingPlayers = useMemo(() => {
        return players.filter(p => p.status === 'pending').sort(comparePlayersByContestantNumber);
    }, [players]);

    // 十强剩余名额：10 - 晋级大魔王数 - 晋级擂主数
    const demonKingsAdvanced = useMemo(() => demonKings.filter(p => p.status === 'advanced'), [demonKings]);
    const remainingSpots = Math.max(0, 10 - demonKingsAdvanced.length - advancedMasters.length);

    const pendingSorted = useMemo(() => {
        return [...pendingPlayers].sort((a, b) => {
            const aR2 = a.round2Score ?? a.scoreDK ?? 0;
            const bR2 = b.round2Score ?? b.scoreDK ?? 0;
            if (bR2 !== aR2) return bR2 - aR2;
            if ((b.score ?? 0) !== (a.score ?? 0)) return (b.score ?? 0) - (a.score ?? 0);
            return (b.judgeScore ?? 0) - (a.judgeScore ?? 0);
        });
    }, [pendingPlayers]);

    const advancedFromPending = useMemo(() => pendingSorted.slice(0, remainingSpots), [pendingSorted, remainingSpots]);
    const eliminatedFromPending = useMemo(() => pendingSorted.slice(remainingSpots), [pendingSorted, remainingSpots]);

    // Stage 4 展示用：各组按序号升序
    const pendingByNumber = useMemo(() => [...pendingPlayers].sort(comparePlayersByContestantNumber), [pendingPlayers]);
    const advancedFromPendingByNumber = useMemo(() => [...advancedFromPending].sort(comparePlayersByContestantNumber), [advancedFromPending]);
    const eliminatedFromPendingByNumber = useMemo(() => [...eliminatedFromPending].sort(comparePlayersByContestantNumber), [eliminatedFromPending]);

    // 第二轮被淘汰的选手：PK失败的挑战者 + 待定区淘汰
    const round2Eliminated = useMemo(() => {
        const eliminatedChallengers = players
            .filter(p => p.status === 'eliminated' && !demonKingIds.has(p.id));
        return [...eliminatedChallengers, ...eliminatedFromPending].sort(comparePlayersByContestantNumber);
    }, [players, demonKingIds, eliminatedFromPending]);

    // 完整十强：大魔王晋级 + 晋级擂主 + 待定区晋级
    const fullTop10 = useMemo(() => {
        return [...demonKingsAdvanced, ...advancedMasters, ...advancedFromPending].sort(comparePlayersByContestantNumber);
    }, [demonKingsAdvanced, advancedMasters, advancedFromPending]);

    // ── 状态派生 ──
    const isStage1 = stage === 1;
    const isStage2 = stage === 2;
    const isStage3 = stage === 3;
    const isStage4 = stage === 4;
    const isStage5 = stage === 5;
    const isStage6 = stage === 6;

    // 待定区分数：Stage 4 才揭分
    const showPendingScore = stage >= 4;
    const scoreRollActive = stage === 4 && s4Phase === 0;

    // 标题文字
    const titleText = isStage6 ? '十强诞生'
        : isStage5 ? '第二轮淘汰选手'
            : isStage1 ? '晋级大魔王'
                : isStage2 ? '晋级擂主'
                    : '待定区';

    return (
        <div className="w-full h-full flex flex-col items-center justify-start pt-4 pb-6 overflow-hidden">
            {/* 标题 */}
            <motion.h2
                key={titleText}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: (isStage4 && s4Phase > 0) ? 0 : 1, y: 0 }}
                className="text-[clamp(2rem,3.5vw,2.8rem)] font-black mb-8 text-white tracking-[0.24em]"
                style={{ fontFamily: "'FZHENGFSJW', sans-serif", fontWeight: 900 }}
            >
                {titleText}
            </motion.h2>

            <div className="w-full max-w-[1700px] px-6 flex-1 min-h-0 relative flex items-center justify-center -translate-y-8">
                <AnimatePresence mode="popLayout">

                    {/* ── Stage 1：首发晋级大魔王 ── */}
                    {isStage1 && (
                        <motion.div
                            key="grid-stage1-kings"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center justify-center gap-[200px]"
                        >
                            {demonKingsAdvanced.length > 0 ? (
                                [...demonKingsAdvanced].sort(comparePlayersByContestantNumber).map((p) => (
                                    <PlayerCard
                                        key={p.id}
                                        player={p}
                                        layoutId={`player-${p.id}`}
                                        showScore={false}
                                        scoreRollActive={false}
                                        xlarge
                                    />
                                ))
                            ) : (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[48px] tracking-[0.25em] text-teal-200/80 font-bold border-2 border-dashed border-teal-500/40 bg-teal-900/20 rounded-[40px] backdrop-blur-sm shadow-[0_0_40px_rgba(20,184,166,0.1)] w-[800px] h-[300px] flex items-center justify-center">
                                    无直接晋级大魔王
                                </motion.div>
                            )}
                        </motion.div>
                    )}

                    {/* ── Stage 2：晋级擂主 ── */}
                    {isStage2 && (
                        <motion.div
                            key="grid-stage2-masters"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-wrap items-center justify-center gap-8"
                        >
                            {advancedMasters.length > 0 ? (
                                advancedMasters.map((p) => (
                                    <PlayerCard
                                        key={p.id}
                                        player={p}
                                        layoutId={`player-${p.id}`}
                                        showScore={false}
                                        scoreRollActive={false}
                                        mlarge={advancedMasters.length <= 6}
                                        medium={advancedMasters.length >= 7}
                                    />
                                ))
                            ) : (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[48px] tracking-[0.25em] text-teal-200/80 font-bold border-2 border-dashed border-teal-500/40 bg-teal-900/20 rounded-[40px] backdrop-blur-sm shadow-[0_0_40px_rgba(20,184,166,0.1)] w-[800px] h-[300px] flex items-center justify-center">
                                    无直接晋级擂主
                                </motion.div>
                            )}
                        </motion.div>
                    )}

                    {/* ── Stage 3：待定区整体展示 ── */}
                    {isStage3 && (
                        <motion.div
                            key="grid-stage3-pending"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center gap-6"
                        >
                            {pendingPlayers.length === 0 ? (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[48px] tracking-[0.25em] text-teal-200/80 font-bold border-2 border-dashed border-teal-500/40 bg-teal-900/20 rounded-[40px] backdrop-blur-sm shadow-[0_0_40px_rgba(20,184,166,0.1)] w-[800px] h-[300px] flex items-center justify-center mt-4">
                                    {'暂无待定区选手'}
                                </motion.div>
                            ) : pendingPlayers.length <= 8 ? (
                                <div className="flex flex-wrap items-center justify-center gap-8">
                                    {pendingPlayers.map((p) => (
                                        <PlayerCard key={p.id} player={p} showScore={false} scoreRollActive={false} small={pendingPlayers.length > 16} />
                                    ))}
                                </div>
                            ) : (
                                <>
                                    <div className="flex flex-wrap items-center justify-center gap-8">
                                        {pendingPlayers.slice(0, Math.ceil(pendingPlayers.length / 2)).map((p) => (
                                            <PlayerCard key={p.id} player={p} showScore={false} scoreRollActive={false} small={pendingPlayers.length > 16} />
                                        ))}
                                    </div>
                                    <div className="flex flex-wrap items-center justify-center gap-8">
                                        {pendingPlayers.slice(Math.ceil(pendingPlayers.length / 2)).map((p) => (
                                            <PlayerCard key={p.id} player={p} showScore={false} scoreRollActive={false} small={pendingPlayers.length > 16} />
                                        ))}
                                    </div>
                                </>
                            )}
                        </motion.div>
                    )}

                    {/* ── Stage 4：一个持久容器，s4Phase 控制布局 ── */}
                    {isStage4 && (
                        pendingPlayers.length === 0 ? (
                            <motion.div
                                key="grid-stage4-empty"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center justify-center gap-6"
                            >
                                <motion.div className="text-[48px] tracking-[0.25em] text-teal-200/80 font-bold border-2 border-dashed border-teal-500/40 bg-teal-900/20 rounded-[40px] backdrop-blur-sm shadow-[0_0_40px_rgba(20,184,166,0.1)] w-[800px] h-[300px] flex items-center justify-center mt-4">
                                    {remainingSpots === 0 ? '待定区选手全部淘汰' : '暂无待定区选手'}
                                </motion.div>
                            </motion.div>
                        ) : remainingSpots === 0 ? (
                            /* 十强已满全员淘汰 — 单堆，s4Phase控制灰化 */
                            <motion.div
                                key="grid-stage4-allelim"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center justify-center gap-6"
                            >
                                <div className="flex flex-wrap items-center justify-center max-w-[1400px] mx-auto gap-[28px] mt-10">
                                    {pendingSorted.map((p) => (
                                        <PlayerCard key={p.id} player={p} showScore={showPendingScore} scoreRollActive={scoreRollActive} isEliminatedNode={s4Phase >= 2} />
                                    ))}
                                </div>
                                <motion.div animate={{ opacity: s4Phase >= 2 ? 1 : 0 }} transition={{ duration: 0.8 }} className="text-3xl font-bold text-slate-400 tracking-widest mt-12 bg-slate-900/60 px-8 py-3 rounded-full border border-slate-700 shadow-2xl backdrop-blur-sm">
                                    十强已满，待定区全员淘汰
                                </motion.div>
                            </motion.div>
                        ) : (
                            /* 正常分流：持久 key，s4Phase 切换布局触发 FLIP */
                            <motion.div
                                key="grid-stage4-persistent"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="w-full flex flex-col items-center gap-8 -mt-6"
                            >
                                {s4Phase === 0 ? (
                                    /* 揭分阶段：按序号升序展示 */
                                    <div className="flex flex-col items-center gap-6 w-full">
                                        {pendingByNumber.length <= 8 ? (
                                            <div className="flex flex-wrap items-center justify-center gap-8">
                                                {pendingByNumber.map((p) => (
                                                    <motion.div key={p.id} layoutId={`s4c-${p.id}`} layout
                                                        transition={{ type: 'tween', ease: [0.22, 1, 0.36, 1], duration: 0.85 }}>
                                                        <PlayerCard player={p} showScore={showPendingScore} scoreRollActive={scoreRollActive} small={pendingByNumber.length > 16} />
                                                    </motion.div>
                                                ))}
                                            </div>
                                        ) : (
                                            <>
                                                <div className="flex flex-wrap items-center justify-center gap-8">
                                                    {pendingByNumber.slice(0, Math.ceil(pendingByNumber.length / 2)).map((p) => (
                                                        <motion.div key={p.id} layoutId={`s4c-${p.id}`} layout
                                                            transition={{ type: 'tween', ease: [0.22, 1, 0.36, 1], duration: 0.85 }}>
                                                            <PlayerCard player={p} showScore={showPendingScore} scoreRollActive={scoreRollActive} small={pendingByNumber.length > 16} />
                                                        </motion.div>
                                                    ))}
                                                </div>
                                                <div className="flex flex-wrap items-center justify-center gap-8">
                                                    {pendingByNumber.slice(Math.ceil(pendingByNumber.length / 2)).map((p) => (
                                                        <motion.div key={p.id} layoutId={`s4c-${p.id}`} layout
                                                            transition={{ type: 'tween', ease: [0.22, 1, 0.36, 1], duration: 0.85 }}>
                                                            <PlayerCard player={p} showScore={showPendingScore} scoreRollActive={scoreRollActive} small={pendingByNumber.length > 16} />
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ) : (
                                    /* 分流阶段：晋级在上，淘汰在下，共享 layoutId 触发 FLIP 平移 */
                                    <>
                                        <div className="flex flex-col items-center gap-4 w-full">
                                            <motion.div animate={{ opacity: s4Phase >= 2 ? 1 : 0 }} transition={{ duration: 0.8 }} className="text-xl font-bold text-teal-300 tracking-widest bg-teal-900/40 px-6 py-1 rounded-full border border-teal-500/40">待定区晋级选手</motion.div>
                                            <div className="flex flex-wrap items-center justify-center gap-8">
                                                {advancedFromPendingByNumber.map((p) => (
                                                    <motion.div key={p.id} layoutId={`s4c-${p.id}`} layout
                                                        transition={{ type: 'tween', ease: [0.22, 1, 0.36, 1], duration: 0.85 }}>
                                                        <PlayerCard player={p} showScore={true} scoreRollActive={false} isAdvancedNode={s4Phase >= 2} small={advancedFromPending.length === 9} xsmall={advancedFromPending.length > 9} />
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-center gap-4 w-full">
                                            <motion.div animate={{ opacity: s4Phase >= 2 ? 1 : 0 }} transition={{ duration: 0.8 }} className="text-xl font-bold text-slate-400 tracking-widest bg-slate-800/50 px-6 py-1 rounded-full border border-slate-600/50">待定区淘汰选手</motion.div>
                                            <div className="flex flex-wrap items-center justify-center gap-8">
                                                {eliminatedFromPendingByNumber.map((p) => (
                                                    <motion.div key={p.id} layoutId={`s4c-${p.id}`} layout
                                                        transition={{ type: 'tween', ease: [0.22, 1, 0.36, 1], duration: 0.85 }}>
                                                        <PlayerCard player={p} showScore={true} scoreRollActive={false} isEliminatedNode={s4Phase >= 2} small={eliminatedFromPending.length >= 9 || advancedFromPending.length > 9} />
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </motion.div>
                        )
                    )}

                    {/* ── Stage 5：第二轮淘汰选手 ── */}
                    {isStage5 && (
                        <motion.div
                            key="grid-stage5-eliminated"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center gap-6"
                        >
                            {round2Eliminated.length > 0 ? (
                                round2Eliminated.length <= 9 ? (
                                    <div className="flex flex-wrap items-center justify-center gap-8">
                                        {round2Eliminated.map((p) => (
                                            <PlayerCard key={p.id} player={p} layoutId={`elim-${p.id}`} showScore={false} scoreRollActive={false} small={round2Eliminated.length > 16} />
                                        ))}
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex flex-wrap items-center justify-center gap-8">
                                            {round2Eliminated.slice(0, Math.ceil(round2Eliminated.length / 2)).map((p) => (
                                                <PlayerCard key={p.id} player={p} layoutId={`elim-${p.id}`} showScore={false} scoreRollActive={false} small={round2Eliminated.length > 16} />
                                            ))}
                                        </div>
                                        <div className="flex flex-wrap items-center justify-center gap-8">
                                            {round2Eliminated.slice(Math.ceil(round2Eliminated.length / 2)).map((p) => (
                                                <PlayerCard key={p.id} player={p} layoutId={`elim-${p.id}`} showScore={false} scoreRollActive={false} small={round2Eliminated.length > 16} />
                                            ))}
                                        </div>
                                    </>
                                )
                            ) : (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[48px] tracking-[0.25em] text-teal-200/80 font-bold border-2 border-dashed border-teal-500/40 bg-teal-900/20 rounded-[40px] backdrop-blur-sm shadow-[0_0_40px_rgba(20,184,166,0.1)] w-[800px] h-[300px] flex items-center justify-center">
                                    无第二轮淘汰选手
                                </motion.div>
                            )}
                        </motion.div>
                    )}

                    {/* ── Stage 6：十强诞生 ── */}
                    {isStage6 && (
                        <motion.div
                            key="grid-stage6-top10"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center justify-center gap-8 w-full mt-12"
                        >
                            <div className="grid grid-cols-5 gap-8 place-items-center w-fit mx-auto">
                                {fullTop10.map((p) => (
                                    <PlayerCard key={p.id} player={p} layoutId={`player-${p.id}`} showScore={false} scoreRollActive={false} large extraScale={s6Phase > 0} slowTransition={s6Phase > 0} />
                                ))}
                            </div>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </div>
    );
}

Resurrection.propTypes = {
    gameState: PropTypes.object.isRequired,
};
