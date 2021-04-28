import fs from 'fs';
import _ from 'lodash';

// Константы
const PATH_TO_LOAD_FILE = "../CSV/desktop.csv";
const PATH_TO_WRITE_FILE = './result-desk';

//Получаем данные из CSV файла
const getContentFromFile = async (path) => {
    return fs.readFileSync(path, 'utf8');
}

//Преобразуем файл в массив строк
const getObjectFromFiles = async (file) => {
    let result = {};
    let fileSplitting = file.split('\n');
    let massiveStrings = fileSplitting.map(str => str.split(';'));
    massiveStrings.pop();

    let massiveObjects = [];
    massiveStrings.map(str => {
        let arrayNames = [];
        arrayNames.push(str[0]);

        let arrayKeys = str[1].split('.');
        arrayKeys.shift();

        let arrayValues = [];
        arrayValues.push(str[2].slice(0, -1));

        let resultObject = {
            file: arrayNames[0],
            propertyPath: arrayKeys,
            value: arrayValues[0],

        };
        massiveObjects.push(resultObject);
    })

    for (let obj of massiveObjects){
        if(!result.hasOwnProperty(obj.file)){
            result[obj.file] = {}
        }
       _.set(result[obj.file], obj.propertyPath, obj.value);
    }
    console.log(JSON.stringify(result, null, 2))
    return result;
}

// Описываем скрипт
const runScript = async () => {
    let file = await getContentFromFile(PATH_TO_LOAD_FILE);
    let objectFiles = await getObjectFromFiles(file);

    // Проверяем существует ли такая папка
    await fs.access (PATH_TO_WRITE_FILE, fs.constants.R_OK, (err) => {
        if (err) writeFileFunc();
        else removeFolderWriteFile();
    });

    // Удаляем папку, запускаем ф-ию writeFile
    let removeFolderWriteFile = async () => {
        await fs.rmdirSync(PATH_TO_WRITE_FILE, { recursive: true });
        await writeFileFunc();
    }

    // Создаем папку, пишем файлы
    let writeFileFunc = async () => {
        await fs.mkdir(PATH_TO_WRITE_FILE, (err) => {
            if (err) throw err;
        });
        await Object.entries(objectFiles).forEach(([key, value]) => {
            writeFileLineByLine(PATH_TO_WRITE_FILE, `${key}.js`, value);
        });
    }

    // Функция построчной запись файла
    const writeFileLineByLine = async (path, fileName, file) => {
        let fileLikeObjectModules = fs.createWriteStream(`${path}/${fileName}`, {
            flags: 'a'
        });
        let preparedFileToFormattedJSON = JSON.stringify(file, null, 2);

        fileLikeObjectModules.write('export default ')
        fileLikeObjectModules.write(preparedFileToFormattedJSON)
    }
};

// Запускаем скрипт
runScript();