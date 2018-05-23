function createStylesheet() {
  var s = document.createElement("style");
  s.id = "srs_stylesheet";
  document.body.appendChild(s);
  return s;
}

var srs_stylesheet = document.getElementById("srs_stylesheet") || createStylesheet();


var W = document.documentElement.scrollWidth;
var H = document.documentElement.scrollHeight;


srs_stylesheet.innerHTML = "\
  #srs-svg {\
    position: absolute;\
    top: 0;\
    width: " + W  +"px;\
    left: 0;\
    height: " + H + "px;\
    z-index: 2147483640;\
  }\
"
function buildPath(punchRect) {
  var str = "M0 0 hW vV h-W Z " +
            "Mx y ve hi v-e Z";
  
 // alert(str);
  //alert(str.replace("W", W));
  var k = 
    str.replace(/W/g, W)
       .replace(/V/g, H)
       .replace(/x/g, punchRect.left)
       .replace(/y/g, punchRect.top + document.documentElement.scrollTop)
       .replace(/i/g, punchRect.width)
       .replace(/e/g, punchRect.height);
  //console.log(k);
return k;
  
}

//alert("path: " + buildPath((document.querySelector("p").getBoundingClientRect())));

function createSvg() {
  var svg = document.getElementById("srs-svg");
  if (svg) {
    return;
    //svg.parentNode.removeChild(svg);
  }
  
  svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", W);
  svg.setAttribute("height", H);
  svg.setAttribute("version", "1.1");
  svg.addEventListener("click", function(e) { e.preventDefault(); selectedELEM.focus(); });
  svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
//  svg.setAttribute("viewBox", "0 0 500 500")
  svg.id = "srs-svg";
  
  var g = document.createElementNS("http://www.w3.org/2000/svg", "g");
  g.setAttribute("fill-rule", "evenodd");
  g.setAttribute("fill", "rgba(210,210,210,1)");
  g.setAttribute("stroke", "red");
  g.setAttribute("stroke-width", "0px");
  svg.appendChild(g);
  
  var path1 = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path1.id = "path-punchhole";
  //path1.setAttribute("d", "M0 0 h200 v200 h-200 Z M20 20 v80 h80 v-80 Z");
  //path1.setAttribute("d", buildPath((document.querySelector("p").getBoundingClientRect())));
  path1.setAttribute("stroke-linejoin", "round");
  g.appendChild(path1);

// var path2 = document.createElementNS("http://www.w3.org/2000/svg", "path");
  //path2.setAttribute("d", "M20 20 v80 h80 v-80 Z");
//  path2.setAttribute("fill", "black");
//  path2.setAttribute("stroke", "white");
  //g.appendChild(path2);


  document.body.appendChild(svg);
}

createSvg();

function punchHoleAtElt(elt) {
  var rect = elt.getBoundingClientRect();
  var path = document.getElementById("path-punchhole");
  path.setAttribute("d", buildPath(rect));
}

function closeHole() {
  var path = document.getElementById("path-punchhole");
  path.setAttribute("d", buildPath({left:0, top:0, width:0, height: 0}));  
}

punchHoleAtElt(document.querySelectorAll("p")[1]);

/*for (let e of document.querySelectorAll("p,li,a,h1,h2,h3,h4,h5,h6,code,pre,img,b,em")) {
  e.setAttribute("tabindex", 0);
}

punchHoleAtElt(document.querySelectorAll("p,li,a,h1,h2,h3,h4,h5,h6,code,pre,img,b,em")[0]);*/

var listenerAdded;
if (!listenerAdded) {
  document.addEventListener("focus", function(e) {
    if (e.target &&
        e.target.matches &&
        !e.target.matches(EXCLUSIONS)) {
     selectedELEM = e.target;
     punchHoleAtElt(e.target);
     //console.log("Selected elem is: ", selectedELEM, "and is visible: ", isVisible(selectedELEM));
     adjustText();
   }
  }, true);
  listenerAAdded = true;
}