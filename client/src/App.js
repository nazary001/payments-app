import React from "react";
import Header from "./components/Header.js";
import Hero from "./components/Hero.js";
import Main from "./components/Main.js";
import Footer from "./components/Footer.js";
import { Grommet } from "grommet";
import { useEffect, useState} from "react";
import CurrenciesContext from "./data/CurrenciesContext.js";
import BalanceContext from "./data/BalanceContext.js";

function App() {
  const [currencies, setCurrencies] = useState({});
  const [balance, setBalance] = useState({});

  useEffect(() => {
    fetch("https://api.exchangerate.host/symbols")
      .then((response) => response.json())
      .then((data) => setCurrencies(data.symbols));
  }, []);

  useEffect(() => {
    fetch('/api/balance')
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
