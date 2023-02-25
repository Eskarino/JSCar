class Road{
    constructor(ctx, nb_points, height, width, rgates_per_segment = 10) {
        this.ctx = ctx;
        this.height = height;
        this.width = width;
        this.nb_points = nb_points - 1;

        this.starting_x = 100;
        this.starting_y = height/2;
        this.points = [[this.starting_x, this.starting_y]];
        this.segments = []

        this.ext_border = []
        this.int_border = []

        this.rgates_per_segment = rgates_per_segment;

        this.road_width = 50;
        this.#create_road();
    }

    #create_road() {
        this.#define_segments();
        this.#create_borders();
        this.#create_reward_gates();
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

    #create_borders(){
        for(let i = 0; i<this.segments.length; i++){
            let new_seg = move_segment(this.segments[i], Math.PI/2, this.road_width, 10);
            this.int_border.push(new_seg)
            new_seg = move_segment(this.segments[i], -Math.PI/2, this.road_width, 10);
            this.ext_border.push(new_seg)
        }
        this.#refine_borders()
    }

    #refine_borders(){
        let new_ext_points = [];
        let new_int_points = [];
        let new_ext_segments = [];
        let new_int_segments = [];

        for(let i = 0; i < this.segments.length; i++){
            let new_point = getIntersection(
                this.ext_border[i], this.ext_border[(i+1)%this.segments.length]);
                new_ext_points.push([new_point.x, new_point.y]);

            new_point = getIntersection(
                this.int_border[i], this.int_border[(i+1)%this.segments.length]);
                new_int_points.push([new_point.x, new_point.y]);

            if(i>0){
                new_ext_segments.push([new_ext_points[i-1], new_ext_points[i]]);
                new_int_segments.push([new_int_points[i-1], new_int_points[i]]);
            }
        }
        new_ext_segments.unshift([new_ext_points[new_ext_points.length-1], new_ext_points[0]]);
        new_int_segments.unshift([new_int_points[new_int_points.length-1], new_int_points[0]]);

        this.ext_border = new_ext_segments;
        this.int_border = new_int_segments;
        this.borders = this.ext_border.concat(this.int_border);
    }

    #create_reward_gates(){
        this.gates = [];
        for(let i = 0; i < this.segments.length; i++){
            let gates = get_gates(
                this.segments[i], this.rgates_per_segment, this.road_width);
            for(let j=0; j < gates.length; j++){
                this.gates.push(gates[j])
            }
        }
    }

    draw() {
        for (let i = 0; i < this.points.length; i++) {
            let point1 = this.points[i];
            let point2 = this.points[(i+1)%this.points.length];
            draw_line(this.ctx, point1[0], point1[1], point2[0], point2[1]);
        }
        for (let i = 0; i < this.borders.length; i++){
            draw_segment(this.ctx, this.borders[i], 5, "red");
        }
        for (let i = 0; i < this.gates.length; i++){
            draw_segment(this.ctx, this.gates[i], 5, "yellow");
        }
    }
}