const express = require('express');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');

const cors = require('cors');
const app = express();
const PORT = 8080;

// 允许所有来源访问
app.use(cors());

app.get('/data/hunger', (req, res) => {
    const results = [];
    const csvFilePath = path.join(__dirname, './static/data/nur.csv');
    fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (row) => {
            // 过滤掉列名为空的列
            const filteredRow = {};
            Object.keys(row).forEach((key) => {
                if (key.trim() !== '' && row[key].trim() !== '') {
                    filteredRow[key] = row[key];
                }
            });
            results.push(filteredRow);
        })
        .on('end', () => {
            res.json(results);
        })
        .on('error', (err) => {
            console.error('读取 CSV 文件出错:', err);
            res.status(500).json({ error: '读取 CSV 文件出错' });
        });
});

app.get('/data/reason', (req, res) => {
    const results = [];
    const csvFilePath = path.join(__dirname, './static/data/reason.csv');

    fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (row) => {
            const filteredRow = {};

            // 处理每个列名和列值，去除脏字符（例如 BOM）
            Object.keys(row).forEach((key) => {
                const cleanedKey = key.replace(/^\uFEFF/, ''); // 去除 BOM
                const cleanedValue = row[key].replace(/[\u0000-\u001F\u007F-\u009F\uFEFF]/g, ''); // 去除所有不可见字符

                // 过滤掉列名为空的列
                if (cleanedKey.trim() !== '' && cleanedValue.trim() !== '') {
                    filteredRow[cleanedKey] = cleanedValue;
                }
            });

            results.push(filteredRow);
        })
        .on('end', () => {
            res.json(results);
        })
        .on('error', (err) => {
            console.error('读取 CSV 文件出错:', err);
            res.status(500).json({ error: '读取 CSV 文件出错' });
        });
});

app.get('/data/imports', (req, res) => {
    const jsonFilePath = path.join(__dirname, './static/data/imports.json');
    fs.readFile(jsonFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading the file:', err);
            return res.status(500).json({ message: 'Error reading the file' });
        }
        res.header('Content-Type', 'application/json');
        res.send(data);
    });
});

app.get('/data/exports', (req, res) => {
    const jsonFilePath = path.join(__dirname, './static/data/exports.json');
    fs.readFile(jsonFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading the file:', err);
            return res.status(500).json({ message: 'Error reading the file' });
        }
        res.header('Content-Type', 'application/json');
        res.send(data);
    });
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`服务器已启动：http://localhost:${PORT}`);
});