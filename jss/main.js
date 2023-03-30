const canvas = document.getElementById("theCanvas");
canvas.height = 1000;
canvas.width = 1500;
const ctx = canvas.getContext('2d');
const road_width = 100

const DOM_infos = document.getElementById("infos");
let animation_ongoing = false;
let frame_id;

let road = new Road(ctx, canvas.height, canvas.width);

let nb_cars = 50;
let cars = generateCars(nb_cars);
let reward_limit = 500;
let training_iter = 1000;

let best_car = null;
let forever_best_car = null;
let forever_best_reward = 0;
let selected_car = null;

check_clicked_car()

let loop_counter = 0;
let last_best_reward = 0;
let intervalId;
let race_counter = 0;
let training_ongoing = false;

discard_gnet()
DOM_infos.innerText = '...'



function start(){
    if (animation_ongoing) {
        animation_ongoing = false;
        cancelAnimationFrame(frame_id)
    } else if (training_ongoing){
        stop_training()
    }
    DOM_infos.innerText = '...'
    selected_car = null;
    DOM_infos.value = '';
    loop_counter = 0;
    car_init();
    animation_ongoing = true;
    check_clicked_car()
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
            calculate_reward(cars[i])   
        }

        best_car  = cars.find(
            c=>c.reward==Math.max(
                ...cars.map(c=>c.reward)
        ));
    }
    
    let to_write;
    if (best_car != null) {
        to_write = ~~best_car.reward;
    }
    if (to_write > reward_limit) {
        to_write = 'Max...';
    }
    else {
        to_write = String(to_write)
    }
 
    DOM_infos.innerText = 'Best car: ' + String(best_car.id) + ' | Reward: ' + to_write
    if (selected_car){
        DOM_infos.innerText = 'Selected: ' + String(selected_car.id) + ' | Reward: ' + String(~~selected_car.reward)
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
    if (best_car.reward > reward_limit || loop_counter > 1000 + 10*best_car.reward || loop_counter > 5000){
        return true;
    }
    let stopped_cars = cars.filter(c => c.speed <= 0);
    if(loop_counter > 100 && stopped_cars.length==nb_cars){
        return true;
    }
    return false;
}

function startTraining(){
    if (animation_ongoing) {
        cancelAnimationFrame(frame_id)
    }
    DOM_infos.innerText = 'Starting training...';
    training_ongoing = true;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    road.draw();
    race_counter = 0;
    animation_ongoing = false;
    intervalId = setInterval(one_race, 10);
}


function one_race(){
    loop_counter = 0;
    car_init();
    let finished = false;
    while (!finished){
        finished = loop(false);
    }
    best_reward = best_car.reward;
    if (best_reward >= forever_best_reward){
        forever_best_reward = best_reward;
        forever_best_car ={...best_car.net};
    } else {
        if (best_reward < 500){
            console.log('Comment un même network peut-il produire des résultats différents ?')
            discard_gnet()
        }
    }

    console.log('Iteration ' + String(race_counter) + ' || Best reward: ' + String(~~best_reward))
    DOM_infos.innerText = 'Training ongoing - Iteration ' + String(race_counter) + ' || Best reward: ' + String(~~best_reward)

    if (race_counter%10==0 && race_counter!=0){
        save_gnet();
    }

    if (best_reward < 200 && best_reward - last_best_reward < 1 && race_counter%20==0 && race_counter!=0 && race_counter!=training_iter){
        discard_gnet();
    } else if (race_counter%20==0){
        last_best_reward = best_reward;
    }

    if (race_counter >= training_iter){
        DOM_infos.innerText = 'Failed after 1000 races :('
        stop_training()
    } else if (best_reward >= reward_limit && race_counter >= 10) {
        DOM_infos.innerText = 'TRAINING COMPLETED'
        stop_training()
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

function calculate_reward(car){
    for(let i = 0; i < car.car_segments.length; i++){
        let next_gate = car.next_gate;
        for (let j = next_gate; j < (next_gate + 2); j++){

            if(getIntersection(car.car_segments[i], road.gates[j%road.gates.length])){
                car.reward += 1;
                car.next_gate = (j + 1)%road.gates.length;
                return null
            }
        }
        car.reward += car.speed / 1000;
    }
}

function car_init(){
    cars = generateCars(nb_cars);
    
    let mutation_rate = document.getElementById("mutationRate").value/100;
    let mutation_prob = document.getElementById("mutationProb").value/100;
    if (localStorage.getItem('best_car')){
        for (let i=1; i<cars.length; i++){
            cars[i].net = JSON.parse(localStorage.getItem('best_car'));
            GNet.mutate(cars[i].net, mutation_rate, mutation_prob)
        }
    }
    if(forever_best_car){
        cars[0].net = forever_best_car;
    }
}

function save_gnet(){
    if(selected_car){
        localStorage.setItem('best_car', 
            JSON.stringify(selected_car.net));
    } else {
        if (forever_best_car){
            localStorage.setItem('best_car', 
                JSON.stringify(forever_best_car));
        } else {
            localStorage.setItem('best_car', 
                JSON.stringify(best_car.net));
        }
    }
    console.log('Saved')
    DOM_infos.innerText = 'Network saved - Iteration ' + String(race_counter) + ' || Best reward: ' + String(~~best_reward);
}

function discard_gnet(){
    localStorage.removeItem('best_car');
    DOM_infos.innerText = 'Network discarded'
    console.log('Discarded');
    best_car = null;
    forever_best_car = null;
    last_best_reward = 0;
    best_reward = 0;
    forever_best_reward = 0;
}

function reset_map(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    road = new Road(ctx, canvas.height, canvas.width);
    road.draw();
    forever_best_reward = 0;
    cars = []
}

function stop_training(){
    if (!animation_ongoing && training_ongoing){
        clearInterval(intervalId);
        if (localStorage.getItem('best_car')){
            save_gnet();
        }
        training_ongoing = false;
        start();
    }
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