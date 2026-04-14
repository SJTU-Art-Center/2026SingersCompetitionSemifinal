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
    const specialScreenAsset = screenDisplayMode === 'background'
        ? '/background.png'
        : screenDisplayMode === 'kv'
            ? '/kv.jpg'
            : screenDisplayMode === 'wiz'
                ? '/assets/background_with_logo.jpg'
                : null;
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
        <div className={`w-screen h-screen flex items-center justify-center overflow-hidden relative font-sans text-[var(--color-text-main)] ${themeClass}`}>
            {/* 全屏背景层，铺满整个 1920×1080 */}
            {!isSpecialMode && themeClass === 'theme-background' && (
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/background.png')" }} />
            )}
            {!isSpecialMode && themeClass !== 'theme-background' && (
                <div className="absolute inset-0 bg-[var(--color-bg-screen)]" />
            )}

            {/* 特殊模式：全屏素材铺满 1920×1080 */}
            {isSpecialMode && (
                <div className="absolute inset-0 bg-black">
                    {specialScreenAsset && <img src={specialScreenAsset} alt="投屏画面" className="absolute inset-0 w-full h-full object-cover object-center" />}
                </div>
            )}

            {/* 2:1 内容区，垂直居中，透明背景 */}
            {!isSpecialMode && (
                <div className="relative w-full h-full max-w-[calc(100vh*2)] max-h-[calc(100vw/2)] flex flex-col overflow-hidden">
                    {!(
                        (gameState.screenRound === 1 && (gameState.round1Mode === 'groupIntro' || gameState.round1Mode === 'group'))
                        || gameState.screenRound === 1.5
                        || gameState.screenRound === 2
                        || gameState.screenRound === 3
                        || gameState.screenRound === 4
                    ) && (
                        <div className="absolute inset-[12px] rounded-[24px] border border-white/20 bg-white/10 backdrop-blur-[20px] shadow-[0_8px_32px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.1)]" />
                    )}
                    <div className="relative z-20 px-9 pt-6 shrink-0 pointer-events-none">
                        <div>
                            <div className="min-w-0">
                                <h1 className="text-[clamp(3rem,4.8vw,5rem)] leading-[0.94] font-black tracking-[0.22em] text-white/60 transition-all duration-500 text-left" style={{ fontFamily: "'FZHENGFSJW', sans-serif", fontWeight: 900 }}>
                                    「声呼吸」校园歌手大赛
                                </h1>
                                <p className={`text-[clamp(0.9rem,1.24vw,1.02rem)] mt-3 font-bold text-white/60 tracking-[0.18em] uppercase border-l-4 border-white/30 pl-4 max-w-[70%] ${gameState.screenRound === 1.5 ? 'opacity-0 h-0 mt-0 overflow-hidden' : ''}`}>
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
                </div>
            )}
        </div>
    );
}
