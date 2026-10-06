const data=window.portfolio;
const escapeHTML=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
document.querySelector('#project-list').innerHTML=data.projects.map((p,i)=>`<article class="project technical-project reveal"><div class="project-image"><img src="${escapeHTML(p.image)}" alt="${escapeHTML(p.alt)}" loading="lazy" width="1400" height="900"><span class="project-tag">${escapeHTML(p.category)}</span><span class="project-number">0${i+1} / 04</span></div><div class="project-caption"><div><h3>${escapeHTML(p.title)}</h3><p>${escapeHTML(p.subtitle)}</p></div><p>${escapeHTML(p.description)}</p></div><details><summary>Ver detalhes<span class="sr-only">: ${escapeHTML(p.category.toLowerCase())}</span></summary><div class="detail-body"><div><h4>Sobre o projeto</h4><p>${escapeHTML(p.challenge)}</p><dl class="metrics">${p.metrics.map(([k,v])=>`<div class="metric"><dt>${escapeHTML(k)}</dt><dd>${escapeHTML(v)}</dd></div>`).join('')}</dl></div><div><h4>Neste projeto</h4><ul>${p.scope.map(s=>`<li>${escapeHTML(s)}</li>`).join('')}</ul></div><div class="document-section"><div class="document-heading"><h4>Pranchas e documentos</h4><div class="document-actions"><button class="viewer-open" type="button" data-project="${i}" data-page="1" aria-controls="pdf-viewer-${i}" aria-expanded="false">Ver PDF aqui · ${p.pages} ${p.pages===1?'página':'páginas'}</button><a class="document-download" href="${escapeHTML(p.pdf)}" target="_blank" rel="noopener noreferrer">Abrir em nova aba<span class="sr-only">: ${escapeHTML(p.title)}</span></a></div></div><div class="document-gallery">${p.gallery.map(g=>`<button type="button" class="document-card" data-project="${i}" data-page="${g.page}" aria-controls="pdf-viewer-${i}"><img src="${escapeHTML(g.image)}" alt="${escapeHTML(g.label)}" loading="lazy" width="800" height="600"><span>${escapeHTML(g.label)}</span><small>Ver nesta página</small></button>`).join('')}</div><section class="pdf-viewer" id="pdf-viewer-${i}" hidden aria-label="PDF: ${escapeHTML(p.title)}"><div class="pdf-toolbar"><span>PDF · ${escapeHTML(p.subtitle)}</span><button type="button" class="viewer-close" data-project="${i}">Fechar PDF</button></div><div class="reader-controls"><button type="button" data-reader="prev" aria-label="Página anterior">Anterior</button><label>Página <select class="reader-page" aria-label="Selecionar página">${Array.from({length:p.pages},(_,n)=>`<option value="${n+1}">${n+1} de ${p.pages}</option>`).join('')}</select></label><button type="button" data-reader="next" aria-label="Próxima página">Próxima</button><span class="reader-zoom"><button type="button" data-reader="out" aria-label="Diminuir zoom">−</button><output>100%</output><button type="button" data-reader="in" aria-label="Aumentar zoom">+</button></span></div><div class="reader-viewport" tabindex="0" aria-label="Página do documento; use as barras de rolagem para navegar com zoom"><img class="reader-image" alt="" hidden></div><p class="pdf-help">Prévia das páginas do PDF. <a href="${escapeHTML(p.pdf)}" target="_blank" rel="noopener noreferrer">Abrir o arquivo completo</a> para visualizar em resolução maior.</p></section></div><p class="technical-note">${escapeHTML(p.note)}</p></div></details></article>`).join('');
document.querySelector('#year').textContent=new Date().getFullYear();
if(/^\d{10,15}$/.test(data.whatsapp)){const link=document.querySelector('#whatsapp');link.href=`https://wa.me/${data.whatsapp}`;link.target='_blank';link.rel='noopener noreferrer';link.hidden=false;document.querySelector('#contact-pending').hidden=true;}
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
if('IntersectionObserver' in window){document.body.classList.add('motion');const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target)}}),{threshold:.08});document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));}
let ticking=false;
function updateScroll(){const max=document.documentElement.scrollHeight-innerHeight;document.querySelector('.progress').style.transform=`scaleX(${max>0?scrollY/max:0})`;if(!reduce.matches)document.querySelectorAll('.project:not(.technical-project) .project-image').forEach(box=>{const rect=box.getBoundingClientRect();if(rect.bottom>0&&rect.top<innerHeight){const progress=Math.max(0,Math.min(1,(innerHeight-rect.top)/(innerHeight+rect.height)));box.querySelector('img').style.transform=`translateY(${-progress*rect.height*.12}px)`}});ticking=false}
addEventListener('scroll',()=>{if(!ticking){requestAnimationFrame(updateScroll);ticking=true}},{passive:true});addEventListener('resize',updateScroll);updateScroll();


// Page previews were rendered from the anonymized PDFs. Originals never enter the reader.
const readerStates=new Map();
function renderPage(index,page){
 const project=data.projects[index],viewer=document.querySelector(`#pdf-viewer-${index}`);
 page=Math.max(1,Math.min(project.pages,page));
 const state=readerStates.get(index)||{page:1,zoom:100};state.page=page;readerStates.set(index,state);
 const image=viewer.querySelector('.reader-image');
 const name=project.pdf.split('/').pop().replace('.pdf','');
 image.src=`${name}-${String(page).padStart(2,'0')}.webp`;
 image.alt=`${project.title} — página ${page} de ${project.pages}`;image.hidden=false;
 viewer.querySelector('.reader-page').value=String(page);
 viewer.querySelector('[data-reader="prev"]').disabled=page===1;
 viewer.querySelector('[data-reader="next"]').disabled=page===project.pages;
 applyZoom(index);viewer.querySelector('.reader-viewport').scrollTo(0,0);
}
function applyZoom(index){const viewer=document.querySelector(`#pdf-viewer-${index}`),state=readerStates.get(index);viewer.querySelector('.reader-image').style.width=state.zoom+'%';viewer.querySelector('output').textContent=state.zoom+'%';viewer.querySelector('[data-reader="out"]').disabled=state.zoom<=100;viewer.querySelector('[data-reader="in"]').disabled=state.zoom>=300;}
document.querySelector('#project-list').addEventListener('click',event=>{
 const control=event.target.closest('[data-reader]');
 if(control){const viewer=control.closest('.pdf-viewer'),index=Number(viewer.id.replace('pdf-viewer-','')),state=readerStates.get(index);if(control.dataset.reader==='prev'||control.dataset.reader==='next'){renderPage(index,state.page+(control.dataset.reader==='next'?1:-1));}else{state.zoom=Math.max(100,Math.min(300,state.zoom+(control.dataset.reader==='in'?25:-25)));applyZoom(index);}return;}
 const trigger=event.target.closest('button[data-project]');if(!trigger)return;
 const index=Number(trigger.dataset.project),viewer=document.querySelector(`#pdf-viewer-${index}`),opener=document.querySelector(`.viewer-open[data-project="${index}"]`);
 if(trigger.classList.contains('viewer-close')){viewer.hidden=true;opener.setAttribute('aria-expanded','false');opener.focus();return;}
 viewer.hidden=false;opener.setAttribute('aria-expanded','true');renderPage(index,Number(trigger.dataset.page)||1);
 viewer.scrollIntoView({behavior:reduce.matches?'auto':'smooth',block:'start'});viewer.querySelector('.viewer-close').focus({preventScroll:true});
});
document.querySelector('#project-list').addEventListener('change',event=>{if(event.target.matches('.reader-page'))renderPage(Number(event.target.closest('.pdf-viewer').id.replace('pdf-viewer-','')),Number(event.target.value));});

