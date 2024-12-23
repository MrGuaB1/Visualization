let dataOri = [];
let replayButton = null;

async function fetchData() {
    try {
        const response = await fetch('http://localhost:8080/data/hunger');
        if (!response.ok) {
            throw new Error('网络响应不正常');
        }
        dataOri = await response.json();
    } catch (error) {
        console.error('获取数据时发生错误:', error);
    }
}

async function create_hunger_svg() {
    await fetchData();
    dataOri = dataOri.map(obj => Object.values(obj));
    const width = 800, height = 400, margin = {top: 20, bottom: 0, left: 50, right: 100};
    const chartWidth = width - (margin.left + margin.right), chartHeight = height - (margin.top + margin.bottom);
    const data = [];
    const count = 10;
    const duration = 500;
    const barPadding = 20;
    const barHeight = (chartHeight - (barPadding * count)) / count;
    const getDate = () => dataOri[0][dateIndex];
    let dateIndex = 0;
    let date = getDate();
    let dataSlice = [];
    let chart = null, scale = null, axis = null, svg = null, dateTitle = null;

    // 创建SVG
    const createSvg = () => svg = d3.select('#hunger').append('svg').attr('width', width).attr('height', height);

    // 格式化数据
    const formatData = () => {
        dataOri[0].forEach((date, index) => {
            if (index > 0) {
                dataOri.forEach((row, rowIndex) => {
                    if (rowIndex > 0) {
                        data.push({
                            name: row[0],
                            value: Number(row[index]),
                            lastValue: index > 1 ? Number(row[index - 1]) : 0,
                            date: date,
                            color: randomRgbColor()
                        });
                    }
                });
            }
        });
    }

    // 获取当天数据并按倒叙排列
    const sliceData = () =>
        dataSlice = data.filter(d => d.date === date).sort((a, b) => b.value - a.value).slice(0, count);

    // 创建比例尺
    const createScale = () =>
        scale = d3.scaleLinear().domain([0, d3.max(dataSlice, d => d.value)]).range([0, chartWidth]);

    // 创建坐标轴
    const renderAxis = () => {
        createScale();

        axis = d3.axisTop().scale(scale).ticks(5).tickPadding(10).tickSize(0);

        svg.append('g')
            .classed('axis', true)
            .style('transform', `translate3d(${margin.left}px, ${margin.top}px, 0)`)
            .call(axis);
    }

    // 创建坐标线
    const renderAxisLine = () => {
        d3.selectAll('g.axis g.tick').select('line.grid-line').remove();
        d3.selectAll('g.axis g.tick').append('line')
            .classed('grid-line', true)
            .attr('stroke', '#ddd')
            .attr('x1', 0)
            .attr('y1', 0)
            .attr('x2', 0)
            .attr('y2', chartHeight);
    }

    // 当数据变化时更新坐标轴
    const updateAxis = () => {
        createScale();

        axis.scale().domain([0, d3.max(dataSlice, d => d.value)]);

        svg.select('g.axis')
            .transition().duration(duration).ease(d3.easeLinear)
            .call(axis);

        d3.selectAll('g.axis g.tick text').attr('font-size', 14);
    }

    // 渲染日期标题
    const renderDateTitle = () => {
        dateTitle = svg.append('text')
            .classed('date-title', true)
            .text(date)
            .attr('x', chartWidth - margin.top)
            .attr('y', chartHeight - margin.left)
            .attr('fill', 'rgb(128, 128, 128)')
            .attr('font-size', 25)
            .attr('text-anchor', 'end')
    }

    const calTranslateY = (i, end) => {
        if (dateIndex === 1 || end) {
            return (barHeight + barPadding) * i + (barPadding / 2);
        } else {
            return (barHeight + barPadding) * (count + 1);
        }
    }

    const createChart = () => {
        chart = svg.append('g')
            .classed('chart', true)
            .style('transform', `translate3d(${margin.left}px, ${margin.top}px, 0)`);
    }

    const renderChart = () => {
        const bars = chart.selectAll('g.bar').data(dataSlice, (d) => d.name);
        let barsEnter;

        barsEnter = bars.enter()
            .append('g')
            .classed('bar', true)
            .style('transform', (d, i) => `translate3d(0, ${calTranslateY(i)}px, 0)`);

        dateIndex > 1 && barsEnter
            .transition().duration(this.duration)
            .style('transform', (d, i) => `translate3d(0, ${calTranslateY(i, 'end')}px, 0)`);

        barsEnter.append('rect')
            .style('width', d => scale(d.value))
            .style('height', barHeight + 'px')
            .style('fill', d => d.color);

        barsEnter.append('text')
            .classed('label', true)
            .text(d => d.name)
            .attr('x', '-5')
            .attr('y', barPadding)
            .attr('font-size', 14)
            .style('text-anchor', 'end')
            .style('fill', 'rgb(128, 128, 128)');

        barsEnter.append('text')
            .classed('value', true)
            .text(d => d.value.toFixed(1))
            .attr('x', d => scale(d.value) + 10)
            .attr('y', barPadding)
            .style('fill', 'rgb(128, 128, 128)');

        // 更新模式
        bars.transition().duration(duration).ease(d3.easeLinear)
            .style('transform', (d, i) => 'translate3d(0, ' + calTranslateY(i, 'end') + 'px, 0)')
            .select('rect')
            .style('width', d => scale(d.value.toFixed(1)) + 'px');

        bars
            .select('text.value')
            .transition().duration(duration).ease(d3.easeLinear)
            .attr('x', d => scale(d.value) + 10)
            .tween('text', function (d) {
                const textDom = this;
                const i = d3.interpolateRound(d.lastValue.toFixed(1), d.value.toFixed(1));
                return (t) => textDom.textContent = i(t);
            });

        // 退出模式
        bars.exit()
            .transition().duration(duration).ease(d3.easeLinear)
            .style('transform', function (d, i) {
                return 'translate3d(0, ' + calTranslateY(i) + 'px, 0)';
            })
            .style('width', function (d) {
                return scale(d.value) + 'px';
            })
            .remove();
    }

    function createTicker() {
        const ticker = d3.interval(() => {
            if (dateIndex < dataOri[0].length - 1) {
                dateIndex++;
                date = getDate();
                dateTitle.text(date);
                sliceData();
                updateAxis();
                renderAxisLine();
                renderChart();
            } else {
                ticker.stop();
                replayButton.style('visibility', 'visible'); // 显示重播按钮
            }
        }, duration);
    }

    function resetData() {
        dateIndex = 0;
        date = getDate();
        dateTitle.text(date);
        sliceData();
        updateAxis();
        renderAxisLine();
        renderChart();
        createTicker();
    }

    const init = () => {
        createSvg();
        formatData();
        sliceData();
        renderAxis();
        renderAxisLine();
        renderDateTitle();
        createChart();
        renderChart();

        // 创建重播按钮
        replayButton = d3.select('#replay')
            .on('click', resetData);
        createTicker();
    }

    init();

    function randomRgbColor() {
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);
        return `rgb(${r},${g},${b})`;
    }
}

create_hunger_svg();
