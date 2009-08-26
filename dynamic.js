<?php	$content = trim(file_get_contents("files.csv"));
		$files = explode(",", $content);
		echo "\nvar fileContentArray = [];";
		foreach($files as $filepath) {
			$file = explode(".", $filepath);
			$filename = $file[0];
			$content = str_replace("\"", "'", file_get_contents($filepath));
			$content = str_replace("\n", " ", $content);
			
			echo "fileContentArray['$filename'] = \"";
			eval("?>".$content);
			echo "\";";
		}
?>

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
reparse();
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
function setIdContent(id, file) {
	var obj = document.getElementById(id);
	if(obj)
		obj.innerHTML = fileContentArray[file];
}
function reparse() {
	setClassDisplay("js", "inline");
	setClassDisplay("nojs", "none");
    if(location.hash)
        setIdContent("content", location.hash.substring(1));
    /*else
        setIdContent("content", "home");*/
}
function reparse1(arg) {
	if(arg) setIdContent("content", arg);
}

