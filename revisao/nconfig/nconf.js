var nconf = require('../../web-services/b4/node_modules/nconf');

//nconf.use('file', {file:'./web-services/estudo/config.json' });
nconf.use('file', {file:`${__dirname}/config.json` });
nconf.load();
nconf.set('name', 'Avian');
nconf.set('dessert:name', 'Ice Cream');
nconf.set('dessert:flavor', 'chocolate');

console.log(nconf.get('dessert'));
console.log(nconf.get('dessert:name'));

nconf.save(function(err){
    if(err){
        console.error(err.message);
        return;
    }
    console.log('Configuration saved sucessfully');
    console.log(`${__dirname}/config.json`);
})