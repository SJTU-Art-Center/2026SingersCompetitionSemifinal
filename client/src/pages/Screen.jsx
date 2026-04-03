import { useGameState } from '../hooks/useGameState';
import RankList from '../components/round1/RankList';
import PkBattle from '../components/round2/PkBattle';
import DemonKing from '../components/demonKing/DemonKing';
import Resurrection from '../components/final/Resurrection';
import PickOpponent from '../components/transition/PickOpponent';
import GroupIntro from '../components/round1/GroupIntro';

export default function Screen() {
    const { gameState, connectionError, activeServerUrl } = useGameState();

    if (!gameState) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-4xl font-black bg-[var(--color-bg-base)] text-[var(--color-text-muted)] tracking-widest gap-4">
                <div className="animate-pulse">连接总控制台...</div>
                {connectionError && <div className="text-sm text-red-300 bg-red-900/30 border border-red-600/40 px-4 py-2 rounded-xl tracking-normal">{connectionError}</div>}
                {activeServerUrl && <div className="text-xs text-slate-400 font-mono tracking-normal">已连接：{activeServerUrl}</div>}
            </div>
        );
    }

    const themeClass = gameState.theme || 'theme-background';
    const screenDisplayMode = gameState.screenDisplayMode || 'live';
    const specialScreenAsset = screenDisplayMode === 'background' ? '/background.png' : screenDisplayMode === 'kv' ? '/kv.jpg' : null;
    const isSpecialMode = screenDisplayMode !== 'live';
    const screenSubtitle = (() => {
        if (gameState.screenRound === 0) return 'PREPARATION : 赛前准备部署中';
        if (gameState.screenRound === 1) {
            if (gameState.round1Mode === 'groupIntro') return 'ROUND 1 : 分组介绍';
            if (gameState.round1Mode === 'group') return `ROUND 1 : 第 ${gameState.currentGroup || 1} 组`;
            return 'ROUND 1 : 三十强排位赛';
        }
        if (gameState.screenRound === 1.5) return 'SELECTION : 对手挑选环节';
        if (gameState.screenRound === 2) return 'ROUND 2 : 十六强对战赛';
        if (gameState.screenRound === 3) return 'EXTRA ROUND : 大魔王返场';
        if (gameState.screenRound === 4) return 'FINAL ROUND : 十强终极补位';
        return '';
    })();

    return (
        <div className="w-screen h-screen flex items-center justify-center overflow-hidden bg-black">
            <div className="w-full h-full max-w-[calc(100vh*2)] max-h-[calc(100vw/2)] p-[10px]">
                <div className={`relative w-full h-full overflow-hidden flex flex-col font-sans bg-[var(--color-bg-screen)] text-[var(--color-text-main)] ${themeClass}`}>
                    {isSpecialMode ? (
                        <div className="relative w-full h-full overflow-hidden bg-black">
                            {specialScreenAsset && <img src={specialScreenAsset} alt="投屏画面" className="absolute inset-0 w-full h-full object-cover object-center" />}
                        </div>
                    ) : (
                        <>
                            {themeClass === 'theme-background' && <div className="absolute inset-0 bg-cover bg-center scale-[1.03]" style={{ backgroundImage: "url('/background.png')" }} />}
                            {!(
                                (gameState.screenRound === 1 && (gameState.round1Mode === 'groupIntro' || gameState.round1Mode === 'group'))
                                || gameState.screenRound === 1.5
                                || gameState.screenRound === 2
                                || gameState.screenRound === 3
                                || gameState.screenRound === 4
                            ) && (
                                <div className="absolute inset-[12px] rounded-[34px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.018),rgba(255,255,255,0.006))] backdrop-blur-[4px] shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_20px_48px_rgba(2,6,23,0.26)]" />
                            )}
                            <div className="relative z-20 px-9 pt-6 shrink-0 pointer-events-none">
                                <div>
                                    <div className="min-w-0">
                                        <h1 className="text-[clamp(3.15rem,4.9vw,5rem)] leading-[0.94] font-black tracking-[0.22em] text-transparent bg-clip-text bg-[linear-gradient(to_bottom,var(--title-gradient-from),var(--title-gradient-to))] text-shadow-glow drop-shadow-2xl italic transition-all duration-500">
                                            &quot;声呼吸&quot;校园歌手大赛
                                        </h1>
                                        <p className={`text-[clamp(0.9rem,1.24vw,1.02rem)] mt-3 font-bold text-[var(--color-text-muted)] tracking-[0.18em] uppercase border-l-4 border-cyan-300/80 pl-4 max-w-[70%] ${gameState.screenRound === 1.5 ? 'opacity-0 h-0 mt-0 overflow-hidden' : ''}`}>
                                            {screenSubtitle}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="relative z-10 flex-1 min-h-0 overflow-hidden px-7 pb-6 pt-4 flex flex-col items-center justify-start">
                                {gameState.screenRound === 0 && <div className="text-center mt-16 text-[var(--color-text-muted)]"><div className="text-[7rem] mb-5 opacity-40 animate-pulse">🎤</div><div className="text-[clamp(2rem,3vw,3rem)] font-black tracking-[0.2em] uppercase">比赛即将开始，敬请期待</div></div>}
                                {gameState.screenRound === 1 && gameState.round1Mode === 'groupIntro' && <GroupIntro gameState={gameState} />}
                                {gameState.screenRound === 1 && gameState.round1Mode !== 'groupIntro' && <RankList gameState={gameState} />}
                                {gameState.screenRound === 1.5 && <PickOpponent gameState={gameState} />}
                                {gameState.screenRound === 2 && <PkBattle gameState={gameState} />}
                                {gameState.screenRound === 3 && <DemonKing gameState={gameState} />}
                                {gameState.screenRound === 4 && <Resurrection gameState={gameState} />}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
