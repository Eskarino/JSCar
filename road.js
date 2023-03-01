class Road{
    constructor(ctx, height, width, rgates_per_segment = 10) {
        this.ctx = ctx;
        this.height = height;
        this.width = width;

        this.points = [];
        this.segments = []

        this.ext_border = []
        this.int_border = []

        this.rgates_per_segment = rgates_per_segment;

        this.road_width = 50;
        this.#create_road();
        this.draw()
    }

    #create_road() {
        this.#define_segments();
        this.#create_borders();
        this.#create_reward_gates();
        this.#calculate_starting_pos();
    }

    #define_segments() {
        this.squares_in_height = 2;
        this.squares_in_width = 5;
        this.border_size = 150;
        this.space_between_squares = 100;
        this.square_height_size = (this.height - 2*this.border_size - (this.squares_in_height - 1)*this.space_between_squares)/this.squares_in_height;
        this.square_width_size = (this.width - 2*this.border_size - (this.squares_in_width - 1)*this.space_between_squares)/this.squares_in_width;
        this.nb_points = this.squares_in_height * this.squares_in_width;
        this.tiles = this.#create_tiles()

        for (let i=0; i<this.tiles.length; i++){
            let x_topleft = this.tiles[i][0];
            let y_topleft = this.tiles[i][1];

            let point_x = x_topleft + Math.random()*this.square_width_size;
            let point_y = y_topleft + Math.random()*this.square_height_size;
            this.points.push([point_x, point_y]);
            if(i>0){
                this.segments.push([this.points[i-1],this.points[i]]);
            }
        }
        this.segments.push([this.points[this.points.length-1],this.points[0]]);
    }

    #create_tiles(){
        let tiles = [];
        for (let j=0; j<this.squares_in_height; j++){
            let one_level = [];
            for (let i=0; i<this.squares_in_width; i++){
                let x_topleft = this.border_size + i*(this.square_width_size + this.space_between_squares);
                let y_topleft = this.border_size + j*(this.square_height_size + this.space_between_squares);
                if(j%2==0){
                    one_level.push([x_topleft, y_topleft]);
                } else {
                    one_level.unshift([x_topleft, y_topleft]);
                }
            }
            tiles.push(...one_level);
        }
        return tiles;
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

    #calculate_starting_pos(){
        let x1 = this.segments[0][0][0];
        let y1 = this.segments[0][0][1];
        let x2 = this.segments[0][1][0];
        let y2 = this.segments[0][1][1];
        this.starting_x = (x1+x2)/2;
        this.starting_y = (y1+y2)/2;
        this.starting_angle = -Math.PI/2 - Math.atan((y2-y1)/(x2-x1));
    }

    #create_reward_gates(){
        this.gates = [];
        for(let i = 0; i < this.segments.length; i++){
            let gates = get_gates(
                this.int_border[i], this.ext_border[i], this.segments[i], this.rgates_per_segment, this.road_width);
            for(let j=0; j < gates.length; j++){
                this.gates.push(gates[j])
            }
        }
    }

    draw() {
        fill_polygon(this.ctx, this.ext_border, 'grey');
        fill_polygon(this.ctx, this.int_border, 'green');

        for (let i = 0; i < this.segments.length; i++) {
            draw_segment(this.ctx, this.segments[i], 10, "white", true);
        }
        for (let i = 0; i < this.borders.length; i++){
            draw_segment(this.ctx, this.borders[i], 10, "white");
        }
        for (let i = 0; i < this.gates.length; i++){
            draw_segment(this.ctx, this.gates[i], 5, "yellow");
        }
    }
}