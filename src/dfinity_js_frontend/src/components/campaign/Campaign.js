import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Card, Button, Col, Badge, Stack } from "react-bootstrap";
import CreateDonation from "../donation/CreateDonation";
import { toast } from "react-toastify";


import { NotificationError, NotificationSuccess } from "../utils/Notifications";
import { changeStatus, createDonation, getDonationById } from "../../utils/marketplace";

const Campaign = ({campaign}) => {
    const { id, title, description, goal, raised,donor, status, creator } = campaign;
    const [donation, setDonation] = useState({});
  // console.log("donation Amount", donation)


      const addDonation = async (donation) => {
        try {
          const priceStr = donation.amount;
          donation.amount = parseInt(priceStr, 10);
          createDonation(id,donation).then((resp) => {
           setDonation(getDonationById(resp.Ok.id));
          });
          toast(<NotificationSuccess text="donation added successfully." />);
        } catch (error) {
          console.log({ error });
          toast(<NotificationError text="Failed to create a donation." />);
        }
      };

      // check for donation status update
      const performCampaignCheck = async () => {
          try {
            await changeStatus(id);
            toast(<NotificationSuccess text="Campaign status updated successfully." />);
          } catch (error) {
            toast(<NotificationSuccess text="Maintained its campaign status." />);
          }
      }

      useEffect(() => {
        performCampaignCheck();
      } , [raised]);

   


  return (
    <Col key={id}>
      <Card className=" h-100">
        <Card.Header>
          <Stack direction="horizontal" gap={2}>
            <span className="font-monospace text-secondary">{creator.toString()}</span>
            <Badge bg="secondary" className="ms-auto">
              {raised.toString()} Raised
            </Badge>
          </Stack>
        </Card.Header>
        <Card.Body className="d-flex  flex-column text-center">
          <Card.Title>{title}</Card.Title>
          <Card.Text className="flex-grow-1 ">{description}</Card.Text>
          <Card.Text className="text-secondary">
            <span>{goal.toString()} Goal</span>
          </Card.Text>
          <Card.Text className="text-secondary">
            <span>Donors</span>
                {donor ? donor.map((_donor, index) => (
                    <span key={index}>{_donor}</span>
                )): "N/A"}
            </Card.Text>
          <Card.Text className="text-secondary">
            <span>{creator.toString()}</span>
          </Card.Text>
          {/* Display donation.id donation.amount donation.donor array */}

          <Card.Text className="text-secondary">
            <span>{donation.id}</span>
            </Card.Text>
            <Card.Text className="text-secondary">
            <span>{donation.amount ? donation.amount.toString() : "Set donation amount"}</span>
            </Card.Text>
            { status !== "COMPLETED" ?
              <CreateDonation save={addDonation} /> :
              <Button
                variant="dark"
                disabled
                style={{marginRight: "10px"}}
              >
                  Update Donation Record
              </Button>
            
          }
        </Card.Body>
      </Card>
    </Col>
  );
}

export default Campaign