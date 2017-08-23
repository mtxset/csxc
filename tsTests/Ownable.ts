const Ownable = artifacts.require("Ownable")
import { expectThrow } from "./helpers/index"
import { expect } from "chai"

contract("Ownable", (accounts)=>
{
    var ow; // Ownable contract
    var king = accounts[0];
    beforeEach(async()=>
    {
        ow = await Ownable.new({from:king});
    })

    it("Should have an owner", async()=>
    {
        let owner = await Ownable.new();
        expect(owner !== 0).to.be.true;
    })

    it("Correct owner", async()=>
    {
        expect(await ow.owner(), "Owner is incorrect")
            .to.equal(king)
    })

    it("Should prevent non-owners from transfering", async()=>
    {
        let owner = await ow.owner.call();
        let loser = accounts[1]; // not owner

        expect(await (expectThrow(ow.transferOwnership(loser, {from:loser}))),
            "Should throw")
            .to.be.true;
    })

    it("Should not allow transfer to 0", async()=>
    {
        let owner = await ow.owner.call();

        expect(await (expectThrow(ow.transferOwnership(0, {from:owner}))),
            "Should throw")
            .to.be.true;
    })
})