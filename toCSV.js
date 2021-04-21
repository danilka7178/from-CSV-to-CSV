import fs from "fs";
import * as path from 'path';


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
        if(massive[massive.length - 1] !== "index.js" && massive[massive.length - 1] !== "package.json"){
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
        if (massive[massive.length-1] !== "index.js" && massive[massive.length-1] !== "package.json"){
            names.push(massive[massive.length-1])
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
const prepareArr = async (arr, names) => {

    const preparedArr = [];
    let iteration = 0;
    let firstColumn = "";

    const doThingsWithObj = (ent) => {
        if (typeof ent === "object"){

            let thirdColumn = "";

            firstColumn = names[iteration] + ", ";
            iteration++;
            let globPath = "";
            let path = "";

            const findString =  ([key, value]) => {
                path = globPath + "." + key + ", ";
                thirdColumn = value;
                preparedArr.push(firstColumn + path + thirdColumn + "\n");
            }

            const iterateObj =  (ent) => {
                for (const [key, value] of Object.entries(ent)) {
                    if (typeof value === "string") {
                        findString([key, value]);
                    }else{
                        globPath += "." + key;
                        iterateObj(value);
                    }
                }
            }

            //Запускаем подготовку объектов для записи в массив
            iterateObj(ent);
        }else{
            console.log("Такого не должно быть")
        }
    }

    arr.map(obj => doThingsWithObj(obj));
    return preparedArr;
}


// Создаем CSV файл.
const createCSVFile = async () => {
  const paths = await getFiles('../artr-mobile-app/app/i18n');
  const names = await namesInPaths(paths);
  const arr = await dynamicImport(paths);
  const preparedArr = await prepareArr(arr, names);

    fs.writeFile('./tmp.csv', preparedArr.join(""), function (err) {
        if (err) {
            console.log('Some error occured - file either not saved or corrupted file saved.');
        } else{
            console.log("Выполнение скрипта успешно завершено, чекай папку");
        }
    });
};

//Запускаем скрипт
createCSVFile();



