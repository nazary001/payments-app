const getPendingAmount = (payments) => {
  if (!payments) {
    return 0;
  }

  const pendingPayments = payments.filter(({status}) => status ==="Pending");
  const totalPendingAmount = pendingPayments.reduce((total, thisPayment) => {
    return total += thisPayment.amount * thisPayment.exchangeRate;
  }, 0);

  return Math.round(totalPendingAmount * 100) / 100;
};

const getAvailableAmount = (balanceAmount, payments) => {
  return Math.round((balanceAmount - getPendingAmount(payments)) * 100) / 100;
};

export {getPendingAmount, getAvailableAmount};