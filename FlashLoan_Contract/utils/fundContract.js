const { network, ethers } = require("hardhat");

const fundToken = async (contract, sender, recepient, amount) => {
  const FUND_AMOUNT = ethers.parseUnits(amount, 18);
  console.log("FUND: -", Number(FUND_AMOUNT))

  // fund erc20 token to the contract
  const whale = await ethers.getSigner(sender); // Retrieves the Ethereum signer object for the sender address. This allows the code to interact with the blockchain on behalf of the sender.

  const contractSigner = contract.connect(whale); // Connects the contract instance to the whale signer, enabling the contract to execute transactions using the whale's permissions.

  await contractSigner.transfer(recepient, FUND_AMOUNT); // Transfers FUND_AMOUNT tokens from the whale account to the recipient using the connected contract instance.
};

const fundContract = async (contract, sender, recepient, amount) => {
  await network.provider.request({
    method: "hardhat_impersonateAccount",  // Kisi account pr apka temporarily control hona 
    params: [sender],
  });

  // fund baseToken to the contract
  await fundToken(contract, sender, recepient, amount);
  await network.provider.request({
    method: "hardhat_stopImpersonatingAccount",
    params: [sender],
  });
};

module.exports = {
    fundContract: fundContract,
};