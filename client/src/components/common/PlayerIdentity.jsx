import PropTypes from 'prop-types';
import { formatPlayerNumber, getPlayerName } from '../../utils/playerIdentity';

export default function PlayerIdentity({
    player,
    fallbackName = '未知选手',
    className = '',
    numberClassName = '',
    nameClassName = '',
    numberPrefix = '',
    compact = false,
    center = true,
}) {
    const number = formatPlayerNumber(player);
    const name = getPlayerName(player, fallbackName);

    const alignClass = center ? 'items-center text-center' : 'items-start text-left';
    const baseNumberClass = compact
        ? 'text-[10px] leading-tight tracking-[0.18em] font-black text-slate-400'
        : 'text-xs leading-tight tracking-[0.2em] font-black text-slate-400';
    const baseNameClass = compact
        ? 'text-xs leading-tight font-bold text-slate-100'
        : 'text-sm leading-tight font-black text-slate-100';

    return (
        <div className={`flex flex-col min-w-0 ${alignClass} ${className}`}>
            <div className={`${baseNumberClass} ${numberClassName}`}>{`${numberPrefix}${number}`}</div>
            <div className={`${baseNameClass} truncate max-w-full ${nameClassName}`}>{name}</div>
        </div>
    );
}

PlayerIdentity.propTypes = {
    player: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        number: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        name: PropTypes.string,
    }),
    fallbackName: PropTypes.string,
    className: PropTypes.string,
    numberClassName: PropTypes.string,
    nameClassName: PropTypes.string,
    numberPrefix: PropTypes.string,
    compact: PropTypes.bool,
    center: PropTypes.bool,
};
