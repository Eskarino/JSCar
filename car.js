class Car{
    constructor(ctx, x, y){
        this.ctx = ctx;
        this.x = x;
        this.y = y;
        this.width = 10;
        this.height = 25;

        this.speed = 0;
        this.angle = 0;

        this.acceleration = 0.05;
        this.friction = 0.02
        this.steering_capacity = 0.03;
        this.max_speed = 4

        this.drift_momentum = 0;
        this.drift_friction = 0.95;
        this.drift_speed = 3;

        this.controls = new Controls();
    }

    update(){
        this.#move();
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

    draw(){
        let ctx = this.ctx;
        ctx.save();
        ctx.translate(this.x,this.y);
        ctx.rotate(-this.angle);
        ctx.beginPath();
        ctx.rect(
            -this.width/2,
            -this.height/2,
            this.width,
            this.height
        );
        ctx.fill();
        ctx.restore();
    }
}