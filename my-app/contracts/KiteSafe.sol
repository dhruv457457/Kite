// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title KiteSafe
 * @dev Safety layer for Kite cross-chain deposits. 
 * Verifies targets and handles emergency recovery.
 * 
 * ✅ UPDATED: Added safeDepositFor to support "send to someone else" flows
 */
contract KiteSafe is Ownable {
    
    event DepositVerified(address indexed sender, address indexed target, address indexed recipient, uint256 amount);
    event EmergencyRecovery(address indexed token, address indexed to, uint256 amount);

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Simple check to ensure the target is a contract.
     * Prevents accidental deposits to EOAs (human wallets).
     */
    function isContract(address _addr) internal view returns (bool) {
        uint32 size;
        assembly {
            size := extcodesize(_addr)
        }
        return size > 0;
    }

    /**
     * @dev A wrapper for vault deposits WHERE THE RECIPIENT IS THE SENDER.
     * LI.FI Composer calls this, which then calls the actual vault.
     * Vault shares are returned to msg.sender.
     */
    function safeDeposit(
        address _token,
        address _vault,
        uint256 _amount,
        bytes calldata _data
    ) external payable {
        require(isContract(_vault), "KiteSafe: Target is not a contract");
        require(_amount > 0, "KiteSafe: Amount must be > 0");

        // Transfer tokens from LI.FI executor to this contract
        IERC20(_token).transferFrom(msg.sender, address(this), _amount);
        
        // Approve the vault to spend tokens
        IERC20(_token).approve(_vault, _amount);

        // Execute the actual deposit call on the vault
        (bool success, ) = _vault.call(_data);
        require(success, "KiteSafe: Vault deposit failed");

        // Transfer vault shares back to msg.sender
        // Most vaults return shares as ERC20 tokens (e.g., aTokens, stETH, vault shares)
        uint256 shares = IERC20(_vault).balanceOf(address(this));
        if (shares > 0) {
            IERC20(_vault).transfer(msg.sender, shares);
        }

        emit DepositVerified(msg.sender, _vault, msg.sender, _amount);
    }

    /**
     * ✅ NEW FUNCTION: Deposit vault shares on behalf of a recipient
     * @dev This is what Kite needs for "send to someone else" flows
     * 
     * Flow:
     * 1. LI.FI bridges tokens to sender's wallet on destination chain
     * 2. LI.FI calls this function via contract call
     * 3. This contract deposits into vault
     * 4. Vault shares are transferred to the RECIPIENT (not sender)
     * 
     * @param _token The token being deposited (e.g., USDC)
     * @param _vault The vault contract address
     * @param _recipient Who should receive the vault shares
     * @param _amount Amount to deposit
     * @param _data Calldata for vault.deposit() or vault.mint()
     */
    function safeDepositFor(
        address _token,
        address _vault,
        address _recipient,
        uint256 _amount,
        bytes calldata _data
    ) external payable {
        require(isContract(_vault), "KiteSafe: Target is not a contract");
        require(_amount > 0, "KiteSafe: Amount must be > 0");
        require(_recipient != address(0), "KiteSafe: Invalid recipient");

        // Transfer tokens from LI.FI executor (msg.sender) to this contract
        IERC20(_token).transferFrom(msg.sender, address(this), _amount);
        
        // Approve the vault to spend tokens
        IERC20(_token).approve(_vault, _amount);

        // Execute the vault deposit call
        // This deposits tokens and mints vault shares to this contract
        (bool success, ) = _vault.call(_data);
        require(success, "KiteSafe: Vault deposit failed");

        // Transfer vault shares to the RECIPIENT
        // Most vaults return shares as ERC20 tokens
        uint256 shares = IERC20(_vault).balanceOf(address(this));
        require(shares > 0, "KiteSafe: No shares received");
        IERC20(_vault).transfer(_recipient, shares);

        emit DepositVerified(msg.sender, _vault, _recipient, _amount);
    }

    /**
     * @dev Emergency recovery in case tokens get stuck in this contract.
     */
    function recoverTokens(address _token, address _to, uint256 _amount) external onlyOwner {
        IERC20(_token).transfer(_to, _amount);
        emit EmergencyRecovery(_token, _to, _amount);
    }
}
