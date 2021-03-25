let store = {}

let user

store.set('user-1',{name:'Peter'})
    .then(res=> store.get('user-1'))
    .then(userRes=>{
        user = userRes
        report()
    })

async function main(){
    try {
        await store.set('user-1', {name: 'Peter'})
        user = await store.get('user-1')
        report()
    } catch (e) {
        console.error(e)
    }
}

function report(){
    console.log(user)
}
