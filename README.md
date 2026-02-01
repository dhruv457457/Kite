# Kite
### ENS-Powered Cross-Chain Swap & Deposit Hub

---

## 1. Project Overview

Kite is a unified DeFi interface that lets users send, swap, and deposit tokens to anyone across any EVM chain — just by typing an ENS name. It removes the friction of cross-chain DeFi by combining two layers:

- **ENS** handles identity, preferences, and routing metadata (where the money should go)
- **LI.FI** handles execution, routing, and orchestration (how the money gets there)

A user types `alex.eth`, selects a token from their wallet, enters an amount, and Kite does the rest — swap, bridge, and deposit into the recipient's configured vault — all in one transaction with one signature.

---

## 2. The Problem We Solve

Cross-chain DeFi today is broken for most users. To deposit into a vault on another chain, a user must:

1. Figure out which chain the vault lives on
2. Figure out which token the vault accepts
3. Manually swap their token into the right one
4. Manually bridge to the correct chain
5. Manually call the deposit function
6. Do all of this while knowing the recipient's 0x address

Kite collapses all five steps into one action. The recipient sets up their preferences once via ENS text records. The sender just needs to know a name.

---

## 3. Prize Track Alignment

### Primary: 🥇 Best Use of LI.FI Composer in DeFi — $2,500

Kite directly hits the example: **"Cross-chain deposit into a vault"** and **"Deposit from any chain into a single restaking or yield strategy."**

Our core flow is exactly this. The user picks any token on any chain. LI.FI Composer orchestrates the entire multi-step workflow — swap + bridge + contract call (vault deposit) — in a single user-facing action. The destination vault, chain, and token are all read dynamically from the recipient's ENS profile, making every execution path unique and data-driven.

This satisfies all qualification requirements:
- Uses LI.FI SDK/API for cross-chain actions (swap + bridge + contract call)
- Supports multiple EVM chains (Ethereum, Arbitrum, Base, Polygon)
- Ships a working frontend a judge can click through

### Secondary: 🥇 Most Creative Use of ENS for DeFi — $1,500

ENS is not a label here — it is the routing engine. ENS text records store:
- The recipient's preferred receiving chain
- The recipient's preferred token
- The recipient's deposit target (vault, LP pool, restaking contract)

This makes ENS the configuration and intent layer that drives what LI.FI executes. Without ENS, Kite is just a generic swap UI. With ENS, it becomes a personalized, intent-driven deposit system.

### Tertiary: 🎉 Integrate ENS — $3,500 (pool prize)

Custom ENS resolution using wagmi hooks to read and write text records. Not a simple name lookup — full read/write of structured DeFi preferences.

### Tertiary: 🥉 Best LI.FI-Powered DeFi Integration — $1,500

Solves a concrete user problem (cross-chain deposits to named recipients) with a production-ready integration that handles slippage, gas estimation, error states, and route visualization.

---

## 4. How It Works — User Flow

### Sender Side

```
1. Open Kite
2. Type an ENS name (e.g. alex.eth)
3. Kite reads alex.eth's ENS text records:
       preferred_chain  →  Arbitrum
       preferred_token  →  USDC
       deposit_target   →  0x1a2b...  (Aave Vault)
4. Sender selects a token from their wallet (e.g. ETH on Ethereum)
5. Sender enters an amount (e.g. 0.5 ETH)
6. Kite calls LI.FI to get the best route:
       Swap ETH → USDC on Ethereum
       Bridge USDC from Ethereum → Arbitrum
       Deposit USDC into Aave Vault (0x1a2b...)
7. Sender reviews the route (gas, slippage, time, steps)
8. Sender confirms with one signature
9. LI.FI executes the full pipeline
10. Kite shows a receipt with tx hash
```

### Recipient Side (Setup — Done Once)

```
1. Open Kite → My Profile
2. Connect wallet with ENS name
3. Set preferences:
       Preferred Chain     →  Arbitrum
       Preferred Token     →  USDC
       Deposit Target      →  0x1a2b... (paste vault address)
4. Save (writes to ENS text records)
5. Now anyone can deposit to you cross-chain by typing your ENS name
```

---

## 5. Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Kite UI                        │
│                                                         │
│  ┌──────────┐    ┌──────────────┐    ┌────────────────┐ │
│  │ ENS      │    │  Route       │    │  Execute &     │ │
│  │ Lookup   │───▶│  Builder     │───▶│  Confirm       │ │
│  │          │    │              │    │                │ │
│  └──────────┘    └──────────────┘    └────────────────┘ │
│       │                │                     │           │
└───────┼────────────────┼─────────────────────┼───────────┘
        │                │                     │
        ▼                ▼                     ▼
┌──────────────┐  ┌─────────────┐   ┌──────────────────┐
│  ENS Layer   │  │  LI.FI API  │   │  LI.FI SDK       │
│              │  │             │   │                  │
│ Read/Write   │  │ Get Quotes  │   │ Execute Route    │
│ Text Records │  │ Get Routes  │   │ Swap+Bridge+Call │
│              │  │             │   │                  │
└──────────────┘  └─────────────┘   └──────────────────┘
        │                │                     │
        ▼                ▼                     ▼
┌──────────────────────────────────────────────────────┐
│           EVM Chains (Ethereum, Arbitrum,            │
│                      Base, Polygon)                   │
│                                                      │
│  ENS Contracts   │  DEXs  │  Bridges  │  Vaults     │
└──────────────────────────────────────────────────────┘
```

### ENS Layer
- Reads text records from ENS names to extract recipient preferences
- Writes text records when a user sets up their own profile
- Uses wagmi hooks for resolution (not just RainbowKit name display)
- Text record keys: `kite.preferred_chain`, `kite.preferred_token`, `kite.deposit_target`

### LI.FI Layer
- Calls LI.FI API to get optimal routes based on source token/chain and destination token/chain/contract
- Uses LI.FI SDK to execute the full route (swap + bridge + contract call) in one flow
- Displays the route pipeline visually so users understand exactly what will happen
- Handles gas estimation, slippage settings, and error states

---

## 6. Tech Stack

| Layer | Technology |
|---|---|
| Frontend Framework | React + Next.js |
| Styling | Tailwind CSS |
| Blockchain Interaction | wagmi + viem |
| Wallet Connection | RainbowKit |
| ENS Resolution | wagmi ENS hooks + ethers ENS resolver |
| Cross-Chain Execution | LI.FI SDK + LI.FI API |
| Hosting | Vercel |

---

## 7. ENS Text Records Structure

Each Kite user stores their DeFi preferences as ENS text records:

| Record Key | Example Value | Purpose |
|---|---|---|
| `kite.preferred_chain` | `arbitrum` | The chain where deposits should land |
| `kite.preferred_token` | `USDC` | The token the vault accepts |
| `kite.deposit_target` | `0x1a2b3c...` | The vault/pool/restaking contract address |

These are read by anyone looking up that ENS name. They are written only by the ENS name owner via the My Profile page.

---

## 8. LI.FI Integration Details

### Route Request

When a user selects a source token and the system has read the recipient's ENS preferences, Kite calls the LI.FI API:

```
Input:
  fromChain:   Ethereum (1)
  fromToken:   ETH (0x0000...)
  toChain:     Arbitrum (42161)
  toToken:     USDC (0xa0b8...)
  fromAmount:  0.5 ETH
  toAddress:   0x1a2b... (vault from ENS)

Output:
  Route steps:  [Swap, Bridge, Deposit]
  Gas estimate: $0.42
  Slippage:     0.5%
  Time:         ~30 seconds
```

### Route Execution

The LI.FI SDK executes the entire route as a single orchestrated flow. The user signs once. The SDK handles:
- Approvals
- Swap execution on source chain
- Bridge initiation and monitoring
- Contract call (vault deposit) on destination chain

### What Makes This "Composer"

LI.FI Composer is specifically about orchestrating multi-step DeFi workflows. Kite uses it because every route is multi-step by design:
- It is never just a swap
- It is never just a bridge
- It always ends with a contract call (deposit into vault/LP/restaking)

This is the exact pattern LI.FI Composer is built for.

---

## 9. Screens & Pages

### Home / Dashboard
- Search bar for ENS names (the main entry point)
- Connected wallet info showing balances across chains
- Recent activity feed showing past transactions

### ENS Profile Card
- Appears after searching a name
- Shows the recipient's preferred chain, token, and vault
- Entry point to the Send & Swap flow

### Send & Swap Flow
- Step 1: Pick your token (shows wallet balances)
- Step 2: Enter amount (validates against balance)
- Step 3: Get Route (calls LI.FI, shows pipeline visualization)
- Step 4: Confirm & Execute (one signature, live progress, receipt)

### My Profile
- Set your own ENS text records
- Live preview of how others see your profile
- Save triggers ENS text record write

### History
- List of all past transactions
- Status indicators (completed, pending, failed)
- Full details per transaction (route taken, amounts, timestamps)

---

## 10. Prototype (Mock) Spec

For the prototype / Replit build, all blockchain interactions are mocked:

### Mock ENS Profiles
- `alex.eth` — Arbitrum, USDC, Aave Vault
- `maya.eth` — Base, ETH, no vault
- `jake.eth` — Polygon, USDT, Uniswap LP Pool
- `sarah.eth` — Ethereum, WETH, Lido Restake

### Mock Wallet
- Connected as `myname.eth` (0x9Abc...)
- Balances: 2.5 ETH (Ethereum), 450 USDC (Arbitrum), 1200 MATIC (Polygon), 100 USDT (Base)

### Mock LI.FI Route
- 1.5 second loading delay (simulates API call)
- Returns route steps, gas ($0.42–$1.80), slippage (0.5%), time (12–45s)
- Execution animates each step lighting up sequentially

### Mock Transaction Receipt
- Fake tx hash (0xabc123...)
- Full summary: from, to, route, amount, time

---

## 11. What Makes Kite Stand Out

Most cross-chain DeFi tools treat the problem as "how do I move token A to chain B." Kite reframes it as "how do I send value to a person." That shift puts ENS at the center — not as a nice-to-have label, but as the actual routing and intent layer. LI.FI then becomes the execution engine that fulfills that intent.

The result is something that feels less like a DeFi protocol and more like a payment app — type a name, send value, done. But under the hood, it is orchestrating multi-step cross-chain DeFi workflows via LI.FI Composer, and storing structured intent via ENS text records.

---

## 12. Submission Checklist

- [ ] Working frontend (web) that judges can click through
- [ ] Full Send & Swap flow end to end (ENS lookup → route → execute → receipt)
- [ ] My Profile page (ENS text record setup)
- [ ] At least 2 EVM chains in the user journey
- [ ] LI.FI SDK/API used for cross-chain actions
- [ ] ENS text records used for DeFi preferences (not just name display)
- [ ] GitHub repository with all code (open source)
- [ ] Video demo walkthrough of the full project

---

*Kite — Send value to anyone. Just type a name.*
