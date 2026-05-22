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
  let n=5;
  let m=Array.from({length:n},()=>Array(n).fill(0));

  for(let i=0;i<seq.length-1;i++)
    m[seq[i]][seq[i+1]]++;

  return m.map(r=>{
    let s=r.reduce((a,b)=>a+b,0);
    return s ? r.map(v=>v/s) : Array(n).fill(0.2);
  });
}

function monte(P,avg,s,days){
  let res=[];
  for(let k=0;k<1500;k++){
    let st=s,val=0;
    for(let d=0;d<days;d++){
      let r=Math.random(),acc=0;
      for(let j=0;j<5;j++){
        acc+=P[st][j];
        if(r<acc){ st=j; break;}
      }
      val+=avg[st];
    }
    res.push(val);
  }
  res.sort((a,b)=>a-b);
  return res[Math.floor(res.length*0.05)];
}

async function run(){
  const t=document.getElementById("ticker").value;

  const res=await fetch(
    "https://query1.finance.yahoo.com/v8/finance/chart/"+t
  );
  const j=await res.json();

  const close=j.chart.result[0].indicators.quote[0].close;

  let ret=[];
  for(let i=1;i<close.length;i++){
    if(close[i] && close[i-1])
      ret.push((close[i]-close[i-1])/close[i-1]);
  }

  const seq=ret.map(classify);
  const P=matrix(seq);

  let avg=Array(5).fill(0);
  for(let i=0;i<5;i++){
    let s=ret.filter((_,k)=>seq[k]===i);
    avg[i]=s.reduce((a,b)=>a+b,0)/(s.length||1);
  }

  const cur=seq[seq.length-1];

  let crash = ret.filter(r=>r<-0.02).length/ret.length;

  let signal =
    avg[cur]>0.001?"🟢 BUY":
    avg[cur]<-0.001?"🔴 SELL":
    "⚪ NEUTRAL";

  let mc30=monte(P,avg,cur,30);
  let mc90=monte(P,avg,cur,90);

  // GRAPH
  let graph = "<div style='display:flex;margin-top:10px'>";
  close.slice(-120).forEach(p=>{
    graph+=`<div style="width:2px;height:${p*0.4}px;background:#22c55e"></div>`;
  });
  graph+="</div>";

  // MATRIX
  let mhtml="<div class='grid'>";
  P.forEach(r=>{
    r.forEach(v=>{
      mhtml+=`<div class='cell' style='background:rgba(245,158,11,${v})'>${(v*100).toFixed(0)}</div>`;
    });
  });
  mhtml+="</div>";

  document.getElementById("out").innerHTML = `
    <h3>${signal} | STATE: ${STATES[cur]}</h3>
    <p>Crash risk: ${(crash*100).toFixed(1)}%</p>
    <p>MC 30d worst: ${(mc30*100).toFixed(1)}%</p>
    <p>MC 90d worst: ${(mc90*100).toFixed(1)}%</p>
    ${graph}
    <h4>Transition Matrix</h4>
    ${mhtml}
  `;
}
