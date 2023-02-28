const canvas = document.getElementById("theCanvas");
canvas.height = 1000;
canvas.width = 3000;
const ctx = canvas.getContext('2d');
const road_width = 100

const DOM_selected_car = document.getElementById("selectedCar");
const DOM_best_car_counter = document.getElementById("bestCar");
const DOM_selected_car_counter = document.getElementById("selectedCar");
const startBtn = document.getElementById('startBtn');
let animation_ongoing = false;

const points = 7;

let road = new Road(ctx, points, canvas.height, canvas.width);

const nb_cars = 100;
let cars = generateCars(nb_cars);
let car_table = create_car_table(nb_cars);
road.draw()

discard_gnet()

let best_car = cars[0];
let selected_car = null;


let paused = false;
check_clicked_car()

//road.draw();
let loop_counter = 0;

function start(){
    if (animation_ongoing){
        animation_ongoing = !animation_ongoing;
    } else {
        selected_car = null;
        DOM_selected_car.value = '';
        paused = false;
        loop_counter = 0;
        car_init();
        animation_ongoing = true;
        loop();
    }
}

function loop() {
    
    ctx.clearRect(0,0,canvas.width,canvas.height);
    road.draw();

    for(let i = 0; i < cars.length; i++){
        let car_to_draw = best_car;
        if(selected_car) {car_to_draw=selected_car;}
        cars[i].draw(car_to_draw);
        if (!paused && !cars[i].damaged){
            cars[i].update();
            calculate_reward(cars[i], car_table)   
        }

        best_car  = cars.find(
            c=>car_table[c.id].reward==Math.max(
                ...cars.map(c=>car_table[c.id].reward)
        ));

    DOM_best_car_counter.value = best_car.id
    if (selected_car){
        DOM_selected_car_counter.value = selected_car.id
    }
    loop_counter+= 1
    }

    if (animation_ongoing){
        requestAnimationFrame(loop);
    }
}

function generateCars(nb_cars){
    let cars = [];
    for(let i = 0; i < nb_cars; i++){
        cars.push(new Car(ctx, road, i, 'Virtual'))
    }
    return cars
}

function create_car_table(nb_cars){
    let car_table = [];
    for(i = 0; i < nb_cars; i++){
        one_car = {car_id: i, reward: 0, next_gate: 0};
        car_table.push(one_car);        
    }
    return car_table
}

function calculate_reward(car, car_table){
    for(let i = 0; i < car.car_segments.length; i++){
        let next_gate = car_table[car.id].next_gate;
        for (let j = next_gate; j < (next_gate + 2)%road.gates.length; j++){
            if(getIntersection(car.car_segments[i], road.gates[j])){
                car_table[car.id].reward += 1;
                car_table[car.id].next_gate = (j + 1)%road.gates.length;
                return null
            }
        }
    }
    car_table[car.id].reward += car.speed/1000;
}

function car_init(){
    cars = generateCars(nb_cars);
    car_table = create_car_table(nb_cars)
    best_car = cars[0];
    let mutation_rate = document.getElementById("mutationRate").value/100;
    if (localStorage.getItem('best_car')){
        for (let i=0; i<cars.length; i++){
            cars[i].net = JSON.parse(localStorage.getItem('best_car'));
            if(i!=0){
                GNet.mutate(cars[i].net, mutation_rate)
            }
        }
    }
}

function save_gnet(){
    if(selected_car){
        localStorage.setItem('best_car', 
            JSON.stringify(selected_car.net));
        } else {
            localStorage.setItem('best_car', 
                JSON.stringify(best_car.net));
    }
}

function discard_gnet(){
    localStorage.removeItem('best_car');
}

function reset_map(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    road = new Road(ctx, points, canvas.height, canvas.width);
    road.draw();
    cars = []
}

function pause_resume(){
    paused = !paused;
    loop()
}

function changeMutationRate(val){
    let curr_val = document.getElementById("mutationRate").value;
    let new_val = Number(curr_val) + val;
    if (new_val > 100){
        new_val = 100;
    }
    if (new_val<0){
        new_val = 0;
    }

    document.getElementById("mutationRate").value = new_val;
}

function check_clicked_car(){
    let canvasLeft = canvas.offsetLeft + canvas.clientLeft;
    let canvasTop = canvas.offsetTop + canvas.clientTop;
    let canvasClientHeight = canvas.clientHeight;
    let canvasClientWidth = canvas.clientWidth;

    canvas.addEventListener('click', function(event) {
        let x = (event.pageX -canvasLeft)*(canvas.height/canvasClientHeight);
        let y = (event.pageY -canvasTop)*(canvas.width/canvasClientWidth);
        let radius = 20;

        closest_distance = radius;
        cars.forEach(function(car) {
            if (y > car.y - radius && y < car.y + radius 
                && x > car.x - radius && x < car.x + radius) {
                
                let dist = Math.hypot((x - car.x), (y - car.y))
                if (dist < closest_distance){
                    closest_distance = dist;
                    selected_car = car;
                }    
            }
        });
    }, false);
}