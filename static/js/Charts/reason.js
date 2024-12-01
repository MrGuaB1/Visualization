let reason_data = [];

async function fetchData() {
    try {
        const response = await fetch('http://localhost:8080/data/reason');
        if (!response.ok) {
            throw new Error('网络响应不正常');
        }
        reason_data = await response.json();
        console.log('获取到的 JSON 数据:', reason_data);
    } catch (error) {
        console.error('获取数据时发生错误:', error);
    }
}

async function create_reason_chart() {
    await fetchData();
    const chart = (() => {
        const data = reason_data;
        console.log(data.map(d => d.name));
        d3.rollup(data, group => {
            const sum = d3.sum(group, d => d.value);
        }, d => d.name);  // 按照“name”字段将数据分组

        const additionalInfo = {
            positive: "Youth and Children →",
            negative: "← Adults and Elderly",
            positives: ["Children", "Youth"],
            negatives: ["Elder", "Adult"]
        };

        Object.assign(data, additionalInfo);
        console.log(data);
        const signs = new Map([].concat(data.negatives.map(d => [d, -1]), data.positives.map(d => [d, +1])));

        const bias = d3.sort(d3.rollup(data, v => d3.sum(v, d => d.value * Math.min(0, signs.get(d.category))), d => d.name), ([, a]) => a);

        const width = 928;
        const marginTop = 40;
        const marginRight = 30;
        const marginBottom = 40;
        const marginLeft = 80;
        const height = bias.length * 33 + marginTop + marginBottom;

        const series = d3.stack()
            .keys([].concat(data.negatives.slice().reverse(), data.positives))
            .value(([, value], category) => signs.get(category) * (value.get(category) || 0))
            .offset(d3.stackOffsetDiverging)(d3.rollup(data, data => d3.rollup(data, ([d]) => d.value, d => d.category), d => d.name));

        const x = d3.scaleLinear()
            .domain(d3.extent(series.flat(2)))
            .rangeRound([marginLeft, width - marginRight]);

        const y = d3.scaleBand()
            .domain(bias.map(([name]) => name))
            .rangeRound([marginTop, height - marginBottom])
            .padding(0.1); // Improved padding for better readability

        const color = d3.scaleOrdinal()
            .domain([].concat(data.negatives, data.positives))
            .range(d3.schemeSpectral[data.negatives.length + data.positives.length]);

        const formatValue = ((format) => (x) => format(Math.abs(x)))(d3.format(".0%"));

        const svg = d3.create("svg")
            .attr("viewBox", [0, 0, width, height])
            .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;"); // Adjust font size for readability

        svg.append("g")
            .selectAll("g")
            .data(series)
            .join("g")
            .attr("fill", d => color(d.key))
            .selectAll("rect")
            .data(d => d.map(v => Object.assign(v, {key: d.key})))
            .join("rect")
            .attr("x", d => x(d[0]))
            .attr("y", ({data: [name]}) => y(name))
            .attr("width", d => x(d[1]) - x(d[0]))
            .attr("height", y.bandwidth())
            .attr("rx", 5)
            .attr("ry", 5)
            .style("stroke", "#fff")
            .style("stroke-width", 1)
            .style("transition", "all 0.3s ease")
            .on("mouseover", function (event, d) {
                d3.select(this)
                    .style("cursor", "pointer")
                    .style("fill", d3.rgb(color(d.key)).darker(1))

                tooltip.style("visibility", "visible")
                    .text(`${d.data[0]}: ${formatValue(d[1] - d[0])} (${d.key})`)
                    .style("left", `${event.pageX + 8}px`)
                    .style("top", `${event.pageY - 16}px`);
            })
            .on("mouseout", function (event, d) {
                d3.select(this)
                    .style("fill", function () {
                        return color(d.key);
                    })
                    .attr("transform", "scale(1)");

                tooltip.style("visibility", "hidden");
            })
            .append("title")
            .text(({key, data: [name, value]}) => `${name}
${formatValue(value.get(key))} ${key}`);

        svg.append("g")
            .attr("transform", `translate(0,${marginTop})`)
            .call(d3.axisTop(x)
                .ticks(width / 80)
                .tickFormat(formatValue)
                .tickSizeOuter(0))
            .call(g => g.select(".domain").remove())
            .call(g => g.append("text")
                .attr("x", x(0) + 20)
                .attr("y", -24)
                .attr("fill", "currentColor")
                .attr("text-anchor", "start")
                .text(data.positive))
            .call(g => g.append("text")
                .attr("x", x(0) - 20)
                .attr("y", -24)
                .attr("fill", "currentColor")
                .attr("text-anchor", "end")
                .text(data.negative));

        svg.append("g")
            .call(d3.axisLeft(y).tickSizeOuter(0))
            .call(g => g.selectAll(".tick").data(bias).attr("transform", ([name, min]) => `translate(${x(min)},${y(name) + y.bandwidth() / 2})`))
            .call(g => g.select(".domain").attr("transform", `translate(${x(0)},0)`));

        const tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("position", "absolute")
            .style("visibility", "hidden")
            .style("background-color", "#333")
            .style("color", "#fff")
            .style("padding", "5px 10px")
            .style("border-radius", "4px")
            .style("font-size", "10px");
        return Object.assign(svg.node(), {scales: {color}});
    })();
    document.getElementById("reason").appendChild(chart);
}

create_reason_chart();
