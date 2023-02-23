function draw_segment(ctx, segment, line_width = 5, line_color = "gray") {
    x1 = segment[0][0];
    y1 = segment[0][1];
    x2 = segment[1][0];
    y2 = segment[1][1];
    draw_line(ctx, x1, y1, x2, y2, line_width, line_color)
}

function draw_line(ctx, x1, y1, x2, y2, line_width = 5, line_color = "gray") {
    ctx.line_width = line_width;
    ctx.strokeStyle = line_color;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
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
    let size = Math.sqrt((x1-x2)^2-(y1-y2)^2);
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