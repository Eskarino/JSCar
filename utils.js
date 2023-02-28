function draw_segment(ctx, segment, line_width, line_color, dashed = false) {
    x1 = segment[0][0];
    y1 = segment[0][1];
    x2 = segment[1][0];
    y2 = segment[1][1];
    draw_line(ctx, x1, y1, x2, y2, line_width, line_color, dashed)
}

function draw_line(ctx, x1, y1, x2, y2, line_width, line_color, dashed) {
    ctx.line_width = line_width;
    ctx.strokeStyle = line_color;
    if(dashed){
        ctx.setLineDash([20, 20]);
    }else{
        ctx.setLineDash([]);
    }
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

function fill_polygon(ctx, polygon, color){
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(polygon[0][0][0], polygon[0][0][1]);
    for(i = 0; i<polygon.length; i++){
        ctx.lineTo(polygon[i][0][0], polygon[i][0][1]);
    }
    ctx.closePath();
    ctx.fill();
}

function lerp(a, b, t){
    return a+(b-a)*t
}

function getIntersection(ray, segment){
    x1_ray = ray[0][0];
    y1_ray = ray[0][1];
    x2_ray = ray[1][0];
    y2_ray = ray[1][1];

    x1_seg = segment[0][0];
    y1_seg = segment[0][1];
    x2_seg = segment[1][0];
    y2_seg = segment[1][1];

    const tTop = (x2_seg-x1_seg)*(y1_ray-y1_seg)-(y2_seg-y1_seg)*(x1_ray-x1_seg);
    const uTop = (x1_ray-x2_ray)*(y1_seg-y1_ray)-(y1_ray-y2_ray)*(x1_seg-x1_ray);
    const bottom = (y2_seg-y1_seg)*(x2_ray-x1_ray)-(x2_seg-x1_seg)*(y2_ray-y1_ray);

    if(bottom!=0){
        const t = tTop/bottom;
        const u = uTop/bottom;
        if(t>=0 && u>=0 && t<=1 && u<=1){
            return {
                x:lerp(x1_ray, x2_ray, t),
                y:lerp(y1_ray, y2_ray, t),
                offset: t,
            }
        }
    }
    return null;
}

function move_segment(segment, direction, distance, size_modification = 1){
    let x1 = segment[0][0];
    let y1 = segment[0][1];
    let x2 = segment[1][0];
    let y2 = segment[1][1];
    let angle = Math.atan((y2-y1)/(x2-x1));
    if((x2-x1)<0){
        angle += Math.PI;
    }
    
    angle += direction
    x1 += distance*Math.cos(angle);
    y1 += distance*Math.sin(angle);
    x2 += distance*Math.cos(angle);
    y2 += distance*Math.sin(angle);
    let new_segment = [[x1, y1], [x2, y2]];
    new_segment = extend_segment(new_segment, size_modification);
    return new_segment;
}

function calculate_middle(segment){
    let x1 = segment[0][0];
    let y1 = segment[0][1];
    let x2 = segment[1][0];
    let y2 = segment[1][1];
    return [(x2+x1)/2, (y2+y1)/2]
}

function extend_segment(segment, size_modification){
    let x1 = segment[0][0];
    let y1 = segment[0][1];
    let x2 = segment[1][0];
    let y2 = segment[1][1];
    let middle = calculate_middle(segment);

    let new_x1 = middle[0] + (middle[0]-x1) * size_modification;
    let new_y1 = middle[1] + (middle[1]-y1) * size_modification;
    let new_x2 = middle[0] + (middle[0]-x2) * size_modification;
    let new_y2 = middle[1] + (middle[1]-y2) * size_modification;
    let new_segment = [[new_x1, new_y1], [new_x2, new_y2]];
    return new_segment;
}

function get_gates(border_int, border_ext, segment, gates_per_segment, distance){
    let x1 = segment[0][0];
    let y1 = segment[0][1];
    let x2 = segment[1][0];
    let y2 = segment[1][1];

    let angle = Math.atan((y2-y1)/(x2-x1));
    if((x2-x1)<0){
        angle += Math.PI;
    }

    let gates = [];
    gates.push([[border_int[0][0], border_int[0][1]],[border_ext[0][0], border_ext[0][1]]]);

    let freq = 1/gates_per_segment;
    for (let i = 0; i < gates_per_segment; i++){
        let xm = lerp(x1, x2, freq*i);
        let ym = lerp(y1, y2, freq*i);
        
        gate_x_int = xm + distance*Math.cos(angle+Math.PI/2);
        gate_y_int = ym + distance*Math.sin(angle+Math.PI/2);
        gate_x_ext = xm + distance*Math.cos(angle-Math.PI/2);
        gate_y_ext = ym + distance*Math.sin(angle-Math.PI/2);

        min_x_int = Math.min(border_int[0][0], border_int[1][0])
        max_x_int = Math.max(border_int[0][0], border_int[1][0])
        min_y_int = Math.min(border_int[0][1], border_int[1][1])
        max_y_int = Math.max(border_int[0][1], border_int[1][1])

        min_x_ext = Math.min(border_ext[0][0], border_ext[1][0])
        max_x_ext = Math.max(border_ext[0][0], border_ext[1][0])
        min_y_ext = Math.min(border_ext[0][1], border_ext[1][1])
        max_y_ext = Math.max(border_ext[0][1], border_ext[1][1])

        
        if(gate_x_int > min_x_int && gate_x_int < max_x_int && gate_y_int > min_y_int && gate_y_int < max_y_int){
            if(gate_x_ext > min_x_ext && gate_x_ext < max_x_ext && gate_y_ext > min_y_ext && gate_y_ext < max_y_ext){
                gates.push([[gate_x_int, gate_y_int],[gate_x_ext, gate_y_ext]]);
            }
        }
    }
    return gates;
}

function random_choice(choices) {
    var index = Math.floor(Math.random() * choices.length);
    return choices[index];
  }