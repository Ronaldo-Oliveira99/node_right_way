import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import '../node_modules/bootstrap-social/bootstrap-social.css';
import '../node_modules/font-awesome/css/font-awesome.min.css';

// @ts-ignore
import * as templates from './templates.ts';
import bundle = require('../lib/bundle');

/**
* Convenience method to fetch and decode JSON.
* Função de utilitário.
*  Para simplificar as solicitações ao back-end.
*/
const fetchJSON = async (url, method = 'GET') => {
    try {
        const response = await fetch(url, { method, credentials: 'same-origin' });
        return response.json();
    } catch (error) {
        return { error };
    }
};

const getBundles = async () => {
    const bundles = await fetchJSON('/api/list-bundles');
        if (bundles.error) {
            throw bundles.error;
        }
    return bundles;
    };


const addBundle = async (name) => {
    console.log('nome', name)
    try {
    // Grab the list of bundles already created.
        const bundles = await getBundles();
        // Add the new bundle.
        const url = `/api/bundle?name=${encodeURIComponent(name)}`;
        const method = 'POST';
        //const res = await fetchJSON(url, method);
        //const resBody = res;

        const resBody = await fetchJSON(url, method);
    // Merge => Mescle o novo pacote com os resultados originais e mostrá-los.
        bundles.push({id: resBody._id, name});
        listBundles(bundles);
        showAlert(`Bundle "${name}" created!`, 'success');

    } catch (err) {
        showAlert(err);
    }
};        

const listBundles = bundles => {
    const mainElement = document.body.querySelector('.b4-main');
    
    mainElement.innerHTML =
        templates.addBundleForm() + templates.listBundles({bundles});
    
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
        });
    }
};

/**
*Exclua os pacote com o ID especificado e liste os pacotes.

* EXERCICIOS
*Dentro do bloco try, sua tarefa é implementar o seguinte:
* Encontre o índice do bundleId selecionado na lista. (Se não houver correspondência
índice.
* Use getBundles() para recuperar a lista atual de bundles.
bundle, lance uma exceção explicando o problema.)
* Emita uma solicitação HTTP DELETE para o bundledId especificado usando fetch().
* Remova o pacote da lista de chamada splice(), passando o indice encontrado.
* Renderize a lista atualizada usando listBundles() e mostre uma mensagem de sucesso usando showAlert().
*/
const deleteBundle = async (bundleId) => {
    try {
    // Delete the bundle, then render the updated list with listBundles().
        
        const bundles = await getBundles();
        const idx = bundles.findIndex(index => index.id === bundleId)
        
        if(idx === -1) {
            throw 'indice nao encontrado'
        }

        const bundleName = bundles[idx].name

        const url = `/api/bundle/${encodeURIComponent(bundleId)}`;
        const method = 'DELETE';

        var delBundle = await fetch(url, {method:method});
        
        console.log('retorno', delBundle.json())
        
        // Merge => Mescle o novo pacote com os resultados originais e mostrá-los.
        bundles.splice(idx,1);

        listBundles(bundles);
    
        showAlert(`Bundle ${bundleName} deleted!`, 'success');
    }catch (err) {
        showAlert(err);
    }
};
    

/**
* Mostra um alerta para o usuário.
*/
const showAlert = (message, type = 'danger') => {
    const alertsElement = document.body.querySelector('.b4-alerts');
    const html = templates.alert({type, message});
    alertsElement.insertAdjacentHTML('beforeend', html);
  };
// const showAlert = (message, type = 'danger') => {
//     const html = templates.alert({ type, message });
//     alertsElement.insertAdjacentHTML('beforeend', html);
// };


/**
 * Use Window location hash para mostrar uma view especifica.
 */
const showView = async () => {
    const mainElement = document.body.querySelector('.b4-main');
    const [view, ...params] = window.location.hash.split('/');

    switch (view) {
        case '#welcome':
            //     mainElement.innerHTML = templates.welcome();
            //     break;

            const session = await fetchJSON('/api/session');
            mainElement.innerHTML = templates.welcome({ session });
            if (session.error) {
                showAlert(session.error);
            }
            break;

            case '#list-bundles':
                try {
                    const bundles = await getBundles();
                    listBundles(bundles);
                } catch (err) {
                    showAlert(err);
                    window.location.hash = '#welcome';
            }
            break;
            

        // case '#list-bundles':

        //     const bundles = await getBundles();
        //     console.log('bundles_init', bundles)

        //     listBundles(bundles);
        //     break;

        default:
            // Unrecognized view.
            throw Error(`Unrecognized view: ${view}`);
    }
};


// Page setup atualizado
(async () => {
    const session = await fetchJSON('/api/session');
    document.body.innerHTML = templates.main({ session });
    window.addEventListener('hashchange', showView);
    showView().catch(err => window.location.hash = '#welcome');
})();



/**
 * Obtem informações dos pacotes e index
 */
        // const getBundles = async () => {
        //     const esRes = await fetch('/es/b4/bundle/_search?size=1000');
        //     const esResBody = await esRes.json();
        //     return esResBody.hits.hits.map(hit => ({
        //         id: hit._id,
        //         name: hit._source.name,
        //     }));
        // };

/**
 * renderiza e lista os bundles 
 */
        // const listBundles = bundles => {
        //     mainElement.innerHTML = templates.addBundleForm() + templates.listBundles({ bundles });

        //     const form = mainElement.querySelector('form');
        //     form.addEventListener('submit', event => {
        //         event.preventDefault();
        //         const name = form.querySelector('input').value;
        //         addBundle(name);
        //     });

        //     const deleteButtons = mainElement.querySelectorAll('button.delete');
        //     for (let i = 0; i < deleteButtons.length; i++) {
        //         const deleteButton = deleteButtons[i];
        //         deleteButton.addEventListener('click', event => {
        //             deleteBundle(deleteButton.getAttribute('data-bundle-id'));
        //             //deleteBundle(deleteButton);
        //         });
        //     }

        // };

/**
* Exclua o pacote com o ID especificado e liste os pacotes.
*/
        // const deleteBundle = async (bundleId) => {
        //     try {
        //         // EXERCICIOS - Exclua o pacote e renderize a lista atualizada com listBundles().

        //         // TODO 1- Use getBundles() para recuperar a lista atual de bundles.
        //         const bundles = await getBundles();
        //         const bundleId_2 = `${bundleId}tt`;



        //         /* TODO 2- Encontre o índice do bundleId selecionado na lista. (Se não houver correspondência
        //             bundle, lance uma exceção explicando o problema.) */
        //         const idx = bundles.findIndex((index) => index.id === bundleId)
        //         if (idx === -1) {
        //             throw 'indice não encontrado'
        //         }
        //         console.log('idx', idx);

        //         // TODO 3- Emita uma solicitação HTTP DELETE para o bundleId especificado usando fetch()
        //         const url = `/api/bundle/${encodeURIComponent(bundleId)}`;
        //         await fetch(url, { method: 'DELETE' })

        //         // TODO 4- Remova o pacote da lista chamando splice(), passando o indice encontrado
        //         bundles.splice(idx, 1);

        //         /* TODO 5- Renderize a lista atualizada usando listBundles() e mostre uma mensagem de sucesso 
        //                 usando showAlert(). */
        //         listBundles(bundles);
        //         showAlert(`Bundle deleted!`, 'success');

        //     } catch (err) {
        //         showAlert(err);
        //         console.log('erro+trow', err)
        //     }
        // };




/**
* Create a new bundle with the given name, then list bundles.
*/
        // const addBundle = async (name) => {
        //     try {
        //         // Pegue a lista de bundles já criados.
        //         const bundles = await getBundles();
        //         console.log('bundles_add', bundles)
        //         // Adicione o novo pacote.(bundle)
        //         const url = `/api/bundle?name=${encodeURIComponent(name)}`;
        //         const res = await fetch(url, { method: 'POST' });
        //         const resBody = await res.json();
        //         // Mescle o novo pacote com os resultados originais e mostre-os.
        //         bundles.push({ id: resBody._id, name });

        //         console.log('bundles_add_push', bundles)

        //         listBundles(bundles);
        //         showAlert(`Bundle "${name}" created!`, 'success');
        //     } catch (err) {
        //         showAlert(err);
        //     }
        // };

// BAD IMPLEMENTATION! Subject to stale data due to eventual consistency.
        // const addBundle_bad = async (name) => {
        //     try {
        //         // Adicione o novo pacote.(bundle)
        //         const url = `/api/bundle?name=${encodeURIComponent(name)}`;
        //         const res = await fetch(url, { method: 'POST' });
        //         const resBody = await res.json();
        //         // Pegue a lista de todos os pacotes, esperando que o novo esteja na lista.
        //         // Devido à consistência eventual, o novo pacote pode estar faltando!
        //         const bundles = await getBundles();
        //         listBundles(bundles);
        //         showAlert(`Bundle "${name}" created!`, 'success');
        //     } catch (err) {
        //         showAlert(err);
        //     }
        // };

/*
// Initial listBundles shell.
const listBundles = bundles => {
  mainElement.innerHTML = templates.listBundles({bundles});
};
*/


/**
* Use Window location hash to show the specified view.
*/
        // window.addEventListener('hashchange', showView);
        // showView().catch(err => window.location.hash = '#welcome');


/*
// Version using Handlebars.
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import * as templates from './templates.ts';

// Page setup.
document.body.innerHTML = templates.main();
const mainElement = document.body.querySelector('.b4-main');
const alertsElement = document.body.querySelector('.b4-alerts');

mainElement.innerHTML = templates.welcome();
alertsElement.innerHTML = templates.alert({
  type: 'info',
  message: 'Handlebars is working!',
});
 */

/*
// Initial version.
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import * as templates from './templates.ts';

document.body.innerHTML = templates.main;

const mainElement = document.body.querySelector('.b4-main');
const alertsElement = document.body.querySelector('.b4-alerts');

mainElement.innerHTML = templates.welcome;
alertsElement.innerHTML = templates.alert;
 */
