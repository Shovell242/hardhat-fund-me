// imports
const { network, deployments } = require("hardhat")
const { developmentChains, networkConfig } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

module.exports = async (hre) => {
    const { deployer } = await hre.getNamedAccounts()
    const { deploy, log } = hre.deployments
    const chainId = network.config.chainId

    let ethUsdPriceFeedAddress
    if (developmentChains.includes(network.name)) {
        ethUsdPriceFeedAddress = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdPriceFeedAddress.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }

    // if contract doesn't exit, we deploy a minimal version of
    // for our local testing

    // when going for localhost or hardhat network we want to use a mock
    const args = [ethUsdPriceFeedAddress]
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })
    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(fundMe.address, args)
    }
    log("------------------------------")
}

module.exports.tags = ["all", "fundme"]
