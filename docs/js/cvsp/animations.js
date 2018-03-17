
var all = {} 

// this function appends all the elements of a pixel and initializes them
function init_pixel(d, i) {
    var s = d.size-(2*d.linewidth)
    var path = `M${d.x+d.linewidth},${d.y+d.linewidth}l${s},0l0,${s}l${-s},0Z`
    var clippath = `M${d.x},${d.y}l${d.size},0l0,${d.size}l${-d.size},0Z`
    all[d.canvas_id].pixels[i] = {status: 'waiting', data: d}
    
    var pixel = d3.select("#" + d.canvas_id + '-canvas')
        .append('g').attr('class', 'pixel').attr('id', 'pixel'+i)

    pixel.append("clipPath")
        .attr("id", "rendercrop-"+d.canvas_id+i)
        .append("path")
        .attr("id", "rendercroppath-"+d.canvas_id+i)
    pixel.append("clipPath")
        .attr("id", "bgimagecrop-"+d.canvas_id+i)
        .append("path")
        .attr("d", clippath)

    pixel.append('path')
        .attr('id', 'bgrect')
        .attr("d", clippath)
        .style('opacity', (all[d.canvas_id].reset_level == 'render') ? 0 : 0.7)

    pixel.append("svg:image")
        .attr('id', 'bgimage')
        .attr('x', d.x + d.offsetX)
        .attr('y', d.y + d.offsetY)
        .attr('width', d.imgsize)
        .attr('height', d.imgsize)
        .attr("xlink:href", d.imgpath)
        .attr("clip-path", 'url(#bgimagecrop-'+d.canvas_id + i + ')')
        .style('opacity', (all[d.canvas_id].reset_level == 'render') ? 0.7 : 0)
        .style('filter', 'url(#bw-filter)')

    pixel.append("svg:image")
        .attr('x', d.x + d.offsetX)
        .attr('y', d.y + d.offsetY)
        .attr('width', d.imgsize)
        .attr('height', d.imgsize)
        .attr("xlink:href", d.imgpath)
        .attr("clip-path", 'url(#rendercrop-' + d.canvas_id + i + ')')

    pixel.append("path")
        .attr('id', 'loading-line')
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

// handles the load animation for a pixel
function load(pixel, d) {
    var t = d3.transition().ease(d3.easeLinear).duration(d.delay1)
    pixel.select('#loading-line')
        .style('opacity', 1)
        .transition(t)
        .attr('stroke-dashoffset', 0)
        .on('end', function() { d3.select(this).style('opacity', 0) })
    pixel.select('#bgimage')
        .transition(t).style('opacity', 0.7)
    pixel.select('#bgrect')
        .transition(t).style('opacity', 0)
}

// handles the render animation for a pixel
function render(pixel, d, i) {
    var midX, midY, clip, init_delay = 0, split = d.size/10
    for(midY=0; midY<=d.size-split; midY+=split) {
        for(midX=split; midX<=d.size; midX+=split) {
            var clip = `M${d.x},${d.y}l${d.size},0l0,${midY}l${-(d.size-midX)},0l0,${split}l${-midX},0Z`
            pixel.select('#rendercroppath-'+d.canvas_id+i)
                .transition().ease(d3.easeLinear).duration(0).delay(init_delay)
                    .attr('d', clip)
            init_delay += (d.delay2/100)
        }
    }
}

// resets all pixels of a div to initial value
function reset(cid, dur, delay) {
    all[cid].load_finished = 0
    all[cid].render_finished = 0
    var t = d3.transition().ease(d3.easeLinear).duration(dur).delay(delay)
    d3.select('#'+cid).selectAll('.pixel').each(function(d, i) {
        all[cid].pixels[i].status = 'ended'
        var pixel = d3.select(this)
        if(all[cid].reset_level == 'render') {
            pixel.select('#rendercroppath-'+cid+i)
                .transition(t).attr('d', '')
        } else if(all[cid].reset_level == 'load') {
            pixel.select('#loading-line')
                .attr('stroke-dashoffset', 4*all[cid].pixels[i].data.size)
                .style('opacity', 0)
            pixel.select('#bgimage')
                .transition(t).style('opacity', 0)
            pixel.select('#bgrect')
                .transition(t).style('opacity', 0.7)
            pixel.select('#rendercroppath-'+cid+i)
                .transition(t).attr('d', '')
        }
    })
}

// generates data for each pixel
function generate_data(m) {
    var data = []
    for(var i=0; i<m.gridsize; i++) {
        for(var j=0; j<m.gridsize; j++) {
            data.push({
                x: m.init_x+(j*m.size + j*m.gap),
                y: m.init_y+(i*m.size + i*m.gap),
                offsetX: -(j*m.size),
                offsetY: -(i*m.size),
                linewidth: m.linewidth,
                delay1: (m.d1) ? m.d1 : Math.floor(Math.random() * (7000 - 1500 + 1)) + 1500,
                delay2: (m.d2) ? m.d2 : (Math.floor(Math.random() * (15 - 8 + 1)) + 8)*100,
                size: m.size,
                imgsize: (m.gridsize == 1) ? m.size*4 : m.size * m.gridsize,
                canvas_id: m.canvas_id,
                gridsize: m.gridsize,
                imgpath: m.imgpath,
            })
        }
    }
    return data
}

// initializes the svg element for a div
function init_canvas(canvas_id, m, reset_level) {
    var w = parseInt(d3.select('#' + canvas_id).style('width'))
    var l = m.size*m.gridsize + m.gap*(m.gridsize-1)
    if(l > w-m.width_margin) {
        m.size = ((w-m.width_margin) - (m.gap*(m.gridsize-1))) / m.gridsize
        m.size -= m.size % 10
    }
    var h = (m.size*m.gridsize + m.gap*(m.gridsize-1)) + m.height_margin 
    m.init_x = (w - (m.size*m.gridsize + m.gap*(m.gridsize-1)))/2
    m.init_y = m.height_margin/2

    var svg = d3.select("#" + canvas_id).append('svg')
        .attr('width', w).attr('height', h).attr('id', canvas_id + '-canvas')

    svg.append("defs").append("filter")
        .attr("id", "bw-filter")
        .append('feColorMatrix')
            .attr('type', 'saturate')
            .attr('values', '0')

    all[canvas_id] = {pixels: {}}
    all[canvas_id].checklist = []
    all[canvas_id].started = false
    all[canvas_id].reset_level = reset_level
    all[canvas_id].total = m.gridsize*m.gridsize
    m.canvas_id = canvas_id
    var d = generate_data(m)
    d.forEach(init_pixel)
}

// creates a closure for specific animations
function start(cid, l, r, sync, do_load, do_render, reset_level, checklist) {
    return function() {
        all[cid].load_queue = (l) ? d3.queue(l) : d3.queue()
        all[cid].render_queue = (r) ? d3.queue(r) : d3.queue()
        all[cid].sync = sync
        all[cid].load_finished = 0
        all[cid].render_finished = 0
        all[cid].do_load = do_load
        all[cid].do_render = do_render
        all[cid].reset_level = reset_level
        all[cid].checklist = checklist
        for(var x=0; x<all[cid].total; x++) {
            if(!do_load && do_render) {
                all[cid].pixels[x].status = 'start_render'
            } else {
                all[cid].pixels[x].status = 'start_load'
            }
        }
    }
}

function check_pixel(cid, pid) {
    var d = all[cid].pixels[pid].data
    var pixel = d3.select('#'+cid).select('#pixel'+pid)
    // queue loading animations
    if(all[cid].pixels[pid].status == 'start_load' && all[cid].do_load) {
        all[cid].pixels[pid].status = (all[cid].sync)? 'start_render':'loading'
        all[cid].load_queue.defer(function(callback) {
            pixel.call(load, d);
            d3.timeout(function() {
                all[cid].load_finished += 1
                if(!all[cid].sync){all[cid].pixels[pid].status = 'start_render'}
                callback(null)
            }, d.delay1)
        })
    } 
    // queue rendering animations
    if(all[cid].pixels[pid].status == 'start_render' && all[cid].do_render) {
        var Q = (all[cid].sync) ? all[cid].load_queue : all[cid].render_queue
        all[cid].pixels[pid].status = 'rendering'
        Q.defer(function(callback) {
            pixel.call(render, d, pid);
            d3.timeout(function() {
                all[cid].render_finished += 1
                callback(null)
            }, d.delay2)
        })
    }
}

d3.timer(function(time) {
    Object.keys(all).map(function(cid) {
        Object.keys(all[cid].pixels).map(function(pid) {
            check_pixel(cid, pid)
        })

        var count = 0
        all[cid].checklist.forEach(function(d, i) {
            if(all[d].do_load && !all[d].do_render) {
                if(all[d].load_finished ==  all[d].total) { count+=1 }
            } else {
                if(all[d].render_finished ==  all[d].total) { count+=1 }
            }
        })
        if(count == all[cid].checklist.length) { 
            all[cid].checklist.forEach(function(d, i) {
                reset(d, 150, 2000)
                d3.timeout(all[d].start, 3000)
            }) 
        }
    })
})

var default_meta = {
    gridsize: 4,
    size: 100,
    offset: '50%',
    gap: 4,
    init_x: 0,
    init_y: 0,
    width_margin: 30,
    height_margin: 40,
    linewidth: 3,
    imgpath: "../imgs/cvsp/testimage1.jpg"
}

function start_anim(cid, m, l, r, sync, do_l, do_r, level, checklist) {
    init_canvas(cid, m, level)
    all[cid].start = start(cid, l, r, sync, do_l, do_r, level, checklist)
    var waypoint = new Waypoint({
        element: document.getElementById(cid),
        handler: function(direction) {
            if(!all[cid].started) { 
                all[cid].started = true
                all[cid].start() 
            }
        },
        offset: m.offset
    })
}

var m = Object.assign({}, default_meta); 
m.gridsize = 1
m.height_margin = 10
m.widht_margin = 10
m.offset = '80%'
m.size = 150 
m.d1 = 4000
m.d2 = 4000
start_anim('single-pixel-load', m, 1, 1, false, true, false, 'load', ['single-pixel-load'])
start_anim('single-pixel-render', m, 1, 1, false, false, true, 'render', ['single-pixel-render'])

start_anim('sync-ideal', default_meta, 1, 1, true, true, true, 'load', ['sync-ideal'])
start_anim('parallel-ideal', default_meta, 0, 0, false, true, true, 'load', ['parallel-ideal'])
start_anim('coroutine-ideal', default_meta, 0, 1, false, true, true, 'load', ['coroutine-ideal'])

var m2 = Object.assign({}, default_meta); 
m2.linewidth = 2
m2.gap = 3
m2.width_margin = 10
start_anim('all-ideal-left', m2, 1, 1, true, true, true, 'load', ['all-ideal-left', 'all-ideal-middle', 'all-ideal-right'])
start_anim('all-ideal-middle', m2, 0, 1, false, true, true, 'load', ['all-ideal-left', 'all-ideal-middle', 'all-ideal-right'])
start_anim('all-ideal-right', m2, 0, 0, false, true, true, 'load', ['all-ideal-left', 'all-ideal-middle', 'all-ideal-right'])

default_meta.imgpath = "../imgs/cvsp/testimage2.jpg"
start_anim('io-bound-left', default_meta, 8, 1, false, true, false, 'load', ['io-bound-left', 'io-bound-right'])
start_anim('io-bound-right', default_meta, 8, 1, false, true, false, 'load', ['io-bound-left', 'io-bound-right'])

start_anim('cpu-bound-left', default_meta, 8, 1, false, false, true, 'render', ['cpu-bound-left', 'cpu-bound-right'])
start_anim('cpu-bound-right', default_meta, 8, 8, false, false, true, 'render', ['cpu-bound-left', 'cpu-bound-right'])

start_anim('both-bound-left', default_meta, 8, 1, false, true, true, 'load', ['both-bound-left', 'both-bound-right'])
start_anim('both-bound-right', default_meta, 8, 8, false, true, true, 'load', ['both-bound-left', 'both-bound-right'])




