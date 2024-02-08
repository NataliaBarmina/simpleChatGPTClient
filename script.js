const ELEMENTS = {
    // создаем массив или получаем массив из localStorage
    restoredMessages: JSON.parse(localStorage.getItem('key')) || [],

    // радио кнопки
    presetContainer: document.querySelector('.choiceOfResponseStyle'),
    allRadioButtons: document.querySelectorAll('.js-radioButton'),
    withoutStyle: document.querySelector('.js-withoutStyle').textContent,
    customPresetRadioButton: document.querySelector('.js-custom-preset-option'),
    labelForSelfAssignmentRole: document.querySelector('.js-input'),

    //инпут
    customPresetInput: document.querySelector('.js-custom-preset-input'),

    // кнопка отправить форму
    sendingPrompt: document.querySelector('.submit'),

    // контейнер для верстки
    container: document.querySelector('.dialog'),
};

// объявляем глобальную переменную - стиль ответа
let role = '';

// делаем инпут активным при выборе радио кнопки
(function initActiveInput() {
    const { customPresetRadioButton, customPresetInput } = ELEMENTS;

    customPresetRadioButton.addEventListener('change', () => {
        customPresetInput.disabled = false;
    })
})();

// находим role при вводе пользователем своего значения 
(function initCustomersRole() {
    const { customPresetInput } = ELEMENTS;
    customPresetInput.addEventListener('input', () => {
        role = customPresetInput.value;
    })
})();

// событие на остальных радио кнопках (кроме поля назначения пользователем стиля ответа)
(function initRoleOnOtherRadioButton() {
    const { presetContainer } = ELEMENTS;
    presetContainer.addEventListener('click', (event) => {
        let target = event.target;
        if (!target.classList.contains('js-preset-option')) return;
        role = target.nextSibling.textContent;
    })
})();

// событие при нажатии на кнопку - отправление запроса
(function initSendPrompt() {
    const { sendingPrompt } = ELEMENTS;
    sendingPrompt.addEventListener('click', sendPrompt);
})();

async function sendPrompt() {
    const { withoutStyle, restoredMessages } = ELEMENTS;

    const rawPrompt = document.querySelector('.textarea').value;
    let prompt;

    if (role === withoutStyle || !role) {
        prompt = rawPrompt;
    } else prompt = `${rawPrompt}. Дай ответ как ${role}`;

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

        //!!!!!!!!!! УДАЛИТЬ
        console.log(`стиль: ${role}`);
        console.log(`question: ${rawPrompt}`);
        console.log(`prompt: ${prompt}`);

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
    const { restoredMessages } = ELEMENTS;
    const object = {
        question: prompt,
        answer: reply,
    }
    restoredMessages.push(object);
}

// добавляем верстку для вопросов и ответов 
function addPromptsToLayout(arr) {
    const { container } = ELEMENTS;
    const singleMessage = document.createElement('div');
    singleMessage.className = 'js-singleMessage';

    for (let i = 0; i < arr.length; i += 1) {
        singleMessage.innerHTML = `<p class = 'word'>Prompt:</p><p class ='value'>${arr[i].question}</p><p class = 'word'>Response:</p><p class ='value'>${arr[i].answer}</p>`;
    }
    container.prepend(singleMessage);
}


// добавляем верстку для элементов, сохраненных localStorage 
(function showLayoutBeforeReboot() {
    const { restoredMessages, container } = ELEMENTS;

    for (let i = restoredMessages.length - 1; i >= 0; i -= 1) {

        const singleMessage = document.createElement('div');
        singleMessage.className = 'js-singleMessage';

        singleMessage.innerHTML = `<p class='word'>Prompt:</p><p class='value'>${restoredMessages[i].question}</p><p class='word'>Response:</p><p class='value'>${restoredMessages[i].answer}</p>`;

        container.append(singleMessage);
    }
})();

//! ПОСЛЕ ОТПРАВКИ ПРОМПТА УБИРАЕМ:

// назначенный пользователем стиль ответа
function resetInput() {
    const { labelForSelfAssignmentRole } = ELEMENTS;
    labelForSelfAssignmentRole.innerHTML = "<input class = 'js-custom-preset-input' type= 'text' placeholder='Введите свой тест' disabled='true'>";
}

// выбор радиокнопки
function resetChecked() {
    const { allRadioButtons } = ELEMENTS;
    for (let i = 0; i < allRadioButtons.length; i += 1) {
        allRadioButtons[i].checked = false;
    }
}

// выбранный стиль ответа 
function resetRole() {
    role = '';
}