const canvas = document.getElementById("theCanvas");
canvas.height = 1000;
canvas.width = 1500;
const ctx = canvas.getContext('2d');
const road_width = 100

const DOM_selected_car = document.getElementById("selectedCar");
const DOM_best_car_counter = document.getElementById("bestCar");
const DOM_selected_car_counter = document.getElementById("selectedCar");
let animation_ongoing = false;
let frame_id;

let road = new Road(ctx, canvas.height, canvas.width);

let nb_cars = 50;
let cars = generateCars(nb_cars);
let car_table = create_car_table(nb_cars);
let reward_limit = 500;
let training_iter = 100;

let best_car = null;
let selected_car = null;

discard_gnet()

check_clicked_car()

let loop_counter = 0;
let last_best_reward = 0;
let intervalId;
let race_counter = 0;


function start(){
    if (animation_ongoing) {
        cancelAnimationFrame(frame_id)
    }
    DOM_selected_car_counter.innerText = 'Selected: | Reward: '
    selected_car = null;
    DOM_selected_car.value = '';
    loop_counter = 0;
    car_init();
    animation_ongoing = true;
    loop(true);
}

function loop(visible) {
    let finished = false;

    if(visible){
        ctx.clearRect(0,0,canvas.width,canvas.height);
        road.draw();
    }
    
    for(let i = 0; i < cars.length; i++){
        if (visible){
            let car_to_draw = best_car;
            if(selected_car) {car_to_draw=selected_car;}
            cars[i].draw(car_to_draw);
        }
        if (!cars[i].damaged){
            cars[i].update();
            calculate_reward(cars[i], car_table)   
        }

        best_car  = cars.find(
            c=>car_table[c.id].reward==Math.max(
                ...cars.map(c=>car_table[c.id].reward)
        ));
    }
    DOM_best_car_counter.innerText = 'Best car: ' + String(best_car.id) + ' | Reward: ' + String(~~car_table[best_car.id].reward)
    if (selected_car){
        DOM_selected_car_counter.innerText = 'Selected: ' + String(selected_car.id) + ' | Reward: ' + String(~~car_table[selected_car.id].reward)
    }
    loop_counter++;
    
    if (animation_ongoing){
        frame_id = requestAnimationFrame(loop);
    } else {
        finished = check_finish_conditions()
        return finished;
    }
}

function check_finish_conditions(){
    if (car_table[best_car.id].reward > reward_limit || loop_counter > 1000 + 3*car_table[best_car.id].reward || loop_counter > 5000){
        return true;
    }
    let stopped_cars = cars.filter(c => c.speed == 0);
    if(loop_counter > 100 && stopped_cars.length==nb_cars){
        return true;
    }
    return false;
}

function startTraining(){
    if (animation_ongoing) {
        cancelAnimationFrame(frame_id)
    }
    ctx.clearRect(0,0,canvas.width,canvas.height);
    road.draw();
    race_counter = 0;
    animation_ongoing = false;
    intervalId = setInterval(one_race, 10);
}


function one_race(){
    car_table = create_car_table(nb_cars);
    loop_counter = 0;
    car_init();
    let finished = false;
    while (!finished){
        finished = loop(false);
    }
    best_reward = car_table[best_car.id].reward;
    console.log('Iteration ' + String(race_counter) + ' || Best reward: ' + String(~~best_reward))
    DOM_selected_car_counter.innerText = 'Iteration ' + String(race_counter) + ' || Best reward: ' + String(~~best_reward)

    if (race_counter%10==0 && race_counter!=0){
        save_gnet();
    }

    if (best_reward < 150 && best_reward - last_best_reward < 1 && race_counter%20==0 && race_counter!=0 && race_counter!=training_iter){
        discard_gnet();
        best_car = null;
        best_reward = 0;
        last_best_reward = 0;
    } else if (race_counter%20==0){
        last_best_reward = best_reward;
    }

    if (race_counter >= training_iter){
        clearInterval(intervalId)
        start()
    }
    race_counter += 1;
}

function generateCars(nb_cars){
    let cars = [];
    for(let i = 0; i < nb_cars; i++){
        cars.push(new Car(ctx, road, i, 'Virtual'))
        cars[cars.length-1].draw(cars[cars.length-1])
    }
    return cars
}

function create_car_table(nb_cars){
    let car_table = [];
    for(i = 0; i < nb_cars; i++){
        one_car = {car_id: i, reward: 0, next_gate: 4};
        car_table.push(one_car);        
    }
    return car_table
}

function calculate_reward(car, car_table){
    for(let i = 0; i < car.car_segments.length; i++){
        let next_gate = car_table[car.id].next_gate;
        for (let j = next_gate; j < (next_gate + 2); j++){

            if(getIntersection(car.car_segments[i], road.gates[j%road.gates.length])){
                car_table[car.id].reward += 1;
                car_table[car.id].next_gate = (j + 1)%road.gates.length;
                return null
            }
        }
        car_table[car.id].reward += car.speed / 1000;
    }
}

function car_init(){
    cars = generateCars(nb_cars);
    
    car_table = create_car_table(nb_cars)
    let mutation_rate = document.getElementById("mutationRate").value/100;
    let mutation_prob = document.getElementById("mutationProb").value/100;
    if (localStorage.getItem('best_car')){
        for (let i=0; i<cars.length; i++){
            cars[i].net = JSON.parse(localStorage.getItem('best_car'));
            if(i!=0){
                GNet.mutate(cars[i].net, mutation_rate, mutation_prob)
            }
        }
    }
    if(!best_car){
        best_car = cars[0];
    } else {
        cars[0].net = best_car.net;
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
    console.log('Saved')
}

function discard_gnet(){
    localStorage.removeItem('best_car');
    DOM_best_car_counter.innerText = 'Best car: | Reward: '
    console.log('Discarded');
    best_car = null;
}

function reset_map(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    road = new Road(ctx, canvas.height, canvas.width);
    road.draw();
    cars = []
}

function stop_training(){
    clearInterval(intervalId);
    save_gnet();
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