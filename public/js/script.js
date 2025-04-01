const tableBody = document.getElementById('table-body')
const input = document.getElementById('input')
const button = document.getElementById('button')

async function getData() {
    const resp = await fetch('/api')
    const data = await resp.json()

    tableBody.innerHTML = ''

    data.ids.forEach(obj => {
        const el = document.createElement('tr')
        const url = `${window.location.origin}/api/${obj.shortId}`
        el.innerHTML = `
            <tr>
                <td><a href="${url}" target="_blank">${obj.shortId}</a>
                    <br>
                    <p class="long-url">${obj.longUrl}</p>
                </td>
                <td>${obj.clicks}</td>
                <td><i class="fa-solid fa-copy icon" onclick="copy('${url}')"></i></td>
            </tr>
        `
        tableBody.appendChild(el)
    });
}

button.addEventListener('click', async () => {
    const inputValue = input.value
    if(inputValue === '') return
    
    const resp = await fetch('/api/shorten', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            longUrl: inputValue
        })
    })

    if(resp.ok){
        input.value = ''
        getData()
    }
})

function copy(content) {
    navigator.clipboard.writeText(content);
    alert("Copied to clipboard!");
}

getData()