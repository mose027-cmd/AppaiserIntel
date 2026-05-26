export function scoreAMCs(
  amcStats: any[],
  marketAvgNetFee: number,
  marketAvgTurnTime: number,
  marketAvgRevisionRounds: number
) {
  return amcStats.map((amc: any) => {
    const feeRatio =
      marketAvgNetFee > 0 ? amc.avgNet / marketAvgNetFee : 1;

    const feeScore = (feeRatio - 1) * 50;

    const turnRatio =
      marketAvgTurnTime > 0 ? marketAvgTurnTime / amc.avgTurn : 1;

    const turnScore = (turnRatio - 1) * 20;

    const revRatio =
      marketAvgRevisionRounds > 0
        ? marketAvgRevisionRounds / amc.avgRevisions
        : 1;

    const revScore = (revRatio - 1) * 10;

    const profitPerDay =
      amc.avgTurn > 0 ? amc.avgNet / amc.avgTurn : amc.avgNet;

    const profitScore = profitPerDay / 100;

    const rawScore =
      50 + feeScore + turnScore + revScore + profitScore;

    return {
      ...amc,
      profitPerDay: Math.round(profitPerDay),
      score: Math.max(0, Math.min(100, Math.round(rawScore))),
    };
  });
}