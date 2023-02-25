class Car{
    constructor(ctx, road, id, agent){
        this.ctx = ctx;
        this.road = road;
        this.agent = agent;
        this.id = id;

        this.x = road.starting_x;
        this.y = road.starting_y;
        this.width = 10;
        this.height = 25;

        this.speed = 0;
        this.angle = 0;

        this.acceleration = 0.05;
        this.friction = 0.02
        this.steering_capacity = 0.03;
        this.max_speed = 3

        this.drift_momentum = 0;
        this.drift_friction = 0.90;
        this.drift_speed = 2;

        this.damaged = false;

        if(agent == 'Virtual'){
            this.sensors = new Sensors(this.ctx, this, this.road);
            this.net = new GNet(
                [this.sensors.nb_rays + 1, 6, 4] //Sensors+Speed, LayerSize, OutputSize
            )
        }
        this.controls = new Controls(agent);
        
        this.polygon = this.#createPolygons();
    }

    update(){
        if(!this.damaged){
            this.#move();
            this.polygon = this.#createPolygons();
            this.damaged = this.#assessDamage();

            if(this.agent=='Virtual'){
                this.sensors.update()
                const offsets = this.sensors.readings.map(
                    s=>s==null?0:1-s.offset);
                const gnet_in = [this.speed].concat(offsets)
                const outputs=GNet.forward(gnet_in, this.net);

                this.controls.forward = outputs[0];
                this.controls.left = outputs[1];
                this.controls.right = outputs[2];
                this.controls.backward = outputs[3];
            }
            
        }
    }

    #move(){
        let drift_direction = this.angle - Math.PI/2
        let x_drift = -this.drift_momentum * Math.sin(drift_direction);
        let y_drift = -this.drift_momentum * Math.cos(drift_direction);

        this.#get_controls();
        this.x -= this.speed * Math.sin(this.angle) + x_drift;
        this.y -= this.speed * Math.cos(this.angle) + y_drift;

        this.drift_momentum *= this.drift_friction
        if(Math.abs(this.drift_momentum) < 0.01){
            this.drift_momentum=0;
        }

        if(this.speed>0){
            this.speed -= this.friction;
        }
        if(this.speed<0){
            this.speed += this.friction;
        }
        if(Math.abs(this.speed)<this.friction){
            this.speed = 0;
        }
    }

    #get_controls(){
        let multiplier = 1;
        if(Math.abs(this.speed) < this.drift_speed){
            multiplier = Math.abs(this.speed) / this.drift_speed;
        }
        if(this < 0){
            multiplier *= -1;
        }

        let driftAmount = this.speed * this.steering_capacity * 1.5;
        if(this.speed < 2){
            driftAmount = 0;
        }
            
        if(this.controls.left){
            if(this.speed<0){
                this.angle -= this.steering_capacity * multiplier;
            }
            else {
                this.angle += this.steering_capacity * multiplier;
                this.drift_momentum -= driftAmount
            }
            
        }
        if(this.controls.right){
            if(this.speed<0){
                this.angle += this.steering_capacity * multiplier;
            } 
            else {
                this.angle -= this.steering_capacity * multiplier;
                this.drift_momentum += driftAmount
            }
        }
        if(this.controls.forward){
            this.speed += this.acceleration;
            if(this.speed > this.max_speed){
                this.speed = this.max_speed;
            }
        }
        if(this.controls.backward){
            this.speed -= this.acceleration;
            if(this.speed < -this.max_speed/2){
                this.speed = -this.max_speed/2;
            }
        }
    }

    #createPolygons(){
        const points = [];
        const rad = Math.hypot(this.width, this.height)/2;
        const alpha = Math.atan2(this.width, this.height);
        points.push({
            x:this.x-Math.sin(this.angle-alpha)*rad,
            y:this.y-Math.cos(this.angle-alpha)*rad
        });
        points.push({
            x:this.x-Math.sin(this.angle+alpha)*rad,
            y:this.y-Math.cos(this.angle+alpha)*rad
        });
        points.push({
            x:this.x-Math.sin(this.angle-alpha+Math.PI)*rad,
            y:this.y-Math.cos(this.angle-alpha+Math.PI)*rad
        });
        points.push({
            x:this.x-Math.sin(this.angle+alpha+Math.PI)*rad,
            y:this.y-Math.cos(this.angle+alpha+Math.PI)*rad
        });
        this.#updateSegments(points)
        return points
    }

    #updateSegments(points){
        let car_segments = []
        for(let i = 0; i < points.length; i++){
            car_segments.push(
                [[points[i].x, 
                points[i].y], 
                [points[(i+1)%points.length].x, 
                points[(i+1)%points.length].y]]) 
        }
        this.car_segments = car_segments;
    }

    #assessDamage(){
        for(let i = 0; i < this.car_segments.length; i++){
            for(let j = 0; j < this.road.borders.length; j++){
                let damage = getIntersection(this.car_segments[i], this.road.borders[j]);
                if(damage){
                    this.speed = 0;
                    return true;
                }
            }
        }
        return false;
    }

    draw(best_car){
        let ctx = this.ctx;

        if(this.damaged){
            ctx.fillStyle = 'gray';
        } else {
            ctx.fillStyle = 'black';
        }

        if(this.id!=best_car.id){
            ctx.globalAlpha = 0.2;
        } else {
            ctx.globalAlpha = 1;
            ctx.fillStyle = 'green';
        }
        
        ctx.beginPath();
        ctx.moveTo(this.polygon[0].x, this.polygon[0].y);
        for(let i = 1; i < this.polygon.length; i++){
            ctx.lineTo(this.polygon[i].x, this.polygon[i].y);
        }
        ctx.fill();

        // if(this.sensors){
        //     this.sensors.draw()
        // }
        ctx.globalAlpha = 1;


    }
}