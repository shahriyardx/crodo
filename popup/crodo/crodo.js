const username = document.querySelector('.user p')
const todos_elem = document.querySelector('.todos')

const add_button = document.querySelector('.add-form .add-button')
const logout_button = document.querySelector('.logout-button')

const API_BASE = 'https://crodo.shahriyar.dev'

chrome.storage.local.get(["AUTH_TOKEN", "USER_ID", "USERNAME"], async function(data) {
    username.textContent = data.USERNAME

    const url = API_BASE + "/todo/list/"
    fetch(url, {
        method: "GET",
        mode: "cors",
        headers: {
            "Authorization": data.AUTH_TOKEN
        }
    })
    .then(response => response.json())
    .then(data => {
        todos = data['todos']

        let html = ""

        todos.forEach(todo => {
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
    })

    add_button.addEventListener('click', e => {
        e.preventDefault()
        
        const todo_field = document.querySelector('.todo-text')
        const todo_text = todo_field.value.trim()
    
        if (todo_text == '') {
            return
        }
    
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
            
            todo_field.value = ""

            const todo_id = data['todo_id']
            let html = `
            <div class="todo">
                <p>${todo_text}</p>
                <div class="done" data-tid=${todo_id}>
                    <i class='bx bx-check'></i>
                </div>
            </div>
            `

            todos_elem.innerHTML += html
        })
    })
    
    todos_elem.addEventListener('click', e => {
        if (e.target.classList.contains('done')) {
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
    chrome.storage.local.clear()

    window.location.href = "/popup/login/login.html"
})


