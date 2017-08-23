pragma solidity 0.4.13;

import "../../contracts/CSXSToken.sol";

contract SafeMathMock
{
    uint256 public res;

    function mul(uint256 a, uint256 b)
    { res = SafeMath.mul(a,b); }

    function div(uint256 a, uint256 b)
    { res = SafeMath.div(a,b); }

    function sub(uint256 a, uint256 b)
    { res = SafeMath.sub(a,b); }

    function add(uint256 a, uint256 b)
    { res = SafeMath.add(a,b); }
}