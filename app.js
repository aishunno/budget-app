// BUDGET CONTROLLER
const budgetController = (function() {
    // EXPENSE FUNCTION CONSTRUTOR
    let Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    };

    // INCOME FUNCTION CONSTRUTOR
    let Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    // CALCULATE TOTAL EXPENSE AND INCOME
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

        // DELETING AN ITEM FROM DATA OBJECT
        deleteItem: function(type, id) {
            let index, ids;

            ids = data.allItems[type].map(function(current) {
                return current.id;
            });

            index = ids.indexOf(id);

            if (index > -1) {
                data.allItems[type].splice(index, 1);
            }
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

        calculatePercentages: function() {
            data.allItems.exp.forEach(function(current){
                current.calcPercentage(data.totals.inc);
            });
        },

        // GET ALL PERCENTAGES 
        getPercentages: function() {
            let allPercentages = data.allItems.exp.map(function(current){
                return current.getPercentage();
            });

            return allPercentages;
        },

        // GET BUDGET
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
        expensesPercLabel: '.item__percentage',
    };

    let formatNumber = function(num, type) {
        /**
         * 23010 -> + 23,010.00 
         */
        let numSplit, int, dec;

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }

        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
    }

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
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            // INSERT THE HTML TO THE DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        // DELETE LIST ITEM FROM THE DOM
        deleteListItem: function(selectorID) {
            let element = document.getElementById(selectorID);
            element.parentNode.removeChild(element);
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

        // DISPLAY AVAILABLE BUDGET
        displayBudget: function(obj) {
            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMStrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');

            if (obj.percentage > 0) {
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMStrings.percentageLabel).textContent = '---';
            }
            
        },

        displayPercentages: function(percentages) {
            // RETURNS A NODE LIST
            let fields = document.querySelectorAll(DOMStrings.expensesPercLabel);

            let nodeListForEach = function(list, callback) {
                for (let i = 0; i < list.length; i++) {
                    callback(list[i], i);
                }
            };

            nodeListForEach(fields, function(current, index){
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
                
            });
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

    let updatePercentages = function() {
        // 1. CALCULATE THE PERCENTAGES 
        budgetController.calculatePercentages();

        // 2. READ PERCENTAGES FROM THE BUDGET CONTROLLER
        let percentages = budgetController.getPercentages();

        // 3. UPDATE THE UI WITH THE NEW PERCENTAGES 
        UIController.displayPercentages(percentages);
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

            // 6. CALCULATE AND UPDATE PERCENTAGES 
            updatePercentages();
        }
       
    };

    // DELETING AN ITEM
    let deleteItem = function(event) {
        let itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // 1. DELETE AN ITEM FROM THE DATA OBJECT
            budgetController.deleteItem(type, ID);

            // 2. DELETE THE ITEM FROM THE UI
            UIController.deleteListItem(itemID);

            // 3. UPDATE AND SHOW THE NEW BUDGET
            updateBudget();

            // 4. CALCULATE AND UPDATE PERCENTAGES 
            updatePercentages();
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