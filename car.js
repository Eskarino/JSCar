class Car{
    constructor(x, y, width, height){
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        this.speed = 0;
        this.angle = 0;

        this.acceleration = 0.05;
        this.friction = 0.02
        this.steering_capacity = 0.03;
        this.max_speed = 3

        this.controls = new Controls();
    }

    update(){
        this.move();
    }

    move(){
        if(this.controls.left){
            this.angle += this.steering_capacity;
        }
        if(this.controls.right){
            this.angle -= this.steering_capacity;
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

        this.x -= this.speed * Math.sin(this.angle);
        this.y -= this.speed * Math.cos(this.angle);

        if(this.speed>0){
            this.speed -= this.friction;
        }
        if(this.speed<0){
            this.speed += this.friction;
        }
        if(Math.abs(this.speed)<this.friction){
            this.speed = 0
        }
    }

    draw(ctx){
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