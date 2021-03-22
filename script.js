var width = 1300;
var height = 800;
var color = {
    "Action": d3.schemeSet3[0],
    "Adventure": d3.schemeSet3[1],
    "Fighting": d3.schemeSet3[2],
    "Misc": d3.schemeSet3[3],
    "Platform": d3.schemeSet3[4],
    "Puzzle": d3.schemeSet3[5],
    "Racing": d3.schemeSet3[6],
    "Role-Playing": d3.schemeSet3[7],
    "Shooter": d3.schemeSet3[8],
    "Simulation": d3.schemeSet3[9],
    "Sports": d3.schemeSet3[10],
    "Strategy": d3.schemeSet3[11],
};

const svg = d3.select('svg')
    .attr('width', width)
    .attr('height', height);

d3.csv("data/dataset.csv").then(function(data) {
    console.log(data);
    const hierarchy = buildHierarchy(data);
    const treemap = d3.treemap()
        .size([width, height])
        .padding(1)
    const root = d3.hierarchy(hierarchy)
        .sum(d => d.Global_Sales)
    treemap(root);
    const node = svg.selectAll('g')
        .data(root.leaves())
        .enter().append('g')
        .attr('transform', d => `translate(${d.x0}, ${d.y0})`);
    const tooltipHTML = document.getElementById('tooltip');
    node.append('path')
        .attr('width', d => d.x1 - d.x0)
        .attr('height', d => d.y1 - d.y0)
        .attr('fill', function(d) {
            console.log(d);
            return color[d.data.Genre];
        })
        .on("mouseover", (d, i) => {
            console.log("here");
            const[x, y] = [d.screenX, d.screenY];
            tooltipHTML.classList.add('show');
            tooltipHTML.style.transform = "translate(" + x + "px," + y + "px)";
            // tooltip.attr('transform', `translate(${x}, ${y})`);
            var nf = new Intl.NumberFormat();
            tooltipHTML.innerHTML = `
                <p><strong>Genre - </strong> ${i.data.Genre}</p>
                <p><strong>Publisher - </strong> ${i.data.Publisher}</p>
                <p><strong>Platform - </strong> ${i.data.Platform}</p>
                <p><strong>Name - </strong> ${i.data.Name}</p>
                <p><strong>Global_Sales - </strong> $${nf.format(i.data.Global_Sales)}millions</p>
            `;
        })
        .on('mouseleave', () => {
            tooltip.classList.remove('show');
        });
});

function buildHierarchy(csv) {
    var root = { name: "root", children: [], id: "ROOT" };
    var parents = ['Genre', 'Publisher', 'Platform', 'Name'];
    for (var i = 0; i < csv.length; i++) {
        var sequence = csv[i];
        var size = +csv[i].Global_Sales;
        // console.log(sequence);
        // console.log(size);
        if (isNaN(size)) {
            continue;
        }
        var currentNode = root;
        for (var j = 0; j < parents.length; j++) {
            var children = currentNode["children"];
            var nodeName = sequence[parents[j]];
            var childNode;
            if (j + 1 < parents.length) {
                var foundChild = false;
                for (var k = 0; k < children.length; k++) {
                    // console.log(k);
                    if (children[k]["name"] == nodeName) {
                        childNode = children[k];
                        foundChild = true;
                        break;
                    }
                }
                if (!foundChild) {
                    childNode = { name: nodeName, children: [] };
                    children.push(childNode);
                }
                currentNode = childNode;
            } else {
                childNode = { Name: nodeName, NA_Sales: +csv[i].NA_Sales,
                    EU_Sales: +csv[i].EU_Sales, JP_Sales: +csv[i].JP_Sales,
                    Other_Sales: +csv[i].Other_Sales, Global_Sales: size,
                    Platform: csv[i].Platform, Genre: csv[i].Genre, Publisher: csv[i].Publisher };
                children.push(childNode);
            }
        }
    }
    console.log(root);
    return root;
}