var pixel_counts  = {}

function init_pixel(d) {
    var s = d.size-(2*d.linewidth)
    var path = `M ${d.x+d.linewidth},${d.y+d.linewidth} l${s},0 l0,${s} l${-s},0 Z`
    var clippath = `M ${d.x},${d.y} l${d.size},0 l0,${d.size} l${-d.size},0 Z`
    var pixel = d3.select("#" + d.canvas_id + '-canvas').append('g')
    

    pixel.append("clipPath")  
        .attr("id", "clipPath"+d.id)
        .append("path") 
            .attr('id', 'clipPathShape'+d.id)
            .attr("d", '')
    pixel.append("clipPath")  
        .attr("id", "clipPathCrop"+d.id)
        .append("path")
            .attr('id', 'imgCropClip'+d.id)
            .attr("d", clippath)
    
    pixel.append('path')
        .attr('id', 'bgrect'+d.id)
        .attr("d", clippath)
        .style('opacity', 0.70)

    pixel.append("svg:image")
        .attr('id', 'bgimage'+d.id)
        .attr('x', d.x + d.offsetX)
        .attr('y', d.y + d.offsetY)
        .attr('width', d.imgsize)
        .attr('height', d.imgsize)
        .attr("xlink:href", d.imgpath)
        .attr("clip-path", 'url(#clipPathCrop' + d.id + ')')
        .style('opacity', 0.00)
        .style('filter', 'url(#bw-filter)')

    pixel.append("svg:image")
        .attr('id', 'image'+d.id)
        .attr('x', d.x + d.offsetX)
        .attr('y', d.y + d.offsetY)
        .attr('width', d.imgsize)
        .attr('height', d.imgsize)
        .attr("xlink:href", d.imgpath)
        .attr("clip-path", 'url(#clipPath' + d.id + ')')

    pixel.append("path")     
        .attr('id', 'path'+d.id)
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

function reset_pixel(d, delay) {
    if(d.reset_level == 'render') {
        d3.select('#clipPathShape'+ d.id)
            .transition().ease(d3.easeLinear).duration(delay)
                .attr('d', '')
    } else if(d.reset_level == 'load') {
        d3.select('#path'+d.id)
            .attr('stroke-dashoffset', 4*d.size)
            .style('opacity', 1)
        d3.select('#bgimage'+d.id)
            .transition().ease(d3.easeLinear).duration(delay)
                .style('opacity', 0)
        d3.select('#bgrect'+d.id)
            .transition().ease(d3.easeLinear).duration(delay)
                .style('opacity', 0.7)
        d3.select('#clipPathShape'+d.id)
            .transition().ease(d3.easeLinear).duration(delay)
                .attr('d', '')
    }
}

function load_pixel(d, callback) {
    d3.select('#path'+d.id)
        .transition().ease(d3.easeLinear).duration(d.delay1)
            .attr('stroke-dashoffset', 0)
        .transition().duration(0)
            .style('opacity', 0)
    d3.select('#bgimage'+d.id)
        .transition().ease(d3.easeLinear).duration(d.delay1)
            .style('opacity', 0.7)
    d3.select('#bgrect'+d.id)
        .transition().ease(d3.easeLinear).duration(d.delay1)
            .style('opacity', 0)
    setTimeout(function() {
        if(d.do_load && !d.do_render) {
            // running only load anim
            pixel_counts[d.canvas_id].pixels.push(d)
            pixel_counts[d.canvas_id].last_pixel += 1
            d.last_pixel = pixel_counts[d.canvas_id].last_pixel
            if(d.last_pixel == d.final_count) {
                for(var x=0; x<pixel_counts[d.canvas_id].pixels.length; x++) {
                    setTimeout(reset_pixel, 2000, pixel_counts[d.canvas_id].pixels[x], 150)
                }
                for(var x=0; x<pixel_counts[d.canvas_id].callbacks.length; x++) {
                    setTimeout(pixel_counts[d.canvas_id].callbacks[x], 3000)
                }
            } 
        }
        if(d.sync == false && d.do_render) { 
            d.render_queue.defer(render_pixel, d)
        }
        if(callback != null) { callback(null, 0) }
    }, d.delay1)
}

function render_pixel(d, callback) {
    var midX, midY, clip, init_delay = 0, split = d.size/10
    for(midY=0; midY<=d.size-split; midY+=split) {
        for(midX=split; midX<=d.size; midX+=split) {
            var clip = `M ${d.x},${d.y} l${d.size},0 l0,${midY} l${-(d.size-midX)},0 l0,${split} l${-midX},0 Z`
            d3.select('#clipPathShape'+d.id)
                .transition().ease(d3.easeLinear).duration(0).delay(init_delay)
                    .attr('d', clip)
            init_delay += d.delay2
        }
    }
    setTimeout(function() { 
        if(d.do_render) {
            pixel_counts[d.canvas_id].pixels.push(d)
            pixel_counts[d.canvas_id].last_pixel += 1
            d.last_pixel = pixel_counts[d.canvas_id].last_pixel
        }
        if(d.last_pixel == d.final_count) {
            for(var x=0; x<pixel_counts[d.canvas_id].pixels.length; x++) {
                setTimeout(reset_pixel, 2000, pixel_counts[d.canvas_id].pixels[x], 150)
            }
            for(var x=0; x<pixel_counts[d.canvas_id].callbacks.length; x++) {
                setTimeout(pixel_counts[d.canvas_id].callbacks[x], 3000)
            }
        }
        if(callback != null) { callback(null, 0) }
    }, init_delay-d.delay2)
}


function animate(d) {
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
                id: d.div_id + id,
                div_id: d.div_id,
                canvas_id: d.canvas_id,
                gridsize: d.gridsize,
                sync: d.sync,
                final_count: d.final_count,
                reset_level: d.reset_level,
                imgpath: d.imgpath,
                do_load: d.do_load,
                do_render: d.do_render
            }
            init_pixel(data)
            if(!d.do_load) {
                data.delay1 = 0
                d.load_queue.defer(load_pixel, data) 
            } 
            queue_data.push(data)
            id += 1
        }
    }
    

    var repeat = function() {
        console.log('repeat!')
        pixel_counts[d.canvas_id].last_pixel = 0
        for(var x=0; x<queue_data.length; x++) {
            var data = queue_data[x]
            if(d.do_load) { d.load_queue.defer(load_pixel, data) }
            if(d.sync == true) {
                d.render_queue.defer(render_pixel, data)
            }
        }
    }
    pixel_counts[d.canvas_id].callbacks.push(repeat)
    var waypoint = new Waypoint({
        element: document.getElementById(d.canvas_id),
        handler: function(direction) {
            if(!started) {
                started = true
                repeat()           
            }
        },
        offset: '50%'
    })
}

function init_canvas(canvas_id, basewidth, baseheight, top, left) {
    var margin = {top: top, right: 0, bottom: top, left: left}
    var width = basewidth - margin.left - margin.right
    var height = baseheight - margin.top - margin.bottom

    var svg = d3.select("#" + canvas_id).append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
    var canvas = svg.append("g").attr('id', canvas_id + '-canvas')
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

    var defs = svg.append("defs");
    defs.append("filter")
        .attr("id", "bw-filter")
        .append('feColorMatrix')
            .attr('type', 'saturate')
            .attr('values', '0')

    pixel_counts[canvas_id] = {}
    pixel_counts[canvas_id].last_pixel = 0
    pixel_counts[canvas_id].pixels = []
    pixel_counts[canvas_id].callbacks = []
    return width
}

function single_pixel(level) {
    var canvas_id = 'single-pixel-'+level
    var w = parseInt(d3.select('#' + canvas_id).style('width'))
    var width = init_canvas(canvas_id, w, w, 35, 35)
    var data = {
        x: 0, y: 0, offsetX: 0, offsetY: 0,
        linewidth: 3,
        delay1: (level == 'load') ? 4000 : 0,
        delay2: 40,
        size: width,
        imgsize: 4*width,
        reset_level: level,
        id: canvas_id+'1',
        div_id: canvas_id,
        canvas_id: canvas_id,
        final_count: 1,
        imgpath: "/imgs/cvsp/testimage1.jpg"
    }

    init_pixel(data)
    if(level=='render') { load_pixel(data, null) }
    var repeat = function() {
        if(level == 'load') { load_pixel(data, null) }
        if(level=='render') { render_pixel(data, null) }
        setTimeout(reset_pixel, 5000, data, 150)
    }

    var started = false
    var waypoint = new Waypoint({
        element: document.getElementById(canvas_id),
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

function single_anim(canvas_id, l, r, sync) {
    var d = {
        gridsize: 4,
        gap: 3,
        sync: sync,
        do_load: true,
        do_render: true,
        reset_level: 'load',
        y: 0,
        size: 100,
        linewidth: 3,
        div_id: canvas_id,
        canvas_id: canvas_id,
        load_queue: (l==0) ? d3.queue() : d3.queue(l),
        render_queue: (r==0) ? d3.queue() : d3.queue(r),
        imgpath: "/imgs/cvsp/testimage1.jpg"
    }
    d.final_count = d.gridsize*d.gridsize
    if(sync) { d.render_queue = d.load_queue }

    var w = parseInt(d3.select('#' + canvas_id).style('width'))
    var length = d.size*d.gridsize + d.gap*(d.gridsize-1)
    if(length > w-30) { 
        d.size = ((w-30) - (d.gap*(d.gridsize-1))) / d.gridsize
        d.size -= d.size % 10
    }

    var h = (d.size*d.gridsize + d.gap*(d.gridsize-1))
    var x = (w - (d.size*d.gridsize + d.gap*(d.gridsize-1)))/2
    init_canvas(canvas_id, w, h+(2*20), 20, 0)
    d.x = x

    animate(d)
}

function double_anim(canvas_id, q, sync, do_load, do_render, reset_level) {
    var d = {
        gridsize: 4,
        gap: 3,
        sync: sync,
        do_load: do_load,
        do_render: do_render,
        reset_level: reset_level,
        y: 0,
        size: 100,
        linewidth: 3,
        canvas_id: canvas_id,
        imgpath: "/imgs/cvsp/testimage2.jpg"
    }
    d.final_count = 2*d.gridsize*d.gridsize

    var w = parseInt(d3.select('#' + canvas_id).style('width'))
    var length = 2*(d.size*d.gridsize + d.gap*(d.gridsize-1))
    if(length > w-45) { 
        d.size = ((w-45) - 2*(d.gap*(d.gridsize-1))) / (2*d.gridsize)
        d.size -= d.size % 10
    }

    var h = (d.size*d.gridsize + d.gap*(d.gridsize-1))
    init_canvas(canvas_id, w, h+(2*20), 20, 0)

    var d1 = Object.assign({}, d); 
    d1.x = (w - 2*(d.size*d.gridsize + d.gap*(d.gridsize-1)))/3
    d1.load_queue = d3.queue(q)
    d1.render_queue = d3.queue(1)
    d1.div_id = canvas_id + '-left'
    animate(d1)

    d.x = d.size*d.gridsize + d.gap*(d.gridsize-1) + (2*d1.x)
    d.load_queue = d3.queue(q)
    d.render_queue = d3.queue(q)
    d.div_id = canvas_id + '-right'
    animate(d)
}

function all_anim(canvas_id, q, gridsize, linewidth, img) {
    var d = {
        gridsize: gridsize,
        gap: 3,
        // sync: false,
        do_load: true,
        do_render: true,
        reset_level: 'load',
        y: 0,
        size: 100,
        linewidth: linewidth,
        canvas_id: canvas_id,
        imgpath: img
    }
    d.final_count = 3*d.gridsize*d.gridsize

    var w = parseInt(d3.select('#' + canvas_id).style('width'))
    var length = 3*(d.size*d.gridsize + d.gap*(d.gridsize-1))
    if(length > w-20) { 
        d.size = ((w-20) - 3*(d.gap*(d.gridsize-1))) / (3*d.gridsize)
        d.size -= d.size % 10
    }

    var h = (d.size*d.gridsize + d.gap*(d.gridsize-1))
    init_canvas(canvas_id, w, h+(2*10), 10, 0)

    var d1 = Object.assign({}, d); 
    d1.x = (w - 3*(d.size*d.gridsize + d.gap*(d.gridsize-1)))/4
    d1.sync = true, 
    d1.load_queue = d3.queue(1)
    d1.render_queue = d1.load_queue
    d1.div_id = canvas_id + '-left'
    animate(d1)

    var d2 = Object.assign({}, d); 
    d2.x = d.size*d.gridsize + d.gap*(d.gridsize-1) + (2*d1.x)
    d2.sync = false, 
    d2.load_queue = (q==0) ? d3.queue() : d3.queue(q)
    d2.render_queue = d3.queue(1)
    d2.div_id = canvas_id + '-middle'
    animate(d2)

    d.x = 2*(d.size*d.gridsize + d.gap*(d.gridsize-1)) + (3*d1.x)
    d.sync = false, 
    d.load_queue = (q==0) ? d3.queue() : d3.queue(q)
    d.render_queue = (q==0) ? d3.queue() : d3.queue(q)
    d.div_id = canvas_id + '-right'
    animate(d)
}


single_pixel('load')
single_pixel('render')
single_anim('sync-ideal', 1, 1, true)
single_anim('parallel-ideal', 0, 0, false)
single_anim('coroutine-ideal', 0, 1, false)
double_anim('io-bound', 8, false, true, false, 'load')
double_anim('cpu-bound', 8, true, false, true, 'render')
double_anim('both-bound', 8, false, true, true, 'load')
all_anim('all-ideal', 0, 4, 2, "/imgs/cvsp/testimage1.jpg")
// all_anim('all-real', 24, 8, 1, "/imgs/cvsp/testimage2.jpg")
