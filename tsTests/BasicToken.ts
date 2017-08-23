const BasicTokenMock = artifacts.require("./BasicTokenMock.sol")
import { expectThrow } from "./helpers/index"
import { expect } from "chai"

let bt = null; //
var king; // will use this as owner
var queen;
var supply = 10000;

contract("BasicToken", (accounts)=>
{
    beforeEach(async()=>
    {
        king = accounts[0];
        queen = accounts[1];

        bt = await BasicTokenMock.new(king, supply);
    })

    it("Should return correct totalSupply after contstruction", async()=>
    {
        expect((await bt.totalSupply()).toNumber(),
            "Total supply does not match")
            .to.equal(supply);
    })
    
    it("Should return correct balances after transfer", async()=>
    {
        await bt.transfer(queen, supply);

        expect((await bt.balanceOf(king)).toNumber(), 
            "Should be empty")
            .to.equal(0);
        
        expect((await bt.balanceOf(queen)).toNumber(),
            "Should be lot of money")
            .to.equal(supply);
    })

    it("Should throw when trying to transfer more than balance", async()=>
    {
        expect(await expectThrow(bt.transfer(queen, supply+1,{from:king})),
            "Expected a throw")
            .to.be.true;
    })

})