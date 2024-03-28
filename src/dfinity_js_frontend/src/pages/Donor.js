import React, { useCallback, useEffect, useState } from 'react'
import { Container, Nav, Table } from "react-bootstrap";
import Wallet from '../components/Wallet';
import { login, logout as destroy } from "../utils/auth";
import { balance as principalBalance } from "../utils/ledger"
import { Notification, NotificationError, NotificationSuccess } from '../components/utils/Notifications';
import Cover from '../components/utils/Cover';
import CreateDonorProfile from '../components/donor/CreateDonorProfile';
import { addDonorToCampaign, createDonor, getCampaigns as getCampaignList, getDonorById, makeDonation } from '../utils/marketplace';
import { toast } from 'react-toastify';
import MakeDonation from '../components/donor/MakeDonation';



const Donor = () => {

  const isAuthenticated = window.auth.isAuthenticated;
  const principal = window.auth.principalText;

  const [balance, setBalance] = useState("0");

  const [loading, setLoading] = useState(false);
  const [donorDetails, setDonorDetails] = useState({});
  const [campaigns, setCampaigns] = useState([]);

  const getBalance = useCallback(async () => {
    if (isAuthenticated) {
      setBalance(await principalBalance());
    }
  });
  const id = donorDetails.Ok ? donorDetails.Ok.id : "no id";
  const name = donorDetails.Ok ? donorDetails.Ok.name : " Donor name";
  const email = donorDetails.Ok ? donorDetails.Ok.email : " Donor email";


  // console.log("id",id)

  const donate = async (amount, campaignId) => {
    try {
      setLoading(true);
      const amountStr = amount;
      amount = parseInt(amountStr, 10) * 100000000;
      await makeDonation({
        id
      },amount, campaignId).then((resp) => {
        getCampaigns();
        toast(<NotificationSuccess text="Donated successfully" />);
      });
      addDonorToCampaign(campaignId, id);
    } catch (error) {
      toast(<NotificationError text="Failed: Create Profile and also have ICP in wallet" />);
    } finally {
      setLoading(false);
    }
  };

  const getCampaigns = useCallback(async () => {
    try {
      setCampaigns(await getCampaignList());
    } catch (error) {
      console.log({ error });
    } 
  });


  const addDonor = async (donor) => {
    try {
      const donorStr = donor.donationAmount;
      donor.donationAmount = parseInt(donorStr,10);
      await createDonor(donor).then( async (resp) => {
        console.log("resp", resp)
        setDonorDetails(  await getDonorById(resp.Ok.id));
      });
      toast(<NotificationSuccess text="donor added successfully." />);
    } catch (error) {
      console.log({ error });
      toast(<NotificationError text="Failed to create a donor. Create Donor Profile to Donate" />);
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
        <div className='d-flex justify-content-end align-items-center'>
            <>
             <CreateDonorProfile save={addDonor} />
            </>
        </div>

        <div className='d-flex justify-content-between align-items-center'>
            <h3 className='text-center mr-2'>{name
            
          }</h3>
            <h3 className='text-center mr-2'>{email}</h3>
            
       
        </div>
        {/* Create a table with the campaigns */}
        <h1 className='text-center'>Campaigns</h1>
        <Table striped bordered hover>
            <thead>
                <tr>
                <th>#</th>
                <th>Campaign Name</th>
                <th>Campaign Description</th>
                <th>Campaign Goal</th>
                <th>Status</th>
                <th>Donate</th>
                </tr>
            </thead>
            <tbody>
                {campaigns.map((campaign, index) => (
                    <tr key={index}>
                        <td>{index}</td>
                        <td>{campaign.title}</td>
                        <td>{campaign.description}</td>
                        <td>{campaign.goal.toString()}</td>
                        <td>{campaign.status}</td>
                        <td>
                          {campaign.status !== "COMPLETED" ? (
                                <MakeDonation donate={donate} campaignId={campaign.id} />
                            ) : (
                                <button disabled>Make Donation</button>
                            )}
                        </td>
                    </tr>
                ))}
            </tbody>
        </Table>

        
       
        </Container>

    ) : (
    <Cover name="" login={login}  />
    // <h1>lorem*2</h1>
    )}
</>
  )
}

export default Donor