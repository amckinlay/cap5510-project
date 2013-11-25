var seq0 = ["A", "T", "C", "G", "T", "C", "G", "T", "C", "G", "T", "C", "G", "T", "C", "G"];
var seq1 = ["A", "T", "C", "G", "T", "C", "G", "T", "C", "G", "T", "C", "G", "T", "C", "G"];

var matrix = [
    [1, 2,5,3,5,7,3,3,4,7,8,6,5,4,9,1],
    [1, 2,5,3,5,7,3,3,4,7,8,6,5,4,9,1]
];

var svgSize = 20;

var table = d3.select("table");
var thead = table.append("thead").append("tr");
var tbody = table.append("tbody");

function makeTable(seq0, seq1) {
    var topHeaders = thead.selectAll("th").data(seq0).text(String);
    topHeaders.enter().append("th").text(String).style("border-bottom-width", "1px");
    topHeaders.exit().remove();
    thead.insert("th", "th").style("border-bottom-width", "1px");

    var rows = tbody.selectAll("tr").data(seq1);
    rows.select("th").text(String);
    rows.enter().append("tr")
        .append("th")
        .append("div").style("width", svgSize.toString() + "px").text(String);
    rows.exit().remove();

    var cells = rows.selectAll("td").data(seq0);
    cells.select("svg circle").attr("r", 0);
    cells.enter().append("td")
        .append("svg").attr("height", svgSize).attr("width", svgSize)
        .append("circle").attr("cx", svgSize / 2).attr("cy", svgSize / 2).attr("r", 0);
    cells.exit().remove();

    table.selectAll("th, td").style("vertical-align", "middle");
    table.selectAll("td").style("line-height", 0);
}

function updateTable(matrix) {
    var max = d3.max(matrix, function (c) {
        return d3.max(c, function(e) { return Math.abs(e); });
    });
    var scale = d3.scale.linear().domain([0, max]).range([0, svgSize / 2]);

    var cells = tbody.selectAll("tr").data(matrix)
        .selectAll("svg circle").data(function (d) {
        return d;
    });
    cells.transition().attr("r", function (d) {
        return scale(Math.abs(d));
    })
        .style("fill", function (d) {
        return d < 0 ? "#d2322d" : "#39b3d7";
    });
    cells.exit().attr("r", 0);
}

makeTable(seq0, seq1);
updateTable(matrix);