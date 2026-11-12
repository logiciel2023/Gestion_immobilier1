<?php
$pdo = new pdo('mysql:host=localhost;dbname=gestion_immobilier', 'root', '');

if(isset($_POST['Valider'])){
    if(!empty($_POST['Nom']) && !empty($_POST['Prenom']) && !empty($_POST['Contact']) && !empty($_POST['Numapp'])){
        $Nom = $_POST['Nom'];
        $Prenom = $_POST['Prenom'];
        $Contact = $_POST['Contact'];
        $Numapp = $_POST['Numapp'];

        $insertion = $pdo->prepare('INSERT INTO client(Nom, Prenom, Contact, Numapp) VALUES(?, ?, ?, ?)');
        $insertion->execute(array($Nom, $Prenom, $Contact, $Numapp));
        echo '<script>alert("Client ajoute avec succes");</script>';
    }else{
        echo '<script>alert("veillez remplir les champs du formulaire");</script>';
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ajouter un client</title>
    <link rel="stylesheet" href="Client.css">
</head>
<body style="text-align:center;">
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
