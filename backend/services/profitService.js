exports.computeGulayanNetProfit = ({ sales, costOfGoodsSold, expenses, spoilageLoss }) => {
  return (
    Number(sales) -
    Number(costOfGoodsSold) -
    Number(expenses) -
    Number(spoilageLoss)
  );
};