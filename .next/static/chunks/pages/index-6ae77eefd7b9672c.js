(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[405],{5557:function(e,t,r){(window.__NEXT_P=window.__NEXT_P||[]).push(["/",function(){return r(3171)}])},880:function(e,t,r){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var i=r(2253),o=r(4932),n=r(7702),a=r(1309),s=r(4586);Object.defineProperty(t,"__esModule",{value:!0}),Object.defineProperty(t,"Image",{enumerable:!0,get:function(){return z}});var l=r(8754),u=r(1757)._(r(7294)),c=l._(r(3935)),d=l._(r(4605)),f=r(3405),p=r(2269),g=r(5264);r(3213);var h=r(5734),m=l._(r(2854)),v={deviceSizes:[640,750,828,1080,1200,1920,2048,3840],imageSizes:[16,32,48,64,96,128,256,384],path:"/_next/image",loader:"default",dangerouslyAllowSVG:!1,unoptimized:!1};function y(e,t,r,n,a,s){var l=null==e?void 0:e.src;e&&e["data-loaded-src"]!==l&&(e["data-loaded-src"]=l,("decode"in e?e.decode():Promise.resolve()).catch(function(){}).then(function(){if(e.parentElement&&e.isConnected){if("empty"!==t&&a(!0),null==r?void 0:r.current){var s=new Event("load");Object.defineProperty(s,"target",{writable:!1,value:e});var l=!1,u=!1;r.current(o._(i._({},s),{nativeEvent:s,currentTarget:e,target:e,isDefaultPrevented:function(){return l},isPropagationStopped:function(){return u},persist:function(){},preventDefault:function(){l=!0,s.preventDefault()},stopPropagation:function(){u=!0,s.stopPropagation()}}))}(null==n?void 0:n.current)&&n.current(e)}}))}function b(e){var t=a._(u.version.split("."),2),r=t[0],i=t[1],o=parseInt(r,10),n=parseInt(i,10);return o>18||18===o&&n>=3?{fetchPriority:e}:{fetchpriority:e}}var _=(0,u.forwardRef)(function(e,t){var r=e.src,a=e.srcSet,s=e.sizes,l=e.height,c=e.width,d=e.decoding,f=e.className,p=e.style,g=e.fetchPriority,h=e.placeholder,m=e.loading,v=e.unoptimized,_=e.fill,w=e.onLoadRef,z=e.onLoadingCompleteRef,S=e.setBlurComplete,j=e.setShowAltText,P=(e.onLoad,e.onError),C=n._(e,["src","srcSet","sizes","height","width","decoding","className","style","fetchPriority","placeholder","loading","unoptimized","fill","onLoadRef","onLoadingCompleteRef","setBlurComplete","setShowAltText","onLoad","onError"]);return u.default.createElement("img",o._(i._({},C,b(g)),{loading:m,width:c,height:l,decoding:d,"data-nimg":_?"fill":"1",className:f,style:p,sizes:s,srcSet:a,src:r,ref:(0,u.useCallback)(function(e){t&&("function"==typeof t?t(e):"object"==typeof t&&(t.current=e)),e&&(P&&(e.src=e.src),e.complete&&y(e,h,w,z,S,v))},[r,h,w,z,S,P,v,t]),onLoad:function(e){y(e.currentTarget,h,w,z,S,v)},onError:function(e){j(!0),"empty"!==h&&S(!0),P&&P(e)}}))});function w(e){var t=e.isAppRouter,r=e.imgAttributes,o=i._({as:"image",imageSrcSet:r.srcSet,imageSizes:r.sizes,crossOrigin:r.crossOrigin,referrerPolicy:r.referrerPolicy},b(r.fetchPriority));return t&&c.default.preload?(c.default.preload(r.src,o),null):u.default.createElement(d.default,null,u.default.createElement("link",i._({key:"__nimg-"+r.src+r.srcSet+r.sizes,rel:"preload",href:r.srcSet?void 0:r.src},o)))}var z=(0,u.forwardRef)(function(e,t){var r=(0,u.useContext)(h.RouterContext),n=(0,u.useContext)(g.ImageConfigContext),l=(0,u.useMemo)(function(){var e=v||n||p.imageConfigDefault,t=s._(e.deviceSizes).concat(s._(e.imageSizes)).sort(function(e,t){return e-t}),r=e.deviceSizes.sort(function(e,t){return e-t});return o._(i._({},e),{allSizes:t,deviceSizes:r})},[n]),c=e.onLoad,d=e.onLoadingComplete,y=(0,u.useRef)(c);(0,u.useEffect)(function(){y.current=c},[c]);var b=(0,u.useRef)(d);(0,u.useEffect)(function(){b.current=d},[d]);var z=a._((0,u.useState)(!1),2),S=z[0],j=z[1],P=a._((0,u.useState)(!1),2),C=P[0],x=P[1],E=(0,f.getImgProps)(e,{defaultLoader:m.default,imgConf:l,blurComplete:S,showAltText:C}),R=E.props,O=E.meta;return u.default.createElement(u.default.Fragment,null,u.default.createElement(_,o._(i._({},R),{unoptimized:O.unoptimized,placeholder:O.placeholder,fill:O.fill,onLoadRef:y,onLoadingCompleteRef:b,setBlurComplete:j,setShowAltText:x,ref:t})),O.priority?u.default.createElement(w,{isAppRouter:!r,imgAttributes:R}):null)});("function"==typeof t.default||"object"==typeof t.default&&null!==t.default)&&void 0===t.default.__esModule&&(Object.defineProperty(t.default,"__esModule",{value:!0}),Object.assign(t.default,t),e.exports=t.default)},3405:function(e,t,r){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var i=r(2253),o=r(4932),n=r(7702);r(1309);var a=r(4586);Object.defineProperty(t,"__esModule",{value:!0}),Object.defineProperty(t,"getImgProps",{enumerable:!0,get:function(){return d}}),r(3213);var s=r(7736),l=r(2269);function u(e){return void 0!==e.default}function c(e){return void 0===e?e:"number"==typeof e?Number.isFinite(e)?e:NaN:"string"==typeof e&&/^[0-9]+$/.test(e)?parseInt(e,10):NaN}function d(e,t){var r,d,f,p=e.src,g=e.sizes,h=e.unoptimized,m=void 0!==h&&h,v=e.priority,y=void 0!==v&&v,b=e.loading,_=e.className,w=e.quality,z=e.width,S=e.height,j=e.fill,P=void 0!==j&&j,C=e.style,x=(e.onLoad,e.onLoadingComplete,e.placeholder),E=void 0===x?"empty":x,R=e.blurDataURL,O=e.fetchPriority,L=e.layout,I=e.objectFit,N=e.objectPosition,A=(e.lazyBoundary,e.lazyRoot,n._(e,["src","sizes","unoptimized","priority","loading","className","quality","width","height","fill","style","onLoad","onLoadingComplete","placeholder","blurDataURL","fetchPriority","layout","objectFit","objectPosition","lazyBoundary","lazyRoot"])),k=t.imgConf,M=t.showAltText,D=t.blurComplete,B=t.defaultLoader,F=k||l.imageConfigDefault;if("allSizes"in F)U=F;else{var T=a._(F.deviceSizes).concat(a._(F.imageSizes)).sort(function(e,t){return e-t}),W=F.deviceSizes.sort(function(e,t){return e-t});U=o._(i._({},F),{allSizes:T,deviceSizes:W})}var q=A.loader||B;delete A.loader,delete A.srcSet;var G="__next_img_default"in q;if(G){if("custom"===U.loader)throw Error('Image with src "'+p+'" is missing "loader" prop.\nRead more: https://nextjs.org/docs/messages/next-image-missing-loader')}else{var U,H=q;q=function(e){return e.config,H(n._(e,["config"]))}}if(L){"fill"===L&&(P=!0);var V={intrinsic:{maxWidth:"100%",height:"auto"},responsive:{width:"100%",height:"auto"}}[L];V&&(C=i._({},C,V));var J={responsive:"100vw",fill:"100vw"}[L];J&&!g&&(g=J)}var X="",Y=c(z),$=c(S);if("object"==typeof(r=p)&&(u(r)||void 0!==r.src)){var K=u(p)?p.default:p;if(!K.src)throw Error("An object should only be passed to the image component src parameter if it comes from a static image import. It must include src. Received "+JSON.stringify(K));if(!K.height||!K.width)throw Error("An object should only be passed to the image component src parameter if it comes from a static image import. It must include height and width. Received "+JSON.stringify(K));if(d=K.blurWidth,f=K.blurHeight,R=R||K.blurDataURL,X=K.src,!P){if(Y||$){if(Y&&!$){var Q=Y/K.width;$=Math.round(K.height*Q)}else if(!Y&&$){var Z=$/K.height;Y=Math.round(K.width*Z)}}else Y=K.width,$=K.height}}var ee=!y&&("lazy"===b||void 0===b);(!(p="string"==typeof p?p:X)||p.startsWith("data:")||p.startsWith("blob:"))&&(m=!0,ee=!1),U.unoptimized&&(m=!0),G&&p.endsWith(".svg")&&!U.dangerouslyAllowSVG&&(m=!0),y&&(O="high");var et=c(w),er=Object.assign(P?{position:"absolute",height:"100%",width:"100%",left:0,top:0,right:0,bottom:0,objectFit:I,objectPosition:N}:{},M?{}:{color:"transparent"},C),ei=D||"empty"===E?null:"blur"===E?'url("data:image/svg+xml;charset=utf-8,'+(0,s.getImageBlurSvg)({widthInt:Y,heightInt:$,blurWidth:d,blurHeight:f,blurDataURL:R||"",objectFit:er.objectFit})+'")':'url("'+E+'")',eo=ei?{backgroundSize:er.objectFit||"cover",backgroundPosition:er.objectPosition||"50% 50%",backgroundRepeat:"no-repeat",backgroundImage:ei}:{},en=function(e){var t=e.config,r=e.src,i=e.unoptimized,o=e.width,n=e.quality,s=e.sizes,l=e.loader;if(i)return{src:r,srcSet:void 0,sizes:void 0};var u=function(e,t,r){var i=e.deviceSizes,o=e.allSizes;if(r){for(var n=/(^|\s)(1?\d?\d)vw/g,s=[];l=n.exec(r);l)s.push(parseInt(l[2]));if(s.length){var l,u,c=.01*(u=Math).min.apply(u,a._(s));return{widths:o.filter(function(e){return e>=i[0]*c}),kind:"w"}}return{widths:o,kind:"w"}}return"number"!=typeof t?{widths:i,kind:"w"}:{widths:a._(new Set([t,2*t].map(function(e){return o.find(function(t){return t>=e})||o[o.length-1]}))),kind:"x"}}(t,o,s),c=u.widths,d=u.kind,f=c.length-1;return{sizes:s||"w"!==d?s:"100vw",srcSet:c.map(function(e,i){return l({config:t,src:r,quality:n,width:e})+" "+("w"===d?e:i+1)+d}).join(", "),src:l({config:t,src:r,quality:n,width:c[f]})}}({config:U,src:p,unoptimized:m,width:Y,quality:et,sizes:g,loader:q});return{props:o._(i._({},A),{loading:ee?"lazy":b,fetchPriority:O,width:Y,height:$,decoding:"async",className:_,style:i._({},er,eo),sizes:en.sizes,srcSet:en.srcSet,src:en.src}),meta:{unoptimized:m,priority:y,placeholder:E,fill:P}}}},7736:function(e,t){"use strict";function r(e){var t=e.widthInt,r=e.heightInt,i=e.blurWidth,o=e.blurHeight,n=e.blurDataURL,a=e.objectFit,s=i?40*i:t,l=o?40*o:r,u=s&&l?"viewBox='0 0 "+s+" "+l+"'":"";return"%3Csvg xmlns='http://www.w3.org/2000/svg' "+u+"%3E%3Cfilter id='b' color-interpolation-filters='sRGB'%3E%3CfeGaussianBlur stdDeviation='20'/%3E%3CfeColorMatrix values='1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 100 -1' result='s'/%3E%3CfeFlood x='0' y='0' width='100%25' height='100%25'/%3E%3CfeComposite operator='out' in='s'/%3E%3CfeComposite in2='SourceGraphic'/%3E%3CfeGaussianBlur stdDeviation='20'/%3E%3C/filter%3E%3Cimage width='100%25' height='100%25' x='0' y='0' preserveAspectRatio='"+(u?"none":"contain"===a?"xMidYMid":"cover"===a?"xMidYMid slice":"none")+"' style='filter: url(%23b);' href='"+n+"'/%3E%3C/svg%3E"}Object.defineProperty(t,"__esModule",{value:!0}),Object.defineProperty(t,"getImageBlurSvg",{enumerable:!0,get:function(){return r}})},5365:function(e,t,r){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var i=r(1309);Object.defineProperty(t,"__esModule",{value:!0}),function(e,t){for(var r in t)Object.defineProperty(e,r,{enumerable:!0,get:t[r]})}(t,{default:function(){return c},unstable_getImgProps:function(){return u}});var o=r(8754),n=r(3405),a=r(3213),s=r(880),l=o._(r(2854)),u=function(e){(0,a.warnOnce)("Warning: unstable_getImgProps() is experimental and may change or be removed at any time. Use at your own risk.");var t=(0,n.getImgProps)(e,{defaultLoader:l.default,imgConf:{deviceSizes:[640,750,828,1080,1200,1920,2048,3840],imageSizes:[16,32,48,64,96,128,256,384],path:"/_next/image",loader:"default",dangerouslyAllowSVG:!1,unoptimized:!1}}).props,r=!0,o=!1,s=void 0;try{for(var u,c=Object.entries(t)[Symbol.iterator]();!(r=(u=c.next()).done);r=!0){var d=i._(u.value,2),f=d[0],p=d[1];void 0===p&&delete t[f]}}catch(e){o=!0,s=e}finally{try{r||null==c.return||c.return()}finally{if(o)throw s}}return{props:t}},c=s.Image},2854:function(e,t){"use strict";function r(e){var t=e.config,r=e.src,i=e.width,o=e.quality;return t.path+"?url="+encodeURIComponent(r)+"&w="+i+"&q="+(o||75)}Object.defineProperty(t,"__esModule",{value:!0}),Object.defineProperty(t,"default",{enumerable:!0,get:function(){return i}}),r.__next_img_default=!0;var i=r},3171:function(e,t,r){"use strict";r.r(t),r.d(t,{default:function(){return s}});var i=r(5893),o=r(5675),n=r.n(o),a={src:"/_next/static/media/logo.7f01b434.svg",height:595,width:842,blurWidth:0,blurHeight:0},s=function(){return(0,i.jsx)("div",{className:"App",children:(0,i.jsxs)("header",{className:"App-header",children:[(0,i.jsx)(n(),{src:a,className:"App-logo",alt:"logo"}),(0,i.jsxs)("p",{children:["Edit ",(0,i.jsx)("code",{children:"src/App.js"})," and save to reload."]}),(0,i.jsx)("a",{className:"App-link",href:"https://reactjs.org",target:"_blank",rel:"noopener noreferrer",children:"Learn React"})]})})}},5675:function(e,t,r){e.exports=r(5365)}},function(e){e.O(0,[774,888,179],function(){return e(e.s=5557)}),_N_E=e.O()}]);