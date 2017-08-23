const CSXSToken = artifacts.require("CSXSToken")
import { expectThrow } from "./helpers/index"
import { expect } from "chai"


let csxs = null;
const csxsTotalSupply = 10 * 10**9; // 9.999 Billions
const rate = 270;

var king; // will use this as owner
var queen;
var jack;
var ace;
var joker;
var magpie;

// Helper functions
function ReturnEventAndArgs(returnVal)
{
    return { eventName: returnVal.logs[0].event, 
             eventArgs: returnVal.logs[0].args.action,
             raw: returnVal }
}
// -- Helper functions

contract("CSXSToken", (accounts)=> 
{
    before(async()=>
    {
        king = accounts[0];
        queen = accounts[1];
        jack = accounts[2];
        ace = accounts[3];
        joker = accounts[4];
        magpie = accounts[5];
    })
 
    describe("Initialize", async()=>
    {
        describe("Correct Init", async()=>
        {
            it("It should initialize", async()=>
            {
                csxs = await CSXSToken.new({from: king});

                expect(await csxs.owner(), 
                    "Owners should match")
                    .to.equal(king);

                expect((await csxs.totalSupply()).toNumber(),
                    "Total supply should match")
                    .to.equal(csxsTotalSupply);

                expect((await csxs.balanceOf(csxs.address)).toNumber(),
                    "Balance should equal to initial supply")
                    .to.equal(csxsTotalSupply);
            })
        })
    })

    describe("Function: transferOwnership(address newOwner) ", async()=>
    {
        it("Should correctly transfer ownership", async()=>
        {
            csxs = await CSXSToken.new({from: king});

            // Checking current owner
            expect(await csxs.owner(), 
                "Owners should match")
                .to.equal(king);

            let r = ReturnEventAndArgs(await csxs.transferOwnership(queen, {from:king}));
            
            expect(r.eventName, 
                "Event EventOwnerTransfered was not fired")
                .to.be.equal("EventOwnerTransfered");

            expect(await csxs.owner(), 
                "Owners should match")
                .to.equal(queen);
        })

        it("Should not trasnfer ownership (not owner transfers)", async()=>
        {
            csxs = await CSXSToken.new({from: king});

            expect(await csxs.owner(), 
                "Owners should match")
                .to.equal(king);

            expect(await expectThrow(csxs.transferOwnership(jack, {from:queen})),
                "Should throw")
                .to.be.true;
        })

        it("Should not transfer ownership (passing 0 address)", async()=>
        {
            csxs = await CSXSToken.new({from: king});

            expect(await csxs.owner(), 
                "Owners should match")
                .to.equal(king);

            expect(await expectThrow(csxs.transferOwnership(0, {from:king})),
                "Should throw")
                .to.be.true;
        })
    })

    describe("Function: ChangeRate(uint newRate)", async()=>
    {
        beforeEach(async()=>
        {
            csxs = await CSXSToken.new({from: king});
        })

        it("Should correctly change rate", async()=>
        {
            expect((await csxs.rate()).toNumber(),
                "Rate is incorrect")
                .to.be.equal(rate);

            let newRate = 150;
            let r = ReturnEventAndArgs(await csxs.ChangeRate(newRate, {from:king}));

            expect(r.eventName, 
                "Event EventOwnerTransfered was not fired")
                .to.be.equal("EventRateChanged");

            expect((await csxs.rate()).toNumber(),
                "Rate is incorrect")
                .to.be.equal(newRate);
        })

        it("Should not change rate (rate is 0)", async()=>
        {
            expect(await expectThrow(csxs.ChangeRate(0, {from:king})),
                "Should throw")
                .to.be.true;
        })
    })

    describe("BuyTokens(address beneficiary)", async()=>
    {
        beforeEach(async()=>
        {
            csxs = await CSXSToken.new({from: king});
        })

        it("Should correctly buy tokens", async()=>
        {
            let valueInEther = 10;
            let valueInWei = web3.toWei(valueInEther, "ether");
            let rate = (await csxs.rate.call()).toNumber();

            let expectedTokenAmount = +rate * +valueInEther;
            let balanceOfContract = await csxs.balanceOf(csxs.address);
            let balanceOfBeneficiary = await csxs.balanceOf(queen);

            // Check if balances are correct
            // buy tokens
            let r = ReturnEventAndArgs(
                await csxs.BuyTokens(queen, {from:king, value:valueInWei}));
            
            // Checking if event fired
            expect(r.eventName, 
                "Event EventOwnerTransfered was not fired")
                .to.be.equal("EventTokenPurchase");

            let purchaser = r.raw.logs[0].args["purchaser"];
            let beneficiary = r.raw.logs[0].args["beneficiary"];
            let tokens = r.raw.logs[0].args["tokens"].toNumber();
            let buyRate = r.raw.logs[0].args["buyRate"].toNumber();

            // Checking event passed parameters
            expect(purchaser, "Purchaser is incorrect")
                .to.equal(king);

            expect(beneficiary, "Beneficiary is incorrect")
                .to.equal(queen);

            expect(tokens, "Tokens are incorrect")
                .to.equal(expectedTokenAmount);

            expect(buyRate, "BuyRate is incorrect")
                .to.equal(rate);

            // Checking actual results
            expect((await csxs.balanceOf(csxs.address)).toNumber(), //tokens are held in contract address
                "Balance did not decrease for sender") 
                .to.equal(+balanceOfContract - +tokens);
            
            expect((await csxs.balanceOf(queen)).toNumber(), // tokens of beneficiary
                "Balance did not increase for beneficiary")
                .to.equal(+balanceOfBeneficiary + +tokens);
            
        })

        describe("Should not buy tokens", async()=>
        {
            var valueInEther = 10;
            var valueInWei = web3.toWei(valueInEther, "ether");

            it("Passing 0 for beneficiary", async()=>
            {
                expect(await expectThrow(csxs.BuyTokens(0, {from:king, value:valueInWei})),
                    "Should throw")
                    .to.be.true;
            })

            it("Passing owner for beneficiary", async()=>
            {
                expect(await expectThrow(csxs.BuyTokens(king, {from:king, value:valueInWei})),
                    "Should throw")
                    .to.be.true;
            })

            it("Passing 0 for value (sending 0 ether)", async()=>
            {
                expect(await expectThrow(csxs.BuyTokens(queen, {from:king, value:0})),
                    "Should throw")
                    .to.be.true;
            })
        })
    })
})