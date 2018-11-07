// BUDGET CONTROLLER
const budgetController = (function() {
    // EXPENSE FUNCTION CONSTRUTOR
    let Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };
    // INCOME FUNCTION CONSTRUTOR
    let Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    let calculateTotal = function(type) {
        let sum = 0;

        data.allItems[type].forEach(function(current) {
            sum += current.value;
        });

        data.totals[type] = sum;
    }

    let data = {
        allItems: {
            exp: new Array(),
            inc: new Array()
        },

        totals: {
            exp: 0,
            inc: 0
        },

        budget: 0,
        percentage: -1
    };

    return {
        addItem: function(type, description, value) {
            let newItem, ID;

            // CREATE NEW ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length -1].id + 1;
            } else {
                ID = 0;
            }
            
            // CREATE NEW ITEM
            if (type === 'exp') {
                newItem = new Expense(ID, description, value);
            } else if (type === 'inc') {
                newItem = new Income(ID, description, value);
            }

            // PUSH IT INTO DATA STRUCTURE
            data.allItems[type].push(newItem);
            
            // RETURN THE NEW ELEMENT
            return newItem;
        },

        calculateBudget: function() {
            // 1. CALCULATE TOTAL INCOME AND EXPENSES
            calculateTotal('exp');
            calculateTotal('inc');

            // 2. CALCULATE THE BUDGET: INCOME - EXPENSES
            data.budget = data.totals.inc - data.totals.exp;

            // 3. CALCULATE THE PERCENTAGE OF INCOME THAT WE SPENT
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },

        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        }
    };
})();


// USER INTERFACE CONTROLLER
const UIController = (function() {
    // DOM STRINGS 
    const DOMStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
    };

    return {
        getInput: function() {
            return {
                type: document.querySelector(DOMStrings.inputType).value,
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            }
        },

        addListItem: function(obj, type) {
            let element, html;
            
            // CREATE HTML STRING WITH PLACEHOLDER TEXT
            if (type === 'inc') {
                element = DOMStrings.incomeContainer;
                html = `<div class="item clearfix" id="inc-%id%">
                    <div class="item__description">%description%</div>
                    <div class="right clearfix">
                        <div class="item__value">%value%</div>
                        <div class="item__delete">
                            <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                        </div>
                    </div>
                </div>`
            } else if (type === 'exp') {
                element = DOMStrings.expenseContainer;
                html = `<div class="item clearfix" id="exp-%id%">
                    <div class="item__description">%description%</div>
                    <div class="right clearfix">
                        <div class="item__value">%value%</div>
                        <div class="item__percentage">21%</div>
                        <div class="item__delete">
                            <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                        </div>
                    </div>
                </div>`
            }
            
            // REPLACE THE PLACEHOLDER TEXT WITH SOME ACTUAL DATA
            let newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', obj.value);

            // INSERT THE HTML TO THE DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        clearFields: function() {
            let fields, fieldsArray;
            fields = document.querySelectorAll(DOMStrings.inputDescription + ',' + DOMStrings.inputValue);

            fieldsArray = Array.prototype.slice.call(fields);

            fieldsArray.forEach(function(current, index, array) {
                current.value = "";
            });

            fieldsArray[0].focus();
        },

        displayBudget: function(obj) {
            document.querySelector(DOMStrings.budgetLabel).textContent = obj.budget;
            document.querySelector(DOMStrings.incomeLabel).textContent = obj.totalInc;
            document.querySelector(DOMStrings.expensesLabel).textContent = obj.totalExp;

            if (obj.percentage > 0) {
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMStrings.percentageLabel).textContent = '---';
            }
            
        },

        getDOMStrings: function() {
            return DOMStrings;
        }
    }
})();


// APP CONTROLLER
const appController = (function(budgetController, UIController) {
    // EVENT LISTENERS
    const setupEventListeners = function() {
        const DOMStrings = UIController.getDOMStrings();
        // LISTENS TO CLICK EVENT
        document.querySelector(DOMStrings.inputBtn).addEventListener('click', addItem);
        // LISTENS TO KEYPRESS EVENT
        document.addEventListener('keypress', function(event) {
            if (event.keyCode === 13 || event.which === 13) {
                addItem();
            }
        });

        document.querySelector(DOMStrings.container).addEventListener('click', deleteItem);

    };

    let updateBudget = function() {
        // 1. Calculate Budget
        budgetController.calculateBudget();

        // 2. Return the budget
        let budget = budgetController.getBudget();

        // 3. Display the budget on the UI
        UIController.displayBudget(budget);
    }
    
    let addItem = function() {
        // 1. Get the field input data
        let input = UIController.getInput();
        
        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
             // 2. ADD ITEM TO THE BUDGET CONTROLLER
            let newItem = budgetController.addItem(input.type, input.description, input.value);

            // 3. ADD THE ITEM TO THE UI
            UIController.addListItem(newItem, input.type);

            // 4. CLEAR THE FIELDS
            UIController.clearFields();

            // 5. Calculate and Update Budget
            updateBudget();
        }
       
    };

    // DELETING AN ITEM
    let deleteItem = function(event) {
        let itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = splitID[1];

            // 1. DELETE AND ITEM FROM THE DATA OBJECT

            // 2. DELETE THE ITEM FROM THE UI

            // 3. UPDATE AND SHOW THE NEW BUDGET
        }
    };

    return {
        init: function() {
            /**
             * RENDERING A NULL OBJECT
             * INITIALLY WHEN
             * THE APP LOADS
             */
            UIController.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });

            setupEventListeners();
        }
    }
})(budgetController, UIController);

appController.init();