# Kite Finance

**Cross-Chain DeFi Deposits Made Simple**

Send funds to any DeFi vault across any chain in one click. Just type an ENS name.

🔗 **Live Demo:** [kite-lifi.vercel.app](https://kite-lifi.vercel.app/)

---

## 🎯 What is Kite?

Kite Finance is a cross-chain DeFi deposit aggregator that eliminates the complexity of multi-chain yield strategies. Instead of manually swapping, bridging, and depositing across multiple transactions, Kite combines everything into a single, seamless flow powered by LI.FI and ENS.

**The Problem:**
To deposit into a vault on another chain, users typically need to:
1. Swap their token to the correct asset
2. Bridge to the destination chain
3. Manually call the vault's deposit function
4. Track multiple transaction hashes across chains

**Kite's Solution:**
1. Type an ENS name (e.g., `alice.eth`)
2. Select any token from any chain
3. Click confirm
4. Done — recipient receives vault shares and starts earning yield immediately

---

## ✨ Key Features

### 🔗 ENS-Powered Routing
- **Set Once, Receive Forever:** Configure your preferred chain, token, and vault in your ENS profile
- **Named Recipients:** Send to `vitalik.eth` instead of `0x1a2b3c...`
- **Dynamic Intent:** ENS text records store your DeFi preferences, making every deposit personalized

### ⚡ LI.FI Composer Integration
- **One-Click Execution:** Swap + Bridge + Vault Deposit in a single transaction
- **Optimal Routing:** Automatically finds the best DEX and bridge combination
- **Multi-Vault Support:** Works with Aave, Morpho, Spark, and any ERC-4626 vault
- **Cross-Chain Native:** Supports Ethereum, Base, Arbitrum, and Polygon

### 💎 Superior UX
- **Live Route Preview:** See the exact swap → bridge → deposit pipeline before execution
- **Real-Time Progress:** Step-by-step transaction tracking with live status updates
- **Gas Estimation:** Transparent cost breakdown per step
- **Error Recovery:** Clear error messages with actionable solutions

---

## 🏗️ How It Works

### For Senders

```
1. Search ENS Name
   └─ Type "alex.eth" → Kite reads ENS text records

2. Kite Fetches Preferences
   └─ Chain: Arbitrum
   └─ Token: USDC  
   └─ Vault: 0x1a2b... (Aave USDC Vault)

3. Select Your Token
   └─ Pick any token from any chain in your wallet
   └─ Example: 0.5 ETH on Ethereum

4. Get Route (Powered by LI.FI)
   └─ LI.FI finds optimal path:
       • Swap ETH → USDC (Uniswap V3)
       • Bridge Ethereum → Arbitrum (Stargate)
       • Deposit USDC → Aave Vault (Contract Call)
   └─ Shows: Gas ($0.42), Time (~30s), Output (490.2 USDC)

5. Confirm & Execute
   └─ One signature
   └─ LI.FI SDK handles everything:
       • Token approval
       • Swap execution
       • Bridge initiation
       • Vault deposit
   └─ Real-time progress for each step

6. Receipt
   └─ Transaction hashes for each step
   └─ Vault shares received
   └─ Final yield APY shown
```

### For Recipients (One-Time Setup)

```
1. Connect Wallet
   └─ Must own an ENS name

2. Configure Preferences
   └─ Preferred Chain: Base
   └─ Preferred Token: USDC
   └─ Deposit Target: 0x7BfA... (Spark Vault)

3. Save to ENS
   └─ Writes to ENS text records:
       • kite.preferred_chain
       • kite.preferred_token  
       • kite.deposit_target

4. Done!
   └─ Anyone can now send to your ENS name
   └─ Funds automatically deposit into your configured vault
```

---

## 🔧 Technical Architecture

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), TypeScript, React |
| Styling | Tailwind CSS |
| Blockchain | Wagmi v2, Viem |
| Wallet | RainbowKit |
| ENS Integration | Wagmi ENS hooks (read/write text records) |
| Cross-Chain Routing | LI.FI SDK + API |
| Deployment | Vercel |

### System Architecture

```
┌─────────────────────────────────────────────────────┐
│                 Kite Frontend (Next.js)              │
│                                                      │
│  ┌──────────┐   ┌─────────────┐   ┌──────────────┐ │
│  │   ENS    │──▶│   LI.FI     │──▶│   Execution  │ │
│  │  Lookup  │   │   Router    │   │   & Monitor  │ │
│  └──────────┘   └─────────────┘   └──────────────┘ │
└─────────┬────────────────┬─────────────────┬────────┘
          │                │                 │
          ▼                ▼                 ▼
┌──────────────┐  ┌─────────────┐  ┌─────────────────┐
│ ENS Registry │  │  LI.FI API  │  │   LI.FI SDK     │
│  (Mainnet)   │  │             │  │                 │
│  Text Records│  │  • getQuote │  │ • executeRoute  │
│  • Read/Write│  │  • getRoutes│  │ • Status hooks  │
└──────────────┘  └─────────────┘  └─────────────────┘
          │                │                 │
          └────────────────┴─────────────────┘
                           │
          ┌────────────────┴─────────────────┐
          │                                   │
          ▼                                   ▼
┌──────────────────┐              ┌──────────────────┐
│  Source Chain    │              │ Destination Chain│
│  (e.g. Ethereum) │              │  (e.g. Base)     │
│                  │              │                  │
│  • DEX Swap      │─────────────▶│  • Vault Deposit │
│  • Bridge Out    │   Stargate   │  • Yield Earning │
└──────────────────┘              └──────────────────┘
```

### ENS Integration

Kite uses ENS text records as the configuration layer:

| ENS Text Record | Example Value | Purpose |
|----------------|---------------|---------|
| `kite.preferred_chain` | `base` | Destination blockchain |
| `kite.preferred_token` | `USDC` | Token the vault accepts |
| `kite.deposit_target` | `0x7BfA7C4f149E7415b73bdeDfe609237e29CBF34A` | Vault contract address |

**Reading:**
```typescript
// Fetch recipient preferences
const { data: preferredChain } = useEnsText({
  name: 'alice.eth',
  key: 'kite.preferred_chain',
  chainId: mainnet.id,
});
```

**Writing:**
```typescript
// Save user preferences
await setKiteProfile(
  'base',           // preferred chain
  'USDC',           // preferred token
  '0x7BfA...'       // vault address
);
```

### LI.FI Composer Integration

Kite leverages LI.FI's Composer mode to chain multiple actions into one transaction:

**Route Request:**
```typescript
const step = await getQuote({
  fromChain: 1,                    // Ethereum
  fromToken: '0x000...',          // ETH
  toChain: 8453,                   // Base
  toToken: '0x833...',            // USDC on Base
  fromAmount: '500000000000000000', // 0.5 ETH
  fromAddress: userWallet,
  toAddress: vaultAddress,         // Triggers Composer
  slippage: 0.005,
  integrator: 'kite-finance',
});
```

**Route Execution:**
```typescript
await executeRoute(route, {
  updateRouteHook: (updatedRoute) => {
    // Real-time progress updates
    // Step 1: Swap executing...
    // Step 2: Bridge pending...
    // Step 3: Vault deposit confirmed!
  },
  acceptExchangeRateUpdateHook: async (update) => {
    // Handle slippage changes
    return confirm(`Accept ${update.percentChange}% change?`);
  },
});
```

**What Composer Enables:**
- **Single Signature:** User approves once, LI.FI handles the rest
- **Automatic Bridging:** Monitors bridge status until confirmed
- **Contract Calls:** Final step deposits into vault, not just transfers tokens
- **Error Recovery:** Each step is independently tracked and can be retried

---

## 🎨 User Interface

### Home Page
- ENS search bar (primary entry point)
- Supported protocols showcase (Aave, Morpho, Spark)
- Supported chains (Ethereum, Base, Arbitrum, Polygon)
- How it works explainer

### Profile Card
- Displays recipient's preferences
- Shows configured vault and APY
- Visual chain/token indicators
- Send button to initiate flow

### Swap Flow (4 Steps)

**Step 1: Select Token**
- Token selector showing balances across all chains
- Live balance updates
- Chain indicators

**Step 2: Get Route**
- LI.FI route fetching with loading state
- Route visualization:
  - Swap step (DEX name, input/output)
  - Bridge step (bridge protocol, chains)
  - Deposit step (vault name, shares received)
- Gas breakdown per step
- Total estimated time
- Best route auto-selected

**Step 3: Confirm Transaction**
- Full route preview
- Slippage tolerance setting
- Gas cost summary
- Execute button

**Step 4: Receipt**
- Per-step transaction hashes
- Vault shares received
- APY information
- Blockchain explorer links
- Start over button

### My Profile
- Two-column layout
- Left: Configuration form
  - Chain selector (visual buttons)
  - Token input
  - Advanced: Vault address input
- Right: Live preview
  - Shows how others see your profile
  - Updates in real-time as you type

---

## 📁 Project Structure

```
kite-finance/
├── Root Configuration (13 files)
│   ├── .env.local
│   ├── .eslintrc.json
│   ├── .gitignore
│   ├── next.config.js
│   ├── package.json
│   ├── package-lock.json
│   ├── postcss.config.js
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── README.md
│   ├── LICENSE
│   └── vercel.json
│
├── app/ (Application Routes)
│   ├── layout.tsx
│   ├── page.tsx (Home)
│   ├── Providers.tsx
│   ├── globals.css
│   │
│   ├── api/
│   │   └── tokens/
│   │       └── balances/
│   │           └── route.ts
│   │
│   ├── history/
│   │   └── page.tsx
│   │
│   ├── profile/
│   │   └── page.tsx
│   │
│   └── send/
│       └── [ensname]/
│           └── page.tsx
│
├── components/ (UI Components)
│   ├── animations/
│   │   └── KiteBackground.tsx
│   │
│   ├── home/
│   │   ├── ENSSearch.tsx
│   │   ├── RecentActivity.tsx
│   │   └── WalletInfo.tsx
│   │
│   ├── layout/
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   │
│   ├── profile/
│   │   ├── ENSProfileCard.tsx
│   │   └── ProfileSetup.tsx
│   │
│   ├── providers/
│   │   ├── ToastProvider.tsx
│   │   └── WagmiProvider.tsx
│   │
│   ├── swap/
│   │   ├── AmountInput.tsx
│   │   ├── ConfirmTransaction.tsx
│   │   ├── RouteDisplay.tsx
│   │   ├── SwapFlow.tsx
│   │   ├── TokenSelectorInline.tsx
│   │   └── TransactionReceipt.tsx
│   │
│   └── ui/
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Input.tsx
│       ├── LoadingSpinner.tsx
│       ├── Modal.tsx
│       └── Toast.tsx
│
├── hooks/ (Custom React Hooks)
│   ├── useBlockchainHistory.ts
│   ├── useENSProfile.tsx
│   ├── useENSWrite.tsx
│   ├── useLifiExecute.tsx
│   ├── useLifiRoute.tsx
│   ├── useTokenBalance.tsx
│   ├── useTokenPrice.tsx
│   └── useTransactionHistory.ts
│
├── lib/ (Utilities & Configuration)
│   ├── chains/
│   │   ├── chainConfig.ts
│   │   └── supportedChains.ts
│   │
│   ├── contracts/
│   │   ├── erc20.ts
│   │   └── vault.ts
│   │
│   ├── ens/
│   │   └── textRecords.ts
│   │
│   ├── lifi/
│   │   ├── config.ts
│   │   └── types.ts
│   │
│   ├── transaction/
│   │   └── formatters.ts
│   │
│   ├── utils/
│   │   ├── formatters.ts
│   │   └── validators.ts
│   │
│   └── vaults/
│       └── isValidVault.ts
│
├── types/ (TypeScript Type Definitions)
│   ├── chain.ts
│   ├── ens.ts
│   ├── token.ts
│   └── transaction.ts
│
├── contracts/ (Smart Contract ABIs)
│   ├── ERC20.json
│   └── Vault.json
│
└── public/ (Static Assets)
    ├── favicon.ico
    ├── logo.svg
    └── images/
        ├── chains/
        │   ├── ethereum.svg
        │   ├── base.svg
        │   ├── arbitrum.svg
        │   └── polygon.svg
        └── tokens/
            ├── eth.svg
            ├── usdc.svg
            └── dai.svg
```

**Total File Count:** ~80 TypeScript/React files

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Wallet with ETH for gas
- ENS name (for receiving)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/kite-finance.git
cd kite-finance

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your API keys (see below)

# Run development server
npm run dev

# Open http://localhost:3000
```

### Environment Variables

```env
# WalletConnect (Required)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id

# Alchemy API Keys (Required for token balances)
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_key

# Block Explorers (Required for transaction history)
NEXT_PUBLIC_ETHERSCAN_API_KEY=your_etherscan_key
NEXT_PUBLIC_BASESCAN_API_KEY=your_basescan_key
NEXT_PUBLIC_ARBISCAN_API_KEY=your_arbiscan_key
NEXT_PUBLIC_POLYGONSCAN_API_KEY=your_polygonscan_key
```

---

## 📊 Supported Assets

### Chains
- **Ethereum** (Chain ID: 1)
- **Base** (Chain ID: 8453)
- **Arbitrum** (Chain ID: 42161)
- **Polygon** (Chain ID: 137)

### Tokens (Per Chain)
- **Ethereum:** ETH, USDC, DAI, WETH
- **Base:** ETH, USDC, DAI
- **Arbitrum:** ETH, USDC, DAI
- **Polygon:** MATIC, USDC, DAI

### Vaults
- **Aave V3** (all chains)
- **Morpho** (Ethereum, Base)
- **Spark Protocol** (Ethereum, Base)
- **Any ERC-4626 Vault** (custom addresses)

---

## 🔐 Security Considerations

- **ENS Text Records:** Public and readable by anyone, but only writable by the ENS owner
- **Vault Validation:** Optional on-chain validation to ensure deposit target is a valid vault
- **Slippage Protection:** Configurable slippage tolerance with warnings for large changes
- **Transaction Simulation:** LI.FI simulates routes before execution
- **Infinite Approval:** Disabled by default for security
- **Error Handling:** Graceful failures with clear user messaging

---

## 🛠️ Development

### Key Files

- **`hooks/useLifiRoute.tsx`**: Fetches optimal routes using LI.FI API, handles vault deposits via `getQuote()`
- **`hooks/useLifiExecute.tsx`**: Executes routes using LI.FI SDK, tracks progress per step
- **`hooks/useENSProfile.tsx`**: Reads ENS text records to fetch recipient preferences
- **`hooks/useENSWrite.tsx`**: Writes preferences to ENS text records (multicall)
- **`components/swap/SwapFlow.tsx`**: Main orchestration component for the send flow
- **`lib/lifi/types.ts`**: TypeScript types and route formatting utilities

### Testing

```bash
# Run type checks
npm run type-check

# Run linter
npm run lint

# Build for production
npm run build
```

### Deployment

```bash
# Deploy to Vercel
vercel

# Or push to main branch (auto-deploys if connected)
git push origin main
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style
- TypeScript for all code
- ESLint + Prettier for formatting
- Functional components with hooks
- Descriptive variable names
- Comments for complex logic

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **LI.FI** for providing the cross-chain execution infrastructure
- **ENS** for enabling human-readable blockchain addresses and custom text records
- **Wagmi** for the excellent React hooks for Ethereum
- **Vercel** for hosting and deployment

---

## 📞 Contact

- **Website:** [kite-lifi.vercel.app](https://kite-lifi.vercel.app/)



---

**Built with ❤️ for the cross-chain DeFi future**

*Kite Finance — Send value to anyone, anywhere. Just type a name.*