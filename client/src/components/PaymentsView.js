import { useState } from "react";
import { Box, Tab, Tabs } from "grommet";
import PaymentsTable from "./PaymentsTable";

function PaymentsView({ payments }) {
  const [activeTabIndex, setActiveTabIndex] = useState(0);
    
  const paymentTypes = {
    allPayments: { order: 1, title: "All Payments", filter: () => true },
    completePayments: { order: 3,  title: "Complete", filter: (payment) => payment.status === "Complete"  },
    pendingPayments: { order: 2, title: "Pending", filter: (payment) => payment.status === "Pending" } ,
    cancelledPayments: { order: 4, title: "Cancelled", filter: (payment) => payment.status === "Cancelled" }
  };

  return (
    <>
      <section className="payments-section">
        <h2 className="payments-title">Payments</h2>
        <Box align="center" pad="medium">
          <Tabs
            activeIndex={activeTabIndex}
            onActive={setActiveTabIndex}
            justify="center"
          >
            {
              Object.entries(paymentTypes)
              .sort((a, b) => a[1].order - b[1].order)
              .map(([key, tabProps]) => {
                return (
                    <Tab key={key} title={tabProps.title}>
                      <Box margin="small" gap="small">
                        <PaymentsTable payments={
                          payments.filter(tabProps.filter)
                        } />
                      </Box>
                    </Tab>
                );
              })
            }
          </Tabs>
        </Box>
      </section>
    </>
  );
}

export default PaymentsView;
