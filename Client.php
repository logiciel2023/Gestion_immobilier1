<?php
if(isset($_POST['Valider'])){
    // echo "OK";
    if(!empty($_POST['Nom']) and !empty($_POST['Prenom']) and !empty($_POST['Contact']) and !empty($_POST['Numapp'])){
        // echo 'Connection etablir';
        $Nom = $_POST['Nom'];
        $Prenom = $_POST['Prenom'];
        $Contact = $_POST['Contact'];
        $Numapp = $_POST['Numapp'];

        // echo $Nom;echo $Prenom;echo $Contact;
        $pdo = new pdo('mysql:host=localhost;dbname=gestion_immobilier', 'root', '');

        $insertion = $pdo->prepare('insert into client(Nom,Prenom,Contact,Numapp) values(?,?,?,?)');

        $insertion -> execute(array($Nom,$Prenom,$Contact,$Numapp));

    }
    else{
        echo 'veillez remplir les champs du formulaire';
    }
}
else{
    echo 'le bouton n exite pas';
}
$pdo = new pdo('mysql:host=localhost;dbname=gestion_immobilier', 'root', ''); 
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=, initial-scale=1.0">
    <title>Document</title>
    <link rel="stylesheet" href="Client.css">
</head>
<style>
    body{
        text-align:center;
    }
</style>
<body>
    <legend>Authentification</legend>
        <form action="" method="post">
            <label for="Nom">Nom</label><br>
            <input type="text" name="Nom" id=""><br>
            <label for="Prenom">Prenom</label><br>
            <input type="text" name="Prenom" id=""><br>
            <label for="Contact">Contact</label><br>
            <input type="text" name="Contact" id=""><br>
            <label for="Num_app">Numero appartement</label><br>
            <input type="number" name="Numapp" id=""><br>
            <input type="submit" name="Valider" id="" value="Valider">
   </form> 
</body>
</html>