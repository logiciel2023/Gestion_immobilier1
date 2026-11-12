-- Ajout des colonnes role et statut à la table user
ALTER TABLE user ADD COLUMN role VARCHAR(20) DEFAULT 'user';
ALTER TABLE user ADD COLUMN statut VARCHAR(20) DEFAULT 'actif';

-- Création d'un compte administrateur par défaut
INSERT INTO user (nom, prenom, contact, email, mdp, role, statut)
VALUES ('Admin', 'Super', '00000000', 'admin@architech.com', 'admin123', 'admin', 'actif');
