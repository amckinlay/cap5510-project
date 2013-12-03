"use strict";

var seq0 = "";
var seq1 = "";
var oldSeq0 = "";
var oldSeq1 = "";

var matrix = [];
var max;

var svgSize = 20;

var table;
var thead;
var tbody;

var svgPath;

function makeTable(seq0, seq1) {
	var matrixExists = !d3.select("#matrix table").empty();

	// If matrix and svgPath do not exist seq0.length or seq1.length != 0 then create them
	if (!matrixExists && (seq0.length !== 0 || seq1.length !== 0)) {
		var mttr = d3.select("#matrix");
		table = mttr
			.append("table")
			.attr("class", "table table-bordered table-condensed table-nonfluid");
		thead = table.append("thead").append("tr");
		tbody = table.append("tbody");
		svgPath = mttr
			.append("svg")
			.attr("width", 0)
			.attr("height", 0)
			.style("pointer-events", "none");
	}

	// If matrix and svgPath exist and seq0.length and seq1.length == 0 then delete them
	else if (matrixExists && seq0.length === 0 && seq1.length === 0) {
		table.remove();
		svgPath.remove();
		table = undefined;
		thead = undefined;
		tbody = undefined;
		svgPath = undefined;
		return;
	}

    var topHeaders = thead.selectAll("th").data(seq0).text(String);
    topHeaders.enter().append("th").text(String).style("border-bottom-width", "1px");
    topHeaders.exit().remove();
    thead.insert("th", "th").style("border-bottom-width", "1px");

    var rows = tbody.selectAll("tr").data(seq1);
    rows.select("th div").text(String);
    rows.enter().append("tr")
        .append("th")
        .append("div").style("width", svgSize.toString() + "px").text(String);
    rows.exit().remove();

    var cells = rows.selectAll("td").data(seq0);
    cells.select("svg circle").attr("r", 0);
    cells.enter().append("td")
    	.on("mouseenter", function() {
    		var thing = $(this);
			var col = thing.index() - 1;
			var row = thing.parent().index();
			backtrack(matrix, row, col);
    	})
    	.attr("data-toggle", "popover")
    	.attr("data-original-title", 0)
    	.attr("data-trigger", "hover")
        .append("svg").attr("height", svgSize).attr("width", svgSize)
        .append("circle").attr("cx", svgSize / 2).attr("cy", svgSize / 2).attr("r", 0);
    cells.exit().remove();

    table.selectAll("th, td").style("vertical-align", "middle");
    table.selectAll("td").style("line-height", 0);

    svgPath.attr("width", table.style("width")).attr("height", table.style("height"))
    	.style("position", "absolute")
    	.style("top", 0)
    	.style("left", 0);
    $("td").popover({delay: 1000});
}

function updateTable(matrix) {
    // var max = d3.max(matrix, function (c) {
    //     return d3.max(c, function(e) { return Math.abs(e.score); });
    // });
    var max = d3.max(matrix, function (c) {
        return Math.abs(d3.max(c, function(e) { return e.score; }));
    });
    var scale = d3.scale.linear().domain([0, max]).range([0, svgSize / 2]);

    var cells = tbody.selectAll("tr").data(matrix)
        .selectAll("td").data(function (d) {
        return d;
    });
    cells.attr("data-original-title", function(d) {
    	return d.score;
    }).attr("data-content", function(d) {
    	if (d.prev === null) return "Reset (0)";
    	var diff = d.score - d.prev.score;
    	if (diff === indel) return "Indel (" + diff + ")";
    	else if (seq0[d.col] == seq1[d.row]) return "Match (" + diff + ")";
    	else return "Mismatch (" + diff + ")";
    });
    var cells = cells.select("svg circle");
    cells.attr("r", function (d) {
        return scale(Math.abs(d.score));
    })
        .style("fill", function (d) {
        return d.score < 0 ? "#d2322d" : "#39b3d7";
    });
    cells.data(function(d) { return d; }).exit().attr("r", 0);
}

var svgAlign;
var svgSeq0;
var svgSeq1;
var svgSeq0Text;
var svgSeq1Text;

function makeSequences() {
	if (svgAlign === undefined) {
		svgAlign = d3.select("#alignment").append("svg")
			.attr("height", 60).attr("width", 1000)
			.style("opacity", 0.5);
		svgSeq0 = svgAlign.append("g");
		svgSeq1 = svgAlign.append("g")
			.attr("transform", "translate(0, 40)");
		svgSeq0Text = svgAlign.append("g")
			.attr("transform", "translate(0, 11)");
		svgSeq1Text = svgAlign.append("g")
			.attr("transform", "translate(0, 51)");
	}
}

var baseSize = 20;

var dnaColors = {
	"A": "#47a447",
	"T": "#39b3d7",
	"C": "#ed9c28",
	"G": "#d2322d",
	"-": "whitesmoke"
};

function displaySequences(seq0, seq1) {
	if (svgAlign && seq0.length === 0 && seq1.length === 0) {
		svgAlign.remove();
		svgAlign = undefined;
		return;
	}

	function displaySequence(seq, g, gT) {
		var bases = g.selectAll("rect").data(seq)
			.style("fill", function(d) {
				return dnaColors[d];
			});
		bases.enter().append("rect")
			.attr("width", baseSize)
			.attr("height", baseSize)
			.attr("x", function(d, i) {
				return i*baseSize
			})
			.style("fill", function(d) {
				return dnaColors[d];
			});
		bases.exit().remove();
		var basesT = gT.selectAll("text").data(seq)
			.text(function(d) { return d; });
		basesT.enter().append("text")
			.attr("x", function(d, i) {
				return i*baseSize+(baseSize/2);
			})
			.text(function(d) { return d; })
			.attr("text-anchor", "middle")
			.attr("alignment-baseline", "middle")
			.style("font-size", 18);
		basesT.exit().remove();
	}
	displaySequence(seq0, svgSeq0, svgSeq0Text);
	displaySequence(seq1, svgSeq1, svgSeq1Text);
}

d3.select("#seq0").on("keyup", function() {
	oldSeq0 = seq0;
	seq0 = this.value.toUpperCase();
	makeSequences();
	displaySequences(seq0, seq1);
	makeTable(seq0, seq1);
	local ? someDumbFunc(oneStepLocal) : someDumbFunc(oneStep);
});
d3.select("#seq1").on("keyup", function() {
	oldSeq1 = seq1;
	seq1 = this.value.toUpperCase();
	makeSequences();
	displaySequences(seq0, seq1);
	makeTable(seq0, seq1);
	local ? someDumbFunc(oneStepLocal) : someDumbFunc(oneStep);
});

var indel = -5;
var ident = 1;
var foreign = -3;
function score(x, y) {
	if (x == y) {
		return ident;
	} else return foreign;
}
d3.select("#identity").on("keyup", function() {
	if (this.value == "-") return;
	if (!this.value) ident = 1;
	else ident = parseInt(this.value);
	oldSeq0 = "";
	oldSeq1 = "";
	if (local) someDumbFunc(oneStepLocal);
	else someDumbFunc(oneStep);
});
d3.select("#foreign").on("keyup", function() {
	if (this.value == "-") return;
	if (!this.value) foreign = -3;
	else foreign = parseInt(this.value);
	oldSeq0 = "";
	oldSeq1 = "";
	if (local) someDumbFunc(oneStepLocal);
	else someDumbFunc(oneStep);
});
d3.select("#indel").on("keyup", function() {
	if (this.value == "-") return;
	if (!this.value) indel = -4;
	else indel = parseInt(this.value);
	oldSeq0 = "";
	oldSeq1 = "";
	if (local) someDumbFunc(oneStepLocal);
	else someDumbFunc(oneStep);
});

function oneStep(matrix, row, col) {
	if (row === 0 && col === 0) {matrix[0][0] = {
			score: score(seq0[0], seq1[0]),
			prev: null,
			row: row,
			col: col
		};}
	else if (col === 0) matrix[row][0] = {
		score: matrix[row - 1][0].score + indel,
		prev: matrix[row - 1][0],
		row: row,
		col: col
	};
	else if (row === 0) matrix[0][col] = {
		score: matrix[0][col - 1].score + indel,
		prev: matrix[0][col - 1],
		row: row,
		col: col
	};
	else {
		var up = matrix[row - 1][col];
		var diag = matrix[row - 1][col - 1];
		var left = matrix[row][col - 1];
		var comp = [
			up.score + indel,
			diag.score + score(seq0[col], seq1[row]),
			left.score + indel
		];
		var best = d3.max(comp);
		var index = comp.indexOf(best);
		var prev;
		if (index === 2) prev = left;
		else if (index === 1) prev = diag;
		else prev = up;
		matrix[row][col] = {
			score: best,
			prev: prev,
			row: row,
			col: col
		};
	}
}

var local = false;

$("#t0").tab();
$("#t0").on("click", function() {
	local = false;
	oldSeq0 = "";
	oldSeq1 = "";
	someDumbFunc(oneStep);
});
$("#t1").tab();
$("#t1").on("click", function() {
	local = true;
	oldSeq0 = "";
	oldSeq1 = "";
	someDumbFunc(oneStepLocal);
});

function oneStepLocal(matrix, row, col) {
	if (row === 0) matrix[0][col] = {
		score: d3.max([score(seq1[0], seq0[col]), 0]),
		prev: null,
		row: row,
		col: col
	};
	else if (col === 0) matrix[row][0] = {
		score: d3.max([score(seq1[row], seq0[0]), 0]),
		prev: null,
		row: row,
		col: col
	};
	else {
		var up = matrix[row - 1][col];
		var diag = matrix[row - 1][col - 1];
		var left = matrix[row][col - 1];
		var comp = [
			up.score + indel,
			diag.score + score(seq0[col], seq1[row]),
			left.score + indel,
			0
		];

		var best = d3.max(comp);
		var index = comp.indexOf(best);
		var prev;
		if (index === 3) prev = null;
		else if (index === 2) prev = left;
		else if (index === 1) prev = diag;
		else prev = up;
		matrix[row][col] = {
			score: best,
			prev: prev,
			row: row,
			col: col
		};
	}
}

function someDumbFunc(func) {
	if (seq1.length < matrix.length) {
		matrix.splice(seq1.length, matrix.length);
	} else {
		d3.range(matrix.length, seq1.length).forEach(function() { matrix.push([]); });
	}
	if (matrix.length && seq0.length < matrix[0].length) {
		matrix.map(function(row) { row.splice(seq0.length, row.length); });
	}
	var min1 = d3.min([seq1.length, oldSeq1.length]);
	var firstDiff1 = min1;
	for (var i = 0; i < min1; ++i) {
		if (seq1[i] != oldSeq1[i]) {
			firstDiff1 = i
		}
	}
	var min0 = d3.min([seq0.length, oldSeq0.length]);
	var firstDiff0 = min0;
	for (var i = 0; i < min0; ++i) {
		if (seq0[i] != oldSeq0[i]) {
			firstDiff0 = i
		}
	}
	for (var i = firstDiff1; i < seq1.length; ++i) {
		for (var j = 0; j < firstDiff0; ++j) {
			func(matrix, i, j);
		}
	}
	for (var i = 0; i < seq1.length; ++i) {
		for (var j = firstDiff0; j < seq0.length; ++j) {
			func(matrix, i, j);
		}
	}
	updateTable(matrix);
}

function backtrack(matrix, row, col) {
	var root = matrix[row][col];
	var path = [root];
	while (root.prev) {
		root = root.prev;
		path.push(root);
	}
	if (path.length === 1) return;

	var tbody = $("tbody");

	var coords = path.map(function(e) {
		var td = tbody.children("tr").eq(e.row).children("td").eq(e.col);
		var pos = td.position();
		pos.left += 16;
		pos.top += 16;
		return [pos.left, pos.top];
	});

	var path_ = svgPath.select("path");

	if (path_.empty()) path_ = svgPath.append("path");

	path_.attr("d", d3.svg.line()(coords))
		.attr("stroke", "black")
		.attr("stroke-width", 5)
		.attr("fill", "none");

	var spacedSeq0 = "";
	var spacedSeq1 = "";

	var prevRow = path[path.length - 1].row - 1;
	for (var i = path.length - 1; i >= 0; --i) {
		if (path[i].row === prevRow) {
			spacedSeq1 += "-";
		} else {
			spacedSeq1 += seq1[path[i].row];
		}
		prevRow = path[i].row;
	}

	var prevCol = path[path.length - 1].col - 1;
	for (var i = path.length - 1; i >= 0; --i) {
		if (path[i].col === prevCol) {
			spacedSeq0 += "-";
		} else {
			spacedSeq0 += seq0[path[i].col];
		}
		prevCol = path[i].col;
	}

	console.log(spacedSeq0, spacedSeq1);
	makeSequences();
	displaySequences(spacedSeq0, spacedSeq1);
}
