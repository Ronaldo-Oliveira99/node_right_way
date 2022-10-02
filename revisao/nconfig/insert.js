var fs = require('fs');

var myOptions = {
    name: 'Avian',
    desert: 'cake',
    flavor:'chocolate',
    beverage:'coffee',
    japanese:'sushi'
}

var data = JSON.stringify(myOptions);

fs.writeFile(`${__dirname}/config.json`, data, function(err){
    if(err){
        console.log('There has been an error saving your configuration data.');
        console.log(err.message);
        return;
    }

    console.log('Configuration saved successfully')
})