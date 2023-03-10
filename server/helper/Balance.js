const calculateHomeAmount = ({ amount, exchangeRate }) => {
    return Math.round((amount / exchangeRate) * 100) / 100;
};

const calculateTotalhomeAmount = (payments) => {
    const totalAmountHomeCurrency = payments.reduce((total, payment) => {
        return total + calculateHomeAmount(payment);
        }, 0);

    return Math.round(totalAmountHomeCurrency * 100) / 100;
};

export {calculateHomeAmount, calculateTotalhomeAmount};