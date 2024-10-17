export const code = `var Auth=function(){"use strict";var zt=Object.defineProperty;var Ct=(d,p,b)=>p in d?zt(d,p,{enumerable:!0,configurable:!0,writable:!0,value:b}):d[p]=b;var h=(d,p,b)=>(Ct(d,typeof p!="symbol"?p+"":p,b),b);function d(){}function p(e){return e()}function b(){return Object.create(null)}function j(e){e.forEach(p)}function V(e){return typeof e=="function"}function S(e,t){return e!=e?t==t:e!==t||e&&typeof e=="object"||typeof e=="function"}function it(e){return Object.keys(e).length===0}function g(e,t){e.appendChild(t)}function G(e,t,n){const s=ot(e);if(!s.getElementById(t)){const i=_("style");i.id=t,i.textContent=n,ut(s,i)}}function ot(e){if(!e)return document;const t=e.getRootNode?e.getRootNode():e.ownerDocument;return t&&t.host?t:e.ownerDocument}function ut(e,t){return g(e.head||e,t),t.sheet}function O(e,t,n){e.insertBefore(t,n||null)}function k(e){e.parentNode&&e.parentNode.removeChild(e)}function _(e){return document.createElement(e)}function K(e){return document.createTextNode(e)}function A(){return K(" ")}function ct(e,t,n,s){return e.addEventListener(t,n,s),()=>e.removeEventListener(t,n,s)}function f(e,t,n){n==null?e.removeAttribute(t):e.getAttribute(t)!==n&&e.setAttribute(t,n)}function lt(e){return Array.from(e.childNodes)}function ft(e,t){t=""+t,e.data!==t&&(e.data=t)}function at(e){const t={};return e.childNodes.forEach(n=>{t[n.slot||"default"]=!0}),t}let z;function C(e){z=e}function $t(){if(!z)throw new Error("Function called outside component initialization");return z}function dt(e){$t().$$.on_mount.push(e)}const x=[],Q=[];let y=[];const W=[],ht=Promise.resolve();let M=!1;function gt(){M||(M=!0,ht.then(X))}function B(e){y.push(e)}const R=new Set;let q=0;function X(){if(q!==0)return;const e=z;do{try{for(;q<x.length;){const t=x[q];q++,C(t),mt(t.$$)}}catch(t){throw x.length=0,q=0,t}for(C(null),x.length=0,q=0;Q.length;)Q.pop()();for(let t=0;t<y.length;t+=1){const n=y[t];R.has(n)||(R.add(n),n())}y.length=0}while(x.length);for(;W.length;)W.pop()();M=!1,R.clear(),C(e)}function mt(e){if(e.fragment!==null){e.update(),j(e.before_update);const t=e.dirty;e.dirty=[-1],e.fragment&&e.fragment.p(e.ctx,t),e.after_update.forEach(B)}}function pt(e){const t=[],n=[];y.forEach(s=>e.indexOf(s)===-1?t.push(s):n.push(s)),n.forEach(s=>s()),y=t}const P=new Set;let _t;function T(e,t){e&&e.i&&(P.delete(e),e.i(t))}function Y(e,t,n,s){if(e&&e.o){if(P.has(e))return;P.add(e),_t.c.push(()=>{P.delete(e),s&&(n&&e.d(1),s())}),e.o(t)}else s&&s()}function Z(e){e&&e.c()}function I(e,t,n){const{fragment:s,after_update:i}=e.$$;s&&s.m(t,n),B(()=>{const r=e.$$.on_mount.map(p).filter(V);e.$$.on_destroy?e.$$.on_destroy.push(...r):j(r),e.$$.on_mount=[]}),i.forEach(B)}function F(e,t){const n=e.$$;n.fragment!==null&&(pt(n.after_update),j(n.on_destroy),n.fragment&&n.fragment.d(t),n.on_destroy=n.fragment=null,n.ctx=[])}function bt(e,t){e.$$.dirty[0]===-1&&(x.push(e),gt(),e.$$.dirty.fill(0)),e.$$.dirty[t/31|0]|=1<<t%31}function H(e,t,n,s,i,r,o=null,l=[-1]){const c=z;C(e);const u=e.$$={fragment:null,ctx:[],props:r,update:d,not_equal:i,bound:b(),on_mount:[],on_destroy:[],on_disconnect:[],before_update:[],after_update:[],context:new Map(t.context||(c?c.$$.context:[])),callbacks:b(),dirty:l,skip_bound:!1,root:t.target||c.$$.root};o&&o(u.root);let v=!1;if(u.ctx=n?n(e,t.props||{},(a,w,...E)=>{const L=E.length?E[0]:w;return u.ctx&&i(u.ctx[a],u.ctx[a]=L)&&(!u.skip_bound&&u.bound[a]&&u.bound[a](L),v&&bt(e,a)),w}):[],u.update(),v=!0,j(u.before_update),u.fragment=s?s(u.ctx):!1,t.target){if(t.hydrate){const a=lt(t.target);u.fragment&&u.fragment.l(a),a.forEach(k)}else u.fragment&&u.fragment.c();t.intro&&T(e.$$.fragment),I(e,t.target,t.anchor),X()}C(c)}let tt;typeof HTMLElement=="function"&&(tt=class extends HTMLElement{constructor(t,n,s){super();h(this,"$$ctor");h(this,"$$s");h(this,"$$c");h(this,"$$cn",!1);h(this,"$$d",{});h(this,"$$r",!1);h(this,"$$p_d",{});h(this,"$$l",{});h(this,"$$l_u",new Map);this.$$ctor=t,this.$$s=n,s&&this.attachShadow({mode:"open"})}addEventListener(t,n,s){if(this.$$l[t]=this.$$l[t]||[],this.$$l[t].push(n),this.$$c){const i=this.$$c.$on(t,n);this.$$l_u.set(n,i)}super.addEventListener(t,n,s)}removeEventListener(t,n,s){if(super.removeEventListener(t,n,s),this.$$c){const i=this.$$l_u.get(n);i&&(i(),this.$$l_u.delete(n))}}async connectedCallback(){if(this.$$cn=!0,!this.$$c){let t=function(r){return()=>{let o;return{c:function(){o=_("slot"),r!=="default"&&f(o,"name",r)},m:function(u,v){O(u,o,v)},d:function(u){u&&k(o)}}}};if(await Promise.resolve(),!this.$$cn||this.$$c)return;const n={},s=at(this);for(const r of this.$$s)r in s&&(n[r]=[t(r)]);for(const r of this.attributes){const o=this.$$g_p(r.name);o in this.$$d||(this.$$d[o]=N(o,r.value,this.$$p_d,"toProp"))}for(const r in this.$$p_d)!(r in this.$$d)&&this[r]!==void 0&&(this.$$d[r]=this[r],delete this[r]);this.$$c=new this.$$ctor({target:this.shadowRoot||this,props:{...this.$$d,$$slots:n,$$scope:{ctx:[]}}});const i=()=>{this.$$r=!0;for(const r in this.$$p_d)if(this.$$d[r]=this.$$c.$$.ctx[this.$$c.$$.props[r]],this.$$p_d[r].reflect){const o=N(r,this.$$d[r],this.$$p_d,"toAttribute");o==null?this.removeAttribute(this.$$p_d[r].attribute||r):this.setAttribute(this.$$p_d[r].attribute||r,o)}this.$$r=!1};this.$$c.$$.after_update.push(i),i();for(const r in this.$$l)for(const o of this.$$l[r]){const l=this.$$c.$on(r,o);this.$$l_u.set(o,l)}this.$$l={}}}attributeChangedCallback(t,n,s){var i;this.$$r||(t=this.$$g_p(t),this.$$d[t]=N(t,s,this.$$p_d,"toProp"),(i=this.$$c)==null||i.$set({[t]:this.$$d[t]}))}disconnectedCallback(){this.$$cn=!1,Promise.resolve().then(()=>{this.$$cn||(this.$$c.$destroy(),this.$$c=void 0)})}$$g_p(t){return Object.keys(this.$$p_d).find(n=>this.$$p_d[n].attribute===t||!this.$$p_d[n].attribute&&n.toLowerCase()===t)||t}});function N(e,t,n,s){var r;const i=(r=n[e])==null?void 0:r.type;if(t=i==="Boolean"&&typeof t!="boolean"?t!=null:t,!s||!n[e])return t;if(s==="toAttribute")switch(i){case"Object":case"Array":return t==null?null:JSON.stringify(t);case"Boolean":return t?"":null;case"Number":return t??null;default:return t}else switch(i){case"Object":case"Array":return t&&JSON.parse(t);case"Boolean":return t;case"Number":return t!=null?+t:t;default:return t}}function U(e,t,n,s,i,r){let o=class extends tt{constructor(){super(e,n,i),this.$$p_d=t}static get observedAttributes(){return Object.keys(t).map(l=>(t[l].attribute||l).toLowerCase())}};return Object.keys(t).forEach(l=>{Object.defineProperty(o.prototype,l,{get(){return this.$$c&&l in this.$$c?this.$$c[l]:this.$$d[l]},set(c){var u;c=N(l,c,t),this.$$d[l]=c,(u=this.$$c)==null||u.$set({[l]:c})}})}),s.forEach(l=>{Object.defineProperty(o.prototype,l,{get(){var c;return(c=this.$$c)==null?void 0:c[l]}})}),r&&(o=r(o)),e.element=o,o}class D{constructor(){h(this,"$$");h(this,"$$set")}$destroy(){F(this,1),this.$destroy=d}$on(t,n){if(!V(n))return d;const s=this.$$.callbacks[t]||(this.$$.callbacks[t]=[]);return s.push(n),()=>{const i=s.indexOf(n);i!==-1&&s.splice(i,1)}}$set(t){this.$$set&&!it(t)&&(this.$$.skip_bound=!0,this.$$set(t),this.$$.skip_bound=!1)}}const vt="4";typeof window<"u"&&(window.__svelte||(window.__svelte={v:new Set})).v.add(vt);function wt(e){G(e,"svelte-zia5ex","footer.svelte-zia5ex.svelte-zia5ex{margin-top:2rem;font-size:0.8rem}footer.svelte-zia5ex a.svelte-zia5ex{color:#333}footer.svelte-zia5ex svg.svelte-zia5ex{margin-top:1rem;height:1.5rem;width:1.5rem}")}function xt(e){let t;return{c(){t=_("footer"),t.innerHTML=\`<p><a href="https://github.com/hintergrund-dev/auth" target="_blank" class="svelte-zia5ex"><svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" class="svelte-zia5ex"><path d="M511.6 76.3C264.3 76.2 64 276.4 64 523.5 64 718.9 189.3 885 363.8 946c23.5 5.9 19.9-10.8 19.9-22.2v-77.5c-135.7 15.9-141.2-73.9-150.3-88.9C215 726 171.5 718 184.5 703c30.9-15.9 62.4 4 98.9 57.9 26.4 39.1 77.9 32.5 104 26 5.7-23.5 17.9-44.5 34.7-60.8-140.6-25.2-199.2-111-199.2-213 0-49.5 16.3-95 48.3-131.7-20.4-60.5 1.9-112.3 4.9-120 58.1-5.2 118.5 41.6 123.2 45.3 33-8.9 70.7-13.6 112.9-13.6 42.4 0 80.2 4.9 113.5 13.9 11.3-8.6 67.3-48.8 121.3-43.9 2.9 7.7 24.7 58.3 5.5 118 32.4 36.8 48.9 82.7 48.9 132.3 0 102.2-59 188.1-200 212.9a127.5 127.5 0 0 1 38.1 91v112.5c.8 9 0 17.9 15 17.9 177.1-59.7 304.6-227 304.6-424.1 0-247.2-200.4-447.3-447.5-447.3z"></path></svg> </a><br/>
		powered by <a href="hintergrund.dev" target="_blank" class="svelte-zia5ex">hintergrund.dev</a></p>\`,f(t,"class","svelte-zia5ex")},m(n,s){O(n,t,s)},p:d,i:d,o:d,d(n){n&&k(t)}}}class et extends D{constructor(t){super(),H(this,t,null,xt,S,{},wt)}}U(et,{},[],[],!0);function yt(e){G(e,"svelte-ue85gq","*, *::before, *::after{box-sizing:border-box}#container.svelte-ue85gq.svelte-ue85gq{font-family:-apple-system, BlinkMacSystemFont, Arial, sans-serif;text-align:center;color:#333;height:100dvh;display:flex;flex-direction:column}#container.svelte-ue85gq .svelte-ue85gq{box-sizing:border-box}main.svelte-ue85gq.svelte-ue85gq{flex-grow:1;width:100%;display:flex;justify-content:center;align-items:center}h2.svelte-ue85gq.svelte-ue85gq{margin:2rem;font-weight:200}form.svelte-ue85gq.svelte-ue85gq{display:flex;flex-direction:column;justify-content:center;align-items:center;padding:2rem;color:#333;background-color:#fff;box-shadow:0 0 10px rgba(0, 0, 0, 0.2);width:30%;position:relative}input.svelte-ue85gq.svelte-ue85gq{width:100%;padding:0.5rem;margin:0.5rem 0;border:1px solid #ccc;border-radius:5px;outline:none}input.svelte-ue85gq.svelte-ue85gq:focus{border-color:#333}input[type=submit].svelte-ue85gq.svelte-ue85gq{background-color:#333;color:#fff;cursor:pointer;width:100%}@media(max-width: 1000px){form.svelte-ue85gq.svelte-ue85gq{width:50%}}@media(max-width: 600px){form.svelte-ue85gq.svelte-ue85gq{width:80%}}.error.svelte-ue85gq.svelte-ue85gq{position:absolute;color:red;bottom:0;font-size:0.8rem}")}function nt(e){let t,n;return{c(){t=_("p"),n=K(e[0]),f(t,"class","error svelte-ue85gq")},m(s,i){O(s,t,i),g(t,n)},p(s,i){i&1&&ft(n,s[0])},d(s){s&&k(t)}}}function qt(e){let t,n,s,i,r,o,l,c,u,v,a,w,E,L,$=e[0]&&nt(e);return a=new et({}),{c(){t=_("div"),n=_("main"),s=_("form"),i=_("h2"),i.textContent="Log in",r=A(),o=_("input"),l=A(),c=_("input"),u=A(),$&&$.c(),v=A(),Z(a.$$.fragment),f(i,"class","svelte-ue85gq"),f(o,"type","password"),f(o,"id","password"),f(o,"name","password"),f(o,"placeholder","Password"),f(o,"class","svelte-ue85gq"),f(c,"type","submit"),f(c,"name","submit"),f(c,"id","submit"),c.value="Login",f(c,"class","svelte-ue85gq"),f(s,"action","/auth/login"),f(s,"method","POST"),f(s,"class","svelte-ue85gq"),f(n,"class","svelte-ue85gq"),f(t,"id","container"),f(t,"class","svelte-ue85gq")},m(m,J){O(m,t,J),g(t,n),g(n,s),g(s,i),g(s,r),g(s,o),g(s,l),g(s,c),g(s,u),$&&$.m(s,null),g(t,v),I(a,t,null),w=!0,E||(L=ct(o,"input",e[1]),E=!0)},p(m,[J]){m[0]?$?$.p(m,J):($=nt(m),$.c(),$.m(s,null)):$&&($.d(1),$=null)},i(m){w||(T(a.$$.fragment,m),w=!0)},o(m){Y(a.$$.fragment,m),w=!1},d(m){m&&k(t),$&&$.d(),F(a),E=!1,L()}}}function Et(e,t,n){let s="";return dt(()=>{const o=new URLSearchParams(window.location.search).get("error");o&&n(0,s=decodeURIComponent(o))}),[s,()=>n(0,s="")]}class st extends D{constructor(t){super(),H(this,t,Et,qt,S,{},yt)}}U(st,{},[],[],!0);function kt(e){let t,n;return t=new st({}),{c(){Z(t.$$.fragment)},m(s,i){I(t,s,i),n=!0},p:d,i(s){n||(T(t.$$.fragment,s),n=!0)},o(s){Y(t.$$.fragment,s),n=!1},d(s){F(t,s)}}}class rt extends D{constructor(t){super(),H(this,t,null,kt,S,{})}}return customElements.define("hg-login",U(rt,{},[],[],!0)),rt}();
`;