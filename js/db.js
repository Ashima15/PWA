// offline data 
db.enablePersistence()
    .catch(err => {
        if(err.code === 'failed-precondition') {
            // multiple tabs open
            console.log('db persistence failed')
        } else if(err.code === 'unimplemented') {
            // not implemented in browser
            console.log('db persistence is not available yet')
        }
    })


// real time listener
db.collection('recipes').onSnapshot((snapshot) => {
    // console.log('doc changes', snapshot.docChanges());
    snapshot.docChanges().forEach(change => {
        // console.log(change, change.doc.data(), change.doc.id);
        if(change.type === 'added') {
            renderRecipes(change.doc.data(), change.doc.id);
        }
        if(change.type === 'removed') {
            removeRecipes(change.doc.id);
        }
    });
})

// adding data 
const form = document.querySelector('form');
form.addEventListener('submit', evt => {
    evt.preventDefault();

    const recipe = {
        title: form.title.value,
        ingredients: form.ingredients.value
    }

    db.collection('recipes').add(recipe)
        .catch(err => console.log(err));

    form.title.value = '';
    form.ingredients.value = '';
})

// removing data
const recipeContainer = document.querySelector('.recipes');
recipeContainer.addEventListener('submit', evt => {
    if(evt.target.tagName === 'I') {
        const id = evt.target.getAttribute('data-id');
        db.collection('recipes').doc(id).delete();
    }
})