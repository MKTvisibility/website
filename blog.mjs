const API='https://gvmwkltwrlqwbqegieum.supabase.co'
const KEY='sb_publishable_SFIrQ_kqkLQJdBNMnaRr3g_w6XWKaBJ'
const headers={apikey:KEY,'Content-Type':'application/json'}
const status=document.querySelector('#status'),posts=document.querySelector('#posts'),article=document.querySelector('#article'),more=document.querySelector('#more')
let offset=0
function node(tag,text,className){const el=document.createElement(tag);if(text)el.textContent=text;if(className)el.className=className;return el}
function link(text,href){const a=node('a',text);a.href=href;return a}
function date(value){return new Intl.DateTimeFormat('en-US',{timeZone:'America/Denver',year:'numeric',month:'long',day:'numeric'}).format(new Date(value))}
async function request(path,options={}){const r=await fetch(API+path,{...options,headers,cache:'no-store'});if(!r.ok)throw new Error('Blog unavailable');return r.json()}
async function image(post){
 if(!post.image_path)return null
 try{const data=await request('/storage/v1/object/sign/mkt-blog-images/'+post.image_path.split('/').map(encodeURIComponent).join('/'),{method:'POST',body:JSON.stringify({expiresIn:300})});if(!data.signedURL)return null;const img=node('img');img.src=API+'/storage/v1'+data.signedURL;img.alt=post.image_alt||'';img.loading='lazy';return img}catch{return null}
}
async function card(post){const el=node('article',null,'blog-card');const pic=await image(post);if(pic){const a=link('',`?post=${encodeURIComponent(post.slug)}`);a.setAttribute('aria-label',post.title);a.append(pic);el.append(a)}const copy=node('div',null,'copy'),title=node('h2');title.append(link(post.title,`?post=${encodeURIComponent(post.slug)}`));copy.append(node('small',date(post.published_at)),title,node('p',post.excerpt),link('Read post →',`?post=${encodeURIComponent(post.slug)}`));el.append(copy);return el}
async function showPost(slug){
 const rows=await request('/rest/v1/cc_blog_public?select=*&slug=eq.'+encodeURIComponent(slug)+'&limit=1'),p=rows[0]
 document.querySelector('#blog-heading').hidden=true
 if(!p){status.replaceChildren(node('h1','Post not available'),node('p','This post may be unpublished or scheduled for a later date.'),link('← Back to all posts','blog.html'));return}
 status.hidden=true;article.hidden=false
 const title=node('h1',p.title),pic=await image(p)
 article.append(link('← All blog posts','blog.html'),title,node('p',`${p.author||'MKT Visibility'} · ${date(p.published_at)}`,'byline'))
 if(pic){const figure=node('figure');pic.loading='eager';figure.append(pic);if(p.image_caption)figure.append(node('figcaption',p.image_caption));article.append(figure)}
 if(p.excerpt)article.append(node('p',p.excerpt,'blog-intro'))
 article.append(node('div',p.body,'blog-body'))
 document.title=p.title+' | MKT Visibility Blog';document.querySelector('meta[name="description"]').content=p.excerpt||p.body.slice(0,160)
 document.querySelector('link[rel="canonical"]').href='https://mktvisibility.github.io/website/blog.html?post='+encodeURIComponent(p.slug)
}
async function loadMore(){
 more.disabled=true
 try{const rows=await request(`/rest/v1/cc_blog_public?select=*&order=published_at.desc,post_id.asc&limit=12&offset=${offset}`);const cards=await Promise.all(rows.map(card));posts.append(...cards);offset+=rows.length;more.hidden=rows.length<12;status.hidden=offset>0
 if(!offset)status.replaceChildren(node('h2','Fresh ideas are on the way.'),node('p','Our first posts will appear here when they are published. Check back soon.'),link('Explore MKT Visibility services →','index.html#services'))
 }catch{showError()}finally{more.disabled=false}
}
function showError(){status.hidden=false;status.classList.add('blog-error');const retry=node('button','Try again','btn');retry.addEventListener('click',()=>location.reload());status.replaceChildren(node('h2','We couldn’t load the blog.'),node('p','Please try again in a moment.'),retry)}
more.addEventListener('click',loadMore)
const slug=new URLSearchParams(location.search).get('post')
if(slug)showPost(slug).catch(showError);else loadMore()
