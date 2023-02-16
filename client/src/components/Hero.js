import { useState, useEffect, useContext } from "react";
import { Select, Text } from "grommet";
import CurrenciesContext from "../data/CurrenciesContext";
import BalanceContext from "../data/BalanceContext";
import {getAvailableAmount} from "../helpers/PyemtnsHelper";
import "./Hero.css";

const Hero = () => {
  const currencies = useContext(CurrenciesContext);
  const balance  = useContext(BalanceContext);

  const [foreignCurrency, setForeignCurrency] = useState("USD");
  const [foreignAmount, setForeignAmount] = useState(0);
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    fetch(`/api/payments`)
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
      setForeignAmount(Number(data.result).toFixed(2));
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const exchangeApiLink = "https://api.exchangerate.host";
    const requestURL = `${exchangeApiLink}/convert?from=${balance.currency}&to=${foreignCurrency}&amount=${balance.amount}`;
    fetchData(requestURL);
  }, [foreignCurrency, balance]);

  return (
    <div className="balance-container">
      <h2 className="balance-title">Your account balance is</h2>
      <span className="balance-value">
        {balance.currencySymbol} {balance.amount}
      </span>
      <span>
        {
          !!payments.length &&
          <Text size="small" color="red">Available amount: {`${balance.currencySymbol} ${getAvailableAmount(balance.amount, payments)}`}</Text>
        }

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
