// ==========================================
// 1.9 GULAYAN NET PROFIT COMPUTATION
// ==========================================
exports.computeGulayanNetProfit = ({ sales, costOfGoodsSold, expenses, spoilageLoss }) => {
  return Number(sales) - Number(costOfGoodsSold) - Number(expenses) - Number(spoilageLoss);
};

// ==========================================
// 2.9 PRUTASAN NET PROFIT COMPUTATION
// ==========================================
exports.computePrutasanNetProfit = ({ sales, costOfGoodsSold, expenses, spoilageLoss }) => {
  return Number(sales) - Number(costOfGoodsSold) - Number(expenses) - Number(spoilageLoss);
};