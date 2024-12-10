const content = {
    '糖尿病': {
        img1: './static/img/yanmai.png',
        p1: '燕麦',
        s1: '谷物食品，可以帮助控制血糖波动',
        img2: './static/img/nut.png',
        p2: '坚果和种子',
        s2: '含有健康脂肪和抗氧化物，有助于降低坏胆固醇',
        img3: './static/img/jxr.png',
        p3: '鸡胸肉',
        s3: '低糖低油脂的瘦肉，有效控制血糖'
    },
    '高血压': {
        img1: './static/img/banana.jpg',
        p1: '香蕉',
        s1: '高钾食物，有助于平衡体内的钠，降低血压',
        img2: './static/img/swy.jpg',
        p2: '三文鱼',
        s2: '含有高脂肪酸，有助于减少炎症、改善心血管健康、降低血压',
        img3: './static/img/yygl.jpg',
        p3: '羽衣甘蓝',
        s3: '抗氧化物，有助于减缓血管老化，改善血流，降低血压'
    },
    '贫血': {
        img1: './static/img/gj.jpg',
        p1: '柑橘',
        s1: '柑橘中富含维生素C，可以帮助提高非血红素铁的吸收',
        img2: './static/img/dzp.jpg',
        p2: '豆制品',
        s2: '富含蛋白质和维生素B12，对红血球的生产至关重要',
        img3: './static/img/nz.webp',
        p3: '动物肝脏',
        s3: '动物肝脏中富含血红素铁，易于人体吸收'
    },
    '维生素A缺乏': {
        img1: './static/img/ygy.jpg',
        p1: '鱼肝油',
        s1: '鱼肝油中富含视黄醇，是很好的维生素A来源',
        img2: './static/img/hlb.avif',
        p2: '胡萝卜',
        s2: '植物中的胡萝卜素，可以经人体转化为维生素A',
        img3: './static/img/bcj.webp',
        p3: '补充剂',
        s3: '对于需要额外补充维生素A的人（如老年人、孕妇），补充剂也是很好的选择'
    },
    '代谢综合征': {
        img1: './static/img/yanmai.png',
        p1: '燕麦',
        s1: '谷物全麦食品，有助于降低血糖血脂，控制代谢',
        img2: './static/img/gly.jpg',
        p2: '橄榄油',
        s2: '代谢疾病应减少饱和脂肪和反式脂肪的摄入，增加单不饱和脂肪和多不饱和脂肪',
        img3: './static/img/ymz.jpg',
        p3: '亚麻籽',
        s3: '亚麻籽等食物中，富含Omega-3脂肪酸，有帮于降低体内甘油三酯水平'
    }
}

document.getElementById('illSelector').addEventListener('change', function() {
    const selectedValue = this.value;
    document.getElementById('img1').src = content[selectedValue].img1 + '?t=' + new Date().getTime();
    document.getElementById('p1').textContent = content[selectedValue].p1;
    document.getElementById('s1').textContent = content[selectedValue].s1;
    document.getElementById('img2').src = content[selectedValue].img2 + '?t=' + new Date().getTime();
    document.getElementById('p2').textContent = content[selectedValue].p2;
    document.getElementById('s2').textContent = content[selectedValue].s2;
    document.getElementById('img3').src = content[selectedValue].img3 + '?t=' + new Date().getTime();
    document.getElementById('p3').textContent = content[selectedValue].p3;
    document.getElementById('s3').textContent = content[selectedValue].s3;
    console.log(document.getElementById('img1'))
    console.log(document.getElementById('img2'))
});