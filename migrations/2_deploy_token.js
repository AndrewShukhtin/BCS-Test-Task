const BaumanToken = artifacts.require("./BaumanToken.sol");

module.exports = function(deployer) {
  deployer.deploy(BaumanToken);
}
