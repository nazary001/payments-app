import { React, useState, useEffect, useContext } from "react";
import { Select, Text } from "grommet";
import CurrenciesContext from "../data/CurrenciesContext";
import BalanceContext from "../data/BalanceContext";
import "./Hero.css";

const Hero = () => {
  const [foreignCurrency, setForeignCurrency] = useState("USD");
  const [foreignAmount, setForeignAmount] = useState(0);
  const [payments, setPayments] = useState([]);
  
  const currencies = useContext(CurrenciesContext);
  const balance  = useContext(BalanceContext);

  useEffect(() => {
    fetch(`http://localhost:4000/payments`)
      .then(res => res.json())
      .then(data => {
        setPayments(data);
      });
  }, []);

  const handleChangeCurrency = (currency) => {
    setForeignCurrency(currency);
  };


  const fetchData = async (url) => {
    try {
      const response = await fetch(url);
      const data = await response.json();
      setForeignAmount(data.result.toFixed(2));
    } catch (error) {
      console.log(error);
    }
  };

  const getPendingAmont = () => {
    const pendingPayments = payments.filter(({status}) => status ==="Pending");
    
    const totalPendingAmount = pendingPayments.reduce((total, thisPayment) => {
      return total += thisPayment.amount * thisPayment.exchangeRate;
    }, 0);

    return totalPendingAmount;
  };

  useEffect(() => {
    const requestURL = `https://api.exchangerate.host/convert?from=${balance.currency}&to=${foreignCurrency}&amount=${balance.amount}`;
    fetchData(requestURL);
  }, [foreignCurrency, balance]);

  return (
    <div className="balance-container">
      <h2 className="balance-title">Your account balance is</h2>
      <span className="balance-value">
        {balance.currencySymbol} {balance.amount}
      </span>
      <span>
      <Text size="small" color="red">Available amount: {`${balance.currencySymbol} ${balance.amount - getPendingAmont()}`}</Text>
      </span>
      <p className="balance-convert">
        Your balance is <span>{foreignAmount}</span> in{" "}
        <span>
          <Select
            className="convert-select"
            options={Object.keys(currencies).sort()}
            value={foreignCurrency}
            onChange={(e) => {
              handleChangeCurrency(e.target.value);
            }}
          />
        </span>
      </p>
    </div>
  );
};

export default Hero;
