pragma solidity 0.4.13;

contract ERC20Basic {
  uint256 public totalSupply;
  function balanceOf(address who) constant returns (uint256);
  function transfer(address to, uint256 value) returns (bool);
  event Transfer(address indexed from, address indexed to, uint256 value);
}

contract ERC20 is ERC20Basic {
  function allowance(address owner, address spender) constant returns (uint256);
  function transferFrom(address from, address to, uint256 value) returns (bool);
  function approve(address spender, uint256 value) returns (bool);
  event Approval(address indexed owner, address indexed spender, uint256 value);
}

contract BasicToken is ERC20Basic {
  using SafeMath for uint256;

  mapping(address => uint256) balances;

  function transfer(address _to, uint256 _value) returns (bool) {
    balances[msg.sender] = balances[msg.sender].sub(_value);
    balances[_to] = balances[_to].add(_value);
    Transfer(msg.sender, _to, _value);
    return true;
  }

  function balanceOf(address _owner) constant returns (uint256 balance) {
    return balances[_owner];
  }

}

contract Ownable {
  address public owner;

  function Ownable() {
    owner = msg.sender;
  }

  modifier onlyOwner() {
    require(msg.sender == owner);
    _;
  }

  function transferOwnership(address newOwner) onlyOwner {
    require(newOwner != address(0)); 
    owner = newOwner;
  }
}

library SafeMath {
  function mul(uint256 a, uint256 b) internal constant returns (uint256) {
    uint256 c = a * b;
    assert(a == 0 || c / a == b);
    return c;
  }

  function div(uint256 a, uint256 b) internal constant returns (uint256) {
    uint256 c = a / b;
    return c;
  }

  function sub(uint256 a, uint256 b) internal constant returns (uint256) {
    assert(b <= a);
    return a - b;
  }

  function add(uint256 a, uint256 b) internal constant returns (uint256) {
    uint256 c = a + b;
    assert(c >= a);
    return c;
  }
}

contract StandardToken is ERC20, BasicToken {

  mapping (address => mapping (address => uint256)) allowed;

  function transferFrom(address _from, address _to, uint256 _value) returns (bool) {
    var _allowance = allowed[_from][msg.sender];

    balances[_to] = balances[_to].add(_value);
    balances[_from] = balances[_from].sub(_value);
    allowed[_from][msg.sender] = _allowance.sub(_value);
    Transfer(_from, _to, _value);
    return true;
  }

  function approve(address _spender, uint256 _value) returns (bool) {

    require((_value == 0) || (allowed[msg.sender][_spender] == 0));

    allowed[msg.sender][_spender] = _value;
    Approval(msg.sender, _spender, _value);
    return true;
  }

  function allowance(address _owner, address _spender) constant returns (uint256 remaining) {
    return allowed[_owner][_spender];
  }

}

contract CSXSToken is StandardToken, Ownable
{
    string public name = "California Stock Xchange Coin";
    string public symbol = "CSXC";

    uint public decimals = 3;
    uint public rate = 270; // 1 euro - per token (use ether price in dollars)

    bool public allowBuying = true;

    uint private constant initialSupply = 10 * 10**9; // 9.999 Billions
    address private initialSupplyOwner;
    
    // Fallback function and Constructor
    function () payable 
    {
        BuyTokens(msg.sender);
    }
    
    function CSXSToken()
    {
        owner = msg.sender;
        initialSupplyOwner = this;
        totalSupply = initialSupply;
        balances[initialSupplyOwner] = initialSupply;
    }
    // -- Fallback function and Constructor
    
    // Contract functions
    function transferOwnership(address newOwner) 
    onlyOwner
    {
        address oldOwner = owner;
        super.transferOwnership(newOwner);
        EventOwnerTransfered(oldOwner, newOwner);
    }

    function ChangeRate(uint newRate)
    onlyOwner
    {
        require(newRate > 0);
        uint oldRate = rate;
        rate = newRate;
        EventRateChanged(oldRate, newRate);
    }

    function BuyTokens(address beneficiary) 
    OnlyIfBuyingAllowed
    payable 
    {
        require(beneficiary != 0x0);
        require(beneficiary != owner);
        require(msg.value > 0);

        uint weiAmount = msg.value;
        uint etherAmount = WeiToEther(weiAmount);
        
        uint tokens = etherAmount.mul(rate);

        balances[beneficiary] = balances[beneficiary].add(tokens);
        balances[initialSupplyOwner] = balances[initialSupplyOwner].sub(tokens);

        EventTokenPurchase(msg.sender, beneficiary, etherAmount, tokens, rate);
    }

    function RetrieveFunds()
    onlyOwner
    {
        owner.transfer(this.balance);
    }

    function Destroy()
    onlyOwner
    {
        selfdestruct(owner);
    }
    // -- Contract functions
    
    // Helper functions
    function WeiToEther(uint v) internal 
    returns (uint)
    {
        require(v > 0);
        return v.div(1000000000000000000);
    }

    function EtherToWei(uint v) internal
    returns (uint)
    {
      require(v > 0);
      return v.mul(1000000000000000000);
    }
    // -- Helper functions
    
    function ToggleFreezeBuying()
    onlyOwner
    { allowBuying = !allowBuying; }

    // Modifiers
    modifier OnlyIfBuyingAllowed()
    { require(allowBuying); _; }
    // -- Modifiers

    // Events
    event EventOwnerTransfered(address oldOwner, address newOwner);

    event EventRateChanged(uint oldRate, uint newRate);

    event EventTokenPurchase(
    address indexed purchaser, 
    address indexed beneficiary, 
    uint256 amountInEther, 
    uint256 tokens,
    uint buyRate);
    // --
}