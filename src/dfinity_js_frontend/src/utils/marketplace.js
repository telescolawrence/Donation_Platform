import { Principal } from "@dfinity/principal";
import { transferICP } from "./ledger";

export async function createCampaign(campaign) {
  return window.canister.donation.createCampaign(campaign);
}
// create a donor
export async function createDonor(donor) {
  return window.canister.donation.createDonor(donor);
}



// aaddDonorToCampaign
export async function addDonorToCampaign(campaignId, donorId) {
  return window.canister.donation.addDonorToCampaign(campaignId, donorId);
}


//get all campaigns
export async function getCampaigns() {
  try {
    return await window.canister.donation.getCampaigns();
  } catch (err) {
    if (err.name === "AgentHTTPResponseError") {
      const authClient = window.auth.client;
      await authClient.logout();
    }
    return [];
  }
}

//get all donors
export async function getDonors() {
  try {
    return await window.canister.donation.getDonors();
  } catch (err) {
    if (err.name === "AgentHTTPResponseError") {
      const authClient = window.auth.client;
      await authClient.logout();
    }
    return [];
  }
}

//get campaign by id
export async function getCampaignById(id) {
  try {
    return await window.canister.donation.getCampaign(id);
  } catch (err) {
    if (err.name === "AgentHTTPResponseError") {
      const authClient = window.auth.client;
      await authClient.logout();
    }
    return [];
  }
}

//get donor by id
export async function getDonorById(id) {
  try {
    return await window.canister.donation.getDonor(id);
  } catch (err) {
    if (err.name === "AgentHTTPResponseError") {
      const authClient = window.auth.client;
      await authClient.logout();
    }
    return [];
  }
}


//update campaign
export async function updateCampaign(campaign) {
  return window.canister.donation.updateCampaign(campaign);
}

//update donor
export async function updateDonor(donor) {
  return window.canister.donation.updateDonor(donor);
}



//delete campaign
export async function deleteCampaign(id) {
  return window.canister.donation.deleteCampaign(id);
}

//delete donor
export async function deleteDonor(id) {
  return window.canister.donation.deleteDonor(id);
}



// changeStatus
export async function changeStatus(id) {
  return window.canister.donation.changeStatus(id);
}



export async function makeDonation(donor, amount, campaignId) {
  const donationCanister = window.canister.donation;
  const donationResponse = await donationCanister.createReserveDonation(donor.id, campaignId, amount);
  const recieverPrincipal = Principal.from(donationResponse.Ok.reciever);
  const recieverAddress = await donationCanister.getAddressFromPrincipal(recieverPrincipal);
  const block = await transferICP(recieverAddress, donationResponse.Ok.price, donationResponse.Ok.memo);
  await donationCanister.completeReserveDonation(recieverPrincipal, donor.id, donationResponse.Ok.price, block, donationResponse.Ok.memo);
  await donationCanister.changeRaised(campaignId, amount);
}
