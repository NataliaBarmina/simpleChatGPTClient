const ELEMENTS = {
    // создаем массив или получаем массив из localStorage
    restoredMessages: JSON.parse(localStorage.getItem('key')) || [],

    // радио кнопки
    presetContainer: document.querySelector('.choiceOfResponseStyle'),
    allRadioButtons: document.querySelectorAll('.js-radioButton'),
    noPresetOption: document.querySelector('.js-withoutStyle').textContent,
    customPresetOption: document.querySelector('.js-custom-preset-option'),
    customPresetInputWrapper: document.querySelector('.js-custom-preset-input-wrapper'),
    // customPresetInputWrapper
    //инпут
    customPresetInput: document.querySelector('.customPresetInput'),

    // кнопка отправить форму
    submitPromptButton: document.querySelector('.submit'),

    // контейнер для верстки
    dialogContainer: document.querySelector('.dialog'),
};

// объявляем глобальную переменную - стиль ответа
const state = { role: '' };
const setState = (nextRole) => {
    state.role = nextRole
}

// делаем инпут активным при выборе радио кнопки и находим role при вводе пользователем своего значения 
function initCustomRole() {
    const { customPresetOption, customPresetInput } = ELEMENTS;

    customPresetOption.addEventListener('change', () => {
        customPresetInput.disabled = false;
        customPresetInput.focus();
    })
    customPresetInput.addEventListener('input', () => {
        setState(customPresetInput.value);
    })
};

// событие на остальных радио кнопках (кроме поля назначения пользователем стиля ответа)
function initDefaultRoles() {
    const { presetContainer, customPresetInput } = ELEMENTS;
    presetContainer.addEventListener('click', (event) => {
        const target = event.target;
        if (!target.classList.contains('js-preset-option')) return;
        setState(target.nextSibling.textContent);
        customPresetInput.disabled = true;
    })
};

// событие при нажатии на кнопку - отправление запроса
function initSendPrompt() {
    const { submitPromptButton } = ELEMENTS;
    submitPromptButton.addEventListener('click', sendPrompt);
};

async function sendPrompt() {
    const { noPresetOption } = ELEMENTS;
    const rawPrompt = document.querySelector('.textarea').value;
    const prompt = (state.role === noPresetOption || !state.role) ? rawPrompt : `${rawPrompt}. Дай ответ как ${state.role}`;

    try {
        const response = await createRequest(prompt);

        //!!!!!!!!!! УДАЛИТЬ
        console.log(`стиль: ${state.role}`);
        console.log(`question: ${rawPrompt}`);
        console.log(`prompt: ${prompt}`);

        addReceivedDataToPage(prompt, response);

    } catch (error) {
        console.error('Error:', error);
    }
}

async function createRequest(prompt) {
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
    return data.choices[0].message.content;
}

function addReceivedDataToPage(prompt, response) {
    const { restoredMessages } = ELEMENTS;
    const couple = getPromptAnswerCouple(prompt, response);
    restoredMessages.push(couple);

    addPromptsToLayout(restoredMessages);

    resetInput();
    resetChecked();
}

function getPromptAnswerCouple(prompt, response) {
    return object = {
        question: prompt,
        answer: response,
    }
}

// добавляем верстку для вопросов и ответов 
function addPromptsToLayout(arr) {
    const { dialogContainer, restoredMessages } = ELEMENTS;

    // переводим массив в строчный вид и сoздаем localStorage
    localStorage.setItem('key', JSON.stringify(restoredMessages));

    const singleMessage = document.createElement('div');
    singleMessage.className = 'singleMessage';

    for (let i = 0; i < arr.length; i += 1) {
        singleMessage.innerHTML = `<p class = 'word'>Prompt:</p><p class ='value'>${arr[i].question}</p><p class = 'word'>Response:</p><p class ='value'>${arr[i].answer}</p>`;
    }
    dialogContainer.prepend(singleMessage);
}


// добавляем верстку для элементов, сохраненных localStorage 
function showPreviousDialogs() {
    const { restoredMessages, dialogContainer } = ELEMENTS;

    for (let i = restoredMessages.length - 1; i >= 0; i -= 1) {

        const singleMessage = document.createElement('div');
        singleMessage.className = 'singleMessage';

        singleMessage.innerHTML = `<p class='word'>Prompt:</p><p class='value'>${restoredMessages[i].question}</p><p class='word'>Response:</p><p class='value'>${restoredMessages[i].answer}</p>`;

        dialogContainer.append(singleMessage);
    }
};

//! ПОСЛЕ ОТПРАВКИ ПРОМПТА УБИРАЕМ:

// назначенный пользователем стиль ответа
function resetInput() {
    setState('');
    const { customPresetInputWrapper } = ELEMENTS;
    customPresetInputWrapper.innerHTML = "<input class = 'customPresetInput' type= 'text' placeholder='Введите свой тест' disabled='true'>";
}

// выбор радиокнопки
function resetChecked() {
    const { allRadioButtons } = ELEMENTS;
    for (let i = 0; i < allRadioButtons.length; i += 1) {
        allRadioButtons[i].checked = false;
    }
}