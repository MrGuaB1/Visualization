let import_data = [];

// 获取数据
async function fetchData() {
    try {
        const response = await fetch('http://localhost:8080/data/imports');
        if (!response.ok) {
            throw new Error('网络响应不正常');
        }
        import_data = await response.json();
    } catch (error) {
        console.error('获取数据时发生错误:', error);
    }
}

// 创建图表
async function create_import_chart() {
    await fetchData();
    const data = import_data;
    let region = data['美国']; // 默认显示中国的数据
    let displayedData = region.slice(0, 3); // 初始化显示前3个数据
    const width = 400, height = 400, radius = Math.min(width, height) / 2;

    const colors = d3.schemeSet3.sort(() => Math.random() - 0.5);
    const color = d3.scaleOrdinal(colors);

    const svg = d3.select("#imports")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2}, ${height / 2})`);

    const defs = svg.append("defs");
    const gradient = defs.append("radialGradient")
        .attr("id", "gradient")
        .attr("cx", "50%")
        .attr("cy", "50%")
        .attr("r", "50%");
    gradient.append("stop").attr("offset", "0%").attr("stop-color", "#fff").attr("stop-opacity", 0.3);
    gradient.append("stop").attr("offset", "100%").attr("stop-color", "#000").attr("stop-opacity", 0.8);

    defs.append("filter")
        .attr("id", "shadow")
        .append("feDropShadow")
        .attr("dx", 0)
        .attr("dy", 0)
        .attr("stdDeviation", 3)
        .attr("flood-color", "#000")
        .attr("flood-opacity", 0.5);

    const arc = d3.arc().innerRadius(0);
    const pie = d3.pie().sort(null).value(d => d.value);

    // 更新图表
    function updateChart(data) {
        svg.selectAll("*").remove();  // 清空之前的图表

        const scale = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.value)])
            .range([0, radius]);

        arc.outerRadius(d => scale(d.value));

        const arcs = svg.selectAll(".arc")
            .data(pie(data))
            .enter()
            .append("g")
            .attr("class", "arc");

        const path = arcs.append("path")
            .attr("d", arc)
            .style("fill", (d, i) => color(i))
            .style("filter", "url(#shadow)")
            .each(function(d) {
                d.initialColor = d3.select(this).style("fill");
            })
            .on("mouseover", function(event, d) {
                // 在鼠标悬浮时显示卡片并更新内容
                showCard(event, d);
                d3.select(this).style("fill", "#ff7043");
            })
            .on("mouseout", function(event, d) {
                // 鼠标移开时隐藏卡片
                hideCard();
                d3.select(this).style("fill", d.initialColor);
            });

        path.transition()
            .duration(1000)
            .attrTween("d", function (d) {
                const i = d3.interpolate(d.startAngle, d.endAngle);
                return function (t) {
                    d.endAngle = i(t);
                    return arc(d);
                };
            });

        arcs.append("text")
            .attr("transform", d => `translate(${arc.centroid(d)})`)
            .attr("dy", ".35em")
            .attr("text-anchor", "middle")
            .style("fill", "rgb(128, 128, 128)")
            .style("font-size", "12px")
            .style("font-weight", "bold")
            .text(d => d.data.name);
    }

    updateChart(displayedData);

    // 监听区域选择框的变化
    document.getElementById("regionSelector").addEventListener("change", function () {
        const selectedRegion = this.value; // 获取选择的区域
        region = data[selectedRegion]; // 根据选择的区域更新数据
        displayedData = region.slice(0, 3); // 默认显示前3个
        updateChart(displayedData); // 更新图表
    });

    let min_num = 3;
    let max_num = 6;
    let current_mode = 0; // 0表示添加，1表示删除
    // Button functionality: Add or Remove elements
    document.getElementById("toggleButton").addEventListener("click", function () {
        if (current_mode === 0) {
            // Add one element
            displayedData.push(region[displayedData.length]);
            if (displayedData.length === max_num) {
                current_mode = 1;
                document.getElementById("add").style.display = "none";
                document.getElementById("sub").style.display = "inline";
            }
        } else {
            displayedData.pop();
            if (displayedData.length === min_num) {
                current_mode = 0;
                document.getElementById("add").style.display = "inline";
                document.getElementById("sub").style.display = "none";
            }
        }
        updateChart(displayedData); // Update the chart
    });

    function showCard(event, d) {
        const card = d3.select("#infoCard");
        // 更新卡片内容
        card.select(".card-title")
            .text(d.data.name);
        card.select(".card-value")
            .text(`进口量（吨）: ${d.data.value}`);
        // 设置卡片位置
        const [x, y] = d3.pointer(event);
        card.style("left", `${x-10}px`)
            .style("top", `${y-10}px`)
            .style("visibility", "visible");
    }
}

create_import_chart();

// 关闭卡片
function closeCard() {
    d3.select("#infoCard").style("visibility", "hidden");
}

// 隐藏卡片
function hideCard() {
    d3.select("#infoCard").style("visibility", "hidden");
}
