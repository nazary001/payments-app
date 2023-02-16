import React from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Main from "./components/Main";
import Footer from "./components/Footer";
import { Grommet } from "grommet";
import { useEffect, useState} from "react";
import CurrenciesContext from "./data/CurrenciesContext";
import BalanceContext from "./data/BalanceContext";
import { io } from "socket.io-client";

function App() {
  const [currencies, setCurrencies] = useState({});
  const [balance, setBalance] = useState({});

  const [socket, setSocket] = useState(null);

  useEffect(() => {
    fetch("https://api.exchangerate.host/symbols")
      .then(response => response.json())
      .then((data) => setCurrencies(data.symbols));
  }, []);

  useEffect(() => {
    fetch('/api/balance')
      .then(response => response.json())
      .then(data => {
        setBalance(data);
      });
  }, []);

  useEffect(() => {
    const newSocket = io({path: "/api/socket.io", cors: {origin: "*"}});

    setSocket(newSocket);
    return () => {
      newSocket.close()
    };
  }, [setSocket]);

  useEffect(() => {
    if(socket) {
      socket.on("connect", () => {
        console.log("connected to Socket with id: " + socket.id);
      });
    }
  }, [socket]);

  return (
    <CurrenciesContext.Provider value={currencies}>
      <BalanceContext.Provider value={balance}>
        <Grommet>
          <Header />
          { (Object.keys(balance).length > 0 && Object.keys(currencies).length > 0) &&
            <>
              <Hero />
              <Main socket={socket}/>
            </>
          }
          <Footer />
        </Grommet>
      </BalanceContext.Provider>
    </CurrenciesContext.Provider>
  );
}

export default App;
