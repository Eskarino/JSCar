class Road{
    constructor(ctx, nb_points, height, width) {
        this.ctx = ctx;
        this.height = height;
        this.width = width;
        this.nb_points = nb_points - 1;

        this.starting_x = 100;
        this.starting_y = height/2;
        this.points = [[this.starting_x, this.starting_y]];
        this.segments = []

        this.road_width = 50;
        this.#create_road();
    }

    #create_road() {
        this.#define_segments();
    }

    #define_segments() {
        let squares_in_height = 2;
        let squares_in_width = ~~this.nb_points/squares_in_height;
        let square_width_size = this.width/squares_in_width - this.road_width;
        let square_height_size = this.height/squares_in_height - this.road_width;

        for (let i = 0; i < this.nb_points; i++) {
            let x_min;
            let y_min;

            if(i<this.nb_points/squares_in_height) {
                x_min = i * (square_width_size + this.road_width) + this.road_width/2;
                y_min = this.road_width;
            } else {
                x_min = (squares_in_width*squares_in_height - 1 - i) 
                    * (square_width_size + this.road_width) 
                    + this.road_width/2;
                y_min = square_height_size + this.road_width + this.road_width/2;
            }
            // draw_line(this.ctx, x_min, y_min, x_min+square_width_size, y_min+square_height_size);
            let point_x = x_min + Math.random()*square_width_size;
            let point_y = y_min + Math.random()*square_height_size;
            this.points.push([point_x, point_y]);
            this.segments.push([this.points[i],this.points[i+1]]);
        }
        this.segments.push([this.points[this.points.length-1],this.points[0]]);
    }

    draw() {
        for (let i = 0; i < this.points.length; i++) {
            let point1 = this.points[i];
            let point2 = this.points[(i+1)%this.points.length];
            draw_line(this.ctx, point1[0], point1[1], point2[0], point2[1]);
        }
    }
}