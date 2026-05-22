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
  const
