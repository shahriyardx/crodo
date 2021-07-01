const username = document.querySelector('.user p')
const todos_elem = document.querySelector('.todos')

const add_todo_form = document.querySelector('.add-todo-form')
const add_button = document.querySelector('.add-form .add-button')
const logout_button = document.querySelector('.logout-button')

const API_BASE = 'https://crodo.shahriyar.dev'

chrome.storage.local.get(["AUTH_TOKEN", "USER_ID", "USERNAME", "TODOS"], async function(data) {
    username.textContent = data.USERNAME

    TODOS = data.TODOS ? data.TODOS : []

    let html = ""

    TODOS.forEach(todo => {
        html += `
        <div class="todo">
            <p>${todo[1]}</p>
            <div class="done" data-tid=${todo[0]}>
                <i class='bx bx-check'></i>
            </div>
        </div>
        `
    });

    todos_elem.innerHTML = html

    add_button.addEventListener('click', e => {
        e.preventDefault();
        add_todo(e);
    })

    function getClass(length) {
        var result           = '';
        var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        var charactersLength = characters.length;

        for ( var i = 0; i < length; i++ ) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
       return result;
    }
    
    add_todo_form.addEventListener('submit', e => {
        e.preventDefault()

        add_todo(e);
    })

    function add_todo(e) {
        const todo_field = document.querySelector('.todo-text')
        const todo_text = todo_field.value.trim()
    
        if (todo_text == '') {
            return
        }

        var u_id = getClass(5)
        todo_field.value = ""

        let html = `
        <div class="todo ${u_id}">
            <p>${todo_text}</p>
            <div class="done" data-tid="">
                <i class='bx bx-check'></i>
            </div>
        </div>
        `
        todos_elem.innerHTML += html
    
        const url = API_BASE + "/todo/create/"
    
        fetch(url, {
            method: "POST",
            mode: "cors",
            body: JSON.stringify({
                todo: todo_text
            }),
            headers: {
                "Authorization": data.AUTH_TOKEN
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data['error']) {
                return
            }

            const todo_id = data['todo_id']
            
            pending_todo = document.querySelector(`.${u_id}`)
            pending_todo.classList.remove(u_id)
            pending_todo.querySelector('.done').setAttribute('data-tid', todo_id)

            TODOS.push([todo_id, todo_text])

            chrome.storage.local.set({
                TODOS: TODOS
            })
        })
    }

    todos_elem.addEventListener('click', e => {
        if (e.target.classList.contains('done')) {
            e.target.classList.add('active')

            icon = e.target.querySelector('i')

            icon.classList.remove('bx-check')
            icon.classList.add('bx-loader-circle')

            const tid = e.target.dataset.tid
            const url = API_BASE + "/todo/complete/"

            fetch(url, {
                method: "POST",
                mode: "cors",
                headers: {
                    "Authorization": data.AUTH_TOKEN
                },
                body: JSON.stringify({"todo_id": tid})
            })
            .then(response => response.json())
            .then(data => {
                if (data['error'] == '') {
                    return
                }

                e.target.parentElement.remove()

                chrome.storage.local.get('TODOS', async function(todos) {
                    todos = todos['TODOS']

                    filtered_todos = todos.filter(todo => todo[0] != tid)
                    console.log(filtered_todos)

                    chrome.storage.local.set({
                        TODOS: filtered_todos
                    })
                })
            })
        }

        console.log(e.target.classList)

        if (e.target.classList.contains('todo')) {
            const todo_content = e.target.querySelector('p').textContent

            
            const pop = document.querySelector('.pop')
            pop.querySelector('.content').textContent = todo_content

            pop.style.display = "flex"

            pop.addEventListener('click', e => {
                if (e.target.classList.contains('pop')) {
                    e.target.style.display = "none"
                }
            })
        }
    })

})

logout_button.addEventListener('click', e => {
    chrome.storage.local.set({
        AUTH_TOKEN : '',
        TODOS: []
    })

    window.location.href = "/popup/login/login.html"
})


