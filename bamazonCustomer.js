var mysql = require('mysql');
var inquire = require('inquirer');

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "root",
    database: "bamazon"
});


connection.connect(function (err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId + "\n");
    displayProducts();
})

function displayProducts() {
    //displaying all product information from products table
    console.log('displaying all products')
    connection.query('select * from products', function (err, res) {
        if (err) throw err;
        console.log(res);
        buyProducts();
    })
}
function buyProducts() {
    //selecting all products from table
    connection.query('select * from products', function (err, res) {
        if (err) throw err;
        //prompting user for input
        inquire.prompt([
            {
                name: 'purchase',
                type: 'rawlist',
                message: 'what is the name of the product you would like to buy?',
                choices: function() {
                    //looping through data and adding it to list of choices
                    var productArr = [];
                    for (var i = 0; i < res.length; i++) {
                        productArr.push(res[i].product_name)
                    }
                    return productArr;
                }
            },
            {
                name: 'quantity',
                type: 'input',
                message: 'how many would you like to buy?'
                
            }
        ]).then(function (answer) {
            //linking actualy item in table to users response
            var chosenItem;
            for (var i = 0; i < res.length; i++) {
              if (res[i].product_name === answer.purchase) {
                chosenItem = res[i];
              }
            }
            // if low stock return this
            if (chosenItem.stock_quantity < answer.quantity) {
                console.log('Insufficient Quantity!')
                connection.end();
            } else {
                //if avalailable stock update mysql table
                var remaining = chosenItem.stock_quantity - answer.quantity;
                connection.query('UPDATE products SET ? WHERE ?',
                [
                  {
                      stock_quantity: remaining
                  },
                    {
                        product_name: chosenItem.product_name
                    }
                ], function(err) {
                    if (err) throw err;
                })
                //log what you bought, how many, and total price
                var totalCost = answer.quantity * chosenItem.price
                console.log(`you bought ${answer.quantity} ${answer.purchase}, it cost you ${totalCost} dollars`)
                connection.end();
            }


        })
    })

}

