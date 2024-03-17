import { Principal } from "@dfinity/principal";
import { transferICP } from "./ledger";

export async function createCampaign(campaign) {
  return window.canister.donation.createCampaign(campaign);
}
// create a donor
export async function createDonor(donor) {
  return window.canister.donation.createDonor(donor);
}

// create a donation
export async function createDonation(donation) {
  return window.canister.donation.createDonation(donation);
}

// get all donations
export async function getDonations() {
  try {
    return await window.canister.donation.getDonations();
  } catch (err) {
    if (err.name === "AgentHTTPResponseError") {
      const authClient = window.auth.client;
      await authClient.logout();
    }
    return [];
  }
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

//get donation by id
export async function getDonationById(id) {
  try {
    return await window.canister.donation.getDonation(id);
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

//update donation

export async function updateDonation(donation) {
  return window.canister.donation.updateDonation(donation);
}

//delete campaign
export async function deleteCampaign(id) {
  return window.canister.donation.deleteCampaign(id);
}

//delete donor
export async function deleteDonor(id) {
  return window.canister.donation.deleteDonor(id);
}

//delete donation
export async function deleteDonation(id) {
  return window.canister.donation.deleteDonation(id);
}




export async function makeDonation(donor, amount, campaignId) {
  const donationCanister = window.canister.donation;
  const donationResponse = await donationCanister.createReserveDonation(donor.id, campaignId, amount);
  const recieverPrincipal = Principal.from(donationResponse.Ok.reciever);
  const recieverAddress = await donationCanister.getAddressFromPrincipal(recieverPrincipal);
  const block = await transferICP(recieverAddress, donationResponse.Ok.price, donationResponse.Ok.memo);
  await donationCanister.completePurchase(recieverPrincipal, donor.id, donationResponse.Ok.price, block, donationResponse.Ok.memo);
}
