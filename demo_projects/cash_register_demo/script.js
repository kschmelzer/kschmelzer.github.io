let price = 1.87;
let cid = [
  ['PENNY', 1.01],
  ['NICKEL', 2.05],
  ['DIME', 3.1],
  ['QUARTER', 4.25],
  ['ONE', 90],
  ['FIVE', 55],
  ['TEN', 20],
  ['TWENTY', 60],
  ['ONE HUNDRED', 100]
];

const currencyDetails = {
  'PENNY': {label: 'Pennies', value: .01}, 
  'NICKEL': {label: 'Nickels', value: .05}, 
  'DIME': {label: 'Dimes', value: .10}, 
  'QUARTER': {label: 'Quarters', value: .25}, 
  'ONE': {label: 'Ones', value: 1.00}, 
  'FIVE': {label: 'Fives', value: 5.00}, 
  'TEN': {label: 'Tens', value: 10.00}, 
  'TWENTY': {label: 'Twenties', value: 20.00}, 
  'ONE HUNDRED': {label: 'Hundreds', value: 100.00}
};

const registerContentsElement = document.getElementById('register-contents');
const registerDisplay = document.getElementById('cash-register-display');
const purchaseBtn = document.getElementById('purchase-btn');
const cashElement = document.getElementById('cash');
const changeDueElement = document.getElementById('change-due');

const updateChangeInDrawer = () => {
  const headerText = document.createElement('strong');
  headerText.textContent = 'Change in drawer: ';
  const header = document.createElement('p');
  header.appendChild(headerText);
  registerContentsElement.textContent = '';
  registerContentsElement.appendChild(header);
  cid.forEach((currency) => {
    const currencyText = document.createElement('p');
    currencyText.textContent = `${currencyDetails[currency[0]].label}: $${parseFloat(currency[1]).toFixed(2)}`;
    registerContentsElement.appendChild(currencyText);
  })
};

const updateDrawerContents = (updatedCIDValues) => {

  cid = updatedCIDValues;

  updateChangeInDrawer();
}

const updateRegisterDisplay = () => {

  registerDisplay.textContent = `Total: $${parseFloat(price).toFixed(2)}`;
}

updateChangeInDrawer();
updateRegisterDisplay();

const makeChange = (tenderedValue) => {
  const currencyList = cid.map((currency) => [...currency]);
  currencyList.reverse();
  let remainingTendered = tenderedValue;
  const change = {};
  const updatedCIDValues = currencyList.map((currency) => [...currency]);
   
  
  currencyList.forEach((currency, i) => {
    const currencyValue = currencyDetails[currency[0]].value;
    let numCurrencyUnits = 0;
    while (remainingTendered >= currencyValue && updatedCIDValues[i][1] > 0) { 
      numCurrencyUnits++;
      remainingTendered -= currencyValue;
      updatedCIDValues[i][1] -= currencyValue;
      // need to round to the nearest penny or the math get lossy and the tests get flaky.
      //  Where are the guys from Office Space when you need them...
      remainingTendered = Math.round(remainingTendered * 100) / 100;
      updatedCIDValues[i][1] = Math.round(updatedCIDValues[i][1] * 100) / 100;
    }
      
    change[currency[0]] = numCurrencyUnits * currencyValue;
  })

  console.log(change, remainingTendered);
  updatedCIDValues.reverse();
  return {change, updatedCIDValues, remainingTendered};
}

const showNoChangeDue = () => {
  changeDueElement.textContent = '';
  const statusElement = document.createElement('p');
  statusElement.textContent = `No change due - customer paid with exact cash`;
  changeDueElement.appendChild(statusElement);
}

const showInsufficientFunds = () => {
  changeDueElement.textContent = '';
  const statusElement = document.createElement('p');
  statusElement.textContent = `Status: INSUFFICIENT_FUNDS`;
  changeDueElement.appendChild(statusElement);
}

const updateChangeDue = (changeDetails) => {
  const status = cid.reduce((acc, cash) => acc + cash[1], 0) > 0 ? 'OPEN' : 'CLOSED';
  changeDueElement.textContent = '';
  const statusElement = document.createElement('p');
  statusElement.textContent = `Status: ${status}`;

  const currencyList = cid.map((currency) => [...currency]);
  currencyList.reverse();
  changeDueElement.appendChild(statusElement);
  currencyList.forEach((currency) => {
    if(changeDetails.change[currency[0]] > 0) {
      const currencyElement = document.createElement('p');
      currencyElement.textContent = `${currency[0]}: $${parseFloat(changeDetails.change[currency[0]]).toFixed(2)}`;
      changeDueElement.appendChild(currencyElement);
    }
  })
}

// on click -
purchaseBtn.addEventListener('click', () => {
  const amtTendered = Number(cashElement.value);
  const changeToMake = amtTendered - price;

  if (changeToMake < 0) {
    alert ('Customer does not have enough money to purchase the item');
  } else if (changeToMake === 0) {
    showNoChangeDue();
  } else {
    // make change
    const changeDetails = makeChange(changeToMake);
    if (changeDetails.remainingTendered > 0) {
      showInsufficientFunds();
    } else {
      updateDrawerContents(changeDetails.updatedCIDValues);
      updateChangeDue(changeDetails);
    }
  }
});