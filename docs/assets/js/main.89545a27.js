!function(e){function t(n){if(r[n])return r[n].exports;var o=r[n]={i:n,l:!1,exports:{}};return e[n].call(o.exports,o,o.exports,t),o.l=!0,o.exports}var r={};t.m=e,t.c=r,t.i=function(e){return e},t.d=function(e,r,n){t.o(e,r)||Object.defineProperty(e,r,{configurable:!1,enumerable:!0,get:n})},t.n=function(e){var r=e&&e.__esModule?function(){return e.default}:function(){return e};return t.d(r,"a",r),r},t.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},t.p="",t(t.s=3)}([function(e,t,r){"use strict";function n(e){if(Array.isArray(e)){for(var t=0,r=Array(e.length);t<e.length;t++)r[t]=e[t];return r}return Array.from(e)}Object.defineProperty(t,"__esModule",{value:!0});t.shuffle=function(e){for(var t=[].concat(n(e)),r=e.length,o=void 0,a=void 0;r;)a=Math.floor(Math.random()*r),r--,o=t[r],t[r]=t[a],t[a]=o;return t},t.detailsTagSupported=function(){var e=document.createElement("details");if(!("open"in e))return!1;e.innerHTML="<summary>a</summary>b",document.body.appendChild(e);var t=e.offsetHeight;e.open=!0;var r=t!=e.offsetHeight;return document.body.removeChild(e),r}},function(e,t,r){"use strict";function n(e){function t(){document.removeEventListener("DOMContentLoaded",t,!1),window.removeEventListener("load",t,!1),e()}"complete"===document.readyState?setTimeout(e):(document.addEventListener("DOMContentLoaded",t,!1),window.addEventListener("load",t,!1))}Object.defineProperty(t,"__esModule",{value:!0}),t.default=n,e.exports=t.default},function(e,t){},function(e,t,r){"use strict";r(2);var n=r(1),o=function(e){return e&&e.__esModule?e:{default:e}}(n),a=r(0);(0,o.default)(function(){var e=document.body,t=document.querySelectorAll(".taxonomy-cloud ul:not(.no-shuffle)");t.length&&t.forEach(function(e){var t=e.querySelectorAll("li");(0,a.shuffle)(t).forEach(function(e){return e.parentElement.appendChild(e)})});var r=document.querySelector(".entry-toc");if(r&&!(0,a.detailsTagSupported)()){document.body.classList.add("no-details");document.querySelector(".toc-title").addEventListener("click",function(){r.getAttribute("open")?(r.open=!1,r.removeAttribute("open")):(r.open=!0,r.setAttribute("open","open"))})}var n=document.querySelector("#sidebar");if(n){var o=document.querySelector("#sidebar-toggler"),i=document.querySelector(".sidebar-overlay"),d=o.cloneNode(!0);d.setAttribute("id","#sidebar-inner-toggler"),n.appendChild(d);var u=function(){e.classList.remove("sidebar-toggled"),o.classList.remove("is-active"),d.classList.remove("is-active"),o.setAttribute("aria-expanded","false"),d.setAttribute("aria-expanded","false"),n.setAttribute("aria-expanded","false")},c=function(){e.classList.add("sidebar-toggled"),o.classList.add("is-active"),d.classList.add("is-active"),o.setAttribute("aria-expanded","true"),d.setAttribute("aria-expanded","true"),n.setAttribute("aria-expanded","true")},s=function(){return e.classList.contains("sidebar-toggled")?u():c()};n.setAttribute("aria-expanded","false"),o.addEventListener("click",s),d.addEventListener("click",s),i.addEventListener("click",u)}})}]);