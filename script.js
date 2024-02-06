
// объявляем глобальную переменную - стиль ответа
let role = '';

// делаем инпут активным при выборе радио кнопки
const customPresetRadioButton = document.querySelector('.js-custom-preset-option');
const customPresetInput = document.querySelector('.js-custom-preset-input');

customPresetRadioButton.addEventListener('change', () => {
    customPresetInput.disabled = false;
})

// находим role при вводе пользователем своего значения 
customPresetInput.addEventListener('input', getRole);

function getRole() {
    role = customPresetInput.value;
}

// событие на остальных радио кнопках (кроме поля назначения пользователем стиля ответа)
const presetContainer = document.querySelector('.choiceOfResponseStyle');
presetContainer.addEventListener('click', getRoleOnOtherRadioButton);

function getRoleOnOtherRadioButton(event) {
    let target = event.target;
    if (!target.classList.contains('js-preset-option')) return;
    role = target.nextSibling.textContent;
}

// создаем массив или получаем массив из localStorage
const restoredMessages = JSON.parse(localStorage.getItem('key')) || [];

// событие при нажатии на кнопку - отправление запроса
const trigger = document.querySelector('.submit');
trigger.addEventListener('click', sendPrompt);


async function sendPrompt() {

    const rawPrompt = document.querySelector('.textarea').value;
    const withoutStyle = document.querySelector('.js-withoutStyle').textContent;
    let prompt;

    if (role === withoutStyle || !role) {
        prompt = rawPrompt;
    } else prompt = `${rawPrompt}. Дай ответ как ${role}`;

    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer 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"
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
        localStorage.setItem('key', JSON.stringify(restoredMessages));

        addPromptsToLayout(restoredMessages);
        resetInput();
        resetChecked();
        resetRole();

    } catch (error) {
        console.error('Error:', error);
    }
}

function createObject(prompt, reply) {
    const object = {
        question: prompt,
        answer: reply,
    }
    restoredMessages.push(object);
}

// добавляем верстку для вопросов и ответов 
const container = document.querySelector('.dialog');

function addPromptsToLayout(arr) {

    const singleMessage = document.createElement('div');
    singleMessage.className = 'js-singleMessage';

    for (let i = 0; i < arr.length; i += 1) {
        singleMessage.innerHTML = `<p class = 'word'>Prompt:</p><p class ='value'>${arr[i].question}</p><p class = 'word'>Response:</p><p class ='value'>${arr[i].answer}</p>`;
    }
    container.prepend(singleMessage);
}


// добавляем верстку для элементов, сохраненных localStorage 
function showLayoutBeforeReboot(arr) {

    for (let i = arr.length - 1; i >= 0; i -= 1) {

        const singleMessage = document.createElement('div');
        singleMessage.className = 'js-singleMessage';

        singleMessage.innerHTML = `<p class='word'>Prompt:</p><p class='value'>${arr[i].question}</p><p class='word'>Response:</p><p class='value'>${arr[i].answer}</p>`;

        container.append(singleMessage);
    }
}
showLayoutBeforeReboot(restoredMessages);

//! ПОСЛЕ ОТПРАВКИ ПРОМПТА УБИРАЕМ:

// убираем назначенный пользователем стиль ответа
function resetInput() {
    const label = document.querySelector('.js-input');
    label.innerHTML = "<input class = 'js-custom-preset-input' type= 'text' placeholder='Введите свой тест' disabled='true'>";
}

// убираем выбор радиокнопки
function resetChecked() {
    const b = document.querySelectorAll('.js-radioButton');

    for (let i = 0; i < b.length; i += 1) {
        b[i].checked = false;
    }
}

// убираем выбранный стиль ответа 
function resetRole() {
    role = '';
}