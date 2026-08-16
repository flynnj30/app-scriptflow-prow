// @ts-nocheck
/* ================================================================
 * TRANSCRIPT STUDIO IN-APP BROWSER
 * Uses a same-origin server proxy; deliberately NO iframe.
 * The proxy is restricted to Transcript Studio's Render origin.
 * ================================================================ */
(function () {
    'use strict';

    const DEFAULT_URL = 'https://transcript-studio-n0nv.onrender.com/';
    const PROXY_PREFIX = '/transcript-browser/';
    const IDS = {
        panel: 'transcriptStudioPanel', address: 'transcriptAddress', viewport: 'transcriptBrowserViewport',
        status: 'transcriptBrowserStatus', fallback: 'transcriptBrowserFallback', back: 'transcriptBackBtn',
        reload: 'transcriptReloadBtn', go: 'transcriptGoBtn', form: 'transcriptAddressForm', newTab: 'transcriptNewTabBtn',
        fallbackOpen: 'transcriptFallbackOpenBtn', fallbackRetry: 'transcriptFallbackRetryBtn'
    };
    const $ = id => document.getElementById(id);
    let historyStack = [], historyIndex = -1, currentUrl = DEFAULT_URL, loading = false;

    function normalizeUrl(value) {
        let raw = String(value || '').trim();
        if (!raw) return DEFAULT_URL;
        if (!/^https?:\/\//i.test(raw)) raw = 'https://' + raw;
        try {
            const u = new URL(raw);
            if (u.origin !== new URL(DEFAULT_URL).origin) return DEFAULT_URL;
            return u.href;
        } catch (_) { return DEFAULT_URL; }
    }
    function proxyUrl(target) {
        const u = new URL(normalizeUrl(target));
        return PROXY_PREFIX + u.pathname.replace(/^\//, '') + u.search + u.hash;
    }
    function setStatus(text) { const el=$(IDS.status); if(el) el.textContent=text; }
    function showFallback(v) { const el=$(IDS.fallback); if(el) el.hidden=!v; }
    function showPanel(v) {
        const p=$(IDS.panel), scripts=$('scriptPanel'), features=$('featurePanel');
        if(!p) return;
        p.hidden=!v; p.style.display=v?'flex':'none';
        if(v){ if(scripts) scripts.style.display='none'; if(features) features.style.display='none'; }
        else if(scripts) scripts.style.display='';
    }
    function updateAddress(url){ const a=$(IDS.address); if(a) a.value=url; }
    function pushHistory(url){
        if(historyIndex>=0 && historyStack[historyIndex]===url) return;
        historyStack=historyStack.slice(0,historyIndex+1); historyStack.push(url); historyIndex++;
    }
    function absoluteUrl(value, base){
        try { return new URL(value, base).href; } catch(_) { return value; }
    }
    function rewriteDocument(html, baseUrl){
        const parser=new DOMParser(); const doc=parser.parseFromString(html,'text/html');
        const origin=new URL(DEFAULT_URL).origin;
        const attrs=[['a','href'],['link','href'],['script','src'],['img','src'],['source','src'],['video','src'],['audio','src'],['form','action'],['iframe','src'],['input','src']];
        attrs.forEach(([sel,attr])=>doc.querySelectorAll(sel+'['+attr+']').forEach(el=>{
            const raw=el.getAttribute(attr); if(!raw || raw.startsWith('#') || raw.startsWith('data:') || raw.startsWith('mailto:') || raw.startsWith('javascript:')) return;
            const abs=absoluteUrl(raw,baseUrl);
            try { if(new URL(abs).origin===origin) el.setAttribute(attr,proxyUrl(abs)); }
            catch(_){}
        }));
        doc.querySelectorAll('meta[http-equiv]').forEach(m=>{ if((m.getAttribute('http-equiv')||'').toLowerCase()==='content-security-policy') m.remove(); });
        // Make absolute references to Transcript Studio route through our proxy.
        const serialized='<!doctype html>'+doc.documentElement.outerHTML;
        return serialized.split(origin).join(location.origin + PROXY_PREFIX.replace(/\/$/,''));
    }
    function executeScripts(container){
        // Execute scripts sequentially after HTML is mounted. External script URLs have already been proxied.
        const scripts=[...container.querySelectorAll('script')];
        scripts.forEach(old=>{
            const s=document.createElement('script');
            [...old.attributes].forEach(a=>s.setAttribute(a.name,a.value));
            if(old.src) s.src=old.src; else s.textContent=old.textContent;
            old.replaceWith(s);
        });
    }
    async function loadUrl(target,{addHistory=true}={}){
        const url=normalizeUrl(target); const viewport=$(IDS.viewport); if(!viewport) return;
        if(loading) return; loading=true; showFallback(false); setStatus('Loading Transcript Studio…'); updateAddress(url);
        try{
            const res=await fetch(proxyUrl(url),{credentials:'same-origin',headers:{'X-ScriptFlow-Browser':'1'}});
            if(!res.ok) throw new Error('HTTP '+res.status);
            const type=res.headers.get('content-type')||'';
            if(!type.includes('text/html') && !type.includes('application/xhtml')) throw new Error('Not an HTML page');
            const html=await res.text();
            viewport.innerHTML=rewriteDocument(html,url);
            executeScripts(viewport);
            currentUrl=url; if(addHistory) pushHistory(url); setStatus('Transcript Studio loaded');
        }catch(err){ console.error('[Transcript Studio]',err); viewport.innerHTML=''; showFallback(true); setStatus('Unable to render Transcript Studio in-app'); }
        finally{ loading=false; }
    }
    function open(){ showPanel(true); if(!historyStack.length) loadUrl(DEFAULT_URL); else loadUrl(currentUrl,{addHistory:false}); }
    function close(){ const viewport=$(IDS.viewport); if(viewport) viewport.replaceChildren(); showPanel(false); setStatus('Ready'); }
    function goBack(){ if(historyIndex>0){ historyIndex--; loadUrl(historyStack[historyIndex],{addHistory:false}); } else close(); }
    function openExternal(){ window.open(currentUrl||DEFAULT_URL,'_blank','noopener,noreferrer'); }
    function init(){
        if($('openTranscriptStudioBtn')) $('openTranscriptStudioBtn').remove();
        document.querySelectorAll('[data-tool="transcript-studio"]').forEach(item=>item.addEventListener('click',open));
        $(IDS.back)?.addEventListener('click',goBack);
        $(IDS.reload)?.addEventListener('click',()=>loadUrl(currentUrl,{addHistory:false}));
        $(IDS.form)?.addEventListener('submit',e=>{e.preventDefault();loadUrl($(IDS.address)?.value||DEFAULT_URL);});
        $(IDS.newTab)?.addEventListener('click',openExternal);
        $(IDS.fallbackOpen)?.addEventListener('click',openExternal);
        $(IDS.fallbackRetry)?.addEventListener('click',()=>loadUrl(currentUrl,{addHistory:false}));
        $(IDS.viewport)?.addEventListener('click',e=>{
            const a=e.target.closest('a'); if(!a) return;
            const href=a.getAttribute('href'); if(!href || href.startsWith('#') || href.startsWith('javascript:')) return;
            const abs=absoluteUrl(href,currentUrl); try { if(new URL(abs).origin===new URL(DEFAULT_URL).origin){e.preventDefault();loadUrl(abs);} }catch(_){}
        });
        $(IDS.viewport)?.addEventListener('submit',e=>{
            const form=e.target.closest('form'); if(!form) return;
            const action=absoluteUrl(form.getAttribute('action')||currentUrl,currentUrl);
            try{ if(new URL(action).origin===new URL(DEFAULT_URL).origin){e.preventDefault(); const fd=new FormData(form); const qs=new URLSearchParams(fd); loadUrl(action+(action.includes('?')?'&':'?')+qs.toString()); }}catch(_){}
        });
        window.ScriptFlowTranscriptStudio={open,close,reload:()=>loadUrl(currentUrl,{addHistory:false}),url:DEFAULT_URL};
    }
    if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true}); else init();
})();
