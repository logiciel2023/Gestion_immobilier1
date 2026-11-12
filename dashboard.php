<?php
session_start();
if (!isset($_SESSION['admin'])) {
    header('Location: admin.php');
    exit;
}
$pdo = new PDO('mysql:host=localhost;dbname=gestion_immobilier', 'root', '');

// Supprimer un utilisateur
if (isset($_GET['supprimer'])) {
    $id = (int)$_GET['supprimer'];
    $del = $pdo->prepare('DELETE FROM user WHERE id = ? AND role != ?');
    $del->execute(array($id, 'admin'));
    header('Location: dashboard.php?msg=deleted');
    exit;
}

// Activer / Désactiver un utilisateur
if (isset($_GET['toggle']) && isset($_GET['etat'])) {
    $id = (int)$_GET['toggle'];
    $nouvelEtat = $_GET['etat'] === 'actif' ? 'inactif' : 'actif';
    $upd = $pdo->prepare('UPDATE user SET statut = ? WHERE id = ? AND role != ?');
    $upd->execute(array($nouvelEtat, $id, 'admin'));
    header('Location: dashboard.php?msg=toggled');
    exit;
}

// Modifier un utilisateur (traitement du formulaire)
if (isset($_POST['modifier'])) {
    $id = (int)$_POST['id'];
    $nom = $_POST['nom'];
    $prenom = $_POST['prenom'];
    $contact = $_POST['contact'];
    $email = $_POST['email'];
    $upd = $pdo->prepare('UPDATE user SET nom = ?, prenom = ?, contact = ?, email = ? WHERE id = ? AND role != ?');
    $upd->execute(array($nom, $prenom, $contact, $email, $id, 'admin'));
    header('Location: dashboard.php?msg=updated');
    exit;
}

// Recherche
$search = '';
if (isset($_GET['search']) && !empty($_GET['search'])) {
    $search = $_GET['search'];
    $req = $pdo->prepare('SELECT * FROM user WHERE role != ? AND (nom LIKE ? OR prenom LIKE ? OR email LIKE ? OR contact LIKE ?) ORDER BY id DESC');
    $terme = '%' . $search . '%';
    $req->execute(array('admin', $terme, $terme, $terme, $terme));
} else {
    $req = $pdo->prepare('SELECT * FROM user WHERE role != ? ORDER BY id DESC');
    $req->execute(array('admin'));
}
$users = $req->fetchAll(PDO::FETCH_ASSOC);

// Récupérer un utilisateur pour édition
$editUser = null;
if (isset($_GET['modifier'])) {
    $id = (int)$_GET['modifier'];
    $stmt = $pdo->prepare('SELECT * FROM user WHERE id = ? AND role != ?');
    $stmt->execute(array($id, 'admin'));
    $editUser = $stmt->fetch(PDO::FETCH_ASSOC);
}

// Statistiques
$nbTotal = $pdo->query("SELECT COUNT(*) FROM user WHERE role != 'admin'")->fetchColumn();
$nbActifs = $pdo->query("SELECT COUNT(*) FROM user WHERE role != 'admin' AND statut = 'actif'")->fetchColumn();
$nbInactifs = $pdo->query("SELECT COUNT(*) FROM user WHERE role != 'admin' AND statut = 'inactif'")->fetchColumn();
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="admin.css">
    <link rel="stylesheet" href="css/all.css">
    <title>Tableau de bord - Administration</title>
</head>
<body>
    <div class="dashboard">
        <!-- Sidebar -->
        <aside class="sidebar">
            <div class="sidebar-logo">
                <i class="fa-solid fa-building"></i>
                <h2>ARCHI-TECH</h2>
                <span class="admin-badge">Admin</span>
            </div>
            <nav class="sidebar-nav">
                <a href="dashboard.php" class="active"><i class="fa-solid fa-users"></i> Utilisateurs</a>
                <a href="accueil.php"><i class="fa-solid fa-house"></i> Voir le site</a>
                <a href="admin_deconnexion.php"><i class="fa-solid fa-right-to-bracket"></i> Déconnexion</a>
            </nav>
        </aside>

        <!-- Main content -->
        <main class="main-content">
            <header class="content-header">
                <div>
                    <h1>Gestion des comptes</h1>
                    <p>Liste des clients inscrits sur la plateforme</p>
                </div>
                <div class="admin-info">
                    <i class="fa-solid fa-user-shield"></i>
                    <span><?php echo htmlspecialchars($_SESSION['admin']); ?></span>
                </div>
            </header>

            <?php if (isset($_GET['msg'])) { ?>
                <div class="notif">
                    <?php
                    $msgs = ['deleted' => 'Utilisateur supprimé avec succès.', 'toggled' => 'Statut modifié avec succès.', 'updated' => 'Utilisateur modifié avec succès.'];
                    echo $msgs[$_GET['msg']] ?? '';
                    ?>
                    <i class="fa-solid fa-circle-check"></i>
                </div>
            <?php } ?>

            <!-- Statistiques -->
            <div class="stats">
                <div class="stat-card total">
                    <i class="fa-solid fa-users"></i>
                    <div><span class="num"><?php echo $nbTotal; ?></span><span class="label">Total inscrits</span></div>
                </div>
                <div class="stat-card actif">
                    <i class="fa-solid fa-circle-check"></i>
                    <div><span class="num"><?php echo $nbActifs; ?></span><span class="label">Comptes actifs</span></div>
                </div>
                <div class="stat-card inactif">
                    <i class="fa-solid fa-circle-xmark"></i>
                    <div><span class="num"><?php echo $nbInactifs; ?></span><span class="label">Comptes désactivés</span></div>
                </div>
            </div>

            <!-- Barre de recherche -->
            <div class="toolbar">
                <form method="get" action="" class="search-form">
                    <div class="search-bar">
                        <i class="fa-solid fa-magnifying-glass"></i>
                        <input type="text" name="search" placeholder="Rechercher par nom, email, contact..." value="<?php echo htmlspecialchars($search); ?>">
                    </div>
                    <button type="submit"><i class="fa-solid fa-search"></i> Rechercher</button>
                    <?php if ($search) { ?>
                        <a href="dashboard.php" class="btn-reset"><i class="fa-solid fa-rotate-left"></i> Réinitialiser</a>
                    <?php } ?>
                </form>
            </div>

            <!-- Tableau des utilisateurs -->
            <div class="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Nom</th>
                            <th>Prénom</th>
                            <th>Contact</th>
                            <th>Email</th>
                            <th>Statut</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php if (count($users) > 0) { foreach ($users as $u) { ?>
                            <tr class="<?php echo $u['statut'] === 'inactif' ? 'row-inactif' : ''; ?>">
                                <td><?php echo $u['id']; ?></td>
                                <td><?php echo htmlspecialchars($u['nom']); ?></td>
                                <td><?php echo htmlspecialchars($u['prenom']); ?></td>
                                <td><?php echo htmlspecialchars($u['contact']); ?></td>
                                <td><?php echo htmlspecialchars($u['email']); ?></td>
                                <td>
                                    <?php if ($u['statut'] === 'actif') { ?>
                                        <span class="badge badge-actif">Actif</span>
                                    <?php } else { ?>
                                        <span class="badge badge-inactif">Désactivé</span>
                                    <?php } ?>
                                </td>
                                <td class="actions">
                                    <a href="dashboard.php?modifier=<?php echo $u['id']; ?>" class="btn-action btn-edit" title="Modifier">
                                        <i class="fa-solid fa-pen"></i>
                                    </a>
                                    <a href="dashboard.php?toggle=<?php echo $u['id']; ?>&etat=<?php echo $u['statut']; ?>" class="btn-action btn-toggle" title="<?php echo $u['statut'] === 'actif' ? 'Désactiver' : 'Activer'; ?>">
                                        <i class="fa-solid fa-<?php echo $u['statut'] === 'actif' ? 'circle-xmark' : 'circle-check'; ?>"></i>
                                    </a>
                                    <a href="dashboard.php?supprimer=<?php echo $u['id']; ?>" class="btn-action btn-delete" title="Supprimer" onclick="return confirm('Voulez-vous vraiment supprimer cet utilisateur ?');">
                                        <i class="fa-solid fa-trash"></i>
                                    </a>
                                </td>
                            </tr>
                        <?php } } else { ?>
                            <tr><td colspan="7" class="empty">Aucun utilisateur trouvé.</td></tr>
                        <?php } ?>
                    </tbody>
                </table>
            </div>
        </main>
    </div>

    <!-- Modal de modification -->
    <?php if ($editUser) { ?>
    <div class="modal-overlay" onclick="if(event.target===this)window.location='dashboard.php'">
        <div class="modal">
            <div class="modal-header">
                <h2><i class="fa-solid fa-pen"></i> Modifier l'utilisateur</h2>
                <a href="dashboard.php" class="modal-close"><i class="fa-solid fa-xmark"></i></a>
            </div>
            <form action="" method="post" class="modal-form">
                <input type="hidden" name="id" value="<?php echo $editUser['id']; ?>">
                <div class="form-row">
                    <label>Nom</label>
                    <input type="text" name="nom" value="<?php echo htmlspecialchars($editUser['nom']); ?>" required>
                </div>
                <div class="form-row">
                    <label>Prénom</label>
                    <input type="text" name="prenom" value="<?php echo htmlspecialchars($editUser['prenom']); ?>" required>
                </div>
                <div class="form-row">
                    <label>Contact</label>
                    <input type="text" name="contact" value="<?php echo htmlspecialchars($editUser['contact']); ?>" required>
                </div>
                <div class="form-row">
                    <label>Email</label>
                    <input type="email" name="email" value="<?php echo htmlspecialchars($editUser['email']); ?>" required>
                </div>
                <div class="modal-actions">
                    <a href="dashboard.php" class="btn-cancel">Annuler</a>
                    <button type="submit" name="modifier"><i class="fa-solid fa-check"></i> Enregistrer</button>
                </div>
            </form>
        </div>
    </div>
    <?php } ?>
</body>
</html>
