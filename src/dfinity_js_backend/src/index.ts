import { auto } from "@popperjs/core";
import { query, update, text, Record, StableBTreeMap, Variant, Vec, None, Some, Ok, Err, ic, Principal, Opt, nat64, Duration, Result, bool, Canister } from "azle";
import {
    Ledger, binaryAddressFromAddress, binaryAddressFromPrincipal, hexAddressFromPrincipal
} from "azle/canisters/ledger";
import { hashCode } from "hashcode";
import { v4 as uuidv4 } from "uuid";


const Campaign = Record({
    id: text,
    title: text,
    description: text,
    goal: nat64,
    raised: nat64,
    status: text,
    donor: Vec(text),
    creator: Principal,
});

const Donation = Record({
    id: text,
    amount: nat64,
    campaign: Campaign,
});

const Donor = Record({
    id: text,
    owner: Principal,
    name: text,
    email: text,
    donationAmount: nat64,
});

const CampaignPayload = Record({
    title: text,
    description: text,
    goal: nat64,
});

const DonationPayload = Record({
    amount: nat64,
});

const DonorPayload = Record({
    name: text,
    email: text
});


const ReserveStatus = Variant({
    PaymentPending: text,
    Completed: text
});



// Stay with implementing Payment for Reserving 
const Reserve = Record({
    donorId: text,
    price: nat64,
    status: ReserveStatus,
    donator: Principal,
    reciever: Principal,
    paid_at_block: Opt(nat64),
    memo: nat64
});

const Message = Variant({
    NotFound: text,
    InvalidPayload: text,
    PaymentFailed: text,
    PaymentCompleted: text
});


const campaignStorage = StableBTreeMap(0, text, Campaign);
const donationStorage = StableBTreeMap(1, text, Donation);
const donorStorage = StableBTreeMap(2, text, Donor);
const persistedReserves = StableBTreeMap(3, Principal, Reserve);
const pendingReserves = StableBTreeMap(4, nat64, Reserve);

const TIMEOUT_PERIOD = 48000n; // reservation period in seconds


/* 
    initialization of the Ledger canister. The principal text value is hardcoded because 
    we set it in the `dfx.json`
*/
const icpCanister = Ledger(Principal.fromText("ryjl3-tyaaa-aaaaa-aaaba-cai"));

export default Canister({

    // Get all the campaigns
    getCampaigns: query([], Vec(Campaign), () => {
        return campaignStorage.values();
    }),

    // Get all the donations
    getDonations: query([], Vec(Donation), () => {
        return donationStorage.values();
    }),

    // Get all the donors
    getDonors: query([], Vec(Donor), () => {
        return donorStorage.values();
    }),

    // Get a campaign by id
    getCampaign: query([text], Result(Campaign, Message), (id) => {
        const campaignOpt = campaignStorage.get(id);
        if ("None" in campaignOpt) {
            return Err({ NotFound: `campaign with id=${id} not found` });
        }
        return Ok(campaignOpt.Some);
    }),

    // Get a donation by id
    getDonation: query([text], Result(Donation, Message), (id) => {
        const donationOpt = donationStorage.get(id);
        if ("None" in donationOpt) {
            return Err({ NotFound: `donation with id=${id} not found` });
        }
        return Ok(donationOpt.Some);
    }),

    // Get a donor by id
    getDonor: query([text], Result(Donor, Message), (id) => {
        const donorOpt = donorStorage.get(id);
        if ("None" in donorOpt) {
            return Err({ NotFound: `donor with id=${id} not found` });
        }
        return Ok(donorOpt.Some);
    }),

    // Create a campaign
    createCampaign: update([CampaignPayload], Result(Campaign, Message), (payload) => {
        if (typeof payload !== "object" || Object.keys(payload).length === 0) {
            return Err({ InvalidPayload: "invalid payoad" });
        }
        const campaign = { id: uuidv4(), creator: ic.caller(),raised: 0n,donor: [], ...payload, status: "ACTIVE"};
        campaignStorage.insert(campaign.id, campaign);
        return Ok(campaign);
    }),

    // change the status of a campaign if goal is equal to raised
    changeStatus: update([text], Result(Campaign, Message), (id) => {
        const campaignOpt = campaignStorage.get(id);
        if ("None" in campaignOpt) {
            return Err({ NotFound: `cannot change the status: campaign with id=${id} not found` });
        }
        const campaign = campaignOpt.Some;
        if (campaign.goal <= campaign.raised) {
            campaign.status = "COMPLETED";
            campaignStorage.insert(campaign.id, campaign);
        }
        return Ok(campaign);
    }),

    // Create a donation
    createDonation: update([text, DonationPayload], Result(Donation, Message), (campaignId, payload) => {
        if (typeof payload !== "object" || Object.keys(payload).length === 0) {
            return Err({ InvalidPayload: "invalid payoad" });
        }
        const campaignOpt = campaignStorage.get(campaignId);
        if ("None" in campaignOpt) {
            return Err({ NotFound: `cannot donate: campaign with id=${campaignId} not found` });
        }
        const donation = { id: uuidv4(), campaign: campaignOpt.Some,  ...payload };
        donationStorage.insert(donation.id, donation);
        const updatedCampaign = { ...campaignOpt.Some, raised: campaignOpt.Some.raised + donation.amount };
        campaignStorage.insert(campaignId, updatedCampaign);
        return Ok(donation);
    }),

    // Create a donor
    createDonor: update([DonorPayload], Result(Donor, Message), (payload) => {
        if (typeof payload !== "object" || Object.keys(payload).length === 0) {
            return Err({ InvalidPayload: "invalid payoad" });
        }
        const donor = { id: uuidv4(), owner: ic.caller() , ...payload, donationAmount: 0n};
        donorStorage.insert(donor.id, donor);
        return Ok(donor);
    }),


    // Update a campaign
    updateCampaign: update([Campaign], Result(Campaign, Message), (payload) => {
        const campaignOpt = campaignStorage.get(payload.id);
        if ("None" in campaignOpt) {
            return Err({ NotFound: `cannot update the campaign: campaign with id=${payload.id} not found` });
        }
        campaignStorage.insert(campaignOpt.Some.id, payload);
        return Ok(payload);
    }),

    // Update a donation
    updateDonation: update([Donation], Result(Donation, Message), (payload) => {
        const donationOpt = donationStorage.get(payload.id);
        if ("None" in donationOpt) {
            return Err({ NotFound: `cannot update the donation: donation with id=${payload.id} not found` });
        }
        donationStorage.insert(donationOpt.Some.id, payload);
        return Ok(payload);
    }),

    // Update a donor
    updateDonor: update([Donor], Result(Donor, Message), (payload) => {
        const donorOpt = donorStorage.get(payload.id);
        if ("None" in donorOpt) {
            return Err({ NotFound: `cannot update the donor: donor with id=${payload.id} not found` });
        }
        donorStorage.insert(donorOpt.Some.id, payload);
        return Ok(payload);
    }),

    // Delete a campaign by id
    deleteCampaign: update([text], Result(Campaign, Message), (id) => {
        const deletedCampaignOpt = campaignStorage.get(id);
        if ("None" in deletedCampaignOpt) {
            return Err({ NotFound: `cannot delete the campaign: campaign with id=${id} not found` });
        }
        campaignStorage.remove(id);
        return Ok(deletedCampaignOpt.Some);
    }),


    // Delete a donation by id
    deleteDonation: update([text], Result(Donation, Message), (id) => {
        const deletedDonationOpt = donationStorage.get(id);
        if ("None" in deletedDonationOpt) {
            return Err({ NotFound: `cannot delete the donation: donation with id=${id} not found` });
        }
        donationStorage.remove(id);
        return Ok(deletedDonationOpt.Some);
    }),

    // Delete a donor by id
    deleteDonor: update([text], Result(Donor, Message), (id) => {
        const deletedDonorOpt = donorStorage.get(id);
        if ("None" in deletedDonorOpt) {
            return Err({ NotFound: `cannot delete the donor: donor with id=${id} not found` });
        }
        donorStorage.remove(id);
        return Ok(deletedDonorOpt.Some);
    }),


  
    //create a Donation reserve
    createReserveDonation: update([text,text,nat64], Result(Reserve, Message), (donorId,campaignId, amount) => {
        const donorOpt = donorStorage.get(donorId);
        if ("None" in donorOpt) {
            return Err({ NotFound: `cannot reserve donation: donor with id=${donorId} not found` });
        }
        const donor = donorOpt.Some;

        const campaignOpt = campaignStorage.get(campaignId);
        if ("None" in campaignOpt) {
            return Err({ NotFound: `cannot reserve donation: campaign with id=${campaignId} not found` });
        }
        const campaign = campaignOpt.Some;

        const campaignPrincipal = campaign.creator;
        const donorPrincipal = donor.owner;
        const reserve = {
            donorId: donor.id,
            price: amount,
            status: { PaymentPending: "PAYMENT_PENDING" },
            donator: donorPrincipal,
            reciever: campaignPrincipal,
            paid_at_block: None,
            memo: generateCorrelationId(donorId)
        };
        console.log("reserve",reserve)

        pendingReserves.insert(reserve.memo, reserve);
        discardByTimeout(reserve.memo, TIMEOUT_PERIOD);
        return Ok(reserve);
    }
    ),

    // Complete a reserve for book
    completeReserveDonation: update([Principal,text,nat64, nat64, nat64], Result(Reserve, Message), async (reservor,donorId,reservePrice, block, memo) => {
        const paymentVerified = await verifyPaymentInternal(reservor,reservePrice, block, memo);
        if (!paymentVerified) {
            return Err({ NotFound: `cannot complete the reserve: cannot verify the payment, memo=${memo}` });
        }
        const pendingReserveOpt = pendingReserves.remove(memo);
        if ("None" in pendingReserveOpt) {
            return Err({ NotFound: `cannot complete the reserve: there is no pending reserve with id=${donorId}` });
        }
        const reserve = pendingReserveOpt.Some;
        const updatedReserve = { ...reserve, status: { Completed: "COMPLETED" }, paid_at_block: Some(block) };

        const donorOpt = donorStorage.get(donorId);
        if ("None" in donorOpt){
            throw Error(`Donor with id=${donorId} not found`)
        }
        const donor = donorOpt.Some;
        donor.donationAmount += reservePrice;
        donorStorage.insert(donor.id,donor);
        persistedReserves.insert(ic.caller(), updatedReserve);
        return Ok(updatedReserve);
    }
    ),

    // Add donor.name to campaign.donor
    addDonorToCampaign: update([text, text], Result(Campaign, Message), (campaignId, donorId) => {
        const campaignOpt = campaignStorage.get(campaignId);
        if ("None" in campaignOpt) {
            return Err({ NotFound: `cannot add donor to the campaign: campaign with id=${campaignId} not found` });
        }
        const campaign = campaignOpt.Some;
        campaign.donor.push(donorId);
        campaignStorage.insert(campaign.id, campaign);
        return Ok(campaign);
    } ),

    
     /*
        another example of a canister-to-canister communication
        here we call the `query_blocks` function on the ledger canister
        to get a single block with the given number `start`.
        The `length` parameter is set to 1 to limit the return amount of blocks.
        In this function we verify all the details about the transaction to make sure that we can mark the order as completed
    */
    verifyPayment: query([Principal, nat64, nat64, nat64], bool, async (receiver, amount, block, memo) => {
        return await verifyPaymentInternal(receiver, amount, block, memo);
    }),

    /*
        a helper function to get address from the principal
        the address is later used in the transfer method
    */
    getAddressFromPrincipal: query([Principal], text, (principal) => {
        return hexAddressFromPrincipal(principal, 0);
    }),

});

/*
    a hash function that is used to generate correlation ids for orders.
    also, we use that in the verifyPayment function where we check if the used has actually paid the order
*/
function hash(input: any): nat64 {
    return BigInt(Math.abs(hashCode().value(input)));
};

// a workaround to make uuid package work with Azle
globalThis.crypto = {
    // @ts-ignore
    getRandomValues: () => {
        let array = new Uint8Array(32);

        for (let i = 0; i < array.length; i++) {
            array[i] = Math.floor(Math.random() * 256);
        }

        return array;
    }
};


// HELPER FUNCTIONS
function generateCorrelationId(bookId: text): nat64 {
    const correlationId = `${bookId}_${ic.caller().toText()}_${ic.time()}`;
    return hash(correlationId);
};

/*
    after the order is created, we give the `delay` amount of minutes to pay for the order.
    if it's not paid during this timeframe, the order is automatically removed from the pending orders.
*/
function discardByTimeout(memo: nat64, delay: Duration) {
    ic.setTimer(delay, () => {
        const order = pendingReserves.remove(memo);
        console.log(`Reserve discarded ${order}`);
    });
};

async function verifyPaymentInternal(receiver: Principal, amount: nat64, block: nat64, memo: nat64): Promise<bool> {
    const blockData = await ic.call(icpCanister.query_blocks, { args: [{ start: block, length: 1n }] });
    const tx = blockData.blocks.find((block) => {
        if ("None" in block.transaction.operation) {
            return false;
        }
        const operation = block.transaction.operation.Some;
        const senderAddress = binaryAddressFromPrincipal(ic.caller(), 0);
        const receiverAddress = binaryAddressFromPrincipal(receiver, 0);
        return block.transaction.memo === memo &&
            hash(senderAddress) === hash(operation.Transfer?.from) &&
            hash(receiverAddress) === hash(operation.Transfer?.to) &&
            amount === operation.Transfer?.amount.e8s;
    });
    return tx ? true : false;
};