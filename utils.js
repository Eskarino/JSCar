function draw_line(ctx, x1, y1, x2, y2, line_width = 5, line_color = "gray") {
    ctx.line_width = line_width;
    ctx.strokeStyle = line_color;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}