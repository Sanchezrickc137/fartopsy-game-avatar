import { serializeAvatarText } from './avatar-export.mjs';

export function downloadAvatarFiles({image,avatar,background,framing},environment=globalThis){
  if(typeof image!=='string'||!(/^(blob:|data:image\/png;base64,)/.test(image)))throw new TypeError('The avatar image is not ready');
  const createdAt=new Date().toISOString();
  const text=serializeAvatarText({avatar,background,framing,createdAt});
  const stem=`avatar-${createdAt.replace(/[:.]/g,'-')}`;
  const txt=environment.URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'}));
  const trigger=(url,name)=>{const link=environment.document.createElement('a');link.href=url;link.download=name;link.hidden=true;environment.document.body.appendChild(link);link.click();link.remove();};
  // Both clicks occur during Download's user activation; no network request or
  // delayed snapshot can accidentally pair the image with a newer configuration.
  trigger(image,`${stem}.png`);
  trigger(txt,`${stem}.txt`);
  environment.setTimeout(()=>environment.URL.revokeObjectURL(txt),60_000);
  return {image:`${stem}.png`,configuration:`${stem}.txt`,text};
}

let snapshotQueue=Promise.resolve();
export function captureAvatarSnapshots({snapshot,config,background,signal},environment=globalThis){
  const capture=async()=>{
    if(signal?.aborted)throw new DOMException('Snapshot cancelled','AbortError');
    let base=null,closeUp=null;
    try{
      base=await snapshot.request({type:'full',bgColor:background,config});
      if(signal?.aborted)throw new DOMException('Snapshot cancelled','AbortError');
      closeUp=await snapshot.request({type:'closeup',bgColor:background,config});
      if(signal?.aborted)throw new DOMException('Snapshot cancelled','AbortError');
      return {base,closeUp,config,background};
    }catch(error){releaseAvatarSnapshots({base,closeUp},environment);throw error;}
  };
  // The native renderer has one pending canvas/toBlob promise. Serial requests
  // preserve it even when a color change cancels an XState invocation.
  const pending=snapshotQueue.then(capture,capture);
  snapshotQueue=pending.catch(()=>{});
  return pending;
}

export function releaseAvatarSnapshots(pair,environment=globalThis){
  for(const value of Object.values(pair||{}))if(typeof value==='string'&&value.startsWith('blob:')){
    environment.setTimeout(()=>environment.URL.revokeObjectURL(value),1_000);
  }
}

export function installEditorLifecycle({view,audio,gsap},environment=globalThis){
  let resumeView=false,resumeAudio=false,hidden=false,disposed=false;
  const originalStart=view.start;
  view.start=function(...args){
    if(disposed)return;
    if(hidden||environment.document.hidden){resumeView=true;return;}
    return originalStart.apply(this,args);
  };
  const suspend=()=>{
    if(hidden||disposed)return;hidden=true;
    resumeView=Boolean(view._playing);resumeAudio=audio.context.state==='running';
    environment.cancelAnimationFrame(view._rafId);view.stop();gsap.ticker.sleep();
    if(resumeAudio)audio.context.suspend().catch(()=>{});
  };
  const resume=()=>{
    if(!hidden||disposed||environment.document.hidden)return;hidden=false;
    if(resumeView)view.start();gsap.ticker.wake();
    if(resumeAudio)audio.context.resume().catch(()=>{});
    resumeView=false;resumeAudio=false;
  };
  const visibility=()=>environment.document.hidden?suspend():resume();
  environment.document.addEventListener('visibilitychange',visibility);
  environment.addEventListener('pagehide',suspend);
  environment.addEventListener('pageshow',resume);
  if(environment.document.hidden)suspend();
  return ()=>{if(disposed)return;suspend();disposed=true;view.start=originalStart;environment.document.removeEventListener('visibilitychange',visibility);environment.removeEventListener('pagehide',suspend);environment.removeEventListener('pageshow',resume);};
}
