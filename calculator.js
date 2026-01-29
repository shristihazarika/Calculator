class Calculator {
    constructor(previousOperandElement, currentOperandElement) {
        this.previousOperandElement = previousOperandElement;
        this.currentOperandElement = currentOperandElement;
        this.history = [];
        this.clear();
    }

    /**
     * Clear all values and reset calculator
     */
    clear() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = undefined;
        this.shouldResetScreen = false;
    }

    /**
     * Delete the last digit from current operand
     */
    delete() {
        if (this.currentOperand === '0') return;
        
        // If only one digit left, set to 0
        if (this.currentOperand.length === 1) {
            this.currentOperand = '0';
        } else {
            this.currentOperand = this.currentOperand.slice(0, -1);
        }
    }

    /**
     * Append a number to the display
     * @param {string} number - The number to append
     */
    appendNumber(number) {
        // Reset screen if flag is set (after calculation)
        if (this.shouldResetScreen) {
            this.currentOperand = '';
            this.shouldResetScreen = false;
        }

        // Prevent multiple decimal points
        if (number === '.' && this.currentOperand.includes('.')) return;

        // If current is 0, replace it (unless adding decimal)
        if (this.currentOperand === '0' && number !== '.') {
            this.currentOperand = number;
        } else {
            this.currentOperand += number;
        }
    }

    /**
     * Choose an operation (+, -, ×, ÷)
     * @param {string} operation - The operation to perform
     */
    chooseOperation(operation) {
        // If current operand is empty, just change operation
        if (this.currentOperand === '') return;

        // If previous operand exists, compute first
        if (this.previousOperand !== '') {
            this.compute();
        }

        this.operation = operation;
        this.previousOperand = this.currentOperand;
        this.currentOperand = '';
    }

    /**
     * Compute the result based on the operation
     */
    compute() {
        let computation;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);

        // Check for invalid input
        if (isNaN(prev) || isNaN(current)) return;

        // Perform calculation using if-else statements
        if (this.operation === '+') {
            computation = prev + current;
        } else if (this.operation === '-') {
            computation = prev - current;
        } else if (this.operation === '×') {
            computation = prev * current;
        } else if (this.operation === '÷') {
            // Check for division by zero
            if (current === 0) {
                this.showError('Cannot divide by zero');
                this.clear();
                return;
            }
            computation = prev / current;
        } else {
            return;
        }

        // Store in history
        this.addToHistory(
            `${this.formatNumber(prev)} ${this.operation} ${this.formatNumber(current)}`,
            computation
        );

        // Update display
        this.currentOperand = computation.toString();
        this.operation = undefined;
        this.previousOperand = '';
        this.shouldResetScreen = true;
    }

    /**
     * Calculate percentage of current operand
     */
    percentage() {
        const current = parseFloat(this.currentOperand);
        if (isNaN(current)) return;

        this.currentOperand = (current / 100).toString();
        this.shouldResetScreen = true;
    }

    /**
     * Format number with proper decimal places
     * @param {number} number - Number to format
     * @returns {string} Formatted number
     */
    formatNumber(number) {
        if (isNaN(number)) return '';

        const stringNumber = number.toString();
        const decimalIndex = stringNumber.indexOf('.');

        // If no decimal, add thousand separators
        if (decimalIndex === -1) {
            return this.addThousandSeparators(stringNumber);
        }

        // If has decimal, format both parts
        const integerPart = stringNumber.slice(0, decimalIndex);
        let decimalPart = stringNumber.slice(decimalIndex + 1);

        // Limit decimal places to 8
        if (decimalPart.length > 8) {
            decimalPart = decimalPart.slice(0, 8);
        }

        return `${this.addThousandSeparators(integerPart)}.${decimalPart}`;
    }

    /**
     * Add thousand separators to number
     * @param {string} number - Number string
     * @returns {string} Number with separators
     */
    addThousandSeparators(number) {
        // Reverse string to add commas from right
        let reversed = number.split('').reverse().join('');
        let withCommas = '';

        // Loop through and add commas every 3 digits
        for (let i = 0; i < reversed.length; i++) {
            if (i > 0 && i % 3 === 0) {
                withCommas += ',';
            }
            withCommas += reversed[i];
        }

        // Reverse back
        return withCommas.split('').reverse().join('');
    }

    /**
     * Update the calculator display
     */
    updateDisplay() {
        this.currentOperandElement.textContent = this.formatNumber(
            parseFloat(this.currentOperand)
        ) || this.currentOperand;

        // Update previous operand with operation
        if (this.operation != null) {
            this.previousOperandElement.textContent = 
                `${this.formatNumber(parseFloat(this.previousOperand))} ${this.operation}`;
        } else {
            this.previousOperandElement.textContent = '';
        }

        // Highlight active operator
        this.highlightOperator();
    }

    /**
     * Highlight the active operator button
     */
    highlightOperator() {
        // Remove active class from all operators
        document.querySelectorAll('.btn-operator').forEach(btn => {
            btn.classList.remove('active');
        });

        // Add active class to current operator
        if (this.operation) {
            const operatorBtn = document.querySelector(
                `.btn-operator[data-operator="${this.operation}"]`
            );
            if (operatorBtn) {
                operatorBtn.classList.add('active');
            }
        }
    }

    /**
     * Show error message
     * @param {string} message - Error message to display
     */
    showError(message) {
        this.currentOperandElement.textContent = 'Error';
        this.currentOperandElement.classList.add('error');
        
        showToast('❌', message);

        // Remove error class after animation
        setTimeout(() => {
            this.currentOperandElement.classList.remove('error');
        }, 500);
    }

    /**
     * Add calculation to history
     * @param {string} expression - The calculation expression
     * @param {number} result - The calculation result
     */
    addToHistory(expression, result) {
        this.history.unshift({
            expression: expression,
            result: result,
            timestamp: new Date()
        });

        // Keep only last 10 items
        if (this.history.length > 10) {
            this.history.pop();
        }

        this.updateHistoryDisplay();
    }

    /**
     * Update the history display
     */
    updateHistoryDisplay() {
        const historyList = document.getElementById('historyList');

        if (this.history.length === 0) {
            historyList.innerHTML = '<p class="empty-history">No calculations yet</p>';
            return;
        }

        historyList.innerHTML = '';

        // Loop through history and create elements
        for (let i = 0; i < this.history.length; i++) {
            const item = this.history[i];
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.innerHTML = `
                <div class="history-expression">${item.expression}</div>
                <div class="history-result">= ${this.formatNumber(item.result)}</div>
            `;

            // Add click event to reuse result
            historyItem.addEventListener('click', () => {
                this.currentOperand = item.result.toString();
                this.shouldResetScreen = true;
                this.updateDisplay();
                showToast('✅', 'Result loaded from history');
            });

            historyList.appendChild(historyItem);
        }
    }

    /**
     * Clear all history
     */
    clearHistory() {
        this.history = [];
        this.updateHistoryDisplay();
        showToast('🗑️', 'History cleared');
    }

    /**
     * Copy current display to clipboard
     */
    copyToClipboard() {
        const value = this.currentOperand;
        
        // Use modern clipboard API
        if (navigator.clipboard) {
            navigator.clipboard.writeText(value).then(() => {
                showToast('📋', 'Copied to clipboard!');
            }).catch(() => {
                this.fallbackCopy(value);
            });
        } else {
            this.fallbackCopy(value);
        }
    }

    /**
     * Fallback copy method for older browsers
     * @param {string} text - Text to copy
     */
    fallbackCopy(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        
        try {
            document.execCommand('copy');
            showToast('📋', 'Copied to clipboard!');
        } catch (err) {
            showToast('❌', 'Copy failed');
        }
        
        document.body.removeChild(textArea);
    }
}

// ========================================
// TOAST NOTIFICATION
// ========================================
function showToast(icon, message) {
    const toast = document.getElementById('toast');
    const toastIcon = document.getElementById('toastIcon');
    const toastMessage = document.getElementById('toastMessage');

    toastIcon.textContent = icon;
    toastMessage.textContent = message;

    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 2500);
}

// ========================================
// THEME MANAGEMENT
// ========================================
class ThemeManager {
    constructor() {
        this.darkTheme = false;
        this.loadTheme();
    }

    /**
     * Toggle between light and dark theme
     */
    toggle() {
        this.darkTheme = !this.darkTheme;
        this.applyTheme();
        this.saveTheme();
    }

    /**
     * Apply the current theme
     */
    applyTheme() {
        const themeIcon = document.querySelector('.theme-icon');
        
        if (this.darkTheme) {
            document.body.classList.add('dark-theme');
            themeIcon.textContent = '☀️';
        } else {
            document.body.classList.remove('dark-theme');
            themeIcon.textContent = '🌙';
        }
    }

    /**
     * Save theme preference to localStorage
     */
    saveTheme() {
        localStorage.setItem('calculatorTheme', this.darkTheme ? 'dark' : 'light');
    }

    /**
     * Load theme preference from localStorage
     */
    loadTheme() {
        const savedTheme = localStorage.getItem('calculatorTheme');
        
        if (savedTheme === 'dark') {
            this.darkTheme = true;
        } else if (savedTheme === 'light') {
            this.darkTheme = false;
        } else {
            // Default to system preference
            this.darkTheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        
        this.applyTheme();
    }
}

// ========================================
// INITIALIZE CALCULATOR
// ========================================
const previousOperandElement = document.getElementById('previousOperand');
const currentOperandElement = document.getElementById('currentOperand');
const calculator = new Calculator(previousOperandElement, currentOperandElement);
const themeManager = new ThemeManager();

// ========================================
// EVENT LISTENERS - NUMBER BUTTONS
// ========================================
const numberButtons = document.querySelectorAll('[data-number]');
numberButtons.forEach(button => {
    button.addEventListener('click', () => {
        calculator.appendNumber(button.dataset.number);
        calculator.updateDisplay();
    });
});


const operatorButtons = document.querySelectorAll('[data-operator]');
operatorButtons.forEach(button => {
    button.addEventListener('click', () => {
        calculator.chooseOperation(button.dataset.operator);
        calculator.updateDisplay();
    });
});


document.querySelectorAll('[data-action]').forEach(button => {
    button.addEventListener('click', () => {
        const action = button.dataset.action;

        // Use if-else to handle different actions
        if (action === 'clear') {
            calculator.clear();
            showToast('🔄', 'Calculator cleared');
        } else if (action === 'delete') {
            calculator.delete();
        } else if (action === 'decimal') {
            calculator.appendNumber('.');
        } else if (action === 'percentage') {
            calculator.percentage();
        } else if (action === 'equals') {
            calculator.compute();
        }

        calculator.updateDisplay();
    });
});


document.getElementById('themeToggle').addEventListener('click', () => {
    themeManager.toggle();
});


document.getElementById('clearHistory').addEventListener('click', () => {
    calculator.clearHistory();
});

// ========================================
// EVENT LISTENER - DISPLAY CLICK (COPY)
// ========================================
document.querySelector('.display-section').addEventListener('click', () => {
    calculator.copyToClipboard();
});

// ========================================
// EVENT LISTENER - KEYBOARD SUPPORT
// ========================================
document.addEventListener('keydown', (e) => {
    // Numbers 0-9
    if (e.key >= '0' && e.key <= '9') {
        calculator.appendNumber(e.key);
        calculator.updateDisplay();
    }
    // Decimal point
    else if (e.key === '.') {
        calculator.appendNumber('.');
        calculator.updateDisplay();
    }
    // Operations
    else if (e.key === '+') {
        calculator.chooseOperation('+');
        calculator.updateDisplay();
    } else if (e.key === '-') {
        calculator.chooseOperation('-');
        calculator.updateDisplay();
    } else if (e.key === '*') {
        calculator.chooseOperation('×');
        calculator.updateDisplay();
    } else if (e.key === '/') {
        e.preventDefault(); // Prevent browser search
        calculator.chooseOperation('÷');
        calculator.updateDisplay();
    }
    // Equals
    else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        calculator.compute();
        calculator.updateDisplay();
    }
    // Backspace/Delete
    else if (e.key === 'Backspace') {
        e.preventDefault();
        calculator.delete();
        calculator.updateDisplay();
    }
    // Escape - Clear
    else if (e.key === 'Escape') {
        calculator.clear();
        calculator.updateDisplay();
        showToast('🔄', 'Calculator cleared');
    }
    // Percentage
    else if (e.key === '%') {
        calculator.percentage();
        calculator.updateDisplay();
    }
});

// ========================================
// KEYBOARD SHORTCUTS PANEL
// ========================================
const shortcutsToggle = document.getElementById('shortcutsToggle');
const shortcutsPanel = document.getElementById('shortcutsPanel');

shortcutsToggle.addEventListener('click', () => {
    shortcutsPanel.classList.toggle('show');
});

// Close shortcuts panel when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.shortcuts-info')) {
        shortcutsPanel.classList.remove('show');
    }
});

// ========================================
// INITIALIZE DISPLAY
// ========================================
calculator.updateDisplay();

// ========================================
// WELCOME MESSAGE
// ========================================
console.log('%c🧮 Modern Calculator', 'font-size: 20px; font-weight: bold; color: #4299e1;');
console.log('%cCreated by Krishanu Saikia', 'font-size: 14px; color: #718096;');
console.log('%c📧 krishanusaikia3@gmail.com | 📱 8099794559', 'font-size: 12px; color: #a0aec0;');
console.log('%cTry keyboard shortcuts! Press Escape to clear, Enter to calculate.', 'font-size: 12px; font-style: italic; color: #cbd5e0;');

// ========================================
// ADVANCED FEATURES (BONUS)
// ========================================

/**
 * Handle window resize for responsive adjustments
 */
window.addEventListener('resize', () => {
    // Adjust font size for very small screens
    const display = document.querySelector('.current-operand');
    const displayWidth = display.offsetWidth;
    const textWidth = display.scrollWidth;

    if (textWidth > displayWidth) {
        let fontSize = parseFloat(window.getComputedStyle(display).fontSize);
        while (display.scrollWidth > displayWidth && fontSize > 16) {
            fontSize -= 1;
            display.style.fontSize = fontSize + 'px';
        }
    }
});

/**
 * Prevent context menu on calculator (optional)
 */
document.querySelector('.calculator').addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

/**
 * Add haptic feedback for mobile devices (if supported)
 */
function hapticFeedback() {
    if (navigator.vibrate) {
        navigator.vibrate(10);
    }
}

// Add haptic feedback to all buttons
document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', hapticFeedback);
});

// ========================================
// ERROR HANDLING INTEGRATION
// ========================================
window.addEventListener('error', (e) => {
    console.error('Calculator Error:', e.message);
    showToast('❌', 'An error occurred');
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Promise Rejection:', e.reason);
    showToast('❌', 'An error occurred');
});