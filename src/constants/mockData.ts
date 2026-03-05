import { JournaledTransaction } from "../components/JournalRow";
import { Transaction } from "../components/TransactionCard";

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    txHash: "abc123",
    type: "SWAP",
    description: "You swapped 50 USDC for 0.3 SOL on Jupiter",
    amount: "0.3 SOL",
    amountUsd: "$50.00",
    isIncoming: false,
    date: "Oct 24",
    category: "DeFi",
    note: undefined,
    nftImageUrl: undefined,
  },
  {
    txHash: "def456",
    type: "TRANSFER",
    description: "Received 1.5 SOL from wallet 7ax...k92",
    amount: "1.5 SOL",
    amountUsd: "$250.00",
    isIncoming: true,
    date: "Oct 23",
    category: "Personal",
    note: "Monthly savings allocation",
    nftImageUrl: undefined,
  },
  {
    txHash: "ghi789",
    type: "TRANSFER",
    description: "Sent 100 PYUSD to Alice.sol",
    amount: "100 PYUSD",
    amountUsd: "$100.00",
    isIncoming: false,
    date: "Oct 22",
    category: "Transfer",
    note: undefined,
    nftImageUrl: undefined,
  },
  {
    txHash: "jkl012",
    type: "NFT_MINT",
    description: "Minted Mad Lads #420 on Tensor",
    amount: "1 NFT",
    amountUsd: "$840.00",
    isIncoming: true,
    date: "Oct 20",
    category: "NFT",
    note: undefined,
    nftImageUrl: "https://picsum.photos/200",
  },
];

// JOURNALED TRANSACTIONS

export interface JournalSection {
  title: string;
  data: JournaledTransaction[];
}

export const Sections: JournalSection[] = [
  {
    title: "TODAY, OCT 24",
    data: [
      {
        txHash: "abc123",
        category: "Hardware",
        status: "VERIFIED",
        amount: "-$1,299.00",
        isIncoming: false,
        description: "Apple Store - New York",
        note: undefined,
      },
      {
        txHash: "abc124",
        category: "Business Dining",
        status: "PENDING",
        amount: "-$12.45",
        isIncoming: false,
        description: "Joe's Italian Coffee",
        note: undefined,
      },
    ],
  },
  {
    title: "YESTERDAY, OCT 23",
    data: [
      {
        txHash: "abc125",
        category: "Freelance",
        status: "VERIFIED",
        amount: "+$4,500.00",
        isIncoming: true,
        description: "Freelance Payment - Stripe",
        note: undefined,
      },
      {
        txHash: "abc126",
        category: "Software SaaS",
        status: "VERIFIED",
        amount: "-$84.20",
        isIncoming: false,
        description: "AWS Cloud Services",
        note: undefined,
      },
    ],
  },
];
