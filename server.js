const express = require('express');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');

const app = express();
const PORT = 8080;

app.get('/data', (req, res) => {
    const results = [];
    const csvFilePath = path.join(__dirname, './static/data/fat_rate.csv');  // CSV 文件路径

    // 使用 csv-parser 读取 CSV 文件并将其转换为 JSON 格式
    fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (row) => {
            results.push(row);  // 将每一行的内容添加到 results 数组
        })
        .on('end', () => {
            // 读取完成后，返回 JSON 格式的数据
            res.json(results);
        })
        .on('error', (err) => {
            // 错误处理
            console.error('读取 CSV 文件出错:', err);
            res.status(500).json({ error: '读取 CSV 文件出错' });
        });
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`服务器已启动：http://localhost:${PORT}`);
});