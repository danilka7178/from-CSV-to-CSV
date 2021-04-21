import fs from 'fs';

// Переменные
const CSVFileName = 'tmp.csv'; //tmp-desktop.csv
const pathToFiles = '../artr-mobile-app/app/i18n'; // ../desktop-wallet/src/i18n

// Функции
// Находим файлы, получаем пути
const getFiles = function (dir, files_){
    files_ = files_ || [];
    let files = fs.readdirSync(dir);
    for (let i in files){
        let name = dir + '/' + files[i];
        if (fs.statSync(name).isDirectory()){
            getFiles(name, files_);
        } else {
            files_.push(name);
        }
    }
    const rdyFiles = [];
    for (let f of files_) {
        let massive = f.split('/')
        const lastMassiveEl = massive[massive.length - 1];
        if(lastMassiveEl !== 'index.js' && lastMassiveEl !== 'package.json'){
            rdyFiles.push(f)
        }
    }
    return rdyFiles;
};


// Получаем имена файлов из путей
const namesInPaths = (paths) => {
    const names = [];
    for (let p of paths) {
        let massive = p.split('/')
        const lastMassiveEl = massive[massive.length - 1];
        if (lastMassiveEl !== 'index.js' && lastMassiveEl !== 'package.json'){
            names.push(lastMassiveEl)
        }
}
    const rdyNames = []
    for (let n of names) {
        let massive = n.split('.')
        rdyNames.push(massive[0])
    }
    return rdyNames
}

//Динамически импортируем файлы используя полученные пути getFiles()
const dynamicImport = async (paths) => {
    const someArr = [];
    for (let path of paths){
        await import(path).then(obj => someArr.push(obj.default))
    }
    return someArr;
}

//Подготавливаем массив к записи в CSV
const prepareArrToCSVWrite = async (arr, names) => {

    const preparedArrToCSVWrite = [];
    let iteration = 0;
    let firstColumn = '';

    const doThingsWithObj = (ent) => {
        if (typeof ent === 'object'){

            let thirdColumn = '';

            firstColumn = names[iteration] + '; ';
            iteration++;
            let globPath = '';
            let path = '';

            const findString =  ([key, value]) => {
                path = globPath + '.' + key + '; ';
                thirdColumn = value;
                preparedArrToCSVWrite.push(firstColumn + path + thirdColumn + ';' + '\n');
            }

            const iterateObj =  (ent) => {
                for (const [key, value] of Object.entries(ent)) {
                    if (typeof value === 'string') {
                        findString([key, value]);
                    }else{
                        globPath += '.' + key;
                        iterateObj(value);
                    }
                }
            }

            //Запускаем подготовку объектов для записи в массив
            iterateObj(ent);
        }else{
            console.log('Такого не должно быть')
        }
    }

    arr.forEach(obj => doThingsWithObj(obj));
    return preparedArrToCSVWrite;
}


// Создаем CSV файл.
const createCSVFile = async () => {
  const paths = await getFiles(pathToFiles);
  const names = await namesInPaths(paths);
  const arr = await dynamicImport(paths);
  const preparedArrToCSVWrite = await prepareArrToCSVWrite(arr, names);

    fs.writeFile(`./${CSVFileName}`, preparedArrToCSVWrite.join(''), function (err) {
        if (err) {
            console.log('Some error occured - file either not saved or corrupted file saved.');
        } else{
            console.log('Выполнение скрипта успешно завершено, чекай папку');
        }
    });
};

//Запускаем скрипт
createCSVFile();



