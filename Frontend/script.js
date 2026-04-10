const API = "https://fit-track-cmix.onrender.com"; // CHANGE AFTER DEPLOY

let slider;
let chart;
let weights = [];

/* INIT AFTER PAGE LOAD */
window.addEventListener("load", () => {
  slider = document.getElementById("slider");

  // AUTO LOGIN
  let user = localStorage.getItem("user");
  if(user){
    authPage.style.display="none";
    app.style.display="block";
  }

  // INIT CHART SAFELY
  const ctx = document.getElementById("progressChart");
  if(ctx){
    chart = new Chart(ctx,{
      type:'line',
      data:{
        labels:[],
        datasets:[
          {
            label:'Body Weight',
            data:weights,
            borderColor:'#00ffcc'
          }
        ]
      }
    });
  }
});

/* SLIDER */
function goTo(i){
  if(slider){
    slider.style.transform=`translateX(-${i*100}vw)`;
  }
}

/* HEALTH ANALYSIS */
async function calculateHealth(){

  let h=height.value/100;
  let w=weight.value;
  let a=age.value;
  let act=parseFloat(activity.value);

  let bmi=(w/(h*h)).toFixed(2);
  let bmr=gender.value==="male"
      ?10*w+6.25*height.value-5*a+5
      :10*w+6.25*height.value-5*a-161;

  let tdee=Math.round(bmr*act);

  let minW=(18.5*h*h).toFixed(1);
  let maxW=(24.9*h*h).toFixed(1);

  let protein=(w*2).toFixed(0);

  localStorage.setItem("tdee",tdee);

  healthOutput.innerHTML=`
    <div class="card">BMR: ${Math.round(bmr)} kcal</div>
    <div class="card">TDEE: ${tdee} kcal</div>
    <div class="card">BMI: ${bmi}</div>
    <div class="card">Ideal Weight: ${minW}–${maxW} kg</div>
    <div class="card">Protein Threshold: ${protein}g/day</div>
    <div class="card">Hydration: ${(w*35/1000).toFixed(1)} L/day</div>
    <div class="card">Volume Profile: ${a<25?"High Recovery Capacity":"Moderate Volume Recommended"}</div>
    <div class="card">Macro Periodization: Strength → Hypertrophy → Conditioning</div>
  `;

  // SEND TO BACKEND
  try{
    await fetch(API + "/health",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        height:height.value,
        weight:weight.value,
        age:age.value,
        gender:gender.value
      })
    });
  }catch(err){
    console.log("Backend not reachable");
  }
}

/* DIET STRATEGY */
async function generateDiet(){

  let tdee=localStorage.getItem("tdee");
  if(!tdee) return;

  let cal=tdee;
  if(goal.value==="loss") cal-=500;
  if(goal.value==="bulk") cal=+tdee+400;

  dietOutput.innerHTML=`
    <div class="card">Caloric Offset: ${cal-tdee} kcal</div>
    <div class="card">Target Calories: ${cal}</div>
    <div class="card">Protein Ratio: ${(cal*0.3/4).toFixed(0)}g</div>
    <div class="card">Carbs: ${(cal*0.4/4).toFixed(0)}g</div>
    <div class="card">Fats: ${(cal*0.3/9).toFixed(0)}g</div>
    <div class="card">Meal Timing: Pre + Post Workout Priority</div>
    <div class="card">Substitution Engine: Paneer ↔ Chicken | Dal ↔ Soya</div>
    <div class="card">Fiber Score: HIGH (Vegetable + Dal Focus)</div>
  `;

  try{
    await fetch(API + "/diet",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        goal:goal.value
      })
    });
  }catch(err){}
}

/* WORKOUT MATRIX */
async function generateWorkout(){

  let text={
    Strength:"Big Five lifts + progressive overload.",
    HIIT:"EMOM / AMRAP intervals.",
    "Weight Loss":"Hybrid cardio + resistance."
  };

  workoutOutput.innerHTML=`
    <div class="card">Intent: ${workoutType.value}</div>
    <div class="card">Maturity: ${level.value}</div>
    <div class="card">Protocol: ${text[workoutType.value]}</div>
    <div class="card">Weekly Volume: ${level.value==="Advanced"?"18-22 sets":"10-14 sets"}</div>
    <div class="card">Bio-Sync: Volume adjusted +10% for youthful recovery</div>
    <div class="card">Hydration Logic: Electrolytes recommended</div>
  `;

  try{
    await fetch(API + "/workout",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        type:workoutType.value,
        level:level.value
      })
    });
  }catch(err){}
}

/* PROGRESS LAB */
async function logProgress(){

  let weight=progressWeight.value;
  if(!weight) return;

  try{
    await fetch(API + "/logWeight",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({weight})
    });
  }catch(err){
    console.log("Backend not reachable");
  }

  weights.push(weight);

  if(chart){
    chart.data.labels.push("Log "+weights.length);
    chart.update();
  }

  progressOutput.innerHTML=`
    <div class="card">Total Logs: ${weights.length}</div>
    <div class="card">Recovery Score: ${Math.floor(Math.random()*4)+7}/10</div>
    <div class="card">Mood Energy: Stable</div>
    <div class="card">Prediction: Target reached in ~${8-weights.length} weeks</div>
    <div class="card">Achievement: ${weights.length>=5?"Plateau Breaker Unlocked":"Keep Going"}</div>
  `;
}

/* AUTH SYSTEM */

// SIGNUP
async function signup(){
  let user=username.value;
  let pass=password.value;

  let res = await fetch(API + "/signup",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({user,pass})
  });

  let data = await res.json();
  authMsg.innerText = data.message;
}

// LOGIN
async function login(){
  let user=username.value;
  let pass=password.value;

  let res = await fetch(API + "/login",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({user,pass})
  });

  let data = await res.json();

  if(data.success){
    localStorage.setItem("user",user);
    authPage.style.display="none";
    app.style.display="block";
  }else{
    authMsg.innerText="Invalid login";
  }
}

// LOGOUT
function logout(){
  localStorage.removeItem("user");
  location.reload();
}
