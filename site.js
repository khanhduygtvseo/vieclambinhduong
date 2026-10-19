// Keep this file classic-script compatible so the exported dist can also run via file://.
const DAY_RATES = { weekday: 1.5, rest: 2, holiday: 3 };
function overtime(input) {
 const { basis, wage, normalHours, hours, day, night, daytimeOvertime } = input;
 if (!['hourly', 'monthly'].includes(basis)) throw new Error('Chọn cách nhập tiền lương.');
 if (!Number.isFinite(wage) || wage <= 0 || wage > 1e12) throw new Error('Tiền lương phải lớn hơn 0 và không quá 1.000 tỷ đồng.');
 if (!Number.isFinite(hours) || hours < 0 || hours > 744) throw new Error('Số giờ làm thêm phải từ 0 đến 744 giờ.');
 if (!(day in DAY_RATES)) throw new Error('Chọn loại ngày làm thêm.');
 if (basis === 'monthly' && (!Number.isFinite(normalHours) || normalHours <= 0 || normalHours > 744)) throw new Error('Giờ làm việc bình thường phải lớn hơn 0 và không quá 744 giờ.');
 const hourly = basis === 'hourly' ? wage : wage / normalHours;
 const base = DAY_RATES[day];
 const daytime = day === 'weekday' ? (daytimeOvertime ? 1.5 : 1) : base;
 const nightExtra = night ? .3 : 0;
 const additional = night ? .2 * daytime : 0;
 const rate = base + nightExtra + additional;
 const total = hourly * rate * hours;
 if (!Number.isFinite(total) || total > Number.MAX_SAFE_INTEGER) throw new Error('Kết quả vượt phạm vi tính toán. Hãy kiểm tra lại dữ liệu.');
 return { hourly, base, nightExtra, additional, rate, hours, total, dayAmount: hourly * base * hours, nightAmount: hourly * nightExtra * hours, extraAmount: hourly * additional * hours };
}
if (location.protocol === 'file:') {
 const siteRoot = new URL('../', document.currentScript.src);
 document.querySelectorAll('a[href^="/"]').forEach(link => {
  const original = link.getAttribute('href');
  const [pathname, fragment=''] = original.split('#');
  const target = pathname === '/' ? 'index.html' : pathname.replace(/^\//,'') + (pathname.endsWith('/') ? 'index.html' : '');
  link.href = new URL(target, siteRoot).href + (fragment ? '#'+fragment : '');
 });
}
document.documentElement.classList.add('js');
const qs = (s) => document.querySelector(s);
const menu=qs('.menu-button'),nav=qs('#main-nav');
const setMenu=open=>{menu.setAttribute('aria-expanded',String(open));nav.classList.toggle('is-open',open);};
menu?.addEventListener('click',()=>setMenu(menu.getAttribute('aria-expanded')!=='true'));
nav?.addEventListener('click',e=>{if(e.target.closest('a'))setMenu(false);});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu?.getAttribute('aria-expanded')==='true'){setMenu(false);menu.focus();}});
document.addEventListener('click',e=>{if(menu?.getAttribute('aria-expanded')==='true'&&!e.target.closest('.site-header'))setMenu(false);});
const mq=matchMedia('(max-width:650px)');mq.addEventListener('change',()=>setMenu(false));
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
if('IntersectionObserver'in window&&!reduced.matches){const ob=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.remove('pre-reveal');ob.unobserve(e.target);}}),{threshold:.06});document.querySelectorAll('.reveal').forEach(el=>{if(el.getBoundingClientRect().top>innerHeight){el.classList.add('pre-reveal');ob.observe(el);}});}
let ticking=false;const progress=qs('.reading-progress');
const updateProgress=()=>{const height=document.documentElement.scrollHeight-innerHeight;progress.style.width=`${height>0?Math.min(100,Math.max(0,scrollY/height*100)):0}%`;ticking=false;};
addEventListener('scroll',()=>{if(!ticking){requestAnimationFrame(updateProgress);ticking=true;}},{passive:true});addEventListener('resize',updateProgress);updateProgress();
// Filtering enhances the real HTML article list; without JS all articles remain visible.
if(qs('#blog-search')){
 const buttons=[...document.querySelectorAll('[data-filter]')],items=[...document.querySelectorAll('[data-article]')];let topic='Tất cả';
 const normalize=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/gi,'d').toLocaleLowerCase('vi');
 const filter=()=>{const query=normalize(qs('#search-input').value.trim());let visible=0;items.forEach(el=>{const show=(topic==='Tất cả'||el.dataset.topic===topic)&&normalize(el.dataset.search).includes(query);el.hidden=!show;if(show){visible++;el.classList.remove('pre-reveal');}});qs('#no-results').hidden=visible!==0;qs('#search-status').textContent=`${visible} bài viết${topic!=='Tất cả'?' · '+topic:''}`;updateProgress();};
 buttons.forEach(b=>b.addEventListener('click',()=>{topic=b.dataset.filter;buttons.forEach(other=>other.setAttribute('aria-pressed',String(other===b)));filter();}));
 qs('#blog-search').addEventListener('submit',e=>{e.preventDefault();filter();});qs('#search-input').addEventListener('input',filter);
}
if(qs('#overtime-form')){
 const form=qs('#overtime-form'),wage=qs('#wage'),normal=qs('#normal-hours'),hours=qs('#hours'),day=qs('#day'),night=qs('#night'),daytime=qs('#daytime-overtime');let hasCalculated=false;
 const money = n=>new Intl.NumberFormat('vi-VN',{maximumFractionDigits:0}).format(n)+' ₫';
 const decimal = n=>new Intl.NumberFormat('vi-VN',{maximumFractionDigits:4}).format(n);
 const valueMoney=s=>{const str=s.trim().replace(/\s/g,'');return /^(\d+|\d{1,3}(\.\d{3})+)$/.test(str)?Number(str.replace(/\./g,'')):NaN;};
 const valueHours=s=>/^\d+([.,]\d{1,4})?$/.test(s.trim())?Number(s.trim().replace(',','.')):NaN;
 const basis=()=>form.elements.basis.value;
 const showOptions=()=>{const monthly=basis()==='monthly';qs('#normal-hours-field').hidden=!monthly;normal.disabled=!monthly;normal.required=monthly;qs('#wage-label').textContent=monthly?'Tiền lương tháng làm căn cứ':'Tiền lương giờ làm căn cứ';const applicable=night.checked&&day.value==='weekday';qs('#daytime-option').hidden=!applicable;if(!applicable)daytime.checked=false;};
 function clearErrors(){['wage','normal-hours','hours'].forEach(id=>{qs('#'+id).removeAttribute('aria-invalid');qs('#'+id+'-error').textContent='';});qs('#form-error').hidden=true;qs('#form-error').textContent='';}
 const invalidate=(el,message)=>{el.setAttribute('aria-invalid','true');qs('#'+el.id+'-error').textContent=message;};
 const hideResult=()=>{qs('#result-values').hidden=true;qs('#result-empty').hidden=false;qs('#result-announcement').textContent='';};
 function calculate(focusError=false){
  clearErrors();const values={basis:basis(),wage:valueMoney(wage.value),normalHours:valueHours(normal.value),hours:valueHours(hours.value),day:day.value,night:night.checked,daytimeOvertime:daytime.checked};
  let first=null;
  if(!Number.isFinite(values.wage)||values.wage<=0||values.wage>1e12){invalidate(wage,'Nhập tiền lương nguyên đồng lớn hơn 0, ví dụ 10.000.000.');first=wage;}
  if(values.basis==='monthly'&&(!Number.isFinite(values.normalHours)||values.normalHours<=0||values.normalHours>744)){invalidate(normal,'Nhập số giờ lớn hơn 0 và không quá 744 giờ.');first??=normal;}
  if(!Number.isFinite(values.hours)||values.hours<0||values.hours>744){invalidate(hours,'Nhập số giờ từ 0 đến 744, ví dụ 2 hoặc 1,5.');first??=hours;}
  if(first){hideResult();qs('#form-error').textContent='Vui lòng kiểm tra các trường được ghi lỗi bên trên.';qs('#form-error').hidden=false;if(focusError)first.focus();return;}
  try{
   const r=overtime(values);qs('#result-empty').hidden=true;qs('#result-values').hidden=false;
   qs('#total').textContent=money(r.total);qs('#hourly-value').textContent=decimal(r.hourly)+' ₫/giờ';qs('#rate-value').textContent=decimal(r.rate*100)+'%';
   qs('#day-amount').textContent=money(r.dayAmount);qs('#night-amount').textContent=money(r.nightAmount);qs('#extra-amount').textContent=money(r.extraAmount);
   qs('#night-amount-row').hidden=!values.night;qs('#extra-amount-row').hidden=!values.night;
   const dayNames={weekday:'ngày thường',rest:'ngày nghỉ hằng tuần',holiday:'ngày lễ, Tết / nghỉ có hưởng lương'};
   qs('#result-context').textContent=`${decimal(r.hours)} giờ · ${dayNames[values.day]} · ${values.night?'ban đêm':'ban ngày'}`;
   const parts=values.night?`${decimal(r.base*100)}% + 30% + ${decimal(r.additional*100)}%`:`${decimal(r.rate*100)}%`;
   qs('#formula-result').textContent=`${decimal(r.hourly)} × (${parts}) × ${decimal(r.hours)} = ${money(r.total)}. Tính bằng số chính xác; số tiền hiển thị làm tròn đến đồng.`;
   qs('#result-announcement').textContent=`Tiền làm thêm tối thiểu: ${money(r.total)}. Hệ số ${decimal(r.rate*100)}%.`;
  }catch(error){hideResult();qs('#form-error').textContent=error.message;qs('#form-error').hidden=false;}
 }
 form.addEventListener('submit',e=>{e.preventDefault();hasCalculated=true;calculate(true);});
 form.addEventListener('input',()=>{showOptions();if(hasCalculated)calculate();});
 form.addEventListener('change',()=>{showOptions();if(hasCalculated)calculate();});
 wage.addEventListener('blur',()=>{const value=valueMoney(wage.value);if(Number.isFinite(value))wage.value=new Intl.NumberFormat('vi-VN',{maximumFractionDigits:0}).format(value);});
 form.addEventListener('reset',()=>{hasCalculated=false;setTimeout(()=>{clearErrors();hideResult();showOptions();},0);});
 showOptions();
}
