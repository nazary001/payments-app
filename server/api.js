
import { Router } from "express";
import logger from "./utils/logger";
import db from "./db";

import { server } from "./app";
import { Server as SocketServer } from "socket.io";
import { v4 as uuidv4 } from "uuid";

import paymentsOut from "./data/payments-out.js";
import paymentValidator from "./utils/PaymentValidator.js";
import { calculateTotalhomeAmount } from "./helper/Balance.js";

const router = Router();

const io = new SocketServer(server, {
  cors: { origin: "*" },
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

  paymentsOut.push(payment);
  res.status(200).send();

  const data = {
    action: "created",
    payment: payment,
  };

  io.sockets.emit("payments", data);

  setTimeout(() => {
    payment.status = "Completed";

    const data = {
      action: "updated",
      payment: payment,
    };

    ioServer.sockets.emit("payments", data);
  }, 10 * 1000 + 15 * Math.random() * 1000);
  // wait a random number of seconds between 10 and 10+15=25 seconds.
});


router.put("/payments/:id", (req, res) => {
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

export default router;
