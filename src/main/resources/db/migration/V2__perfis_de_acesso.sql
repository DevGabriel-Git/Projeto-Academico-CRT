ALTER TABLE usuarios ADD COLUMN perfil VARCHAR(16) DEFAULT 'USER' NOT NULL;
ALTER TABLE usuarios ADD CONSTRAINT chk_usuario_perfil CHECK (perfil IN ('USER', 'ADMIN'));
CREATE TABLE admin_bootstrap_lock (id INTEGER PRIMARY KEY);
INSERT INTO admin_bootstrap_lock (id) VALUES (1);
