const { ethers } = require("hardhat");

async function main() {
  console.log("💰 Funding VRF Subscription with ARB FLOW...");

  const [deployer] = await ethers.getSigners();
  console.log("Using account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "FLOW");

  const subscriptionId = "453";
  const vrfCoordinatorAddress = "0x50d47e4142598E3411aA864e08a44284e471AC6f";

  try {
    const vrfCoordinatorABI = [
      "function fundSubscriptionWithNative(uint64 subId) external payable",
      "function getSubscription(uint64 subId) external view returns (uint96 balance, uint64 reqCount, address owner, address[] memory consumers)"
    ];
    
    const vrfCoordinator = new ethers.Contract(vrfCoordinatorAddress, vrfCoordinatorABI, deployer);
    
    console.log("\n📋 VRF Coordinator Address:", vrfCoordinatorAddress);
    console.log("📝 Subscription ID:", subscriptionId);
    
    // Check current balance
    const subscription = await vrfCoordinator.getSubscription(subscriptionId);
    console.log("💰 Current Balance:", ethers.formatEther(subscription.balance), "FLOW");
    
    // Fund subscription with 0.01 ARB FLOW
    console.log("\n💰 Funding subscription with 0.01 ARB FLOW...");
    const fundAmount = ethers.parseEther("0.01");
    
    const fundTx = await vrfCoordinator.fundSubscriptionWithNative(subscriptionId, {
      value: fundAmount
    });
    console.log("Transaction hash:", fundTx.hash);
    await fundTx.wait();
    console.log("✅ Subscription funded with 0.01 ARB FLOW!");
    
    // Check updated balance
    const updatedSubscription = await vrfCoordinator.getSubscription(subscriptionId);
    console.log("💰 Updated Balance:", ethers.formatEther(updatedSubscription.balance), "FLOW");
    
    console.log("\n🎉 VRF Subscription Funding Complete!");
    console.log("=====================================");
    console.log("Subscription ID:", subscriptionId);
    console.log("Balance:", ethers.formatEther(updatedSubscription.balance), "ARB FLOW");
    console.log("=====================================");
    
  } catch (error) {
    console.error("❌ Error funding subscription:", error.message);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});


