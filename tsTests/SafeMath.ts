const SafeMathMock = artifacts.require("./SafeMathMock.sol")
import { expectThrow } from "./helpers/index"
import { expect } from "chai"

var sm;

contract("SafeMath Library", ()=>
{
    before(async()=>
    {
        sm = await SafeMathMock.new();
    })

    it("Should multiply correctly", async()=>
    {
        let a = 5678;
        let b = 1234;
        await sm.mul(a,b);
        
        expect((await sm.res()).toNumber())
            .to.equal(a * b);

    })

    it("Should divide correctly", async()=>
    {
        let a = 55465;
        let b = 11093;
        await sm.div(a,b);
        
        expect((await sm.res()).toNumber())
            .to.equal(a/b);
    })

    it("Should substract correctly", async()=>
    {
        let a = 55465;
        let b = 11093;
        await sm.sub(a,b);
        
        expect((await sm.res()).toNumber())
            .to.equal(+a - +b);
    })

    it("Should add correctly", async()=>
    {
        let a = 55465;
        let b = 11093;
        await sm.add(a,b);
        
        expect((await sm.res()).toNumber())
            .to.equal(+a + +b);
    })
}) 
