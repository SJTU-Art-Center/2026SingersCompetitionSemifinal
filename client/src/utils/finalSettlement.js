const toNumber = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
};

const hasSubmittedDkScore = (player) => {
    return player?.scoreDK !== undefined && player?.scoreDK !== null && player?.scoreDK !== '';
};

const uniquePlayers = (players) => {
    const used = new Set();
    return players.filter((player) => {
        if (!player || used.has(player.id)) return false;
        used.add(player.id);
        return true;
    });
};

export const getPlayerLatestScore = (player, pkMatches = []) => {
    if (!player) return 0;

    if (hasSubmittedDkScore(player)) {
        return toNumber(player.scoreDK);
    }

    const match = pkMatches.find((item) => item.challengerId === player.id || item.masterId === player.id);
    if (match && match.status === 'finished') {
        if (player.id === match.challengerId) return toNumber(match.challengerScore);
        return toNumber(match.masterScore);
    }

    return toNumber(player.score);
};

export const deriveFinalSettlement = (gameState) => {
    const players = gameState?.players || [];
    const pkMatches = gameState?.pkMatches || [];

    const sortedByRound1 = [...players].sort((a, b) => b.score - a.score || a.id - b.id);
    const rankById = new Map(sortedByRound1.map((player, index) => [player.id, index + 1]));

    const demonKings = sortedByRound1.slice(0, 2);
    const masters = sortedByRound1.slice(2, 10);
    const challengers = sortedByRound1.slice(10, 18);
    const round1Eliminated = sortedByRound1.slice(18);

    const matchByMasterId = new Map();
    const matchByChallengerId = new Map();
    pkMatches.forEach((match) => {
        matchByMasterId.set(match.masterId, match);
        matchByChallengerId.set(match.challengerId, match);
    });

    const round1ReferencePlayers = sortedByRound1.slice(2, 18);
    const round1ReferenceTotal = round1ReferencePlayers.reduce((sum, player) => sum + toNumber(player.score), 0);
    const demonKingThreshold = round1ReferencePlayers.length > 0
        ? round1ReferenceTotal / round1ReferencePlayers.length
        : 0;

    const masterRows = masters.map((master, index) => {
        const match = matchByMasterId.get(master.id);
        const fallbackChallenger = challengers[index] || null;
        const challenger = match
            ? players.find((player) => player.id === match.challengerId) || fallbackChallenger
            : fallbackChallenger;

        return {
            master,
            challenger,
            match,
            winner: match?.status === 'finished' ? match.winner : null,
            masterScore: match?.status === 'finished' ? toNumber(match.masterScore) : getPlayerLatestScore(master, pkMatches),
            challengerScore: match?.status === 'finished' ? toNumber(match.challengerScore) : getPlayerLatestScore(challenger, pkMatches)
        };
    });

    const pendingMap = new Map();
    const pendingReasonMap = new Map();
    const addPending = (player, reason) => {
        if (!player) return;
        if (!pendingMap.has(player.id)) {
            pendingMap.set(player.id, player);
            pendingReasonMap.set(player.id, reason);
        }
    };

    const advancedDemonKings = [];
    const pendingDemonKings = [];
    const advancedMasters = [];
    const pendingMasters = [];
    const challengersByPair = [];

    const directAdvancedSet = new Set();
    const directReasonMap = new Map();
    const directSourceMap = new Map();

    demonKings.forEach((player) => {
        const dkScore = toNumber(player.scoreDK);
        const hasDkScore = hasSubmittedDkScore(player);

        if (hasDkScore && dkScore > demonKingThreshold) {
            directAdvancedSet.add(player.id);
            directReasonMap.set(player.id, `大魔王守擂成功（${dkScore.toFixed(2)} > ${demonKingThreshold.toFixed(2)}）`);
            directSourceMap.set(player.id, '大魔王');
            advancedDemonKings.push({ ...player, displayScore: dkScore });
            return;
        }

        if (hasDkScore) {
            const reason = `大魔王守擂失败（${dkScore.toFixed(2)} ≤ ${demonKingThreshold.toFixed(2)}），进入待定区`;
            addPending(player, reason);
            pendingDemonKings.push({ ...player, displayScore: dkScore });
        }
    });

    masterRows.forEach((row) => {
        const { master, challenger, winner, masterScore, challengerScore, match } = row;

        if (challenger) {
            challengersByPair.push({ ...challenger, displayScore: challengerScore });
        }

        if (!match || match.status !== 'finished') {
            return;
        }

        if (winner === 'master') {
            directAdvancedSet.add(master.id);
            directReasonMap.set(master.id, `擂主守擂成功（${masterScore.toFixed(2)} : ${challengerScore.toFixed(2)}）`);
            directSourceMap.set(master.id, '擂主');
            advancedMasters.push({ ...master, displayScore: masterScore });
            return;
        }

        if (winner === 'both_pending') {
            addPending(master, `擂主未胜（${masterScore.toFixed(2)} : ${challengerScore.toFixed(2)}），进入待定区`);
            pendingMasters.push({ ...master, displayScore: masterScore });
            if (challenger) {
                addPending(challenger, `攻擂成功/平分（${challengerScore.toFixed(2)} : ${masterScore.toFixed(2)}），进入待定区`);
            }
        }
    });

    players.forEach((player) => {
        const isPendingLike = player.status === 'pending' || player.status === 'resurrected';
        if (isPendingLike && !directAdvancedSet.has(player.id) && !pendingMap.has(player.id)) {
            addPending(player, '待定区候选');
        }
    });

    const pendingCandidates = [...pendingMap.values()]
        .map((player) => ({
            ...player,
            latestScore: getPlayerLatestScore(player, pkMatches),
            round1Rank: rankById.get(player.id) || 999
        }))
        .sort((a, b) => b.latestScore - a.latestScore || b.score - a.score || a.id - b.id);

    const directAdvanced = sortedByRound1.filter((player) => directAdvancedSet.has(player.id));
    const remainingSpots = Math.max(0, 10 - directAdvanced.length);

    const promotedPending = pendingCandidates.slice(0, remainingSpots);
    const nonPromotedPending = pendingCandidates.slice(remainingSpots);

    const promotedSet = new Set(promotedPending.map((player) => player.id));
    const finalAdvancedSet = new Set([...directAdvancedSet, ...promotedSet]);

    const stage7TopRow = uniquePlayers([
        ...advancedDemonKings,
        ...advancedMasters,
        ...promotedPending
    ]);
    const stage7BottomRow = uniquePlayers(nonPromotedPending);

    const finalTop10 = uniquePlayers([...directAdvanced, ...promotedPending]).slice(0, 10);

    const pendingRankById = new Map(pendingCandidates.map((player, index) => [player.id, index + 1]));

    const allPlayerResults = sortedByRound1.map((player) => {
        const rank = rankById.get(player.id) || 999;
        const role = rank <= 2
            ? '大魔王'
            : rank <= 10
                ? '擂主'
                : rank <= 18
                    ? '攻擂者'
                    : '首轮淘汰';

        const challengerMatch = matchByChallengerId.get(player.id);
        const masterMatch = matchByMasterId.get(player.id);
        let reason = '';

        if (directReasonMap.has(player.id)) {
            reason = directReasonMap.get(player.id);
        } else if (pendingReasonMap.has(player.id)) {
            reason = pendingReasonMap.get(player.id);
        } else if (role === '攻擂者' && challengerMatch?.status === 'finished' && challengerMatch.winner === 'master') {
            reason = `攻擂失败（${toNumber(challengerMatch.challengerScore).toFixed(2)} : ${toNumber(challengerMatch.masterScore).toFixed(2)}），直接淘汰`;
        } else if (role === '首轮淘汰') {
            reason = '第一轮未进入18强';
        } else if (role === '攻擂者') {
            reason = '攻擂赛果待确认';
        } else if (role === '擂主') {
            reason = '擂台赛果待确认';
        } else if (role === '大魔王') {
            reason = hasSubmittedDkScore(player) ? '大魔王结果待确认' : '大魔王返场未打分';
        }

        let finalStatus = '未晋级';
        let finalReason = reason;
        let source = null;

        if (finalAdvancedSet.has(player.id)) {
            finalStatus = '晋级';
            if (directSourceMap.has(player.id)) {
                source = directSourceMap.get(player.id);
                finalReason = directReasonMap.get(player.id) || reason;
            } else {
                const pendingRank = pendingRankById.get(player.id);
                source = '待定区';
                finalReason = `待定区补位晋级（第${pendingRank}名）`;
            }
        } else if (pendingRankById.has(player.id)) {
            const pendingRank = pendingRankById.get(player.id);
            finalReason = `待定区未补位（第${pendingRank}名，补位线前${remainingSpots}名）`;
        }

        return {
            ...player,
            role,
            round1Rank: rank,
            latestScore: getPlayerLatestScore(player, pkMatches),
            finalStatus,
            finalReason,
            source,
            pendingRank: pendingRankById.get(player.id) || null,
            masterMatch,
            challengerMatch
        };
    });

    return {
        sortedByRound1,
        demonKings,
        masters,
        challengers,
        round1Eliminated,
        demonKingThreshold,
        masterRows,
        advancedDemonKings,
        pendingDemonKings,
        advancedMasters,
        pendingMasters,
        challengersByPair,
        directAdvanced,
        pendingCandidates,
        remainingSpots,
        promotedPending,
        nonPromotedPending,
        stage7TopRow,
        stage7BottomRow,
        finalTop10,
        allPlayerResults
    };
};
