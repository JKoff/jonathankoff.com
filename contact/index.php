<?php
chdir('..');
$urlparts = explode('/',$_SERVER['REQUEST_URI']);
$_GET['p'] = $urlparts[2];
include('index.php');
?>

