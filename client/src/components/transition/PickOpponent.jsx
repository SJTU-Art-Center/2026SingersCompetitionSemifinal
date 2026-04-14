import PropTypes from 'prop-types';
import { useMemo } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { getFullAvatarUrl } from '../../utils/avatar';
import { formatPlayerNumber } from '../../utils/playerIdentity';
import { parseDisplayName, getNameScale } from '../../utils/playerName';
import PlayerIdentity from '../common/PlayerIdentity';

const STAGE_TOP_ROW = '0%';
const SLOT_ROW_TOP = '33%';
const STAGE_BOTTOM_ROW = '67%';
const STAGE5_MASTER_TITLE_TOP = '7%';
const STAGE5_ATTACKER_TITLE_TOP = '72%';

export default function PickOpponent({ gameState }) {
    const { players, pkMatches = [] } = gameState;
    const stage = Number(gameState.screenTransitionStage ?? gameState.transitionStage ?? 1);

    // score = 第一轮总分，永不修改，直接用于排序
    const sortedPlayers = [...players].sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        if ((b.judgeScore ?? 0) !== (a.judgeScore ?? 0)) return (b.judgeScore ?? 0) - (a.judgeScore ?? 0);
        return a.id - b.id;
    });
    const top18 = sortedPlayers.slice(0, 18);
    const top2 = top18.slice(0, 2);
    const bottom12 = sortedPlayers.slice(18, 30);

    const stageRows = useMemo(() => {
        const masters = top18.slice(2, 10).sort((a, b) => a.score - b.score);
        const attackers = top18.slice(10, 18).sort((a, b) => a.score - b.score);
        return { masters, attackers };
    }, [top18]);

    const renderFace = (player, compact = true, compactScale = 'normal', showScore = true, stageVariant = null) => (
        <div className={`h-full ${compact ? `flex flex-col items-center justify-center text-center ${compactScale === 'hero' ? 'px-5 py-5 gap-5' : compactScale === 'pk' ? 'px-2.5 py-3 gap-3' : compactScale === 'large' ? 'px-2.5 py-3 gap-3' : 'px-2 py-2.5 gap-2.5'}` : 'flex flex-col items-center justify-between text-center py-1.5 gap-1.5'}`}>
            <img
                src={getFullAvatarUrl(player.avatar)}
                alt=""
                className={`${compact ? (compactScale === 'hero' ? 'w-[184px] h-[184px] rounded-[28px]' : (compactScale === 'pk' || compactScale === 'large') ? 'w-[70px] h-[70px] rounded-[12px]' : 'w-[60px] h-[60px] rounded-[12px]') : 'w-24 h-24 rounded-2xl'} border border-white/20 object-cover block shadow-[0_8px_18px_rgba(2,6,23,0.18)]`}
            />
            {compact ? (
                <div className={`w-full min-h-0 flex flex-col items-center justify-center ${compactScale === 'hero' ? 'gap-4' : (compactScale === 'pk' || compactScale === 'large') ? 'gap-2' : 'gap-1.5'}`}>
                    <div className={`${compactScale === 'hero' ? 'text-[22px]' : compactScale === 'pk' ? 'text-[11px]' : compactScale === 'large' ? 'text-[9px]' : 'text-[10px]'} text-white/58 tracking-[0.2em] font-black leading-none whitespace-nowrap uppercase`}>No.{formatPlayerNumber(player)}</div>
                    <div className="font-black text-white leading-tight max-w-full text-center">
                        {(() => {
                            const baseFontSize = compactScale === 'hero' ? 32 : compactScale === 'pk' ? 14 : compactScale === 'large' ? 12 : 13;
                            const lines = parseDisplayName(player.name);
                            const maxW = compactScale === 'hero' ? 6 : compactScale === 'pk' ? 5 : compactScale === 'large' ? 5 : 5;
                            return lines.map((line, i) => {
                                const scale = getNameScale(line, maxW);
                                const fontSize = scale < 1 ? Math.round(baseFontSize * scale) : baseFontSize;
                                const shouldAdjustTransitionName = ['stage1', 'stage2', 'stage3', 'stage5'].includes(stageVariant);
                                const adjustedFontSize = !shouldAdjustTransitionName
                                    ? fontSize
                                    : player.name === '阿合玛尔阿丽·阿达里'
                                        ? Math.round(fontSize * 1.2)
                                        : Math.round(fontSize * 1.2);
                                return <div key={i} style={{ fontSize: `${adjustedFontSize}px` }} className="text-center">{line}</div>;
                            });
                        })()}
                    </div>
                </div>
            ) : (
                <PlayerIdentity
                    player={player}
                    compact={compact}
                    className="w-full"
                    numberClassName="text-xs text-teal-200 tracking-[0.18em]"
                    nameClassName="text-[30px] font-black text-white"
                />
            )}
            {showScore && (compact
                ? <div className={`${compactScale === 'hero' ? 'text-[52px]' : compactScale === 'large' ? 'text-[18px]' : 'text-[16px]'} font-black text-white/90 leading-none text-center`}>{Number(player.score || 0).toFixed(2)}</div>
                : <div className="text-[34px] font-black text-teal-100 leading-none">{Number(player.score || 0).toFixed(2)}</div>
            )}
        </div>
    );

    const getCardShell = (variant) => variant === 'demon'
        ? 'w-full mx-auto aspect-[3/4] rounded-[24px] border border-white/20 p-6 bg-white/10 backdrop-blur-[20px] shadow-[0_8px_32px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.1)] transition-all duration-300 hover:translate-y-[-4px] hover:shadow-[0_12px_40px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.15)]'
        : 'w-full mx-auto aspect-[3/4] rounded-[24px] border border-white/20 p-2.5 bg-white/10 backdrop-blur-[20px] shadow-[0_8px_32px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.1)] transition-all duration-300 hover:translate-y-[-4px] hover:shadow-[0_12px_40px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.15)]';

    const renderStaticCard = (player, compactScale = 'normal', variant = 'default', stageVariant = null) => (
        <div className={getCardShell(variant)}>
            {renderFace(player, true, compactScale, true, stageVariant)}
        </div>
    );

    const renderPkCard = (player, stageVariant = null) => (
        <div className="aspect-[5/6] rounded-[24px] border border-white/20 p-2.5 bg-white/10 backdrop-blur-[20px] shadow-[0_8px_32px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.1)] transition-all duration-300 hover:translate-y-[-4px] hover:shadow-[0_12px_40px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.15)]">
            {renderFace(player, true, 'pk', false, stageVariant)}
        </div>
    );

    // ── Stage 1 内容 ──
    const renderStage1 = () => {
        const rowCounts = [10, 10, 10];
        let cursor = 0;
        return (
            <div
                className="w-full h-full flex items-center justify-center"
            >
                <LayoutGroup id="transition-stage-flow">
                    <div className="w-full max-w-[98%] mx-auto flex flex-col items-center justify-center -translate-y-8">
                        <div className="w-full max-w-[1500px] grid grid-rows-3 gap-4">
                            {rowCounts.map((count) => {
                                const rowStart = cursor;
                                const rowPlayers = sortedPlayers.slice(rowStart, rowStart + count);
                                cursor += count;
                                return (
                                    <div key={`row-${rowStart}`} className="grid grid-cols-10 gap-4">
                                        {rowPlayers.map((player, colIndex) => {
                                            const rowIndex = Math.floor(rowStart / 10);
                                            const rowBaseDelay = rowIndex * 0.1;
                                            const rowSpanDelay = (colIndex / 9) * 0.8;
                                            const flipDelay = rowBaseDelay + rowSpanDelay;
                                            return (
                                                <motion.div
                                                    key={player.id}
                                                    layoutId={`s1-card-${player.id}`}
                                                    layout
                                                    style={{ perspective: 1000 }}
                                                    className="w-full"
                                                >
                                                    <motion.div
                                                        initial={{ rotateY: 180, y: 8, scale: 0.97 }}
                                                        animate={{ rotateY: 0, y: 0, scale: 1 }}
                                                        transition={{
                                                            rotateY: { duration: 0.76, ease: [0.22, 0.82, 0.28, 1], delay: flipDelay },
                                                            y: { duration: 0.5, ease: [0.16, 0.84, 0.44, 1], delay: flipDelay },
                                                            scale: { duration: 0.5, ease: [0.16, 0.84, 0.44, 1], delay: flipDelay }
                                                        }}
                                                        style={{ transformStyle: 'preserve-3d' }}
                                                        className="relative"
                                                    >
                                                        <div style={{ backfaceVisibility: 'hidden' }} className={getCardShell('default')}>
                                                            {renderFace(player, true, 'normal', true, 'stage1')}
                                                        </div>
                                                        <div style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }} className={`absolute inset-0 ${getCardShell('default')} bg-[linear-gradient(180deg,rgba(255,255,255,0.028),rgba(255,255,255,0.012))] border-white/10`}>
                                                            <div className="h-full" />
                                                        </div>
                                                    </motion.div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </LayoutGroup>
            </div>
        );
    };

    // ── Stage 2 内容 ──
    // 12名淘汰选手2×6，尺寸同stage1，通过layoutId平滑移位进入
    // exit: 整组卡片向下浮出（stage2→3过渡）
    const renderStage2 = () => (
        <motion.div
            key="stage2"
            className="absolute inset-0 flex items-center justify-center"
            exit={{ opacity: 0, y: 110, scale: 0.88, transition: { duration: 0.58, ease: [0.4, 0, 0.8, 1] } }}
        >
            <LayoutGroup id="transition-stage-flow">
                <div className="w-full max-w-[98%] mx-auto flex flex-col items-center justify-center -translate-y-8">
                    <div className="w-full max-w-[994px] grid grid-cols-6 grid-rows-2 gap-9">
                        {bottom12.map((player) => (
                            <motion.div
                                key={player.id}
                                layoutId={`s1-card-${player.id}`}
                                layout
                                transition={{ layout: { duration: 0.88, ease: [0.22, 1, 0.36, 1] } }}
                            >
                                {renderStaticCard(player, 'normal', 'default', 'stage2')}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </LayoutGroup>
        </motion.div>
    );

    // ── Stage 3 & 4 合并渲染 ──
    // Stage 3: 18名晋级选手 2×9 翻牌入场
    // Stage 4: 非top2卡片向下沉出，top2大魔王平滑移动到英雄位置
    // 合并为同一组件避免重影，用 layoutId 实现大魔王平滑过渡
    const renderStage3or4 = () => {
        const isStage4 = stage === 4;
        const top18Players = sortedPlayers.slice(0, 18);
        const getFlipDelay = (idx) => {
            const col = idx % 9;
            return 0.04 + col * 0.07;
        };
        return (
            <motion.div
                key="stage3-4"
                className="absolute inset-0 flex items-center justify-center"
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
            >
                <LayoutGroup id="stage3-4-flow">
                    <div className="w-full max-w-[98%] mx-auto flex flex-col items-center justify-center -translate-y-8 relative">
                        {/* Stage 4 标题 */}
                        {isStage4 && (
                            <motion.div
                                initial={{ opacity: 0, y: -24 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.58, ease: [0.22, 1, 0.36, 1], delay: 0.55 }}
                                className="absolute left-1/2 -translate-x-1/2 z-40 text-[42px] font-black tracking-[0.14em] text-white/92 whitespace-nowrap"
                                style={{ top: '-60px', fontFamily: "'FZHENGFSJW', sans-serif", fontWeight: 900 }}
                            >
                                大魔王登场
                            </motion.div>
                        )}

                        {/* 2×9 网格 */}
                        <div className="w-full max-w-[1500px] grid grid-cols-9 grid-rows-2 gap-4">
                            {top18Players.map((player, idx) => {
                                const isTop2 = idx < 2;
                                const flipDelay = getFlipDelay(idx);

                                // Stage 4: top2 离开网格，由英雄卡接管
                                if (isStage4 && isTop2) {
                                    return <div key={`ph-${player.id}`} className="aspect-[3/4] opacity-0 pointer-events-none" />;
                                }

                                return (
                                    <motion.div
                                        key={player.id}
                                        layoutId={isTop2 ? `s34-demon-${player.id}` : undefined}
                                        layout={isTop2}
                                        initial={{ opacity: 0 }}
                                        animate={isStage4
                                            ? { opacity: 0, y: 90, scale: 0.86 }
                                            : { opacity: 1, y: 0, scale: 1 }
                                        }
                                        transition={isStage4
                                            ? {
                                                opacity: { duration: 0.62, ease: [0.25, 0.1, 0.25, 1], delay: 0.06 },
                                                y: { duration: 0.78, ease: [0.4, 0, 0.6, 1], delay: 0.06 },
                                                scale: { duration: 0.78, ease: [0.4, 0, 0.6, 1], delay: 0.06 },
                                            }
                                            : { opacity: { duration: 0.32, ease: 'easeOut', delay: flipDelay * 0.6 } }
                                        }
                                        style={{ perspective: 1000 }}
                                        className="w-full"
                                    >
                                        <motion.div
                                            initial={{ rotateY: 180, y: 8, scale: 0.97 }}
                                            animate={{ rotateY: 0, y: 0, scale: 1 }}
                                            transition={{
                                                rotateY: { duration: 0.76, ease: [0.22, 0.82, 0.28, 1], delay: flipDelay },
                                                y: { duration: 0.5, ease: [0.16, 0.84, 0.44, 1], delay: flipDelay },
                                                scale: { duration: 0.5, ease: [0.16, 0.84, 0.44, 1], delay: flipDelay }
                                            }}
                                            style={{ transformStyle: 'preserve-3d' }}
                                            className="relative"
                                        >
                                            <div style={{ backfaceVisibility: 'hidden' }} className={getCardShell('default')}>
                                                {renderFace(player, true, 'large', true, 'stage3')}
                                            </div>
                                            <div style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }} className={`absolute inset-0 ${getCardShell('default')} bg-[linear-gradient(180deg,rgba(255,255,255,0.028),rgba(255,255,255,0.012))] border-white/10`}>
                                                <div className="h-full" />
                                            </div>
                                        </motion.div>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* 大魔王1号：从网格平滑移至英雄位置 */}
                        {isStage4 && top2[0] && (
                            <motion.div
                                layoutId={`s34-demon-${top2[0].id}`}
                                layout
                                transition={{ layout: { duration: 0.85, ease: [0.16, 1, 0.3, 1] } }}
                                className="absolute top-[5%] left-1/2 w-[340px] -translate-x-[132%] z-20"
                            >
                                {renderStaticCard(top2[0], 'hero', 'demon')}
                            </motion.div>
                        )}

                        {/* 大魔王2号：略滞后移至英雄位置 */}
                        {isStage4 && top2[1] && (
                            <motion.div
                                layoutId={`s34-demon-${top2[1].id}`}
                                layout
                                transition={{ layout: { duration: 0.85, ease: [0.16, 1, 0.3, 1] } }}
                                className="absolute top-[5%] left-1/2 w-[340px] translate-x-[32%] z-20"
                            >
                                {renderStaticCard(top2[1], 'hero', 'demon')}
                            </motion.div>
                        )}
                    </div>
                </LayoutGroup>
            </motion.div>
        );
    };

    // ── Stage 5 & 6 内容：擂主固定 + 攻擂入槽 ──
    const renderStage5 = () => {
        const isStage5 = stage === 5;
        const matchByChallengerId = new Map(pkMatches.map((match, index) => [match.challengerId, { match, index }]));
        const slotMatchByMasterIndex = new Map(
            stageRows.masters.map((master, idx) => {
                const match = pkMatches.find((m) => m.masterId === master.id);
                return [idx, match || null];
            })
        );

        const slotTransition = {
            layout: { duration: 0.68, ease: [0.22, 1, 0.36, 1] },
            opacity: { duration: 0.18 },
            scale: { duration: 0.68, ease: [0.22, 1, 0.36, 1] },
            y: { duration: 0.68, ease: [0.22, 1, 0.36, 1] }
        };

        return (
            <motion.div
                key="stage5"
                className="w-full h-full"
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
            >
                <LayoutGroup id="transition-stage-flow">
                    <div className="w-full h-full max-w-[98%] mx-auto py-1 relative">
                        <motion.div
                            initial={isStage5 ? { scale: 0.9, opacity: 0.98 } : false}
                            animate={{ scale: 0.9, opacity: 1 }}
                            transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
                            className="absolute inset-0 origin-center"
                        >
                            {isStage5 && top2[0] && (
                                <motion.div
                                    layout
                                    layoutId={`stage3-adv-${top2[0].id}`}
                                    className="absolute top-1/2 left-1/2 w-[340px] -translate-x-[132%] -translate-y-1/2 z-20"
                                    initial={false}
                                    animate={{ opacity: 0, y: -18, scale: 0.92 }}
                                    transition={{ duration: 0.62, ease: [0.25, 0.1, 0.25, 1] }}
                                >
                                    {renderStaticCard(top2[0], 'hero', 'demon')}
                                </motion.div>
                            )}

                            {isStage5 && top2[1] && (
                                <motion.div
                                    layout
                                    layoutId={`stage3-adv-${top2[1].id}`}
                                    className="absolute top-1/2 left-1/2 w-[340px] translate-x-[32%] -translate-y-1/2 z-20"
                                    initial={false}
                                    animate={{ opacity: 0, y: -18, scale: 0.92 }}
                                    transition={{ duration: 0.62, ease: [0.25, 0.1, 0.25, 1] }}
                                >
                                    {renderStaticCard(top2[1], 'hero', 'demon')}
                                </motion.div>
                            )}

                            <motion.div
                                initial={isStage5 ? { opacity: 0, y: 16 } : false}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1], delay: isStage5 ? 0.18 : 0 }}
                                className="absolute left-[4%] right-[4%] grid grid-cols-8 gap-4 opacity-100 z-10"
                                style={{ top: SLOT_ROW_TOP }}
                            >
                                {Array.from({ length: 8 }).map((_, idx) => {
                                    const match = slotMatchByMasterIndex.get(idx);
                                    const challenger = match ? players.find((p) => p.id === match.challengerId) : null;
                                    return (
                                        <div key={`slot-master-${idx}`} className="relative">
                                            <div className="aspect-[5/6] rounded-[20px] border border-white/12 shadow-[0_0_5px_rgba(255,255,255,0.22)] opacity-100" />
                                            {match && challenger && (
                                                <motion.div
                                                    layout
                                                    layoutId={`pk-challenger-${challenger.id}`}
                                                    transition={slotTransition}
                                                    className="absolute inset-0 z-[120]"
                                                    style={{ position: 'absolute' }}
                                                >
                                                    {renderPkCard(challenger, 'stage5')}
                                                </motion.div>
                                            )}
                                        </div>
                                    );
                                })}
                            </motion.div>

                            <div className="absolute left-[4%] right-[4%] grid grid-cols-8 gap-4" style={{ top: STAGE_TOP_ROW }}>
                                {stageRows.masters.map((master, idx) => (
                                    <motion.div
                                        key={`master-${master.id}`}
                                        layout
                                        layoutId={isStage5 ? `stage3-adv-${master.id}` : undefined}
                                        initial={isStage5 ? { opacity: 0, y: -28, scale: 0.95 } : { opacity: 0, y: -24, scale: 0.97 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1], delay: isStage5 ? 0.16 + idx * 0.03 : idx * 0.02 }}
                                        className="z-[120]"
                                        style={{ position: 'relative' }}
                                    >
                                        {renderPkCard(master, 'stage5')}
                                    </motion.div>
                                ))}
                            </div>

                            {isStage5 && (
                                <div
                                    className="absolute left-[0.9%] z-[200] text-[34px] font-black text-white/90 leading-tight"
                                    style={{ top: STAGE5_MASTER_TITLE_TOP, fontFamily: "'FZHENGFSJW', sans-serif", fontWeight: 900 }}
                                >
                                    <span className="block">擂</span>
                                    <span className="block">主</span>
                                </div>
                            )}

                            <div className="absolute left-[4%] right-[4%] grid grid-cols-8 gap-4" style={{ top: STAGE_BOTTOM_ROW }}>
                                {stageRows.attackers.map((challenger) => {
                                    const matchInfo = matchByChallengerId.get(challenger.id);
                                    const isMatched = Boolean(matchInfo);
                                    if (isMatched) {
                                        return <div key={`challenger-empty-${challenger.id}`} />;
                                    }
                                    return (
                                        <motion.div
                                            key={challenger.id}
                                            layout
                                            layoutId={`pk-challenger-${challenger.id}`}
                                            initial={isStage5 ? { opacity: 0, y: 28, scale: 0.9 } : false}
                                            animate={{ y: 0, opacity: 1, scale: 1 }}
                                            transition={{
                                                ...slotTransition,
                                                duration: isStage5 ? 0.42 : 0.68,
                                                delay: isStage5 ? 0.2 : 0
                                            }}
                                            className="z-[120]"
                                            style={{ position: 'relative' }}
                                        >
                                            {renderPkCard(challenger, 'stage5')}
                                        </motion.div>
                                    );
                                })}
                            </div>

                            {isStage5 && (
                                <div
                                    className="absolute left-[0.9%] z-[200] text-[32px] font-black text-white/86 leading-tight"
                                    style={{ top: STAGE5_ATTACKER_TITLE_TOP, fontFamily: "'FZHENGFSJW', sans-serif", fontWeight: 900 }}
                                >
                                    <span className="block">挑</span>
                                    <span className="block">战</span>
                                    <span className="block">者</span>
                                </div>
                            )}
                        </motion.div>
                    </div>
                </LayoutGroup>
            </motion.div>
        );
    };

    // Stage 1: 直接渲染（不经过AnimatePresence），确保layoutId与stage2平滑衔接
    if (stage === 1) return renderStage1();

    // Stages 2+: AnimatePresence mode="wait"，退场播完再入场
    return (
        <div className="w-full h-full relative">
            <AnimatePresence mode="wait">
                {stage === 2 && renderStage2()}
                {(stage === 3 || stage === 4) && renderStage3or4()}
                {(stage === 5 || stage === 6) && renderStage5()}
            </AnimatePresence>
        </div>
    );
}

PickOpponent.propTypes = {
    gameState: PropTypes.shape({
        players: PropTypes.arrayOf(PropTypes.shape({
            id: PropTypes.number.isRequired,
            name: PropTypes.string.isRequired,
            avatar: PropTypes.string,
            score: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
        })).isRequired,
        pickingChallengerId: PropTypes.number,
        pkMatches: PropTypes.arrayOf(PropTypes.shape({
            challengerId: PropTypes.number,
            masterId: PropTypes.number
        })),
        screenTransitionStage: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        transitionStage: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
    }).isRequired
};
