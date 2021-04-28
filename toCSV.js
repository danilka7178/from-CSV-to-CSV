import fs from 'fs';

// Константы
const CSV_FILE_NAME = 'tmp.csv'; //tmp-desktop.csv
const PATH_TO_FILES = '../artr-mobile-app/app/i18n'; // ../desktop-wallet/src/i18n

// Функции
// Находим файлы, получаем пути
const getPathsToFiles = function (dir, files_){
    files_ = files_ || [];
    let files = fs.readdirSync(dir);
    for (let file in files){
        let name = dir + '/' + files[file];
        if (fs.statSync(name).isDirectory()){
            getPathsToFiles(name, files_);
        } else {
            files_.push(name);
        }
    }
    const pathsToFiles = [];
    for (let file of files_) {
        const lastMassiveEl = file.split('/')[file.split('/').length - 1];
        if(lastMassiveEl !== 'index.js' && lastMassiveEl !== 'package.json'){
            pathsToFiles.push(file)
        }
    }
    return pathsToFiles;
};


// Получаем имена файлов из путей
const getNamesInPaths = (paths) => {
    const filesNames = [];
    for (let path of paths) {
        const lastMassiveEl = path.split('/')[path.split('/').length - 1];
        if (lastMassiveEl !== 'index.js' && lastMassiveEl !== 'package.json'){
            filesNames.push(lastMassiveEl)
        }
}
    const namesOfPaths = []
    for (let name of filesNames) {
        let massiveWords = name.split('.')
        namesOfPaths.push(massiveWords[0])
    }
    return namesOfPaths
}

//Динамически импортируем файлы используя полученные пути getFiles()
const dynamicImport = async (paths) => {
    const importFiles = [];
    for (let path of paths){
        await import(path).then(obj => importFiles.push(obj.default))
    }
    return importFiles;
}

//Подготавливаем массив к записи в CSV
const prepareArrayToCSVWrite = async (arr, names) => {

    const preparedArrayToCSVWrite = [];
    let iteration = 0;
    let firstColumn = '';

    const prepareObjToCSV = (ent) => {
        if (typeof ent === 'object'){

            let thirdColumn = '';
            firstColumn = `${names[iteration]}; `;
            iteration++;

            const findString =  ([key, value], globPath) => {
                let path = `${globPath}.${key}; `;
                thirdColumn = `\"${value}\"`;
                preparedArrayToCSVWrite.push(`${firstColumn}${path}${thirdColumn} \n`);
            }

            const iterateObj = (ent, globPath) => {
                for (const [key, value] of Object.entries(ent)) {
                    if (typeof value === 'string') {
                        findString([key, value], globPath);
                    }else{
                        globPath+= `.${key}`;
                        iterateObj(value, globPath);
                        globPath = '';
                    }
                }
            }
            //Запускаем подготовку объектов для записи в массив
            iterateObj(ent, '');
        }else{
            console.log('Ошибка, на входе должнен быть объект')
        }
    }

    arr.forEach(obj => prepareObjToCSV(obj));
    return preparedArrayToCSVWrite;
}


// Создаем CSV файл.
const createCSVFile = async () => {
  const paths = await getPathsToFiles(PATH_TO_FILES);
  const names = await getNamesInPaths(paths);
  const arr = await dynamicImport(paths);
  const preparedArrayToCSVWrite = await prepareArrayToCSVWrite(arr, names);

    fs.writeFile(`./${CSV_FILE_NAME}`, preparedArrayToCSVWrite.join(''), function (err) {
        if (err) {
            console.log('Ошибка выполнения записи в файл');
        } else{
            console.log('Выполнение успешно завершено, чекай папку со скриптом');
        }
    });
};

//Запускаем скрипт
createCSVFile();



