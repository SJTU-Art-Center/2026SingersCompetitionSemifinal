import React from 'react';
import { useGameState } from '../hooks/useGameState';
import RankList from '../components/RankList';
import PkBattle from '../components/PkBattle';
import DemonKing from '../components/DemonKing';
import Resurrection from '../components/Resurrection';
import PickOpponent from '../components/PickOpponent';

export default function Screen() {
    const { gameState } = useGameState();

    if (!gameState) return <div className="flex items-center justify-center min-h-screen text-4xl font-black bg-[var(--color-bg-base)] text-[var(--color-text-muted)] tracking-widest animate-pulse">连接总控制台...</div>;

    const themeClass = gameState.theme || 'theme-dark';

    return (
        <div className={`min-h-screen p-8 pt-10 overflow-hidden relative font-sans flex flex-col bg-[var(--color-bg-screen)] text-[var(--color-text-main)] ${themeClass}`}>
            {/* 顶部标题区始终固定悬浮效果 */}
            <div className="absolute top-8 left-10 z-50">
                <h1 className="text-6xl font-black tracking-widest text-transparent bg-clip-text bg-[linear-gradient(to_bottom,var(--title-gradient-from),var(--title-gradient-to))] text-shadow-glow drop-shadow-2xl italic transition-all duration-500">
                    SUPER SINGER
                </h1>
                <p className="text-2xl mt-3 font-bold text-[var(--color-text-muted)] tracking-[0.2em] uppercase border-l-4 border-emerald-500 pl-3">
                    {gameState.screenRound === 0 && 'PREPARATION : 赛前准备部署中'}
                    {gameState.screenRound === 1 && 'ROUND 1 : 三十强排位赛'}
                    {gameState.screenRound === 1.5 && 'SELECTION : 对手挑选环节'}
                    {gameState.screenRound === 2 && 'ROUND 2 : 十六强对战赛'}
                    {gameState.screenRound === 3 && 'EXTRA ROUND : 大魔王返场'}
                    {gameState.screenRound === 4 && 'FINAL ROUND : 十强终极补位'}
                </p>
            </div>

            {/* 装饰性背景光晕 */}
            <div className="fixed top-0 right-0 w-[800px] h-[800px] bg-[var(--color-glow-1)] rounded-full blur-[120px] pointer-events-none transition-colors duration-500"></div>
            <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-[var(--color-glow-2)] rounded-full blur-[100px] pointer-events-none transition-colors duration-500"></div>

            <div className="pt-32 relative z-10 flex-1 overflow-y-auto custom-scrollbar flex flex-col items-center">
                {gameState.screenRound === 0 && <div className="text-center mt-32 text-[var(--color-text-muted)]"><div className="text-[10rem] mb-6 opacity-30 animate-pulse">🎤</div><div className="text-4xl font-black tracking-widest">比赛即将开始，敬请期待...</div></div>}
                {gameState.screenRound === 1 && <RankList gameState={gameState} />}
                {gameState.screenRound === 1.5 && <PickOpponent gameState={gameState} />}
                {gameState.screenRound === 2 && <PkBattle gameState={gameState} />}
                {gameState.screenRound === 3 && <DemonKing gameState={gameState} />}
                {gameState.screenRound === 4 && <Resurrection gameState={gameState} />}
            </div>
        </div>
    );
}
