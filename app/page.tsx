 "use client";
import { useState } from "react";

type Scene = { number:number; duration:number; narration:string; visualPrompt:string };
type Package = { title:string; hook:string; script:string; scenes:Scene[]; shorts:string[]; thumbnailPrompt:string };

export default function Home(){
  const [tab,setTab]=useState("dashboard");
  const [topic,setTopic]=useState("");
  const [language,setLanguage]=useState("Hindi");
  const [duration,setDuration]=useState("10 minutes");
  const [busy,setBusy]=useState(false);
  const [progress,setProgress]=useState(0);
  const [log,setLog]=useState("");
  const [pkg,setPkg]=useState<Package|null>(null);
  const [images,setImages]=useState<Record<number,string>>({});
  const [thumb,setThumb]=useState<string|null>(null);
  const [srt,setSrt]=useState<string>("");
  const [assetBusy,setAssetBusy]=useState(false);
  const [projectId,setProjectId]=useState<string|null>(null);
  const [oneClick,setOneClick]=useState(false);
  const [renderStatus,setRenderStatus]=useState("");
  const [ytStatus,setYtStatus]=useState<string>("");
  const [jobs,setJobs]=useState<any[]>([]);
  const [scheduleAt,setScheduleAt]=useState("");

  async function generate(){
    setBusy(true); setPkg(null); setProgress(8); setLog("Starting production engine…");
    const stages=["Writing hook and story structure…","Creating scene breakdown…","Preparing voiceover script…","Creating visual prompts…","Preparing Shorts and thumbnail prompt…"];
    let i=0;
    const timer=setInterval(()=>{i++; if(i<stages.length){setProgress(8+i*13);setLog(x=>x+"\\n✓ "+stages[i-1])}},650);
    try{
      const res=await fetch("/api/generate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({topic,language,duration})});
      const data=await res.json();
      clearInterval(timer);
      if(!res.ok) throw new Error(data.error||"Generation failed");
      setProgress(100); setLog(x=>x+"\\n✓ AI package generated"); setPkg(data);
    }catch(e:any){clearInterval(timer);setLog(x=>x+"\\n✕ "+e.message)} finally{setBusy(false)}
  }


  async function oneClickProduction(){
    setOneClick(true); setLog("Starting one-click production…");
    try{
      const r=await fetch("/api/production",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({topic,language,duration})});
      const d=await r.json();
      if(!r.ok) throw new Error(d.error||"Production failed");
      setProjectId(d.id); setPkg(d); setProgress(35);
      setLog("✓ Script and production manifest created\n✓ Project saved\nNext: generate assets → voice → render");
    }catch(e:any){setLog("✕ "+e.message)}
    finally{setOneClick(false)}
  }

  async function generateAssets(){
    if(!pkg) return;
    setAssetBusy(true);
    try{
      const next:{[key:number]:string} = {};
      for(const scene of pkg.scenes){
        const r=await fetch("/api/image",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt:`Darkest Nyts cinematic horror visual. ${scene.visualPrompt}. Consistent Indian horror animation/cinematic style, realistic lighting, Void Black #050708, Dark Teal #102A30, Blood Red #B00012, Moon White #E8EDF0, Warm Lantern #C87832. No text, no watermark.`})});
        const d=await r.json();
        if(!r.ok) throw new Error(d.error||"Image generation failed");
        next[scene.number]=d.dataUrl;
        setImages({...next});
      }
      const tr=await fetch("/api/thumbnail",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt:pkg.thumbnailPrompt})});
      const td=await tr.json();
      if(!tr.ok) throw new Error(td.error||"Thumbnail generation failed");
      setThumb(td.dataUrl);
      const cr=await fetch("/api/captions",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({scenes:pkg.scenes})});
      const cd=await cr.json(); setSrt(cd.srt);
    }catch(e:any){setLog(x=>x+"\n✕ Asset generation: "+e.message)}
    finally{setAssetBusy(false)}
  }

  return <div className="shell">
    <aside className="side"><div className="brand"><div className="logo">DN</div><div><b>Darkest Nyts</b><small>STUDIO ENGINE</small></div></div>
      <nav className="nav">
        {["dashboard","create","queue","settings"].map(x=><button key={x} className={tab===x?"active":""} onClick={()=>setTab(x)}>{x==="dashboard"?"⌂ Dashboard":x==="create"?"✦ Create Video":x==="queue"?"◷ Production Queue":"⚙ Settings"}</button>)}
      </nav>
    </aside>
    <main className="main">
      <div className="head"><div><div className="eyebrow">FACELESS CONTENT ENGINE</div><h1>{tab==="dashboard"?"Dashboard":tab==="create"?"Create Video":tab==="queue"?"Production Queue":"Settings"}</h1></div><div className="avatar">S</div></div>

      {tab==="dashboard" && <><div className="grid">
        { [["Videos generated","24","↑ 18% this month"],["In production","3","2 rendering now"],["Scheduled","11","Next: tonight"],["Shorts ready","37","↑ 9 this week"]].map(x=><div className="card stat" key={x[0]}><span className="muted">{x[0]}</span><b>{x[1]}</b><small>{x[2]}</small></div>)}
      </div><div className="section"><div className="row"><h2>Automation pipeline</h2><button className="btn primary" onClick={()=>setTab("create")}>+ Create video</button></div>
      <div className="pipeline">{["Idea","Script","Voice","Visuals","Render"].map((x,i)=><div className="step" key={x}><span className="check">✓</span><strong>0{i+1} · {x}</strong><small>{["Topic discovery","AI narration","Hindi voice","Scene generation","Captions + export"][i]}</small></div>)}</div></div>
      <div className="section card"><div className="row"><h2>Latest projects</h2><span className="pill">Darkest Nyts</span></div><p className="muted">“सीट नंबर 17 — The Last Passenger” · Ready</p><p className="muted">“Peeli Kothi: The Locked Room” · Rendering</p><p className="muted">“Haveli No. 27” · Voice generation</p></div></>}

      {tab==="create" && <div className="card form">
        <div className="row"><h2>Create production package</h2><span className="pill">Real AI endpoint</span></div>
        <div className="field"><label>Topic</label><input value={topic} onChange={e=>setTopic(e.target.value)} placeholder="e.g. The abandoned railway station after midnight"/></div>
        <div className="two"><div className="field"><label>Language</label><select value={language} onChange={e=>setLanguage(e.target.value)}><option>Hindi</option><option>Hinglish</option><option>English</option></select></div><div className="field"><label>Duration</label><select value={duration} onChange={e=>setDuration(e.target.value)}><option>10 minutes</option><option>7 minutes</option><option>5 minutes</option><option>60 seconds</option><option>30 seconds</option></select></div></div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          <button className="btn primary" disabled={busy||oneClick} onClick={generate}>{busy?"Generating…":"Generate with AI"}</button>
          <button className="btn" disabled={oneClick} onClick={oneClickProduction}>{oneClick?"Building…":"One-click production setup"}</button>
        </div>
        {busy || log ? <><div className="progress"><div className="bar" style={{width:`${progress}%`}}/></div><div className="log">{log}</div></>:null}
        {pkg && <div className="result"><h3>{pkg.title}</h3>{projectId && <div className="pill">Project {projectId.slice(0,8)}</div>}<p><b>Hook:</b> {pkg.hook}</p><p><b>Script:</b> {pkg.script}</p><h4>Scenes</h4>{pkg.scenes.map(s=><div className="scene" key={s.number}><b>Scene {s.number} · {s.duration}s</b><p>{s.narration}</p><small className="muted">VISUAL: {s.visualPrompt}</small></div>)}<h4>Shorts hooks</h4><ul>{pkg.shorts.map(x=><li key={x}>{x}</li>)}</ul><p><b>Thumbnail:</b> {pkg.thumbnailPrompt}</p>
          <div style={{marginTop:16,display:"flex",gap:8,flexWrap:"wrap"}}>
            <button className="btn primary" disabled={assetBusy} onClick={generateAssets}>{assetBusy?"Generating assets…":"Generate scene images + thumbnail"}</button>
            {srt && <button className="btn" onClick={()=>navigator.clipboard.writeText(srt)}>Copy SRT captions</button>}
          </div>
          {Object.keys(images).length>0 && <div style={{marginTop:16}}><h4>Generated scene assets</h4>{pkg.scenes.map(s=>images[s.number] && <div className="scene" key={"img"+s.number}><b>Scene {s.number}</b><img src={images[s.number]} alt={"Scene "+s.number} style={{width:"100%",maxWidth:520,borderRadius:8,display:"block",marginTop:8}} /></div>)}</div>}
          {thumb && <div style={{marginTop:16}}><h4>Generated thumbnail</h4><img src={thumb} alt="Generated thumbnail" style={{width:"100%",maxWidth:720,borderRadius:8}} /></div>}
          {srt && <div className="log" style={{marginTop:16}}>{srt}</div>}
          <div style={{marginTop:18,display:"flex",gap:8,flexWrap:"wrap"}}>
            <button className="btn" onClick={()=>setRenderStatus("Render job queued. Use worker/render_video.py or render_shorts.py for local MP4 assembly.")}>Render 16:9 MP4</button>
            <button className="btn" onClick={()=>setRenderStatus("Shorts render job queued. Use worker/render_shorts.py for 1080×1920 output.")}>Render 9:16 Short</button>
            <button className="btn" onClick={async()=>{const r=await fetch("/api/youtube/status");const d=await r.json();setYtStatus(d.message)}}>Check YouTube</button>
          </div>
          {renderStatus && <div className="log">{renderStatus}</div>}
          {ytStatus && <div className="log">{ytStatus}</div>}
          <div style={{marginTop:12,display:"flex",gap:8,flexWrap:"wrap"}}>
            <a className="btn" href="/api/youtube/auth">Connect YouTube</a>
            <button className="btn" onClick={async()=>{const r=await fetch("/api/youtube/status");const d=await r.json();setYtStatus(d.connected?`Connected: ${d.channelTitle} (${d.channelId})`:d.message)}}>Refresh YouTube status</button>
          </div>
        </div>}
      </div>}

      {tab==="queue" && <div className="card"><div className="row"><h2>Production queue</h2><button className="btn" onClick={async()=>{const r=await fetch("/api/jobs");setJobs(await r.json())}}>Refresh</button></div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:14}}>
        <input value={scheduleAt} onChange={e=>setScheduleAt(e.target.value)} placeholder="2026-09-21T20:30:00+05:30" style={{background:"#080d0f",color:"#fff",border:"1px solid #26363b",borderRadius:8,padding:10,flex:"1"}}/>
        <button className="btn primary" onClick={async()=>{const r=await fetch("/api/jobs",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({type:"full-production",runAt:scheduleAt||new Date().toISOString(),payload:{channel:"Darkest Nyts"}})});const d=await r.json();setJobs(x=>[...x,d])}}>Schedule production</button>
      </div>
      <p className="muted">Pipeline: Script → Assets → Voice → Render → Shorts → Approval → YouTube</p>
      {jobs.length===0?<p className="muted">No jobs loaded. Click Refresh.</p>:jobs.map(j=><div key={j.id} className="scene"><b>{j.type}</b> · {j.status}<br/><small className="muted">Run: {j.runAt} · ID: {j.id.slice(0,8)}</small></div>)}</div>}
      {tab==="settings" && <div className="card form"><div className="field"><label>Channel name</label><input defaultValue="Darkest Nyts"/></div><div className="field"><label>Brand colors</label><input defaultValue="#050708 · #102A30 · #B00012 · #E8EDF0 · #C87832"/></div><button className="btn primary" onClick={()=>alert("Saved")}>Save settings</button></div>}
    </main>
  </div>
}