# Kite
### LI.FI & ENS-Powered Cross-Chain Swap & Deposit Hub

---

## 1. Project Overview

Kite is a unified DeFi interface powered by LI.FI and ENS that lets users send, swap, bridge, and deposit tokens into DeFi vaults on any EVM chain — just by typing a name. It uses LI.FI Composer to orchestrate multi-step cross-chain workflows (swap + bridge + vault deposit) and ENS to store where and how each recipient wants to receive funds. It removes the friction of cross-chain DeFi by combining two layers:

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
1.  Open Kite
2.  Type an ENS name (e.g. alex.eth)
3.  Kite reads alex.eth's ENS text records:
        preferred_chain  →  Arbitrum
        preferred_token  →  USDC
        deposit_target   →  0x1a2b...  (Aave Vault)
4.  Sender selects a token from their wallet (e.g. ETH on Ethereum)
5.  Sender enters an amount (e.g. 0.5 ETH)
6.  Kite calls LI.FI API to find the best route:
        LI.FI picks: Uniswap V3 for the swap, Stargate for the bridge
        Route: Swap ETH → USDC on Ethereum
               Bridge USDC from Ethereum → Arbitrum via Stargate
               Deposit USDC into Aave Vault (0x1a2b...) via contract call
7.  Kite displays the full route pipeline to the sender:
        [Swap - Uniswap V3] → [Bridge - Stargate] → [Deposit - Aave Vault]
        Gas: $0.42 | Slippage: 0.5% | Time: ~30s | Output: 490.2 USDC
8.  Sender confirms with one signature
9.  LI.FI SDK executes the full pipeline automatically:
        Approve → Swap → Bridge (polling until confirmed) → Vault Deposit
10. Kite shows receipt with per-step tx hashes and final vault shares received
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

### LI.FI Layer (Primary Execution Engine)
Kite is built around LI.FI. Every core action in the app — swap, bridge, deposit — runs through LI.FI. This is not an optional add-on; LI.FI is the backbone that makes cross-chain execution possible.

- **Route Discovery:** Kite calls the LI.FI API (`/v1/advanced/routes`) with the source token, source chain, destination token, destination chain, and the vault contract address as the final `toAddress`. LI.FI returns the optimal path across available DEXs and bridges automatically.
- **Route Execution:** The LI.FI SDK takes the selected route and executes it end-to-end. It handles token approvals, swap calls, bridge initiation, bridge status polling, and the final contract call (vault deposit) — all without the user needing to sign multiple times.
- **Multi-Step Orchestration (Composer):** Every route in Kite is a Composer-style workflow. It is never a single swap or a single bridge. It is always a pipeline: swap on source chain → bridge to destination chain → deposit into a DeFi contract. This is exactly what LI.FI Composer is designed for.
- **Route Visualization:** Kite surfaces the full route pipeline to the user before execution — each step (swap, bridge, deposit), the DEX or bridge used, gas cost per step, and the expected output amount. This builds trust and transparency.
- **Error Handling & Monitoring:** LI.FI SDK provides real-time status updates for each step. Kite listens to these events and updates the UI accordingly — showing progress, catching failures, and letting users know if a bridge is still pending.

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

LI.FI is the core execution layer of Kite. This section covers exactly how it is integrated and why.

### 8.1 Why LI.FI

LI.FI is not just a bridge aggregator. It is a full cross-chain execution layer that can:
- Find the best swap route across multiple DEXs on any chain
- Find the best bridge between any two EVM chains
- Chain these together with a contract call at the end (Composer)
- Execute the entire pipeline with a single user signature

No other single integration can do swap + bridge + contract call in one flow. That is what makes it the right fit for Kite.

### 8.2 Route Request

When a user selects a source token and the system has read the recipient's ENS preferences, Kite calls the LI.FI API:

```
POST /v1/advanced/routes

Input:
  fromChain:      Ethereum (1)
  fromToken:      ETH (0x0000...)
  toChain:        Arbitrum (42161)
  toToken:        USDC (0xa0b8...)
  fromAmount:     0.5 ETH
  toAddress:      0x1a2b... (vault address from ENS)
  destination:    CONTRACT_CALL (triggers Composer mode)

Output:
  Route steps:    [Swap ETH→USDC, Bridge Ethereum→Arbitrum, Deposit into Vault]
  DEX used:       Uniswap V3 (source chain swap)
  Bridge used:    Stargate (cross-chain transfer)
  Gas estimate:   $0.42 (total across all steps)
  Slippage:       0.5%
  Estimated time: ~30 seconds
  Output amount:  490.2 USDC (after fees and slippage)
```

LI.FI automatically picks the best DEX and bridge combination. Kite does not need to hardcode or manage any of this.

### 8.3 Supported Chains & Bridges

Kite leverages the full LI.FI network. Supported chains in the Kite prototype include:

| Chain | Chain ID | Role in Kite |
|---|---|---|
| Ethereum Mainnet | 1 | Source chain, ENS resolution |
| Arbitrum One | 42161 | Destination (Aave Vault) |
| Base | 8453 | Destination (Maya's profile) |
| Polygon | 137 | Source + Destination (Jake's LP Pool) |

LI.FI routes across bridges like Stargate, Hop, and others automatically based on speed, cost, and reliability. Kite does not pick bridges manually — LI.FI handles that entirely.

### 8.4 Route Execution (SDK)

The LI.FI SDK takes the route returned by the API and executes it step by step:

```
Step 1 — Approve
  └─ SDK submits ERC20 approval for the source token (if needed)

Step 2 — Swap
  └─ SDK calls the DEX (e.g. Uniswap V3) on the source chain
  └─ ETH is swapped into USDC on Ethereum

Step 3 — Bridge
  └─ SDK initiates the bridge (e.g. Stargate)
  └─ USDC is sent from Ethereum to Arbitrum
  └─ SDK polls bridge status until confirmed

Step 4 — Contract Call (Composer)
  └─ SDK calls the vault deposit function on Arbitrum
  └─ USDC is deposited into the Aave Vault at 0x1a2b...
  └─ User now holds vault shares on Arbitrum
```

The user signs once at Step 1. Everything after that is handled by the SDK and the on-chain contracts. Kite listens to SDK status events and updates the UI in real time at each step.

### 8.5 What Makes This "Composer"

LI.FI Composer is specifically the feature that allows a route to end with a contract call — not just a token transfer. This is critical for Kite because the goal is never just to move tokens. The goal is to deposit them into a DeFi position.

Without Composer, a cross-chain route would end with USDC sitting in the user's wallet on Arbitrum. The user would then have to manually call the vault's deposit function themselves. Composer removes that last step and makes it part of the automated pipeline.

In Kite, every single route uses Composer because every recipient has a `deposit_target` configured via ENS. The contract call is not optional — it is the entire point.

### 8.6 Error Handling & Edge Cases

Kite handles the following failure scenarios via LI.FI SDK status events:

| Scenario | How Kite Handles It |
|---|---|
| Swap slippage too high | Shows warning before execution; user can adjust slippage tolerance |
| Bridge timeout | UI shows "Bridge pending" state; user can check status later via History |
| Insufficient gas | Detected before execution; error shown with estimated gas needed |
| Vault deposit reverts | UI shows failure with reason; tokens remain on destination chain (user can manually recover) |
| Route no longer valid | Re-fetches route automatically; shows updated quote to user |

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
- Step 1: Pick your token (shows wallet balances across all chains)
- Step 2: Enter amount (validates against balance, shows live output estimate)
- Step 3: Get Route — this is where LI.FI does the heavy lifting:
  - Calls LI.FI API to find the optimal swap + bridge + deposit path
  - Displays the full route pipeline visually: which DEX, which bridge, which vault
  - Shows gas cost breakdown per step, total slippage, and expected output
  - User can see exactly what LI.FI will execute before they commit
- Step 4: Confirm & Execute — powered entirely by LI.FI SDK:
  - One signature from the user
  - LI.FI SDK runs the full pipeline (approve → swap → bridge → deposit)
  - Each step lights up in real time as it completes
  - Final receipt shows output amount, vault shares received, and tx hashes for every step

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
- 1.5 second loading delay (simulates LI.FI API call)
- Returns a full route card with:
  - Route steps shown as a visual pipeline: [Swap] → [Bridge] → [Deposit]
  - Which DEX is used for the swap (e.g. Uniswap V3)
  - Which bridge is used (e.g. Stargate)
  - Gas cost breakdown per step
  - Total slippage (0.5%) and estimated output amount
  - Estimated time (12–45s)
- On execution: each step in the pipeline lights up one by one with a 1-second delay
- Shows per-step tx hashes in the receipt (all fake)

### Mock Transaction Receipt
- Fake tx hash (0xabc123...)
- Full summary: from, to, route, amount, time

---

## 11. What Makes Kite Stand Out

Most cross-chain DeFi tools treat the problem as "how do I move token A to chain B." Kite reframes it as "how do I send value to a person." That shift puts ENS at the center — not as a nice-to-have label, but as the actual routing and intent layer. LI.FI then becomes the execution engine that fulfills that intent.

The result is something that feels less like a DeFi protocol and more like a payment app — type a name, send value, done. But under the hood, it is orchestrating multi-step cross-chain DeFi workflows via LI.FI Composer, and storing structured intent via ENS text records.

On the LI.FI side specifically, what sets Kite apart is that it uses LI.FI Composer to its fullest potential. Most integrations use LI.FI for a simple swap or a simple bridge. Kite uses it for the full three-step pipeline — swap, bridge, and contract call — every single time. The contract call is not an edge case; it is the default. Every route ends with a vault deposit, LP provision, or restaking action. That is the core of what LI.FI Composer enables, and Kite is built entirely around it.

Additionally, Kite does not hardcode routes or destinations. The destination is always read dynamically from ENS. This means LI.FI is asked to solve a different routing problem every time — different source token, different source chain, different destination chain, different vault contract. LI.FI's ability to automatically find the best DEX and bridge combination for any given input/output pair is what makes this dynamic routing possible at scale.

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
