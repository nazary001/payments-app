import React from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Main from "./components/Main";
import Footer from "./components/Footer";
import { Grommet } from "grommet";
import { useEffect, useState} from "react";
import CurrenciesContext from "./data/CurrenciesContext";
import BalanceContext from "./data/BalanceContext";

function App() {
  const [currencies, setCurrencies] = useState({});
  const [balance, setBalance] = useState({});

  useEffect(() => {
    fetch("https://api.exchangerate.host/symbols")
      .then((response) => response.json())
      .then((data) => setCurrencies(data.symbols));
  }, []);

  useEffect(() => {
    fetch('http://localhost:4000/balance')
    .then(response => response.json())
    .then(data => {setBalance(data)})
  }, []);

  return (
    <CurrenciesContext.Provider value={currencies}>
      <BalanceContext.Provider value={balance}>
        <Grommet>
          <Header />
          { (Object.keys(balance).length > 0 && Object.keys(currencies).length > 0) &&
            <>
              <Hero />
              <Main />
            </>
          }
          <Footer />
        </Grommet>
      </BalanceContext.Provider>
    </CurrenciesContext.Provider>
  );
}

export default App;
