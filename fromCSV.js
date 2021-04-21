import fs from 'fs';

//Константы
const FILE_NAME = 'tmp.csv'

//Функции
const getTextFromFile = async () => {
    const textFromFile = await fs.readFileSync(FILE_NAME, 'utf8');
    return textFromFile;
}

const abc = (text) => {
    return text.split('\n')
}


// Описываем скрипт скрипт
const startScript = async () => {
    const textFromFile = await getTextFromFile();

    console.log(abc(textFromFile));
}
// Запускаем скрипт
startScript();