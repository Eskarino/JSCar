class Sensors{
    constructor(ctx, car, road){
        this.ctx = ctx;
        this.car = car;
        this.road = road;
        this.nb_rays = 7;
        this.ray_lenght = 100;
        this.angle = Math.PI;
        
        this.rays = [];
        this.#build_rays();
        this.visible_rays = this.rays;
    }

    update(){
        this.#build_rays();
        this.visible_rays = this.rays;
        for(let i = 0; i<this.rays.length; i++){
            let touche = this.#get_reading(this.rays[i], this.road.borders);
            if(touche){
                this.visible_rays[i] = [this.rays[i][0], [touche.x, touche.y]];
            }
        }
    }

    #get_reading(ray, segments){
        let touches = [];
        for(let i = 0; i<segments.length; i++){
            const touch = getIntersection(ray,segments[i]);
            if(touch){
                touches.push(touch);
            }
        }
        if(touches.length==0){
            return null;
        }else{
            const offset = touches.map(e=>e.offset);
            const minOffset = Math.min(...offset);
            return touches.find(e=>e.offset==minOffset);
        }
    }

    #build_rays(){
        this.rays = [];
        for(let i = 0; i<this.nb_rays; i++){
            const ray_angle = lerp(
                this.angle/2, -this.angle/2, i/(this.nb_rays - 1)
                )+this.car.angle;
            const origin_x = this.car.x;
            const origin_y = this.car.y;
            const end_x = this.car.x - Math.sin(ray_angle)*this.ray_lenght;
            const end_y = this.car.y - Math.cos(ray_angle)*this.ray_lenght;
            this.rays.push([[origin_x, origin_y],[end_x, end_y]]);
        }
    }

    draw(){
        for(let i = 0; i<this.visible_rays.length; i++){
            let x1 = this.visible_rays[i][0][0];
            let y1 = this.visible_rays[i][0][1];
            let x2 = this.visible_rays[i][1][0];
            let y2 = this.visible_rays[i][1][1];
            draw_line(this.ctx, x1, y1, x2, y2, 2, 'green')
        }
    }
}