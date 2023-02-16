
import express from "express";
import http from "http";
import logger from "./utils/logger";
import db from "./db";

import { Server as SocketServer } from "socket.io";
import { v4 as uuidv4 } from "uuid";

import paymentValidator from "./utils/PaymentValidator.js";
import { calculateTotalhomeAmount } from "./helper/Balance.js";

import config from "./utils/config";
import {
	clientRouter,
	configuredHelmet,
	configuredMorgan,
	httpsOnly,
	logErrors,
} from "./utils/middleware";

const app = express();
const router = express.Router();
const server = http.createServer(app);

const apiRoot = "/api";
app.use(express.json());
app.use(configuredHelmet());
app.use(configuredMorgan());

if (config.production) {
	app.enable("trust proxy");
	app.use(httpsOnly());
}

app.use("/health", (_, res) => res.sendStatus(200));
app.use(apiRoot, router);
app.use(clientRouter(apiRoot));
app.use(logErrors());

const io = new SocketServer(server, {
  path: "/api/socket.io",
  cors: { origin: "*" },
  transports:['polling']
});

router.get("/", (_, res) => {
	res.json({ message: "Hello from Payments App!" });
});

io.on("connection", (socket) => {
  logger.info(`user with id ${socket.id} has just connected to the socket-server`);

  socket.on("disconnect", () => {
    logger.info(`user with id ${socket.id} has just disconnected from the socket-server`);
  });
});

function validatePaymentDataMiddleWare(req, res, next) {
  const payment = {...req.body};
  const errors = paymentValidator.validate(payment);

  if(errors.length > 0) {
      res.status(400).send({'errors': errors});
      next("Payment validation has failed");
  }

  next();
};

router.get("/version", (req, res) => {
  db.query("select version()")
    .then((result) => {
      res.status(200).send(result.rows[0]);
    })
    .catch((err) => {
      console.error(err);
    });
});

router.get('/balance', (req, res) => {
  db.query("select * from payments")
    .then((result) => {
      const balance = {
        amount: calculateTotalhomeAmount(result.rows),
        currency: 'GBP',
        currencySymbol: '\u00A3'
      };
      res.status(200).send(balance);
    })
    .catch((err) => {
      console.error(err);
    });
});

router.get('/payments', (req, res) => {
  db.query("select * from payments")
    .then((result) => {
      res.status(200).send(result.rows);
    })
    .catch((err) => {
      console.error(err);
    });
});

router.post("/payments", validatePaymentDataMiddleWare, (req, res) => {
  const payment = { ...req.body };
  Object.assign(payment, {
    id: uuidv4(),
    status: "Pending",
  });

  db.query("insert into payments (id, date, currency, amount, \"exchangeRate\", description, direction, status) values ($1, $2, $3, $4, $5, $6, $7, $8)",
    [payment.id, payment.date, payment.currency, payment.amount, payment.exchangeRate, payment.description, "out", payment.status])
  .then(result => {
    res.status(200).send();
  })
  .catch(err => {
    logger.error(err);
    res.send(400).json({});
  });


  const data = {
    action: "created",
    payment: payment,
  };

  io.sockets.emit("payments", data);

  setTimeout(() => {

    db.query("update payments set status = 'Completed' where id = $1", [payment.id])
      .catch(err => logger.error(err));

    const data = {
      action: "updated",
      payment: payment,
    };

    io.sockets.emit("payments", data);
  }, 10 * 1000 + 15 * Math.random() * 1000);
  // wait a random number of seconds between 10 and 10+15=25 seconds.
});

router.put("/payments/:id", (req, res) => {
  // TODO: refactor this to use db query for getting payments as paymentsOut
  const payment = paymentsOut.find((payment) => payment.id === req.params.id);
  if (!payment) {
    res.status(404).send("Could not find payment with this ID");
    return;
  }

  if (!req.body.description) {
    res.status(404).send("Wrong description");
    return;
  }

  payment.description = req.body.description;
  res.status(200).send();

  const data = {
    action: "updated",
    payment: payment,
  };

  io.sockets.emit("payments", data);
});

router.put('/payments/cancel/:id', (req, res) => {
  // TODO: refactor this to use db query for getting payments as paymentsOut
  const payment = paymentsOut.find( payment => payment.id === req.params.id);
  if(!payment){
      res.status(404).send('Could not find payment with this ID');
      return;
  }

  if(payment.status === 'Complete') {
      res.status(409).send('Payment has been already completed!');
      return;
  }

  payment.status = 'Cancelled';
  res.status(200).send();

  const data = {
    action: "updated",
    payment: payment,
  };

  io.sockets.emit("payments", data);
});

router.delete("/payments/:id", (req, res) => {
  // TODO: refactor this to use db query for getting payments as paymentsOut
  const paymentIdx = paymentsOut.findIndex(
    (payment) => payment.id === req.params.id
  );

  const payment = paymentsOut.splice(paymentIdx, 1).pop();
  res.status(200).send();

  const data = {
    action: "deleted",
    payment: payment,
  };

  io.sockets.emit("payments", data);
});

export default server;
export {app, router, server};
