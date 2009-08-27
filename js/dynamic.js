<?php	$content = trim(file_get_contents("files.csv"));
		$lines = explode("\n", $content);
		$files = explode(",", $lines[0]);
		$titles = explode(",", $lines[1]);
		echo "\nvar fileContentArray = [];";
		echo "var fileTitleArray = [];";
		foreach($files as $idx => $filepath) {
			$file = explode(".", $filepath);
			$filename = $file[0];
			$filepath = $FILEDIR.$filepath;
			$content = str_replace("\"", "'", file_get_contents($filepath));
			$content = str_replace("\n", " ", $content);
			
			echo "fileContentArray['$filename'] = \"";
			eval("?>".$content);
			echo "\";";
			
			echo "fileTitleArray['$filename'] = \"".$titles[$idx]."\";";
		}
?>
function preloader() {
	for(txt in fileContentArray) {
		var match = fileContentArray[txt].match(/<img src=['"]?([^='"<>\b]*)['"]?\b/ig);
		imgObj = new Image();
		for(img in match) {
			var src = match[img].substring(match[img].indexOf("'")+1);
			imgObj.src=src;
		}
	}
}
<?php if(false) { ?>
/* Adds getElementsByClassName support */
onload=function(){
if (document.getElementsByClassName == undefined) {
	document.getElementsByClassName = function(className)
	{
		var hasClassName = new RegExp("(?:^|\\s)" + className + "(?:$|\\s)");
		var allElements = document.getElementsByTagName("*");
		var results = [];

		var element;
		for (var i = 0; (element = allElements[i]) != null; i++) {
			var elementClass = element.className;
			if (elementClass && elementClass.indexOf(className) != -1 && hasClassName.test(elementClass))
				results.push(element);
		}

		return results;
	}
}
}

function setIdDisplay(objId, nDisplay) {
    var obj = document.getElementById(objId);
    if(obj)
        obj.style.display = nDisplay;
}
function setClassDisplay(objClass, nDisplay) {
    var objs = document.getElementsByClassName(objClass);
    if(objs)
		for(/*obj in objs*/i=0; i<objs.length; i++)
			objs[i].style.display = nDisplay;
}
<?php } ?>
function setIdContent(id, file) {
	if(!fileTitleArray[file]) file = "home";
	var obj = document.getElementById(id);
	if(obj)
		obj.innerHTML = fileContentArray[file];
	document.title = fileTitleArray[file];
}
function initNav() {
	var anchors, i, len, anchor, href, section, currentSection;
	anchors = document.getElementById("nav").getElementsByTagName("a");
	for (i = 0, len = anchors.length; i < len; i++) {
		anchor = anchors[i];
		YAHOO.util.Event.addListener(anchor, "click", function (evt) {
			href = this.getAttribute("href");
			patharr = href.split('/');
			section = patharr[patharr.length-2] || "home";
			try {
				YAHOO.util.History.navigate("page", section);
			} catch(e) {
				setIdContent("content", section);
			}
			YAHOO.util.Event.preventDefault(evt);
		});
	}
	currentSection = YAHOO.util.History.getCurrentState("page");
	setIdContent("content", currentSection);
}
var bookmarkedState = YAHOO.util.History.getBookmarkedState("page");
var href = ""+window.location;
var patharr = href.split('/');
var section = patharr[patharr.length-2] || "home";
var querySection = section;
if(!fileContentArray[querySection])
	querySection = "home";
var initialState = bookmarkedState || querySection || "home";
YAHOO.util.History.register("page", initialState, function (state) {
	if(state) setIdContent("content", state);
});
YAHOO.util.History.onReady(function() {
	initNav();
	preloader();
});
try {
	YAHOO.util.History.initialize("yui-history-field", "yui-history-iframe");
} catch (e) {
	setIdContent("content", "home");
}

