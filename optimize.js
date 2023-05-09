// скрипт уменьшает данный .stylelintignore на 15% по длине (кол-ву строк)
// и на 29% по весу

const fs = require("fs");
const path = require("path");
const stylelint = require("stylelint");

const ignoreFilePath = path.resolve(".stylelintignore");

// если файла нет
if (!fs.existsSync(ignoreFilePath)) {
    console.error(".stylelintignore file not found.");
    process.exit(1);
}

// читаем содержимое файла .stylelintignore
const ignoredPaths = fs.readFileSync(ignoreFilePath, "utf-8").split("\n");

const manuallyIgnoredPaths = [];

stylelint
    .lint({
        files: "src/**/*.css",
    })
    .then((res) => {
        // собираем данные о вручную отключенном линтере на весь файл
        res.results.forEach((i) => {
            if (i._postcssResult.css.split("\n")[0].includes("stylelint-disable")) {
                manuallyIgnoredPaths.push(i.source);
            }
        });

        // список файлов и директорий, которые будут удалены из .stylelintignore
        const toDelete = [];

        // проходимся по каждому элементу списка
        ignoredPaths.forEach((item, i) => {
            // на всякий случай удаляем пробелы в начале и конце строки
            item = item.trim();

            // проверка путей с *.css
            if (item.includes("/**/*.css")) {
                item = item.slice(0, -8);
            } else if (item.includes("*.css")) {
                item = item.slice(0, -5);

                manuallyIgnoredPaths.forEach((p) => {
                    if (p.includes(item) && !toDelete.includes(i)) {
                        toDelete.push(i);
                    }
                });
            }

            // Проверяем, существует ли файл или директория на самом деле
            if (!fs.existsSync(item)) {
                toDelete.push(i);
            }
        });

        // Удаляем элементы, начиная с конца списка, чтобы не нарушать порядок индексов
        toDelete.reverse().forEach((i) => ignoredPaths.splice(i, 1));

        const newIgnoreList = ignoredPaths.map((item) =>
            item.replace("components", "comp*")
        );

        // Записываем результат в новый файл .stylelintignore.optimized
        fs.writeFileSync(".stylelintignore.optimized", newIgnoreList.join("\n"));
    });
