//controller

//find elements navigation

function CONTROLLERLOG(...args) {
  //console.log(...args);
}

var EXCLUSIONS = "iframe,html,body,script,noscript,head *,#jsPanel-1,#jsPanel-1 *,#srs-svg,#srs-svg *,style";
var FORCESTOP = "img";

function hasDirectText(elem) {
  if (elem.matches(FORCESTOP)) {
    return true;
  }

  let clone = elem.cloneNode(true);
  clone.normalize();
  return !!(clone.firstChild &&
            clone.firstChild.nodeType == Node.TEXT_NODE &&
            clone.firstChild.nodeValue.trim() != "");
}

function isVisible(elt) {
  let rect = elt.getBoundingClientRect();
  let hasVisibleRect =
         rect.width > 0 &&
         rect.height > 0 &&
         // shouldn't check top due to scroll
         //rect.top >= 0 &&
         rect.left >= 0;
  let isNotHidden = (elt.nodeName.toLowerCase() == "img") || window.getComputedStyle(elt,null).visibility != "hidden";
  return hasVisibleRect && isNotHidden;
}

function goToNextElement(from, type, direction = "forward", goInside = true) {
  let allElementsOfType = Array.prototype.slice.call(document.querySelectorAll(type));
  //let allElementsOfType = document.querySelectorAll(type);

  CONTROLLERLOG(`/=================\\\nLooking for next "${type}"" element from `, from, ` with direction=${direction}, goInside=${goInside}`);

  if (direction == "backwards") {
    allElementsOfType.reverse();
  }

  for (let i = 0; i < allElementsOfType.length; i++) {
    let elem = allElementsOfType[i];
    

    CONTROLLERLOG("checking ", elem, "which is ", i);

    if (elem.matches(EXCLUSIONS)) {
      //CONTROLLERLOG("excluded");
      continue;
    }

    

    //CONTROLLERLOG("hasDirectText: " + hasDirectText(elem));

    let match = false;

    let relativePos = from.compareDocumentPosition(elem);

    switch (direction) {
      case "forward":
        match = goInside
            ? (relativePos & document.DOCUMENT_POSITION_FOLLOWING)
            : (relativePos & document.DOCUMENT_POSITION_FOLLOWING) && !(relativePos & document.DOCUMENT_POSITION_CONTAINED_BY);
        break;

      case "backwards":
        match = goInside
            ? (relativePos & document.DOCUMENT_POSITION_PRECEDING)
            : (relativePos & document.DOCUMENT_POSITION_PRECEDING) && !(relativePos & document.DOCUMENT_POSITION_CONTAINS);
        break;
    }

    if (match) {
      if (!hasDirectText(elem)) {
        if (elem.firstElementChild &&
            elem.textContent.trim() != "") {
          for (j = 0; j < elem.children.length; j++) {
            let newElem = elem.children[j];
            if (!allElementsOfType.includes(newElem) &&
                newElem.textContent.trim() != "") {
              CONTROLLERLOG("splicing", newElem);
              //CONTROLLERLOG(`i=${i}, len=${allElementsOfType.length}`);
              allElementsOfType.splice(i+1, 0, newElem);
              // i++;
              //CONTROLLERLOG(`i=${i}, len=${allElementsOfType.length}`);
            }
          }
        }
        continue;
      }

      CONTROLLERLOG("FOUND MATCH: ", elem);
      CONTROLLERLOG("\\=================/")
      return elem;
    }
  }

  return null;
}

document.addEventListener("DOMContentLoaded", function() {
  selectedELEM = document.body;
  N();
});

function N(selector = "**", direction = "forward", goInside = true) {
  if (selector == "**") {
    selector = "p,li,a,h1,h2,h3,h4,h5,h6,code,pre,img,b,em,div,span"
  }

  let newElem = goToNextElement(selectedELEM, selector, direction, goInside);
  if (!newElem) {
    CONTROLLERLOG("not found");
    return;
  }
  selectedELEM = newElem;
  
try {
  if (isVisible(selectedELEM)) {
    selectedELEM.scrollIntoView({behavior:"smooth", block:"center", inline:"nearest"});
    punchHoleAtElt(selectedELEM);
  } else {
    closeHole();
  }
  adjustText();
  selectedELEM.focus();
} catch (e) { console.log("error on N:", e)}
}

function adjustText() {
  console.log("adjust text", selectedELEM);
  if (isVisible(selectedELEM)) {
    console.log("isvisible");
    if (selectedELEM.matches(FORCESTOP)) {
      console.log("matches");
      setInvisibleText(selectedELEM);
    } else {
      console.log("doesnt match");
      clearInvisibleText();
    }
  } else {
    console.log("setInvisibleText");
    setInvisibleText(selectedELEM);
  }

  if (selectedELEM.nodeName.toLowerCase() == "a" &&
      selectedELEM.getAttribute("title")) {
    let linktitle = selectedELEM.getAttribute("title") || "";
    document.querySelector("#panel-srs-invisible-text .linktitle").firstChild.nodeValue = linktitle;
    document.getElementById("panel-srs-invisible-text").classList.toggle("haslink", true); 
  } else {
    document.getElementById("panel-srs-invisible-text").classList.toggle("haslink", false); 
  }
}

function clearInvisibleText() {
  document.querySelector("#panel-srs-invisible-text > .text").firstChild.nodeValue = " ";
  document.getElementById("panel-srs-invisible-text").classList.toggle("visible", true);
}

function setInvisibleText(elem) {
  let text = "(no alt text available)", nodename = elem.nodeName.toLowerCase();

  switch (nodename) {
    case "img":
      text = elem.getAttribute("alt").trim() || text;
      break;

    case "a":
      if (elem.textContent.trim() != "") {
        text = elem.textContent.trim();
      } else {
        if (elem.firstElementChild &&
            elem.firstElementChild.nodeName.toLowerCase() == "img") {
          text = elem.firstElementChild.getAttribute("alt").trim() || text;
        } else {
          clearInvisibleText();
          return;
        }
      }
      break;

    default:
      text = elem.textContent;
  }

  document.getElementById("panel-srs-invisible-text").classList.toggle("visible", false);
  document.querySelector("#panel-srs-invisible-text > .text").firstChild.nodeValue = text;
}

selectedELEM=document.body;