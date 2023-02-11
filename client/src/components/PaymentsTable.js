import { useState, useContext, useEffect } from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableCell,
  TableBody,
  Button,
} from "grommet";

import BalanceContext from "../data/BalanceContext";

function PaymentsTable(props) {
  const balance = useContext(BalanceContext);
  const homeCurrency = balance.currency;
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    if(Array.isArray(props.payments) && props.payments.length > 0) {
      setPayments([...props.payments]);
    }
  }, [props.payments]);
  
  const calculateHomeAmount = ({ amount, exchangeRate }) => {
    return Math.round((amount / exchangeRate) * 100) / 100;
  };

  const calculateTotalhomeAmount = () => {
    const totalAmountHomeCurrency = payments.reduce((total, payment) => {
        return total + calculateHomeAmount(payment);
      }, 0);
    
    return Number(totalAmountHomeCurrency * 100 / 100).toFixed(2);
  };

  const handleCancelPayment = ({id}) => {
    fetch(`http://localhost:4000/payments/cancel/${id}`, {method: "PUT"})
      .then(res => {
        if(res.ok) {
          // payment status was changed to `Cancelled`:
          // reflect it on the page now.
          const paymentsCopy = [...payments];
          const payment = paymentsCopy.find(payment => payment.id === id);
          payment.status = 'Cancelled';
          
          setPayments(paymentsCopy);
        } else {
          // payment is probably in complete status
          // we can't change payment's status
          // so, do nothing.
        }
      });

  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableCell scope="col" border="bottom">
            <strong>Date</strong>
          </TableCell>
          <TableCell scope="col" border="bottom">
            <strong>Cur</strong>
          </TableCell>
          <TableCell scope="col" border="bottom">
            <strong>Amount</strong>
          </TableCell>
          <TableCell scope="col" border="bottom">
            <strong>{homeCurrency}</strong>
          </TableCell>
          <TableCell scope="col" border="bottom">
            <strong>Description</strong>
          </TableCell>
          <TableCell scope="col" border="bottom">
            <strong>Status</strong>
          </TableCell>
          <TableCell scope="col" border="bottom">
            <strong>Action</strong>
          </TableCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        {payments.map((payment) => {
          return (
            <TableRow key={payment.id}>
              <TableCell>{payment.date}</TableCell>
              <TableCell>{payment.currency}</TableCell>
              <TableCell>{payment.amount}</TableCell>
              <TableCell>{calculateHomeAmount(payment)}</TableCell>
              <TableCell>{payment.description}</TableCell>
              <TableCell>{payment.status}</TableCell>
              <TableCell>
                {payment.status === "Pending" ? (
                  <Button
                    type="button"
                    primary
                    label="Cancel"
                    onClick={() => {
                      handleCancelPayment(payment);
                    }}
                  />
                ) : (
                  ""
                )}
              </TableCell>
            </TableRow>
          );
        })}
        <TableRow>
          <TableCell></TableCell>
          <TableCell></TableCell>
          <TableCell></TableCell>
          <TableCell>
            <strong>{calculateTotalhomeAmount()}</strong>
          </TableCell>
          <TableCell scope="row">
            <strong>Total ({homeCurrency})</strong>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}

export default PaymentsTable;
