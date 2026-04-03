import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getFullAvatarUrl } from '../../utils/avatar';
import { formatPlayerNumber, getPlayerName } from '../../utils/playerIdentity';

const SCORE_REVEAL_DURATION = 1200;
const RESULT_REVEAL_DELAY = SCORE_REVEAL_DURATION + 180;

function getCenterOutcomeText({ winner }) {
    if (winner === 'both_pending') {
        return [{ text: '挑战者与擂主均进入待定区', variant: 'primary' }];
    }

    if (winner === 'master') {
        return [
            { text: '挑战者进入待定区', variant: 'secondary' },
            { text: '擂主直接晋级十强', variant: 'primary' }
        ];
    }

    return [];
}

function getCardVariant({ showOutcome, winner, role }) {
    if (!showOutcome) {
        return {
            scale: 1,
            opacity: 1,
            y: 0,
            boxShadow: '0 24px 48px rgba(2,6,23,0.26)',
            borderColor: 'rgba(255,255,255,0.1)',
            transition: { duration: 0.2 }
        };
    }

    if (winner === 'both_pending') {
        return {
            scale: 0.9,
            y: 10,
            opacity: 1,
            boxShadow: '0 16px 34px rgba(2,6,23,0.16)',
            borderColor: 'rgba(255,255,255,0.16)',
            transition: { duration: 0.72, ease: [0.22, 1, 0.36, 1] }
        };
    }

    if (winner === 'master') {
        if (role === 'master') {
            return {
                scale: 1.1,
                y: 0,
                opacity: 1,
                boxShadow: '0 0 56px rgba(255,255,255,0.32)',
                borderColor: 'rgba(255,255,255,0.24)',
                transition: { duration: 0.76, ease: [0.22, 1, 0.36, 1] }
            };
        }

        return {
            scale: 0.9,
            opacity: 0.9,
            y: 0,
            boxShadow: '0 16px 30px rgba(2,6,23,0.18)',
            borderColor: 'rgba(255,255,255,0.06)',
            transition: { duration: 0.72, ease: [0.22, 1, 0.36, 1] }
        };
    }

    return {
        scale: 1,
        opacity: 1,
        y: 0,
        boxShadow: '0 24px 48px rgba(2,6,23,0.26)',
        borderColor: 'rgba(255,255,255,0.1)',
        transition: { duration: 0.2 }
    };
}

function RollingScore({ value, active, runKey }) {
    const [displayValue, setDisplayValue] = useState(active ? 0 : Number(value || 0));
    const frameRef = useRef(null);

    useEffect(() => {
        if (frameRef.current) {
            cancelAnimationFrame(frameRef.current);
        }

        if (!active) {
            setDisplayValue(Number(value || 0));
            return undefined;
        }

        const target = Number(value || 0);
        const duration = SCORE_REVEAL_DURATION;
        let startTime = null;

        setDisplayValue(0);

        const tick = (timestamp) => {
            if (startTime === null) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - ((1 - progress) * (1 - progress) * (1 - progress));
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
            if (frameRef.current) {
                cancelAnimationFrame(frameRef.current);
            }
        };
    }, [active, runKey, value]);

    return <span>{displayValue.toFixed(2)}</span>;
}

function BattleCard({ player, roleLabel, role, scoreValue, showScoreRoll, showOutcome, winner }) {

    return (
        <motion.div
            animate={getCardVariant({ showOutcome, winner, role })}
            className="w-[clamp(273px,26.4vw,370px)] min-h-[clamp(324px,41.4vh,414px)] rounded-[42px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.014))] backdrop-blur-[8px] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_24px_48px_rgba(2,6,23,0.26)] px-[clamp(18px,1.8vw,28px)] py-[clamp(18px,2vh,28px)] flex flex-col items-center overflow-hidden text-[var(--color-text-main)]"
        >
            <div className="text-[clamp(0.95rem,1.25vw,1.15rem)] font-black tracking-[0.28em] uppercase text-white/68 text-center">
                {roleLabel}
            </div>

            <div className="mt-[clamp(14px,1.8vh,22px)] rounded-[32px] p-[4px] bg-[linear-gradient(180deg,rgba(255,255,255,0.3),rgba(255,255,255,0.06))] shadow-[0_14px_28px_rgba(2,6,23,0.2)]">
                <img
                    src={getFullAvatarUrl(player?.avatar)}
                    alt={getPlayerName(player, role === 'master' ? '未知擂主' : '未知选手')}
                    className="w-[clamp(132px,12vw,172px)] h-[clamp(132px,12vw,172px)] rounded-[28px] border border-white/20 object-cover block"
                />
            </div>

            <div className="mt-[clamp(16px,1.8vh,24px)] w-full text-center px-3">
                <div className="text-[clamp(0.86rem,1vw,1rem)] font-black tracking-[0.22em] text-white/54 uppercase">
                    No.{formatPlayerNumber(player)}
                </div>
                <div className="mt-2 text-[clamp(1.4rem,2vw,1.9rem)] font-black text-white leading-tight break-words">
                    {getPlayerName(player, role === 'master' ? '未知擂主' : '未知选手')}
                </div>
            </div>

            <div className="mt-[clamp(18px,2vh,28px)] min-h-[clamp(72px,8vh,96px)] flex items-center justify-center w-full text-center">
                {showScoreRoll ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.88, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.24, ease: 'easeOut' }}
                        className="text-[clamp(2.3rem,4vw,3.8rem)] leading-none font-mono font-black text-white"
                    >
                        <RollingScore value={scoreValue} active={showScoreRoll} runKey={`${role}-${scoreValue}`} />
                    </motion.div>
                ) : (
                <div className="w-full flex items-center justify-center text-[clamp(2rem,3.4vw,3.4rem)] leading-none font-black font-mono tracking-[0.22em] text-white/42 whitespace-nowrap">
                        ???
                    </div>
                )}
            </div>

        </motion.div>
    );
}

export default function PkBattle({ gameState }) {
    const pkMatches = gameState.pkMatches || [];
    const screenIdx = gameState.screenMatchIndex ?? 0;
    const activeMatch = pkMatches[screenIdx] || null;
    const [resultReady, setResultReady] = useState(false);

    const isFinished = activeMatch?.status === 'finished';
    const winner = activeMatch?.winner;
    const cardLayoutKey = `${screenIdx}-${isFinished ? 'finished' : 'live'}-${activeMatch?.challengerScore ?? ''}-${activeMatch?.masterScore ?? ''}-${winner ?? ''}`;

    useEffect(() => {
        if (!isFinished) {
            setResultReady(false);
            return;
        }

        setResultReady(false);
        const timer = window.setTimeout(() => {
            setResultReady(true);
        }, RESULT_REVEAL_DELAY);

        return () => window.clearTimeout(timer);
    }, [cardLayoutKey, isFinished]);

    if (!activeMatch) {
        return <div className="text-center mt-32 text-6xl text-slate-700 font-bold loading-dots">16强对战初始化中...</div>;
    }

    const cInfo = gameState.players.find((p) => p.id === activeMatch.challengerId);
    const mInfo = gameState.players.find((p) => p.id === activeMatch.masterId);

    const showScoreRoll = isFinished;
    const showOutcome = isFinished && resultReady;
    const centerOutcomeLines = getCenterOutcomeText({ winner });

    return (
        <div className="flex flex-col items-center justify-start w-full h-full pt-[clamp(6px,0.9vh,12px)] pb-[clamp(8px,1.2vh,16px)] overflow-hidden">
            <h2 className="text-[clamp(1.8rem,3vw,2.3rem)] font-black mt-[clamp(0px,0.3vh,6px)] mb-[clamp(8px,1.2vh,14px)] text-transparent bg-clip-text bg-[linear-gradient(to_right,rgba(255,255,255,0.96),rgba(220,240,255,0.78))] tracking-[0.22em] italic">
                1V1 BATTLE
            </h2>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="w-full max-w-[1480px] px-[clamp(12px,1.4vw,20px)] pb-[clamp(4px,0.8vh,10px)] grid grid-cols-[minmax(0,1fr)_clamp(220px,20vw,300px)_minmax(0,1fr)] items-start justify-items-center gap-[clamp(8px,1.2vw,20px)] mt-[clamp(0px,0.3vh,4px)] -translate-y-[clamp(20px,2.4vh,34px)]"
            >
                <BattleCard
                    player={cInfo}
                    role="challenger"
                    roleLabel="挑战者"
                    scoreValue={activeMatch.challengerScore}
                    showScoreRoll={showScoreRoll}
                    showOutcome={showOutcome}
                    winner={winner}
                />

                <div className="relative flex flex-col items-center justify-center gap-4 mt-[clamp(132px,14vh,176px)] w-[clamp(220px,20vw,300px)] z-20">
                    <motion.div
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.28, ease: 'easeOut' }}
                        className="text-[clamp(2.2rem,4vw,3.6rem)] font-black text-transparent bg-clip-text bg-[linear-gradient(to_bottom,rgba(255,255,255,0.94),rgba(255,255,255,0.36))] italic drop-shadow-[0_0_18px_rgba(255,255,255,0.12)]"
                    >
                        VS
                    </motion.div>

                    <AnimatePresence mode="wait" initial={false}>
                        {showOutcome && centerOutcomeLines.length > 0 && (
                            <motion.div
                                key={`result-${cardLayoutKey}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.28, ease: 'easeOut' }}
                                className="absolute top-[calc(100%+12px)] left-1/2 -translate-x-1/2 w-[clamp(220px,20vw,300px)] flex flex-col items-center gap-1.5 text-center whitespace-pre-line"
                            >
                                {centerOutcomeLines.map((line) => (
                                    <div
                                        key={line.text}
                                        className={line.variant === 'secondary'
                                            ? 'text-[clamp(0.96rem,1.2vw,1.08rem)] font-black italic tracking-[0.1em] leading-[1.45] text-white/52'
                                            : 'text-[clamp(1.1rem,1.5vw,1.32rem)] font-black italic tracking-[0.12em] leading-[1.5] text-transparent bg-clip-text bg-[linear-gradient(to_bottom,rgba(255,255,255,0.94),rgba(255,255,255,0.46))] drop-shadow-[0_0_14px_rgba(255,255,255,0.14)]'
                                        }
                                    >
                                        {line.text}
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <BattleCard
                    player={mInfo}
                    role="master"
                    roleLabel="擂主"
                    scoreValue={activeMatch.masterScore}
                    showScoreRoll={showScoreRoll}
                    showOutcome={showOutcome}
                    winner={winner}
                />
            </motion.div>
        </div>
    );
}

RollingScore.propTypes = {
    value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    active: PropTypes.bool.isRequired,
    runKey: PropTypes.string.isRequired,
};

BattleCard.propTypes = {
    player: PropTypes.shape({
        id: PropTypes.number,
        number: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        name: PropTypes.string,
        avatar: PropTypes.string,
    }),
    roleLabel: PropTypes.string.isRequired,
    role: PropTypes.oneOf(['challenger', 'master']).isRequired,
    scoreValue: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    showScoreRoll: PropTypes.bool.isRequired,
    showOutcome: PropTypes.bool.isRequired,
    winner: PropTypes.string,
};

PkBattle.propTypes = {
    gameState: PropTypes.shape({
        pkMatches: PropTypes.arrayOf(PropTypes.shape({
            challengerId: PropTypes.number.isRequired,
            masterId: PropTypes.number.isRequired,
            challengerScore: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
            masterScore: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
            status: PropTypes.string,
            winner: PropTypes.string,
        })),
        screenMatchIndex: PropTypes.number,
        players: PropTypes.arrayOf(PropTypes.shape({
            id: PropTypes.number.isRequired,
            number: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
            name: PropTypes.string,
            avatar: PropTypes.string,
        })).isRequired,
    }).isRequired,
};
