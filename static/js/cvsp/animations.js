
function init_pixel(id, cid, d) {
    var s = d.size-(2*d.linewidth)
    var path = `M ${d.x+d.linewidth},${d.y+d.linewidth} l${s},0 l0,${s} l${-s},0 Z`
    var clippath = `M ${d.x},${d.y} l${d.size},0 l0,${d.size} l${-d.size},0 Z`
    var pixel = d3.select("#" + cid + '-canvas').append('g')

    pixel.append("clipPath")  
        .attr("id", "clipPath"+id)
        .append("path") 
            .attr('id', 'clipPathShape'+id)
            .attr("d", '')
    pixel.append("clipPath")  
        .attr("id", "clipPathCrop"+id)
        .append("path")
            .attr('id', 'imgCropClip'+id)
            .attr("d", clippath)
    
    pixel.append('path')
        .attr('id', 'bgrect'+id)
        .attr("d", clippath)
        .style('opacity', 0.70)

    pixel.append("svg:image")
        .attr('id', 'bgimage'+id)
        .attr('x', d.x + d.offsetX)
        .attr('y', d.y + d.offsetY)
        .attr('width', d.imgsize)
        .attr('height', d.imgsize)
        .attr("xlink:href", d.imgpath)
        .attr("clip-path", 'url(#clipPathCrop' + id + ')')
        .style('opacity', 0.00)
        .style('filter', 'url(#bw-filter)')

    pixel.append("svg:image")
        .attr('id', 'image'+id)
        .attr('x', d.x + d.offsetX)
        .attr('y', d.y + d.offsetY)
        .attr('width', d.imgsize)
        .attr('height', d.imgsize)
        .attr("xlink:href", d.imgpath)
        .attr("clip-path", 'url(#clipPath' + id + ')')

    pixel.append("path")     
        .attr('id', 'path'+id)
        .attr('d', path)
        .attr('stroke-linejoin', 'round')
        .attr('stroke-linecap', 'round')
        .attr('stroke-dasharray', 4*d.size + ' ' + 4*d.size)
        .attr('stroke-dashoffset', 4*d.size)
        .style('stroke-width', d.linewidth*2)

    pixel.selectAll('path')
        .style("fill", "none")
        .style("stroke", "#2d2d2d")
}

function reset_pixel(id, d, delay, level) {
    if(level == 'render') {
        d3.select('#clipPathShape'+id)
            .transition().ease(d3.easeLinear).duration(delay)
                .attr('d', '')
    } else if(level == 'load') {
        d3.select('#path'+id)
            .attr('stroke-dashoffset', 4*d.size)
            .style('opacity', 1)
        d3.select('#bgimage'+id)
            .transition().ease(d3.easeLinear).duration(delay)
                .style('opacity', 0)
        d3.select('#bgrect'+id)
            .transition().ease(d3.easeLinear).duration(delay)
                .style('opacity', 0.7)
        d3.select('#clipPathShape'+id)
            .transition().ease(d3.easeLinear).duration(delay)
                .attr('d', '')
    }
}

function load_pixel(id, d, sync, callback) {
    d3.select('#path'+id)
        .transition().ease(d3.easeLinear).duration(d.delay1)
            .attr('stroke-dashoffset', 0)
        .transition().duration(0)
            .style('opacity', 0)
    d3.select('#bgimage'+id)
        .transition().ease(d3.easeLinear).duration(d.delay1)
            .style('opacity', 0.7)
    d3.select('#bgrect'+id)
        .transition().ease(d3.easeLinear).duration(d.delay1)
            .style('opacity', 0)
    setTimeout(function() {
        if(sync == false) { d.render_queue.defer(render_pixel, id, d) }
        if(callback != null) { callback(null, 0) }
    }, d.delay1)
}

function render_pixel(id, d, callback) {
    var midX, midY, clip, init_delay = 0, split = d.size/10
    for(midY=0; midY<=d.size-split; midY+=split) {
        for(midX=split; midX<=d.size; midX+=split) {
            var clip = `M ${d.x},${d.y} l${d.size},0 l0,${midY} l${-(d.size-midX)},0 l0,${split} l${-midX},0 Z`
            d3.select('#clipPathShape'+id)
                .transition().ease(d3.easeLinear).duration(0).delay(init_delay)
                    .attr('d', clip)
            init_delay += d.delay2
        }
    }
    setTimeout(function() { 
        if(callback != null) { callback(null, 0) }
    }, init_delay-d.delay2)
}


function animate(div_id, d) {
    var id = 0
    var started = false
    var queue_data = []

    for(var i=0; i<d.gridsize; i++) {
        for(var j=0; j<d.gridsize; j++) {
            var data = {
                x: d.x+(j*d.size + j*d.gap),
                y: d.y+(i*d.size + i*d.gap),
                offsetX: -(j*d.size),
                offsetY: -(i*d.size),
                linewidth: d.linewidth,
                delay1: Math.floor(Math.random() * (7000 - 1500 + 1)) + 1500,
                delay2: Math.floor(Math.random() * (15 - 8 + 1)) + 8,
                size: d.size,
                imgsize: d.size * d.gridsize,
                render_queue: d.render_queue,
                imgpath: d.imgpath
            }
            init_pixel(div_id+id, div_id, data)
            queue_data.push([id, data])
            id += 1
        }
    }

    var waypoint = new Waypoint({
        element: document.getElementById(div_id),
        handler: function(direction) {
            if(!started) {
                started = true
                for(var x=0; x<queue_data.length; x++) {
                    var id = queue_data[x][0]
                    var data = queue_data[x][1]
                    d.load_queue.defer(load_pixel, div_id+id, data, d.sync)
                    if(d.sync == true) {
                        d.load_queue.defer(render_pixel, div_id+id, data)
                    }
                }
            }
        },
        offset: '50%'
    })
}

// animate(100, 0, 0, 1, 1, true)

// animate(200, 300, 0, 8, 1, false)
// animate(200, 300, 0, 0, 1, false)

// animate(300, 600, 0, 8, 8, false)
// animate(300, 600, 0, 0, 0, false)

function init_canvas(div_id, basewidth, baseheight, top, left) {
    var margin = {top: top, right: 0, bottom: top, left: left}
    var width = basewidth - margin.left - margin.right
    var height = baseheight - margin.top - margin.bottom

    var svg = d3.select("#" + div_id).append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
    var canvas = svg.append("g").attr('id', div_id + '-canvas')
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

    var defs = svg.append("defs");
    defs.append("filter")
        .attr("id", "bw-filter")
        .append('feColorMatrix')
            .attr('type', 'saturate')
            .attr('values', '0')
    return width
}

function single_pixel(level) {
    var div_id = 'single-pixel-'+level
    var w = parseInt(d3.select('#' + div_id).style('width'))
    var width = init_canvas(div_id, w, w, 35, 35)
    var data = {
        x: 0, y: 0, offsetX: 0, offsetY: 0,
        linewidth: 3,
        delay1: (level == 'load') ? 4000 : 0,
        delay2: 40,
        size: width,
        imgsize: 4*width,
        imgpath: "/imgs/cvsp/testimage1.jpg"
    }

    init_pixel(div_id, div_id, data)
    if(level=='render') { load_pixel(div_id, data, true, null) }
    var repeat = function() {
        if(level == 'load') { load_pixel(div_id, data, true, null) }
        if(level=='render') { render_pixel(div_id, data, null) }
        setTimeout(reset_pixel, 5000, div_id, data, 150, level)
    }

    var started = false
    var waypoint = new Waypoint({
        element: document.getElementById(div_id),
        handler: function(direction) {
            if(!started) {
                started = true
                repeat()
                setInterval(repeat, 6000)
            }
        },
        offset: '60%'
    })
}

function sync_ideal() {
    var div_id = 'sync-ideal'

    var data = {
        gridsize: 4,
        gap: 3,
        sync: true,
        y: 0,
        linewidth: 3,
        load_queue: d3.queue(1),
        imgpath: "/imgs/cvsp/testimage1.jpg"
    }
    data.size = 100+(2*data.linewidth)
    data.render_queue = data.load_queue

    var w = parseInt(d3.select('#' + div_id).style('width'))
    var h = (data.size*data.gridsize + data.gap*(data.gridsize-1))
    var width = init_canvas(div_id, w, h+(2*20), 20, 0)
    var x = (width - (data.size*data.gridsize + data.gap*(data.gridsize-1)))/2
    data.x = x

    animate(div_id, data)

}

single_pixel('load')
single_pixel('render')
sync_ideal()
