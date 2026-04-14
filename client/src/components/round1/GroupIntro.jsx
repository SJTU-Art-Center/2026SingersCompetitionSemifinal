import PropTypes from 'prop-types';
import { getFullAvatarUrl } from '../../utils/avatar';
import { formatPlayerNumber } from '../../utils/playerIdentity';
import { parseDisplayName, getNameScale } from '../../utils/playerName';
const PANEL_CLASS = 'rounded-[24px] border border-white/20 bg-white/10 backdrop-blur-[20px] shadow-[0_8px_32px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.1)] transition-all duration-300 hover:translate-y-[-4px] hover:shadow-[0_12px_40px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.15)]';
const CARD_CLASS = 'rounded-[24px] border border-white/20 bg-white/10 backdrop-blur-[20px] shadow-[0_8px_32px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.1)] transition-all duration-300 hover:translate-y-[-4px] hover:shadow-[0_12px_40px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.15)]';

export default function GroupIntro({ gameState }) {
    const groups = [1, 2, 3, 4, 5, 6].map(g => ({
        id: g,
        players: gameState.players.filter(p => (p.group || 1) === g),
    }));

    const renderPlayerCard = (player) => (
        <div
            key={player.id}
            className={`${CARD_CLASS} flex flex-col items-center justify-start px-2.5 py-2 text-center min-h-0`}
        >
            <div className="rounded-[20px] p-[2px] bg-[linear-gradient(180deg,rgba(255,255,255,0.22),rgba(255,255,255,0.06))] shadow-[0_8px_18px_rgba(0,0,0,0.26)] flex-shrink-0">
                <img
                    src={getFullAvatarUrl(player.avatar)}
                    alt={player.name}
                    className="w-14 h-14 rounded-[18px] border border-white/12 object-cover block"
                />
            </div>
            <div className="mt-2 min-w-0 w-full">
                <div className="text-[10px] font-black tracking-[0.26em] uppercase text-white/58">No.{formatPlayerNumber(player)}</div>
                <div className="mt-0.5 font-black tracking-[0.03em] text-white leading-tight text-center">
                    {(() => {
                        const baseFontSize = 12;
                        const lines = parseDisplayName(player.name);
                        return lines.map((line, i) => {
                            const scale = getNameScale(line, 7);
                            const fontSize = scale < 1 ? Math.round(baseFontSize * scale) : baseFontSize;
                            return <div key={i} style={{ fontSize: `${fontSize}px` }} className="text-center">{line}</div>;
                        });
                    })()}
                </div>
            </div>
        </div>
    );

    return (
        <div className="w-full h-full flex flex-col bg-transparent text-white overflow-hidden">
            <div className="flex-1 grid grid-cols-3 grid-rows-2 gap-3 px-4 pt-2 pb-3 min-h-0">
                {groups.map(({ id, players }) => (
                    <div
                        key={id}
                        className={`${PANEL_CLASS} flex flex-col overflow-hidden min-h-0 px-3.5 py-3.5`}
                    >
                        <div className="flex-1 min-h-0 flex flex-col justify-center">
                            <div className="grid grid-cols-3 gap-2.5">
                                {players.slice(0, 3).map(p => renderPlayerCard(p))}
                            </div>

                            <div className="grid grid-cols-2 gap-2.5 w-[72%] mx-auto mt-2.5">
                                {players.slice(3, 5).map(p => renderPlayerCard(p))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

GroupIntro.propTypes = {
    gameState: PropTypes.shape({
        players: PropTypes.arrayOf(PropTypes.shape({
            id: PropTypes.number.isRequired,
            number: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
            name: PropTypes.string.isRequired,
            avatar: PropTypes.string,
            group: PropTypes.number
        })).isRequired
    }).isRequired
};
