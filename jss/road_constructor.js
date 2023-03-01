class RoadConstructor{
    constructor(canvas_height, canvas_width, road_width){
        this.tile_size = road_width*1.3;
        this.grid = this.#produce_grid(canvas_height, canvas_width); //grid[1][2] => y = 1, x = 2
        this.points = this.#create_way();
    }

    #produce_grid(height, width){
        this.tiles_in_height = ~~(height/this.tile_size);
        this.tiles_in_width = ~~(width/this.tile_size);

        let tiles = []
        for (let j=0; j<this.tiles_in_height; j++){
            let one_line = []
            for (let i=0; i<this.tiles_in_width; i++){
                let x_calculated = i * this.tile_size + this.tile_size/2;
                let y_calculated = j * this.tile_size + this.tile_size/2;
                let neighbours = this.calculate_neighbours(i, j)
                let one_tile = {h: j, w: i, 
                    x : x_calculated, y : y_calculated, 
                    neighbours:neighbours, 
                    disabled: false}
                one_line.push(one_tile)
            }
            tiles.push(one_line)
        }
        return tiles;
    }

    calculate_neighbours(x, y){
        let neighbours = [];
        for (let j=-1; j<2; j++){
            for (let i=-1; i<2; i++){
                if(x+i >= 0 && x+i < this.tiles_in_width 
                    && y+j >= 0 && y+j < this.tiles_in_height && (j!=0||i!=0)){
                    neighbours.push([x+i, y+j]);
                }
            }   
        }
        return neighbours;
    }

    #create_way(){
        let points = []
        this.#disable_borders();
        let x_initial = 1;
        let y_initial = ~~(this.tiles_in_height/2);
        points.push([x_initial, y_initial])
        this.last_point = [x_initial, y_initial]
        this.destination = [x_initial+1, y_initial+1] 
        this.selected = [x_initial, y_initial-1]
        this.#disable_points(this.last_point);
        this.draw();
        this.#loop();
        return null;
    }

    #loop(){
        let finished = false;
        let completed = false;
        while (!finished){
            this.last_point = this.selected; 
            this.update_neighbours(this.last_point);
            let possible_choices = this.grid[this.last_point[1]][this.last_point[0]].neighbours
            if (possible_choices.length==0){
                finished = true;
            }

            this.selected = random_choice(possible_choices);
            if (this.selected == this.destination){
                finished = true;
                completed = true;
            }
            this.#disable_points(this.last_point);
            this.draw();
        }
    }

    update_neighbours(last_point){
        let neighbours = this.grid[last_point[1]][last_point[0]].neighbours
        let new_neighbours = []
        for(let i=0; i<neighbours.length; i++){
            if (!this.grid[neighbours[i][1]][neighbours[i][0]].disabled){
                new_neighbours.push(neighbours[i]);
            }
        }
        this.grid[last_point[1]][last_point[0]].neighbours = new_neighbours;
    }

    #disable_points(point){
        //Disable a cross centered on this point
        for (let j=-1; j<2; j++){
            for (let i=-1; i<2; i++){
                if(point[0]+i >= 0 && point[0]+i < this.tiles_in_width 
                    && point[1]+j >= 0 && point[1]+j < this.tiles_in_height
                    && (Math.abs(j)!=1||Math.abs(i)!=1)
                    && (point[0]+i != this.selected[0] || point[1]+j!=this.selected[1])){
                    this.grid[point[1]+j][point[0]+i].disabled = true;
                }
            }   
        }
    }

    #disable_borders(){
        for(let j=0; j<this.tiles_in_height; j++){
            this.grid[j][0].disabled = true;            
            this.grid[j][this.tiles_in_width-1].disabled = true;            
        }
        
        for (let i=0; i<this.tiles_in_width; i++){
            this.grid[0][i].disabled = true;            
            this.grid[this.tiles_in_height-1][i].disabled = true;
            if(i<this.tiles_in_width-3){
                this.grid[~~(this.tiles_in_height/2)][i].disabled = true;                       
            }
        }
    }

    draw(){
        let color = 'white';
        for(let j=0; j<this.grid.length; j++){
            for(let i=0; i<this.grid[j].length; i++){
                if(this.grid[j][i].disabled){
                    color = 'red';
                } else if (this.selected[0]==i && this.selected[1]==j){
                    color = 'blue';
                } else {
                    color = 'white';
                }
                let x_center = this.grid[j][i].x;
                let y_center = this.grid[j][i].y;

                let firstPoint = [x_center-this.tile_size/2, y_center-this.tile_size/2];
                let secondPoint = [x_center+this.tile_size/2, y_center-this.tile_size/2];
                let thirdPoint = [x_center+this.tile_size/2, y_center+this.tile_size/2];
                let lastPoint = [x_center-this.tile_size/2, y_center+this.tile_size/2];
                
                let points = [firstPoint,secondPoint,thirdPoint,lastPoint];
                let polygon = [];
                for (let i=0; i<points.length; i++){
                    let segment = [points[i], points[(i+1)%points.length]];
                    polygon.push(segment);
                }
                fill_polygon(ctx, polygon, color) 
            }
        }
    }
}