<?php
$content = trim(file_get_contents("files.csv"));
$files = explode(",", $content);
?>
function setDisplay(objId, nDisplay) {
    var obj = document.getElementById(objId);
    if(obj)
        obj.style.display = nDisplay;
}
function reparse() {
    if(location.hash)
        setDisplay(location.hash.substring(1), "block");
    else
        setDisplay("home", "block");
}
function reparse1(arg) {
<?php
foreach($files as $ctr => $file) {
$fileparts = explode(".", $file);
?>
    setDisplay("<?php echo $fileparts[0]; ?>", "none");
<?php
}
?>
    if(arg)
        setDisplay(arg, "block");
    else
        setDisplay("home", "block");
}
