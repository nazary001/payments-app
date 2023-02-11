import React, { useState, useContext, useEffect, useCallback } from "react";
import { Layer, Button, TextInput, Text } from "grommet";
import "./MakePaymentWindow.css";
import BalanceContext from "../data/BalanceContext";
import noMoney from "../assets/noMoney.gif";

export default function MakePaymentWindow({ setShowPaymentWindow, paymentDetails, payments, addPayment }) {
  const date = paymentDetails?.date || new Date().toLocaleDateString("fr-CA");
  const balance = useContext(BalanceContext);
  const [homeAmount, setHomeAmount] = useState(paymentDetails?.homeAmount || 0);
  const homeCurrency = paymentDetails?.homeCurrency || balance.currency;
  const foreignCurrency = paymentDetails?.foreignCurrency || "USD";
  const [foreignAmount, setForeignAmount] = useState(
    paymentDetails?.foreignAmount || 0
  );
  const exchangeRate = paymentDetails?.exchangeRate || 0;
  const [description, setDescription] = useState("");
  
  const [amountAvailable, setAmountAvailable] = useState("");
  
  const [showNotEnoughMoney, setShowNotEnoughMoney] = useState(false);
  
  const getPendingAmont = useCallback(() => {
    const pendingPayments = payments.filter(({ status }) => status === "Pending");

    const totalPendingAmount = pendingPayments.reduce((total, thisPayment) => {
      return (total += thisPayment.amount * thisPayment.exchangeRate);
    }, 0);

    return totalPendingAmount;
  }, [payments]);

  const pendingAmount = getPendingAmont();

  useEffect(() => {
    const pendingAmount = getPendingAmont();
    setAmountAvailable(balance.amount - pendingAmount);
  }, [homeAmount, balance, getPendingAmont]);

  const handleAmountUpdate = (event) => {
    if (event.target.id === "foreign-amount") {
      if (isValidAmountValue(event.target.value)) {
        // update foreignAmount
        setForeignAmount(Number(event.target.value));
        // recalculate homeAmount
        setHomeAmount(Number(event.target.value) * exchangeRate);
      } else {
        event.target.value = foreignAmount;
      }
    }

    if (event.target.id === "home-amount") {
      if (isValidAmountValue(event.target.value)) {
        // update homeAmount
        setHomeAmount(Number(event.target.value));
        // recalculate foreignAmount
        setForeignAmount(Number(event.target.value) / exchangeRate);
      } else {
        event.target.value = homeAmount;
      }
    }
  };

  const isValidAmountValue = (value) => {
    if (Number(value) || value === "") {
      return true;
    }

    return false;
  };
  
  const handleAddPayment = (payment) => {
    if (pendingAmount + homeAmount > balance.amount) {
      setShowNotEnoughMoney(true);
      return;
    }
    addPayment(payment);
  };

  return (
    <>
      <Layer 
        onEsc={() => setShowPaymentWindow(false)} 
        onClickOutside={() => setShowPaymentWindow(false)}
      >
        {!!showNotEnoughMoney ? (
          <div className="notEnoughMoney-window">
            <img src={noMoney} alt="no money gif" />
            <h2>You have not enough money!</h2>
            <h2>
              Available balance is {balance.amount - pendingAmount}{" "}
              {homeCurrency}
            </h2>
            <Button
              primary
              label="Back to payment"
              size="large"
              onClick={() => setShowNotEnoughMoney(false)}
            />
          </div>
        ) : (
          <div className="payment-window">
            <h1 className="window-title">Enter payment details</h1>
            <div className="input-fields">
              <h2>Date: {date}</h2>
              <div className="amount-line">
                <h2>Amount ({foreignCurrency}):</h2>
                <TextInput
                  id="foreign-amount"
                  placeholder="type here"
                  value={foreignAmount}
                  onChange={handleAmountUpdate}
                />
              </div>

              <div className="amount-line">
                <h2>Amount ({homeCurrency}):</h2>
                <TextInput
                  id="home-amount"
                  placeholder="type here"
                  value={homeAmount}
                  onChange={handleAmountUpdate}
                />
              </div>
              <Text size="small" color="red">
                Available amount: {amountAvailable}
              </Text>
              <h2>ExchangeRate: {exchangeRate}</h2>
              <div className="description-box">
                <h2>Description:</h2>
                <TextInput
                  onChange={(event) => setDescription(event.target.value)}
                  value={description}
                />
              </div>
            </div>
            <div className="buttons">
              <Button primary label="Cancel" size="large" onClick={() => setShowPaymentWindow(false)} />
              <Button
                primary
                label="Submit"
                size="large"
                onClick={() => {
                  const payment = {
                    date: date,
                    currency: foreignCurrency,
                    amount: foreignAmount,
                    exchangeRate: exchangeRate,
                    description: description,
                    status: "Pending",
                  };
                  handleAddPayment(payment);
                }}
              />
            </div>
          </div>
        )}
      </Layer>
    </>
  );
}
