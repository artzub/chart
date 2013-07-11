var divCont = d3.select("#vis");

var w = +divCont.property("clientWidth") || window.innerWidth,
    h = +divCont.property("clientHeight") || window.innerHeight,
    p = 10;

var force = d3.layout.force()
    .charge(function(d) { return -10 * d.size / ((d.parent ? d.parent.size : 1) * (d.root ? 2 : 1)); })
    .linkDistance(function(d) {
        var dx = d.target.size,
            dy = d.source.size,
            dr = dx + dy;
        return dr * 1.2;
    })
    .theta(.8)
    .friction(.9)
    .gravity(.05)
    .linkStrength(1.2)
    .nodes(vis.nodes)
    .links(vis.links)
    .size([w, h])
    .on("tick", updatePositions);

var graph = d3.select("#vis").append("svg")
    .attr("width", w)
    .attr("height", h)
  .append("g")
    .attr("transform", "translate(" + [p, p] + ")");

var link = graph.selectAll("line.link"),
    node = graph.selectAll("circle.node");

function updateNodes() {
    node = node.data(force.nodes());
    node.enter().append("circle")
        .attr("class", "node")
        .attr("r", 5)
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; })
        .call(force.drag);

    link = link.data(force.links());
    link.enter().insert("line", "circle")
        .attr("class", "link");

    force.start();

    return vis.completed;
}

//d3.timer();

function updatePositions() {
  /*force.nodes().forEach(function(o, i) {
    o.x = Math.min(w, Math.max(0, o.x));
    o.y = Math.min(h, Math.max(0, o.y));
  });*/

  link.style("stroke-width", function(d) { return Math.sqrt(d.target.size); })
      .attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });

  node.attr("r", function(d) { return d.root ? 0 : 5 + Math.sqrt(d.size) / 2; })
      .attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; });
}
