<?php
echo '<script type="text/javascript">';
echo "<!--\n";

ob_start();
include("jsmin-1.1.1.php");
eval("?>".file_get_contents("dynamic.js"));
echo file_get_contents("history.js");
echo JSMin::minify(ob_get_clean());

echo "\n-->";
echo '</script>';
?>

