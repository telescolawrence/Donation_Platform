import React, { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Container, Nav, Button, Form, FloatingLabel, Row } from "react-bootstrap";
import Wallet from '../components/Wallet';
import { login, logout as destroy } from "../utils/auth";
import { balance as principalBalance } from "../utils/ledger"
import { Notification, NotificationError, NotificationSuccess } from '../components/utils/Notifications';
import Cover from '../components/utils/Cover';
import CreateDonation from '../components/donation/CreateDonation';
import { createCampaign,  getCampaigns as getCampaignsList,} from '../utils/marketplace';
import CreateCampaign from '../components/campaign/CreateCampaign';
import Campaign from '../components/campaign/Campaign';
import { toast } from 'react-toastify';




const Donation = () => {

    const isAuthenticated = window.auth.isAuthenticated;
    const principal = window.auth.principalText;

    const [balance, setBalance] = useState("0");
    const [campaigns, setCampaigns] = useState([]);


    const getBalance = useCallback(async () => {
        if (isAuthenticated) {
          setBalance(await principalBalance());
        }
      });

      const getCampaigns = useCallback(async () => {
        try {
          setCampaigns(await getCampaignsList());
        } catch (error) {
          console.log({ error });
        } 
      });

      const addCampaign = async (campaign) => {
        try {
          const priceStr = campaign.goal;
          campaign.goal = parseInt(priceStr, 10);
          createCampaign(campaign).then((resp) => {
            getCampaigns();
          });
          toast(<NotificationSuccess text="Campaign added successfully." />);
        } catch (error) {
          console.log({ error });
          toast(<NotificationError text="Failed to create a Campaign." />);
        }
      };

      useEffect(() => {
        getBalance();
        getCampaigns();
      }, [getBalance]);

    return (
            <>
            <Notification />
            {isAuthenticated ? (
                <Container fluid="md">
                <Nav className='justify-content-end pt-3 pb-5'>
                    <Nav.Item>
                    <Wallet
                            principal={principal}
                            balance={balance}
                            symbol={"ICP"}
                            isAuthenticated={isAuthenticated}
                            destroy={destroy}
                            />
                    </Nav.Item>
                </Nav>
                <div className='d-flex justify-content-between align-items-center'>
                    <Link to="/donor" className='justify-content-start py-2 px-3 my-2 bg-secondary text-white rounded-pill '>Donor Profile</Link> 

                    <>
                     <CreateCampaign save={addCampaign} />
                    </>
                </div>

                <h1 className='text-center'>Campaigns</h1>
                <Row xs={1} sm={2} lg={3} className="g-3  mb-5 g-xl-4 g-xxl-5">
                    {campaigns.map((_campaign, index) => (
                    <Campaign
                        key={index}
                        campaign={_campaign}
                  
                    />
                    ))}
                </Row>
                
               
                </Container>

            ) : (
              <Cover name="Donation" login={login}  />
            )}
        </>
    )
}

export default Donation