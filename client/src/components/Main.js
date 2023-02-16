import React, { useContext, useState, useRef, useEffect } from "react";
import { Select, TextInput, Button } from "grommet";
import CurrenciesContext from "../data/CurrenciesContext";
import BalanceContext from "../data/BalanceContext";
import PaymentsView from "./PaymentsView";
import MakePaymentWindow from "./MakePaymentWindow";
import "./Main.css";

function Main({ socket }) {
  const balance = useContext(BalanceContext);
  const currencies = useContext(CurrenciesContext);
  const [payments, setPayments] = useState([]);
  const payment = useRef({});

  const [foreignCurrency, setForeignCurrency] = useState("USD");
  const [foreignAmount, setForeignAmount] = useState(0);
  const [homeAmount, setHomeAmount] = useState(0);
  const homeCurrency = balance.currency;

  const [showPaymentWindow, setShowPaymentWindow] = useState(false);

  const getPayments = async () => {
    const response = await fetch(`/api/payments`);
    const data = await response.json();
    setPayments(data);
  };

  const getRate = async (baseCcy) => {
    const exchangeApiLink = "https://api.exchangerate.host";
    const response = await fetch(`${exchangeApiLink}/latest?base=${foreignCurrency}`);
    const data = await response.json();

    payment.current = {
      date: data.date,
      foreignCurrency: foreignCurrency,
      foreignAmount: foreignAmount,
      homeCurrency: homeCurrency,
      homeAmount: homeAmount,
      exchangeRate: data.rates[homeCurrency],
    };
  };

  const convert = async () => {
    const exchangeApiLink = "https://api.exchangerate.host";
    const response = await fetch(`${exchangeApiLink}/convert?from=${foreignCurrency}&to=${homeCurrency}&amount=${foreignAmount}`);
    const data = await response.json();

    payment.current = {
      date: data.date,
      foreignCurrency: foreignCurrency,
      foreignAmount: Number(data.query.amount).toFixed(2),
      homeCurrency: homeCurrency,
      homeAmount: Number(data.result).toFixed(2),
      exchangeRate: data.info.rate,
    };

    setHomeAmount(payment.current.homeAmount);
  };

  useEffect(() => {
    getPayments();
    getRate();
  }, []);

  useEffect(() => {
    const processMessage = (data) => {
      // TODO:
      //  we might want to do something with the `data`
      getPayments();
    };

    if (socket) {
      socket.on("payments", processMessage);
      return () => {
        socket.off("payments", processMessage);
      };
    }
  }, [socket]);

  const addPayment = async (payment) => {

    const response = await fetch("/api/payments", {
      method: "POST",
      headers: new Headers({
        "Content-Type": "application/json"
      }),
      body: JSON.stringify(payment)
    });

    if(response.ok) {
      getPayments();
    } else {
      throw Error("oooops, we couldn't  post a new payment to the back-end server!");
    }
  };

  const handleChangeForeignAmount = (event) => {
    if (Number(event.target.value) || event.target.value === "") {
      setForeignAmount(event.target.value);
      // if foreignAmount updated manually,
      // then homeAmmount needs to reset and recalculated
      setHomeAmount(0);
    } else {
      event.target.value = foreignAmount;
    }
  };

  return (
    <main className="calculator-and-payments">
      <section className="calc-section">
        <h2 className="calc-title">Calculate payment in {homeCurrency}</h2>
        <div className="calc-data-container">
          <Select
            className="convert-select"
            options={Object.keys(currencies)}
            value={foreignCurrency}
            onChange={({ currency }) => setForeignCurrency(currency)}
          />
          <TextInput
            className="calc-text-input"
            placeholder="type here"
            value={foreignAmount}
            onChange={(event) => {
              handleChangeForeignAmount(event);
            }}
          />
          <div className="calc-res">is worth</div>
          <TextInput
            className="calc-text-input"
            readOnly
            placeholder="type here"
            value={homeAmount}
          />
          <div>in {homeCurrency}.</div>
        </div>
        <Button primary label="CALCULATE" onClick={convert} />
        <Button
          primary
          label="Make Payment"
          onClick={() => setShowPaymentWindow(true)}
        />
      </section>
      <section>
        <PaymentsView payments={payments} />
      </section>

      {showPaymentWindow && (
        <MakePaymentWindow
          setShowPaymentWindow={setShowPaymentWindow}
          paymentDetails={payment.current}
          payments={payments}
          addPayment={addPayment}
        />
      )}
    </main>
  );
}

export default Main;
