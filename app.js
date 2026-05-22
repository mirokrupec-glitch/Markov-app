const TH = [-0.015, -0.003, 0.003, 0.015];
const STATES = ["SBR","BER","NEU","BUL","SBL"];

function classify(r){
  if(r < TH[0]) return 0;
  if(r < TH[1]) return 1;
  if(r < TH[2]) return 2;
  if(r < TH[3]) return 3;
  return 4;
}

function matrix(seq){
  let n = 5;
  let m = Array.from({length:n}, () => Array(n).fill(0));

  for(let i=0;i<seq.length-1;i++){
    m[seq[i]][seq[i+1]]++;
  }

  return m.map(row => {
    let s = row.reduce((a,b)=>a+b,0);
    return s ? row.map(v=>v/s) : Array(n).fill(0.2);
  });
}

function monte(P, avg, start, days){
  let results = [];

  for(let sim=0; sim<1500; sim++){
    let state = start;
    let total = 0;

    for(let d=0; d<days; d++){
      let r = Math.random();
      let acc = 0;

      for(let j=0; j<5; j++){
        acc += P[state][j];
        if(r <= acc){
          state = j;
          break;
        }
      }

      total += avg[state];
    }

    results.push(total);
  }

  results.sort((a,b)=>a-b);
  return results[Math.floor(results.length * 0.05)];
}

async function run(){
  const ticker = document.getElementById("ticker").value.trim().toUpperCase();
  const out = document.getElementById("out");

  if(!ticker){
    out.innerHTML = "❌ Zadaj ticker (napr. AAPL)";
    return;
  }

  out.innerHTML = "
