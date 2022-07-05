import{S as H,i as S,s as k,F as I,e as p,k as q,c as v,a as C,d as h,m as J,b as d,g as z,J as w,G as D,H as E,I as F,r as V,p as j}from"./index-cba7acec.js";const A=l=>({}),x=l=>({}),B=l=>({}),G=l=>({});function K(l){let t,o,_,u,i,r,f,s;const m=l[4].header,n=I(m,l,l[3],G),g=l[4].content,c=I(g,l,l[3],x);return{c(){t=p("div"),o=p("div"),n&&n.c(),u=q(),i=p("div"),c&&c.c(),this.h()},l(e){t=v(e,"DIV",{class:!0});var a=C(t);o=v(a,"DIV",{class:!0});var y=C(o);n&&n.l(y),y.forEach(h),u=J(a),i=v(a,"DIV",{class:!0});var b=C(i);c&&c.l(b),b.forEach(h),a.forEach(h),this.h()},h(){d(o,"class",_=`flex flex-row justify-center items-center
        w-full pl-4 pr-4 space-x-6
        ${l[1]}`),d(i,"class",r=`flex flex-col grow space-y-2 
        w-full p-1
        ${l[2]}`),d(t,"class",f=`flex flex-col items-center space-y-2 
    rounded-lg bg-slate-800
    p-3 pt-2
    ${l[0]}`)},m(e,a){z(e,t,a),w(t,o),n&&n.m(o,null),w(t,u),w(t,i),c&&c.m(i,null),s=!0},p(e,[a]){n&&n.p&&(!s||a&8)&&D(n,m,e,e[3],s?F(m,e[3],a,B):E(e[3]),G),(!s||a&2&&_!==(_=`flex flex-row justify-center items-center
        w-full pl-4 pr-4 space-x-6
        ${e[1]}`))&&d(o,"class",_),c&&c.p&&(!s||a&8)&&D(c,g,e,e[3],s?F(g,e[3],a,A):E(e[3]),x),(!s||a&4&&r!==(r=`flex flex-col grow space-y-2 
        w-full p-1
        ${e[2]}`))&&d(i,"class",r),(!s||a&1&&f!==(f=`flex flex-col items-center space-y-2 
    rounded-lg bg-slate-800
    p-3 pt-2
    ${e[0]}`))&&d(t,"class",f)},i(e){s||(V(n,e),V(c,e),s=!0)},o(e){j(n,e),j(c,e),s=!1},d(e){e&&h(t),n&&n.d(e),c&&c.d(e)}}}function L(l,t,o){let{$$slots:_={},$$scope:u}=t,{class:i=""}=t,{headerClass:r=""}=t,{contentClass:f=""}=t;return l.$$set=s=>{"class"in s&&o(0,i=s.class),"headerClass"in s&&o(1,r=s.headerClass),"contentClass"in s&&o(2,f=s.contentClass),"$$scope"in s&&o(3,u=s.$$scope)},[i,r,f,u,_]}class N extends H{constructor(t){super(),S(this,t,L,K,k,{class:0,headerClass:1,contentClass:2})}}export{N as F};
