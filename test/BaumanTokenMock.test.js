const BaumanToken = artifacts.require("BaumanToken");
const truffleAssert = require('truffle-assertions');

contract('BaumanToken', (accounts) => {
  it("By default owner's account have zero balance", async () => {
    const BaumanTokenInstance = await BaumanToken.deployed();
    const balance = await BaumanTokenInstance.balanceOf.call(accounts[0]);

    assert.equal(balance.valueOf(), 0, "0 wasn't in the owner's account");
  });

  it("accounts[0] should be the owner account", async () => {
    const BaumanTokenInstance = await BaumanToken.deployed();
    const isOwner = await BaumanTokenInstance.isOwner.call();

    assert.equal(isOwner, true, "accounts[0] is not owner account");
  });

  it("Minted 100 BMC to owner's account", async () => {
    const BaumanTokenInstance = await BaumanToken.deployed();
    const amount = 100;
    await BaumanTokenInstance.mint.sendTransaction(accounts[0], amount, {from : accounts[0]});

    const balanceOfOwner = await BaumanTokenInstance.balanceOf.call(accounts[0]);
    assert.equal(balanceOfOwner.valueOf(), amount, "Owner's account should have 100 BMC");
  });

  it("Only owner can minting to another account", async () => {
    const BaumanTokenInstance = await BaumanToken.deployed();
    const amount = 100;

    await truffleAssert.reverts(
       BaumanTokenInstance.mint(accounts[1], amount, {from : accounts[1]}),
      'Ownable: caller is not the owner'
    );
  });

  it("Owner can burn tokens from another account", async () => {
    const BaumanTokenInstance = await BaumanToken.deployed();
    const amount = 100;

    await BaumanTokenInstance.mint.sendTransaction(accounts[1], amount, {from : accounts[0]});

    const burnedAmount = 50;

    await BaumanTokenInstance.burnFrom.sendTransaction(accounts[1], burnedAmount);

    const balanceOfBurned = await BaumanTokenInstance.balanceOf.call(accounts[1]);
    assert.equal(balanceOfBurned.valueOf(), amount - burnedAmount, "Second account should contain 50 BMC");
  });

  it("Only owner can burn tokens from another account", async () => {
    const BaumanTokenInstance = await BaumanToken.deployed();
    const amount = 100;

    await truffleAssert.reverts(
      BaumanTokenInstance.burnFrom.sendTransaction(accounts[1], amount, {from : accounts[1]}),
      'Ownable: caller is not the owner'
    );
  });

  it("Everyone can burn own tokens", async () => {
    const BaumanTokenInstance = await BaumanToken.deployed();
    const amount = 100;

    await BaumanTokenInstance.mint.sendTransaction(accounts[2], amount, {from : accounts[0]});

    const burnedAmount = 30;
    await BaumanTokenInstance.burn.sendTransaction(burnedAmount, {from : accounts[2]});

    const balanceAfterBurn = await BaumanTokenInstance.balanceOf.call(accounts[2]);

    assert.equal(balanceAfterBurn.valueOf(), amount - burnedAmount, "Expected 70 BMC after burning");
  });

  it("Owner can transfer from one account to another", async () => {
    const BaumanTokenInstance = await BaumanToken.deployed();
    const amountToFirst = 100;
    const amountToSecond = 300;

    await BaumanTokenInstance.mint.sendTransaction(accounts[3], amountToFirst, {from : accounts[0]});
    await BaumanTokenInstance.mint.sendTransaction(accounts[4], amountToSecond, {from : accounts[0]});

    const transferedAmount = 100;
    await BaumanTokenInstance.transferFrom.sendTransaction(accounts[4], accounts[3], transferedAmount, { from : accounts[0]});

    const balanceOfFirst = (await BaumanTokenInstance.balanceOf(accounts[3])).toString(); 
    const balanceOfSecond = (await BaumanTokenInstance.balanceOf(accounts[4])).toString();; 

    assert.equal(balanceOfFirst, balanceOfSecond, "Balances should be similar");
  });
});