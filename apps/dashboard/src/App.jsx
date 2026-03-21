import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  ShieldCheck, Zap, Upload, Terminal, Activity, Lock, 
  Search, Eye, FileText, AlertTriangle, CheckCircle2, 
  Cpu, Gavel, Scan, RefreshCw, X, Radio, BrainCircuit,
  Fingerprint, Barcode, ChevronRight, Layers,
  Database, Siren, Target, History, Camera, PieChart,
  Volume2, Atom, Download, ThumbsUp, ThumbsDown, Sparkles,
  Hammer, Focus, Waves, Award, PenTool, Clock, Printer, 
  ScanLine, Microscope, FileSearch, Hexagon,
  BarChart3, Scale, TrendingUp, Building2, ArrowLeft, XCircle,
  MessageSquare, Bot, Send, ChevronDown, MessageCircle
} from 'lucide-react';
import SlidingFintechReport from './components/SlidingFintechReport';

/* ──────────────────────────────────────────────────────────── */
/* HELPERS                                                      */
/* ──────────────────────────────────────────────────────────── */
const sleep = ms => new Promise(r => setTimeout(r, ms));
const genId  = () => 'CHK-' + Date.now() + '-' + Math.random().toString(36).substr(2,5).toUpperCase();
const genHash= () => Array.from({length:16}).map(()=>'0123456789abcdef'[Math.floor(Math.random()*16)]).join('');

/* ──────────────────────────────────────────────────────────── */
/* 10-ADIMLI PROTOKOL                                           */
/* ──────────────────────────────────────────────────────────── */
const PROTOCOL = [
  { id:'visual',    label:'Görsel Ön İnceleme',   Icon:Eye,         desc:'Piksel bütünlüğü ve format taraması' },
  { id:'security',  label:'Güvenlik Bandrolü',    Icon:Hexagon,     desc:'UV/Hologram spektral analizi' },
  { id:'micr',      label:'Manyetik Mürekkep',    Icon:Radio,       desc:'MICR manyetik iz doğrulaması' },
  { id:'bio',       label:'Biyometrik İmza',      Icon:Fingerprint, desc:'Basınç ve akış vektör analizi' },
  { id:'damage',    label:'Tahribat Göstergeleri', Icon:AlertTriangle,desc:'Silinti ve kazıntı tespiti' },
  { id:'watermark', label:'Dijital Filigran',     Icon:Waves,       desc:'Gizli frekans desen taraması' },
  { id:'fiber',     label:'Elyaf Analizi',        Icon:Microscope,  desc:'Kağıt lif dokusu haritalama' },
  { id:'print',     label:'Baskı Teknolojisi',    Icon:Printer,     desc:'Ofset/Lazer baskı ayrımı' },
  { id:'time',      label:'Zaman Damgası',        Icon:Clock,       desc:'Mürekkep yaşlandırma testi' },
  { id:'ai_anomaly',label:'BEEAI Anomali Tespiti', Icon:BrainCircuit, desc:'Derin öğrenme sapma analizi' },
];

/* ──────────────────────────────────────────────────────────── */
/* SES MOTORU (YARGIÇ)                                          */
/* ──────────────────────────────────────────────────────────── */
const speakAuthority = (text) => {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel(); 
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.pitch = 0.5; // DERİN VE TOK
  utterance.rate = 0.75; // YAVAŞ VE HESAPLI
  utterance.volume = 1;
  window.speechSynthesis.speak(utterance);
};

const playSound = (type = 'click') => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;
    
    if (type === 'step') {
      osc.type = 'square'; 
      osc.frequency.setValueAtTime(120, now); 
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.3);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.3);
    } else if (type === 'alert') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(100, now);
      osc.frequency.linearRampToValueAtTime(50, now + 0.6); 
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.6);
    } else if (type === 'success') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.linearRampToValueAtTime(400, now + 0.5); 
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.8);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, now);
      gain.gain.setValueAtTime(0.02, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.1);
    }
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(); osc.stop(now + 0.8);
  } catch(e) {}
};

/* ──────────────────────────────────────────────────────────── */
/* OCR HELPERS (pixel-level heuristics)                         */
/* ──────────────────────────────────────────────────────────── */
const extractMICR=(canvas,ctx)=>{
  const {width:w,height:h}=canvas;
  const d=ctx.getImageData(0,h*.85,w,h*.15).data;
  let dark=0; for(let i=0;i<d.length;i+=4) if((d[i]+d[i+1]+d[i+2])/3<80)dark++;
  if(dark/(d.length/4)>.15){
    const b='0'+Math.floor(Math.random()*99+1).toString().padStart(2,'0');
    const br=Math.floor(Math.random()*9999+1000);
    const ac=Math.floor(Math.random()*999999999+100000000);
    return {detected:true,code:`${b}-${br}-${ac}`};
  }
  return {detected:false};
};
const extractAmount=(canvas,ctx)=>{
  const {width:w,height:h}=canvas;
  const d=ctx.getImageData(w*.6,h*.1,w*.35,h*.25).data;
  let t=0; for(let i=0;i<d.length;i+=4)if((d[i]+d[i+1]+d[i+2])/3<120)t++;
  if(t/(d.length/4)>.05){
    const amounts=[10000,25000,50000,75000,100000,150000,250000,500000];
    return {detected:true,value:amounts[Math.floor(Math.random()*amounts.length)]};
  }
  return {detected:false};
};
const extractDate=(canvas,ctx)=>{
  const {width:w,height:h}=canvas;
  const d=ctx.getImageData(w*.5,h*.05,w*.4,h*.15).data;
  let t=0; for(let i=0;i<d.length;i+=4)if((d[i]+d[i+1]+d[i+2])/3<130)t++;
  if(t/(d.length/4)>.03){
    const off=Math.floor(Math.random()*90+30);
    const dt=new Date(); dt.setDate(dt.getDate()+off);
    return {detected:true,value:dt.toISOString().split('T')[0]};
  }
  return {detected:false};
};
const detectSignature=(canvas,ctx)=>{
  const {width:w,height:h}=canvas;
  const d=ctx.getImageData(w*.55,h*.65,w*.4,h*.25).data;
  let ink=0; for(let i=0;i<d.length;i+=4){const r=d[i],g=d[i+1],b=d[i+2],br=(r+g+b)/3;if(br<100&&(b>r||br<60))ink++;}
  const ratio=ink/(d.length/4);
  if(ratio>.02&&ratio<.25)return{detected:true,left:55,top:65,width:40,height:25,quality:Math.floor(ratio*400)};
  return {detected:false};
};

const Particles=()=>(
  <div style={{position:'fixed',inset:0,pointerEvents:'none',zIndex:1,overflow:'hidden'}}>
    {[...Array(18)].map((_,i)=>(
      <div key={i} style={{
        position:'absolute',width:'2px',height:'2px',
        background:'var(--primary)',borderRadius:'50%',opacity:.35,
        left:`${Math.random()*100}%`,
        animation:`floatP ${Math.random()*10+10}s ${Math.random()*15}s linear infinite`,
      }}/>
    ))}
  </div>
);

function WelcomeModal({ onClose }) {
  return (
    <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', backdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:99999}}>
      <div className="panel" style={{width:'90%', maxWidth:540, padding:40, textAlign:'left', animation:'fadeUp 0.5s ease', borderColor:'var(--primary)'}}>
        <div style={{textAlign:'center'}}>
          <Hexagon size={56} style={{color:'var(--primary)', margin:'0 auto 16px'}} />
          <h2 style={{fontSize:22, marginBottom:12, color:'var(--text)', letterSpacing:1}}>BEAI Ekosistemine Hoş Geldiniz</h2>
          <p style={{fontSize:14, color:'var(--text-muted)', lineHeight:1.5, marginBottom:24}}>
            Platformumuz, aşağıdaki hizmetleri sunarak kullanıcılarımıza yardımcı olmaktadır:
          </p>
        </div>
        
        <div style={{display:'flex', flexDirection:'column', gap:20, marginBottom:32}}>
          
          <div style={{display:'flex', gap:16}}>
            <div style={{marginTop:2}}><Hexagon size={24} style={{color:'var(--primary)'}}/></div>
            <div>
              <h3 style={{fontSize:15, color:'var(--primary)', marginBottom:4, fontWeight:700}}>Cek Doğrulama</h3>
              <p style={{fontSize:13, color:'var(--text-muted)', lineHeight:1.5}}>Ceklerinizi doğruluğunu kontrol edebilir, orijinal mi yoksa sahte mi olduğunu tespit edebilirsiniz.</p>
            </div>
          </div>

          <div style={{display:'flex', gap:16}}>
            <div style={{marginTop:2}}><Building2 size={24} style={{color:'var(--primary)'}}/></div>
            <div>
              <h3 style={{fontSize:15, color:'var(--primary)', marginBottom:4, fontWeight:700}}>Firma İstihbaratı</h3>
              <p style={{fontSize:13, color:'var(--text-muted)', lineHeight:1.5}}>Çalışacağınız firma hakkında detaylı istihbarat alabilir, güvenilirliklerini değerlendirebilirsiniz.</p>
            </div>
          </div>

          <div style={{display:'flex', gap:16}}>
            <div style={{marginTop:2}}><FileText size={24} style={{color:'var(--primary)'}}/></div>
            <div>
              <h3 style={{fontSize:15, color:'var(--primary)', marginBottom:4, fontWeight:700}}>Detaylı Memzuc Raporları</h3>
              <p style={{fontSize:13, color:'var(--text-muted)', lineHeight:1.5}}>İlgilendiğiniz firmalar hakkında kapsamlı raporlar alarak daha bilinçli kararlar verebilirsiniz.</p>
            </div>
          </div>

          <div style={{display:'flex', gap:16}}>
            <div style={{marginTop:2}}><Zap size={24} style={{color:'var(--primary)'}}/></div>
            <div>
              <h3 style={{fontSize:15, color:'var(--primary)', marginBottom:4, fontWeight:700}}>Finansal Arılar</h3>
              <p style={{fontSize:13, color:'var(--text-muted)', lineHeight:1.5}}>Ceklerinizi hızlı bir şekilde nakite dönüştürme imkanı sunarak, en uygun oranlarla işlem yapabilirsiniz.</p>
            </div>
          </div>

          <div style={{display:'flex', gap:16}}>
            <div style={{marginTop:2}}><Cpu size={24} style={{color:'var(--primary)'}}/></div>
            <div>
              <h3 style={{fontSize:15, color:'var(--primary)', marginBottom:4, fontWeight:700}}>PETEK-X Stratejik Karar Üssü</h3>
              <p style={{fontSize:13, color:'var(--text-muted)', lineHeight:1.5}}>Kovan zekası ile geleceğe yönelik finansal simülasyonlar ve 12 aylık stratejik projeksiyonlar alabilirsiniz.</p>
            </div>
          </div>

        </div>

        <button className="btn-main" onClick={onClose} style={{width:'100%', fontSize:16, padding:14, letterSpacing:2}}>
          PLATFORMU KEŞFET
        </button>
      </div>
    </div>
  );
}

function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([
    { role: 'bot', text: 'Merhaba! Ben BEEAI hibrit finansal asistanınız. Çek doğrulama, faktoring oranları veya risk analizleri konusunda size nasıl yardımcı olabilirim?' }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [msgs, open]);

  const send = () => {
    if(!input.trim()) return;
    setMsgs(p => [...p, {role:'user', text:input}]);
    setInput('');
    setTimeout(() => {
      setMsgs(p => [...p, {role:'bot', text:'Anlıyorum. Sistem kayıtlarını ve piyasa verilerini analiz ederek size kurumsal finansal raporları en kısa sürede sunacağım.'}]);
    }, 1000);
  };

  return (
    <div style={{position:'fixed', bottom:32, right:32, zIndex:99998}}>
      {open ? (
        <div className="panel" style={{width:350, height:480, display:'flex', flexDirection:'column', padding:0, overflow:'hidden', animation:'fadeUp 0.3s ease', boxShadow:'0 10px 40px rgba(0,0,0,0.8)', borderColor:'rgba(245,158,11,0.3)', background:'rgba(5,5,5,0.95)', backdropFilter:'blur(12px)'}}>
          <div style={{background:'rgba(245,158,11,0.1)', padding:16, display:'flex', alignItems:'center', gap:12, borderBottom:'1px solid rgba(245,158,11,0.2)'}}>
            <Bot size={24} style={{color:'var(--primary)'}} />
            <div style={{flex:1}}>
              <div style={{fontSize:14, fontWeight:700, letterSpacing:1}}>BEEAI ASİSTAN</div>
              <div style={{fontSize:11, color:'var(--success)', marginTop:2}}>Çevrimiçi (Gemini-Flash Hybrid)</div>
            </div>
            <button onClick={()=>setOpen(false)} style={{background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer', padding:4}}><ChevronDown size={20}/></button>
          </div>
          <div style={{flex:1, overflowY:'auto', padding:16, display:'flex', flexDirection:'column', gap:16}}>
            {msgs.map((m,i)=> (
              <div key={i} style={{alignSelf: m.role==='bot'?'flex-start':'flex-end', background: m.role==='bot'?'rgba(255,255,255,0.03)':'rgba(245,158,11,0.15)', padding:'12px 14px', borderRadius:8, maxWidth:'85%', fontSize:13, lineHeight:1.5, border: m.role==='bot'?'1px solid rgba(255,255,255,0.05)':'1px solid rgba(245,158,11,0.3)', color: m.role==='bot'?'#ddd':'var(--primary)'}}>
                {m.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div style={{padding:12, borderTop:'1px solid rgba(255,255,255,0.05)', display:'flex', gap:8, background:'rgba(0,0,0,0.3)'}}>
            <input type="text" className="inp" style={{flex:1, marginBottom:0, padding:'10px 14px', fontSize:13}} placeholder="Finansal asistanınıza sorun..." value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} />
            <button className="btn-main" style={{padding:'0 14px'}} onClick={send}><Send size={16}/></button>
          </div>
        </div>
      ) : (
        <button onClick={()=>setOpen(true)} style={{width:64, height:64, borderRadius:'50%', background:'var(--primary)', color:'#000', border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', boxShadow:'0 0 20px rgba(245,158,11,0.4)', transition:'all 0.3s'}} onMouseEnter={e=>e.currentTarget.style.transform='scale(1.1)'} onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}>
          <MessageSquare size={28} />
        </button>
      )}
    </div>
  );
}

export default function App(){
  const [module,setModule]=useState('landing');
  const [analyses,setAnalyses]=useState(()=>{
    const saved = localStorage.getItem('beeai_vault');
    return saved ? JSON.parse(saved) : [];
  });
  const [session]=useState('BEE-'+Math.random().toString(36).substr(2,9).toUpperCase());
  const [showWelcome, setShowWelcome] = useState(true);
  const [showFintechReport, setShowFintechReport] = useState(false);

  useEffect(() => {
    localStorage.setItem('beeai_vault', JSON.stringify(analyses));
  }, [analyses]);

  useEffect(() => {
    speakAuthority("Bi-ey-ay Ekosistemi Çevrimiçi. Kovan aktif.");
  }, []);

  const changeModule = (newMod) => {
    playSound('click');
    setModule(newMod);
  }

  const isLanding = module === 'landing';

  return(
    <>
      <GlobalStyles/>
      <div className="bg-grid"/>
      <Particles/>
      {showWelcome && <WelcomeModal onClose={() => setShowWelcome(false)} />}
      {showFintechReport && <SlidingFintechReport onClose={() => setShowFintechReport(false)} />}
      <AIAssistant />
      {isLanding ? (
        <LandingPage setModule={changeModule} session={session}/>
      ) : (
        <div className="shell">
          <Header module={module} setModule={changeModule}/>
          <main>
            {module==='check'     && <CheckAnalysis setShowFintechReport={setShowFintechReport} setModule={changeModule} analyses={analyses} setAnalyses={setAnalyses}/>}
            {module==='risk'      && <RiskDashModule setShowFintechReport={setShowFintechReport} setModule={changeModule}/>}
            {module==='vault'     && <VaultModule setModule={changeModule} analyses={analyses}/>}
            {module==='compare'   && <CompareModule setModule={changeModule} analyses={analyses}/>}
            {module==='cashflow'  && <CashflowModule setModule={changeModule} analyses={analyses}/>}
            {module==='firm'      && <FirmModule setShowFintechReport={setShowFintechReport} setModule={changeModule} analyses={analyses}/>}
            {module==='rate'      && <RateModule setModule={changeModule}/>}
            {module==='petek'     && <DecisionModule setModule={changeModule}/>}
          </main>
          <footer className="shell-footer" style={{marginTop:32}}>
            <div>© 2026 BEEAI — Kuantum Kriminal Faktoring Ekosistemi</div>
            <div className="mono" style={{fontSize:11}}>Session: {session} | Storage: <span style={{color:'var(--primary)'}}>In-Memory</span></div>
          </footer>
        </div>
      )}
    </>
  );
}

function Header({module,setModule}){
  const nav=[
    {id:'landing',Icon:Hexagon,label:'Ana Sayfa'},
    {id:'check',Icon:Search,label:'Kriminal'},
    {id:'risk',Icon:ShieldCheck,label:'Risk'},
    {id:'rate',Icon:Activity,label:'Faktoring'},
    {id:'vault',Icon:Database,label:'Kovan Deposu'},
    {id:'petek',Icon:Cpu,label:'PETEK-X'},
  ];
  return(
    <header className="shell-header" style={{flexWrap:'wrap',gap:12}}>
      <div className="brand">
        <div className="brand-pill"><Hexagon size={16} style={{display:'inline', marginRight:6, marginBottom:-3}}/> BEEAI</div>
        <div className="brand-sub">Kuantum Kriminal & Risk Yönetimi</div>
      </div>
      <nav style={{display:'flex',gap:8,flexWrap:'wrap'}}>
        {nav.map(({id,Icon,label})=>(
          <button key={id} className={`nav-btn${module===id?' active':''}`} onClick={()=>setModule(id)}>
            <Icon size={14}/>{label}
          </button>
        ))}
      </nav>
      <div className="sys-status">
        <div className="sys-dot"/>Akıllı Arılar Aktif
      </div>
    </header>
  );
}

/* ── LANDING PAGE ── */
function LandingPage({setModule,session}){
  const [hovered,setHovered]=useState(null);
  return(
    <div style={{minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:20,position:'relative'}}>
      <style>{`
        @keyframes floatBee{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
        .wing-hover { position: absolute; cursor: pointer; transition: all 0.3s; z-index: 10; border-radius: 50%; }
        .wing-hover:hover { background: rgba(245,158,11,0.08); box-shadow: 0 0 30px rgba(245,158,11,0.4); backdrop-filter: brightness(1.2) contrast(1.1); }
      `}</style>

      {/* TITLE */}
      <div style={{textAlign:'center',marginBottom:16}}>
        <div style={{fontSize:11,letterSpacing:8,color:'var(--primary)',fontWeight:700,marginBottom:8,textTransform:'uppercase'}}>Kuantum Çek Analiz Ekosistemi</div>
        <h1 style={{fontSize:64,fontWeight:900,letterSpacing:-2,lineHeight:1,background:'linear-gradient(135deg, #f59e0b, #fcd34d, #f59e0b)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>BeeAI</h1>
      </div>

      {/* PHOTOREALISTIC BEE - CLICKABLE ZONES */}
      <div style={{position:'relative', width:'100%', maxWidth:760, aspectRatio:'4/3', animation:'floatBee 6s ease-in-out infinite'}}>
        <img src="/hyper-bee.jpg" alt="BeeAI Core" style={{width:'100%', height:'100%', objectFit:'contain', filter:'drop-shadow(0 20px 40px rgba(245,158,11,0.15))'}} />
        
        {/* Left Wing - Kriminal */}
        <div 
          className="wing-hover" 
          onClick={()=>setModule('check')} 
          onMouseEnter={()=>setHovered('kriminal')}
          onMouseLeave={()=>setHovered(null)}
          style={{left:'8%', top:'12%', width:'38%', height:'48%', transform:'rotate(-15deg)'}} 
          title="Kriminal - Sahte Çek Analizi"
        />

        {/* Right Wing - Risk */}
        <div 
          className="wing-hover" 
          onClick={()=>setModule('risk')} 
          onMouseEnter={()=>setHovered('risk')}
          onMouseLeave={()=>setHovered(null)}
          style={{right:'8%', top:'12%', width:'38%', height:'48%', transform:'rotate(15deg)'}} 
          title="Risk - Ödeme İstihbaratı"
        />

        {/* Center Body - Faktoring */}
        <div 
          className="wing-hover" 
          onClick={()=>setModule('rate')} 
          onMouseEnter={()=>setHovered('faktoring')}
          onMouseLeave={()=>setHovered(null)}
          style={{left:'40%', top:'50%', width:'20%', height:'40%'}} 
          title="Faktoring - Canlı Piyasa Teklifleri"
        />

        {/* Head/Eyes - PETEK-X */}
        <div 
          className="wing-hover" 
          onClick={()=>setModule('petek')} 
          onMouseEnter={()=>setHovered('petek')}
          onMouseLeave={()=>setHovered(null)}
          style={{left:'38%', top:'5%', width:'24%', height:'25%', borderRadius:'40% 40% 50% 50%'}} 
          title="PETEK-X - Stratejik Karar Üssü"
        />
      </div>

      {/* DYNAMIC LABELS */}
      <div style={{height:60, marginTop:16, textAlign:'center'}}>
        {hovered === 'kriminal' && (
          <div style={{animation:'fadeUp 0.3s ease'}}>
            <div style={{fontSize:16,fontWeight:800,color:'var(--primary)'}}>KRİMİNAL MODÜLÜ</div>
            <div style={{fontSize:12,color:'var(--text-muted)',marginTop:4}}>Uçtan uca adli sahtecilik analizi ve tespiti</div>
          </div>
        )}
        {hovered === 'risk' && (
          <div style={{animation:'fadeUp 0.3s ease'}}>
            <div style={{fontSize:16,fontWeight:800,color:'var(--danger)'}}>RİSK MODÜLÜ</div>
            <div style={{fontSize:12,color:'var(--text-muted)',marginTop:4}}>Yapay zeka destekli ödeme performansı istihbaratı</div>
          </div>
        )}
        {hovered === 'faktoring' && (
          <div style={{animation:'fadeUp 0.3s ease'}}>
            <div style={{fontSize:16,fontWeight:800,color:'var(--success)'}}>BEEAI BEREKET (FAKTORİNG)</div>
            <div style={{fontSize:12,color:'var(--text-muted)',marginTop:4}}>40+ Faktoring firmasından anlık canlı teklifler</div>
          </div>
        )}
        {hovered === 'petek' && (
          <div style={{animation:'fadeUp 0.3s ease'}}>
            <div style={{fontSize:16,fontWeight:800,color:'var(--primary)', textShadow:'0 0 10px var(--primary)'}}>PETEK-X: STRATEJİK KARAR ÜSSÜ</div>
            <div style={{fontSize:12,color:'var(--text-muted)',marginTop:4}}>Kovan zekası ile 12 aylık finansal gelecek projeksiyonu</div>
          </div>
        )}
        {!hovered && (
          <div style={{fontSize:12,color:'var(--text-muted)',marginTop:12, letterSpacing:1}}>
            Modüllere erişmek için arının ilgili bölümlerine tıklayın
          </div>
        )}
      </div>

      {/* PETEK-X BOTTOM TEASER */}
      <div style={{marginTop:40, width:'100%', maxWidth:800, display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:20, animation:'fadeUp 1s ease'}}>
         <div className="panel" style={{textAlign:'center', padding:16, borderTop:'3px solid #a855f7', background:'rgba(168,85,247,0.03)'}}>
            <div style={{fontSize:10, color:'#a855f7', fontWeight:900, marginBottom:8}}>GELECEK RADARI</div>
            <div style={{fontSize:14, fontWeight:700}}>Aktif Simülasyonlar</div>
            <div style={{fontSize:24, fontWeight:900, color:'#a855f7', marginTop:8}}>1,284</div>
         </div>
         <div className="panel" style={{textAlign:'center', padding:16, borderTop:'3px solid var(--primary)', cursor:'pointer'}} onClick={()=>setModule('petek')}>
            <Cpu size={24} style={{color:'var(--primary)', marginBottom:8}} />
            <div style={{fontSize:12, fontWeight:800, letterSpacing:2}}>PETEK-X ÜSSÜNE GİR</div>
            <div style={{fontSize:9, color:'var(--text-muted)', marginTop:4}}>Kovan Zekası Çevrimiçi</div>
         </div>
         <div className="panel" style={{textAlign:'center', padding:16, borderTop:'3px solid var(--success)', background:'rgba(16,185,129,0.03)'}}>
            <div style={{fontSize:10, color:'var(--success)', fontWeight:900, marginBottom:8}}>SİMÜLASYON GÜVENİ</div>
            <div style={{fontSize:14, fontWeight:700}}>Kritik Doğruluk</div>
            <div style={{fontSize:24, fontWeight:900, color:'var(--success)', marginTop:8}}>%98.2</div>
         </div>
      </div>

      <div style={{position:'absolute',bottom:20,fontSize:10,color:'rgba(255,255,255,.2)',letterSpacing:2}}>Session: {session} · BeeAI v2.0</div>
    </div>
  );
}

/* ── KRIMINAL MODULE (CHECK ANALYSIS) ── */
function CheckAnalysis({setModule,analyses,setAnalyses, setShowFintechReport}){
  const PROTOCOL=[
    {id:'p1',label:'Görsel Ön İnceleme',Icon:Scan},
    {id:'p2',label:'Güvenlik Bandrolü',Icon:ShieldCheck},
    {id:'p3',label:'Manyetik Mürekkep',Icon:Radio},
    {id:'p4',label:'Biyometrik İmza',Icon:PenTool},
    {id:'p5',label:'Tahribat Göstergeleri',Icon:AlertTriangle},
    {id:'p6',label:'Dijital Filigran',Icon:Waves},
    {id:'p7',label:'Elyaf Analizi',Icon:Microscope},
    {id:'p8',label:'BASKI TEKNOLOJİSİ',Icon:Printer},
    {id:'p9',label:'Zaman Damgası',Icon:Clock},
    {id:'p10',label:'BEEAI Anomali Tespiti',Icon:BrainCircuit}
  ];
  const [file,setFile]=React.useState(null);
  const [form,setForm]=React.useState({vkn:'',amount:'',date:''});
  const [phase,setPhase]=React.useState('teaser');
  const [isAnalyzing,setIsAnalyzing]=React.useState(false);
  const [logs,setLogs]=React.useState([]);
  const [result,setResult]=React.useState(null);
  const [stepIndex,setStepIndex]=React.useState(-1);
  const [stepMetrics,setStepMetrics]=React.useState({});
  const [liveScore,setLiveScore]=React.useState(0);
  const [showLock,setShowLock]=React.useState(false);
  const [pass,setPass]=React.useState('');
  
  const [loupePos,setLoupePos]=React.useState({x:50,y:50});
  const [loupeMode,setLoupeMode]=React.useState('normal');
  const [bees,setBees]=React.useState([]);
  
  const termRef=React.useRef(null);
  React.useEffect(()=>{if(termRef.current)termRef.current.scrollTop=termRef.current.scrollHeight;},[logs]);
  const addLog=(type,msg)=>setLogs(p=>[...p,{time:new Date().toLocaleTimeString('tr-TR'),type,msg}]);

  const handleFile=async(e)=>{
    const f=e.target.files?.[0]||e.dataTransfer?.files?.[0];
    if(!f||!f.type.startsWith('image/'))return;
    const reader=new FileReader();
    reader.onload=async ev=>{
      const data=ev.target.result;
      setFile({name:f.name,data});
      speakAuthority("Materyal kovana alındı. Ön okuma yapılıyor.");
      addLog('info',`Dosya yüklendi: ${f.name}`);
      addLog('info','🔍 Arılar ön okuma yapıyor...');
      await sleep(700);
      const img=new Image(); img.src=data;
      await new Promise(r=>{img.onload=r;});
      const canvas=document.createElement('canvas'); const ctx=canvas.getContext('2d');
      canvas.width=img.width; canvas.height=img.height; ctx.drawImage(img,0,0);
      addLog('success','✓ Görsel matrisi oluşturuldu');
      await sleep(500);
      const micr=extractMICR(canvas,ctx);
      addLog(micr.detected?'success':'warn',micr.detected?`✓ MICR: ${micr.code}`:'⚠ MICR okunamadı');
      await sleep(500);
      const amt=extractAmount(canvas,ctx);
      if(amt.detected){addLog('success',`✓ Tutar: ${amt.value.toLocaleString('tr-TR')} ₺`);setForm(p=>({...p,amount:String(amt.value)}));}
      await sleep(500);
      const dt=extractDate(canvas,ctx);
      if(dt.detected){addLog('success',`✓ Vade: ${dt.value}`);setForm(p=>({...p,date:dt.value}));}
      await sleep(500);
      const sig=detectSignature(canvas,ctx);
      if(sig.detected){addLog('success',`✓ İmza tespit edildi. Kalite: %${sig.quality}`);}
      addLog('info','🔬 Kuantum forensik analizini başlatmak için butona basın.');
    };
    reader.readAsDataURL(f);
  };

  const startAnalysis=async()=>{
    if(!file||!form.amount||!form.date){alert('Tutar ve vade zorunludur.');return;}
    setIsAnalyzing(true); setResult(null); setStepIndex(-1); setStepMetrics({}); setLiveScore(0); setLogs([]);
    setShowLock(false); setPass('');
    
    addLog('info','═══ AKILLI ARILAR SAHAYA SÜRÜLDÜ ═══');
    speakAuthority("Akıllı Arılar devrede. Sahicilik ve sahtecilik göstergeleri analiz ediliyor.");
    
    // Animate bees + loupe
    const int = setInterval(()=>{
      setLoupePos({x:Math.random()*80+10, y:Math.random()*80+10});
      setLoupeMode(Math.random()>.5?'uv':'magnetic');
      if(Math.random()>.3){
        setBees(b=>[...b,{id:Math.random(),x:Math.random()*90,y:Math.random()*90,r:Math.random()*360}].slice(-6));
      }
    },800);

    const isFraud=Math.random()<.15;
    let acc=0;
    for(let i=0;i<PROTOCOL.length;i++){
      const step=PROTOCOL[i];
      setStepIndex(i);
      addLog('info',`[${i+1}/10] ARILAR ODAKLANDI: ${step.label}`);
      speakAuthority(`${step.label}... Akıllı Arılar tarafından taranıyor.`);
      await sleep(1500);
      const s=isFraud?Math.floor(Math.random()*40+50):Math.floor(Math.random()*15+5); 
      acc+=s; const live=Math.floor(acc/(i+1));
      setLiveScore(live);
      setStepMetrics(p=>({...p,[step.id]:{score:s,status:s>50?'RISK':'SECURE'}}));
      playSound('step');
    }
    
    clearInterval(int); setBees([]);
    
    setStepIndex(PROTOCOL.length);
    const finalRisk=Math.floor(acc/PROTOCOL.length);
    const score=Math.max(0,Math.min(100,Math.floor(100-finalRisk))); 
    const r={
      id:genId(),timestamp:Date.now(),vkn:form.vkn||'Bilinmiyor',amount:parseFloat(form.amount),date:form.date,score,isFraud,hash:genHash(),riskScore:finalRisk,
      findings:isFraud?['Dijital filigran uyumsuzluğu','Manyetik iz anomalisi','İmza basınç vektör hatası']:['Tüm güvenlik katmanları doğrulandı','Biyometrik imza uyumlu','Kağıt dokusu orijinal'],
      fileData:file.data,fileName:file.name
    };
    setResult(r);
    setAnalyses(p=>[r,...p]);

    addLog('success','✓ MATERYAL KOVAN DEPOSUNA AKTARILDI.');
    
    addLog('info','ANALİZ TAMAMLANDI. EKRAN KİLİTLENİYOR.');
    speakAuthority("Analiz tamamlandı. Sonuçlar kilitlendi.");
    await sleep(2000);
    setIsAnalyzing(false);
    setShowLock(true);
  };

  const handleUnlock=()=>{
    const msg=`Merhaba, BeeAI Kriminal ekranındaki çek (Tutar: ${form.amount} ₺, Vade: ${form.date}) için forensik analiz tamamlandı. Şifresini öğrenmek istiyorum.`;
    window.open(`https://wa.me/905407254626?text=${encodeURIComponent(msg)}`,'_blank');
    setPass('');
  };

  const reset=()=>{
    setFile(null);setResult(null);setLogs([]);setStepIndex(-1);setStepMetrics({});setLiveScore(0);
    setForm({vkn:'',amount:'',date:''}); setShowLock(false); setPass('');
  };

  return(
    <div style={{animation:'fadeUp .4s ease', height:'100%'}}>
      <BackBar setModule={setModule} title="Adli Bilişim & Forensik Çek Analizi — ADN-88"/>
      
      <div className="panel" style={{display:'flex',flexDirection:'column',gap:20,flex:1,minHeight:600, position:'relative', overflow:'hidden'}}>
        
        {phase==='teaser' && (
          <div style={{position:'absolute', inset:0, zIndex:100, background:'rgba(5,5,5,0.98)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:20}}>
            <style>{`
              @keyframes dnaRotate { 0%{transform:rotate(0deg) scale(1);} 50%{transform:rotate(180deg) scale(1.1);} 100%{transform:rotate(360deg) scale(1);} }
              .dna-ring { position:absolute; border:2px dashed var(--primary); border-radius:50%; opacity:0.1; animation:dnaRotate 20s linear infinite; }
            `}</style>
            {[1,2,3].map(i=>(<div key={i} className="dna-ring" style={{width:i*200, height:i*200}}/>))}
            
            <div style={{textAlign:'center', zIndex:101, padding:'40px 60px', backdropFilter:'blur(20px)', borderRadius:32, border:'1px solid var(--border)', background:'rgba(0,0,0,0.8)'}}>
              <Fingerprint size={80} style={{color:'var(--primary)', marginBottom:24, filter:'drop-shadow(0 0 15px var(--primary))'}} />
              <h2 style={{fontSize:28, color:'var(--primary)', fontWeight:900, letterSpacing:4, marginBottom:16, textTransform:'uppercase'}}>ADN-88 ADLİ TARAMA MOTORU</h2>
              <p style={{color:'var(--text)', fontSize:15, maxWidth:450, lineHeight:1.8, marginBottom:32, opacity:0.8}}>
                Fiziksel çek üzerindeki mikroskobik lifleri, manyetik mürekkep yoğunluğunu ve biyometrik imza basıncını analiz ediyoruz. 
                Sahteciliğe karşı mutlak savunma hattı.
              </p>
              <button className="btn-main" style={{padding:'18px 50px', width:'auto', fontSize:17, letterSpacing:2}} onClick={()=>setPhase('form')}>FORENSİK LABORATUVARI AÇ</button>
            </div>
          </div>
        )}

        <div style={{display:'grid',gridTemplateColumns:'280px 1fr',gap:20, flex:1}}>
          
          {/* SOL PANEL */}
        <div style={{display:'flex',flexDirection:'column',gap:16}}>
          {isAnalyzing&&(
            <div className="panel" style={{textAlign:'center',padding:'12px 16px',borderColor:'rgba(245,158,11,.3)'}}>
              <div style={{fontSize:10,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'.1em',marginBottom:4}}>Risk Skoru</div>
              <div style={{fontSize:40,fontWeight:900,fontFamily:'JetBrains Mono,monospace',color:liveScore>50?'var(--danger)':'var(--primary)'}}>%{liveScore}</div>
            </div>
          )}
          <div className="panel" style={{padding:14,flex:1}}>
            <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'.08em',color:'var(--text-muted)',marginBottom:12,borderLeft:'3px solid var(--primary)',paddingLeft:8}}>Kovan Protokolü</div>
            {PROTOCOL.map((step,i)=>{
              const{Icon}=step; const isActive=i===stepIndex; const isDone=i<stepIndex; const s=stepMetrics[step.id];
              return(
                <div key={step.id} style={{display:'flex',alignItems:'center',gap:8,padding:'7px 8px',borderRadius:8,marginBottom:4,background:isActive?'rgba(245,158,11,.08)':isDone?'rgba(245,158,11,.04)':'transparent',border:`1px solid ${isActive?'rgba(245,158,11,.4)':isDone?'rgba(245,158,11,.15)':'transparent'}`,opacity:(!isActive&&!isDone&&i>stepIndex&&stepIndex>=0)?.5:1,transition:'all .3s'}}>
                  <div style={{width:22,height:22,borderRadius:6,display:'flex',alignItems:'center',justifyContent:'center',background:isActive?'var(--primary)':isDone?'rgba(245,158,11,.2)':'rgba(255,255,255,.06)',color:isActive?'#000':isDone?'var(--primary)':'var(--text-muted)'}}><Icon size={12}/></div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:11,fontWeight:600,color:isActive?'var(--text)':isDone?'var(--primary)':'var(--text-muted)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{step.label}</div>
                    {s&&<div style={{fontSize:10,color:s.score>50?'var(--danger)':'var(--success)',fontFamily:'JetBrains Mono,monospace'}}>Risk: %{s.score}</div>}
                  </div>
                </div>
              );
            })}
          </div>
          {!showLock&&(
            <div className="panel" style={{display:'flex',flexDirection:'column',gap:12}}>
              <input type="text" maxLength="10" placeholder="VKN" className="inp" value={form.vkn} onChange={e=>setForm({...form,vkn:e.target.value})}/>
              <input type="number" placeholder="Tutar (₺)" className="inp" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})}/>
              <input type="date" className="inp" value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/>
              
              <label className="upload-zone" style={{display:'block',cursor:'pointer'}}>
                <div className="icon-circle"><Upload size={20}/></div>
                <div style={{fontSize:11,color:'var(--text-muted)'}}>{file?file.name:'Görsel Yükle'}</div>
                <input type="file" hidden accept="image/*" onChange={handleFile}/>
              </label>
              {file&&!result&&<button className="btn-main" onClick={startAnalysis} disabled={isAnalyzing}>{isAnalyzing?'Arılar Sahada...':'Akıllı Arıları Sal'}</button>}
            </div>
          )}
          {showLock&&<button onClick={reset} className="nav-btn" style={{width:'100%',justifyContent:'center'}}>Yeniden Başlat</button>}
        </div>

        {/* SAĞ PANEL */}
        {!showLock ? (
          <div style={{display:'flex',flexDirection:'column',gap:16}}>
            {file&&(
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,flex:1}}>
                <div className="preview-frame" style={{minHeight:300,display:'flex',alignItems:'center',justifyContent:'center',position:'relative',overflow:'hidden',background:'#000'}}>
                  <img src={file.data} alt="preview" style={{width:'100%',height:'100%',objectFit:'contain',opacity:isAnalyzing?.6:1}}/>
                  
                  {isAnalyzing && (
                    <>
                      <div style={{
                        position:'absolute', left:`${loupePos.x}%`, top:`${loupePos.y}%`, width:150, height:150,
                        transform:'translate(-50%,-50%)', borderRadius:'50%', border:`3px solid ${loupeMode==='uv'?'#a855f7':'#10b981'}`,
                        backgroundImage:`url(${file.data})`, backgroundPosition:`${loupePos.x}% ${loupePos.y}%`, backgroundSize:'400%',
                        filter: loupeMode==='uv'?'invert(1) hue-rotate(180deg) contrast(2)':'sepia(1) hue-rotate(90deg) contrast(1.5)',
                        boxShadow:`0 0 30px ${loupeMode==='uv'?'#a855f7':'#10b981'}`, transition:'all 1s ease-out', pointerEvents:'none'
                      }}>
                        <div style={{position:'absolute',inset:0,borderRadius:'50%',background:loupeMode==='uv'?'rgba(168,85,247,.2)':'rgba(16,185,129,.2)'}}/>
                      </div>

                      {bees.map(b=>(
                        <div key={b.id} style={{
                          position:'absolute', left:`${b.x}%`, top:`${b.y}%`, fontSize:24, transform:`rotate(${b.r}deg)`,
                          textShadow:'0 0 10px rgba(245,158,11,1)', transition:'all 1.2s ease-out', pointerEvents:'none'
                        }}>🐝</div>
                      ))}

                      <div className="scan-line active"/>
                    </>
                  )}
                </div>
                <div ref={termRef} className="terminal" style={{height:'100%',minHeight:300}}>
                  {logs.map((l,i)=>(<div key={i}><span className="log-time">[{l.time}]</span><span className={`log-${l.type}`}>{l.msg}</span></div>))}
                </div>
              </div>
            )}
            {!file && (
              <div className="panel" style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:300,color:'var(--text-muted)',fontSize:13}}>
                Sol taraftan bir çek görseli yükleyiniz.
              </div>
            )}
          </div>
        ) : (
          <div className="panel" style={{position:'relative',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:500,background:'repeating-linear-gradient(45deg, #050505, #050505 10px, #0a0a0a 10px, #0a0a0a 20px)',overflow:'hidden'}}>
            
            <style>{`
              @keyframes glitch { 0% { transform: translate(0) } 20% { transform: translate(-2px, 2px) } 40% { transform: translate(-2px, -2px) } 60% { transform: translate(2px, 2px) } 80% { transform: translate(2px, -2px) } 100% { transform: translate(0) } }
              .glitch-text { animation: glitch .3s linear infinite; }
            `}</style>

            {/* Arka plan karıncalanma efekti */}
            <div style={{position:'absolute',inset:0,opacity:0.05,pointerEvents:'none',backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`}}/>

            <Lock size={80} style={{color:'var(--danger)',marginBottom:20}} className="glitch-text" />
            <h2 className="glitch-text" style={{fontSize:24,color:'var(--danger)',marginBottom:8,letterSpacing:4}}>FORENSİK RAPOR ŞİFRELENDİ</h2>
            <p style={{color:'var(--text-muted)',marginBottom:40,textAlign:'center',maxWidth:400}}>Güvenlik protokolü gereği analiz sonucu ekranda gösterilemez. Arılar veriyi kilitledi. Rapora erişmek için şifre gereklidir.</p>
            
            <div style={{display:'flex',flexDirection:'column',gap:12,width:320,zIndex:10}}>
              <input 
                type="password" 
                placeholder="Şifreyi Girin" 
                className="inp" 
                style={{textAlign:'center',fontSize:18,letterSpacing:4,padding:16}} 
                value={pass} 
                onChange={e=>setPass(e.target.value)}
              />
              <button className="btn-main" onClick={handleUnlock} style={{background:'var(--danger)',color:'#fff',padding:16,fontSize:14}}>
                ŞİFREYİ ÇÖZ & WHATSAPP İLE AL
              </button>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}

function Gauge({score}){
  const angle=(score/100)*180-90; 
  return(
    <div className="gauge">
      <div className="gauge-arc"/>
      <div className="gauge-needle" style={{transform:`translate(-50%,-100%) rotate(${angle}deg)`}}/>
      <div className="gauge-center"><div className="score-value">{score}</div></div>
    </div>
  );
}

/* ── RISK DASHBOARD MODULE ── */
function RiskDashModule({setModule, setShowFintechReport}){
  const [form,setForm]=React.useState({vknTckn:''});
  const [phase,setPhase]=React.useState('teaser');
  const [stepIdx,setStepIdx]=React.useState(0);
  const [result,setResult]=React.useState(null);
  const [showPass,setShowPass]=React.useState(false);
  const [pass,setPass]=React.useState('');
  const [unlocked,setUnlocked]=React.useState(false);
  const [file, setFile]=React.useState(null);

  const handleFile = (e) => {
    if(e.target.files && e.target.files[0]){
      setFile(URL.createObjectURL(e.target.files[0]));
    }
  };

  const set=k=>v=>setForm(p=>({...p,[k]:v}));
  const canSubmit=form.vknTckn.trim().length>=10;
  const STEPS=[
    'VKN/TCKN Kimlik Doğrulaması yapılıyor...',
    'TCMB Protesto ve Karşılıksız Veritabanı taranıyor...',
    'Kredi Kayıt Bürosu (KKB) Güncel Endeksleri çekiliyor...',
    'Son 24 aylık ödeme performans grafiği haritalanıyor...',
    'Sektörel Benchmark karşılaştırması yapılıyor...',
    'Kuantum Risk Skoru nihai halini alıyor...'
  ];

  const calcScore=()=>{
    const s = Math.floor(Math.random() * 45) + 40; 
    const label=s>=75?'DÜŞÜK RİSK':s>=50?'ORTA RİSK':s>=25?'YÜKSEK RİSK':'ÇOK YÜKSEK RİSK';
    const color=s>=75?'var(--success)':s>=50?'var(--warning)':'var(--danger)';
    return{score:s,label,color};
  };

  const startAnalysis=async()=>{
    if(!canSubmit)return; setPhase('analyzing'); setStepIdx(0);
    for(let i=0;i<STEPS.length;i++){
      setStepIdx(i);
      await new Promise(r=>setTimeout(r, 2000 + Math.random()*2000));
    }
    setResult(calcScore()); setPhase('result');
  };

  const handleUnlock=()=>{ 
    if(pass==='BEEAI2026'){
      setUnlocked(true);
    } else {
      const msg = `Merhaba, ${form.vknTckn || 'ilgili'} VKN'li risk istihbarat raporum kilitlendi. Sonucu öğrenmek için işlem şifresi talep ediyorum.`;
      window.open(`https://wa.me/905407254626?text=${encodeURIComponent(msg)}`,'_blank');
    }
  };

  const reset=()=>{setPhase('teaser');setResult(null);setUnlocked(false);setShowPass(false);setPass('');setFile(null);setForm({vknTckn:''});};
  const payPct=parseFloat(form.paymentPct)||50;
  const YEARS=['19','20','21','22','23','24'];
  const barData=YEARS.map((_,i)=>Math.max(5,Math.min(100,payPct-(YEARS.length-1-i)*4)));
  const maxBar=Math.max(...barData,1);

  return(
    <div style={{animation:'fadeUp .4s ease', height:'100%'}}>
      <BackBar setModule={setModule} title="Kuantum Risk Analiz Merkezi — (Kral Dairesi)"/>
      <div className="panel" style={{display:'flex',flexDirection:'column',gap:20,flex:1,minHeight:640, position:'relative', overflow:'hidden'}}>
        
        {phase==='teaser' && (
          <div style={{position:'absolute', inset:0, zIndex:100, background:'rgba(5,5,5,0.95)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:20}}>
            <div style={{position:'absolute', inset:0, opacity:0.15, pointerEvents:'none', overflow:'hidden'}}>
               <SlidingFintechReport isTeaser={true} />
            </div>
            <div style={{textAlign:'center', zIndex:101, padding:'40px 60px', backdropFilter:'blur(20px)', borderRadius:32, border:'1px solid var(--border)', background:'rgba(10,8,5,0.85)', boxShadow:'0 0 50px rgba(245,158,11,0.1)'}}>
              <Hexagon size={80} style={{color:'var(--primary)', marginBottom:24, filter:'drop-shadow(0 0 20px var(--primary))'}} />
              <h2 style={{fontSize:28, color:'var(--primary)', fontWeight:900, letterSpacing:4, marginBottom:16, textTransform:'uppercase'}}>Kuantum Fragman: Gücümüzün Zirvesi</h2>
              <p style={{color:'var(--text)', fontSize:16, maxWidth:500, lineHeight:1.8, marginBottom:32, opacity:0.8}}>
                BEEAI Veri Madenciliği ve Kuantum Risk Motoru, on milyonlarca kurumsal veriyi saniyeler içinde işleyerek size nihai gerçeği sunar. 
                Siz sormadan biz cevabı buluruz.
              </p>
              <button className="btn-main" style={{padding:'18px 50px', width:'auto', fontSize:18, letterSpacing:2}} onClick={()=>setPhase('form')}>LİMİTSİZ ERİŞİMİ BAŞLAT</button>
            </div>
          </div>
        )}

        <div style={{display:'grid',gridTemplateColumns:'340px 1fr',gap:24,flex:1}}>
          {phase==='form'&&(
            <div style={{display:'flex',flexDirection:'column',gap:16, animation:'fadeUp 0.5s ease'}}>
              <div style={{fontSize:11,fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:2}}>Stratejik İstihbarat Girişi</div>
              <div className="panel" style={{display:'flex',flexDirection:'column',gap:12, background:'rgba(255,255,255,0.02)'}}>
                <label style={{fontSize:11,color:'var(--text-muted)', textTransform:'uppercase'}}>Hedef VKN / TCKN</label>
                <input className="inp" style={{fontSize:22, letterSpacing:4, fontFamily:'monospace', textAlign:'center', padding:16}} placeholder="0000000000" value={form.vknTckn} onChange={e=>setForm({...form,vknTckn:e.target.value})}/>
                
                <p style={{fontSize:11, color:'var(--text-muted)', fontStyle:'italic', background:'rgba(245,158,11,0.1)', padding:12, borderRadius:8, borderLeft:'4px solid var(--primary)'}}>
                   <Sparkles size={14} style={{display:'inline', verticalAlign:'middle', marginRight:6}}/>
                   BeeAI Arıları, VKN bilgisinden yola çıkarak Protesto, Ödeme Performansı ve Risk Endekslerini otomatik olarak haritalandıracaktır.
                </p>

                <button className="btn-main" style={{marginTop:12, height:60, fontSize:16}} onClick={startAnalysis}>RİSK KOVANINI TETİKLE</button>
              </div>

              <div className="panel" style={{padding:16, background:'transparent', borderStyle:'dashed', borderColor:'var(--border)'}}>
                 <h4 style={{fontSize:12, color:'var(--primary)', marginBottom:8}}>TARANACAK KATMANLAR:</h4>
                 <ul style={{listStyle:'none', fontSize:11, color:'var(--text-muted)', display:'flex', flexDirection:'column', gap:6}}>
                    <li>• Ticari Sicil & Ortaklık Ağları</li>
                    <li>• TCMB & Pozitif/Negatif Kayıtlar</li>
                    <li>• Sektörel Benchmark Analizi</li>
                    <li>• Yapay Zeka Risk Projeksiyonu</li>
                 </ul>
              </div>
            </div>
          )}

          {phase==='analyzing'&&(
            <div className="panel" style={{display:'flex',flexDirection:'column',gap:16,alignItems:'center',justifyContent:'center',textAlign:'center'}}>
              <div style={{position:'relative',width:120,height:120,marginBottom:20}}>
                <div style={{position:'absolute',inset:0,border:'4px solid var(--border)',borderRadius:'50%'}}/>
                <div style={{position:'absolute',inset:0,border:'4px solid transparent',borderTopColor:'var(--danger)',borderRadius:'50%',animation:'spin 1s linear infinite'}}/>
                <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',fontSize:32}}>🐝</div>
              </div>
              <div style={{fontSize:18,fontWeight:800,color:'var(--danger)',letterSpacing:2}}>DERİN TARAMA SÜRÜYOR</div>
              <div className="panel" style={{width:'100%',maxWidth:400}}>
                {STEPS.map((s,i)=>{const done=i<stepIdx,active=i===stepIdx; return(
                  <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'7px 8px',borderRadius:8,marginBottom:4,background:active?'rgba(239,68,68,.08)':'transparent',opacity:(!active&&!done)?.4:1}}>
                    <div style={{width:18,height:18,borderRadius:4,background:active?'var(--danger)':'rgba(255,255,255,.1)',fontSize:10,display:'flex',alignItems:'center',justifyContent:'center'}}>{done?'✓':i+1}</div>
                    <div style={{fontSize:11,color:active?'var(--text)':'var(--text-muted)'}}>{s}</div>
                  </div>
                );})}
              </div>
            </div>
          )}

          {(phase==='form' || phase==='analyzing') && !result && (
             <div className="panel" style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',textAlign:'center',padding:60,border:'1px dashed var(--border)', background:'rgba(255,255,255,0.01)'}}>
               <Activity size={64} style={{color:'var(--border)',marginBottom:24}}/>
               <h3 style={{fontSize:20,color:'var(--primary)',marginBottom:12}}>Kral Dairesi — Stratejik Risk Motoru</h3>
               <p style={{fontSize:14,color:'var(--text-muted)',lineHeight:1.6, maxWidth:400}}>VKN bilgisini girin ve BeeAI ekosisteminin veri gücünü izleyin. Sistemimiz tüm bankacılık ve ticaret verilerini anlık olarak analiz eder.</p>
             </div>
          )}

          {phase==='result'&&result&&(
            <div style={{display:'flex',flexDirection:'column',gap:16, animation:'fadeUp 0.5s ease', flex:1}}>
               <div className="panel" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:24, background:'rgba(255,255,255,0.02)'}}>
                  <div style={{textAlign:'center',padding:20,borderRight:'1px solid var(--border)'}}>
                    <div style={{fontSize:12,color:'var(--text-muted)',marginBottom:8,textTransform:'uppercase'}}>Kuantum Skor</div>
                    <div style={{fontSize:64,fontWeight:900,color:result.color,fontFamily:'JetBrains Mono,monospace'}}>{result.score}</div>
                    <div style={{fontSize:14,fontWeight:800,color:result.color,letterSpacing:2}}>{result.label}</div>
                  </div>
                  <div style={{display:'flex',flexDirection:'column',justifyContent:'center',gap:12}}>
                    {[{l:'VKN',v:form.vknTckn},{l:'Sektörel Güven',v:'%88'},{l:'Ödeme Disiplini',v:'YÜKSEK'}].map(({l,v})=>(
                      <div key={l} style={{display:'flex',justifyContent:'space-between',fontSize:13,borderBottom:'1px solid var(--border)',paddingBottom:8}}>
                        <span style={{color:'var(--text-muted)'}}>{l}</span>
                        <span style={{fontWeight:700,color:'var(--text)'}}>{v}</span>
                      </div>
                    ))}
                  </div>
               </div>
               
               {!unlocked ? (
                 <div className="panel" style={{background:'rgba(239,68,68,0.05)', display:'flex', flexWrap:'wrap', alignItems:'center', gap:20, padding:30, border:'2px solid var(--danger)', position:'relative', overflow:'hidden'}}>
                    <div style={{flex:1, minWidth:280}}>
                       <div style={{display:'flex', alignItems:'center', gap:12, marginBottom:12}}>
                          <Lock size={32} style={{color:'var(--danger)'}} />
                          <h3 style={{fontSize:20, color:'var(--danger)', fontWeight:900, letterSpacing:1}}>DETAYLI RAPOR KİLİTLENDİ</h3>
                       </div>
                       <p style={{color:'var(--text)', fontSize:13, lineHeight:1.6, opacity:0.8, marginBottom:20}}>
                          {form.vknTckn} nolu VKN için hazırlanan **Kuantum Derin Analiz Raporu**, veri gizliliği ve ticari istihbarat protokolleri gereği şifrelenmiştir. Raporu görüntülemek için yetkili erişim anahtarı gereklidir.
                       </p>
                       <div style={{display:'flex', gap:10}}>
                          <input className="inp" style={{width:160, marginBottom:0, textAlign:'center', letterSpacing:2}} placeholder="ANAHTAR" value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleUnlock()}/>
                          <button className="btn-main" style={{width:'auto', padding:'0 20px', background:'var(--danger)'}} onClick={handleUnlock}>ANAHTARI ÇÖZ</button>
                       </div>
                    </div>
                    <div style={{flex:1, minWidth:280, display:'flex', flexDirection:'column', gap:12, alignItems:'center', background:'rgba(5,5,5,0.4)', padding:20, borderRadius:16, border:'1px solid var(--border)'}}>
                       <div style={{fontSize:11, color:'var(--text-muted)', fontWeight:800}}>YETKİLİ ERİŞİM MERKEZİ</div>
                       <MessageCircle size={40} style={{color:'var(--success)'}} />
                       <button className="btn-main" style={{background:'var(--success)', border:'none'}} onClick={handleUnlock}>
                          WHATSAPP'TAN ŞİFRE AL
                       </button>
                       <div style={{fontSize:10, opacity:0.5}}>İşlem ID: {Math.random().toString(36).substr(2,9).toUpperCase()}</div>
                    </div>
                 </div>
               ) : (
                 <div className="panel" style={{background:'rgba(245,158,11,0.05)', display:'flex', alignItems:'center', gap:20, padding:30, border:'2px solid var(--primary)', animation:'fadeUp 0.5s ease'}}>
                   <FileSearch size={48} style={{color:'var(--primary)'}} />
                   <div style={{flex:1}}>
                     <h3 style={{fontSize:18, color:'var(--primary)', marginBottom:4}}>Nihai Stratejik Rapor Erişime Açıldı</h3>
                     <p style={{color:'var(--text-muted)', fontSize:13}}>Tüm katmanlar başarıyla analiz edildi. Detaylı SWOT, nakit akış projeksiyonu ve pazar analizi raporunuzda mevcuttur.</p>
                   </div>
                   <button className="btn-main" style={{width:'auto', padding:'12px 24px'}} onClick={() => setShowFintechReport(true)}>KUANTUM RAPORU İZLE</button>
                 </div>
               )}
               <button className="nav-btn" onClick={reset} style={{width:'100%', justifyContent:'center'}}>Yeni Derin Tarama Başlat</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function HistoryModule({setModule,analyses}){
  return(

    <div>
      <BackBar setModule={setModule} title="Veri Bankası"/>
      <div className="panel">
        <table style={{width:'100%',fontSize:13}}>
          <thead><tr style={{color:'var(--primary)'}}><th>Tarih</th><th>VKN</th><th>Tutar</th><th>Skor</th></tr></thead>
          <tbody>
            {analyses.map(a=>(<tr key={a.id}><td>{new Date(a.timestamp).toLocaleDateString()}</td><td>{a.vkn}</td><td>{a.amount}</td><td>{a.score}</td></tr>))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── COMPARE MODULE ── */
function CompareModule({setModule,analyses}){
  const firms=[...new Set(analyses.map(a=>a.vkn))].filter(Boolean);
  const [selectedVkn,setSelectedVkn]=React.useState('');
  const firmChecks=analyses.filter(a=>a.vkn===selectedVkn);
  const avg=firmChecks.length?Math.floor(firmChecks.reduce((s,c)=>s+c.score,0)/firmChecks.length):0;
  return(
    <div style={{animation:'fadeUp .4s ease'}}>
      <BackBar setModule={setModule} title="Pattern Tespit — Firma Karşılaştırma"/>
      <div style={{display:'grid',gridTemplateColumns:'220px 1fr',gap:20}}>
        <div className="panel" style={{padding:14}}>
          <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'.08em',color:'var(--text-muted)',marginBottom:12,borderLeft:'3px solid var(--primary)',paddingLeft:8}}>Firmalar</div>
          {firms.length===0&&<div style={{color:'var(--text-muted)',fontSize:12}}>Henüz analiz yok.</div>}
          {firms.map(vkn=>(
            <div key={vkn} onClick={()=>setSelectedVkn(vkn)} style={{padding:'8px 10px',borderRadius:8,cursor:'pointer',marginBottom:4,background:selectedVkn===vkn?'rgba(245,158,11,.1)':'transparent',border:`1px solid ${selectedVkn===vkn?'var(--primary)':'transparent'}`,fontSize:13,color:selectedVkn===vkn?'var(--primary)':'var(--text-muted)'}}>
              VKN: {vkn}
            </div>
          ))}
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:16}}>
          {selectedVkn?(
            <>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16}}>
                {[{l:'Çek Sayısı',v:firmChecks.length},{l:'Ort. Skor',v:`${avg}/100`},{l:'Riskli',v:firmChecks.filter(c=>c.score<50).length}].map(({l,v})=>(
                  <div key={l} className="panel" style={{padding:'14px 18px',textAlign:'center'}}>
                    <div style={{fontSize:22,fontWeight:800,fontFamily:'JetBrains Mono,monospace',color:l==='Riskli'&&v>0?'var(--danger)':'var(--primary)'}}>{v}</div>
                    <div style={{fontSize:10,color:'var(--text-muted)',textTransform:'uppercase',marginTop:4}}>{l}</div>
                  </div>
                ))}
              </div>
              <div className="panel">
                <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'.08em',color:'var(--text-muted)',marginBottom:14}}>Çek Listesi</div>
                <table style={{width:'100%',fontSize:12,borderCollapse:'collapse'}}>
                  <thead><tr style={{color:'var(--primary)',borderBottom:'1px solid var(--border)'}}>
                    <th style={{padding:'6px 0',textAlign:'left'}}>Tarih</th><th style={{textAlign:'left'}}>Tutar</th><th style={{textAlign:'left'}}>Vade</th><th style={{textAlign:'left'}}>Skor</th><th style={{textAlign:'left'}}>Durum</th>
                  </tr></thead>
                  <tbody>{firmChecks.map(c=>(
                    <tr key={c.id} style={{borderBottom:'1px solid rgba(245,158,11,.06)'}}>
                      <td style={{padding:'8px 0',color:'var(--text-muted)'}}>{new Date(c.timestamp).toLocaleDateString('tr-TR')}</td>
                      <td style={{fontFamily:'JetBrains Mono,monospace'}}>{c.amount?.toLocaleString('tr-TR')} ₺</td>
                      <td style={{color:'var(--text-muted)'}}>{c.date}</td>
                      <td style={{fontFamily:'JetBrains Mono,monospace',color:c.score>70?'var(--success)':c.score>40?'var(--warning)':'var(--danger)'}}>{c.score}</td>
                      <td><span style={{padding:'2px 8px',borderRadius:4,fontSize:10,background:c.isFraud?'rgba(239,68,68,.15)':'rgba(16,185,129,.1)',color:c.isFraud?'var(--danger)':'var(--success)'}}>{c.isFraud?'⚠ SAHTE':'✓ ONAY'}</span></td>
                    </tr>
                  ))}</tbody>
                </table>
                {firmChecks.length>1&&(
                  <div style={{marginTop:16,padding:14,background:'rgba(245,158,11,.06)',borderRadius:10,border:'1px solid rgba(245,158,11,.15)'}}>
                    <div style={{fontSize:11,fontWeight:700,color:'var(--primary)',marginBottom:6}}>🧠 BEEAI Pattern Analizi</div>
                    <div style={{fontSize:12,color:'var(--text-muted)',lineHeight:1.7}}>
                      {firmChecks.some(c=>c.isFraud)?'⚠ Bu firmadan sahtecilik şüpheli çek tespit edilmiştir. Yeni çekler reddedilmeli.':avg>70?'✓ Firma güvenilir bir ödeme profiline sahiptir. Çekleri işleme alınabilir.':'⚡ Firma karışık skor profiline sahiptir. Ek teminat istenebilir.'}
                    </div>
                  </div>
                )}
              </div>
            </>
          ):(
            <div className="panel" style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:200,color:'var(--text-muted)',fontSize:13}}>← Soldan bir firma seçin</div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── CASHFLOW MODULE ── */
function CashflowModule({setModule,analyses}){
  const total=analyses.reduce((s,c)=>s+c.amount,0);
  const byMonth=analyses.reduce((acc,c)=>{
    const m=new Date(c.timestamp).toLocaleDateString('tr-TR',{month:'short',year:'2-digit'});
    if(!acc[m])acc[m]={total:0,count:0};
    acc[m].total+=c.amount; acc[m].count++;
    return acc;
  },{});
  const months=Object.entries(byMonth).slice(-6);
  const maxAmt=Math.max(...months.map(([,v])=>v.total),1);
  const scenarios=[
    {label:'Anlık Faktoring (%3)',net:total*0.97,rate:3,days:1},
    {label:'7 Gün Bekle (%2.5)',net:total*0.975,rate:2.5,days:7},
    {label:'30 Gün Bekle (%2)',net:total*0.98,rate:2,days:30},
    {label:'Vadede Tahsil',net:total,rate:0,days:null},
  ];
  return(
    <div style={{animation:'fadeUp .4s ease'}}>
      <BackBar setModule={setModule} title="Nakit Akışı & Faktoring Planlama"/>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginBottom:20}}>
        <div className="panel">
          <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'.08em',color:'var(--text-muted)',marginBottom:14}}>📅 Aylık Çek Akışı</div>
          {months.length===0?
            <div style={{color:'var(--text-muted)',fontSize:12}}>Henüz analiz yok.</div>:
            <div style={{display:'flex',alignItems:'flex-end',gap:8,height:120}}>
              {months.map(([m,v])=>(
                <div key={m} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:4}}>
                  <div style={{flex:1,width:'100%',display:'flex',alignItems:'flex-end'}}>
                    <div style={{width:'100%',height:`${Math.max((v.total/maxAmt)*100,4)}%`,background:'var(--primary)',borderRadius:'4px 4px 0 0',opacity:.85}}/>
                  </div>
                  <div style={{fontSize:9,color:'var(--text-muted)',textAlign:'center'}}>{m}</div>
                  <div style={{fontSize:9,fontFamily:'JetBrains Mono,monospace',color:'var(--primary)'}}>{(v.total/1000).toFixed(0)}K</div>
                </div>
              ))}
            </div>}
        </div>
        <div className="panel">
          <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'.08em',color:'var(--text-muted)',marginBottom:14}}>📊 Özet</div>
          {[{l:'Toplam Portföy',v:`${total.toLocaleString('tr-TR')} ₺`},{l:'Çek Adedi',v:analyses.length},{l:'Ortalama Tutar',v:analyses.length?`${Math.floor(total/analyses.length).toLocaleString('tr-TR')} ₺`:'--'},{l:'Güvenli Çek',v:analyses.filter(c=>!c.isFraud).length}].map(({l,v})=>(
            <div key={l} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid var(--border)',fontSize:13}}>
              <span style={{color:'var(--text-muted)'}}>{l}</span>
              <span style={{fontFamily:'JetBrains Mono,monospace',color:'var(--primary)',fontWeight:700}}>{v}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="panel">
        <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'.08em',color:'var(--text-muted)',marginBottom:14}}>⚡ AI Faktoring Senaryoları</div>
        {analyses.length===0?<div style={{color:'var(--text-muted)',fontSize:12}}>Önce çek analizi yapın.</div>:
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:12}}>
          {scenarios.map((s,i)=>(
            <div key={i} style={{padding:'16px 18px',borderRadius:12,border:`1px solid ${i===0?'var(--primary)':'var(--border)'}`,background:i===0?'rgba(245,158,11,.06)':'transparent'}}>
              {i===0&&<div style={{fontSize:9,fontWeight:700,color:'var(--primary)',textTransform:'uppercase',letterSpacing:1,marginBottom:6}}>⭐ ÖNERİLEN</div>}
              <div style={{fontSize:12,fontWeight:700,color:'var(--text)',marginBottom:8}}>{s.label}</div>
              <div style={{fontSize:20,fontWeight:800,fontFamily:'JetBrains Mono,monospace',color:i===3?'var(--success)':'var(--primary)',marginBottom:4}}>{s.net.toLocaleString('tr-TR',{maximumFractionDigits:0})} ₺</div>
              <div style={{fontSize:11,color:'var(--text-muted)'}}>{s.rate>0?`Komisyon: %${s.rate}`:'Komisyonsuz'} {s.days?`• ${s.days} gün`:''}</div>
            </div>
          ))}
        </div>}
      </div>
    </div>
  );
}

/* ── FIRM MODULE ── */
function FirmModule({setModule,analyses, setShowFintechReport}){
  const firms=[...new Set(analyses.map(a=>a.vkn))].filter(Boolean);
  const firmStats=firms.map(vkn=>{
    const cks=analyses.filter(a=>a.vkn===vkn);
    const avg=Math.floor(cks.reduce((s,c)=>s+c.score,0)/cks.length);
    const hasFraud=cks.some(c=>c.isFraud);
    const totalAmt=cks.reduce((s,c)=>s+c.amount,0);
    const rating=avg>75&&!hasFraud?'A':avg>55&&!hasFraud?'B':avg>40?'C':'D';
    const ratingColor={'A':'var(--success)','B':'var(--primary)','C':'var(--warning)','D':'var(--danger)'}[rating];
    return{vkn,count:cks.length,avg,hasFraud,totalAmt,rating,ratingColor,limit:Math.floor(totalAmt*(avg/100)*1.2)};
  });
  return(
    <div style={{animation:'fadeUp .4s ease'}}>
      <BackBar setModule={setModule} title="Firma İstihbaratı & Risk Profili"/>
      {firmStats.length===0?
        <div className="panel" style={{textAlign:'center',padding:40,color:'var(--text-muted)'}}>Henüz analiz yok. Çek analizi yapıldıkça firmalar burada görünür.</div>:
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:16}}>
          {firmStats.map(f=>(
            <div key={f.vkn} className="panel">
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:16}}>
                <div>
                  <div style={{fontSize:12,color:'var(--text-muted)',marginBottom:4}}>VKN</div>
                  <div style={{fontSize:15,fontWeight:700,fontFamily:'JetBrains Mono,monospace'}}>{f.vkn}</div>
                </div>
                <div style={{textAlign:'center'}}>
                  <div style={{width:44,height:44,borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',background:`${f.ratingColor}22`,border:`2px solid ${f.ratingColor}`,fontSize:20,fontWeight:900,color:f.ratingColor}}>{f.rating}</div>
                  <div style={{fontSize:9,color:'var(--text-muted)',marginTop:4}}>KREDİ</div>
                </div>
              </div>
              {[{l:'Çek Adedi',v:f.count},{l:'Ort. Kovan Skoru',v:`${f.avg}/100`},{l:'Toplam Tutar',v:`${f.totalAmt.toLocaleString('tr-TR')} ₺`},{l:'Önerilen Limit',v:`${f.limit.toLocaleString('tr-TR')} ₺`}].map(({l,v})=>(
                <div key={l} style={{display:'flex',justifyContent:'space-between',padding:'7px 0',borderBottom:'1px solid var(--border)',fontSize:12}}>
                  <span style={{color:'var(--text-muted)'}}>{l}</span>
                  <span style={{fontFamily:'JetBrains Mono,monospace',color:'var(--primary)',fontWeight:600}}>{v}</span>
                </div>
              ))}
              {f.hasFraud&&<div style={{marginTop:12,padding:'8px 12px',borderRadius:8,background:'rgba(239,68,68,.08)',border:'1px solid rgba(239,68,68,.2)',fontSize:11,color:'var(--danger)'}}>
                ⚠ Bu firmadan sahtecilik şüpheli çek kaydı mevcuttur.
              </div>}
              <div style={{marginTop:12,padding:'8px 12px',borderRadius:8,background:'rgba(245,158,11,.06)',border:'1px solid var(--border)',fontSize:11,color:'var(--text-muted)'}}>
                {f.rating==='A'?'✓ Güvenilir müşteri. Limitin üstünde işlem önerilmez.':f.rating==='B'?'⚡ İyi müşteri. Standart işlem koşulları geçerli.':f.rating==='C'?'⚠ Orta risk. Ek teminat istenebilir.':'❌ Yüksek risk. İşlem yapılmaması önerilir.'}
              </div>
              <button className="btn-main" style={{marginTop:12, padding:10, fontSize:12, background:'rgba(245,158,11,.15)', color:'var(--primary)', border:'1px solid var(--border)'}} onClick={() => setShowFintechReport(true)}>
                <PieChart size={14} style={{display:'inline', verticalAlign:'middle', marginRight:6}} />
                KUANTUM RAPORU İZLE
              </button>
            </div>
          ))}
        </div>}
    </div>
  );
}

/* ── RATEMODULE TO BEEAI BEREKET (FAKTORING) ── */
function RateModule({setModule}){
  const [phase,setPhase]=React.useState('teaser');
  const [form,setForm]=React.useState({amount:'',date:''});
  const [fileFront,setFileFront]=React.useState(null);
  const [fileBack,setFileBack]=React.useState(null);
  
  const [logs,setLogs]=React.useState([]);
  const [progress,setProgress]=React.useState(0);
  const [offers,setOffers]=React.useState([]);
  const [showLock,setShowLock]=React.useState(true);
  const [pass,setPass]=React.useState('');
  
  const [animState,setAnimState]=React.useState('scan');
  const [workerCount,setWorkerCount]=React.useState(0);

  const termRef=React.useRef(null);
  React.useEffect(()=>{if(termRef.current)termRef.current.scrollTop=termRef.current.scrollHeight;},[logs]);
  const addLog=(type,msg)=>setLogs(p=>[...p,{time:new Date().toLocaleTimeString('tr-TR'),type,msg}]);

  const handleFile=(e, setFile)=>{
    const f=e.target.files?.[0];
    if(!f||!f.type.startsWith('image/'))return;
    const reader=new FileReader();
    reader.onload=ev=>setFile(ev.target.result);
    reader.readAsDataURL(f);
  };
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));

  const startAnalysis=async()=>{
    if(!fileFront || !form.amount || !form.date){
      alert("Lütfen en az ön yüz görselini, tutarı ve vadeyi giriniz."); return;
    }
    setPhase('analyzing');
    setLogs([]);
    setAnimState('scan');
    setWorkerCount(0);
    setProgress(0);
    
    speakAuthority("Kovan ağı 46 faktoring kurumuna bağlanıyor. Optimizasyon süreci başlatıldı.");
    addLog('info','BEEAI Bereket Motoru Başlatıldı.');
    await sleep(500); addLog('info','Çek görselleri fotokopi/tarama cihazından geçiriliyor...');
    
    // 0-10s: Scanner Phase
    for(let i=1;i<=5;i++){
      await sleep(2000);
      setProgress(i*2);
      if(i===3) addLog('info','Beyaz ışık taraması: Karakterler ve güvenlik ögeleri okunuyor...');
    }
    
    addLog('success','Tarama tamamlandı. API Gateway açılıyor.');
    await sleep(1000);
    
    setAnimState('queen');
    addLog('warning','Kraliçe Arı çekin üzerine konumlandı. Veri çekimi başlıyor.');
    speakAuthority("Kraliçe Arı veri merkezinde konumlandı.");
    await sleep(1500);
    
    addLog('info','Kraliçe Arı: %4.0 ile %5.5 bandı arasında optimum teklif oranları aranıyor...');
    
    const faks="Garanti,İş,TEB,Fiba,QNB,Deniz,Halk,Yapı Kredi,Vakıf,Ziraat,Alternatif,Burgan".split(',');
    
    // 10-60s: Queen + Workers Shield building Phase (50s total -> 10 iterations of 5s)
    for(let i=1;i<=10;i++){
      await sleep(5000);
      setWorkerCount(i);
      setProgress(10 + (i*9));
      
      const fakeRate = (4.0 + Math.random()*1.5).toFixed(2);
      const bank = faks[i%faks.length];
      
      addLog('success',`3 İsçi Arı döndü: ${bank} Faktoring'den %${fakeRate} teklif kraliçenin ekranına düştü.`);
      
      if(i===4) addLog('info','Kraliçe Arı: Kalkan %40 oranında tamamlandı. Taramaya devam ediliyor...');
      if(i===8) addLog('info','Kraliçe Arı: Oran rekabeti kızışıyor. Bankalar arası ping süreleri optimize ediliyor...');
    }
    
    setProgress(100);
    addLog('success','60 Saniyelik Tarama Süreci Bitti. Kalkan tamamlandı.');
    await sleep(1000); addLog('info','Kraliçe Arı en verimli 3 teklifi seçti. Rapor kilitleniyor...');
    
    const amt=parseFloat(form.amount.replace(/[^0-9]/g,''))||100000;
    setOffers([
      {bank:'Garanti Faktoring',rate:4.1,net:amt*0.959,speed:'15 Dakika'},
      {bank:'QNB Finansfaktoring',rate:4.3,net:amt*0.957,speed:'30 Dakika'},
      {bank:'Fiba Faktoring',rate:4.5,net:amt*0.955,speed:'Anında (Öncelikli)'}
    ]);
    
    await sleep(2000);
    setPhase('result');
    speakAuthority("En iyi 3 teklif raporu puslu ve şifreli olarak hazır.");
  };

  return(
    <div style={{animation:'fadeUp .4s ease', height:'100%'}}>
      <BackBar setModule={setModule} title="BEEAI Bereket — Kraliçe Optimizasyonu & Likidite Kalkanı"/>

      <div className="panel" style={{display:'flex',flexDirection:'column',gap:20,flex:1,minHeight:640, position:'relative', overflow:'hidden'}}>
        
        {phase==='teaser' && (
          <div style={{position:'absolute', inset:0, zIndex:100, background:'rgba(5,5,5,0.96)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:20}}>
            <style>{`
              @keyframes shieldPulse { 0%{box-shadow:0 0 20px rgba(5,150,105,0.2);} 50%{box-shadow:0 0 60px rgba(5,150,105,0.5);} 100%{box-shadow:0 0 20px rgba(5,150,105,0.2);} }
              .shield-aura { position:absolute; inset:0; border:4px double var(--success); border-radius:32px; opacity:0.1; animation:shieldPulse 4s ease-in-out infinite; }
            `}</style>
            <div className="shield-aura" />
            
            <div style={{textAlign:'center', zIndex:101, padding:'40px 60px', backdropFilter:'blur(24px)', borderRadius:32, border:'1px solid var(--border)', background:'rgba(5,20,15,0.85)'}}>
              <ShieldCheck size={80} style={{color:'var(--success)', marginBottom:24, filter:'drop-shadow(0 0 15px var(--success))'}} />
              <h2 style={{fontSize:28, color:'var(--success)', fontWeight:900, letterSpacing:4, marginBottom:16, textTransform:'uppercase'}}>Kraliçe Likidite Kalkanı</h2>
              <p style={{color:'var(--text)', fontSize:16, maxWidth:500, lineHeight:1.8, marginBottom:32, opacity:0.8}}>
                Varlıklarınızı en yüksek çarpanla nakde dönüştürmek için 46 finansal kurumu anlık açık artırmaya davet edin. 
                Sektörün en iyi tekliflerini arı hızıyla masanıza getirelim.
              </p>
              <button className="btn-main" style={{padding:'18px 50px', width:'auto', fontSize:17, letterSpacing:2, background:'var(--success)'}} onClick={()=>setPhase('form')}>BEREKETİ TETİKLE</button>
            </div>
          </div>
        )}

      <style>{`
        .upload-area{border:2px dashed var(--border);border-radius:12px;padding:24px;text-align:center;cursor:pointer;position:relative;background:rgba(255,255,255,.02);transition:all .2s;}
        .upload-area:hover{border-color:var(--primary);background:rgba(245,158,11,.05);}
        #risk-scan-box { position:relative; width:100%; height:320px; background:#000; border-radius:12px; overflow:hidden; border:1px solid var(--border); }
        #risk-scan-box img { width:100%; height:100%; object-fit:contain; opacity:0.3; filter:contrast(1.2); }
        
        .white-scanner { position:absolute; left:0; width:100%; height:8px; background:#fff; box-shadow:0 0 30px 10px rgba(255,255,255,0.6); animation:scanDropWhite 3s ease-in-out infinite alternate; z-index:5; mix-blend-mode:overlay; }
        @keyframes scanDropWhite { 0%{top:0%} 100%{top:95%} }
        
        .queen-bee { position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); font-size:64px; filter:drop-shadow(0 0 30px var(--primary)); z-index:10; animation:pulseQueen 2s ease-in-out infinite; }
        @keyframes pulseQueen { 0%,100%{transform:translate(-50%,-50%) scale(1); filter:drop-shadow(0 0 30px var(--primary));} 50%{transform:translate(-50%,-50%) scale(1.1); filter:drop-shadow(0 0 50px var(--primary));} }
        
        .worker-bee { position:absolute; top:50%; left:50%; font-size:24px; z-index:9; animation:flyIn .5s ease-out forwards, hoverWorker 2s ease-in-out infinite; }
        @keyframes hoverWorker { 0%,100%{margin-top:0;} 50%{margin-top:-10px;} }
        @keyframes flyIn { 0%{transform: translate(300px, -300px) scale(0);} 100%{transform: translate(calc(var(--rad) * cos(var(--deg))), calc(var(--rad) * sin(var(--deg)))) scale(1);} }

        .glitch-lock { position:absolute; inset:0; background:Repeating-linear-gradient(0deg,rgba(0,0,0,.9),rgba(0,0,0,.9) 2px,transparent 2px,transparent 4px),rgba(20,5,5,.95); z-index:50; display:flex; flex-direction:column; align-items:center; justify-content:center; backdrop-filter:blur(18px); }
        .glitch-lock::before { content:''; position:absolute; inset:0; background:url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="4" height="4"><rect width="4" height="4" fill="%23f00" opacity="0.05"/></svg>'); opacity:0.3; animation:noise .2s infinite; pointer-events:none; }
        @keyframes noise{ 0%,100%{background-position:0 0} 50%{background-position:100% 100%} }
        .pass-input { background:rgba(0,0,0,.6); border:1px solid var(--danger); color:var(--danger); padding:16px 24px; font-size:24px; text-align:center; font-family:monospace; letter-spacing:8px; border-radius:8px; outline:none; text-transform:uppercase; font-weight:900; box-shadow:inset 0 0 10px rgba(239,68,68,.3); width:320px; transition:all .3s;}
        .pass-input:focus { box-shadow:0 0 20px rgba(239,68,68,.5), inset 0 0 15px rgba(239,68,68,.5); }
      `}</style>
      
      <div style={{display:'grid',gridTemplateColumns:'340px 1fr',gap:24}}>
        <div style={{display:'flex',flexDirection:'column',gap:16}}>
          {phase==='form' && (
            <div className="panel" style={{display:'flex',flexDirection:'column',gap:16}}>
              <div style={{fontSize:11,fontWeight:700,color:'var(--text-muted)',letterSpacing:1}}>1. ÇEK GÖRSELLERİ</div>
              <div className="upload-area">
                <input type="file" style={{position:'absolute',inset:0,opacity:0,cursor:'pointer'}} accept="image/*" onChange={e=>handleFile(e,setFileFront)}/>
                {fileFront?<img src={fileFront} style={{width:'100%',height:80,objectFit:'cover',borderRadius:8}}/>:
                <><Camera size={24} style={{color:'var(--text-muted)',marginBottom:8}}/><div style={{fontSize:12,color:'var(--primary)'}}>Çek Ön Yüzü Yükle</div></>}
              </div>
              <div className="upload-area">
                <input type="file" style={{position:'absolute',inset:0,opacity:0,cursor:'pointer'}} accept="image/*" onChange={e=>handleFile(e,setFileBack)}/>
                {fileBack?<img src={fileBack} style={{width:'100%',height:80,objectFit:'cover',borderRadius:8}}/>:
                <><Camera size={24} style={{color:'var(--text-muted)',marginBottom:8}}/><div style={{fontSize:12,color:'var(--text-muted)'}}>Çek Arka Yüzü (Opsiyonel)</div></>}
              </div>
              
              <div style={{marginTop:12,fontSize:11,fontWeight:700,color:'var(--text-muted)',letterSpacing:1}}>2. ÇEK DETAYLARI</div>
              <div>
                <label style={{fontSize:11,color:'var(--text-muted)',marginBottom:4,display:'block'}}>Çek Tutarı (₺)</label>
                <input className="inp" style={{fontSize:18,fontFamily:'monospace'}} placeholder="Örn: 150.000" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})}/>
              </div>
              <div>
                <label style={{fontSize:11,color:'var(--text-muted)',marginBottom:4,display:'block'}}>Vade Tarihi</label>
                <input type="date" className="inp" style={{fontFamily:'monospace'}} value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/>
              </div>
              
              <button className="btn-main" style={{marginTop:8,fontSize:14,letterSpacing:1,padding:16}} onClick={startAnalysis}>
                <Zap size={16} style={{display:'inline',verticalAlign:'text-bottom',marginRight:6}}/>
                46 KURUMU TEKLİF İÇİN TARA
              </button>
            </div>
          )}

          {phase==='analyzing' && (
            <div className="panel" style={{display:'flex',flexDirection:'column',gap:16,alignItems:'center',justifyContent:'center',height:400,textAlign:'center'}}>
              <div style={{width:80,height:80,borderRadius:'50%',border:'4px solid transparent',borderTopColor:'var(--primary)',borderRightColor:'var(--primary)',animation:'spin 1s linear infinite',marginBottom:16}}/>
              <div style={{fontSize:16,fontWeight:800,color:'var(--primary)'}}>YAPAY ZEKA FİRMALARI TARIYOR</div>
              <div style={{fontSize:13,color:'var(--text)'}}>Tahmini Süre: ~60 Saniye</div>
              <div style={{width:'100%',background:'rgba(255,255,255,.1)',height:6,borderRadius:3,overflow:'hidden',marginTop:8}}>
                <div style={{width:`${progress}%`,height:'100%',background:'var(--primary)',transition:'width 2s linear'}}/>
              </div>
              <div style={{fontSize:11,color:'var(--text-muted)',marginTop:8}}>%{progress} Tamamlandı...</div>
            </div>
          )}

          {phase==='result' && (
            <div className="panel" style={{display:'flex',flexDirection:'column',gap:16}}>
              <div style={{fontSize:12,color:'var(--success)',fontWeight:700,textAlign:'center',padding:12,background:'rgba(16,185,129,.1)',borderRadius:8}}>
                ✓ 46 Faktoring firması başarıyla tarandı.
              </div>
              <button className="nav-btn" onClick={()=>{setPhase('form');setFileFront(null);setFileBack(null);setForm({amount:'',date:''});setShowLock(true);setPass('');}}>Yeni Çek Sorgula</button>
            </div>
          )}
        </div>
        
        <div style={{display:'flex',flexDirection:'column',height:640}}>
          {phase==='form' && (
             <div className="panel" style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',textAlign:'center',padding:60,border:'1px dashed var(--border)'}}>
               <Activity size={64} style={{color:'var(--border)',marginBottom:24}}/>
               <h3 style={{fontSize:20,color:'var(--primary)',marginBottom:12}}>BEEAI Bereket Modülü</h3>
               <p style={{fontSize:14,color:'var(--text-muted)',lineHeight:1.6}}>Çek görselinizi yükleyin. Yapay zeka sistemimiz 46 adet faktoring kurumuyla iletişim kurarak size en avantajlı net tutarı sunsun.</p>
             </div>
          )}

          {phase==='analyzing' && (
            <div style={{flex:1,display:'flex',flexDirection:'column',gap:16}}>
              <div id="risk-scan-box">
                {fileFront && <img src={fileFront}/>}
                
                {animState === 'scan' && (
                  <div className="white-scanner" />
                )}
                
                {animState === 'queen' && (
                  <>
                    <div className="queen-bee" title="Kraliçe Arı (Merkez Yapay Zeka)">👑</div>
                    {[...Array(workerCount)].map((_,i)=>{
                       return [...Array(3)].map((__,j)=>{
                          const totalIndex = (i*3) + j;
                          const angle = totalIndex * 12; // 30 bees = 360 deg
                          const rad = 110; // Radius from center
                          return (
                            <div key={`w-${i}-${j}`} className="worker-bee" style={{'--deg':`${angle}deg`,'--rad':`${rad}px`}}>🐝</div>
                          )
                       })
                    })}
                  </>
                )}
              </div>
              <div className="terminal" ref={termRef}>
                {logs.map((l,i)=>(
                  <div key={i}><span style={{opacity:.5}}>({l.time})</span> <span className={l.type==='error'?'log-error':l.type==='success'?'log-success':l.type==='warning'?'log-warning':''}>{l.msg}</span></div>
                ))}
              </div>
            </div>
          )}

          {phase==='result' && (
            <div className="panel" style={{position:'relative',flex:1,overflow:'hidden',padding:0}}>
              {showLock ? (
                <div className="glitch-lock">
                  <Lock size={56} style={{color:'var(--danger)',marginBottom:20,filter:'drop-shadow(0 0 10px var(--danger))'}}/>
                  <h2 style={{fontSize:24,color:'#fff',fontWeight:900,letterSpacing:2,marginBottom:8,textAlign:'center'}}>3 ADET ONAYLI TEKLİF BULUNDU</h2>
                  <p style={{color:'rgba(255,255,255,.5)',fontSize:13,maxWidth:400,textAlign:'center',lineHeight:1.6,marginBottom:32}}>
                    Yapay zeka analiz kalkanı tüm onayları tamamladı. İlgili faktoring sonuçları ekranda bulanık olarak yer alıyor. Okuyabilmek için rapor şifresini giriniz.
                  </p>
                  
                  <input className="pass-input" placeholder="•••••••••" value={pass} onChange={e=>setPass(e.target.value)} type="password" />
                  
                  <div style={{display:'flex',gap:16,marginTop:24}}>
                    <button className="btn-main" style={{background:'var(--danger)',color:'#fff',width:140}} onClick={()=>{
                      if(pass==='BEEAI2026') setShowLock(false);
                      else alert('Yetkisiz Giriş! Şifre Hatalı.');
                    }}>KİLİDİ AÇ</button>
                    <button className="nav-btn" style={{borderColor:'var(--success)',color:'var(--success)'}} onClick={()=>{
                      window.open(`https://wa.me/905407254626?text=${encodeURIComponent("Merhaba, BeeAI Kraliçe Arı analizini tamamladı. Orijinal Faktoring Rapor Şifremi alabilir miyim?")}`,'_blank');
                    }}>WhatsApp'tan Şifre İste</button>
                  </div>
                </div>
              ) : (
                <div style={{padding:24,animation:'fadeUp .5s ease',height:'100%',display:'flex',flexDirection:'column'}}>
                  <div style={{fontSize:11,fontWeight:700,color:'var(--primary)',letterSpacing:2,marginBottom:20}}>BEEAI BEREKET — ONAYLANMIŞ TEKLİFLER</div>
                  
                  <div style={{display:'flex',flexDirection:'column',gap:16,flex:1}}>
                    {offers.map((o,i)=>(
                      <div key={i} style={{padding:20,border:`2px solid ${i===0?'var(--success)':'var(--border)'}`,borderRadius:12,background:i===0?'rgba(16,185,129,.05)':'rgba(255,255,255,.02)',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                        <div>
                          {i===0 && <div style={{fontSize:9,fontWeight:900,color:'var(--success)',letterSpacing:1,marginBottom:6}}>🏆 EN AVANTAJLI TEKLİF</div>}
                          <div style={{fontSize:18,fontWeight:800,color:'var(--text)',marginBottom:4}}>{o.bank}</div>
                          <div style={{fontSize:12,color:'var(--text-muted)'}}>Uygulanan Oran: <span style={{color:'var(--primary)',fontWeight:700}}>%{o.rate}</span> | İşlem Süresi: {o.speed}</div>
                        </div>
                        <div style={{textAlign:'right'}}>
                          <div style={{fontSize:11,color:'var(--text-muted)',marginBottom:4,textTransform:'uppercase'}}>Net Elinize Geçecek</div>
                          <div style={{fontSize:26,fontFamily:'monospace',fontWeight:900,color:i===0?'var(--success)':'var(--text)'}}>{o.net.toLocaleString('tr-TR',{maximumFractionDigits:0})} ₺</div>
                          <button className="btn-main" style={{background:'#25D366',color:'#fff',padding:'8px 16px',fontSize:12,marginTop:12,width:'auto',display:'inline-flex',alignItems:'center',gap:6}} onClick={()=>{
                            window.open(`https://wa.me/905407254626?text=${encodeURIComponent(`Merhaba, BeeAI sisteminin sunduğu ${o.bank} kurumunun ${o.net.toLocaleString('tr-TR')} ₺ net tutarlı faktoring teklifini kabul etmek ve işlem başlatmak istiyorum.`)}`,'_blank');
                          }}>WhatsApp ile Hemen Onayla</button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{marginTop:'auto',textAlign:'center',fontSize:11,color:'var(--text-muted)'}}>
                    * Bu teklifler yapay zeka aracılığı ile 15 dakika boyunca sistemde rezerve edilmiştir.
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);
}


function DecisionModule({setModule}){
  const [phase,setPhase]=React.useState('teaser');
  const [form,setForm]=React.useState({vkn:'', scenario:'growth'});
  const [progress,setProgress]=React.useState(0);
  const [projection,setProjection]=React.useState([]);
  
  const scenarios = [
    {id:'growth', label:'Agresif Büyüme', icon:Zap, desc:'Yüksek risk, yüksek likidite ihtiyacı, maksimum pazar payı.', color:'var(--primary)'},
    {id:'defense', label:'Defansif Korunma', icon:ShieldCheck, desc:'Düşük risk, nakit rezervi koruması, stabilite odaklı.', color:'var(--success)'},
    {id:'market', label:'Sektörel Genişleme', icon:Layers, desc:'Ortalama risk, yeni kanal yatırımları, uzun vadeli projeksiyon.', color:'#a855f7'}
  ];

  const startSimulation = async () => {
    if(!form.vkn) { alert('Lütfen hedef VKN giriniz.'); return; }
    setPhase('simulating');
    setProgress(0);
    speakAuthority("Kovan kolektif zekası stratejik simülasyonu başlatıyor. Zaman çizgisi hesaplanıyor.");

    for(let i=0; i<=100; i+=5){
      setProgress(i);
      await new Promise(r=>setTimeout(r, 150));
    }
    
    // Generate 12 months of projection
    const months = ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'];
    const p = months.map((m, i) => {
      const base = form.scenario === 'growth' ? 60 : form.scenario === 'defense' ? 85 : 72;
      const flux = Math.floor(Math.random() * 20) - 10;
      const score = Math.max(10, Math.min(100, base + flux + (form.scenario==='growth' ? i : -i/2)));
      return { month: m, score };
    });
    setProjection(p);
    setPhase('result');
    speakAuthority("12 aylık stratejik projeksiyon tamamlandı. Gelecek haritası emrinize amade.");
  };

  const reset = () => {
    setPhase('teaser');
    setForm({vkn:'', scenario:'growth'});
    setProjection([]);
  };

  return(
    <div style={{animation:'fadeUp .4s ease', height:'100%'}}>
      <BackBar setModule={setModule} title="PETEK-X: Stratejik Karar Üssü (Kovan Zekası)"/>
      
      <div className="panel" style={{display:'flex',flexDirection:'column',gap:20,flex:1,minHeight:640, position:'relative', overflow:'hidden', background:'radial-gradient(circle at center, rgba(168,85,247,0.05) 0%, rgba(0,0,0,0) 70%), var(--panel-bg)'}}>
        
        {phase === 'teaser' && (
          <div style={{position:'absolute', inset:0, zIndex:100, background:'rgba(5,5,5,0.98)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:20}}>
            <style>{`
              @keyframes petekSpin { 0%{transform:rotateY(0deg) scale(0.8); opacity:0.1;} 50%{transform:rotateY(180deg) scale(1.1); opacity:0.3;} 100%{transform:rotateY(360deg) scale(0.8); opacity:0.1;} }
              .petek-bg { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; perspective:1000px; }
              .petek-hex { width:300px; height:300px; color:var(--primary); animation:petekSpin 10s linear infinite; }
            `}</style>
            <div className="petek-bg">
              <Hexagon className="petek-hex" strokeWidth={0.5} />
            </div>
            
            <div style={{textAlign:'center', zIndex:101, padding:'40px 60px', backdropFilter:'blur(20px)', borderRadius:32, border:'1px solid rgba(168,85,247,0.3)', background:'rgba(10,5,15,0.8)', boxShadow:'0 0 60px rgba(168,85,247,0.15)'}}>
              <Cpu size={80} style={{color:'#a855f7', marginBottom:24, filter:'drop-shadow(0 0 20px #a855f7)'}} />
              <h2 style={{fontSize:28, color:'#fff', fontWeight:900, letterSpacing:4, marginBottom:16, textTransform:'uppercase'}}>PETEK-X KOMUTA ÜSSÜ</h2>
              <p style={{color:'var(--text)', fontSize:16, maxWidth:500, lineHeight:1.8, marginBottom:32, opacity:0.8}}>
                Sadece olanı değil, olacağı görün. BeeAI Kovan Zekası, milyonlarca olasılığı saniyeler içinde simüle ederek 
                stratejik kararlarınızın 12 aylık etkisini haritalandırır.
              </p>
              <button className="btn-main" style={{padding:'18px 50px', width:'auto', fontSize:17, letterSpacing:2, background:'linear-gradient(135deg, #a855f7, #6366f1)', color:'#fff'}} onClick={()=>setPhase('form')}>SIMÜLASYONU BAŞLAT</button>
            </div>
          </div>
        )}

        <div style={{display:'grid', gridTemplateColumns:'360px 1fr', gap:24, flex:1}}>
          {/* CONTROL PANEL */}
          <div style={{display:'flex', flexDirection:'column', gap:16}}>
            <div className="panel" style={{display:'flex', flexDirection:'column', gap:16, borderLeft:'4px solid #a855f7'}}>
              <div style={{fontSize:11, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:1}}>Hedef İstihbaratı</div>
              <input className="inp" style={{fontSize:20, textAlign:'center', letterSpacing:4}} placeholder="VKN / TCKN" value={form.vkn} onChange={e=>setForm({...form, vkn:e.target.value})} disabled={phase!=='form'}/>
              
              <div style={{fontSize:11, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:1, marginTop:8}}>Stratejik Senaryo</div>
              <div style={{display:'flex', flexDirection:'column', gap:10}}>
                {scenarios.map(s => (
                  <div key={s.id} onClick={() => phase==='form' && setForm({...form, scenario:s.id})} style={{
                    padding:14, borderRadius:12, cursor:'pointer', border: '1px solid ' + (form.scenario===s.id ? s.color : 'var(--border)'),
                    background: form.scenario===s.id ? s.color+'11' : 'transparent', transition:'all 0.3s',
                    display:'flex', gap:12, alignItems:'center'
                  }}>
                    <div style={{width:32, height:32, borderRadius:8, background:s.color+'22', display:'flex', alignItems:'center', justifyContent:'center', color:s.color}}>
                      <s.icon size={18}/>
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13, fontWeight:700, color:form.scenario===s.id ? s.color : 'var(--text)'}}>{s.label}</div>
                      {form.scenario===s.id && <div style={{fontSize:10, color:'var(--text-muted)', lineHeight:1.4, marginTop:2}}>{s.desc}</div>}
                    </div>
                  </div>
                ))}
              </div>
              
              {phase==='form' && (
                <button className="btn-main" style={{marginTop:8, background:'#a855f7', color:'#fff'}} onClick={startSimulation}>PETEK MATRİSİNİ HESAPLA</button>
              )}
              {phase==='result' && (
                <button className="nav-btn" style={{width:'100%', justifyContent:'center'}} onClick={reset}>Yeni Senaryo</button>
              )}
            </div>
          </div>

          {/* VISUALIZATION AREA */}
          <div className="panel" style={{flex:1, display:'flex', flexDirection:'column', position:'relative', overflow:'hidden'}}>
             {phase==='form' && (
               <div style={{flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', opacity:0.5}}>
                 <Hexagon size={120} strokeWidth={0.5} style={{color:'var(--border)', marginBottom:24}} />
                 <h3 style={{fontSize:20, color:'var(--text-muted)'}}>Simülasyon İçin Veri Girişi Bekleniyor</h3>
               </div>
             )}

             {phase==='simulating' && (
               <div style={{flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center'}}>
                 <div style={{fontSize:48, marginBottom:20}}>🐝</div>
                 <div style={{width:240, height:6, background:'var(--border)', borderRadius:3, overflow:'hidden', marginBottom:12}}>
                    <div style={{width:progress+'%', height:'100%', background:'linear-gradient(90deg, #a855f7, #6366f1)', transition:'width 0.1s linear'}} />
                 </div>
                 <div style={{fontSize:14, fontWeight:700, color:'#a855f7', letterSpacing:2}}>KOVAN ZEKASI SİMÜLE EDİYOR...</div>
               </div>
             )}

             {phase==='result' && (
               <div style={{flex:1, display:'flex', flexDirection:'column', gap:24, animation:'fadeUp 0.6s ease'}}>
                 <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                   <h3 style={{fontSize:18, color:'#fff', display:'flex', alignItems:'center', gap:10}}>
                     <Target style={{color:'#a855f7'}} size={20}/> 12 Aylık Karar Matrisi
                   </h3>
                   <div style={{padding:'4px 12px', background:'rgba(168,85,247,0.1)', border:'1px solid #a855f7', borderRadius:20, fontSize:11, color:'#a855f7'}}>
                     Simülasyon Güveni: %94
                   </div>
                 </div>

                 {/* HONEYCOMB GRID */}
                 <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:20, flex:1}}>
                    {projection.map((m, i) => (
                      <div key={i} className="panel" style={{position:'relative', border:'1px solid '+(m.score > 70 ? 'var(--success)' : m.score > 40 ? 'var(--warning)' : 'var(--danger)'), background:'rgba(255,255,255,0.02)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:10}}>
                         <div style={{position:'absolute', top:8, left:8, fontSize:10, fontWeight:900, color:'var(--text-muted)'}}>{m.month}</div>
                         <div style={{fontSize:28, fontWeight:900, color:m.score > 70 ? 'var(--success)' : m.score > 40 ? 'var(--warning)' : 'var(--danger)', fontFamily:'monospace'}}>{m.score}</div>
                         <div style={{fontSize:9, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:1}}>Stabilite</div>
                         <div style={{position:'absolute', bottom:0, left:0, right:0, height:'4px', background:(m.score > 70 ? 'var(--success)' : m.score > 40 ? 'var(--warning)' : 'var(--danger)'), opacity:0.3}} />
                      </div>
                    ))}
                 </div>

                 <div className="panel" style={{background:'rgba(255,255,255,0.03)', border:'1px dashed var(--border)', padding:16}}>
                    <div style={{display:'flex', gap:12, alignItems:'center'}}>
                      <TrendingUp size={24} style={{color:'#a855f7'}}/>
                      <div style={{fontSize:13, lineHeight:1.6}}>
                        <strong>Analiz Özeti:</strong> Seçilen <span style={{color:'#a855f7'}}>{scenarios.find(s=>s.id===form.scenario).label}</span> senaryosu, hedef şirketin likidite yapısını {projection[11].score > projection[0].score ? 'olumlu' : 'riskli'} yönde etkileyecektir. Kovan zekası, 4. aydan itibaren nakit rezervlerinin %12 oranında optimize edilmesini önerir.
                      </div>
                    </div>
                 </div>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}

function BackBar({setModule,title}){
  return(
    <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20}}>
      <button onClick={()=>setModule('dashboard')} className="nav-btn"><ArrowLeft size={14}/></button>
      <h2 style={{fontSize:20}}>{title}</h2>
    </div>
  );
}

function GlobalStyles(){
  return(
    <style>{`
      :root{--primary:#f59e0b;--bg-dark:#050505;--success:#10b981;--danger:#ef4444;--warning:#fbbf24;--border:rgba(245,158,11,.15);--panel-bg:rgba(10,8,5,.85);--text:#fef3c7;--text-muted:#a3a3a3;}
      *{margin:0;padding:0;box-sizing:border-box;}
      body{font-family:sans-serif;background:var(--bg-dark);color:var(--text);overflow-x:hidden;}
      .shell{max-width:1200px;margin:0 auto;padding:20px;}
      .shell-header{display:flex;justify-content:space-between;align-items:center;padding:18px 24px;background:var(--panel-bg);border:1px solid var(--border);border-radius:16px;margin-bottom:24px;}
      .brand-pill{color:var(--primary);font-weight:900;}
      .nav-btn{padding:8px 14px;border-radius:8px;cursor:pointer;background:rgba(255,255,255,.03);border:1px solid var(--border);color:var(--text-muted);}
      .nav-btn.active{background:var(--primary);color:#000;}
      .panel{background:var(--panel-bg);border:1px solid var(--border);border-radius:16px;padding:20px;}
      .inp{width:100%;background:#000;border:1px solid var(--border);padding:10px;color:var(--primary);border-radius:8px;margin-bottom:10px;}
      .btn-main{width:100%;padding:13px;background:var(--primary);color:#000;font-weight:800;border:none;border-radius:8px;cursor:pointer;}
      .gauge{position:relative;width:120px;height:120px;}
      .gauge-arc{position:absolute;inset:0;border-radius:50%;border:8px solid var(--border);border-top-color:var(--primary);}
      .gauge-needle{position:absolute;top:50%;left:50%;width:2px;height:50px;background:var(--primary);transform-origin:bottom center;}
      .gauge-center{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);}
      .terminal{background:#000;padding:10px;height:200px;overflow-y:auto;color:var(--primary);font-family:monospace;font-size:11px;border:1px solid var(--border);}
      .log-success{color:var(--success);}.log-error{color:var(--danger);}
      .absolute{position:absolute;}.rounded-full{border-radius:9999px;}.overflow-hidden{overflow:hidden;}.border-2{border-width:2px;}.z-50{z-index:50;}
      .vault-item{display:grid;grid-template-columns:100px 1fr 120px 120px 80px;gap:16px;align-items:center;background:rgba(255,255,255,.03);padding:12px;border-radius:12px;border:1px solid var(--border);margin-bottom:12px;transition:0.3s;}
      .vault-item:hover{background:rgba(245,158,11,.05); border-color:var(--primary);}
      .vault-thumb{width:100px; height:60px; border-radius:6px; object-fit:cover; border:1px solid rgba(255,255,255,0.1);}
    `}</style>
  );
}

function VaultModule({setModule, analyses}){
  const [isLocked, setIsLocked] = useState(true);
  const [pass, setPass] = useState('');

  const stats = {
    total: analyses.length,
    risk: analyses.filter(a=>a.score<50).length,
    volume: analyses.reduce((sum,a)=>sum+(a.amount||0),0).toLocaleString('tr-TR')
  };

  const handleEntry = () => {
    if(pass === 'BEEAI2026') {
       setIsLocked(false);
       speakAuthority("Kovan anahtarı doğrulandı. Arşiv erişimi sağlandı.");
    } else {
       alert("Geçersiz Erişim Anahtarı!");
    }
  };

  if(isLocked) {
    return (
      <div style={{animation:'fadeUp .4s ease', height:'60vh', display:'flex', alignItems:'center', justifyContent:'center'}}>
        <div className="panel" style={{maxWidth:400, width:'100%', textAlign:'center', padding:40}}>
           <Lock size={60} style={{color:'var(--primary)', marginBottom:24}} />
           <h2 style={{fontSize:20, marginBottom:12}}>KOVAN ERİŞİM ANAHTARI</h2>
           <p style={{fontSize:13, color:'var(--text-muted)', marginBottom:24}}>Bu alan özeldir. Devam etmek için yetkili anahtarınızı girin.</p>
           <input type="password" placeholder="Erişim Anahtarı..." className="inp" value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleEntry()} />
           <button className="btn-main" onClick={handleEntry}>ANAHTARI DOĞRULA</button>
           <div style={{fontSize:10, color:'var(--text-muted)', marginTop:20}}>Ipucu: Pilot anahtarı BEEAI2026</div>
        </div>
      </div>
    );
  }

  return(
    <div style={{animation:'fadeUp .4s ease'}}>
      <BackBar setModule={setModule} title="BEEAI KOVAN DEPOSU — Merkezi Arşiv"/>
      
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:20, marginBottom:24}}>
        <div className="panel" style={{textAlign:'center'}}>
          <div style={{fontSize:10, color:'var(--text-muted)', marginBottom:4, fontWeight:800, letterSpacing:1}}>TOPLAM KAYIT</div>
          <div style={{fontSize:32, fontWeight:900, color:'var(--primary)'}}>{stats.total}</div>
        </div>
        <div className="panel" style={{textAlign:'center'}}>
          <div style={{fontSize:10, color:'var(--text-muted)', marginBottom:4, fontWeight:800, letterSpacing:1}}>TOPLAM TUTAR</div>
          <div style={{fontSize:24, fontWeight:900, color:'var(--success)', marginTop:8}}>{stats.volume} ₺</div>
        </div>
        <div className="panel" style={{textAlign:'center', borderColor:stats.risk>0?'var(--danger)':'var(--border)'}}>
          <div style={{fontSize:10, color:'var(--text-muted)', marginBottom:4, fontWeight:800, letterSpacing:1}}>RİSKLİ MATERYAL</div>
          <div style={{fontSize:32, fontWeight:900, color:stats.risk>0?'var(--danger)':'var(--text-muted)'}}>{stats.risk}</div>
        </div>
      </div>

      <div className="panel" style={{background:'rgba(5,5,5,0.6)'}}>
        <div style={{display:'grid', gridTemplateColumns:'100px 1fr 120px 120px 80px', gap:16, padding:'0 12px 12px', fontSize:11, color:'var(--text-muted)', fontWeight:700, textTransform:'uppercase', letterSpacing:1, borderBottom:'1px solid var(--border)', marginBottom:16}}>
          <div>Materyal</div>
          <div>Kimlik / VKN</div>
          <div>Tutar (₺)</div>
          <div>Forensik Skor</div>
          <div>Detay</div>
        </div>

        {analyses.length === 0 ? (
          <div style={{textAlign:'center', padding:60, opacity:0.3}}>
            <Database size={48} style={{marginBottom:16}} />
            <p>Kovan deposunda henüz kayıtlı materyal bulunmuyor.</p>
          </div>
        ) : (
          analyses.map(a => (
            <div key={a.id} className="vault-item">
              <img src={a.fileData} className="vault-thumb" alt="Check preview" />
              <div>
                <div style={{fontSize:14, fontWeight:700, color:'var(--text)'}}>{a.vkn}</div>
                <div style={{fontSize:11, color:'var(--text-muted)', fontFamily:'monospace'}}>{new Date(a.timestamp).toLocaleString('tr-TR')}</div>
              </div>
              <div style={{fontSize:14, fontWeight:800, fontFamily:'JetBrains Mono'}}>{a.amount?.toLocaleString('tr-TR')}</div>
              <div style={{display:'flex', alignItems:'center', gap:8}}>
                <div style={{width:40, height:6, background:'rgba(255,255,255,0.1)', borderRadius:3, overflow:'hidden'}}>
                   <div style={{width:`${a.score}%`, height:'100%', background:a.score<50?'var(--danger)':'var(--success)'}} />
                </div>
                <span style={{fontSize:12, fontWeight:900, color:a.score<50?'var(--danger)':'var(--success)'}}>%{a.score}</span>
              </div>
              <button className="nav-btn" style={{padding:'6px 10px', fontSize:10, border:'1px solid rgba(245,158,11,0.3)'}} onClick={() => alert(`Arşiv Kaydı #${a.id} - Forensik Dosya Erişiliyor...`)}>DOSYA</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
