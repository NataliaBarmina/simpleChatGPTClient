
// объявляем глобальную переменную
let role = '';

// поле назначения пользователем стиля ответа
const triggerSelfSelect = document.querySelector('.userStyleAnswer');
triggerSelfSelect.addEventListener('change', getRoleFromSelfSelectField);

function getRoleFromSelfSelectField() {
    role = document.querySelector('.valueOfUserStyleAnswer').value;
    if (role === "") alert('заполните поле выбора стиля ответа');
}

// остальные  радио кнопки (кроме поля назначения пользователем стиля ответа)
const triggersRadio = document.querySelectorAll('.styleAnswer');
const targetsRadio = document.querySelectorAll('.valueOfStyleAnswer');

for (let i = 0; i < triggersRadio.length; i += 1) {
    triggersRadio[i].addEventListener('change', () => {
        role = targetsRadio[i].textContent
    })
}

// создаем массив или получаем массив из localStorage
const arr = JSON.parse(localStorage.getItem('key')) || [];

const trigger = document.querySelector('.submit');
trigger.addEventListener('click', sendPrompt);

async function sendPrompt() {

    const valueOfTextArea = document.querySelector('.textarea').value;
    console.log(`стиль: ${role}`);
    console.log(valueOfTextArea);

    if (role === targetsRadio[4].textContent || role === undefined || role === '') {
        prompt = valueOfTextArea;
    } else prompt = `${valueOfTextArea}.Дай ответ как ${role}`;

    console.log(role);
    console.log(prompt);

    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer "
            },

            body: JSON.stringify({
                "model": "gpt-3.5-turbo",
                "messages": [{ "role": "user", "content": prompt }],
                "temperature": 0.7
            })
        });
        const data = await response.json();
        const reply = await data.choices[0].message.content;

        createObject(prompt, reply);

        // переводим массив в строчный вид и сoздаем localStorage
        localStorage.setItem('key', JSON.stringify(arr));

        addPromptsToLayout();

    } catch (error) {
        console.error('Error:', error);
    }
}

function createObject(prompt, reply) {
    const object = {
        question: prompt,
        answer: reply,
    }
    arr.push(object);
}

const container = document.querySelector('.dialog');

function addPromptsToLayout() {

    const singleMessage = document.createElement('div');
    singleMessage.className = 'js-singleMessage';

    for (let i = 0; i < arr.length; i += 1) {
        singleMessage.innerHTML = `<p class = 'word'>Prompt:</p><p class ='value'>${arr[i].question}</p><p class = 'word'>Response:</p><p class ='value'>${arr[i].answer}</p>`;
    }
    container.prepend(singleMessage);
}

function showLayoutBeforeReboot() {

    for (let i = arr.length - 1; i >= 0; i -= 1) {

        const singleMessage = document.createElement('div');
        singleMessage.className = 'js-singleMessage';

        singleMessage.innerHTML = `<p class='word'>Prompt:</p><p class='value'>${arr[i].question}</p><p class='word'>Response:</p><p class='value'>${arr[i].answer}</p>`;

        container.append(singleMessage);
    }
}
showLayoutBeforeReboot();