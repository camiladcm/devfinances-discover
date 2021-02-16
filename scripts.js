const Modal = {
  OpenClose(transactionId = "") {
    document.querySelector('.modal-overlay').classList.toggle("active");

    if (transactionId) {
      transactionId = Number(transactionId);

      const [transactions] = Transaction.all.filter((transaction) => {
        return transaction.id == transactionId;
      });

      Form.setValues(
        transactions.id,
        transactions.description,
        transactions.amount / 100,
        Utils.formatStringToDate(transactions.date)
      );
    }
  }
}

const changeColorCard = {
  redCard() {
    const cardTotal = document.querySelector('.card.total');

    if (Transaction.total() < 0) {
      cardTotal.classList.add('redCardTotal');
    } else {
      cardTotal.classList.remove('redCardTotal');
    }
  },
};

const Storage = {
  get() {
    return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
  },
  set(transactions) {
    localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
  }
}

const Transaction = {
  all: Storage.get(),

  add(transaction) {
    const identifier = Transaction.all.findIndex((item, index) => {
      return item.id == transaction.id;
    });

    if (identifier > -1) {
      Transaction.all.splice(identifier, 1, transaction);
    } else {
      Transaction.all.push(transaction);
    }

    App.reload();
  },

  remove(TransactionId) {
    const identifier = Transaction.all.findIndex((transaction, index) => {
      return transaction.id == TransactionId;
    });

    Transaction.all.splice(identifier, 1)
    App.reload()
  },

  incomes() {
    let income = 0;

    Transaction.all.forEach(transaction => {
      if (transaction.amount > 0) {
        income += transaction.amount;
      }
    });
    return income;
  },

  expenses() {
    let expense = 0;

    Transaction.all.forEach(transaction => {
      if (transaction.amount < 0) {
        expense += transaction.amount;
      }
    });
    return expense;
  },

  total() {
    return Transaction.incomes() + Transaction.expenses();
  }
}



const DOM = {
  transactionsContainer: document.querySelector('#data-table tbody'),

  addTransaction(transaction, index) {
    const tr = document.createElement('tr');
    tr.innerHTML = DOM.innerHTMLTransaction(transaction, index);
    tr.dataset.index = index;

    DOM.transactionsContainer.appendChild(tr);
  },

  innerHTMLTransaction(transaction, index) {
    const CSSclass = transaction.amount > 0 ? "income" : "expense"

    const amount = Utils.formatCurrency(transaction.amount)

    const html = `
    <td class = "description">${transaction.description}</td>
    <td class = "${CSSclass}">${amount}</td>
    <td class = "date">${transaction.date}</td>
    <td>
      <img onclick = "Modal.OpenClose(${transaction.id})" src = "./assets/plus.svg" alt = "Editar transação">
    </td>
    <td>
      <img onclick = "Transaction.remove(${transaction.id})" src = "./assets/minus.svg" alt = "Remover transação">
    </td>      
    `

    return html
  },

  updateBalance() {
    document.getElementById('incomeDisplay').innerHTML = Utils.formatCurrency(Transaction.incomes())
    document.getElementById('expenseDisplay').innerHTML = Utils.formatCurrency(Transaction.expenses())
    document.getElementById('totalDisplay').innerHTML = Utils.formatCurrency(Transaction.total())
  },

  clearTransactions() {
    DOM.transactionsContainer.innerHTML = ""
  }
}

const Utils = {
  formatAmount(value) {
    value = Number(value) * 100;
    return Math.round(value);
  },

  formatDate(date) {
    const splittedDate = date.split("-");
    return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`;
  },

  formatStringToDate(sDate) {
    const splittedDate = sDate.split("/");
    return `${splittedDate[2]}-${splittedDate[1]}-${splittedDate[0]}`;
  },

  formatCurrency(value) {
    const signal = Number(value) < 0 ? "-" : "";

    value = String(value).replace(/\D/g, "");
    value = Number(value) / 100;

    value = value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
    return signal + value
  },
};

const Form = {
  id: document.querySelector('input#id'),
  description: document.querySelector('input#description'),
  amount: document.querySelector('input#amount'),
  date: document.querySelector('input#date'),

  getValues() {
    return {
      id: Form.id.value,
      description: Form.description.value,
      amount: Form.amount.value,
      date: Form.date.value
    };
  },

  setValues(id, description, amount, date, ) {
    Form.id.value = id;
    Form.description.value = description;
    Form.amount.value = amount;
    Form.date.value = date;
  },

  validateFields() {
    const { description, amount, date } = Form.getValues()

    if (description.trim() === "" || amount.trim() === "" || date.trim() === "") {
      throw new Error("Por favor, preencha todos os campos")
    }
  },

  formatValues() {
    let { id, description, amount, date } = Form.getValues();

    amount = Utils.formatAmount(amount);
    date = Utils.formatDate(date)

    if (id) {
      id = Number(id);
    } else {
      id = Number(new Date().getTime());
    }

    return {
      id,
      description,
      amount,
      date
    };
  },

  clearFields() {
    Form.description.value = ""
    Form.amount.value = ""
    Form.date.value = ""
  },

  submit(event) {
    event.preventDefault()

    try {
      Form.validateFields()
      const transaction = Form.formatValues()
      Transaction.add(transaction)
      Form.clearFields()
      Modal.OpenClose()
    } catch (error) {
      alert(error.message)
    }
  }
}

const App = {
  init() {
    Transaction.all.forEach(DOM.addTransaction);

    DOM.updateBalance();
    changeColorCard.redCard();

    Storage.set(Transaction.all);
  },

  reload() {
    DOM.clearTransactions()
    App.init()
  },
}

App.init()