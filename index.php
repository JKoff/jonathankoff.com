<?php ob_start("ob_gzhandler"); ?>
<html>
<?php
$content = trim(file_get_contents("files.csv"));
$files = explode(",", $content);
?>
<head>
</head>
<body onload="reparse()">
<div id="navig">
<ul>
<?php
foreach($files as $ctr => $file) {
$fileparts = explode(".", $file);
?>
<li><a href="index.php#<?php echo $fileparts[0]; ?>" onclick="reparse1('<?php echo $fileparts[0]; ?>')"><?php echo $fileparts[0]; ?></a></li>
<?php
}
?>
</ul>
</div>

<?php
foreach($files as $ctr => $file) {
$fileparts = explode(".", $file);
?>
<div id="<?php echo $fileparts[0]; ?>" class="dynamic_container" style="display:none">
<?php echo file_get_contents($file); ?>
</div>
<?php
}
?>

<script type="text/javascript">
<!--
<?php
include("jsmin-1.1.1.php");
$content = eval("?>".file_get_contents("dynamic.js"));
echo JSMin::minify($content);
/*echo eval("?> ".file_get_contents("dynamic.js"));*/
?>
-->
</script>

</body>
</html>

