// size and margin
// var basewidth = $('.graph').width()
// var baseheight = $(window).height();
// var basewidth = 1500;
// var baseheight = 500;
//
// var margin = {
//             top: 50,
//             right: 30,
//             bottom: 30,
//             left: 30
//         },
//     width = basewidth - margin.left - margin.right,
//     height = baseheight - margin.top - margin.bottom
//
// main canvas
// var svg = d3.select('.graph')
//     .append('svg')
//     .attr('width', width + margin.left + margin.right)
//     .attr('height', height + margin.top + margin.bottom)
// var canvas = svg.append("g")
//     .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
//
// var defs = svg.append("defs");
// defs.append("filter")
//     .attr("id", "bw-filter")
//     .append('feColorMatrix')
//     .attr('type', 'saturate')
//     .attr('values', '0')

function init_pixel(id, x, y, size, linewidth, image, offsetX, offsetY, imgsize) {
    var s = size-(2*linewidth)
    var path = `M ${x+linewidth},${y+linewidth} l${s},0 l0,${s} l${-s},0 Z`
    var clippath = `M ${x},${y} l${size},0 l0,${size} l${-size},0 Z`
    var length = 4*size
    var canvas = d3.select("#" + id + '-canvas')

    var pixel = canvas.append('g')
        .attr('id', id + '-g')

    pixel.append("clipPath")  
        .attr("id", "clipPath"+id)
        .append("path") 
        .attr('id', 'clipPathShape'+id)
        .attr("d", `M ${x},${y}`)
        .style('fill', 'none')
        .style('stroke', 'black')
    pixel.append("clipPath")  
        .attr("id", "clipPathCrop"+id)
        .append("path")
        .attr('id', 'imgCropClip'+id)
        .attr("d", clippath)
        .style('fill', 'none')
        .style('stroke', 'black')
    
    pixel.append('path')
        .attr('id', 'bgrect'+id)
        .attr("d", clippath)
        .style('opacity', 0.70)
        .style('fill', 'none')
        .style('stroke', 'black')

    pixel.append("svg:image")
        .attr('id', 'bgimage'+id)
        .attr('x', x+offsetX)
        .attr('y', y+offsetY)
        .attr('width', imgsize)
        .attr('height', imgsize)
        .attr("xlink:href", image)
        .style('stroke', 'black')
        .style('opacity', 0.00)
        .style('filter', 'url(#bw-filter)')
        .attr("clip-path", 'url(#clipPathCrop' + id + ')')

    pixel.append("svg:image")
        .attr('id', 'image'+id)
        .attr('x', x+offsetX)
        .attr('y', y+offsetY)
        .attr('width', imgsize)
        .attr('height', imgsize)
        .attr("xlink:href", image)
        .attr("clip-path", 'url(#clipPath' + id + ')')

    pixel.append("path")     
        .style("stroke", "#2d2d2d")
        .style('stroke-width', linewidth*2)
        .style("fill", "none")
        .attr('id', 'path'+id)
        .attr('d', path)
        .attr('stroke-linejoin', 'round')
        .attr('stroke-linecap', 'round')
        .attr('stroke-dasharray', length + ' ' + length)
        .attr('stroke-dashoffset', length)
}

function reset_pixel(id) {
    var canvas = d3.select("#" + id + '-canvas')
    canvas.select('#path'+id)
        .attr('stroke-dashoffset', 0)
        .style('opacity', 0)
    canvas.select('#bgimage'+id)
        .style('opacity', 0.7)
    canvas.select('#bgrect'+id)
        .style('opacity', 0)
    canvas.select('#clipPathShape'+id)
        .attr('d', clip)
}

function load_pixel(id, delay, d2, new_x, new_y, size, render_queue, sync, callback) {
    var canvas = d3.select("#" + id + '-canvas')
    canvas.select('#path'+id)
        .transition()
        .ease(d3.easeLinear)
        .duration(delay)
        .attr('stroke-dashoffset', 0)
        .transition()
        .duration(0)
        .style('opacity', 0)
    canvas.select('#bgimage'+id)
        .transition()
        .duration(delay)
        .ease(d3.easeLinear)
        .style('opacity', 0.7)
    canvas.select('#bgrect'+id)
        .transition()
        .duration(delay)
        .ease(d3.easeLinear)
        .style('opacity', 0)

    setTimeout(function() {
        if(sync == false) { render_queue.defer(render_pixel, id, new_x, new_y, size, d2) }
        if(callback != null) { callback(null, 0) }
    }, delay)
}

function render_pixel(id, x, y, size, delay, callback) {
    var split = size/10
    var midX, midY, clip, init_delay = 0

    for(midY=0; midY<=size-split; midY+=split) {
        for(midX=split; midX<=size; midX+=split) {
            var clip = `M ${x},${y} l${size},0 l0,${midY} l${-(size-midX)},0 l0,${split} l${-midX},0 Z`
            canvas.select('#clipPathShape'+id)
                .transition()
                .ease(d3.easeLinear)
                .duration(0)
                .delay(init_delay)
                .attr('d', clip)
            init_delay += delay 
        }
    }
    setTimeout(function() { callback(null, 0) }, init_delay-delay)
}


function animate(id, x, y, load_c, render_c, sync=false) {
    var linewidth = 4
    var size = 60+linewidth
    linewidth /= 2
    var imgpath = "testimage5.jpg"
    var gridsize = 4
    var gap = 3 
    var imgsize = size*gridsize

    if(load_c == 0) { var load_queue = d3.queue() }
    else { var load_queue = d3.queue(load_c) }
    if(render_c == 0) { var render_queue = d3.queue() }
    else { var render_queue = d3.queue(render_c) }

    for(var i=0; i<gridsize; i++) {
        for(var j=0; j<gridsize; j++) {
            id += 1
            var new_x = x+(j*size + j*gap)
            var new_y = y+(i*size + i*gap)
            init_pixel(
                id, new_x, new_y, size, linewidth, imgpath, -(j*size), -(i*size), imgsize
            )
            var d1 = Math.floor(Math.random() * (7000 - 1500 + 1)) + 1500
            var d2 = Math.floor(Math.random() * (15 - 8 + 1)) + 8
            load_queue.defer(
                load_pixel, id, d1, d2, new_x, new_y, size, render_queue, sync
            )
            if(sync == true) {
                load_queue.defer(render_pixel, id, new_x, new_y, size, d2)
            }
        }
    }
}

// animate(100, 0, 0, 1, 1, true)

// animate(200, 300, 0, 8, 1, false)
// animate(200, 300, 0, 0, 1, false)

// animate(300, 600, 0, 8, 8, false)
// animate(300, 600, 0, 0, 0, false)

function init_canvas(div_id) {
    var basewidth = parseInt(d3.select('#' + div_id).style('width'))
    var baseheight = basewidth;

    var margin = {top: 35, right: 35, bottom: 35, left: 35},
        width = basewidth - margin.left - margin.right,
        height = baseheight - margin.top - margin.bottom

    var svg = d3.select("#" + div_id)
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
    var canvas = svg.append("g")
        .attr('id', div_id + '-canvas')
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

    var defs = svg.append("defs");
    defs.append("filter")
        .attr("id", "bw-filter")
        .append('feColorMatrix')
        .attr('type', 'saturate')
        .attr('values', '0')

    var linewidth = 4
    linewidth /= 2
    var imgpath = "/imgs/cvsp/testimage1.jpg"

    init_pixel(div_id, 0, 0, width, linewidth, imgpath, 0, 0, width*4)

    load_pixel(div_id, 4000, 0, 0, 0, width, null, true, null)
}

init_canvas('single-pixel-loading')


// d3.json("data.json", function(d) {
// });
