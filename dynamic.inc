<?php
echo '<script type="text/javascript">';
echo "<!--\n";

$cachefile = $CACHEDIR."jsfiles.js";
if(file_has_changed($cachefile)) {
	ob_start();

	include("jsmin-1.1.1.php");
	eval("?>".file_get_contents("dynamic.js"));
	$res = ob_get_clean();
	ob_start();
	echo JSMin::minify(file_get_contents("yahoo-min.js"));
	echo JSMin::minify(file_get_contents("event-min.js"));
	echo JSMin::minify(file_get_contents("history-min.js"));
	echo JSMin::minify($res);
	$fin = ob_get_clean();
	
	echo $fin;
	flush();
	$fp = fopen($cachefile, 'w');
	fwrite($fp, $fin);
	fclose($fp);
} else {
	echo file_get_contents($cachefile);
}

echo "\n-->";
echo '</script>';
?>

