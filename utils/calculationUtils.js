// utils/calculationUtils.js

// Even split calculation
exports.calculateEvenSplit = (amount, splitWith) => {
  const numParticipants = splitWith.length;
  const individualShare = Math.floor((amount / numParticipants) * 100) / 100;
  const remainder = amount - individualShare * numParticipants;

  return splitWith.map((entry, index) => ({
    ...entry,
    amount: index === numParticipants - 1 ? individualShare + remainder : individualShare
  }));
};

// Validation for manual amounts (byAmount split)
exports.validateTotalSplit = (amount, splitWith) => {
  const totalSplitAmount = splitWith.reduce((acc, entry) => acc + entry.amount, 0);
  if (Math.abs(totalSplitAmount - amount) > 0.01) {
    throw new Error("Split amounts do not add up to the total expense amount.");
  }
};

// Percentage-based split calculation
exports.calculatePercentageSplit = (amount, splitWith) => {
  const totalPercentage = splitWith.reduce((acc, entry) => acc + entry.percentage, 0);
  if (Math.abs(totalPercentage - 100) > 0.01) {
    throw new Error("Total percentage must equal 100%.");
  }
  return splitWith.map(entry => ({
    ...entry,
    amount: Math.floor(amount * (entry.percentage / 100) * 100) / 100
  }));
};

// Shares-based split calculation
exports.calculateShareSplit = (amount, splitWith) => {
  const totalShares = splitWith.reduce((acc, entry) => acc + entry.shares, 0);
  if (totalShares <= 0) {
    throw new Error("Total shares must be greater than zero.");
  }
  return splitWith.map(entry => ({
    ...entry,
    amount: Math.floor((amount * (entry.shares / totalShares)) * 100) / 100
  }));
};

// Round amounts to ensure total matches original amount
exports.roundAndAdjustSplit = (originalAmount, splitWith) => {
  let adjustedTotal = 0;
  const roundedSplit = splitWith.map(entry => {
    const roundedAmount = Math.round(entry.amount * 100) / 100;
    adjustedTotal += roundedAmount;
    return { ...entry, amount: roundedAmount };
  });

  const discrepancy = Math.round((originalAmount - adjustedTotal) * 100) / 100;
  if (discrepancy !== 0) {
    roundedSplit[roundedSplit.length - 1].amount += discrepancy; // Adjust the last entry to match the original amount
  }

  return roundedSplit;
};
