import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
// @ts-ignore
import * as templates from './templates.ts';

const getBundles = async () => {
    const esRes = await fetch('/es/b4/bundle/_search?size=1000');
    const esResBody = await esRes.json();
    return esResBody.hits.hits.map(hit => ({
        id: hit._id,
        name: hit._source.name,
    }));
};

// renderiza e lista os bundles
const listBundles = bundles => {
    mainElement.innerHTML = templates.addBundleForm() + templates.listBundles({ bundles });

    const form = mainElement.querySelector('form');
    form.addEventListener('submit', event => {
        event.preventDefault();
        const name = form.querySelector('input').value;
        addBundle(name);
    });

    const deleteButtons = mainElement.querySelectorAll('button.delete');
    for (let i = 0; i < deleteButtons.length; i++) {
        const deleteButton = deleteButtons[i];
        deleteButton.addEventListener('click', event => {
           deleteBundle(deleteButton.getAttribute('data-bundle-id'));
            //deleteBundle(deleteButton);
        });
    }

};

/**
* Create a new bundle with the given name, then list bundles.
*/
const addBundle = async (name) => {
    try {
        // Pegue a lista de bundles já criados.
        const bundles = await getBundles();
        console.log('bundles_add', bundles)
        // Adicione o novo pacote.(bundle)
        const url = `/api/bundle?name=${encodeURIComponent(name)}`;
        const res = await fetch(url, { method: 'POST' });
        const resBody = await res.json();
        // Mescle o novo pacote com os resultados originais e mostre-os.
        bundles.push({ id: resBody._id, name });

        console.log('bundles_add_push', bundles)

        listBundles(bundles);
        showAlert(`Bundle "${name}" created!`, 'success');
    } catch (err) {
        showAlert(err);
    }
};

// BAD IMPLEMENTATION! Subject to stale data due to eventual consistency.
const addBundle_bad = async (name) => {
    try {
        // Adicione o novo pacote.(bundle)
        const url = `/api/bundle?name=${encodeURIComponent(name)}`;
        const res = await fetch(url, { method: 'POST' });
        const resBody = await res.json();
        // Pegue a lista de todos os pacotes, esperando que o novo esteja na lista.
        // Devido à consistência eventual, o novo pacote pode estar faltando!
        const bundles = await getBundles();
        listBundles(bundles);
        showAlert(`Bundle "${name}" created!`, 'success');
    } catch (err) {
        showAlert(err);
    }
};

/**
* Exclua o pacote com o ID especificado e liste os pacotes.
*/
const deleteBundle = async (bundleId) => {
    try {
        // EXERCICIOS - Exclua o pacote e renderize a lista atualizada com listBundles().

        // TODO 1- Use getBundles() para recuperar a lista atual de bundles.
        const bundles = await getBundles();
        const bundleId_2 = `${bundleId}tt`;
        
        
        
        /* TODO 2- Encontre o índice do bundleId selecionado na lista. (Se não houver correspondência
            bundle, lance uma exceção explicando o problema.) */
            const idx = bundles.findIndex((index) => index.id === bundleId)
            if(idx === -1){
                throw 'indice não encontrado'
            }    
            console.log('idx',idx);
          
        // TODO 3- Emita uma solicitação HTTP DELETE para o bundleId especificado usando fetch()
            const url = `/api/bundle/${encodeURIComponent(bundleId)}`;
            await fetch(url, { method: 'DELETE' })
            
        // TODO 4- Remova o pacote da lista chamando splice(), passando o indice encontrado
             bundles.splice(idx,1);
          
        /* TODO 5- Renderize a lista atualizada usando listBundles() e mostre uma mensagem de sucesso 
                   usando showAlert(). */
            listBundles(bundles);
            showAlert(`Bundle deleted!`, 'success');
    
    } catch (err) {
        showAlert(err);
        console.log('erro+trow', err)
    }
};
/**
* Show an alert to the user.
*/
const showAlert = (message, type = 'danger') => {
    const html = templates.alert({ type, message });
    alertsElement.insertAdjacentHTML('beforeend', html);
};




// Page setup.
document.body.innerHTML = templates.main();
const mainElement = document.body.querySelector('.b4-main');
const alertsElement = document.body.querySelector('.b4-alerts');

// mainElement.innerHTML = templates.welcome();
// alertsElement.innerHTML = templates.alert({
//     type: 'info',
//     message: 'Handlebars is working'
// });

/**
* Use Window location hash to show the specified view.
*/
const showView = async () => {
    const [view, ...params] = window.location.hash.split('/');
    switch (view) {
        case '#welcome':
            mainElement.innerHTML = templates.welcome();
            break;

        case '#list-bundles':

            const bundles = await getBundles();
            console.log('bundles_init', bundles)

            listBundles(bundles);
            break;

        default:
            // Unrecognized view.
            throw Error(`Unrecognized view: ${view}`);
    }
};

window.addEventListener('hashchange', showView);

showView().catch(err => window.location.hash = '#welcome');

